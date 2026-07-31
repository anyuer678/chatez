import { describe, it, expect } from 'vitest';
import { DEFAULT_SKILLS } from '../../constants/default-skills';

describe('DEFAULT_SKILLS', () => {
  it('应至少 15 个内置 skill', () => {
    expect(DEFAULT_SKILLS.length).toBeGreaterThanOrEqual(15);
  });

  it('每个 skill 应有完整结构', () => {
    DEFAULT_SKILLS.forEach((s) => {
      expect(s.id).toBeTruthy();
      expect(s.name).toBeTruthy();
      expect(s.trigger).toMatch(/^\//);
      expect(s.description).toBeTruthy();
      expect(s.systemPrompt).toBeTruthy();
      expect(s.isBuiltIn).toBe(true);
      expect(s.createdAt).toBeTruthy();
    });
  });

  it('trigger 不应重复', () => {
    const triggers = DEFAULT_SKILLS.map((s) => s.trigger);
    expect(new Set(triggers).size).toBe(triggers.length);
  });

  it('id 不应重复', () => {
    const ids = DEFAULT_SKILLS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('应包含核心场景的 skill', () => {
    const triggers = DEFAULT_SKILLS.map((s) => s.trigger);
    ['/sql', '/summary', '/todo', '/review', '/translate', '/interview', '/story', '/recipe']
      .forEach((t) => expect(triggers).toContain(t));
  });

  it('每个 skill 的 systemPrompt 应有具体任务说明', () => {
    DEFAULT_SKILLS.forEach((s) => {
      // 任务说明通常包含 任务： 或 你是
      const hasTaskOrRole = s.systemPrompt.includes('任务') || s.systemPrompt.includes('你是');
      expect(hasTaskOrRole).toBe(true);
    });
  });
});
