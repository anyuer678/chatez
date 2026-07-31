# Chatez 更新日志

## v1.14.2 (2026-07-31)

### 安全修复
- **API Key 加密存储**：明文 localStorage → AES-GCM 加密保险库（密钥存 sessionStorage，仅当前会话有效，刷新不丢、关闭后需重新输入）
- 修复密钥保险库 `extractable: false` 导致密钥无法导出、刷新后密文永远解不开的致命缺陷
- Android `allowBackup` 从 `true` 改为 `false`，防止应用数据被云备份扩散

### 功能修复
- **修复 Tauri 开发模式白屏**：Vite 端口为 3001（strictPort），tauri.conf.json devUrl 却指向 3000，已统一为 3001
- **统一版本号**：package.json / tauri.conf.json / Cargo.toml / Cargo.lock / Android versionName 全部统一为 1.14.1（Android versionCode 14）

### 依赖
- `npm audit fix` 无破坏性修复（postcss 高危路径遍历已修）
- 其余 32 个漏洞（2 critical / 15 high 均属 devDependencies；生产依赖 4 个 moderate）见下方"已知风险"

### 已知风险（技术债）
- **生产依赖**：`@ai-sdk/provider-utils` 资源消耗、`jsondiffpatch` XSS、`nanoid` 可预测性、`prismjs` DOM Clobbering —— 修复需 breaking change（ai@3→7、react-syntax-highlighter@15→16），计划随下次大版本重构一并升级
- **devDependencies**：eslint 链 brace-expansion DoS、vite/esbuild dev server 漏洞 —— 仅影响开发机，不影响构建产物

### 测试
- 134 个测试全部通过；`vite build` 构建成功

---

## v1.14.1 (2026-07-31)

### 安全修复
- CSP 策略从 `null` 改为 `'self' 'unsafe-inline'` (C1)
- exportConfig 导出时警告 API 密钥风险并自动脱敏为 `***REDACTED***` (C2/C3)
- importConfig 添加原型链污染防护，拒绝包含 `__proto__`/`constructor`/`prototype` 的导入 (M12)

### 功能修复
- 版本号从错误的 `v1.15.0` 修正为 `v1.14.0` (H7)
- 预设模板 ID `preset-story` 修正为 `tutor-socratic` (M9)

### 体验优化
- 温度滑块范围从 0.1-1.0 统一为 0-2，与 API 配置对齐 (M14)
- maxTokens 输入添加 50-32000 范围夹紧 (M8)
- 用户输入添加 32000 字符长度限制 (L17)
- API 请求添加 429/5xx 自动重试（指数退避，最多 2 次）(M15)

### 代码质量
- createSession 从渲染体移入 useEffect，避免重复创建 (H6)
- 移除已废弃的 `document.execCommand('copy')` fallback (M11)
- 新增 ErrorBoundary 组件，防止渲染崩溃白屏 (M10)
- importConfig 改为逐字段校验+范围夹紧，取代粗暴的 Object.assign (H4)
- importPrompts 添加类型校验和 systemPrompt 10000 字符长度限制 (H5)
- Skill 引擎正则从 `/s` flag 改为 `[\s\S]*`，更明确 (L18)

### 测试
- 测试总数：134 个（全部通过）

---

## v1.14.0 (2026-07-07)

### 新增
- sendWithEnter 配置接通：支持 Enter/Ctrl+Enter 切换发送方式
- 版本号动态读取：About 页不再硬编码版本号
- Ctrl+, 快捷键：快速打开设置弹窗
- per-prompt temperature：每个 Prompt 可独立设置温度
- enabledSkills 过滤：Skill 列表根据配置过滤
- inputTransform 处理：SQL 查询自动包装
- Prompt 创建/编辑 UI：支持新建、编辑、删除、导入导出
- PromptSelector 内联编辑：侧边栏下拉框内直接编辑/新建 Prompt
- SkillSelector 内联编辑：侧边栏新增 Skill 下拉选择器，悬停编辑/删除

### 优化
- SettingsModal 状态提升到 AppLayout，避免状态冲突
- 合并 9 个 PS 脚本为 1 个统一 build.ps1
- 手机端 UI 优化：弹窗底部弹出、操作栏纵向堆叠
- UI 精简：移除 indigo/purple 主色，统一为灰色调
- 精简符号和图标，移除冗余装饰
- globals.css 精简，移除未使用的 CSS 变量

### 修复
- 修复 SettingsModal 重复渲染导致的闪退问题
- 修复 SkillSelector/PromptSelector 未使用的导入

---

## v1.13.0 (2026-06-29)

### 优化
- 更新测试用例适配新接口
- 测试总数：54 个

---

## v1.12.0 (2026-06-28)

### 优化
- 优化构建配置
- 添加代码分割（vendor, markdown）
- 移除生产环境 sourcemap
- 移除 console.log 和 debugger
- 安装 terser 依赖

---

## v1.11.0 (2026-06-28)

### 新增
- ConfigStore 测试用例（9 个）
- 测试总数：47 个

### 优化
- 完善测试覆盖

---

## v1.10.0 (2026-06-28)

### 新增
- SkillStore 测试用例（16 个）
- 测试总数：38 个

### 优化
- 完善测试覆盖

---

## v1.9.0 (2026-06-28)

### 优化
- 简化 SettingsModal 样式
- 减小弹窗尺寸
- 优化表单控件
- 统一深色模式适配

---

## v1.8.0 (2026-06-28)

### 优化
- 简化 PromptSelector 样式
- 简化 InputBox 样式
- 简化 MessageBubble 样式
- 减小 CSS 体积（27KB → 26KB）
- 统一组件风格

---

## v1.7.0 (2026-06-28)

### 优化
- 移除欢迎页面，直接进入对话
- 移除不必要动画效果
- 简化全局样式
- 减小 CSS 体积（36KB → 27KB）
- 优化侧边栏样式

---

## v1.6.0 (2026-06-28)

### 优化
- 美化全局样式和颜色方案
- 添加 Inter 字体
- 优化欢迎页面设计
- 优化侧边栏样式
- 添加动画效果（fadeIn, slideUp, scaleIn）
- 添加毛玻璃效果
- 添加卡片悬停效果
- 深色主题优化

---

## v1.5.0 (2026-06-28)

### 新增
- 单元测试框架
- ChatStore 测试用例
- PromptStore 测试用例
- SkillEngine 测试用例

### 优化
- 完善版本备份机制
- 添加便携版构建脚本
- 添加快速启动脚本

---

## v1.4.0 (2026-06-28)

### 新增
- 版本管理器脚本
- 便携版构建脚本
- 快速启动脚本
- 版本信息文件

### 优化
- 优化 Markdown 渲染样式
- 添加代码块一键复制功能
- 优化移动端输入体验
- 添加欢迎页面快速开始卡片

### 修复
- 修复未使用变量警告

---

## v1.3.0 (2026-06-27)

### 新增
- 实现自定义 Skill 功能
- 添加 Skill 导入导出
- 添加 Skill 管理界面

### 优化
- 更新 Skill 引擎使用 store 数据

---

## v1.2.0 (2026-06-27)

### 新增
- 添加响应式布局支持
- 实现 Prompt 导入导出

### 优化
- 优化移动端侧边栏
- 添加遮罩层点击关闭

---

## v1.1.0 (2026-06-27)

### 新增
- 实现会话持久化（localStorage）
- 添加 Skill 引擎核心逻辑
- 实现命令触发系统（/sql 等）
- 添加命令提示面板
- 实现消息复制和重新生成
- 添加智能标题生成

### 修复
- 修复 Prompt 和主题持久化

---

## v1.0.0 (2026-06-27)

### 新增
- 项目初始化
- 基础 Chat 界面
- Prompt 角色选择器
- 流式输出支持
- API 客户端封装
- 设置界面
- 主题切换（浅色/深色）
- 快捷键支持
- 版本备份机制
