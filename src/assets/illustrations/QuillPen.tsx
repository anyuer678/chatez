import { CSSProperties } from 'react';

interface IllustrationProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * 羽毛笔插画 —— 倾斜的羽毛笔
 * 用于欢迎页主标题前 icon
 */
export function QuillPen({ size = 28, className = '', style }: IllustrationProps) {
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
        <filter id="rough-quill" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="13" />
          <feDisplacementMap in="SourceGraphic" scale="2" />
        </filter>
      </defs>
      <g
        filter="url(#rough-quill)"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* 羽毛主轴（从右上到左下） */}
        <path d="M 82 18 Q 60 35 35 60 L 28 78 L 30 70 Q 50 45 78 20 Z" />
        {/* 羽轴中心线 */}
        <path d="M 80 20 Q 55 40 32 70" strokeWidth="1.2" />

        {/* 羽毛分支（左侧） */}
        <g strokeWidth="1.2">
          <path d="M 75 25 Q 70 30 65 28" />
          <path d="M 70 32 Q 64 38 58 36" />
          <path d="M 64 40 Q 58 46 52 44" />
          <path d="M 58 48 Q 52 54 46 52" />
          <path d="M 52 56 Q 46 62 40 60" />
        </g>
        {/* 羽毛分支（右侧） */}
        <g strokeWidth="1.2">
          <path d="M 75 25 Q 80 30 84 28" />
          <path d="M 70 32 Q 76 38 80 36" />
          <path d="M 64 40 Q 70 46 74 44" />
          <path d="M 58 48 Q 64 54 68 52" />
          <path d="M 52 56 Q 58 62 62 60" />
        </g>

        {/* 笔尖（墨水尖） */}
        <path d="M 35 60 L 28 78 L 32 70 Z" fill="currentColor" fillOpacity="0.3" />
        <path d="M 28 78 L 25 82" strokeWidth="2.2" />
        {/* 笔尖墨滴 */}
        <circle cx="22" cy="85" r="1.5" fill="currentColor" fillOpacity="0.6" />
      </g>
    </svg>
  );
}

export default QuillPen;
