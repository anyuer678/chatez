import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useConfigStore } from '../../stores/configStore';

describe('ConfigStore', () => {
  beforeEach(() => {
    useConfigStore.setState({
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
    });
  });

  it('should have default config', () => {
    const state = useConfigStore.getState();
    expect(state.api.provider).toBe('openai');
    expect(state.api.model).toBe('gpt-4o-mini');
    expect(state.ui.theme).toBe('light');
    expect(state.skill.autoDetect).toBe(true);
  });

  it('should update api config', () => {
    useConfigStore.getState().updateApiConfig({
      apiKey: 'sk-test-key',
      model: 'gpt-4o',
    });

    const state = useConfigStore.getState();
    expect(state.api.apiKey).toBe('sk-test-key');
    expect(state.api.model).toBe('gpt-4o');
    expect(state.api.provider).toBe('openai');
  });

  it('should update ui config', () => {
    useConfigStore.getState().updateUiConfig({
      theme: 'dark',
      fontSize: 16,
    });

    const state = useConfigStore.getState();
    expect(state.ui.theme).toBe('dark');
    expect(state.ui.fontSize).toBe(16);
    expect(state.ui.sendWithEnter).toBe(true);
  });

  it('should update skill config', () => {
    useConfigStore.getState().updateSkillConfig({
      autoDetect: false,
      enabledSkills: ['sql_generator'],
    });

    const state = useConfigStore.getState();
    expect(state.skill.autoDetect).toBe(false);
    expect(state.skill.enabledSkills).toEqual(['sql_generator']);
  });

  it('should reset config', () => {
    useConfigStore.getState().updateApiConfig({ apiKey: 'sk-test', model: 'gpt-4o' });
    useConfigStore.getState().updateUiConfig({ theme: 'dark' });

    useConfigStore.getState().resetConfig();

    const state = useConfigStore.getState();
    expect(state.api.apiKey).toBe('');
    expect(state.api.model).toBe('gpt-4o-mini');
    expect(state.ui.theme).toBe('light');
  });

  it('should export config', () => {
    useConfigStore.getState().updateApiConfig({ apiKey: 'sk-test' });
    // Mock confirm to auto-approve
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const exported = useConfigStore.getState().exportConfig();
    expect(exported).toBeTruthy();
    const parsed = JSON.parse(exported!);

    expect(parsed.api.apiKey).toBe('***REDACTED***');
    expect(parsed.api.model).toBe('gpt-4o-mini');
    expect(parsed.ui).toBeDefined();
    expect(parsed.skill).toBeDefined();
  });

  it('should import config', () => {
    const importData = JSON.stringify({
      api: {
        apiKey: 'sk-imported',
        model: 'gpt-4o',
      },
      ui: {
        theme: 'dark',
      },
    });

    const result = useConfigStore.getState().importConfig(importData);
    expect(result).toBe(true);

    const state = useConfigStore.getState();
    expect(state.api.apiKey).toBe('sk-imported');
    expect(state.api.model).toBe('gpt-4o');
    expect(state.ui.theme).toBe('dark');
    expect(state.api.provider).toBe('openai');
  });

  it('should handle invalid import', () => {
    const result = useConfigStore.getState().importConfig('invalid json');
    expect(result).toBe(false);
  });

  it('should handle partial import', () => {
    const importData = JSON.stringify({
      api: {
        apiKey: 'sk-partial',
      },
    });

    useConfigStore.getState().importConfig(importData);

    const state = useConfigStore.getState();
    expect(state.api.apiKey).toBe('sk-partial');
    expect(state.api.model).toBe('gpt-4o-mini');
    expect(state.ui.theme).toBe('light');
  });

  it('should have empty activePresetId by default', () => {
    const state = useConfigStore.getState();
    expect(state.generation.activePresetId).toBe('');
  });

  it('should set activePresetId via updateGeneration', () => {
    useConfigStore.getState().updateGeneration({
      activePresetId: 'sp-dev',
      systemPrompt: 'test prompt',
      temperature: 0.3,
    });

    const state = useConfigStore.getState();
    expect(state.generation.activePresetId).toBe('sp-dev');
    expect(state.generation.systemPrompt).toBe('test prompt');
    expect(state.generation.temperature).toBe(0.3);
  });

  it('should clear activePresetId by passing empty string', () => {
    useConfigStore.getState().updateGeneration({ activePresetId: 'sp-dev' });
    expect(useConfigStore.getState().generation.activePresetId).toBe('sp-dev');

    useConfigStore.getState().updateGeneration({ activePresetId: '' });
    expect(useConfigStore.getState().generation.activePresetId).toBe('');
  });
});
