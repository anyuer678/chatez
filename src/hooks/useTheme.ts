import { useEffect } from 'react';
import { useConfigStore } from '../stores/configStore';

export function useTheme() {
  const { theme, fontSize } = useConfigStore((state) => state.ui);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
      // 深夜书房配色
      root.style.setProperty('--bg-main', '#1c140a');
      root.style.setProperty('--bg-sidebar', '#150f07');
      root.style.setProperty('--bg-card', '#241a0e');
      root.style.setProperty('--bg-input', '#1c140a');
      root.style.setProperty('--bg-hover', '#2d2010');
      root.style.setProperty('--bg-active', '#3a2a14');

      root.style.setProperty('--text-primary', '#f0d9a8');
      root.style.setProperty('--text-secondary', '#c4a878');
      root.style.setProperty('--text-muted', '#8a7558');
      root.style.setProperty('--text-placeholder', '#6b5638');

      root.style.setProperty('--border-light', '#3a2a14');
      root.style.setProperty('--border-medium', '#4d3820');

      root.style.setProperty('--accent', '#c8956c');
      root.style.setProperty('--accent-hover', '#d4a578');
      root.style.setProperty('--accent-light', 'rgba(200, 149, 108, 0.18)');
      root.style.setProperty('--accent-soft', '#d4a578');

      root.style.setProperty('--paper-yellow', '#3a2e1a');
      root.style.setProperty('--tape', '#5a4220');
      root.style.setProperty('--ink', '#f0d9a8');

      root.style.setProperty('--shadow-sm', '0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 1px rgba(0, 0, 0, 0.2)');
      root.style.setProperty('--shadow-md', '0 2px 4px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)');
      root.style.setProperty('--shadow-lg', '0 4px 8px rgba(0, 0, 0, 0.5), 0 12px 24px rgba(0, 0, 0, 0.4)');
    } else {
      root.classList.remove('dark');
      // 羊皮纸配色
      root.style.setProperty('--bg-main', '#f4ecd8');
      root.style.setProperty('--bg-sidebar', '#ede2c5');
      root.style.setProperty('--bg-card', '#faf3e0');
      root.style.setProperty('--bg-input', '#f4ecd8');
      root.style.setProperty('--bg-hover', '#e8dbb8');
      root.style.setProperty('--bg-active', '#ddc997');

      root.style.setProperty('--text-primary', '#3a2e1f');
      root.style.setProperty('--text-secondary', '#5c4a32');
      root.style.setProperty('--text-muted', '#8a7558');
      root.style.setProperty('--text-placeholder', '#b09870');

      root.style.setProperty('--border-light', '#d9c69a');
      root.style.setProperty('--border-medium', '#b89c6a');

      root.style.setProperty('--accent', '#8b6f47');
      root.style.setProperty('--accent-hover', '#6d5535');
      root.style.setProperty('--accent-light', 'rgba(139, 111, 71, 0.12)');
      root.style.setProperty('--accent-soft', '#c8956c');

      root.style.setProperty('--paper-yellow', '#f7e9b0');
      root.style.setProperty('--tape', '#e8c87a');
      root.style.setProperty('--ink', '#2c2418');

      root.style.setProperty('--shadow-sm', '0 1px 2px rgba(58, 46, 31, 0.08), 0 1px 1px rgba(58, 46, 31, 0.04)');
      root.style.setProperty('--shadow-md', '0 2px 4px rgba(58, 46, 31, 0.1), 0 4px 12px rgba(58, 46, 31, 0.06)');
      root.style.setProperty('--shadow-lg', '0 4px 8px rgba(58, 46, 31, 0.12), 0 12px 24px rgba(58, 46, 31, 0.1)');
    }

    // 字体大小
    root.style.setProperty('--font-size-base', `${fontSize}px`);
    root.style.fontSize = `${fontSize}px`;
  }, [theme, fontSize]);

  return { theme, fontSize };
}
