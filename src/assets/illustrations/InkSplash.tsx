import { CSSProperties } from 'react';

interface IllustrationProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * 墨点插画 —— 飞溅的墨水点
 * 用于发送按钮 hover 装饰
 */
export function InkSplash({ size = 60, className = '', style }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="rough-ink" x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="29" />
          <feDisplacementMap in="SourceGraphic" scale="2.5" />
        </filter>
      </defs>
      <g
        filter="url(#rough-ink)"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* 主墨点（中心） */}
        <ellipse cx="40" cy="40" rx="8" ry="6" fillOpacity="0.6" />
        {/* 飞溅的小点 */}
        <circle cx="20" cy="30" r="1.8" fillOpacity="0.7" />
        <circle cx="60" cy="25" r="2.2" fillOpacity="0.7" />
        <circle cx="65" cy="50" r="1.5" fillOpacity="0.7" />
        <circle cx="18" cy="55" r="1.2" fillOpacity="0.7" />
        <circle cx="50" cy="65" r="1" fillOpacity="0.7" />
        <circle cx="30" cy="68" r="1.4" fillOpacity="0.7" />
        <circle cx="70" cy="40" r="0.8" fillOpacity="0.7" />
        <circle cx="10" cy="40" r="1" fillOpacity="0.7" />
        <circle cx="40" cy="12" r="1.3" fillOpacity="0.7" />
        <circle cx="40" cy="72" r="1" fillOpacity="0.7" />
        {/* 飞溅的细线 */}
        <path d="M 48 36 Q 56 32 62 28" strokeWidth="0.8" fill="none" opacity="0.6" />
        <path d="M 32 44 Q 22 48 16 54" strokeWidth="0.8" fill="none" opacity="0.6" />
        <path d="M 44 46 Q 52 52 58 58" strokeWidth="0.8" fill="none" opacity="0.6" />
      </g>
    </svg>
  );
}

export default InkSplash;
