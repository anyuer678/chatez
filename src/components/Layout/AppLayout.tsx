import { useState, useEffect } from 'react';
import { Sidebar } from '../Sidebar';
import { ChatWindow } from '../Chat';
import { useChatStore } from '../../stores/chatStore';
import { SettingsModal } from '../Settings';
import type { SettingsTab } from '../Settings';
import { PromptMarketPanel } from '../Prompt';

export function AppLayout() {
  const { createSession } = useChatStore();
  const [showSettings, setShowSettings] = useState(false);
  const [initialSettingsTab, setInitialSettingsTab] = useState<SettingsTab>('api');
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showPromptMarket, setShowPromptMarket] = useState(false);

  // 打开提示词市场时锁住 body 滚动（移动端）
  useEffect(() => {
    if (showPromptMarket) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [showPromptMarket]);

  useEffect(() => {
    const checkMobile = () => {
      // 断点改为 768px（与 Tailwind md 对齐），桌面端 ≥768 显示双栏
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setShowSidebar(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 抽屉打开时锁定 body 滚动
  useEffect(() => {
    if (showSidebar && isMobile) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [showSidebar, isMobile]);

  // 移动端侧栏手势：从屏幕左缘右滑打开，左滑关闭
  useEffect(() => {
    if (!isMobile) return;

    let startX = 0;
    let startY = 0;
    let startT = 0;
    let tracking = false;

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      startX = t.clientX;
      startY = t.clientY;
      startT = Date.now();
      // 仅追踪从左缘 24px 内开始的横向手势
      tracking = startX <= 24;
    };

    const onEnd = (e: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      const dt = Date.now() - startT;
      // 必须足够快、足够远、且明显是横向手势
      if (dt > 600 || Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx)) return;
      if (!showSidebar && dx > 0) {
        setShowSidebar(true);
      } else if (showSidebar && dx < 0) {
        setShowSidebar(false);
      }
    };

    const onCancel = () => {
      tracking = false;
    };

    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchend', onEnd, { passive: true });
    document.addEventListener('touchcancel', onCancel, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchend', onEnd);
      document.removeEventListener('touchcancel', onCancel);
    };
  }, [isMobile, showSidebar]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        createSession();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        setInitialSettingsTab('api');
        setShowSettings(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setShowSidebar((prev) => !prev);
      }
      if (e.key === 'Escape') {
        if (showPromptMarket) {
          setShowPromptMarket(false);
        } else {
          setShowSettings(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createSession]);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: 'var(--bg-main)' }}
    >
      {/* 移动端 ≡ 按钮已迁移到 ChatWindow 的 Header 左侧 —— 让 Header 的 border-b 自然在按钮下方 */}

      {/* 遮罩层（移动端） */}
      {isMobile && showSidebar && (
        <div
          className="fixed inset-0 z-30 backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(28, 20, 10, 0.4)' }}
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* 侧边栏 */}
      <div
        className={`${
          isMobile
            ? `fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out ${
                showSidebar ? 'translate-x-0' : '-translate-x-full'
              }`
            : showSidebar
              ? 'relative'
              : 'hidden'
        }`}
      >
        <Sidebar
          isMobile={isMobile}
          onCloseMobileSidebar={() => setShowSidebar(false)}
          onSessionSelect={() => isMobile && setShowSidebar(false)}
          onOpenSettings={(tab?: SettingsTab) => {
            if (tab) setInitialSettingsTab(tab);
            setShowSettings(true);
          }}
          onOpenPromptMarket={() => {
            // 移动端先收起侧边栏，避免双层叠层
            if (isMobile) setShowSidebar(false);
            setShowPromptMarket(true);
          }}
        />
      </div>

      {/* 主内容区（含聊天区背景装饰） */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* 聊天区背景图已迁移到 ChatWindow 的 empty 状态 —— 避免被聊天消息区遮挡 */}

        <div className="relative z-10 flex-1 flex flex-col min-h-0">
          <ChatWindow
            onOpenSidebar={() => setShowSidebar(true)}
            showMobileMenuButton={isMobile && !showSidebar}
          />
        </div>
      </div>

      {/* 设置弹窗 */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        initialTab={initialSettingsTab}
      />

      {/* 提示词市场（全屏/抽屉，桌面端右侧抽屉，移动端全屏） */}
      <PromptMarketPanel
        isOpen={showPromptMarket}
        onClose={() => setShowPromptMarket(false)}
        isMobile={isMobile}
      />
    </div>
  );
}
