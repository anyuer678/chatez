import { useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { usePromptStore } from '../../stores/promptStore';
import { useDropdownPortal } from '../../hooks/useDropdownPortal';
import {
  ChevronDown,
  Check,
  X,
  Star,
  ArrowRight,
  Sparkles,
  Settings as SettingsIcon,
} from 'lucide-react';

interface PromptSelectorProps {
  /**
   * 点击"在市场中浏览全部"时触发（打开提示词市场全屏/抽屉）
   */
  onBrowseAll?: () => void;
  /**
   * 兼容旧接口：跳转到设置的角色 tab
   * @deprecated 推荐使用 onBrowseAll
   */
  onManage?: () => void;
}

/**
 * 侧边栏"常用角色"下拉选择器
 * - 仅显示 pinned 角色（默认 5 个）
 * - 底部"在市场中浏览全部"进入提示词市场
 * - 角色的编辑/删除/导入导出/收藏等完整功能全部迁到提示词市场
 *
 * 关键修复：使用 portal + fixed 定位渲染下拉菜单，
 * 跳出侧边栏 overflow-hidden 上下文，避免被截断
 */
export function PromptSelector({ onBrowseAll, onManage }: PromptSelectorProps = {}) {
  const { prompts, activePromptId, setActivePrompt } = usePromptStore();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { isOpen, toggle, close, position } = useDropdownPortal(buttonRef);

  const activePrompt = prompts.find((p) => p.id === activePromptId);

  // 仅显示「常用」角色（按 pinned 状态）
  const pinnedPrompts = useMemo(
    () => prompts.filter((p) => p.pinned === true),
    [prompts]
  );

  const handleSelect = (id: string) => {
    setActivePrompt(id);
    close();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePrompt('');
  };

  const renderButton = () => (
    <button
      ref={buttonRef}
      onClick={toggle}
      className="w-full flex items-center justify-between px-3 py-2 rounded-paper border-2 transition-all text-sm min-h-[40px]"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: isOpen ? 'var(--accent)' : 'var(--border-light)',
        borderStyle: isOpen ? 'solid' : 'dashed',
      }}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {activePrompt ? (
          <Star
            size={11}
            style={{ color: 'var(--accent)' }}
            fill="currentColor"
            className="flex-shrink-0"
          />
        ) : null}
        <span
          style={{ color: 'var(--text-secondary)' }}
          className="truncate font-handwriting-cn text-base"
        >
          {activePrompt ? activePrompt.name : '默认 · default'}
        </span>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {activePrompt && (
          <button
            onClick={handleClear}
            className="p-1 min-w-[24px] min-h-[24px] rounded-sm flex items-center justify-center"
            style={{ color: 'var(--text-muted)' }}
            aria-label="清除角色"
          >
            <X size={12} />
          </button>
        )}
        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: 'var(--text-muted)' }}
        />
      </div>
    </button>
  );

  const renderDropdown = () => {
    if (!isOpen) return null;
    if (typeof document === 'undefined') return null;

    const transformOrigin = position.canOpenDown ? 'top left' : 'bottom left';
    const transform = position.canOpenDown ? 'translateY(0)' : 'translateY(-100%)';

    return createPortal(
      <>
        {/* 透明遮罩 */}
        <div
          className="fixed inset-0"
          style={{ zIndex: 9998 }}
          onClick={close}
        />
        {/* 下拉菜单本体：portal 渲染，fixed 定位，跳出父级 overflow 上下文 */}
        <div
          className="fixed rounded-paper shadow-paper-lg border-2 border-double animate-fade-in"
          style={{
            top: position.top,
            left: position.left,
            width: position.width,
            maxHeight: '60vh',
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-medium)',
            zIndex: 9999,
            transformOrigin,
            transform,
          }}
        >
          <div className="max-h-60 overflow-y-auto">
            {/* 默认选项 */}
            <button
              onClick={() => handleSelect('')}
              className="w-full flex items-center gap-2 px-3 py-2.5 transition-colors min-h-[40px]"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <X size={11} style={{ color: 'var(--text-muted)' }} className="flex-shrink-0" />
              <span className="text-sm font-handwriting-cn text-base">默认 · default</span>
              {!activePromptId && (
                <Check size={14} className="ml-auto flex-shrink-0" style={{ color: 'var(--accent)' }} />
              )}
            </button>

            {/* 常用角色分组标题 */}
            <div
              className="px-3 py-1.5 flex items-center gap-1.5 border-t border-dashed"
              style={{ borderColor: 'var(--border-light)' }}
            >
              <Star size={10} style={{ color: 'var(--accent)' }} fill="currentColor" />
              <span
                className="text-[10px] font-handwriting-en"
                style={{ color: 'var(--text-muted)' }}
              >
                · 常用角色 · {pinnedPrompts.length}
              </span>
            </div>

            {/* 常用角色列表 */}
            {pinnedPrompts.length === 0 ? (
              <div
                className="px-3 py-4 text-[11px] font-handwriting-cn text-center"
                style={{ color: 'var(--text-muted)' }}
              >
                暂无常用角色
                <br />
                <span className="text-[10px]">在市场中挑选吧 ↓</span>
              </div>
            ) : (
              pinnedPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  onClick={() => handleSelect(prompt.id)}
                  className="flex items-center gap-2 px-3 py-2 transition-colors cursor-pointer min-h-[40px]"
                  style={
                    activePromptId === prompt.id
                      ? { backgroundColor: 'var(--accent-light)' }
                      : undefined
                  }
                  onMouseEnter={(e) => {
                    if (activePromptId !== prompt.id)
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (activePromptId !== prompt.id)
                      e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Star
                    size={10}
                    style={{ color: 'var(--accent)' }}
                    fill="currentColor"
                    className="flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <p
                      className="text-sm truncate font-handwriting-cn text-base"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {prompt.name}
                    </p>
                    <p
                      className="text-[11px] truncate"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {prompt.description}
                    </p>
                  </div>
                  {activePromptId === prompt.id && (
                    <Check size={14} className="flex-shrink-0" style={{ color: 'var(--accent)' }} />
                  )}
                </div>
              ))
            )}
          </div>

          {/* 底部：进入市场 */}
          <div className="border-t" style={{ borderColor: 'var(--border-light)' }}>
            {onBrowseAll ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBrowseAll();
                  close();
                }}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 transition-colors text-sm font-handwriting-cn text-base min-h-[40px]"
                style={{ color: 'var(--accent)' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                title="在提示词市场中浏览全部 32+ 角色"
              >
                <span className="flex items-center gap-2">
                  <Sparkles size={12} />
                  在市场中浏览全部
                </span>
                <ArrowRight size={12} />
              </button>
            ) : onManage ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onManage();
                  close();
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 transition-colors text-sm font-handwriting-cn text-base min-h-[40px]"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <SettingsIcon size={12} />
                管理角色 · manage all
              </button>
            ) : null}
          </div>
        </div>
      </>,
      document.body
    );
  };

  return (
    <>
      {renderButton()}
      {renderDropdown()}
    </>
  );
}
