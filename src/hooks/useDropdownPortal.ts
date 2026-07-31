import { useState, useEffect, useCallback, RefObject } from 'react';

export interface DropdownPosition {
  top: number;
  left: number;
  width: number;
  /**
   * 是否有空间向下展开（false 表示应该向上 flip）
   */
  canOpenDown: boolean;
}

/**
 * 通用下拉定位 hook
 *
 * 解决侧边栏 overflow-hidden 截断下拉菜单的问题：
 *   - 计算 anchor 元素在视口中的位置
 *   - 检测是否有足够空间向下展开
 *   - 监听 scroll / resize 实时更新位置
 *
 * 用法：
 *   const anchorRef = useRef<HTMLDivElement>(null);
 *   const { isOpen, setIsOpen, position } = useDropdownPortal(anchorRef);
 *   return createPortal(<div style={...position}>...</div>, document.body);
 */
export function useDropdownPortal(anchorRef: RefObject<HTMLElement | null>) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<DropdownPosition>({
    top: 0,
    left: 0,
    width: 0,
    canOpenDown: true,
  });

  const updatePosition = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    // 期望下拉高度约 280px（max-h-56/60）
    const expectedHeight = 280;
    const canOpenDown = spaceBelow >= Math.min(expectedHeight, spaceAbove + expectedHeight);

    setPosition({
      top: canOpenDown ? rect.bottom + 4 : rect.top - 4,
      left: rect.left,
      width: rect.width,
      canOpenDown,
    });
  }, [anchorRef]);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    // 监听所有可能改变位置的事件
    const events: (keyof WindowEventMap)[] = ['scroll', 'resize'];
    events.forEach((evt) => window.addEventListener(evt, updatePosition, true));

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, updatePosition, true));
    };
  }, [isOpen, updatePosition]);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);

  return { isOpen, setIsOpen, toggle, close, position };
}
