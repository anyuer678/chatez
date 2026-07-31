import { CSSProperties } from 'react';

interface IllustrationProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * 卷轴端插画 —— 上下两端的卷曲
 * 用于引言/blockquote 两端装饰
 */
export function ScrollEdge({ size = 100, className = '', style }: IllustrationProps) {
  return (
    <svg
      width={size * 0.3}
      height={size}
      viewBox="0 0 30 100"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="rough-scroll" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="23" />
          <feDisplacementMap in="SourceGraphic" scale="2" />
        </filter>
      </defs>
      <g
        filter="url(#rough-scroll)"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* 顶部卷边 */}
        <path d="M 4 8 Q 4 4 8 4 L 22 4 Q 26 4 26 8 L 26 14 Q 26 16 24 16 L 6 16 Q 4 16 4 14 Z" fillOpacity="0.4" />
        <path d="M 8 10 Q 12 8 22 10" strokeWidth="0.8" fill="none" opacity="0.6" />
        {/* 连接线 */}
        <path d="M 15 18 L 15 82" strokeWidth="1" fill="none" opacity="0.5" />
        {/* 底部卷边 */}
        <path d="M 4 86 Q 4 84 6 84 L 24 84 Q 26 84 26 86 L 26 92 Q 26 96 22 96 L 8 96 Q 4 96 4 92 Z" fillOpacity="0.4" />
        <path d="M 8 90 Q 12 88 22 90" strokeWidth="0.8" fill="none" opacity="0.6" />
      </g>
    </svg>
  );
}

export default ScrollEdge;
