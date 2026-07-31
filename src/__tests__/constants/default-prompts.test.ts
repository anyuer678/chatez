import { describe, it, expect } from 'vitest';
import { DEFAULT_PROMPTS } from '../../constants/default-prompts';

describe('DEFAULT_PROMPTS · 提示词市场角色', () => {
  it('应至少 30 个内置角色（5 → 30+）', () => {
    expect(DEFAULT_PROMPTS.length).toBeGreaterThanOrEqual(30);
  });

  it('每个角色应有完整结构', () => {
    DEFAULT_PROMPTS.forEach((p) => {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.description).toBeTruthy();
      expect(p.systemPrompt).toBeTruthy();
      expect(p.systemPrompt.length).toBeGreaterThan(20);
      expect(typeof p.temperature).toBe('number');
      expect(p.tags).toBeInstanceOf(Array);
      expect(p.isBuiltIn).toBe(true);
      expect(p.createdAt).toBeTruthy();
    });
  });

  it('id 不应重复', () => {
    const ids = DEFAULT_PROMPTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('应覆盖 8 大场景分类', () => {
    const allTags = new Set(DEFAULT_PROMPTS.flatMap((p) => p.tags));
    ['学习', '编程', '写作', '职场', '生活', '咨询', '语言', '工具'].forEach((tag) => {
      expect(allTags.has(tag)).toBe(true);
    });
  });

  it('应包含核心场景角色', () => {
    const names = DEFAULT_PROMPTS.map((p) => p.name);
    [
      '学习导师', '编程助手', '写作润色', '模拟面试官', '翻译专家',
      '私厨', '心理咨询师', '产品经理', '设计师', '总结大师',
    ].forEach((name) => expect(names).toContain(name));
  });

  it('temperature 范围合理（0.1-1.0）', () => {
    DEFAULT_PROMPTS.forEach((p) => {
      expect(p.temperature).toBeGreaterThanOrEqual(0.1);
      expect(p.temperature).toBeLessThanOrEqual(1.0);
    });
  });

  it('每个角色的 systemPrompt 应包含「要求/规则/任务/目标」之一', () => {
    DEFAULT_PROMPTS.forEach((p) => {
      const hasRuleOrTask =
        p.systemPrompt.includes('要求') ||
        p.systemPrompt.includes('规则') ||
        p.systemPrompt.includes('任务') ||
        p.systemPrompt.includes('目标');
      expect(hasRuleOrTask).toBe(true);
    });
  });
});
