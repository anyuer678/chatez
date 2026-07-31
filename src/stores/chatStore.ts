import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatStore, ChatSession, ChatExport, Message } from '../types/chat';
import { apiClient } from '../utils/api-client';

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

/**
 * 把单个会话格式化为可读文本（Markdown 风格）
 * 用于"复制对话"和"导出"功能
 */
function formatSessionAsText(session: ChatSession): string {
  if (session.messages.length === 0) {
    return `# ${session.title}\n\n（空对话）\n`;
  }
  const lines: string[] = [];
  lines.push(`# ${session.title}`);
  lines.push('');
  lines.push(
    `> 创建于 ${new Date(session.createdAt).toLocaleString('zh-CN')} · ` +
      `${session.messages.length} 条消息`
  );
  lines.push('');
  lines.push('---');
  lines.push('');
  for (const msg of session.messages) {
    if (msg.role === 'system') continue;
    const time = new Date(msg.timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const role = msg.role === 'user' ? '你' : 'ChatEZ';
    lines.push(`**${role}** · ${time}`);
    lines.push('');
    lines.push(msg.content.trim());
    lines.push('');
  }
  return lines.join('\n');
}

/**
 * 校验导入数据格式，返回合法 sessions 数组或抛错
 */
function parseImportData(data: unknown): ChatSession[] {
  if (!data || typeof data !== 'object') {
    throw new Error('导入数据格式错误：根节点不是对象');
  }
  const obj = data as Partial<ChatExport> & { sessions?: unknown };
  if (typeof obj.v !== 'number') {
    throw new Error('导入数据格式错误：缺少版本号 v');
  }
  if (obj.v !== 1) {
    throw new Error(`不支持的导入版本：v=${obj.v}`);
  }
  if (!Array.isArray(obj.sessions)) {
    throw new Error('导入数据格式错误：sessions 不是数组');
  }
  const out: ChatSession[] = [];
  obj.sessions.forEach((raw, idx) => {
    if (!raw || typeof raw !== 'object') {
      throw new Error(`第 ${idx + 1} 条会话不是对象`);
    }
    const s = raw as Partial<ChatSession>;
    if (
      typeof s.id !== 'string' ||
      typeof s.title !== 'string' ||
      !Array.isArray(s.messages) ||
      typeof s.createdAt !== 'number' ||
      typeof s.updatedAt !== 'number'
    ) {
      throw new Error(`第 ${idx + 1} 条会话字段缺失或类型错误`);
    }
    // 过滤 messages 中格式不对的项
    const messages: Message[] = [];
    s.messages.forEach((m, mIdx) => {
      if (
        m &&
        typeof m === 'object' &&
        typeof (m as Message).id === 'string' &&
        typeof (m as Message).content === 'string' &&
        typeof (m as Message).timestamp === 'number' &&
        ['user', 'assistant', 'system'].includes((m as Message).role)
      ) {
        messages.push(m as Message);
      } else {
        console.warn(`[chatStore.import] 跳过第 ${idx + 1} 条会话的第 ${mIdx + 1} 条消息`);
      }
    });
    out.push({
      id: s.id,
      title: s.title,
      messages,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    });
  });
  return out;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,
      isStreaming: false,

      createSession: () => {
        const id = generateId();
        const newSession: ChatSession = {
          id,
          title: '新对话',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({
          sessions: [newSession, ...state.sessions],
          activeSessionId: id,
        }));

        return id;
      },

      deleteSession: (id: string) => {
        set((state) => {
          const newSessions = state.sessions.filter((s) => s.id !== id);
          return {
            sessions: newSessions,
            activeSessionId:
              state.activeSessionId === id
                ? newSessions[0]?.id ?? null
                : state.activeSessionId,
          };
        });
      },

      setActiveSession: (id: string) => {
        set({ activeSessionId: id });
      },

      addMessage: (sessionId: string, message: Message) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  messages: [...session.messages, message],
                  updatedAt: Date.now(),
                  title:
                    session.messages.length === 0 && message.role === 'user'
                      ? message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '')
                      : session.title,
                }
              : session
          ),
        }));
      },

      updateMessage: (sessionId: string, messageId: string, content: string) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  messages: session.messages.map((msg) =>
                    msg.id === messageId ? { ...msg, content } : msg
                  ),
                  updatedAt: Date.now(),
                }
              : session
          ),
        }));
      },

      deleteMessage: (sessionId: string, messageId: string) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  messages: session.messages.filter((msg) => msg.id !== messageId),
                  updatedAt: Date.now(),
                }
              : session
          ),
        }));
      },

      getActiveSession: () => {
        const { sessions, activeSessionId } = get();
        return sessions.find((s) => s.id === activeSessionId);
      },

      setIsStreaming: (isStreaming: boolean) => {
        set({ isStreaming });
      },

      clearAllSessions: () => {
        set({ sessions: [], activeSessionId: null });
      },

      updateSessionTitle: (sessionId: string, title: string) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === sessionId ? { ...session, title } : session
          ),
        }));
      },

      // 智能生成会话标题
      generateSessionTitle: async (sessionId: string) => {
        const { sessions } = get();
        const session = sessions.find((s) => s.id === sessionId);
        if (!session || session.messages.length < 2) return;

        // 取前两条消息作为上下文
        const context = session.messages
          .slice(0, 2)
          .map((m) => `${m.role}: ${m.content}`)
          .join('\n');

        try {
          const title = await apiClient.sendMessage(
            [{ role: 'user', content: `请用一句话概括以下对话主题（不超过20个字）：\n${context}` }],
            '你是一个标题生成器，只输出标题，不要其他内容。'
          );

          // 清理标题（移除引号等）
          const cleanTitle = title.replace(/^["']|["']$/g, '').trim();
          if (cleanTitle) {
            get().updateSessionTitle(sessionId, cleanTitle.slice(0, 30));
          }
        } catch {
          // 生成标题失败，保持原标题
        }
      },

      // ===== 导入导出 + 复制对话 =====

      exportSessions: () => {
        const { sessions } = get();
        return {
          v: 1,
          app: 'chatez',
          exportedAt: Date.now(),
          sessions,
        };
      },

      importSessions: (data, mode = 'merge') => {
        const incoming = parseImportData(data);
        set((state) => {
          if (mode === 'replace') {
            return { sessions: incoming, activeSessionId: incoming[0]?.id ?? null };
          }
          // merge：按 id 去重，新会话前置
          const existingIds = new Set(state.sessions.map((s) => s.id));
          const toAdd = incoming.filter((s) => !existingIds.has(s.id));
          if (toAdd.length === 0) return state;
          const merged = [...toAdd, ...state.sessions];
          return { sessions: merged };
        });
        return incoming.length;
      },

      sessionToText: (sessionId) => {
        const { sessions } = get();
        const session = sessions.find((s) => s.id === sessionId);
        if (!session) return '';
        return formatSessionAsText(session);
      },
    }),
    {
      name: 'chatez-chat-sessions',
      version: 1,
      partialize: (state) => ({
        sessions: state.sessions,
        activeSessionId: state.activeSessionId,
      }),
    }
  )
);
