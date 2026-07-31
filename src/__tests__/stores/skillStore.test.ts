import { describe, it, expect, beforeEach } from 'vitest';
import { useSkillStore } from '../../stores/skillStore';
import { DEFAULT_SKILLS } from '../../constants/default-skills';

describe('SkillStore', () => {
  beforeEach(() => {
    useSkillStore.setState({
      skills: DEFAULT_SKILLS,
      activeSkillId: null,
    });
  });

  it('should have default skills', () => {
    const { skills } = useSkillStore.getState();
    expect(skills.length).toBeGreaterThan(0);
    expect(skills[0].id).toBe('sql_generator');
  });

  it('should set active skill', () => {
    useSkillStore.getState().setActiveSkill('sql_generator');
    expect(useSkillStore.getState().activeSkillId).toBe('sql_generator');
  });

  it('should clear active skill', () => {
    useSkillStore.getState().setActiveSkill('sql_generator');
    useSkillStore.getState().setActiveSkill(null);
    expect(useSkillStore.getState().activeSkillId).toBeNull();
  });

  it('should get skill by id', () => {
    const skill = useSkillStore.getState().getSkill('sql_generator');
    expect(skill).toBeDefined();
    expect(skill?.name).toBe('SQL 生成器');
    expect(skill?.trigger).toBe('/sql');
  });

  it('should return undefined for unknown skill', () => {
    const skill = useSkillStore.getState().getSkill('unknown');
    expect(skill).toBeUndefined();
  });

  it('should get all skills', () => {
    const skills = useSkillStore.getState().getAllSkills();
    expect(skills.length).toBe(DEFAULT_SKILLS.length);
  });

  it('should get custom skills', () => {
    useSkillStore.getState().addSkill({
      id: 'custom_test',
      name: 'Custom Test',
      trigger: '/test',
      description: 'Test skill',
      systemPrompt: 'Test',
      isBuiltIn: false,
      createdAt: '2026-06-28',
      updatedAt: '2026-06-28',
    });

    const customSkills = useSkillStore.getState().getCustomSkills();
    expect(customSkills.length).toBe(1);
    expect(customSkills[0].id).toBe('custom_test');
  });

  it('should get built-in skills', () => {
    const builtInSkills = useSkillStore.getState().getBuiltInSkills();
    expect(builtInSkills.length).toBe(DEFAULT_SKILLS.length);
    expect(builtInSkills.every((s) => s.isBuiltIn)).toBe(true);
  });

  it('should add custom skill', () => {
    useSkillStore.getState().addSkill({
      id: 'new_skill',
      name: 'New Skill',
      trigger: '/new',
      description: 'New skill',
      systemPrompt: 'New',
      isBuiltIn: false,
      createdAt: '2026-06-28',
      updatedAt: '2026-06-28',
    });

    const { skills } = useSkillStore.getState();
    expect(skills.length).toBe(DEFAULT_SKILLS.length + 1);
    expect(skills.find((s) => s.id === 'new_skill')).toBeDefined();
  });

  it('should remove skill', () => {
    useSkillStore.getState().addSkill({
      id: 'to_remove',
      name: 'To Remove',
      trigger: '/remove',
      description: 'Remove me',
      systemPrompt: 'Remove',
      isBuiltIn: false,
      createdAt: '2026-06-28',
      updatedAt: '2026-06-28',
    });

    expect(useSkillStore.getState().skills.length).toBe(DEFAULT_SKILLS.length + 1);

    useSkillStore.getState().removeSkill('to_remove');

    expect(useSkillStore.getState().skills.length).toBe(DEFAULT_SKILLS.length);
  });

  it('should update skill', () => {
    useSkillStore.getState().addSkill({
      id: 'to_update',
      name: 'Original Name',
      trigger: '/update',
      description: 'Original',
      systemPrompt: 'Original',
      isBuiltIn: false,
      createdAt: '2026-06-28',
      updatedAt: '2026-06-28',
    });

    useSkillStore.getState().updateSkill('to_update', { name: 'Updated Name', description: 'Updated' });

    const { skills } = useSkillStore.getState();
    const updated = skills.find((s) => s.id === 'to_update');
    expect(updated?.name).toBe('Updated Name');
    expect(updated?.description).toBe('Updated');
  });

  it('should export skills', () => {
    useSkillStore.getState().addSkill({
      id: 'export_test',
      name: 'Export Test',
      trigger: '/export',
      description: 'Export',
      systemPrompt: 'Export',
      isBuiltIn: false,
      createdAt: '2026-06-28',
      updatedAt: '2026-06-28',
    });

    const exported = useSkillStore.getState().exportSkills();
    const parsed = JSON.parse(exported);

    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(1);
    expect(parsed[0].id).toBe('export_test');
  });

  it('should import skills', () => {
    const importData = JSON.stringify([
      {
        id: 'imported_skill',
        name: 'Imported',
        trigger: '/import',
        description: 'Imported skill',
        systemPrompt: 'Imported',
        isBuiltIn: false,
        createdAt: '2026-06-28',
        updatedAt: '2026-06-28',
      },
    ]);

    const result = useSkillStore.getState().importSkills(importData);
    expect(result).toBe(true);

    const { skills } = useSkillStore.getState();
    expect(skills.find((s) => s.id === 'imported_skill')).toBeDefined();
  });

  it('should not import invalid data', () => {
    const result = useSkillStore.getState().importSkills('invalid json');
    expect(result).toBe(false);
  });

  it('should not import duplicate skills', () => {
    const importData = JSON.stringify([
      {
        id: 'sql_generator',
        name: 'Duplicate',
        trigger: '/dup',
        description: 'Duplicate',
        systemPrompt: 'Duplicate',
        isBuiltIn: false,
        createdAt: '2026-06-28',
        updatedAt: '2026-06-28',
      },
    ]);

    useSkillStore.getState().importSkills(importData);

    const { skills } = useSkillStore.getState();
    const sqlGenerators = skills.filter((s) => s.id === 'sql_generator');
    expect(sqlGenerators).toHaveLength(1);
  });

  it('should reset skills', () => {
    useSkillStore.getState().addSkill({
      id: 'temp_skill',
      name: 'Temp',
      trigger: '/temp',
      description: 'Temp',
      systemPrompt: 'Temp',
      isBuiltIn: false,
      createdAt: '2026-06-28',
      updatedAt: '2026-06-28',
    });

    expect(useSkillStore.getState().skills.length).toBe(DEFAULT_SKILLS.length + 1);

    useSkillStore.getState().resetSkills();

    expect(useSkillStore.getState().skills.length).toBe(DEFAULT_SKILLS.length);
    expect(useSkillStore.getState().activeSkillId).toBeNull();
  });

  it('should ignore setActiveSkill for non-existent id (防止幽灵角色激活)', () => {
    // 关键：被删除的 skill 不能被重新激活，否则 UI 会显示"激活了不存在的 skill"
    useSkillStore.getState().setActiveSkill('not_exists_xxx');
    expect(useSkillStore.getState().activeSkillId).toBeNull();
  });

  it('should treat empty/whitespace string as null in setActiveSkill', () => {
    useSkillStore.getState().setActiveSkill('sql_generator');
    expect(useSkillStore.getState().activeSkillId).toBe('sql_generator');

    useSkillStore.getState().setActiveSkill('');
    expect(useSkillStore.getState().activeSkillId).toBeNull();

    useSkillStore.getState().setActiveSkill('  ');
    expect(useSkillStore.getState().activeSkillId).toBeNull();
  });
});
