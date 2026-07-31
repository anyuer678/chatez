import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, RotateCcw, User as UserIcon } from 'lucide-react';
import { useConfigStore } from '../../stores/configStore';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MAX_AVATAR_SIZE = 512; // px
const MAX_FILE_SIZE_MB = 2; // MB

/**
 * 用户资料编辑弹窗（无账号模式）
 * - 改名（display name）
 * - 换头像（上传本地图片，存为 dataURL）
 * - 切换 Pro 徽标
 *
 * 关键修复：使用 createPortal 渲染到 document.body，
 * 避免被父级 transform（如移动端 sidebar translate-x）截断
 */
export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const user = useConfigStore((s) => s.user);
  const updateUser = useConfigStore((s) => s.updateUser);

  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);
  const [isPro, setIsPro] = useState(user.isPro);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 关键修复：仅依赖 isOpen 边沿切换 + ref 读取最新 user
  // 旧版本 [isOpen, user.name, user.avatar, user.isPro] 会因外层 user 引用变化
  // 触发 effect → 即使 prevOpenRef 阻止 setState，effect 仍跑（浪费 + 偶发竞争）
  // 改进：用 userRef 在 callback 时读最新值，effect 本身只跑一次（false→true）
  const userRef = useRef(user);
  userRef.current = user;
  const prevOpenRef = useRef(isOpen);
  useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      // false → true：拉取最新 user 数据到本地
      const u = userRef.current;
      setName(u.name);
      setAvatar(u.avatar);
      setIsPro(u.isPro);
      setError(null);
    }
    prevOpenRef.current = isOpen;
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`图片大小不能超过 ${MAX_FILE_SIZE_MB}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      // 通过 Image 缩放至 <= MAX_AVATAR_SIZE
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(
          1,
          MAX_AVATAR_SIZE / Math.max(img.width, img.height)
        );
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setAvatar(canvas.toDataURL('image/png'));
          setError(null);
        } else {
          setAvatar(dataUrl);
        }
      };
      img.onerror = () => setError('图片解析失败');
      img.src = dataUrl;
    };
    reader.onerror = () => setError('文件读取失败');
    reader.readAsDataURL(file);
    // 重置 value 以便能再次选择同一文件
    e.target.value = '';
  };

  const handleResetAvatar = () => {
    setAvatar('');
  };

  const handleSave = () => {
    const trimmed = name.trim() || '匿名用户';
    updateUser({ name: trimmed, avatar, isPro });
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const initial = (name.trim() || '?').charAt(0);

  // 使用 portal 渲染到 document.body，避免被父级 transform 截断
  // 在 SSR 环境下 typeof document 可能为 undefined，加保护
  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(60, 40, 20, 0.5)' }}
      onClick={handleCancel}
    >
      <div
        className="relative w-full max-w-md rounded-paper-lg border-2 border-double shadow-paper-lg overflow-hidden animate-fade-in-up"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-medium)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部条 */}
        <div
          className="px-5 py-3 border-b border-double flex items-center justify-between"
          style={{
            backgroundColor: 'var(--paper-yellow)',
            borderColor: 'var(--border-light)',
          }}
        >
          <h2
            className="text-lg font-bold font-handwriting-cn flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <UserIcon size={18} />
            个人信息
          </h2>
          <button
            onClick={handleCancel}
            className="p-1.5 min-w-[32px] min-h-[32px] rounded-paper hover:bg-[var(--bg-hover)] flex items-center justify-center transition-colors"
            aria-label="关闭"
          >
            <X size={18} />
          </button>
        </div>

        {/* 主体 */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* 头像区域 */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-double flex items-center justify-center group"
              style={{
                backgroundColor: 'var(--bg-sidebar)',
                borderColor: 'var(--border-medium)',
              }}
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt="头像预览"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span
                  className="font-handwriting-en text-4xl font-bold"
                  style={{ color: 'var(--accent)' }}
                >
                  {initial}
                </span>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-full bg-white/90 text-gray-700 hover:bg-white transition-colors"
                  aria-label="更换头像"
                >
                  <Upload size={16} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs rounded-paper border border-dashed hover:border-solid hover:shadow-paper-sm transition-all flex items-center gap-1.5 min-h-[32px]"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-medium)',
                  color: 'var(--text-secondary)',
                }}
              >
                <Upload size={14} />
                上传头像
              </button>
              {avatar && (
                <button
                  onClick={handleResetAvatar}
                  className="px-3 py-1.5 text-xs rounded-paper border border-dashed hover:border-solid hover:shadow-paper-sm transition-all flex items-center gap-1.5 min-h-[32px]"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-medium)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <RotateCcw size={14} />
                  还原
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {error && (
              <p className="text-xs" style={{ color: '#c0392b' }}>
                {error}
              </p>
            )}
            <p
              className="text-[11px] font-handwriting-en"
              style={{ color: 'var(--text-muted)' }}
            >
              支持 JPG / PNG / GIF，最大 {MAX_FILE_SIZE_MB}MB
            </p>
          </div>

          {/* 名字输入 */}
          <div>
            <label
              className="block text-xs mb-1.5 font-handwriting-cn font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              显示名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              placeholder="匿名用户"
              className="w-full px-3 py-2 text-sm rounded-paper border-2 border-double focus:outline-none transition-colors"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)',
              }}
            />
            <p
              className="mt-1 text-[11px] font-handwriting-en text-right"
              style={{ color: 'var(--text-muted)' }}
            >
              {name.length} / 20
            </p>
          </div>

          {/* Pro 切换 */}
          <div
            className="flex items-center justify-between p-3 rounded-paper border border-dashed gap-3"
            style={{
              backgroundColor: 'var(--bg-sidebar)',
              borderColor: 'var(--border-light)',
            }}
          >
            <div className="min-w-0 flex-1">
              <p
                className="text-sm font-medium font-handwriting-cn"
                style={{ color: 'var(--text-primary)' }}
              >
                Pro 会员徽标
              </p>
              <p
                className="text-[11px] font-handwriting-en"
                style={{ color: 'var(--text-muted)' }}
              >
                展示 Pro 身份标识
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isPro}
              onClick={() => setIsPro(!isPro)}
              className="relative flex-shrink-0 w-12 h-7 rounded-full transition-colors p-0.5 border-0 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
              style={{
                backgroundColor: isPro ? 'var(--accent)' : 'var(--border-medium)',
              }}
              aria-label={isPro ? '关闭 Pro' : '开启 Pro'}
            >
              <span
                className="block w-6 h-6 rounded-full bg-white shadow-md"
                style={{
                  transform: isPro ? 'translateX(20px)' : 'translateX(0px)',
                  transition: 'transform 0.2s ease',
                }}
              />
            </button>
          </div>
        </div>

        {/* 底部按钮 */}
        <div
          className="px-5 py-3 border-t border-double flex items-center justify-end gap-2"
          style={{
            backgroundColor: 'var(--bg-sidebar)',
            borderColor: 'var(--border-light)',
          }}
        >
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm rounded-paper border-2 border-double hover:shadow-paper-sm transition-all min-h-[36px]"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-light)',
              color: 'var(--text-secondary)',
            }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium rounded-paper border-2 border-double hover:shadow-paper transition-all min-h-[36px]"
            style={{
              backgroundColor: 'var(--accent)',
              borderColor: 'var(--accent-hover)',
              color: 'var(--bg-card)',
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
