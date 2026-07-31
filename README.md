# Chatez

[![GitHub Pages](https://img.shields.io/badge/%F0%9F%8C%90-%E5%9C%A8%E7%BA%BF%E9%A2%84%E8%A7%88-2ea44f)](https://anyuer678.github.io/chatez/)
> ⚠️ **在线预览为演示模式**：仅展示界面设计（主题切换、Prompt 市场、Skill 列表均可浏览）。出于安全考虑，**演示版禁用了 API Key 配置与 AI 对话**——密钥绝不会进入静态页面。请下载安装包体验完整功能。

**可配置 Prompt + Skill 的 AI 工作台** — v1.14.1

支持 Web、Windows、Android 三端运行。提供多 Prompt 角色切换、Skill 技能系统、流式输出、会话持久化等功能。

## 功能特性

### 核心功能
- **多 Prompt 角色切换** — 内置面试官、翻译、故事等 Prompt，支持自定义创建/编辑
- **Skill 技能系统** — 命令触发（`/sql`、`/explain`）+ 自动识别，支持自定义 Skill
- **流式输出** — SSE 流式响应，实时显示 AI 生成内容
- **会话管理** — 多会话切换、自动标题生成、会话持久化（localStorage）

### 配置与设置
- **GenerationPanel** — 温度、Top-P、频率/存在惩罚、最大 Token 等参数独立调节
- **API 配置** — 支持 OpenAI / 自定义兼容接口，密钥管理与导出脱敏
- **主题切换** — 浅色 / 深色模式
- **快捷键** — `Ctrl+,` 打开设置、`Enter` / `Ctrl+Enter` 切换发送方式

### 界面
- 响应式布局，适配桌面和移动端
- Markdown 渲染 + 代码高亮
- 消息复制、重新生成

## 快速开始

### 环境要求
- Node.js >= 18
- npm >= 9

### 安装与运行
```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入 API Key

# 启动开发服务器
npm run dev
```

访问 http://localhost:3001 查看应用

## 构建

```bash
npm run build:web      # 构建 Web 版本 → dist/
npm run build:win      # 构建 Windows EXE（Tauri）
npm run build:android  # 构建 Android APK（Capacitor）
npm run build:all      # 构建全部平台
```

### 构建产物
- **Web**: `dist/` — 可直接部署到任意静态服务器
- **Windows**: `src-tauri/target/release/bundle/` — MSI / NSIS 安装包
- **Android**: `android/app/build/outputs/apk/` — 需签名后安装

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 状态管理 | Zustand |
| 样式 | Tailwind CSS |
| 桌面端 | Tauri 2.x |
| 移动端 | Capacitor (Android) |
| 测试 | Vitest |
| 构建 | Vite 5 |

## 平台支持

| 平台 | 格式 | 状态 |
|------|------|------|
| Web | HTML/CSS/JS | ✅ 完整支持 |
| Windows | EXE (Tauri) | ✅ 完整支持 |
| Android | APK (Capacitor) | ✅ 完整支持 |

## 项目结构

```
chatez/
├── src/                    # 源码（三端共享）
│   ├── components/         # UI 组件
│   │   ├── Chat/           # 对话相关（ChatWindow, InputBox, MessageBubble）
│   │   ├── Layout/         # 布局（AppLayout, Sidebar）
│   │   └── Settings/       # 设置（SettingsModal, GenerationPanel）
│   ├── stores/             # Zustand 状态管理
│   ├── lib/                # 核心逻辑（Skill 引擎）
│   ├── utils/              # 工具函数（API 客户端）
│   ├── constants/          # 常量定义（默认 Prompt/Skill）
│   ├── hooks/              # 自定义 Hooks
│   └── types/              # TypeScript 类型
├── src-tauri/              # Tauri 配置（Windows）
├── android/                # Capacitor 配置（Android）
├── public/                 # 静态资源
├── docs/                   # 文档
├── build.ps1               # 构建脚本
├── start.ps1               # 启动脚本
├── index.html              # 入口 HTML
├── package.json            # 项目配置
└── vitest.config.ts        # 测试配置
```

## 开发指南

详见 [开发指导书](docs/development-guide.md)

## 更新日志

详见 [CHANGELOG.md](CHANGELOG.md)

## 安全说明

- **API Key 加密存储** — 密钥经 AES-GCM 加密后存入本地，加密密钥仅存在于当前会话（关闭应用或更换标签页后需重新输入）。即便如此，密钥仍驻留于浏览器内存，请勿在公共设备上使用
- **API Key 责任自负** — 请妥善保管密钥，勿将含密钥的配置文件（如 `.env`）提交到公共仓库
- **依赖已知风险** — 详见 [CHANGELOG.md](CHANGELOG.md) 的"已知风险"章节，部分第三方库存在中等级别漏洞，修复需破坏性升级，计划随下次大版本重构处理

## 免责声明

本项目仅供学习交流与演示用途，不构成任何形式的商业服务或技术承诺。软件按「现状」提供，不作任何明示或暗示的保证，包括但不限于适销性、特定用途适用性与非侵权性。本项目依赖第三方 AI 服务（如 OpenAI），相关服务条款、数据使用政策与费用由对应服务商决定，作者不对第三方服务的行为与后果负责。

您理解并同意：使用本项目即表示您自行承担全部风险。您调用 AI 服务所产生的内容（包括但不限于文本、代码、图片）由 AI 模型生成，可能存在错误、偏见或不准确之处，作者不对其准确性、完整性或实用性作任何担保。如您在使用过程中发现缺陷或问题，欢迎通过 [GitHub Issues](../../issues) 反馈，但作者不因使用本软件所直接或间接产生的任何损失（包括但不限于数据丢失、业务中断、第三方索赔）承担责任。

本项目**以功能演示与学习交流为主要目的**，其架构设计、安全基线、容错机制与性能表现均未按生产级标准进行验证与加固，**不适用于实际生产环境或关键业务场景**。任何将本项目部署于生产系统、对外提供服务、或将其接入真实业务工作流的做法，均属使用者的自主决策行为；由此产生的任何直接或间接不良后果，包括但不限于服务中断、数据损坏或泄露、业务损失、合规风险、以及因依赖本软件而引发的第三方纠纷，**开发者均不承担任何责任**。若您确有生产级使用需求，请在充分评估与自行加固（包括但不限于安全审计、压力测试、代码审查）后，自行承担相应风险。

## 开源协议

本项目基于 [GNU General Public License v3.0](LICENSE) 开源。

### 协议要点
- ✅ 自由使用、修改、分发
- ✅ 可用于商业服务（如 SaaS）
- ⚠️ 衍生作品必须以相同许可证 (GPL v3) 开源
- ❌ 禁止将修改后的代码闭源分发
