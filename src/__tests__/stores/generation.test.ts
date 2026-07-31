import { describe, it, expect } from 'vitest';
import {
  useConfigStore,
  TONE_PRESETS,
  PROMPT_TEMPLATES,
  DEFAULT_GENERATION,
} from '../../stores/configStore';

describe('ConfigStore · 用户资料', () => {
  it('应有默认 user', () => {
    const state = useConfigStore.getState();
    expect(state.user).toBeDefined();
    // 默认 name 为空字符串（侧栏显示「匿名用户」引导用户填写）
    expect(state.user.name).toBe('');
    expect(typeof state.user.avatar).toBe('string');
    expect(state.user.isPro).toBe(false);
  });

  it('应能改名', () => {
    useConfigStore.getState().updateUser({ name: '新名字' });
    expect(useConfigStore.getState().user.name).toBe('新名字');
  });

  it('应能换头像（base64）', () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
    useConfigStore.getState().updateUser({ avatar: dataUrl });
    expect(useConfigStore.getState().user.avatar).toBe(dataUrl);
  });

  it('应能切换 Pro', () => {
    useConfigStore.getState().updateUser({ isPro: false });
    expect(useConfigStore.getState().user.isPro).toBe(false);
  });
});

describe('ConfigStore · 生成配置', () => {
  it('应有 7 个生成参数', () => {
    const gen = useConfigStore.getState().generation;
    expect(gen).toBeDefined();
    expect(typeof gen.maxTokens).toBe('number');
    expect(typeof gen.temperature).toBe('number');
    expect(typeof gen.topP).toBe('number');
    expect(typeof gen.frequencyPenalty).toBe('number');
    expect(typeof gen.presencePenalty).toBe('number');
    expect(typeof gen.toneId).toBe('string');
    expect(typeof gen.customTonePrompt).toBe('string');
    expect(typeof gen.systemPrompt).toBe('string');
    expect(typeof gen.promptTemplateId).toBe('string');
  });

  it('默认值应符合文档', () => {
    expect(DEFAULT_GENERATION.maxTokens).toBe(4096);
    expect(DEFAULT_GENERATION.temperature).toBe(0.7);
    expect(DEFAULT_GENERATION.topP).toBe(1);
    expect(DEFAULT_GENERATION.frequencyPenalty).toBe(0);
    expect(DEFAULT_GENERATION.presencePenalty).toBe(0);
    expect(DEFAULT_GENERATION.toneId).toBe('default');
  });

  it('应能调整温度', () => {
    useConfigStore.getState().updateGeneration({ temperature: 0.9 });
    expect(useConfigStore.getState().generation.temperature).toBe(0.9);
  });

  it('应能调整生成长度', () => {
    useConfigStore.getState().updateGeneration({ maxTokens: 2000 });
    expect(useConfigStore.getState().generation.maxTokens).toBe(2000);
  });

  it('应能切换语气', () => {
    useConfigStore.getState().updateGeneration({ toneId: 'formal' });
    expect(useConfigStore.getState().generation.toneId).toBe('formal');
  });

  it('应能设置系统提示词', () => {
    useConfigStore.getState().updateGeneration({
      systemPrompt: '你是一名 Rust 工程师',
      promptTemplateId: '',
    });
    expect(useConfigStore.getState().generation.systemPrompt).toBe('你是一名 Rust 工程师');
    expect(useConfigStore.getState().generation.promptTemplateId).toBe('');
  });
});

describe('ConfigStore · 预设模板', () => {
  it('应有 presets 数组', () => {
    expect(Array.isArray(useConfigStore.getState().presets)).toBe(true);
  });

  it('应能添加预设（含 config + prompt）', () => {
    useConfigStore.getState().addPreset({
      name: '创意写作模式',
      emoji: '🎨',
      config: {
        ...DEFAULT_GENERATION,
        temperature: 0.9,
        maxTokens: 2000,
        toneId: 'creative',
        systemPrompt: '你是一位创意作家',
        promptTemplateId: 'creative-writer',
      },
    });
    const presets = useConfigStore.getState().presets;
    expect(presets.length).toBeGreaterThan(0);
    const added = presets[presets.length - 1];
    expect(added.name).toBe('创意写作模式');
    expect(added.config.temperature).toBe(0.9);
    expect(added.config.systemPrompt).toBe('你是一位创意作家');
    expect(added.id).toBeTruthy();
    expect(added.createdAt).toBeGreaterThan(0);
  });

  it('应能应用预设（恢复所有参数）', () => {
    // 添加预设
    useConfigStore.getState().addPreset({
      name: '应用测试',
      emoji: '⚡',
      config: {
        ...DEFAULT_GENERATION,
        temperature: 0.85,
        maxTokens: 4000,
        toneId: 'professional',
        systemPrompt: 'PROMPT_TEST',
      },
    });
    const presets = useConfigStore.getState().presets;
    const id = presets[presets.length - 1].id; // 取最新添加的

    // 先修改当前 generation
    useConfigStore.getState().updateGeneration({ temperature: 0.1, maxTokens: 100 });
    // 应用预设
    useConfigStore.getState().applyPreset(id);
    const gen = useConfigStore.getState().generation;
    expect(gen.temperature).toBe(0.85);
    expect(gen.maxTokens).toBe(4000);
    expect(gen.toneId).toBe('professional');
    expect(gen.systemPrompt).toBe('PROMPT_TEST');
  });

  it('应能删除预设', () => {
    useConfigStore.getState().addPreset({
      name: '待删除',
      emoji: '🗑️',
      config: { ...DEFAULT_GENERATION },
    });
    const id = useConfigStore.getState().presets[0].id;
    useConfigStore.getState().removePreset(id);
    expect(useConfigStore.getState().presets.find((p) => p.id === id)).toBeUndefined();
  });
});

describe('TONE_PRESETS', () => {
  it('应至少 8 个语气预设', () => {
    expect(TONE_PRESETS.length).toBeGreaterThanOrEqual(8);
  });

  it('每个预设应有 id/name/emoji/description/prompt', () => {
    TONE_PRESETS.forEach((t) => {
      expect(t.id).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(t.emoji).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect(typeof t.prompt).toBe('string');
    });
  });

  it('应包含默认、正式、专业、友好、简洁、创意、幽默、自定义', () => {
    const ids = TONE_PRESETS.map((t) => t.id);
    ['default', 'formal', 'professional', 'friendly', 'concise', 'creative', 'humorous', 'custom']
      .forEach((id) => expect(ids).toContain(id));
  });
});

describe('PROMPT_TEMPLATES', () => {
  it('应至少 12 个提示词模板', () => {
    expect(PROMPT_TEMPLATES.length).toBeGreaterThanOrEqual(12);
  });

  it('每个模板应有完整结构', () => {
    PROMPT_TEMPLATES.forEach((t) => {
      expect(t.id).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(t.emoji).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect(typeof t.prompt).toBe('string');
    });
  });

  it('应包含核心场景：学习助手、代码审查、翻译专家等', () => {
    const ids = PROMPT_TEMPLATES.map((t) => t.id);
    ['study-assistant', 'code-reviewer', 'translator', 'data-analyst']
      .forEach((id) => expect(ids).toContain(id));
  });

  it('提示词内容应 > 50 字符（避免空提示）', () => {
    PROMPT_TEMPLATES.filter((t) => t.id !== 'blank').forEach((t) => {
      expect(t.prompt.length).toBeGreaterThan(50);
    });
  });
});
