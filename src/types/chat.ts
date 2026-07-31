export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  promptId?: string;
  skillId?: string;
  /**
   * skill 是如何被触发的（仅当 skillId 存在时才有意义）
   * - 'command'：用户输入 /command 显式触发
   * - 'auto'：自然语言关键字自动识别
   * - 'manual'：用户主动从 SkillSelector 激活
   */
  skillTrigger?: 'command' | 'auto' | 'manual';
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

/**
 * 聊天记录导出格式
 * 顶层用 v 字段做版本号，方便未来扩展
 */
export interface ChatExport {
  v: 1;
  app: 'chatez';
  exportedAt: number;
  sessions: ChatSession[];
}

export interface ChatStore {
  sessions: ChatSession[];
  activeSessionId: string | null;
  isStreaming: boolean;

  createSession: () => string;
  deleteSession: (id: string) => void;
  setActiveSession: (id: string) => void;
  addMessage: (sessionId: string, message: Message) => void;
  updateMessage: (sessionId: string, messageId: string, content: string) => void;
  deleteMessage: (sessionId: string, messageId: string) => void;
  getActiveSession: () => ChatSession | undefined;
  setIsStreaming: (isStreaming: boolean) => void;
  clearAllSessions: () => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  generateSessionTitle: (sessionId: string) => Promise<void>;

  /**
   * 导出全部会话为 JSON
   */
  exportSessions: () => ChatExport;
  /**
   * 从 JSON 导入会话。可选 merge 模式：
   * - 'merge' 保留现有会话，仅追加新会话（按 id 去重，默认）
   * - 'replace' 清空后整体替换
   * 返回导入成功条数。
   */
  importSessions: (data: unknown, mode?: 'merge' | 'replace') => number;
  /**
   * 把指定会话拼接为可读文本（Markdown 风格）
   * role=user 时以 `**你**` 开头，role=assistant 以 `**ChatEZ**` 开头
   */
  sessionToText: (sessionId: string) => string;
}
