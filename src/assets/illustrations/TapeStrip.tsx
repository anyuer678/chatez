import { CSSProperties } from 'react';

interface IllustrationProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * 胶带插画 —— 撕边的胶带条
 * 用于便签顶部装饰
 */
export function TapeStrip({ size = 60, className = '', style }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={(size * 40) / 100}
      viewBox="0 0 100 40"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="rough-tape" x="-5%" y="-10%" width="110%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="17" />
          <feDisplacementMap in="SourceGraphic" scale="2.4" />
        </filter>
      </defs>
      <g filter="url(#rough-tape)">
        {/* 胶带主体（半透明矩形，带撕边） */}
        <path
          d="M 4 8 L 6 4 L 10 6 L 14 4 L 18 7 L 22 5 L 26 8 L 30 5 L 34 7 L 38 4 L 42 7 L 46 5 L 50 8 L 54 5 L 58 7 L 62 4 L 66 7 L 70 5 L 74 8 L 78 5 L 82 7 L 86 4 L 90 7 L 94 5 L 96 8 L 96 32 L 94 35 L 90 33 L 86 35 L 82 33 L 78 36 L 74 33 L 70 35 L 66 33 L 62 36 L 58 33 L 54 35 L 50 33 L 46 36 L 42 33 L 38 35 L 34 33 L 30 36 L 26 33 L 22 35 L 18 33 L 14 36 L 10 33 L 6 35 L 4 32 Z"
          fill="currentColor"
          fillOpacity="0.25"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
        />
        {/* 胶带反光线 */}
        <path
          d="M 10 14 L 90 14"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.4"
        />
      </g>
    </svg>
  );
}

export default TapeStrip;
