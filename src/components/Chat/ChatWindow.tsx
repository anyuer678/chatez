import { useCallback, useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { usePromptStore } from '../../stores/promptStore';
import { useSkillStore } from '../../stores/skillStore';
import { useConfigStore, TONE_PRESETS } from '../../stores/configStore';
import { IS_DEMO_MODE } from '../../config/demo';
import { MessageList } from './MessageList';
import { InputBox } from './InputBox';
import { apiClient, ChatMessage } from '../../utils/api-client';
import { skillEngine } from '../../lib/skill-engine';
import {
  MoreHorizontal,
  Copy,
  Check,
  Download,
  Upload,
  Trash2,
  Menu,
} from 'lucide-react';

// ============================================================
// 4 个功能卡片的图标已改为 1:1 还原真实手绘原图（精确提取自 235149.png）
// 见 config/images.ts 中的 moduleChat / moduleBook / moduleQuill / modulePuzzle
// 不再使用内联 SVG 简笔仿造
// ============================================================

interface ChatWindowProps {
  /** 移动端 ≡ 按钮点击回调 —— 由 AppLayout 提供 */
  onOpenSidebar?: () => void;
  /** 是否显示移动端 ≡ 按钮（isMobile && !showSidebar） */
  showMobileMenuButton?: boolean;
}

export function ChatWindow({ onOpenSidebar, showMobileMenuButton = false }: ChatWindowProps = {}) {
  const {
    activeSessionId,
    isStreaming,
    addMessage,
    updateMessage,
    createSession,
    setIsStreaming,
    generateSessionTitle,
    sessionToText,
    exportSessions,
    importSessions,
    clearAllSessions,
  } = useChatStore();
  const { getActivePrompt } = usePromptStore();
  const { activeSkillId, skills } = useSkillStore();
  const { skill: skillConfig } = useConfigStore();
  const session = useChatStore((state) =>
    state.sessions.find((s) => s.id === state.activeSessionId)
  );

  const activePrompt = getActivePrompt();
  const persistedActiveSkill = skills.find((s) => s.id === activeSkillId) ?? null;
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const handleSend = useCallback(
    async (content: string) => {
      // 演示模式：禁止发起 AI 对话
      if (IS_DEMO_MODE) {
        alert('🔒 演示模式：AI 对话已禁用。请前往 GitHub Releases 下载安装包体验完整功能。');
        return;
      }
      let sessionId = activeSessionId;
      if (!sessionId) {
        sessionId = createSession();
      }

      // 优先级：用户主动激活的 Skill（持久化） > 自动检测（关键词/命令） > 角色提示词
      const userActivatedSkill = persistedActiveSkill;
      const autoDetected = skillEngine.detectSkill(content, skillConfig.autoDetect);
      const skillDetection = userActivatedSkill
        ? { skill: userActivatedSkill, args: content, triggerType: 'manual' as const }
        : autoDetected;

      const userMessage = {
        id: `${Date.now()}-user`,
        role: 'user' as const,
        content,
        timestamp: Date.now(),
        promptId: activePrompt?.id,
        skillId: skillDetection?.skill.id,
        // 记录触发方式，让 MessageBubble 可以显示"通过 /cmd 触发"或"自动识别"
        skillTrigger: skillDetection?.triggerType,
      };

      addMessage(sessionId, userMessage);

      const aiMessageId = `${Date.now()}-ai`;
      const aiMessage = {
        id: aiMessageId,
        role: 'assistant' as const,
        content: '',
        timestamp: Date.now(),
      };
      addMessage(sessionId, aiMessage);
      setIsStreaming(true);
      setActiveSkill(skillDetection?.skill.id || null);

      const currentSession = useChatStore.getState().sessions.find((s) => s.id === sessionId);
      const messages: ChatMessage[] =
        currentSession?.messages
          .filter((m) => m.id !== aiMessageId)
          .map((m) => ({
            role: m.role,
            content: m.content,
          })) || [];

      let systemPrompt = activePrompt?.systemPrompt;

      // 合并生成配置中的自定义系统提示词 + 语气
      const { generation } = useConfigStore.getState();
      const parts: string[] = [];
      if (systemPrompt?.trim()) parts.push(systemPrompt.trim());
      if (generation.systemPrompt?.trim()) parts.push(generation.systemPrompt.trim());
      if (generation.toneId && generation.toneId !== 'default') {
        const tone = TONE_PRESETS.find((t) => t.id === generation.toneId);
        if (tone?.prompt?.trim()) parts.push(tone.prompt.trim());
        if (generation.toneId === 'custom' && generation.customTonePrompt?.trim()) {
          parts.push(generation.customTonePrompt.trim());
        }
      }
      const finalSystemPrompt = parts.length > 0 ? parts.join('\n\n') : undefined;

      if (skillDetection) {
        systemPrompt = skillEngine.buildSkillPrompt(
          skillDetection.skill,
          skillDetection.args,
          finalSystemPrompt ?? systemPrompt
        );
      } else if (finalSystemPrompt) {
        systemPrompt = finalSystemPrompt;
      }

      try {
        await apiClient.sendMessage(messages, systemPrompt, {
          onChunk: (chunk) => {
            const currentSession = useChatStore.getState().sessions.find((s) => s.id === sessionId);
            const currentMessage = currentSession?.messages.find((m) => m.id === aiMessageId);
            updateMessage(sessionId, aiMessageId, (currentMessage?.content || '') + chunk);
          },
          onComplete: () => {
            setIsStreaming(false);
            setActiveSkill(null);
            const currentSession = useChatStore.getState().sessions.find((s) => s.id === sessionId);
            if (currentSession && currentSession.title === '新对话') {
              generateSessionTitle(sessionId);
            }
          },
          onError: (error) => {
            updateMessage(
              sessionId,
              aiMessageId,
              `**错误**: ${error.message}\n\n请点击左侧设置按钮检查 API 配置。`
            );
            setIsStreaming(false);
            setActiveSkill(null);
          },
        });
      } catch {
        setIsStreaming(false);
        setActiveSkill(null);
      }
    },
    [
      activeSessionId,
      activePrompt,
      skillConfig.autoDetect,
      persistedActiveSkill,
      addMessage,
      updateMessage,
      createSession,
      setIsStreaming,
      generateSessionTitle,
    ]
  );

  const handleRegenerate = useCallback(() => {
    if (!session || !activeSessionId || isStreaming) return;

    const lastUserMessage = [...session.messages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage) {
      const lastAiMessage = [...session.messages].reverse().find((m) => m.role === 'assistant');
      if (lastAiMessage) {
        useChatStore.getState().deleteMessage(activeSessionId, lastAiMessage.id);
      }
      handleSend(lastUserMessage.content);
    }
  }, [session, activeSessionId, isStreaming, handleSend]);

  /** 复制整个当前对话为 Markdown 文本到剪贴板 */
  const handleCopyCurrentSession = useCallback(async () => {
    if (!activeSessionId) return;
    const text = sessionToText(activeSessionId);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert('复制失败，请手动选择文本复制');
    }
  }, [activeSessionId, sessionToText]);

  /** 停止流式生成 —— 调用 apiClient.cancel() 中断 AbortController */
  const handleStop = useCallback(() => {
    apiClient.cancel();
    setIsStreaming(false);
    setActiveSkill(null);
  }, [setIsStreaming]);

  /** 删除当前对话已迁移到侧栏（长按/右键） —— 这里不再需要 */

  /** 导出全部对话为 JSON 文件（浏览器下载） */
  const handleExportAll = useCallback(() => {
    const data = exportSessions();
    if (data.sessions.length === 0) {
      alert('当前没有可导出的对话');
      return;
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.download = `chatez-sessions-${ts}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMoreOpen(false);
  }, [exportSessions]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /** 触发文件选择器（导入） */
  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
    setMoreOpen(false);
  }, []);

  /** 文件选择后解析 JSON 并导入 */
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        const mode = window.confirm(
          '点击"确定"= 合并到当前对话列表（保留现有）\n点击"取消"= 替换（清空后导入）'
        )
          ? 'merge'
          : 'replace';
        const count = importSessions(data, mode);
        if (count === 0) {
          alert('没有可导入的对话');
        } else {
          alert(`成功导入 ${count} 条对话`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        alert(`导入失败：${msg}`);
      }
    },
    [importSessions]
  );

  /** 清空所有对话（二次确认） */
  const handleClearAll = useCallback(() => {
    if (window.confirm('确定清空全部对话？此操作无法撤销。')) {
      if (window.confirm('再次确认：所有对话将被永久删除，建议先导出备份。')) {
        clearAllSessions();
        setMoreOpen(false);
      }
    } else {
      setMoreOpen(false);
    }
  }, [clearAllSessions]);

  // 点击外部关闭"更多"菜单
  const moreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!moreOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [moreOpen]);

  useEffect(() => {
    if (!session) {
      createSession();
    }
  }, [session, createSession]);

  if (!session) {
    return null;
  }

  // 4 个功能模块图已迁移到"设置 → 关于"页面展示 —— 主页保持空白

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header —— 移动端左侧 ≡ 按钮（让 border-b 自然在按钮下方），右侧 action icons */}
      <div
        className="border-b border-double border-[var(--border-light)] pl-1.5 pr-4 sm:pl-2 sm:pr-6 py-2 relative flex-shrink-0"
        style={{
          backgroundColor: 'var(--bg-card)',
          paddingTop: 'max(0.5rem, env(safe-area-inset-top, 0px))',
          paddingBottom: '0.5rem',
        }}
      >
        <div className="flex items-center justify-between gap-1 min-h-[44px]">
          {/* 左侧：移动端 ≡ 按钮（与 border-b 同处一线） */}
          {showMobileMenuButton && onOpenSidebar && (
            <button
              onClick={onOpenSidebar}
              className="focus-ring md:hidden p-2.5 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                transition:
                  'transform var(--dur-base) var(--ease-out), color var(--dur-fast) var(--ease-out), background-color var(--dur-fast) var(--ease-out)',
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = '')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
              aria-label="打开侧边栏"
            >
              <Menu size={22} />
            </button>
          )}

          {/* 右侧操作区：active skill/role 标签 + 复制/更多（主页不显示这些"软件图标"） */}
          <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
            {(activeSkill || activePrompt) && session.messages.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 mr-1">
                {activeSkill && (
                  <span
                    className="text-[11px] text-[var(--bg-card)] px-2.5 py-0.5 rounded-full font-handwriting-cn border border-double"
                    style={{
                      backgroundColor: 'var(--accent)',
                      borderColor: 'var(--accent-hover)',
                    }}
                  >
                    ✦ {skillEngine.getSkill(activeSkill)?.name}
                  </span>
                )}
                {activePrompt && (
                  <span
                    className="text-[11px] text-[var(--text-secondary)] px-2.5 py-0.5 rounded-full border border-dashed font-handwriting-cn"
                    style={{
                      backgroundColor: 'var(--bg-hover)',
                      borderColor: 'var(--border-medium)',
                    }}
                  >
                    角色 · {activePrompt.name}
                  </span>
                )}
              </div>
            )}
            {/* 隐藏的 file input，用于导入 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleFileChange}
              className="hidden"
            />
            {/* "更多" 菜单（下拉）—— 主页（空状态）不显示，避免 lucide 软件图标污染视觉 */}
            {session.messages.length > 0 && (
              <div className="relative" ref={moreRef}>
                <button
                  onClick={() => setMoreOpen((v) => !v)}
                  className={`focus-ring p-2 min-w-[44px] min-h-[44px] rounded-paper flex items-center justify-center transition-colors-base ${
                    moreOpen
                      ? 'bg-[var(--bg-hover)] text-[var(--accent)]'
                      : 'hover:bg-[var(--bg-hover)]'
                  }`}
                  aria-label="更多"
                  aria-expanded={moreOpen}
                  title="更多"
                >
                  <MoreHorizontal size={16} />
                </button>
                {moreOpen && (
                  <div
                    className="absolute right-0 top-full mt-1 w-44 rounded-paper border-2 border-double shadow-paper z-50 overflow-hidden animate-drawer-in-up"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-medium)',
                    }}
                  >
                    <button
                      onClick={handleExportAll}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-[var(--bg-hover)] transition-colors text-left"
                    >
                      <Download size={14} style={{ color: 'var(--accent)' }} />
                      <span>导出全部对话</span>
                    </button>
                    <button
                      onClick={handleImportClick}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-[var(--bg-hover)] transition-colors text-left border-t border-dashed"
                      style={{ borderColor: 'var(--border-light)' }}
                    >
                      <Upload size={14} style={{ color: 'var(--accent)' }} />
                      <span>导入对话</span>
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-red-50 transition-colors text-left border-t border-dashed text-red-600"
                      style={{ borderColor: 'var(--border-light)' }}
                    >
                      <Trash2 size={14} />
                      <span>清空全部</span>
                    </button>
                  </div>
                )}
              </div>
            )}
            {/* 复制按钮：仅桌面端 + 有消息时显示 */}
            {session.messages.length > 0 && (
              <button
                onClick={handleCopyCurrentSession}
                className="hidden md:flex p-2 min-w-[44px] min-h-[44px] rounded-paper hover:bg-[var(--bg-hover)] items-center justify-center transition-colors"
                aria-label="复制对话"
                title="复制整个对话"
              >
                {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
              </button>
            )}
            {/* 删除当前对话按钮已移除 —— 改为侧栏长按/右键删除 */}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-6 relative">
        <div className="max-w-4xl mx-auto relative z-10">
          {session.messages.length === 0 ? (
            // 主页留空 —— 所有装饰（logo/引言卡/背景/4 模块开屏）已迁移到 设置 → 关于
            <div className="h-full" aria-hidden />
          ) : (
            <MessageList
              messages={session.messages}
              isStreaming={isStreaming}
              onRegenerate={handleRegenerate}
            />
          )}
        </div>
      </div>

      {/* Input */}
      <InputBox
        onSend={handleSend}
        isStreaming={isStreaming}
        onStop={handleStop}
        placeholder={
          activePrompt ? `以"${activePrompt.name}"身份回复...` : '在书房里，写下你的问题...'
        }
      />
    </div>
  );
}
