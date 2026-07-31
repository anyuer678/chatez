import { createPortal } from 'react-dom';
import { X, Sparkles, Clock } from 'lucide-react';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * 模块名（如"知识库"、"插件中心"）
   */
  moduleName: string;
  /**
   * 模块简短描述（一行话）
   */
  description: string;
  /**
   * 计划提供的能力（数组渲染为列表）
   */
  features: string[];
  /**
   * 进度百分比（0-100）
   */
  progress?: number;
  /**
   * 节点装饰图标（来自 sidebar 的手绘图片）
   */
  iconSrc?: string;
}

/**
 * 开发中占位窗口
 * 复用 SettingsModal 的视觉风格（双线边框 / 胶带 / 暖色）
 * 用于「知识库」「插件中心」等暂未开发但已留窗口的模块
 *
 * 关键修复：使用 createPortal 渲染到 document.body，
 * 避免被父级 transform 截断
 */
export function ComingSoonModal({
  isOpen,
  onClose,
  moduleName,
  description,
  features,
  progress = 0,
  iconSrc,
}: ComingSoonModalProps) {
  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(28, 20, 10, 0.5)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div
        className="rounded-paper-lg shadow-paper-lg w-full max-w-md max-h-[90vh] flex flex-col mx-4 border-4 border-double relative overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-medium)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部书脊装饰 */}
        <div
          className="absolute top-0 left-0 bottom-0 w-1.5 rounded-l-paper-lg"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, var(--accent) 0px, var(--accent) 4px, transparent 4px, transparent 8px)',
          }}
        />

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b-2 border-double"
          style={{ borderColor: 'var(--border-light)' }}
        >
          <div className="flex items-center gap-2">
            {iconSrc && (
              <img
                src={iconSrc}
                alt={moduleName}
                className="w-7 h-7 rounded-sm object-cover"
              />
            )}
            <h2
              className="text-base font-semibold font-handwriting-cn text-lg"
              style={{ color: 'var(--text-primary)' }}
            >
              {moduleName} · 即将推出
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-paper transition-colors hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--text-muted)' }}
            aria-label="关闭"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* 开发中标识（便签纸） */}
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-paper text-xs font-handwriting-cn text-sm relative shadow-paper-sm"
            style={{
              backgroundColor: 'var(--paper-yellow)',
              border: '1px dashed var(--border-medium)',
              color: 'var(--text-secondary)',
              transform: 'rotate(-0.8deg)',
            }}
          >
            <Clock size={14} style={{ color: 'var(--accent)' }} />
            <span>该模块正在开发中，敬请期待</span>
            {/* 胶带装饰 */}
            <div
              className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-10 h-3 rounded-sm opacity-70"
              style={{ backgroundColor: 'var(--tape)', transform: 'translateX(-50%) rotate(-2deg)' }}
            />
          </div>

          {/* 模块描述 */}
          <p
            className="text-sm font-handwriting-cn text-base leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            {description}
          </p>

          {/* 计划功能列表 */}
          {features.length > 0 && (
            <div>
              <p
                className="text-xs font-handwriting-en text-base mb-2 flex items-center gap-1.5"
                style={{ color: 'var(--text-muted)' }}
              >
                <Sparkles size={11} style={{ color: 'var(--accent)' }} />
                · 计划提供的能力
              </p>
              <ul className="space-y-1.5">
                {features.map((feat, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs font-handwriting-cn"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <span
                      className="inline-block mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: 'var(--accent)' }}
                    />
                    <span className="leading-relaxed">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 进度条 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span
                className="text-[10px] font-handwriting-en"
                style={{ color: 'var(--text-muted)' }}
              >
                · 开发进度
              </span>
              <span
                className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--paper-yellow)', color: 'var(--accent)' }}
              >
                {progress}%
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden border-2 border-dashed"
              style={{ backgroundColor: 'var(--bg-hover)', borderColor: 'var(--border-light)' }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.max(0, Math.min(100, progress))}%`,
                  backgroundImage:
                    'repeating-linear-gradient(45deg, var(--accent) 0px, var(--accent) 4px, var(--accent-hover) 4px, var(--accent-hover) 8px)',
                }}
              />
            </div>
          </div>

          {/* 反馈入口（装饰） */}
          <div
            className="text-[10px] font-handwriting-en p-2 rounded-paper border border-dashed text-center"
            style={{
              backgroundColor: 'var(--bg-sidebar)',
              color: 'var(--text-muted)',
              borderColor: 'var(--border-light)',
            }}
          >
            ✦ 该窗口已保留位置，后续版本逐步开放 ✦
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-2 px-5 py-3 border-t-2 border-double"
          style={{ borderColor: 'var(--border-light)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-paper-sm transition-colors font-handwriting-cn"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--bg-card)',
              border: '2px double var(--accent-hover)',
            }}
          >
            知道了
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
