import { useEffect, useCallback } from 'react';

interface KeyBinding {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyBindings(bindings: KeyBinding[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const binding of bindings) {
        const ctrlMatch = binding.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = binding.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = binding.alt ? event.altKey : !event.altKey;
        const keyMatch = event.key.toLowerCase() === binding.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault();
          binding.action();
          return;
        }
      }
    },
    [bindings]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// 预定义快捷键
export const KEY_BINDINGS = {
  NEW_SESSION: { key: 'n', ctrl: true, description: '新建对话' },
  SETTINGS: { key: ',', ctrl: true, description: '打开设置' },
  SEARCH: { key: 'k', ctrl: true, description: '搜索' },
  TOGGLE_SIDEBAR: { key: 'b', ctrl: true, description: '切换侧边栏' },
  FOCUS_INPUT: { key: '/', description: '聚焦输入框' },
} as const;
