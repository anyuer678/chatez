import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useChatStore } from '../../stores/chatStore';
import { Message } from '../../types/chat';

describe('ChatStore', () => {
  beforeEach(() => {
    useChatStore.setState({
      sessions: [],
      activeSessionId: null,
      isStreaming: false,
    });
  });

  it('should create a new session', () => {
    const sessionId = useChatStore.getState().createSession();
    expect(sessionId).toBeDefined();
    expect(typeof sessionId).toBe('string');

    const { sessions, activeSessionId } = useChatStore.getState();
    expect(sessions).toHaveLength(1);
    expect(activeSessionId).toBe(sessionId);
  });

  it('should add message to session', () => {
    const sessionId = useChatStore.getState().createSession();

    const message: Message = {
      id: 'test-msg-1',
      role: 'user',
      content: 'Hello',
      timestamp: Date.now(),
    };

    useChatStore.getState().addMessage(sessionId, message);

    const { sessions } = useChatStore.getState();
    const session = sessions.find((s) => s.id === sessionId);
    expect(session?.messages).toHaveLength(1);
    expect(session?.messages[0].content).toBe('Hello');
  });

  it('should update session title on first user message', () => {
    const sessionId = useChatStore.getState().createSession();

    const message: Message = {
      id: 'test-msg-1',
      role: 'user',
      content: 'This is a long message that should be truncated for the title',
      timestamp: Date.now(),
    };

    useChatStore.getState().addMessage(sessionId, message);

    const { sessions } = useChatStore.getState();
    const session = sessions.find((s) => s.id === sessionId);
    expect(session?.title.length).toBeLessThanOrEqual(33);
    expect(session?.title).toContain('This is a long message');
  });

  it('should delete message', () => {
    const sessionId = useChatStore.getState().createSession();

    useChatStore.getState().addMessage(sessionId, {
      id: 'msg-1',
      role: 'user',
      content: 'Hello',
      timestamp: Date.now(),
    });

    useChatStore.getState().addMessage(sessionId, {
      id: 'msg-2',
      role: 'assistant',
      content: 'Hi there',
      timestamp: Date.now(),
    });

    useChatStore.getState().deleteMessage(sessionId, 'msg-1');

    const { sessions } = useChatStore.getState();
    const session = sessions.find((s) => s.id === sessionId);
    expect(session?.messages).toHaveLength(1);
    expect(session?.messages[0].id).toBe('msg-2');
  });

  it('should delete session', () => {
    const sessionId = useChatStore.getState().createSession();
    expect(useChatStore.getState().sessions).toHaveLength(1);

    useChatStore.getState().deleteSession(sessionId);

    expect(useChatStore.getState().sessions).toHaveLength(0);
    expect(useChatStore.getState().activeSessionId).toBeNull();
  });

  it('should update message', () => {
    const sessionId = useChatStore.getState().createSession();

    useChatStore.getState().addMessage(sessionId, {
      id: 'msg-1',
      role: 'assistant',
      content: 'Hello',
      timestamp: Date.now(),
    });

    useChatStore.getState().updateMessage(sessionId, 'msg-1', 'Updated content');

    const { sessions } = useChatStore.getState();
    const session = sessions.find((s) => s.id === sessionId);
    expect(session?.messages[0].content).toBe('Updated content');
  });

  it('should set active session', () => {
    const sessionId1 = useChatStore.getState().createSession();
    const sessionId2 = useChatStore.getState().createSession();

    useChatStore.getState().setActiveSession(sessionId1);
    expect(useChatStore.getState().activeSessionId).toBe(sessionId1);

    useChatStore.getState().setActiveSession(sessionId2);
    expect(useChatStore.getState().activeSessionId).toBe(sessionId2);
  });

  it('should set streaming state', () => {
    useChatStore.getState().setIsStreaming(true);
    expect(useChatStore.getState().isStreaming).toBe(true);

    useChatStore.getState().setIsStreaming(false);
    expect(useChatStore.getState().isStreaming).toBe(false);
  });

  it('should update session title', () => {
    const sessionId = useChatStore.getState().createSession();

    useChatStore.getState().updateSessionTitle(sessionId, 'New Title');

    const { sessions } = useChatStore.getState();
    const session = sessions.find((s) => s.id === sessionId);
    expect(session?.title).toBe('New Title');
  });

  it('should get active session', () => {
    const sessionId = useChatStore.getState().createSession();

    const activeSession = useChatStore.getState().getActiveSession();
    expect(activeSession).toBeDefined();
    expect(activeSession?.id).toBe(sessionId);
  });

  it('should clear all sessions', () => {
    useChatStore.getState().createSession();
    useChatStore.getState().createSession();
    expect(useChatStore.getState().sessions).toHaveLength(2);

    useChatStore.getState().clearAllSessions();

    expect(useChatStore.getState().sessions).toHaveLength(0);
    expect(useChatStore.getState().activeSessionId).toBeNull();
  });
});

describe('ChatStore - skill 触发方式', () => {
  beforeEach(() => {
    useChatStore.setState({
      sessions: [],
      activeSessionId: null,
      isStreaming: false,
    });
  });

  it('用户消息应能保存 skillTrigger 字段', () => {
    const sessionId = useChatStore.getState().createSession();

    useChatStore.getState().addMessage(sessionId, {
      id: 'm1',
      role: 'user',
      content: '总结一下这篇文章',
      timestamp: Date.now(),
      skillId: 'knowledge_summarizer',
      skillTrigger: 'auto',
    });

    const { sessions } = useChatStore.getState();
    const msg = sessions[0].messages[0];
    expect(msg.skillId).toBe('knowledge_summarizer');
    expect(msg.skillTrigger).toBe('auto');
  });

  it('skillTrigger 缺省时应为 undefined（向后兼容）', () => {
    const sessionId = useChatStore.getState().createSession();

    useChatStore.getState().addMessage(sessionId, {
      id: 'm1',
      role: 'user',
      content: '普通消息',
      timestamp: Date.now(),
      // 没有 skillId / skillTrigger
    });

    const msg = useChatStore.getState().sessions[0].messages[0];
    expect(msg.skillId).toBeUndefined();
    expect(msg.skillTrigger).toBeUndefined();
  });

  it('支持三种触发方式：command / auto / manual', () => {
    const sessionId = useChatStore.getState().createSession();

    const triggers: Array<Message['skillTrigger']> = ['command', 'auto', 'manual'];
    triggers.forEach((trigger, i) => {
      useChatStore.getState().addMessage(sessionId, {
        id: `m-${i}`,
        role: 'user',
        content: `test ${trigger}`,
        timestamp: Date.now(),
        skillId: 'sql_generator',
        skillTrigger: trigger,
      });
    });

    const messages = useChatStore.getState().sessions[0].messages;
    expect(messages[0].skillTrigger).toBe('command');
    expect(messages[1].skillTrigger).toBe('auto');
    expect(messages[2].skillTrigger).toBe('manual');
  });
});

describe('ChatStore - 导入导出', () => {
  beforeEach(() => {
    useChatStore.setState({
      sessions: [],
      activeSessionId: null,
      isStreaming: false,
    });
  });

  it('导出空 store 应得到 sessions 数组为空', () => {
    const data = useChatStore.getState().exportSessions();
    expect(data.v).toBe(1);
    expect(data.app).toBe('chatez');
    expect(data.sessions).toEqual([]);
    expect(typeof data.exportedAt).toBe('number');
  });

  it('导出应包含所有现有会话', () => {
    const id1 = useChatStore.getState().createSession();
    useChatStore.getState().addMessage(id1, {
      id: 'm1',
      role: 'user',
      content: '你好',
      timestamp: 1000,
    });
    const id2 = useChatStore.getState().createSession();
    useChatStore.getState().addMessage(id2, {
      id: 'm2',
      role: 'assistant',
      content: 'Hello',
      timestamp: 2000,
    });
    const data = useChatStore.getState().exportSessions();
    expect(data.sessions).toHaveLength(2);
    expect(data.sessions.find((s) => s.id === id1)?.messages[0].content).toBe('你好');
  });

  it('merge 模式应按 id 去重，不覆盖已有', () => {
    const id1 = useChatStore.getState().createSession();
    const data = {
      v: 1,
      app: 'chatez' as const,
      exportedAt: 0,
      sessions: [
        {
          id: id1, // 与现有 id 重复
          title: '重复会话',
          messages: [],
          createdAt: 1,
          updatedAt: 2,
        },
        {
          id: 'new-session-id',
          title: '新会话',
          messages: [],
          createdAt: 3,
          updatedAt: 4,
        },
      ],
    };
    const count = useChatStore.getState().importSessions(data, 'merge');
    expect(count).toBe(2);
    const { sessions } = useChatStore.getState();
    // 只新增 1 条（id 重复的被跳过）
    expect(sessions).toHaveLength(2);
    expect(sessions.find((s) => s.id === id1)?.title).not.toBe('重复会话');
    expect(sessions.find((s) => s.id === 'new-session-id')).toBeDefined();
  });

  it('replace 模式应清空后整体替换', () => {
    useChatStore.getState().createSession();
    useChatStore.getState().createSession();
    const data = {
      v: 1,
      app: 'chatez' as const,
      exportedAt: 0,
      sessions: [
        {
          id: 'fresh-1',
          title: '全新',
          messages: [],
          createdAt: 1,
          updatedAt: 2,
        },
      ],
    };
    const count = useChatStore.getState().importSessions(data, 'replace');
    expect(count).toBe(1);
    const { sessions, activeSessionId } = useChatStore.getState();
    expect(sessions).toHaveLength(1);
    expect(sessions[0].id).toBe('fresh-1');
    expect(activeSessionId).toBe('fresh-1');
  });

  it('缺少 v 字段应抛错', () => {
    expect(() =>
      useChatStore.getState().importSessions({ sessions: [] })
    ).toThrow(/版本号/);
  });

  it('版本号不匹配应抛错', () => {
    expect(() =>
      useChatStore.getState().importSessions({ v: 99, sessions: [] })
    ).toThrow(/不支持的导入版本/);
  });

  it('sessions 不是数组应抛错', () => {
    expect(() =>
      useChatStore.getState().importSessions({ v: 1, sessions: 'oops' })
    ).toThrow(/不是数组/);
  });

  it('session 字段缺失应抛错', () => {
    expect(() =>
      useChatStore.getState().importSessions({
        v: 1,
        sessions: [{ id: 'a' }], // 缺 title/messages/...
      })
    ).toThrow(/字段缺失/);
  });

  it('无效消息应被跳过而非整体失败', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const data = {
      v: 1,
      app: 'chatez' as const,
      exportedAt: 0,
      sessions: [
        {
          id: 's-1',
          title: '混合消息',
          createdAt: 1,
          updatedAt: 2,
          messages: [
            { id: 'm1', role: 'user', content: 'ok', timestamp: 100 },
            { id: 'm2', role: 'WRONG_ROLE', content: 'bad', timestamp: 101 },
            { id: 'm3', role: 'assistant', content: 'ok2', timestamp: 102 },
            null, // 异常项
          ],
        },
      ],
    };
    const count = useChatStore.getState().importSessions(data, 'replace');
    expect(count).toBe(1);
    const session = useChatStore.getState().sessions[0];
    expect(session.messages).toHaveLength(2);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('ChatStore - 复制对话 (sessionToText)', () => {
  beforeEach(() => {
    useChatStore.setState({
      sessions: [],
      activeSessionId: null,
      isStreaming: false,
    });
  });

  it('空对话应返回标记为"空对话"的文本', () => {
    const id = useChatStore.getState().createSession();
    const text = useChatStore.getState().sessionToText(id);
    expect(text).toContain('空对话');
  });

  it('应拼接标题、用户、AI 消息', () => {
    const id = useChatStore.getState().createSession();
    useChatStore.getState().addMessage(id, {
      id: 'm1',
      role: 'user',
      content: '你好',
      timestamp: new Date('2026-01-01T10:00:00').getTime(),
    });
    useChatStore.getState().addMessage(id, {
      id: 'm2',
      role: 'assistant',
      content: '你好呀',
      timestamp: new Date('2026-01-01T10:01:00').getTime(),
    });

    const text = useChatStore.getState().sessionToText(id);
    expect(text).toContain('# 你好');
    expect(text).toContain('**你**');
    expect(text).toContain('**ChatEZ**');
    expect(text).toContain('你好');
    expect(text).toContain('你好呀');
  });

  it('不存在的 sessionId 应返回空字符串', () => {
    const text = useChatStore.getState().sessionToText('non-existent');
    expect(text).toBe('');
  });
});
