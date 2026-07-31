import { CSSProperties } from 'react';
import { useConfigStore } from '../../stores/configStore';

interface UserAvatarProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

/**
 * 用户头像组件
 * - 有 avatar 时显示图片
 * - 无 avatar 时显示名字首字
 */
export function UserAvatar({ size = 36, className = '', style, onClick }: UserAvatarProps) {
  const user = useConfigStore((s) => s.user);
  const initial = (user.name.trim() || '?').charAt(0);

  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      className={`rounded-full overflow-hidden border-2 border-double flex items-center justify-center flex-shrink-0 ${
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform' : ''
      } ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: 'var(--bg-sidebar)',
        borderColor: 'var(--border-medium)',
        ...style,
      }}
      aria-label={onClick ? '编辑个人信息' : undefined}
    >
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <span
          className="font-handwriting-en font-bold"
          style={{
            color: 'var(--accent)',
            fontSize: size * 0.5,
            lineHeight: 1,
          }}
        >
          {initial}
        </span>
      )}
    </Tag>
  );
}
