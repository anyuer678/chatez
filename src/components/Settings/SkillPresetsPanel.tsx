import { useState } from 'react';
import { Sparkles, Check, ChevronRight, Zap, Users, X } from 'lucide-react';
import {
  useConfigStore,
  BUILT_IN_SKILL_PRESETS,
  type SkillPreset,
} from '../../stores/configStore';
import { useSkillStore } from '../../stores/skillStore';
import { DEFAULT_SKILLS } from '../../constants/default-skills';

interface SkillPresetsPanelProps {
  /**
   * 应用后回调（用于关闭弹窗等）
   */
  onApplied?: () => void;
}

/**
 * Skill 组合预设面板
 * 6 个内置组合：开发者工具箱 / 写作工坊 / 办公助理 / 求职面试 / 生活助手 / 数据研究
 * 点击后：
 *  1. 激活预设中第一个 skill（让 InputBox 上方出现激活指示器）
 *  2. 注入预设提示词 + 语气 + 温度到 generation
 *  3. 标记 generation.activePresetId，让面板展示"当前使用"高亮
 */
export function SkillPresetsPanel({ onApplied }: SkillPresetsPanelProps) {
  const config = useConfigStore();
  const { setActiveSkill } = useSkillStore();
  const [appliedId, setAppliedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 当前激活的 preset（持久化在 configStore.generation.activePresetId）
  const activePresetId = config.generation.activePresetId || '';
  const activePreset = BUILT_IN_SKILL_PRESETS.find((p) => p.id === activePresetId);

  // 查找 skill name
  const skillMap = new Map(DEFAULT_SKILLS.map((s) => [s.id, s] as const));

  const handleApply = (preset: SkillPreset) => {
    // 1. 启用所有预设中的 skill（合并而非覆盖——这样用户连点多个 preset 都能累加）
    //    这同时也让 enabledSkills 真正生效（被 skill-engine 的 filterAvailableSkills 读取）
    const enabledSkills = Array.from(
      new Set([...config.skill.enabledSkills, ...preset.skillIds]),
    );
    config.updateSkillConfig({ enabledSkills });

    // 2. 注入预设的 system prompt + 语气 + 温度
    config.updateGeneration({
      systemPrompt: preset.systemPrompt,
      promptTemplateId: '',
      toneId: preset.toneId,
      temperature: preset.temperature,
      activePresetId: preset.id,
    });

    // 3. 激活预设中第一个 skill（这样 InputBox 顶部会出现激活标签，
    //    用户立刻看到"真的激活了"，避免"点了没反应"）
    if (preset.skillIds.length > 0) {
      setActiveSkill(preset.skillIds[0]);
    }

    setAppliedId(preset.id);
    setTimeout(() => {
      setAppliedId(null);
      onApplied?.();
    }, 800);
  };

  /**
   * 停用当前预设：清空 activePresetId + 关闭激活的 skill
   * 注意：不清空 enabledSkills——因为 enabledSkills 是多个 preset 累加的，
   * 停用一个不应撤销另一个 preset 启用的 skill
   */
  const handleDeactivate = () => {
    config.updateGeneration({ activePresetId: '' });
    setActiveSkill(null);
  };

  /**
   * 移除该预设中所有 skill 的 enabled 标记
   * 用于"清空此组合的启用状态"——只移除该 preset 涉及的 skill，
   * 不影响其他 preset 启用的 skill
   */
  const handleClearEnabled = (preset: SkillPreset) => {
    if (!confirm(`清空「${preset.name}」组合中所有 skill 的启用状态？\n（其他 preset 启用的 skill 不受影响）`)) {
      return;
    }
    const removeSet = new Set(preset.skillIds);
    const enabledSkills = config.skill.enabledSkills.filter((id) => !removeSet.has(id));
    config.updateSkillConfig({ enabledSkills });
    if (activePresetId === preset.id) {
      handleDeactivate();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <label
            className="text-xs font-handwriting-en text-base flex items-center gap-1.5"
            style={{ color: 'var(--text-muted)' }}
          >
            <Zap size={12} />
            Skill 组合预设
          </label>
          <p
            className="text-[10px] font-handwriting-en mt-0.5"
            style={{ color: 'var(--text-muted)' }}
          >
            一次性激活多个 skill + 注入预设系统提示词 + 设置语气
          </p>
        </div>
        {/* 当前激活的 preset 标签（带停用按钮） */}
        {activePreset && (
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-full border-2 flex-shrink-0"
            style={{
              backgroundColor: 'var(--accent-light)',
              borderColor: 'var(--accent)',
              borderStyle: 'solid',
            }}
            title={`当前使用：${activePreset.name}`}
          >
            <span className="text-base leading-none">{activePreset.emoji}</span>
            <span
              className="text-[11px] font-handwriting-cn font-medium whitespace-nowrap"
              style={{ color: 'var(--accent)' }}
            >
              {activePreset.name}
            </span>
            <button
              onClick={handleDeactivate}
              className="p-0.5 rounded-full hover:bg-[var(--bg-hover)] transition-colors flex-shrink-0"
              aria-label="停用预设"
              title="停用预设"
            >
              <X size={11} style={{ color: 'var(--accent)' }} />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {BUILT_IN_SKILL_PRESETS.map((preset) => {
          const expanded = expandedId === preset.id;
          const applied = appliedId === preset.id;
          const isActive = activePresetId === preset.id;
          return (
            <div
              key={preset.id}
              className="rounded-paper border-2 transition-all overflow-hidden"
              style={{
                backgroundColor: isActive
                  ? 'var(--paper-yellow)'
                  : applied
                    ? 'var(--paper-yellow)'
                    : 'var(--bg-card)',
                borderColor: isActive ? 'var(--accent)' : 'var(--border-light)',
                borderStyle: isActive ? 'solid' : 'dashed',
              }}
            >
              <div className="flex items-center gap-2 p-2">
                <span className="text-2xl flex-shrink-0">{preset.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-medium font-handwriting-cn flex items-center gap-1.5"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {preset.name}
                    {isActive && (
                      <span
                        className="text-[9px] font-handwriting-en px-1 rounded-paper flex items-center gap-0.5"
                        style={{
                          backgroundColor: 'var(--accent)',
                          color: 'var(--bg-card)',
                        }}
                      >
                        <Check size={8} />
                        使用中
                      </span>
                    )}
                    <span
                      className="text-[9px] font-handwriting-en px-1 rounded-paper"
                      style={{
                        backgroundColor: 'var(--paper-yellow)',
                        color: 'var(--accent)',
                        border: '1px dashed var(--border-light)',
                      }}
                    >
                      {preset.skillIds.length} skill
                    </span>
                  </div>
                  <div
                    className="text-[10px] font-handwriting-en truncate"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {preset.description}
                  </div>
                </div>
                <button
                  onClick={() => setExpandedId(expanded ? null : preset.id)}
                  className="p-1 rounded-paper hover:bg-black/5 flex-shrink-0"
                  title="查看详情"
                >
                  <ChevronRight
                    size={12}
                    style={{
                      color: 'var(--text-muted)',
                      transform: expanded ? 'rotate(90deg)' : 'none',
                      transition: 'transform 0.2s',
                    }}
                  />
                </button>
              </div>

              {expanded && (
                <div
                  className="px-2 pb-2 pt-1 border-t space-y-1.5 animate-fade-in"
                  style={{ borderColor: 'var(--border-light)' }}
                >
                  <div>
                    <div
                      className="text-[10px] font-handwriting-en mb-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      包含 skills
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {preset.skillIds.map((id) => {
                        const s = skillMap.get(id);
                        return (
                          <span
                            key={id}
                            className="text-[10px] font-handwriting-cn px-1.5 py-0.5 rounded-paper"
                            style={{
                              backgroundColor: 'var(--paper-yellow)',
                              color: 'var(--text-primary)',
                              border: '1px solid var(--border-light)',
                            }}
                          >
                            {s?.trigger ?? id} {s?.name ?? ''}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <div
                      className="text-[10px] font-handwriting-en mb-0.5"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      预设提示词
                    </div>
                    <div
                      className="text-[11px] font-handwriting-cn p-2 rounded-paper"
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                        border: '1px dashed var(--border-light)',
                      }}
                    >
                      {preset.systemPrompt}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-handwriting-en" style={{ color: 'var(--text-muted)' }}>
                    <span>温度 {preset.temperature}</span>
                    <span>·</span>
                    <span>语气 {preset.toneId}</span>
                  </div>
                </div>
              )}

              <div className="px-2 pb-2 flex gap-1.5">
                <button
                  onClick={() => handleApply(preset)}
                  className="flex-1 text-[11px] flex items-center justify-center gap-1 py-1.5 rounded-paper border-2 border-double font-handwriting-cn transition-all"
                  style={{
                    backgroundColor: isActive
                      ? 'var(--accent)'
                      : applied
                        ? 'var(--accent)'
                        : 'var(--paper-yellow)',
                    color: isActive || applied ? 'var(--bg-card)' : 'var(--accent-hover)',
                    borderColor: 'var(--accent)',
                  }}
                >
                  {isActive ? (
                    <>
                      <Check size={12} />
                      当前使用
                    </>
                  ) : applied ? (
                    <>
                      <Check size={12} />
                      已激活
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} />
                      启用此组合
                    </>
                  )}
                </button>
                {/* 清除启用状态：仅当此 preset 的 skill 有被启用时显示 */}
                {preset.skillIds.some((id) => config.skill.enabledSkills.includes(id)) && (
                  <button
                    onClick={() => handleClearEnabled(preset)}
                    className="px-2 text-[10px] flex items-center justify-center gap-1 py-1.5 rounded-paper border-2 border-dashed font-handwriting-en transition-all"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-muted)',
                      borderColor: 'var(--border-light)',
                    }}
                    title="仅清空此组合中 skill 的启用标记，不影响其他预设"
                  >
                    <X size={10} />
                    清除
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="text-[10px] font-handwriting-en p-2 rounded-paper border border-dashed"
        style={{
          backgroundColor: 'var(--paper-yellow)',
          color: 'var(--text-muted)',
          borderColor: 'var(--border-light)',
        }}
      >
        <Users size={10} className="inline mr-1" />
        内置 6 个 Skill 组合，覆盖开发/写作/办公/面试/生活/数据 6 大场景。
        点击「启用」会激活组合中的所有 skill 并注入预设系统提示词，可随时在「生成」面板调整。
      </div>
    </div>
  );
}
