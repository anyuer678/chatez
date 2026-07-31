import { describe, it, expect, beforeEach } from 'vitest';
import { skillEngine } from '../../lib/skill-engine';
import { useSkillStore } from '../../stores/skillStore';
import { useConfigStore } from '../../stores/configStore';
import { DEFAULT_SKILLS } from '../../constants/default-skills';

describe('SkillEngine', () => {
  // 每个测试前重置 store，避免测试间状态污染
  beforeEach(() => {
    useSkillStore.setState({ skills: DEFAULT_SKILLS, activeSkillId: null });
    useConfigStore.setState((s) => ({
      ...s,
      skill: { autoDetect: true, enabledSkills: [] },
      generation: {
        ...s.generation,
        activePresetId: '',
      },
    }));
  });

  // ============================================================
  // 命令触发（/command）
  // ============================================================
  describe('command trigger', () => {
    it('should detect command trigger with args', () => {
      const result = skillEngine.detectSkill('/sql 查询学生表');
      expect(result).not.toBeNull();
      expect(result?.skill.id).toBe('sql_generator');
      expect(result?.triggerType).toBe('command');
    });

    it('should detect command without args', () => {
      const result = skillEngine.detectSkill('/summary');
      expect(result).not.toBeNull();
      expect(result?.skill.id).toBe('knowledge_summarizer');
      expect(result?.args).toBe('/summary');
    });

    it('should return null for unknown command', () => {
      const result = skillEngine.detectSkill('/unknown');
      expect(result).toBeNull();
    });

    it('should handle command with multi-line args', () => {
      const result = skillEngine.detectSkill('/explain function foo() {\n  return 1;\n}');
      expect(result).not.toBeNull();
      expect(result?.skill.id).toBe('code_explainer');
      expect(result?.args).toContain('function foo()');
    });

    it('command trigger works regardless of enabledSkills (commands are always available for built-in)', () => {
      // 即使 enabledSkills 包含限制，command 触发仍应正常工作（因为是显式输入）
      useConfigStore.setState((s) => ({
        ...s,
        skill: { ...s.skill, enabledSkills: ['some_other_id'] },
      }));
      const result = skillEngine.detectSkill('/sql SELECT * FROM users');
      expect(result).not.toBeNull();
      expect(result?.skill.id).toBe('sql_generator');
    });
  });

  // ============================================================
  // 自然语言自动识别（keywords）
  // ============================================================
  describe('keyword auto-detect', () => {
    it('should detect by keyword (新 keywords 系统)', () => {
      // knowledge_summarizer 的 keywords 包含 "总结一下"
      const result = skillEngine.detectSkill('帮我总结一下这篇文章', true);
      expect(result).not.toBeNull();
      expect(result?.skill.id).toBe('knowledge_summarizer');
      expect(result?.triggerType).toBe('auto');
    });

    it('should detect code_explainer by keyword', () => {
      const result = skillEngine.detectSkill('解释一下这段代码', true);
      expect(result).not.toBeNull();
      expect(result?.skill.id).toBe('code_explainer');
    });

    it('should detect translator by keyword', () => {
      const result = skillEngine.detectSkill('帮我把这段话翻译成英文', true);
      expect(result).not.toBeNull();
      expect(result?.skill.id).toBe('translator');
    });

    it('should detect brainstorm by keyword', () => {
      const result = skillEngine.detectSkill('给我点想法', true);
      expect(result).not.toBeNull();
      expect(result?.skill.id).toBe('brainstorm');
    });

    it('should be case-insensitive', () => {
      const result = skillEngine.detectSkill('SQL 查询', true);
      expect(result).not.toBeNull();
      expect(result?.skill.id).toBe('sql_generator');
    });

    it('should prefer longer (more specific) keywords first', () => {
      // "代码解释" 比 "代码" 更精准，应该优先匹配 code_explainer
      const result = skillEngine.detectSkill('我想要代码解释的帮助', true);
      expect(result).not.toBeNull();
      // 即使其他 skill 含 "代码"，更长关键词胜出
      expect(result?.skill.id).toBe('code_explainer');
    });

    it('should not detect auto trigger when disabled', () => {
      const result = skillEngine.detectSkill('帮我总结一下', false);
      expect(result).toBeNull();
    });
  });

  // ============================================================
  // enabledSkills 过滤（核心新增功能）
  // ============================================================
  describe('enabledSkills filter', () => {
    it('with empty enabledSkills: all skills available (向后兼容)', () => {
      useConfigStore.setState((s) => ({
        ...s,
        skill: { ...s.skill, enabledSkills: [] },
      }));
      const result = skillEngine.detectSkill('帮我总结一下', true);
      expect(result).not.toBeNull();
    });

    it('with enabledSkills: built-in skills still available', () => {
      // 即使只放一个无关 id，内置 skill 仍可用
      useConfigStore.setState((s) => ({
        ...s,
        skill: { ...s.skill, enabledSkills: ['custom_123'] },
      }));
      const result = skillEngine.detectSkill('帮我总结一下', true);
      expect(result).not.toBeNull();
      expect(result?.skill.id).toBe('knowledge_summarizer');
    });

    it('detected skill still respects built-in always-on rule', () => {
      // 把某个内置 skill 的 enabledSkills 也加上
      useConfigStore.setState((s) => ({
        ...s,
        skill: { ...s.skill, enabledSkills: ['code_explainer'] },
      }));
      const result = skillEngine.detectSkill('解释一下这段代码', true);
      expect(result).not.toBeNull();
      expect(result?.skill.id).toBe('code_explainer');
    });

    it('getAvailableCommands returns filtered list', () => {
      useConfigStore.setState((s) => ({
        ...s,
        skill: { ...s.skill, enabledSkills: ['code_explainer'] },
      }));
      const commands = skillEngine.getAvailableCommands();
      // 内置 skill 始终可用，commands 应该 > 0
      expect(commands.length).toBeGreaterThan(0);
      // 所有内置 skill 都在
      const ids = commands.map((c) => c.command);
      expect(ids).toContain('/sql');
      expect(ids).toContain('/explain');
    });
  });

  // ============================================================
  // 边界情况
  // ============================================================
  describe('edge cases', () => {
    it('should return null for empty input', () => {
      expect(skillEngine.detectSkill('')).toBeNull();
      expect(skillEngine.detectSkill('   ')).toBeNull();
    });

    it('should return null for input without trigger or keywords', () => {
      const result = skillEngine.detectSkill('今天天气真好', true);
      expect(result).toBeNull();
    });

    it('should return null for unknown command', () => {
      const result = skillEngine.detectSkill('/xyz arg');
      expect(result).toBeNull();
    });
  });

  // ============================================================
  // buildSkillPrompt
  // ============================================================
  describe('buildSkillPrompt', () => {
    it('should build prompt with skill.systemPrompt + base + user input', () => {
      const skill = {
        id: 'test',
        name: 'Test',
        trigger: '/test',
        description: 'Test skill',
        systemPrompt: 'You are a test assistant.',
        isBuiltIn: true,
        createdAt: '2026-06-28',
        updatedAt: '2026-06-28',
      };

      const prompt = skillEngine.buildSkillPrompt(skill, 'test input', 'Base prompt');
      expect(prompt).toContain('You are a test assistant.');
      expect(prompt).toContain('Base prompt');
      expect(prompt).toContain('test input');
    });

    it('should build prompt without baseSystemPrompt', () => {
      const skill = {
        id: 'test',
        name: 'Test',
        trigger: '/test',
        description: 'Test skill',
        systemPrompt: 'You are a test assistant.',
        isBuiltIn: true,
        createdAt: '2026-06-28',
        updatedAt: '2026-06-28',
      };

      const prompt = skillEngine.buildSkillPrompt(skill, 'test input');
      expect(prompt).toContain('You are a test assistant.');
      expect(prompt).toContain('test input');
      expect(prompt).not.toContain('补充规则');
    });

    it('should build prompt without user input', () => {
      const skill = {
        id: 'test',
        name: 'Test',
        trigger: '/test',
        description: 'Test skill',
        systemPrompt: 'You are a test assistant.',
        isBuiltIn: true,
        createdAt: '2026-06-28',
        updatedAt: '2026-06-28',
      };

      const prompt = skillEngine.buildSkillPrompt(skill, '');
      expect(prompt).toContain('You are a test assistant.');
      expect(prompt).not.toContain('用户输入');
    });
  });

  // ============================================================
  // getAvailableCommands
  // ============================================================
  describe('getAvailableCommands', () => {
    it('should get available commands with correct shape', () => {
      const commands = skillEngine.getAvailableCommands();
      expect(commands.length).toBeGreaterThan(0);
      expect(commands[0]).toHaveProperty('command');
      expect(commands[0]).toHaveProperty('name');
      expect(commands[0]).toHaveProperty('description');
    });

    it('should include all default built-in skills (>= 15)', () => {
      const commands = skillEngine.getAvailableCommands();
      // 至少有 15 个内置 skill（实际 19 个）
      expect(commands.length).toBeGreaterThanOrEqual(15);
    });

    it('should have at least 15 default skills with keywords for auto-detect', () => {
      // 验证大部分 skill 都带 keywords（让自然语言自动识别可用）
      const skillsWithKeywords = DEFAULT_SKILLS.filter(
        (s) => s.keywords && s.keywords.length > 0,
      );
      expect(skillsWithKeywords.length).toBeGreaterThanOrEqual(15);
    });
  });
});
