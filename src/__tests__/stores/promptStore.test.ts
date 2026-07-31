import { describe, it, expect, beforeEach } from 'vitest';
import { usePromptStore } from '../../stores/promptStore';
import { DEFAULT_PROMPTS } from '../../constants/default-prompts';

describe('PromptStore', () => {
  beforeEach(() => {
    usePromptStore.setState({
      prompts: DEFAULT_PROMPTS,
      activePromptId: null,
    });
  });

  it('should have default prompts', () => {
    const { prompts } = usePromptStore.getState();
    expect(prompts.length).toBeGreaterThan(0);
    expect(prompts[0].id).toBe('learning_tutor');
  });

  it('should set active prompt', () => {
    usePromptStore.getState().setActivePrompt('coding_assistant');
    expect(usePromptStore.getState().activePromptId).toBe('coding_assistant');
  });

  it('should get active prompt', () => {
    usePromptStore.getState().setActivePrompt('coding_assistant');

    const activePrompt = usePromptStore.getState().getActivePrompt();
    expect(activePrompt?.id).toBe('coding_assistant');
    expect(activePrompt?.name).toBe('编程助手');
  });

  it('should return undefined for no active prompt', () => {
    const activePrompt = usePromptStore.getState().getActivePrompt();
    expect(activePrompt).toBeUndefined();
  });

  it('should add custom prompt', () => {
    const customPrompt = {
      id: 'custom_test',
      name: 'Test Prompt',
      description: 'A test prompt',
      systemPrompt: 'You are a test assistant.',
      temperature: 0.5,
      memoryMode: 'session' as const,
      tags: ['test'],
      isBuiltIn: false,
      createdAt: '2026-06-28',
      updatedAt: '2026-06-28',
    };

    usePromptStore.getState().addPrompt(customPrompt);

    const { prompts } = usePromptStore.getState();
    expect(prompts).toHaveLength(DEFAULT_PROMPTS.length + 1);
    expect(prompts.find((p) => p.id === 'custom_test')).toBeDefined();
  });

  it('should remove prompt', () => {
    usePromptStore.getState().removePrompt('learning_tutor');

    const { prompts } = usePromptStore.getState();
    expect(prompts).toHaveLength(DEFAULT_PROMPTS.length - 1);
    expect(prompts.find((p) => p.id === 'learning_tutor')).toBeUndefined();
  });

  it('should export prompts', () => {
    usePromptStore.getState().addPrompt({
      id: 'custom_export',
      name: 'Export Test',
      description: 'Test',
      systemPrompt: 'Test',
      temperature: 0.5,
      memoryMode: 'session',
      tags: [],
      isBuiltIn: false,
      createdAt: '2026-06-28',
      updatedAt: '2026-06-28',
    });

    const exported = usePromptStore.getState().exportPrompts();
    const parsed = JSON.parse(exported);

    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(1);
    expect(parsed[0].id).toBe('custom_export');
  });

  it('should import prompts', () => {
    const importData = JSON.stringify([
      {
        id: 'imported_1',
        name: 'Imported',
        description: 'Imported prompt',
        systemPrompt: 'You are imported.',
        temperature: 0.5,
        memoryMode: 'session',
        tags: ['imported'],
        isBuiltIn: false,
        createdAt: '2026-06-28',
        updatedAt: '2026-06-28',
      },
    ]);

    const result = usePromptStore.getState().importPrompts(importData);
    expect(result).toBe(true);

    const { prompts } = usePromptStore.getState();
    expect(prompts.find((p) => p.id === 'imported_1')).toBeDefined();
  });

  it('should not import duplicate prompts', () => {
    const importData = JSON.stringify([
      {
        id: 'learning_tutor',
        name: 'Duplicate',
        description: 'Duplicate',
        systemPrompt: 'Duplicate',
        temperature: 0.5,
        memoryMode: 'session',
        tags: [],
        isBuiltIn: false,
        createdAt: '2026-06-28',
        updatedAt: '2026-06-28',
      },
    ]);

    usePromptStore.getState().importPrompts(importData);

    const { prompts } = usePromptStore.getState();
    const learningTutor = prompts.filter((p) => p.id === 'learning_tutor');
    expect(learningTutor).toHaveLength(1);
  });

  it('should reset prompts', () => {
    usePromptStore.getState().addPrompt({
      id: 'temp',
      name: 'Temp',
      description: 'Temp',
      systemPrompt: 'Temp',
      temperature: 0.5,
      memoryMode: 'session',
      tags: [],
      isBuiltIn: false,
      createdAt: '2026-06-28',
      updatedAt: '2026-06-28',
    });

    expect(usePromptStore.getState().prompts.length).toBe(DEFAULT_PROMPTS.length + 1);

    usePromptStore.getState().resetPrompts();

    expect(usePromptStore.getState().prompts.length).toBe(DEFAULT_PROMPTS.length);
    expect(usePromptStore.getState().activePromptId).toBeNull();
  });

  // ============ 版本迁移测试 ============
  describe('persist migration', () => {
    it('version 应为 8（归一化 activePromptId）', () => {
      // 读取 store 配置
      const persistApi = (usePromptStore as unknown as { persist?: { getOptions?: () => { name: string; version: number } } }).persist;
      const opts = persistApi?.getOptions?.();
      expect(opts?.name).toBe('chatez-prompt');
      expect(opts?.version).toBe(8);
    });

    it('migrate 应合并 v1/v2 的旧数据 + 当前所有默认角色', async () => {
      // 模拟旧版本（v2）数据：只有 5 个旧角色 + 1 个用户自定义
      const oldState = {
        prompts: [
          { id: 'old_role_1', name: '旧角色1', description: 'd', systemPrompt: 'You are old role 1.', temperature: 0.5, memoryMode: 'session', tags: ['旧'], isBuiltIn: false, createdAt: '2026-06-01', updatedAt: '2026-06-01' },
          { id: 'old_role_2', name: '旧角色2', description: 'd', systemPrompt: 'You are old role 2.', temperature: 0.5, memoryMode: 'session', tags: ['旧'], isBuiltIn: false, createdAt: '2026-06-01', updatedAt: '2026-06-01' },
          { id: 'custom_user', name: '我的自定义', description: 'd', systemPrompt: 'You are custom.', temperature: 0.7, memoryMode: 'session', tags: ['自定义'], isBuiltIn: false, createdAt: '2026-06-01', updatedAt: '2026-06-01' },
        ],
        activePromptId: 'custom_user',
      };

      // 直接调用 store 的 persist 配置中的 migrate
      const persistOpts = (usePromptStore as unknown as { persist: { getOptions: () => { migrate?: (s: unknown, v: number) => unknown } } }).persist.getOptions();
      const migrate = persistOpts.migrate;
      expect(migrate).toBeDefined();

      const migratedV1 = migrate!(oldState, 1) as { prompts: Array<{ id: string }>; activePromptId: string | null };
      const migratedV2 = migrate!(oldState, 2) as { prompts: Array<{ id: string }>; activePromptId: string | null };

      // 迁移后应包含：旧的 3 个 + 全部 30 个默认角色
      expect(migratedV1.prompts.length).toBeGreaterThanOrEqual(DEFAULT_PROMPTS.length + 3);
      expect(migratedV2.prompts.length).toBeGreaterThanOrEqual(DEFAULT_PROMPTS.length + 3);

      // 保留用户旧角色
      expect(migratedV1.prompts.find((p) => p.id === 'old_role_1')).toBeDefined();
      expect(migratedV1.prompts.find((p) => p.id === 'old_role_2')).toBeDefined();
      // 保留用户自定义
      expect(migratedV1.prompts.find((p) => p.id === 'custom_user')).toBeDefined();
      // 保留 activePromptId
      expect(migratedV1.activePromptId).toBe('custom_user');

      // 包含全部默认角色
      DEFAULT_PROMPTS.forEach((p) => {
        expect(migratedV1.prompts.find((x) => x.id === p.id)).toBeDefined();
      });
      // 不重复
      expect(new Set(migratedV1.prompts.map((p) => p.id)).size).toBe(migratedV1.prompts.length);
    });

    it('migrate v3 -> v4 应为所有角色添加 pinned 状态（默认 5 个常用）', () => {
      // 模拟 v3 数据：没有 pinned 字段
      const v3State = {
        prompts: [
          { id: 'coding_assistant', name: '编程助手', description: 'd', systemPrompt: 'p', temperature: 0.5, memoryMode: 'session', tags: [], isBuiltIn: true, createdAt: '2026-06-01', updatedAt: '2026-06-01' },
          { id: 'custom_user', name: '我的自定义', description: 'd', systemPrompt: 'p', temperature: 0.7, memoryMode: 'session', tags: [], isBuiltIn: false, createdAt: '2026-06-01', updatedAt: '2026-06-01' },
        ],
        activePromptId: null,
      };

      const persistOpts = (usePromptStore as unknown as { persist: { getOptions: () => { migrate?: (s: unknown, v: number) => unknown } } }).persist.getOptions();
      const migrate = persistOpts.migrate!;

      const migrated = migrate(v3State, 3) as { prompts: Array<{ id: string; pinned?: boolean }> };

      // 默认常用角色被标记
      const coding = migrated.prompts.find((p) => p.id === 'coding_assistant');
      expect(coding?.pinned).toBe(true);

      // 用户自定义：不是默认常用列表中时，默认 pinned=undefined（视为 false）
      const custom = migrated.prompts.find((p) => p.id === 'custom_user');
      expect(custom?.pinned).toBeFalsy();
    });

    it('migrate v3 -> v4 保留用户已设置的 pinned 状态', () => {
      // 模拟用户已经在 v3 之后手动改过 pinned 状态
      const v3State = {
        prompts: [
          { id: 'kids_teacher', name: '少儿老师', description: 'd', systemPrompt: 'p', temperature: 0.5, memoryMode: 'session', tags: [], isBuiltIn: true, pinned: true, createdAt: '2026-06-01', updatedAt: '2026-06-01' },
          { id: 'coding_assistant', name: '编程助手', description: 'd', systemPrompt: 'p', temperature: 0.5, memoryMode: 'session', tags: [], isBuiltIn: true, pinned: false, createdAt: '2026-06-01', updatedAt: '2026-06-01' },
        ],
        activePromptId: null,
      };

      const persistOpts = (usePromptStore as unknown as { persist: { getOptions: () => { migrate?: (s: unknown, v: number) => unknown } } }).persist.getOptions();
      const migrate = persistOpts.migrate!;

      const migrated = migrate(v3State, 3) as { prompts: Array<{ id: string; pinned?: boolean }> };

      // 用户已设置的 pinned 应保留
      const kids = migrated.prompts.find((p) => p.id === 'kids_teacher');
      expect(kids?.pinned).toBe(true);
      const coding = migrated.prompts.find((p) => p.id === 'coding_assistant');
      expect(coding?.pinned).toBe(false);
    });
  });
});
