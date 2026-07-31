import { IS_DEMO_MODE, DEMO_NOTICE } from '../../config/demo';

/**
 * DemoBanner — 演示模式顶部横幅（仅演示模式构建时渲染）
 */
export function DemoBanner() {
  if (!IS_DEMO_MODE) return null;
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        background: '#b85450',
        color: '#fff',
        textAlign: 'center',
        padding: '6px 12px',
        fontSize: '12px',
        fontFamily: 'inherit',
        letterSpacing: '0.02em',
      }}
    >
      ⚠️ {DEMO_NOTICE}
    </div>
  );
}
