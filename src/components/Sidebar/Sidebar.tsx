import { useState, useRef, useEffect, useCallback } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { useConfigStore } from '../../stores/configStore';
import { PromptSelector } from '../Prompt';
import { SkillSelector } from '../Skill';
import { Logo, UserAvatar, UserProfileModal, ComingSoonModal } from '../common';
import { IMAGES } from '../../config/images';
import { PlantLeaf } from '../../assets/illustrations';
import type { SettingsTab } from '../Settings';
import { Plus, Settings, BookOpen, MessageCircle, X as XIcon, Trash2 } from 'lucide-react';

interface SidebarProps {
  onSessionSelect?: () => void;
  onOpenSettings?: (tab?: SettingsTab) => void;
  /**
   * 打开「提示词市场」全屏/抽屉
   * 桌面端从右侧滑入，移动端全屏
   */
  onOpenPromptMarket?: () => void;
  /**
   * 移动端模式下，外部传入关闭侧边栏的回调
   */
  onCloseMobileSidebar?: () => void;
  /**
   * 是否为移动端模式（控制内部 UI 适配）
   */
  isMobile?: boolean;
}

/**
 * 侧边栏主模块
 * - chat: 对话（默认）
 * - knowledge: 知识库（开发中 → 占位窗口）
 * - prompts: 提示词市场 → 跳转到设置 → 角色
 * - plugins: 插件中心（开发中 → 占位窗口）
 */
type MainModule = 'chat' | 'knowledge' | 'prompts' | 'plugins';

interface ModuleInfo {
  id: MainModule;
  img: string;
  label: string;
  description: string;
  features: string[];
  progress: number;
  comingSoon: boolean;
}

const MODULES: Record<MainModule, ModuleInfo> = {
  chat: {
    id: 'chat',
    img: IMAGES.moduleChat,
    label: '对话',
    description: '当前主界面，与 AI 多轮对话。',
    features: [],
    progress: 100,
    comingSoon: false,
  },
  knowledge: {
    id: 'knowledge',
    img: IMAGES.moduleBook,
    label: '知识库',
    description: '上传文档 / 笔记 / 网页，让 AI 基于你的私人知识回答问题。',
    features: [
      '多格式文档解析（PDF / Markdown / Word / TXT）',
      '向量化检索 + Top-K 上下文注入',
      '支持笔记本分组与权限隔离',
      '手动标注高亮 + AI 自动摘要',
    ],
    progress: 30,
    comingSoon: true,
  },
  prompts: {
    id: 'prompts',
    img: IMAGES.moduleQuill,
    label: '提示词市场',
    description: '32+ 角色预设（学习/编程/写作/职场/...）的浏览与管理。',
    features: [
      '一键启用预设角色',
      '新建/编辑/删除自定义角色',
      '按标签快速筛选',
      'JSON 导入导出',
    ],
    progress: 100,
    comingSoon: false,
  },
  plugins: {
    id: 'plugins',
    img: IMAGES.modulePuzzle,
    label: '插件中心',
    description: '扩展 AI 能力的插件市场，连接外部工具与服务。',
    features: [
      'Web 搜索 / 联网阅读',
      '代码执行沙箱',
      '图像生成（Stable Diffusion / DALL·E）',
      '日历 / 待办 / 邮件等办公工具',
      '自定义 Webhook / API 接入',
    ],
    progress: 10,
    comingSoon: true,
  },
};

export function Sidebar({ onSessionSelect, onOpenSettings, onOpenPromptMarket, onCloseMobileSidebar }: SidebarProps) {
  const { sessions, activeSessionId, createSession, deleteSession, setActiveSession } =
    useChatStore();
  const { api, user } = useConfigStore();
  const [searchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeModule, setActiveModule] = useState<MainModule>('chat');
  const [comingSoonModule, setComingSoonModule] = useState<MainModule | null>(null);

  // 对话项上下文菜单（长按/右键触发）
  const [contextMenu, setContextMenu] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const longPressTriggeredRef = useRef(false);

  /** 关闭上下文菜单（点击外部 / 滚动 / Esc） */
  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    // 延迟绑定避免立即触发 click outside
    const t = window.setTimeout(() => {
      document.addEventListener('click', close);
      document.addEventListener('scroll', close, true);
      document.addEventListener('keydown', onKey);
    }, 0);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('click', close);
      document.removeEventListener('scroll', close, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [contextMenu]);

  /** 长按开始（移动端） */
  const handleTouchStart = useCallback(
    (e: React.TouchEvent, id: string) => {
      longPressTriggeredRef.current = false;
      const t = e.touches[0];
      if (!t) return;
      const x = t.clientX;
      const y = t.clientY;
      longPressTimerRef.current = window.setTimeout(() => {
        longPressTriggeredRef.current = true;
        setContextMenu({ id, x, y });
      }, 500);
    },
    []
  );

  /** 长按结束/取消 */
  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  /** 触屏移动超过阈值则取消长按（避免误触） */
  const handleTouchMove = useCallback(() => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  /** 右键（桌面端） */
  const handleContextMenu = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ id, x: e.clientX, y: e.clientY });
    },
    []
  );

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('确定删除这个对话吗？')) {
      deleteSession(id);
    }
  };

  /** 会话项点击：长按触发后阻止切换 */
  const handleSessionClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      if (longPressTriggeredRef.current) {
        longPressTriggeredRef.current = false;
        e.stopPropagation();
        return;
      }
      setActiveSession(id);
      onSessionSelect?.();
    },
    [setActiveSession, onSessionSelect]
  );

  const filteredSessions = searchQuery
    ? sessions.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : sessions;

  /**
   * 菜单点击处理：每个按钮都有真实的交互
   * - chat: 切换到对话主界面
   * - knowledge / plugins: 打开"开发中"占位窗口
   * - prompts: 打开「提示词市场」全屏/抽屉
   */
  const handleModuleClick = (id: MainModule) => {
    setActiveModule(id);
    const module = MODULES[id];
    if (id === 'chat') {
      return; // 对话：仅切换 active 状态
    }
    if (id === 'prompts') {
      onOpenPromptMarket?.();
      return;
    }
    if (module.comingSoon) {
      setComingSoonModule(id);
    }
  };

  return (
    <aside
      className="w-72 md:w-[280px] h-full flex flex-col border-r border-[var(--border-light)] relative flex-shrink-0 overflow-hidden"
      style={{ backgroundColor: 'var(--bg-sidebar)' }}
    >
      {/* 背景图：睡猫+扶手椅+书架（低不透明） */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${IMAGES.sidebarDecor})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
          opacity: 0.22,
        }}
        aria-hidden
      />
      {/* 浅色蒙版（保证内容可读） */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundColor: 'var(--bg-sidebar)', opacity: 0.78 }}
        aria-hidden
      />

      {/* 内容层（z-10 保证在背景之上） */}
      <div className="relative z-10 flex flex-col h-full min-h-0">
        {/* 顶部 Logo 区域 —— flex-shrink-0 防止压扁 */}
        <div className="px-4 sm:px-5 pt-3 sm:pt-5 pb-3 flex-shrink-0" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))' }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="text-[var(--accent)] flex-shrink-0">
              <Logo variant="sidebar" size={44} />
            </div>
            <div className="min-w-0 flex-1">
              <h1
                className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] leading-none font-handwriting-en truncate"
                style={{ letterSpacing: '0.5px' }}
              >
                ChatEZ
              </h1>
              <p className="text-[11px] sm:text-[12px] text-[var(--text-muted)] mt-1 font-handwriting-cn flex items-center gap-1.5 truncate">
                <span style={{ color: 'var(--accent-soft)' }} aria-hidden>
                  <PlantLeaf size={14} />
                </span>
                书房手记 · 与 AI 对话
              </p>
            </div>
            {/* 移动端：内置 X 关闭按钮，明确告诉用户怎么关侧边栏 */}
            {onCloseMobileSidebar && (
              <button
                onClick={onCloseMobileSidebar}
                className="md:hidden flex-shrink-0 p-2 min-w-[36px] min-h-[36px] rounded-paper hover:bg-[var(--bg-hover)] flex items-center justify-center transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                aria-label="关闭侧边栏"
                title="关闭侧边栏"
              >
                <XIcon size={18} />
              </button>
            )}
          </div>
        </div>

        {/* 双线分隔（仿古书页） */}
        <div className="mx-4 border-t border-double border-[var(--border-medium)] opacity-60 flex-shrink-0" />

        {/* 新建对话按钮 */}
        <div className="px-4 pt-3 pb-3 flex-shrink-0">
          <button
            onClick={() => createSession()}
            className="btn-ink w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--accent)] text-[var(--bg-card)] rounded-paper border-2 border-double border-[var(--accent-hover)] hover:bg-[var(--accent-hover)] transition-all text-sm font-medium shadow-paper-sm min-h-[44px]"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span className="font-handwriting-cn">新建对话</span>
          </button>
        </div>

        {/* API 未配置提示 —— 便签纸样式 */}
        {!api.apiKey && (
          <div className="mx-4 mb-3 relative flex-shrink-0">
            <div
              className="px-3 py-2.5 rounded-paper text-xs shadow-paper-sm"
              style={{
                backgroundColor: 'var(--paper-yellow)',
                border: '1px dashed var(--border-medium)',
                transform: 'rotate(-0.8deg)',
              }}
            >
              <span className="text-[var(--text-secondary)]">未配置 API Key · </span>
              <button
                onClick={() => onOpenSettings?.()}
                className="text-[var(--accent)] underline font-medium min-h-[24px]"
              >
                立即配置
              </button>
            </div>
            {/* 胶带装饰 */}
            <div
              className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-10 h-3 rounded-sm opacity-70"
              style={{ backgroundColor: 'var(--tape)', transform: 'translateX(-50%) rotate(-2deg)' }}
            />
          </div>
        )}

        {/* 功能菜单 */}
        <div className="px-3 mb-2 flex-shrink-0">
          {(Object.values(MODULES) as ModuleInfo[]).map((item) => {
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleModuleClick(item.id)}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-paper transition-all text-sm min-h-[44px] ${
                  isActive
                    ? 'text-[var(--accent)] font-medium shadow-paper-sm'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                }`}
                style={
                  isActive
                    ? { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)' }
                    : undefined
                }
                title={item.comingSoon ? `${item.label} · 开发中` : item.label}
              >
                <img
                  src={item.img}
                  alt={item.label}
                  className="w-[18px] h-[18px] flex-shrink-0 rounded-sm object-cover"
                  style={{ filter: isActive ? 'none' : 'grayscale(0.15) opacity(0.85)' }}
                />
                {isActive ? (
                  <span className="font-handwriting-cn">{item.label}</span>
                ) : (
                  <span>{item.label}</span>
                )}
                {item.comingSoon && (
                  <span
                    className="ml-auto text-[9px] px-1 py-0.5 rounded-paper font-handwriting-en flex-shrink-0"
                    style={{
                      backgroundColor: 'var(--paper-yellow)',
                      color: 'var(--accent)',
                      border: '1px dashed var(--border-light)',
                    }}
                  >
                    SOON
                  </span>
                )}
                {isActive && !item.comingSoon && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* 双线分隔 */}
        <div className="mx-4 border-t border-double border-[var(--border-light)] my-2 opacity-70 flex-shrink-0" />

        {/* Prompt & Skill —— 始终显示（用户可滚动） */}
        <div className="px-4 space-y-3 mb-3 flex-shrink-0">
          <div>
            <label className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] mb-1.5 uppercase tracking-wider font-medium font-handwriting-en text-sm">
              角色 · Prompt
            </label>
            <PromptSelector onBrowseAll={onOpenPromptMarket} />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] mb-1.5 uppercase tracking-wider font-medium font-handwriting-en text-sm">
              技能 · Skill
            </label>
            <SkillSelector />
          </div>
        </div>

        {/* 分割线 */}
        <div className="mx-4 border-t border-dashed border-[var(--border-light)] flex-shrink-0" />

        {/* 会话列表 —— flex-1 占据中间剩余空间，超出时滚动 */}
        <div className="flex-1 overflow-y-auto px-3 py-2 min-h-0">
          <div className="space-y-1">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                onClick={(e) => handleSessionClick(e, session.id)}
                onContextMenu={(e) => handleContextMenu(e, session.id)}
                onTouchStart={(e) => handleTouchStart(e, session.id)}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-paper cursor-pointer transition-all relative min-h-[44px] select-none ${
                  session.id === activeSessionId
                    ? 'shadow-paper-sm'
                    : 'hover:bg-[var(--bg-hover)]'
                }`}
                style={
                  session.id === activeSessionId
                    ? {
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-light)',
                      }
                    : undefined
                }
              >
                {/* 装订线虚线（左侧） */}
                {session.id === activeSessionId && (
                  <span
                    className="absolute left-1 top-2 bottom-2 w-px opacity-50"
                    style={{
                      backgroundImage:
                        'linear-gradient(to bottom, var(--border-medium) 50%, transparent 50%)',
                      backgroundSize: '1px 4px',
                    }}
                  />
                )}
                <div
                  className={`w-8 h-8 rounded-paper-sm flex items-center justify-center flex-shrink-0 ${
                    session.id === activeSessionId
                      ? 'text-[var(--bg-card)]'
                      : 'text-[var(--text-muted)]'
                  }`}
                  style={
                    session.id === activeSessionId
                      ? { backgroundColor: 'var(--accent)' }
                      : { backgroundColor: 'var(--bg-hover)' }
                  }
                >
                  <MessageCircle size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm truncate ${
                      session.id === activeSessionId
                        ? 'text-[var(--text-primary)] font-medium'
                        : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {session.title}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] font-handwriting-en">
                    {session.messages.length} msgs
                  </p>
                </div>
                {/* 右侧留白占位（移除 Trash2 按键） —— 删除改为长按/右键 */}
              </div>
            ))}

            {filteredSessions.length === 0 && (
              <div className="text-center py-12 px-4">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center border-2 border-dashed border-[var(--border-light)]">
                  <BookOpen size={22} className="text-[var(--text-muted)]" />
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-1 font-handwriting-cn">
                  {searchQuery ? '未找到相关对话' : '还没有对话哦~'}
                </p>
                <p className="text-xs text-[var(--text-muted)] font-handwriting-en text-base">
                  {searchQuery ? 'try other keywords' : 'start a new chat ↑'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 底部用户信息（点击头像/名字可改名/换头像） —— flex-shrink-0 始终可见 */}
        <div
          className="px-3 sm:px-4 py-2.5 sm:py-3 border-t border-double border-[var(--border-light)] flex items-center gap-3 flex-shrink-0"
          style={{
            backgroundColor: 'var(--bg-card)',
            paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom, 0px))',
          }}
        >
          <UserAvatar size={36} onClick={() => setIsProfileOpen(true)} />
          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate font-handwriting-cn">
                {user.name || '匿名用户'}
              </p>
              {user.isPro && (
                <span
                  className="px-1.5 py-0.5 text-[10px] font-bold rounded-full flex-shrink-0 font-handwriting-en"
                  style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-card)' }}
                >
                  Pro
                </span>
              )}
            </div>
            <p className="text-[11px] text-[var(--text-muted)] font-handwriting-en truncate">
              {user.isPro ? 'Pro member · 点我编辑' : '点我编辑资料'}
            </p>
          </button>
          <button
            onClick={() => onOpenSettings?.()}
            className="p-2 min-w-[44px] min-h-[44px] text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-hover)] rounded-paper transition-colors flex items-center justify-center"
            title="设置"
            aria-label="打开设置"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* 用户资料编辑弹窗（无账号，本地存储） */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* 知识库 / 插件中心 等开发中模块的占位窗口 */}
      {comingSoonModule && (
        <ComingSoonModal
          isOpen={comingSoonModule !== null}
          onClose={() => setComingSoonModule(null)}
          moduleName={MODULES[comingSoonModule].label}
          description={MODULES[comingSoonModule].description}
          features={MODULES[comingSoonModule].features}
          progress={MODULES[comingSoonModule].progress}
          iconSrc={MODULES[comingSoonModule].img}
        />
      )}

      {/* 对话项上下文菜单 —— 长按（移动端）/ 右键（桌面端）触发 */}
      {contextMenu && (
        <div
          className="fixed z-50 min-w-[140px] rounded-paper border-2 border-double shadow-paper-lg overflow-hidden animate-drawer-in-up"
          style={{
            left: Math.min(contextMenu.x, window.innerWidth - 160),
            top: Math.min(contextMenu.y, window.innerHeight - 60),
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-medium)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              handleDelete(e, contextMenu.id);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
          >
            <Trash2 size={14} />
            <span>删除对话</span>
          </button>
        </div>
      )}
    </aside>
  );
}
