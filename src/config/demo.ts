/**
 * demo.ts — 演示模式开关
 *
 * 静态预览（GitHub Pages）使用的构建变体：
 * - 禁止配置 API Key（密钥绝不进入静态页面）
 * - 禁止发起 AI 对话
 * - 保留完整 UI（主题、Prompt 市场、Skill 列表等均可浏览）
 *
 * 通过 `VITE_DEMO_MODE=true npm run build:demo` 构建。
 */
export const IS_DEMO_MODE: boolean = import.meta.env.VITE_DEMO_MODE === 'true';

export const DEMO_NOTICE: string =
  '演示模式：仅展示界面设计，AI 对话与 API 配置已禁用。请下载安装包体验完整功能。';
