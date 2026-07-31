/**
 * 集中图片资源 manifest
 * 原始 PNG 位于 c:\Users\30816\Desktop\chatez\images\ 与 newimages\
 * 复制到 public/images/ 后以 /images/... 路径引用
 *
 * 注意：大图已用 sharp 压缩为 webp 格式（scripts/compress-images.cjs）
 * 体积缩小 95%+，解决 WebView 加载卡顿问题
 */
export const IMAGES = {
  /** 品牌 logo (方形，book+bubble+ChatEZ，圆角方块版) —— 用于移动端欢迎页、Logo 组件、Prompt 市场 */
  brandMarkV2: '/images/brand-mark-v2.webp',
  /** 桌面端欢迎页主图（女孩+猫+书桌+ChatEZ 标题） —— 移动端用 brandMarkV2 替代 */
  welcomeHero: '/images/welcome-hero.webp',
  /** 侧边栏底部装饰（睡猫+扶手椅+书架） */
  sidebarDecor: '/images/sidebar-decor.webp',
  /** 聊天区背景装饰（窗边书桌+台灯+植物） —— 桌面端全尺寸 8% 不透明，移动端底部 192px 5% 不透明 */
  decorWindow: '/images/decor-window.webp',
  /** 快捷提示区角落装饰（笔记本+钢笔+咖啡） —— 仅桌面端右上角显示，10% 不透明 */
  decorJournal: '/images/decor-journal.webp',
  /** 引言卡底层装饰（眼镜+书特写） —— 错位叠加在 quoteCard 右下角，15% 不透明 */
  quoteBg: '/images/quote-bg.webp',
  /** 引言卡主图（文字+书+眼镜+ChatEZ 签名一体） */
  quoteCard: '/images/quote-card.webp',
  /** 4 个功能模块图（含 icon + 中文标签一体） —— 用于欢迎页 4 模块、侧边栏模块导航 */
  moduleChat: '/images/module-chat.png',
  moduleBook: '/images/module-book.png',
  moduleQuill: '/images/module-quill.png',
  modulePuzzle: '/images/module-puzzle.png',
} as const;
