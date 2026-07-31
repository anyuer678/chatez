import { CSSProperties } from 'react';

interface IllustrationProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * 盆栽插画 —— 装饰用小植物
 * 用于侧边栏 logo 区域
 */
export function PlantLeaf({ size = 28, className = '', style }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="rough-plant" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="9" />
          <feDisplacementMap in="SourceGraphic" scale="2" />
        </filter>
      </defs>
      <g
        filter="url(#rough-plant)"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* 花盆 */}
        <path d="M 30 70 L 35 95 L 65 95 L 70 70 Z" strokeWidth="2" />
        {/* 花盆口 */}
        <ellipse cx="50" cy="70" rx="20" ry="3" strokeWidth="1.5" />
        {/* 土壤 */}
        <path d="M 35 72 Q 50 74 65 72" strokeWidth="0.8" opacity="0.6" />

        {/* 主茎 */}
        <path d="M 50 70 Q 50 50 48 30" strokeWidth="1.5" />

        {/* 叶子（左侧大叶） */}
        <path d="M 48 50 Q 30 45 25 30 Q 35 28 45 38 Q 48 45 48 50 Z" />
        <path d="M 30 36 L 42 42" strokeWidth="0.8" opacity="0.6" />

        {/* 叶子（右侧大叶） */}
        <path d="M 50 45 Q 70 40 78 25 Q 65 22 55 32 Q 50 40 50 45 Z" />
        <path d="M 70 30 L 56 38" strokeWidth="0.8" opacity="0.6" />

        {/* 顶部小叶 */}
        <path d="M 48 30 Q 42 22 45 12 Q 50 16 50 24" />
        <path d="M 50 28 Q 58 18 55 8 Q 50 14 50 22" />
        <path d="M 48 18 Q 52 12 56 16" strokeWidth="0.8" opacity="0.6" />
      </g>
    </svg>
  );
}

export default PlantLeaf;
