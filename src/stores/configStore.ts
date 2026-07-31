import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { saveApiKey, loadApiKey } from '../utils/key-vault';

export interface ApiConfig {
  provider: 'openai' | 'custom';
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
  streamTimeout: number;
}

export interface UserProfile {
  name: string;
  avatar: string; // 图片 dataURL（base64），空字符串表示使用首字 fallback
  isPro: boolean;
}

/**
 * 语气风格预设
 */
export interface TonePreset {
  id: string;
  name: string;
  emoji: string;
  description: string;
  prompt: string; // 注入到系统提示的引导
}

/**
 * 单条预设模板（保存用户的参数组合）
 */
export interface SavedPreset {
  id: string;
  name: string;
  emoji: string;
  config: GenerationConfig;
  createdAt: number;
}

/**
 * Skill 组合预设
 * 一次性激活多个 skill + 系统提示词 + 语气 + 温度
 */
export interface SkillPreset {
  id: string;
  name: string;
  emoji: string;
  description: string;
  skillIds: string[];
  systemPrompt: string;
  toneId: string;
  temperature: number;
}

/**
 * 提示词预设模板（可直接选用作为系统提示词）
 */
export interface PromptTemplate {
  id: string;
  name: string;
  emoji: string;
  description: string;
  prompt: string;
}

/**
 * 模型生成微调配置
 */
export interface GenerationConfig {
  maxTokens: number;          // 最大输出长度
  temperature: number;        // 温度 0.1-1.0
  topP: number;               // 核采样 0-1
  frequencyPenalty: number;   // 频率惩罚 -2~2
  presencePenalty: number;    // 存在惩罚 -2~2
  toneId: string;             // 语气预设 id
  customTonePrompt: string;   // 自定义语气文本（仅当 toneId === 'custom' 时生效）
  systemPrompt: string;       // 系统提示词（注入到 API）
  promptTemplateId: string;   // 当前选用的提示词模板 id（空表示自定义）
  activePresetId: string;     // 当前激活的 Skill 组合预设 id（空表示未使用预设）
}

export const TONE_PRESETS: TonePreset[] = [
  {
    id: 'default',
    name: '默认',
    emoji: '✨',
    description: '智能均衡，自然对话',
    prompt: '',
  },
  {
    id: 'formal',
    name: '正式',
    emoji: '🎩',
    description: '严谨端庄，适合公文',
    prompt: '请使用正式、严谨的语言风格回答，避免口语化表达，使用规范的书面语。',
  },
  {
    id: 'professional',
    name: '专业',
    emoji: '🔬',
    description: '专业领域，准确深入',
    prompt: '请以专业领域的视角回答，使用专业术语，确保信息准确、逻辑严密、论述深入。',
  },
  {
    id: 'friendly',
    name: '友好',
    emoji: '☕',
    description: '亲切温暖，娓娓道来',
    prompt: '请使用友好、亲切的口吻回答，像朋友聊天一样自然，多用比喻、举例，避免冷冰冰的陈述。',
  },
  {
    id: 'concise',
    name: '简洁',
    emoji: '⚡',
    description: '精炼扼要，直击要点',
    prompt: '请用简洁精炼的方式回答，直击要点，避免冗余描述，每句话都要有价值。',
  },
  {
    id: 'creative',
    name: '创意',
    emoji: '🎨',
    description: '天马行空，新颖有趣',
    prompt: '请用富有创意和想象力的方式回答，可以从意想不到的角度切入，描述生动有趣。',
  },
  {
    id: 'humorous',
    name: '幽默',
    emoji: '😄',
    description: '诙谐风趣，轻松活泼',
    prompt: '请用幽默诙谐的方式回答，可以适当使用比喻、双关、调侃，让对话轻松愉快。',
  },
  {
    id: 'custom',
    name: '自定义',
    emoji: '✍️',
    description: '完全自定义语气',
    prompt: '',
  },
];

export const DEFAULT_GENERATION: GenerationConfig = {
  maxTokens: 4096,
  temperature: 0.7,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  toneId: 'default',
  customTonePrompt: '',
  systemPrompt: '',
  promptTemplateId: '',
  activePresetId: '',
};

/**
 * 系统提示词预设模板（多点预设提示词库）
 */
export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'blank',
    name: '无',
    emoji: '∅',
    description: '不使用任何系统提示词',
    prompt: '',
  },
  {
    id: 'study-assistant',
    name: '学习助手',
    emoji: '📚',
    description: '耐心讲解，循循善诱',
    prompt: `你是一位耐心的学习助手，名叫 ChatEZ。请遵循以下原则：
1. 解释概念时先给定义，再用通俗比喻，最后举一个生活化的例子
2. 根据问题难度自适应调整深度：基础问题用日常语言，进阶问题引入专业术语
3. 主动追问以确认理解，但每次最多问 1 个问题
4. 重要概念用列表或表格呈现，便于记忆
5. 中文回答，使用手写体风格排版`,
  },
  {
    id: 'code-reviewer',
    name: '代码审查',
    emoji: '🧐',
    description: '严谨专业的代码评审',
    prompt: `你是一位严谨的代码审查专家。请按以下结构评审代码：
1. **整体评价**：架构、设计模式、可读性
2. **潜在问题**：Bug、安全漏洞、性能瓶颈
3. **改进建议**：具体可执行的代码示例
4. **优点肯定**：值得学习的地方
请使用中文，保持客观专业，避免空泛评价。`,
  },
  {
    id: 'creative-writer',
    name: '创意写作',
    emoji: '✍️',
    description: '激发灵感的创作伙伴',
    prompt: `你是一位富有想象力的写作伙伴。请：
- 用生动的感官描写（视觉、听觉、触觉、嗅觉）营造氛围
- 善用比喻、拟人、通感等修辞
- 故事结构：起承转合，结尾留有余味
- 字数适中，不要过度铺陈
- 鼓励我继续创作，每次提供 1-2 个方向延展`,
  },
  {
    id: 'translator',
    name: '翻译专家',
    emoji: '🌐',
    description: '信达雅的精准翻译',
    prompt: `你是一位精通中英日韩的翻译家，追求"信达雅"：
- **信**：准确传达原文含义，不漏译不增译
- **达**：译文通顺自然，符合目标语言习惯
- **雅**：文笔优美，保留原文风格
- 专业术语给出原文+译法+简要说明
- 重要译文提供 2 种风格版本（直译/意译）`,
  },
  {
    id: 'data-analyst',
    name: '数据分析师',
    emoji: '📊',
    description: '基于数据的洞察分析',
    prompt: `你是一位数据分析师。请：
1. 先明确问题边界（要分析什么？结论用于什么决策？）
2. 列出可能用到的分析方法与数据需求
3. 给出分析框架和关键指标
4. 提供可执行的代码示例（Python pandas/sql）
5. 总结结论与下一步建议
避免凭直觉下结论，量化优于定性。`,
  },
  {
    id: 'career-coach',
    name: '职业教练',
    emoji: '🎯',
    description: '职业发展与面试指导',
    prompt: `你是一位资深的职业发展教练。请：
- 倾听来访者诉求，先共情再分析
- 用 STAR 法则（情境-任务-行动-结果）帮助梳理经历
- 给出可量化的建议（具体动作、时限、衡量标准）
- 提醒潜在的盲点和风险
- 鼓励尝试，失败是数据收集`,
  },
  {
    id: 'tutor-socratic',
    name: '苏格拉底导师',
    emoji: '🦉',
    description: '反问式引导思考',
    prompt: `你是苏格拉底式的导师，坚信"我唯一知道的就是我一无所知"。请：
- 不直接给答案，而是通过 3-5 个递进的问题引导我思考
- 关注我的推理过程，而不只是结果
- 指出我假设中的漏洞
- 当我陷入思维定式时，提供反例或换个视角
- 最后由我总结出结论`,
  },
  {
    id: 'interviewer',
    name: '模拟面试',
    emoji: '💼',
    description: '模拟面试官与点评',
    prompt: `你是一位经验丰富的技术面试官。请：
1. 根据目标岗位设计 3-5 个递进式问题
2. 每次只问一题，根据回答追问或反馈
3. 回答后给出详细点评：
   - 优点（具体到知识点）
   - 不足（如何改进）
   - 参考答案（如有必要）
4. 模拟真实面试节奏，不要一次性把所有问题抛出来`,
  },
  {
    id: 'summary-master',
    name: '总结大师',
    emoji: '📝',
    description: '长文提炼重点',
    prompt: `你是总结大师，擅长将复杂内容浓缩为精华。请：
1. 先给出 1-2 句话的核心结论
2. 用 3-5 个 bullet 列出关键要点
3. 标注重要数据/案例/引用
4. 指出文中的争议或未解决的问题
5. 提供进一步的阅读建议`,
  },
  {
    id: 'philosophy-friend',
    name: '哲学老友',
    emoji: '☕',
    description: '深度对话与思辨',
    prompt: `你是一位哲学老友，喜欢在咖啡馆里讨论人生。请：
- 用"我理解你的意思..."或"这让我想到..."等共情开场
- 引经据典（苏格拉底、庄子、维特根斯坦等）但不过度引用
- 鼓励我从不同角度审视问题
- 区分"事实"与"观点"
- 留出思考空间，不强求结论`,
  },
  {
    id: 'chef',
    name: '私厨',
    emoji: '🍳',
    description: '美食烹饪与饮食建议',
    prompt: `你是一位米其林私厨。请：
- 根据现有食材推荐 2-3 道菜
- 详细步骤（精确到时间和克数）
- 解释关键技巧（为什么要这样处理）
- 给出摆盘建议
- 注明过敏原和替代方案`,
  },
];

/**
 * 内置提示词预设（直接填到「预设模板」区，可立即应用）
 * 每个预设打包了：温度 / 长度 / 语气 / 提示词 / 模板 ID
 */
export const BUILT_IN_PRESETS: SavedPreset[] = [
  {
    id: 'preset-creative',
    name: '创意写作',
    emoji: '🎨',
    createdAt: 0,
    config: {
      ...DEFAULT_GENERATION,
      temperature: 0.9,
      maxTokens: 3000,
      topP: 1,
      frequencyPenalty: 0.2,
      presencePenalty: 0.2,
      toneId: 'creative',
      customTonePrompt: '',
      systemPrompt: PROMPT_TEMPLATES.find((t) => t.id === 'creative-writer')?.prompt ?? '',
      promptTemplateId: 'creative-writer',
    },
  },
  {
    id: 'preset-tech',
    name: '技术专家',
    emoji: '🔬',
    createdAt: 0,
    config: {
      ...DEFAULT_GENERATION,
      temperature: 0.3,
      maxTokens: 4000,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      toneId: 'professional',
      customTonePrompt: '',
      systemPrompt: PROMPT_TEMPLATES.find((t) => t.id === 'code-reviewer')?.prompt ?? '',
      promptTemplateId: 'code-reviewer',
    },
  },
  {
    id: 'preset-study',
    name: '学习辅导',
    emoji: '☕',
    createdAt: 0,
    config: {
      ...DEFAULT_GENERATION,
      temperature: 0.5,
      maxTokens: 2500,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      toneId: 'friendly',
      customTonePrompt: '',
      systemPrompt: PROMPT_TEMPLATES.find((t) => t.id === 'study-assistant')?.prompt ?? '',
      promptTemplateId: 'study-assistant',
    },
  },
  {
    id: 'preset-interview',
    name: '模拟面试',
    emoji: '💼',
    createdAt: 0,
    config: {
      ...DEFAULT_GENERATION,
      temperature: 0.4,
      maxTokens: 2000,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      toneId: 'professional',
      customTonePrompt: '',
      systemPrompt: PROMPT_TEMPLATES.find((t) => t.id === 'interviewer')?.prompt ?? '',
      promptTemplateId: 'interviewer',
    },
  },
  {
    id: 'preset-translate',
    name: '翻译助理',
    emoji: '🌐',
    createdAt: 0,
    config: {
      ...DEFAULT_GENERATION,
      temperature: 0.3,
      maxTokens: 4000,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      toneId: 'professional',
      customTonePrompt: '',
      systemPrompt: PROMPT_TEMPLATES.find((t) => t.id === 'translator')?.prompt ?? '',
      promptTemplateId: 'translator',
    },
  },
  {
    id: 'preset-story',
    name: '故事创作',
    emoji: '📖',
    createdAt: 0,
    config: {
      ...DEFAULT_GENERATION,
      temperature: 0.85,
      maxTokens: 4000,
      topP: 1,
      frequencyPenalty: 0.3,
      presencePenalty: 0.3,
      toneId: 'creative',
      customTonePrompt: '',
      systemPrompt: PROMPT_TEMPLATES.find((t) => t.id === 'tutor-socratic')?.prompt ?? '',
      promptTemplateId: 'tutor-socratic',
    },
  },
];

/**
 * 内置 Skill 组合预设
 * 一次性激活多个 skill + 注入预设提示词 + 设置语气
 */
export const BUILT_IN_SKILL_PRESETS: SkillPreset[] = [
  {
    id: 'sp-dev',
    name: '开发者工具箱',
    emoji: '🛠️',
    description: '代码相关：解释/审查/格式化',
    skillIds: ['code_explainer', 'code_reviewer', 'code_formatter', 'sql_generator'],
    systemPrompt: '你是一位资深软件工程师，专注于代码质量、可读性与最佳实践。',
    toneId: 'professional',
    temperature: 0.3,
  },
  {
    id: 'sp-writer',
    name: '写作工坊',
    emoji: '✍️',
    description: '创作/编辑/翻译/邮件',
    skillIds: ['brainstorm', 'grammar_check', 'translator', 'email_composer', 'story_creator'],
    systemPrompt: '你是一位经验丰富的写作教练，擅长激发灵感、润色文字、调整结构。',
    toneId: 'creative',
    temperature: 0.8,
  },
  {
    id: 'sp-office',
    name: '办公助理',
    emoji: '💼',
    description: '会议/日报/邮件/任务拆解',
    skillIds: ['meeting_notes', 'daily_report', 'email_composer', 'todo_generator', 'knowledge_summarizer'],
    systemPrompt: '你是一位高效的行政助理，擅长会议纪要、邮件撰写、工作规划。',
    toneId: 'concise',
    temperature: 0.4,
  },
  {
    id: 'sp-interview',
    name: '求职面试',
    emoji: '💼',
    description: '模拟面试/问题解析/总结',
    skillIds: ['interview_questions', 'question_analyzer', 'knowledge_summarizer', 'product_naming'],
    systemPrompt: '你是一位资深的职业教练，专注于面试辅导与职业发展。',
    toneId: 'professional',
    temperature: 0.4,
  },
  {
    id: 'sp-life',
    name: '生活助手',
    emoji: '🍳',
    description: '菜谱/苏格拉底/哲学老友',
    skillIds: ['recipe_helper', 'question_analyzer', 'brainstorm'],
    systemPrompt: '你是一位体贴的生活顾问，懂生活、爱分享。',
    toneId: 'friendly',
    temperature: 0.7,
  },
  {
    id: 'sp-data',
    name: '数据研究',
    emoji: '📊',
    description: 'SQL/总结/分析/数学',
    skillIds: ['sql_generator', 'knowledge_summarizer', 'question_analyzer', 'math_solver'],
    systemPrompt: '你是一位数据科学家，擅长用数据说话，用逻辑分析问题。',
    toneId: 'professional',
    temperature: 0.3,
  },
];

export interface AppConfig {
  api: ApiConfig;
  ui: {
    theme: 'light' | 'dark';
    fontSize: number;
    sendWithEnter: boolean;
  };
  skill: {
    autoDetect: boolean;
    enabledSkills: string[];
  };
  user: UserProfile;
  generation: GenerationConfig;
  presets: SavedPreset[];
}

interface ConfigStore extends AppConfig {
  updateApiConfig: (config: Partial<ApiConfig>) => void;
  updateUiConfig: (config: Partial<AppConfig['ui']>) => void;
  updateSkillConfig: (config: Partial<AppConfig['skill']>) => void;
  updateUser: (user: Partial<UserProfile>) => void;
  updateGeneration: (config: Partial<GenerationConfig>) => void;
  addPreset: (preset: Omit<SavedPreset, 'id' | 'createdAt'>) => void;
  removePreset: (id: string) => void;
  applyPreset: (id: string) => void;
  resetConfig: () => void;
  exportConfig: () => string | null;
  importConfig: (json: string) => boolean;
}

const defaultConfig: AppConfig = {
  api: {
    provider: 'openai',
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 4096,
    streamTimeout: 30000,
  },
  ui: {
    theme: 'light',
    fontSize: 14,
    sendWithEnter: true,
  },
  skill: {
    autoDetect: true,
    enabledSkills: [],
  },
  user: {
    name: '', // 空字符串 → 侧栏显示「匿名用户」（首次打开引导用户填写）
    avatar: '',
    isPro: false, // 默认关闭 Pro 徽标（用户开启后再展示）
  },
  generation: { ...DEFAULT_GENERATION },
  presets: [...BUILT_IN_PRESETS],
};

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set, get) => ({
      ...defaultConfig,

      updateApiConfig: (config) => {
        set((state) => ({
          api: { ...state.api, ...config },
        }));
        // API Key 变更时异步加密持久化，localStorage 中不存明文
        if (config.apiKey !== undefined) {
          saveApiKey(config.apiKey).catch(() => {});
        }
      },

      updateUiConfig: (config) => {
        set((state) => ({
          ui: { ...state.ui, ...config },
        }));
      },

      updateSkillConfig: (config) => {
        set((state) => ({
          skill: { ...state.skill, ...config },
        }));
      },

      updateUser: (user) => {
        set((state) => ({
          user: { ...state.user, ...user },
        }));
      },

      updateGeneration: (config) => {
        set((state) => ({
          generation: { ...state.generation, ...config },
        }));
      },

      addPreset: (preset) => {
        const id = `preset_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        set((state) => ({
          presets: [
            ...state.presets,
            { ...preset, id, createdAt: Date.now() },
          ],
        }));
      },

      removePreset: (id) => {
        set((state) => ({
          presets: state.presets.filter((p) => p.id !== id),
        }));
      },

      applyPreset: (id) => {
        const preset = get().presets.find((p) => p.id === id);
        if (preset) {
          set({ generation: { ...preset.config } });
        }
      },

      resetConfig: () => {
        set(defaultConfig);
      },

      exportConfig: () => {
        const { api, ui, skill, user, generation, presets } = get();
        const hasApiKey = !!api.apiKey;
        if (hasApiKey) {
          const proceed = window.confirm(
            '当前配置包含 API Key，导出后他人可直接使用您的密钥。\n\n是否继续导出？'
          );
          if (!proceed) return null;
        }
        const exported = { api: { ...api, apiKey: api.apiKey ? '***REDACTED***' : '' }, ui, skill, user, generation, presets };
        return JSON.stringify(exported, null, 2);
      },

      importConfig: (json: string) => {
        try {
          const raw = JSON.parse(json);
          if (!raw || typeof raw !== 'object') return false;

          const imported = raw as Record<string, unknown>;
          const blockedKeys = ['__proto__', 'constructor', 'prototype'];
          if (Object.keys(imported).some((k) => blockedKeys.includes(k))) {
            console.warn('[ConfigStore] 拒绝导入：包含危险的原型链属性');
            return false;
          }

          // 校验 api 字段
          if (imported.api && typeof imported.api === 'object') {
            const a = imported.api as Record<string, unknown>;
            const safeApi: Record<string, unknown> = {};
            if (typeof a.baseUrl === 'string') safeApi.baseUrl = a.baseUrl;
            if (typeof a.apiKey === 'string') safeApi.apiKey = a.apiKey;
            if (typeof a.model === 'string') safeApi.model = a.model;
            if (typeof a.provider === 'string') safeApi.provider = a.provider;
            if (typeof a.streamTimeout === 'number' && a.streamTimeout > 0) safeApi.streamTimeout = a.streamTimeout;
            if (typeof a.temperature === 'number') safeApi.temperature = Math.max(0, Math.min(2, a.temperature));
            if (typeof a.maxTokens === 'number') safeApi.maxTokens = Math.max(50, Math.min(32000, a.maxTokens));
            set((state) => ({ api: { ...state.api, ...safeApi } }));
          }

          // 校验 ui 字段
          if (imported.ui && typeof imported.ui === 'object') {
            const u = imported.ui as Record<string, unknown>;
            const safeUi: Record<string, unknown> = {};
            if (typeof u.theme === 'string') safeUi.theme = u.theme;
            if (typeof u.fontSize === 'number') safeUi.fontSize = u.fontSize;
            if (typeof u.showTimestamp === 'boolean') safeUi.showTimestamp = u.showTimestamp;
            if (typeof u.sendOnEnter === 'boolean') safeUi.sendOnEnter = u.sendOnEnter;
            set((state) => ({ ui: { ...state.ui, ...safeUi } }));
          }

          // 校验 skill 字段
          if (imported.skill && typeof imported.skill === 'object') {
            const sk = imported.skill as Record<string, unknown>;
            const safeSkill: Record<string, unknown> = {};
            if (typeof sk.activeSkillIds === 'object' && Array.isArray(sk.activeSkillIds)) {
              safeSkill.activeSkillIds = sk.activeSkillIds.filter((id: unknown) => typeof id === 'string');
            }
            if (typeof sk.injectionMode === 'string') safeSkill.injectionMode = sk.injectionMode;
            set((state) => ({ skill: { ...state.skill, ...safeSkill } }));
          }

          // 校验 user 字段
          if (imported.user && typeof imported.user === 'object') {
            const u = imported.user as Record<string, unknown>;
            const safeUser: Record<string, unknown> = {};
            if (typeof u.nickname === 'string') safeUser.nickname = u.nickname;
            set((state) => ({ user: { ...state.user, ...safeUser } }));
          }

          // 校验 generation 字段
          if (imported.generation && typeof imported.generation === 'object') {
            const g = imported.generation as Record<string, unknown>;
            const safeGen: Record<string, unknown> = {};
            if (typeof g.temperature === 'number') safeGen.temperature = Math.max(0, Math.min(2, g.temperature));
            if (typeof g.maxTokens === 'number') safeGen.maxTokens = Math.max(50, Math.min(8000, g.maxTokens));
            if (typeof g.topP === 'number') safeGen.topP = Math.max(0, Math.min(1, g.topP));
            if (typeof g.frequencyPenalty === 'number') safeGen.frequencyPenalty = Math.max(0, Math.min(2, g.frequencyPenalty));
            if (typeof g.presencePenalty === 'number') safeGen.presencePenalty = Math.max(0, Math.min(2, g.presencePenalty));
            if (typeof g.systemPrompt === 'string') safeGen.systemPrompt = g.systemPrompt;
            if (typeof g.promptTemplateId === 'string') safeGen.promptTemplateId = g.promptTemplateId;
            if (typeof g.toneId === 'string') safeGen.toneId = g.toneId;
            if (typeof g.activePresetId === 'string') safeGen.activePresetId = g.activePresetId;
            set((state) => ({ generation: { ...state.generation, ...safeGen } }));
          }

          // 校验 presets 字段
          if (Array.isArray(imported.presets)) {
            const validPresets = imported.presets.filter(
              (p: unknown) =>
                p && typeof p === 'object' &&
                typeof (p as Record<string, unknown>).id === 'string' &&
                typeof (p as Record<string, unknown>).name === 'string'
            );
            set({ presets: validPresets as AppConfig['presets'] });
          }

          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'chatez-config',
      version: 9, // 升级：添加 generation.activePresetId 以支持 skill 组合预设激活态
      // 显式声明持久化字段：只持久化配置数据，不持久化函数
      partialize: (state) => ({
        api: { ...state.api, apiKey: '' }, // 密钥不持久化明文，改由 key-vault 加密存储
        ui: state.ui,
        skill: state.skill,
        user: state.user,
        generation: state.generation,
        presets: state.presets,
      }),
      migrate: (persistedState, version) => {
        const s = (persistedState ?? {}) as Partial<AppConfig>;

        // v1 -> v2: 注入 user 默认值
        if (version < 2) {
          s.user = s.user ?? defaultConfig.user;
        }
        // v2 -> v3: 注入 generation / presets 默认值
        if (version < 3) {
          s.generation = s.generation ?? { ...DEFAULT_GENERATION };
          s.presets = s.presets ?? [];
        }
        // v3 -> v4: 注入 systemPrompt / promptTemplateId
        if (version < 4 && s.generation) {
          s.generation.systemPrompt = s.generation.systemPrompt ?? '';
          s.generation.promptTemplateId = s.generation.promptTemplateId ?? '';
        }
        // v4 -> v5: 注入 6 个内置提示词预设
        if (version < 5) {
          if (!s.presets || s.presets.length === 0) {
            s.presets = [...BUILT_IN_PRESETS];
          } else {
            const existingIds = new Set(s.presets.map((p) => p.id));
            const missing = BUILT_IN_PRESETS.filter((b) => !existingIds.has(b.id));
            s.presets = [...s.presets, ...missing];
          }
        }
        // v5 -> v6: 清理旧版"喜白石"/"超级用户"占位用户名
        if (version < 6) {
          s.user = s.user ?? defaultConfig.user;
          if (s.user.name === '喜白石' || s.user.name === '超级用户') {
            s.user.name = '';
          }
          // 只在 isPro 未设置时重置，避免覆盖用户主动开启的 Pro 状态
          if (typeof s.user.isPro !== 'boolean') {
            s.user.isPro = false;
          }
        }
        // v6 -> v7/v8: 不再强制重置 user，保留用户的设置
        // （旧版 v6->v7 强制重置会导致用户编辑的名称和 Pro 徽标丢失）
        if (version < 8) {
          s.user = s.user ?? defaultConfig.user;
          // 仅在字段缺失时补默认值
          s.user.name = s.user.name ?? '';
          s.user.avatar = s.user.avatar ?? '';
          s.user.isPro = s.user.isPro ?? false;
        }
        // v8 -> v9: 注入 generation.activePresetId 字段（空字符串 = 未激活预设）
        if (version < 9 && s.generation) {
          s.generation.activePresetId = s.generation.activePresetId ?? '';
        }
        return s as AppConfig;
      },
    }
  )
);

// 启动时尝试从加密保险库恢复 API Key（同标签页刷新可恢复；新会话则等待用户重新输入）
loadApiKey()
  .then((key) => {
    if (key) {
      useConfigStore.setState((s) => ({ api: { ...s.api, apiKey: key } }));
    }
  })
  .catch(() => {});
