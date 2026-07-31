import { CSSProperties } from 'react';
import { IMAGES } from '../../config/images';

export type LogoVariant = 'mark' | 'tile' | 'avatar' | 'favicon' | 'welcome' | 'sidebar';

interface LogoProps {
  variant?: LogoVariant;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * ChatEZ Logo 组件
 *
 * - `mark`: 小型 SVG logo（侧边栏）
 * - `tile`: 大型 PNG logo（欢迎页，引用原图圆角方块）
 * - `avatar`: 圆形头像（消息气泡中 AI 头像）
 * - `favicon`: 紧凑 SVG（favicon 风格）
 * - `welcome`: 兼容别名，等同于 tile
 *
 * 颜色自动适配浅/深色（使用 currentColor）
 */
export function Logo({
  variant = 'mark',
  size = 40,
  className = '',
  style,
}: LogoProps) {
  // tile / welcome variant: 直接显示新版原图（圆角方块带书+气泡+ChatEZ 手写）
  // 使用 brandMarkV2（newimages/IMG_20260709_171628.png），新版样式更完整
  if (variant === 'tile' || variant === 'welcome') {
    return (
      <img
        src={IMAGES.brandMarkV2}
        alt="ChatEZ"
        width={size}
        height={size}
        loading="eager"
        decoding="async"
        className={`rounded-paper-lg ${className}`}
        style={{ objectFit: 'cover', ...style }}
      />
    );
  }

  // avatar variant: 圆形头像，使用 brand-mark-v2.png（新版圆角方块）
  if (variant === 'avatar') {
    return (
      <img
        src={IMAGES.brandMarkV2}
        alt="ChatEZ"
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className={`rounded-full ${className}`}
        style={{ objectFit: 'cover', ...style }}
      />
    );
  }

  // mark / favicon / sidebar variant: 内联 SVG（手绘抖动感）
  const filterId = `rough-${variant}-${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id={filterId} x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="3" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="2.4" />
        </filter>
      </defs>
      <g
        filter={`url(#${filterId})`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* 左侧书页 */}
        <path d="M 6 20 Q 5 18 8 16 L 30 18 Q 32 18 32 20 L 32 56 Q 32 58 30 58 L 8 57 Q 5 57 6 55 Z" />
        {/* 右侧书页 */}
        <path d="M 32 20 Q 32 18 34 18 L 56 16 Q 59 18 58 20 L 58 55 Q 59 57 56 57 L 34 58 Q 32 58 32 56" />
        {/* 书脊 */}
        <path d="M 32 18 L 32 58" strokeWidth="2" />
        {/* 左侧文字线 */}
        <g strokeWidth="1.2" opacity="0.55">
          <path d="M 11 26 Q 18 25 26 26" />
          <path d="M 11 32 Q 18 31 24 32" />
          <path d="M 11 38 Q 18 37 26 38" />
          <path d="M 11 44 Q 17 43 22 44" />
        </g>
        {/* 右侧文字线 */}
        <g strokeWidth="1.2" opacity="0.55">
          <path d="M 38 26 Q 45 25 53 26" />
          <path d="M 38 32 Q 45 31 51 32" />
          <path d="M 38 38 Q 45 37 53 38" />
        </g>
        {/* 对话气泡 */}
        <path d="M 44 2 Q 38 2 38 8 L 38 16 Q 38 22 44 22 L 52 22 L 56 28 L 55 22 Q 60 22 60 16 L 60 8 Q 60 2 54 2 Z" />
        {/* 气泡点 */}
        <circle cx="46" cy="12" r="1.1" fill="currentColor" />
        <circle cx="50" cy="12" r="1.1" fill="currentColor" />
        <circle cx="54" cy="12" r="1.1" fill="currentColor" />
        {/* 折角细节 */}
        <path d="M 50 50 L 56 50 L 50 56 Z" strokeWidth="1" opacity="0.4" />
        <path d="M 14 50 L 8 50 L 14 56 Z" strokeWidth="1" opacity="0.4" />
      </g>
    </svg>
  );
}

export default Logo;
