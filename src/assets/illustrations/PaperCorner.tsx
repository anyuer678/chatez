import { CSSProperties } from 'react';

interface IllustrationProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * 折角插画 —— 卡片右上角的折角
 * 用于便签/卡片装饰
 */
export function PaperCorner({ size = 24, className = '', style }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="rough-corner" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="19" />
          <feDisplacementMap in="SourceGraphic" scale="2" />
        </filter>
      </defs>
      <g
        filter="url(#rough-corner)"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* 折角（三角形） */}
        <path d="M 12 12 L 48 12 L 48 48 Z" fillOpacity="0.15" />
        {/* 折线 */}
        <path d="M 12 12 L 48 48" strokeWidth="1.2" fill="none" opacity="0.5" />
      </g>
    </svg>
  );
}

export default PaperCorner;
