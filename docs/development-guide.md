# Chatez 项目开发指导书

> **版本**: 1.13.0  
> **更新日期**: 2026-06-29  
> **项目定位**: 可配置 Prompt + Skill 的 AI 工作台

---

## 项目状态

### 已实现功能 (v1.9)

| 功能 | 状态 | 说明 |
|------|------|------|
| Chat 界面 | ✅ 完成 | 消息列表、输入框、Markdown 渲染、代码块复制 |
| Prompt 系统 | ✅ 完成 | 角色选择、持久化、应用到 API、导入导出 |
| Skill 系统 | ✅ 完成 | 命令触发、自动识别、自定义 Skill、导入导出 |
| 流式输出 | ✅ 完成 | SSE 流式响应 |
| 会话持久化 | ✅ 完成 | localStorage 自动保存 |
| 配置管理 | ✅ 完成 | 界面设置、导入/导出 |
| 主题切换 | ✅ 完成 | 浅色/深色主题 |
| API 配置 | ✅ 完成 | 界面配置、多模型支持 |
| 快捷键 | ✅ 完成 | Ctrl+N/,/B 等全局快捷键 |
| 对话导出 | ✅ 完成 | JSON 格式导出 |
| 消息搜索 | ✅ 完成 | 侧边栏搜索功能 |
| 消息操作 | ✅ 完成 | 复制、重新生成 |
| 智能标题 | ✅ 完成 | AI 自动生成会话标题 |
| 响应式布局 | ✅ 完成 | 移动端适配、侧边栏折叠 |
| Prompt 导入导出 | ✅ 完成 | 自定义 Prompt 备份分享 |
| 自定义 Skill | ✅ 完成 | 创建/编辑/删除自定义 Skill |
| Skill 导入导出 | ✅ 完成 | 自定义 Skill 备份分享 |
| 代码块复制 | ✅ 完成 | 代码块一键复制 |
| 单元测试 | ✅ 完成 | 22 个测试用例 |

### 待实现功能

| 功能 | 优先级 | 说明 |
|------|--------|------|
| Android APK | 高 | 需要 Android SDK |
| Windows EXE | 高 | 需要 Rust 环境 |
| 插件系统 | 低 | 第三方插件扩展 |

---

## 更新日志

### v1.13.0 (2026-06-29)
- 更新测试用例适配新接口
- 测试总数：54 个

### v1.12.0 (2026-06-29)
- 优化构建配置
- 添加代码分割
- 移除生产环境 sourcemap

### v1.11.0 (2026-06-28)
- ConfigStore 测试用例（9 个）
- 测试总数：47 个

### v1.10.0 (2026-06-28)
- SkillStore 测试用例（16 个）
- 测试总数：38 个

### v1.9.0 (2026-06-28)
- 简化 SettingsModal 样式
- 优化表单控件
- 统一深色模式适配

### v1.8.0 (2026-06-28)
- 简化 PromptSelector 样式
- 简化 InputBox 样式
- 简化 MessageBubble 样式
- 统一组件风格

### v1.7.0 (2026-06-28)
- 移除欢迎页面
- 移除不必要动画
- 简化全局样式
- 减小 CSS 体积

### v1.6.0 (2026-06-28)
- 美化全局样式
- 添加 Inter 字体
- 优化深色主题

### v1.5.0 (2026-06-28)
- 单元测试框架
- ChatStore 测试用例
- PromptStore 测试用例
- SkillEngine 测试用例

### v1.4.0 (2026-06-28)
- 版本管理器脚本
- 便携版构建脚本
- 快速启动脚本
- 添加代码块一键复制功能
- 优化移动端输入体验
- 添加欢迎页面快速开始卡片

### v1.3.0 (2026-06-27)
- 实现自定义 Skill 功能
- 添加 Skill 导入导出
- 添加 Skill 管理界面
- 更新 Skill 引擎使用 store 数据

### v1.2.0 (2026-06-27)
- 添加响应式布局支持
- 实现 Prompt 导入导出
- 优化移动端侧边栏
- 添加遮罩层点击关闭

### v1.1.0 (2026-06-27)
- 实现会话持久化（localStorage）
- 添加 Skill 引擎核心逻辑
- 实现命令触发系统（/sql 等）
- 添加命令提示面板
- 实现消息复制和重新生成
- 添加智能标题生成
- 修复 Prompt 和主题持久化

### v1.0.0 (2026-06-27)
- 项目初始化
- 基础 Chat 界面
- Prompt 角色选择器
- 流式输出支持
- API 客户端封装
- 设置界面
- 主题切换（浅色/深色）
- 快捷键支持
- 版本备份机制

---

## 一、项目概述

### 1.1 核心定义

```
Chatez = 可配置 Prompt + Skill 的 AI 工作台
```

**不是**：ChatGPT 客户端、普通聊天软件  
**而是**：AI 行为可被配置的软件系统

### 1.2 核心理念

| 概念 | 定义 | 作用 |
|------|------|------|
| Prompt | 人格/能力配置 | 定义 AI 的行为模式 |
| Skill | 行为扩展插件 | 执行特定任务 |
| Chat | 执行界面 | 用户交互入口 |

### 1.3 与传统聊天软件的区别

```
传统聊天软件：用户 → 模型 → 回复
Chatez：用户 → [Prompt配置] → [Skill调度] → 模型 → 回复
```

---

## 二、系统架构

### 2.1 三层架构

```
┌─────────────────────────────────────────────────────────┐
│                      UI 层                               │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐     │
│  │ Chat界面  │  │ Prompt选择器  │  │ Skill触发按钮 │     │
│  └──────────┘  └──────────────┘  └───────────────┘     │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                  核心调度层 (Core Engine)                 │
│  ┌──────────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │Prompt Manager│  │ Skill Engine│  │Context Manager│  │
│  └──────────────┘  └─────────────┘  └───────────────┘  │
│  ┌──────────────┐                                      │
│  │Message Router│                                      │
│  └──────────────┘                                      │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                     AI API 层                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │  OpenAI  │  │   豆包    │  │   通义   │  │ 本地模型│ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 2.2 数据流设计

```
用户输入
   ↓
选择 Prompt（可选）
   ↓
Skill 是否触发？
   ↓
构建最终 Prompt
   ↓
发送 API
   ↓
流式返回
   ↓
写入 Chat History
```

### 2.3 三端构建方案

```
┌─────────────────────────────────────────────────────────┐
│                 核心代码 (React + TypeScript)             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌──────────┐    ┌──────────────┐    ┌─────────────┐  │
│   │   Vite   │    │   Capacitor  │    │    Tauri    │  │
│   │  构建Web │    │    打包 APK  │    │   打包 EXE  │  │
│   └──────────┘    └──────────────┘    └─────────────┘  │
│        ↓                ↓                   ↓          │
│     网页端          Android APK         Windows EXE     │
└─────────────────────────────────────────────────────────┘
```

| 平台 | 工具 | 产物 | 大小预估 |
|------|------|------|----------|
| Web | Vite | `dist/` 文件夹 | ~2MB |
| Android | Capacitor | `chatez.apk` | ~15-20MB |
| Windows | Tauri | `chatez.exe` | ~5-10MB |

**构建命令**：
```bash
npm run build:web        # Web 端
npm run build:android    # Android APK
npm run build:windows    # Windows EXE
npm run build:all        # 全部构建
```

---

## 三、目录结构规范

遵循前端开发标准，采用分层职责结构：

```
chatez/
├── src/                          # 源码（三端共享）
│   ├── components/               # 通用 UI 组件
│   │   ├── Chat/                 # 聊天相关组件
│   │   ├── Prompt/               # Prompt 选择器组件
│   │   ├── Settings/             # 设置界面组件
│   │   ├── Sidebar/              # 侧边栏组件
│   │   └── Layout/               # 布局组件
│   ├── hooks/                    # 自定义 Hooks
│   │   ├── useTheme.ts           # 主题 Hook
│   │   └── useKeyBindings.ts     # 快捷键 Hook
│   ├── stores/                   # 状态管理
│   │   ├── chatStore.ts          # 聊天状态（持久化）
│   │   ├── promptStore.ts        # Prompt 状态（持久化）
│   │   ├── skillStore.ts         # Skill 状态
│   │   └── configStore.ts        # 配置状态（持久化）
│   ├── lib/                      # 核心业务逻辑
│   │   └── skill-engine.ts       # Skill 引擎
│   ├── utils/                    # 工具函数
│   │   └── api-client.ts         # API 客户端（支持流式）
│   ├── constants/                # 常量定义
│   │   ├── default-prompts.ts    # 内置 Prompt
│   │   ├── default-skills.ts     # 内置 Skill
│   │   └── config.ts             # 配置常量
│   ├── types/                    # TypeScript 类型定义
│   │   ├── prompt.ts             # Prompt 类型
│   │   ├── skill.ts              # Skill 类型
│   │   └── chat.ts               # Chat 类型
│   ├── assets/                   # 静态资源
│   └── styles/                   # 全局样式（支持主题）
├── src-tauri/                    # Tauri 配置（打包 EXE）
│   ├── Cargo.toml                # Rust 依赖配置
│   ├── tauri.conf.json           # Tauri 配置文件
│   └── src/                      # Rust 源码
├── android/                      # Capacitor Android 项目
│   ├── app/                      # Android 应用
│   ├── build.gradle              # Gradle 配置
│   └── capacitor.settings.gradle # Capacitor 配置
├── tests/                        # 测试文件（镜像 src 结构）
├── config/                       # 配置文件
├── scripts/                      # 构建/部署脚本
│   ├── build.ps1                 # 统一构建脚本（web/win/android/portable/backup/versions）
│   ├── start.ps1                 # 快速启动脚本
│   └── check-env.ps1             # 环境检查脚本
├── backups/                      # 本地备份目录（不上传 Git）
│   ├── releases/                 # 发布版本备份
│   │   ├── v1.0.0/              # 版本号目录
│   │   │   ├── android/         # APK 文件
│   │   │   ├── windows/         # EXE 文件
│   │   │   └── source/          # 核心源代码压缩包
│   │   └── v1.1.0/
│   └── snapshots/                # 快照备份
└── docs/                         # 文档
    ├── prompts/                  # Prompt 文档
    └── skills/                   # Skill 文档
```

---

## 四、版本备份规范

### 4.1 备份策略

**重要原则**：每次版本开发完毕后，必须备份以下内容到本地，**不上传 Git**。

| 备份内容 | 说明 | 存储位置 |
|----------|------|----------|
| Web 文件 | Web 构建产物 | `backups/releases/{version}/web/` |
| APK 文件 | Android 构建产物 | `backups/releases/{version}/android/` |
| EXE 文件 | Windows 构建产物 | `backups/releases/{version}/windows/` |
| 核心源代码 | 关键源代码压缩包 | `backups/releases/{version}/source/` |

### 4.2 备份流程

```
版本开发完成
   ↓
运行构建命令
   ↓
执行备份脚本
   ↓
验证备份完整性
   ↓
记录版本日志
```

### 4.3 备份目录结构

```
backups/
├── releases/                     # 正式发布版本
│   ├── v1.0.0/                  # 版本号
│   │   ├── web/
│   │   │   └── dist/            # Web 构建产物
│   │   ├── android/
│   │   │   └── chatez-v1.0.0.apk
│   │   ├── windows/
│   │   │   └── chatez-v1.0.0.exe
│   │   └── source/
│   │       └── chatez-source-v1.0.0.zip
│   └── v1.1.0/
│       └── ...
└── snapshots/                    # 开发快照（可选）
    └── 2026-06-27/
        └── ...
```

### 4.4 构建脚本

所有构建、备份、版本管理功能已合并到统一的 `scripts/build.ps1` 脚本中：

```powershell
# 构建 Web 版本
.\scripts\build.ps1 web -Version 1.0.0

# 构建 Windows EXE
.\scripts\build.ps1 win -Version 1.0.0

# 构建 Android APK
.\scripts\build.ps1 android -Version 1.0.0

# 构建便携版
.\scripts\build.ps1 portable -Version 1.0.0

# 全平台构建
.\scripts\build.ps1 all -Version 1.0.0

# 备份当前版本
.\scripts\build.ps1 backup -Version 1.0.0

# 查看版本列表
.\scripts\build.ps1 versions

# 查看当前版本
.\scripts\build.ps1 current

# 切换版本
.\scripts\build.ps1 switch -Version 1.0.0
```

### 4.5 .gitignore 配置

```gitignore
# 备份目录（本地保留，不上传）
backups/

# 构建产物
build/
dist/
*.apk
*.exe
*.dmg
*.app
```

### 4.6 版本日志模板

```markdown
# 版本日志

## v1.0.0 (2026-06-27)

### 新增
- 基础 Chat 界面
- Prompt 选择功能
- 流式输出支持

### 备份信息
- APK: backups/releases/v1.0.0/android/chatez-v1.0.0.apk
- EXE: backups/releases/v1.0.0/windows/chatez-v1.0.0.exe
- 源码: backups/releases/v1.0.0/source/chatez-source-v1.0.0.zip
```

---

## 五、核心模块设计

### 5.1 Prompt 系统

#### 数据结构

```typescript
// types/prompt.ts
export interface Prompt {
  id: string;                    // 唯一标识
  name: string;                  // 显示名称
  description: string;           // 功能描述
  systemPrompt: string;          // 系统提示词
  temperature: number;           // 温度参数 (0-2)
  memoryMode: 'session' | 'persistent';  // 记忆模式
  tags: string[];                // 标签
  isBuiltIn: boolean;            // 是否内置
  createdAt: string;             // 创建时间
  updatedAt: string;             // 更新时间
}
```

#### 内置 Prompt 模板

```typescript
// constants/default-prompts.ts
export const DEFAULT_PROMPTS: Prompt[] = [
  {
    id: 'learning_tutor',
    name: '学习导师',
    description: '严谨但易懂的学习辅导',
    systemPrompt: `你是一个严谨但易懂的学习导师。

规则：
- 先解释核心概念
- 再给例子
- 最后给练习题
- 不要一次讲太多
- 用户不懂就换角度解释`,
    temperature: 0.7,
    memoryMode: 'session',
    tags: ['learning', 'education'],
    isBuiltIn: true,
    createdAt: '2026-06-27',
    updatedAt: '2026-06-27'
  },
  {
    id: 'coding_assistant',
    name: '编程助手',
    description: '资深软件工程师',
    systemPrompt: `你是一个资深软件工程师。

要求：
- 优先给可运行代码
- 解释关键逻辑
- 指出潜在bug
- 提供优化建议`,
    temperature: 0.3,
    memoryMode: 'session',
    tags: ['coding', 'development'],
    isBuiltIn: true,
    createdAt: '2026-06-27',
    updatedAt: '2026-06-27'
  },
  {
    id: 'exam_reviewer',
    name: '考试复习模式',
    description: '考试冲刺辅导老师',
    systemPrompt: `你是一个考试冲刺辅导老师。

目标：
- 用最少时间覆盖最重要考点
- 重点讲"必考点"
- 自动生成记忆口诀
- 出模拟题`,
    temperature: 0.5,
    memoryMode: 'session',
    tags: ['exam', 'review'],
    isBuiltIn: true,
    createdAt: '2026-06-27',
    updatedAt: '2026-06-27'
  },
  {
    id: 'writing_polisher',
    name: '写作润色',
    description: '专业编辑',
    systemPrompt: `你是一个专业编辑。

任务：
- 保留原意
- 提升逻辑性
- 删除废话
- 让表达更清晰有力`,
    temperature: 0.6,
    memoryMode: 'session',
    tags: ['writing', 'editing'],
    isBuiltIn: true,
    createdAt: '2026-06-27',
    updatedAt: '2026-06-27'
  },
  {
    id: 'cs_teacher',
    name: '计算机专业模式',
    description: '数据库/操作系统/计算机网络专家',
    systemPrompt: `你是计算机专业老师，擅长数据库、操作系统、计算机网络。

要求：
- 用结构化方式讲解
- 结合考试重点
- 给出典型题型
- 不讲废话`,
    temperature: 0.4,
    memoryMode: 'session',
    tags: ['computer-science', 'database', 'os', 'network'],
    isBuiltIn: true,
    createdAt: '2026-06-27',
    updatedAt: '2026-06-27'
  }
];
```

### 5.2 Skill 系统

#### 数据结构

```typescript
// types/skill.ts
export interface Skill {
  id: string;                    // 唯一标识
  name: string;                  // 显示名称
  trigger: string;               // 触发命令 (如 /sql)
  description: string;           // 功能描述
  systemPrompt: string;          // 专用提示词
  inputTransform?: string;       // 输入转换函数名
  isBuiltIn: boolean;            // 是否内置
  createdAt: string;
  updatedAt: string;
}

export type SkillTriggerType = 'command' | 'auto' | 'button';
```

#### 内置 Skill 模板

```typescript
// constants/default-skills.ts
export const DEFAULT_SKILLS: Skill[] = [
  {
    id: 'sql_generator',
    name: 'SQL 生成器',
    trigger: '/sql',
    description: '把自然语言转SQL',
    systemPrompt: `你是SQL专家。

任务：
- 把自然语言转换为SQL
- 使用标准SQL语法
- 给出解释`,
    inputTransform: 'wrapSqlQuery',
    isBuiltIn: true,
    createdAt: '2026-06-27',
    updatedAt: '2026-06-27'
  },
  {
    id: 'knowledge_summarizer',
    name: '知识总结器',
    trigger: '/summary',
    description: '信息压缩专家',
    systemPrompt: `你是信息压缩专家。

任务：
- 提取核心要点
- 分层总结（1级/2级/3级）
- 删除重复信息`,
    isBuiltIn: true,
    createdAt: '2026-06-27',
    updatedAt: '2026-06-27'
  },
  {
    id: 'question_analyzer',
    name: '题目解析器',
    trigger: '/analyze',
    description: '考试解析老师',
    systemPrompt: `你是考试解析老师。

任务：
- 逐步分析题目
- 标注考点
- 给出标准解法`,
    isBuiltIn: true,
    createdAt: '2026-06-27',
    updatedAt: '2026-06-27'
  },
  {
    id: 'todo_generator',
    name: 'Todo 生成器',
    trigger: '/todo',
    description: '任务拆解助手',
    systemPrompt: `你是任务拆解助手。

任务：
- 把用户目标拆成可执行步骤
- 按优先级排序
- 输出清晰todo列表`,
    isBuiltIn: true,
    createdAt: '2026-06-27',
    updatedAt: '2026-06-27'
  }
];
```

### 5.3 核心管理器

```typescript
// lib/prompt-manager.ts
import { Prompt } from '../types/prompt';
import { DEFAULT_PROMPTS } from '../constants/default-prompts';

export class PromptManager {
  private prompts: Map<string, Prompt> = new Map();

  constructor() {
    this.loadBuiltInPrompts();
  }

  private loadBuiltInPrompts(): void {
    DEFAULT_PROMPTS.forEach(prompt => {
      this.prompts.set(prompt.id, prompt);
    });
  }

  getPrompt(id: string): Prompt | undefined {
    return this.prompts.get(id);
  }

  getAllPrompts(): Prompt[] {
    return Array.from(this.prompts.values());
  }

  getPromptsByTag(tag: string): Prompt[] {
    return this.getAllPrompts().filter(p => p.tags.includes(tag));
  }

  addPrompt(prompt: Prompt): void {
    this.prompts.set(prompt.id, prompt);
  }

  removePrompt(id: string): boolean {
    return this.prompts.delete(id);
  }
}
```

### 5.4 Skill 使用说明

#### 命令触发

在输入框中输入 `/` 开头的命令：

| 命令 | 功能 | 示例 |
|------|------|------|
| `/sql` | SQL 生成器 | `/sql 查询学生表前10条记录` |
| `/summary` | 知识总结器 | `/summary 帮我总结这段内容` |
| `/analyze` | 题目解析器 | `/analyze 解析这道数学题` |
| `/todo` | Todo 生成器 | `/todo 制定学习计划` |

#### 自动识别

输入包含特定关键词时自动触发：

- 写sql、查询数据库、生成sql → 触发 SQL 生成器
- 总结一下、帮我总结 → 触发 知识总结器
- 解析题目、这道题 → 触发 题目解析器
- 做计划、任务拆解 → 触发 Todo 生成器

#### 命令提示

输入 `/` 后会自动显示可用命令列表，使用 ↑↓ 选择，Tab 确认。

---

  private findByTrigger(trigger: string): Skill | undefined {
    return Array.from(this.skills.values()).find(s => s.trigger === trigger);
  }

  getSkill(id: string): Skill | undefined {
    return this.skills.get(id);
  }

  getAllSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  addSkill(skill: Skill): void {
    this.skills.set(skill.id, skill);
  }
}
```

---

## 六、编码规范

### 6.1 代码格式标准

| 项目 | 标准 | 说明 |
|------|------|------|
| 缩进 | 2 空格 | 统一使用 |
| 换行符 | LF | 跨平台兼容 |
| 分号 | 必须 | 避免 ASI 问题 |
| 引号 | 单引号 | JavaScript/TypeScript |
| 尾逗号 | 始终添加 | 方便版本控制 |
| 行宽 | 100 字符 | 超出则换行 |
| 花括号 | 必须 | 即使单行语句 |

### 6.2 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `PromptSelector.vue` |
| 工具/模块文件 | camelCase | `formatDate.ts` |
| 配置/数据文件 | kebab-case | `default-prompts.ts` |
| CSS 变量 | kebab-case + 前缀 | `--color-primary` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 函数/变量 | camelCase | `getUserInfo` |
| 类 | PascalCase | `PromptManager` |
| 布尔值 | is/has/can 前缀 | `isLoading` |

### 6.3 JavaScript/TypeScript 核心规则

```yaml
变量:    禁止 var，优先 const，必要时 let
比较:    始终 ===，禁止 ==
字符串:  优先模板字符串，禁止拼接
花括号:  if/for/while 必须加 {}
未使用:  禁止未使用的变量（_ 前缀除外）
调试:    禁止 debugger，限制 console.log
类型:    优先使用 TypeScript，明确类型定义
```

### 6.4 示例代码风格

```typescript
// ✅ 正确
const MAX_RETRY_COUNT = 3;
const userName = 'test';

const getFullName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`;
};

if (isLoading) {
  return null;
}

// ❌ 错误
var name = 'test';
if (isLoading) return null;
const greeting = 'Hello ' + name;
```

---

## 七、UI 设计规范

### 7.1 设计原则

| 维度 | 标准 | 应用场景 |
|------|------|----------|
| 间距基准 | 8px 网格 | margin、padding 统一使用 |
| 配色 | 60-30-10 法则 | 背景-容器-强调 |
| 文字色阶 | 3 级 | 标题/正文/次要 |
| 边框 | 统一 1px | 避免混用阴影和边框 |
| 字体 | 2 族 | 正文无等宽 + 代码等宽 |
| 圆角 | 4/8/12px | 不超过 16px |

### 7.2 色彩系统

```css
/* styles/variables.css */
:root {
  /* 主色调 */
  --color-primary: #1890ff;
  --color-primary-light: #40a9ff;
  --color-primary-dark: #096dd9;
  
  /* 背景色 */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f5f5f5;
  --color-bg-tertiary: #e8e8e8;
  
  /* 文字色 */
  --color-text-primary: #262626;
  --color-text-secondary: #595959;
  --color-text-tertiary: #8c8c8c;
  
  /* 功能色 */
  --color-success: #52c41a;
  --color-warning: #faad14;
  --color-error: #ff4d4f;
}
```

### 7.3 禁忌事项

- ❌ 纯黑文字 (`#000000`)
- ❌ 无意义渐变
- ❌ 过度动效
- ❌ 嵌套超过 2 层
- ❌ 混用阴影和边框

---

## 八、Git 提交规范

### 8.1 提交格式

```
<type>(<scope>): <subject>

[可选正文]

[可选脚注]
```

### 8.2 Type 类型

| 类型 | 说明 | 示例 |
|------|------|------|
| feat | 新功能 | `feat(prompt): add custom prompt support` |
| fix | Bug 修复 | `fix(skill): resolve trigger detection issue` |
| refactor | 重构 | `refactor(core): simplify message router` |
| style | 样式/格式 | `style(ui): adjust chat bubble spacing` |
| docs | 文档 | `docs: update prompt template guide` |
| test | 测试 | `test(skill): add unit tests for skill engine` |
| chore | 构建/工具 | `chore: update dependencies` |

### 8.3 提交示例

```bash
# 正确
git commit -m "feat(prompt): add learning tutor template"
git commit -m "fix(skill): resolve /sql command parsing"
git commit -m "docs: add API integration guide"

# 错误
git commit -m "update code"
git commit -m "fix bug"
git commit -m "feat: new feature"  # 缺少 scope
```

---

## 九、版本管理

### 9.1 语义化版本

```
MAJOR.MINOR.PATCH
```

| 类型 | 说明 | 示例 |
|------|------|------|
| MAJOR | 破坏性变更 | 1.0.0 → 2.0.0 |
| MINOR | 新功能（向后兼容） | 1.0.0 → 1.1.0 |
| PATCH | Bug 修复 | 1.0.0 → 1.0.1 |

### 9.2 版本路线

| 版本 | 功能范围 |
|------|----------|
| MVP | Chat + Prompt 选择 + 流式输出 + 历史记录 |
| V1 | Skill 系统 + 命令触发 + 内置 Prompt 库 |
| V2 | 自动 Skill 识别 + 多模型切换 + UI 优化 |
| V3 | 自动任务拆解 + 学习系统 + 笔记生成 |

---

## 十、开发流程

### 10.1 标准流程

```
1. 明确需求
   ↓
2. 设计方案（复杂功能先写技术方案）
   ↓
3. 编码实现
   ↓
4. Lint 检查 + 自动修复
   ↓
5. 构建验证
   ↓
6. 本地测试
   ↓
7. 提交代码（遵循 commit 规范）
   ↓
8. 版本备份（APK/EXE/源码）
```

### 10.2 代码检查命令

```bash
# TypeScript 类型检查
npm run typecheck

# ESLint 检查
npm run lint

# 自动修复
npm run lint:fix

# 运行测试
npm run test

# 构建验证
npm run build
```

---

## 十一、高级功能设计（V3 预留）

### 11.1 Prompt + Skill 组合

```typescript
interface CombinationConfig {
  promptId: string;
  skillIds: string[];
  contextEnhancement?: {
    taskType: string;
    autoInject: string[];
  };
}
```

**示例组合**：
- Prompt：计算机老师 + Skill：SQL生成器
- 结果：会讲 SQL 的老师 + 能直接写 SQL

### 11.2 Context 增强

```typescript
interface ContextEnhancer {
  currentTask: string;
  autoInject: {
    sqlBasics: boolean;
    commonQuestions: boolean;
    errorRecords: boolean;
  };
}
```

### 11.3 会话记忆分层

```typescript
type MemoryMode = 'session' | 'prompt' | 'global';

interface MemoryConfig {
  session: {
    maxTokens: number;
    summaryThreshold: number;
  };
  prompt: {
    enabled: boolean;
    persistence: 'local' | 'cloud';
  };
  global: {
    userPreferences: Record<string, unknown>;
    learningHistory: unknown[];
  };
}
```

---

## 附录 A：快速参考卡片

### 常用命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 测试
npm run test

# 检查
npm run lint
npm run typecheck

# 备份（版本发布后）
./scripts/backup-release.sh v1.0.0
```

### 关键文件位置

| 文件 | 用途 |
|------|------|
| `src/lib/prompt-manager.ts` | Prompt 管理核心 |
| `src/lib/skill-engine.ts` | Skill 引擎核心 |
| `src/constants/default-prompts.ts` | 内置 Prompt 定义 |
| `src/constants/default-skills.ts` | 内置 Skill 定义 |
| `src/types/` | TypeScript 类型定义 |
| `backups/releases/` | 版本备份目录 |

### 设计决策记录

| 决策 | 理由 |
|------|------|
| 使用 TypeScript | 类型安全，更好的开发体验 |
| 三层架构 | 职责分离，易于扩展和维护 |
| 配置驱动 | AI 行为可配置，无需硬编码 |
| 内置模板 | 快速上手，解决实际场景问题 |
| 本地备份 | 保护构建产物，不污染 Git 仓库 |

---

## 附录 B：术语表

| 术语 | 定义 |
|------|------|
| Prompt | AI 的行为配置，包含系统提示词和参数 |
| Skill | 可触发的特定任务执行单元 |
| Context | 上下文信息，包含对话历史和任务状态 |
| Memory Mode | 记忆模式，决定 AI 如何记住信息 |
| Trigger | Skill 的触发方式（命令/自动/按钮） |
| Backup | 版本备份，包含构建产物和核心源码 |

---

## 附录 C：版本管理

### 版本备份

```bash
# 备份当前版本
npm run backup -- -Version 1.4.0

# 查看已备份版本
npm run version:list

# 查看当前版本
npm run version:current
```

### 便携版构建

```bash
# 构建便携版
npm run build:portable -- -Version 1.4.0

# 输出：build/chatez-v1.4.0-portable.zip
```

便携版包含：
- `www/` - Web 构建产物
- `start.bat` - Windows 启动脚本
- `start.ps1` - PowerShell 启动脚本
- `README.md` - 使用说明

### 快速启动

```bash
# 开发模式启动
npm start

# 或
npm run dev
```

### 版本目录结构

```
backups/releases/
├── v1.0.0/
│   ├── web/
│   ├── android/
│   ├── windows/
│   ├── source/
│   └── version-info.json
├── v1.1.0/
├── v1.2.0/
├── v1.3.0/
└── v1.4.0/
```

---

**文档维护者**: 开发团队  
**最后更新**: 2026-06-28  
**下一步**: 根据实际开发情况持续更新本指导书
