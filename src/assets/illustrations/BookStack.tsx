import { CSSProperties } from 'react';

interface IllustrationProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * 书堆插画 —— 3 本横叠的书
 * 用于关于页底部装饰
 */
export function BookStack({ size = 80, className = '', style }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="rough-bookstack" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="11" />
          <feDisplacementMap in="SourceGraphic" scale="2" />
        </filter>
      </defs>
      <g
        filter="url(#rough-bookstack)"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* 底部书（最厚） */}
        <rect x="14" y="92" width="92" height="16" rx="1" strokeWidth="2" />
        {/* 书脊装饰线 */}
        <path d="M 20 96 L 100 96" strokeWidth="0.6" opacity="0.6" />
        <path d="M 20 104 L 100 104" strokeWidth="0.6" opacity="0.6" />
        {/* 右侧书页 */}
        <path d="M 102 93 L 106 95 L 106 107 L 102 108" strokeWidth="1.2" />

        {/* 中间书（略小，错位） */}
        <rect x="22" y="76" width="76" height="14" rx="1" strokeWidth="2" />
        <path d="M 28 80 L 92 80" strokeWidth="0.6" opacity="0.6" />
        <path d="M 28 86 L 92 86" strokeWidth="0.6" opacity="0.6" />
        <path d="M 94 77 L 98 79 L 98 89 L 94 90" strokeWidth="1.2" />

        {/* 顶部书（最小，再错位） */}
        <rect x="30" y="62" width="60" height="12" rx="1" strokeWidth="2" />
        <path d="M 36 65 L 84 65" strokeWidth="0.6" opacity="0.6" />
        <path d="M 36 70 L 84 70" strokeWidth="0.6" opacity="0.6" />
        <path d="M 86 63 L 90 65 L 90 73 L 86 74" strokeWidth="1.2" />

        {/* 顶部书上的茶杯轮廓（小型） */}
        <path d="M 50 50 L 50 60 Q 50 62 52 62 L 68 62 Q 70 62 70 60 L 70 50 Z" strokeWidth="1.5" />
        <path d="M 70 53 Q 74 53 74 56 Q 74 59 70 59" strokeWidth="1.2" />
        <path d="M 48 50 L 72 50" strokeWidth="1.2" />
        {/* 蒸汽 */}
        <path d="M 56 44 Q 58 42 56 38 Q 54 36 56 32" strokeWidth="0.8" opacity="0.6" />
        <path d="M 64 44 Q 66 42 64 38 Q 62 36 64 32" strokeWidth="0.8" opacity="0.6" />
      </g>
    </svg>
  );
}

export default BookStack;
