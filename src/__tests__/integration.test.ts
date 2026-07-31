import { describe, it, expect, beforeEach } from 'vitest';
import { useConfigStore, PROMPT_TEMPLATES, BUILT_IN_PRESETS, BUILT_IN_SKILL_PRESETS } from '../stores/configStore';
import { DEFAULT_SKILLS } from '../constants/default-skills';

// Mock localStorage for Node environment
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => { store[k] = v; },
  removeItem: (k: string) => { delete store[k]; },
  clear: () => { for (const k in store) delete store[k]; },
  key: (i: number) => Object.keys(store)[i] ?? null,
  length: 0,
};
(globalThis as any).localStorage = localStorageMock;

describe('端到端集成测试', () => {
  beforeEach(() => {
    for (const k in store) delete store[k];
  });

  it('应能完成完整工作流：改名+改头像+改模型+保存预设', () => {
    // 1. 改名
    useConfigStore.getState().updateUser({ name: '测试者', isPro: true });
    expect(useConfigStore.getState().user.name).toBe('测试者');

    // 2. 改头像（模拟 base64）
    useConfigStore.getState().updateUser({ avatar: 'data:image/png;base64,iVBORw0KGgo=' });
    expect(useConfigStore.getState().user.avatar).toMatch(/^data:image/);

    // 3. 改模型配置
    useConfigStore.getState().updateApiConfig({
      model: 'gpt-4o',
      temperature: 0.8,
      maxTokens: 8000,
    });
    expect(useConfigStore.getState().api.model).toBe('gpt-4o');

    // 4. 调整生成配置
    useConfigStore.getState().updateGeneration({
      temperature: 0.9,
      maxTokens: 4000,
      toneId: 'creative',
      systemPrompt: 'PROMPT',
    });

    // 5. 选用提示词模板
    useConfigStore.getState().updateGeneration({
      promptTemplateId: 'creative-writer',
      systemPrompt: 'creative writer prompt',
    });
    expect(useConfigStore.getState().generation.promptTemplateId).toBe('creative-writer');

    // 6. 保存预设
    useConfigStore.getState().addPreset({
      name: '创意写作模式',
      emoji: '🎨',
      config: { ...useConfigStore.getState().generation },
    });
    const beforeApply = useConfigStore.getState().presets.length;

    // 7. 修改后应用预设（取刚加的）
    useConfigStore.getState().updateGeneration({ temperature: 0.1 });
    expect(useConfigStore.getState().generation.temperature).toBe(0.1);
    const newPreset = useConfigStore.getState().presets[useConfigStore.getState().presets.length - 1];
    useConfigStore.getState().applyPreset(newPreset.id);
    expect(useConfigStore.getState().generation.temperature).toBe(0.9);
    expect(useConfigStore.getState().generation.toneId).toBe('creative');
    expect(useConfigStore.getState().generation.systemPrompt).toBe('creative writer prompt');

    // 8. 删除刚加的预设
    useConfigStore.getState().removePreset(newPreset.id);
    expect(useConfigStore.getState().presets.length).toBe(beforeApply - 1);
  });

  it('应预填 6 个内置提示词预设', () => {
    expect(BUILT_IN_PRESETS.length).toBe(6);
    const names = BUILT_IN_PRESETS.map((p) => p.name);
    ['创意写作', '技术专家', '学习辅导', '模拟面试', '翻译助理', '故事创作']
      .forEach((n) => expect(names).toContain(n));
  });

  it('应预填 6 个内置 Skill 组合预设', () => {
    expect(BUILT_IN_SKILL_PRESETS.length).toBe(6);
    const names = BUILT_IN_SKILL_PRESETS.map((p) => p.name);
    ['开发者工具箱', '写作工坊', '办公助理', '求职面试', '生活助手', '数据研究']
      .forEach((n) => expect(names).toContain(n));
  });

  it('应能加载全部 19 个 skill', () => {
    expect(DEFAULT_SKILLS.length).toBe(19);
    const triggers = DEFAULT_SKILLS.map((s) => s.trigger);
    expect(new Set(triggers).size).toBe(19); // 无重复
  });

  it('提示词模板与 skill 应能联动', () => {
    // 学习助手 模板 配合 /explain skill
    // 代码审查 模板 配合 /review skill
    // 模拟面试 模板 配合 /interview skill
    const templateIds = new Set(PROMPT_TEMPLATES.map((t) => t.id));
    expect(templateIds.has('study-assistant')).toBe(true);
    expect(templateIds.has('code-reviewer')).toBe(true);
    expect(templateIds.has('interviewer')).toBe(true);
  });
});
