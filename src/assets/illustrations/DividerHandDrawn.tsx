import { CSSProperties } from 'react';

interface IllustrationProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * 手绘分隔线 —— 横向波浪线
 * 用于段落分隔
 */
export function DividerHandDrawn({ size = 200, className = '', style }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={(size * 20) / 200}
      viewBox="0 0 200 20"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="rough-divider" x="-5%" y="-20%" width="110%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="31" />
          <feDisplacementMap in="SourceGraphic" scale="2.2" />
        </filter>
      </defs>
      <g
        filter="url(#rough-divider)"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* 主线（不规则波浪） */}
        <path d="M 10 10 Q 30 6 50 10 T 90 10 T 130 10 T 170 10 T 195 10" />
        {/* 第二条（错位、更轻） */}
        <path
          d="M 15 14 Q 35 12 55 14 T 95 14 T 135 14 T 175 14"
          strokeWidth="0.8"
          opacity="0.5"
        />
        {/* 装饰小点 */}
        <circle cx="100" cy="6" r="0.8" fill="currentColor" opacity="0.6" />
        <circle cx="50" cy="14" r="0.6" fill="currentColor" opacity="0.5" />
        <circle cx="150" cy="14" r="0.6" fill="currentColor" opacity="0.5" />
      </g>
    </svg>
  );
}

export default DividerHandDrawn;
