import { useState } from 'react';
import { Sparkles, Plus, Wand2 } from 'lucide-react';
import {
  useConfigStore,
  TONE_PRESETS,
  DEFAULT_GENERATION,
  type GenerationConfig,
} from '../../stores/configStore';
import { usePromptStore } from '../../stores/promptStore';

// 示例提示（用于实时预览）
const PREVIEW_PROMPTS = [
  '介绍一下你最喜欢的季节',
  '如何学习编程？',
  '写一句问候',
];

/**
 * 估算"输出长度提示"（基于 maxTokens 粗略估算中文/英文字符数）
 */
function estimateLength(maxTokens: number): string {
  const chars = maxTokens * 2;
  if (chars < 200) return `约 ${chars} 字符（短回答）`;
  if (chars < 800) return `约 ${chars} 字符（中等）`;
  if (chars < 2000) return `约 ${chars} 字符（长篇）`;
  return `约 ${chars}+ 字符（超长）`;
}

/**
 * 实时生成预览文本（本地模拟，根据参数生成风格化示例）
 */
function generatePreview(config: GenerationConfig, prompt: string): string {
  const tone = TONE_PRESETS.find((t) => t.id === config.toneId);
  const toneName = tone?.name ?? '默认';
  const len = config.maxTokens;
  const creativity = config.temperature;

  const templates: Record<string, (p: string) => string> = {
    default: (p) => `关于"${p}"，我的看法是：它因人而异，关键在于找到适合自己的节奏。`,
    formal: (p) => `关于"${p}"，经审慎思考，我认为此事应从客观事实出发，结合实际情况加以分析。`,
    professional: (p) => `从专业角度分析"${p}"：核心要素包括理论框架、实践方法与持续优化三个维度。`,
    friendly: (p) => `哈哈，"${p}"这个问题真棒！我觉得呢，就像一杯热茶，慢慢品才有味道~`,
    concise: (p) => `"${p}"：核心是节奏。`,
    creative: (p) => `想象一下，"${p}"就像一阵风，吹过窗棂，带走昨日的尘埃，留下一缕清香。`,
    humorous: (p) => `"${p}"？这事儿嘛，连我家猫都有发言权——它选择先睡一觉再说。`,
    custom: () => `[已应用自定义语气] 这是按照您的语气配置生成的示例回答。`,
  };

  const baseText = templates[config.toneId]?.(prompt) ?? templates.default(prompt);

  let result = baseText;
  if (len > 1000) {
    result += ' 这是一个较长的回答，会展开详细论述，从历史背景、当前现状、未来趋势等多个维度进行深入探讨，确保回答全面而有深度。';
  } else if (len > 500) {
    result += ' 进一步展开说明，包含一些补充细节。';
  } else if (len < 200) {
    result = baseText.slice(0, Math.max(10, baseText.length - 8)) + '...';
  }

  const creativityHint = creativity >= 0.8
    ? '🔥 高度创造性，回答将更发散多样'
    : creativity >= 0.5
    ? '⚖️ 平衡型，回答稳定且有变化'
    : '🎯 精确型，回答更确定一致';

  return result + `\n\n— [${toneName} · T=${creativity} · 长度≈${len}]\n${creativityHint}`;
}

export function GenerationPanel() {
  const config = useConfigStore();
  const generation = config.generation;
  const { activePromptId, prompts } = usePromptStore();
  const [previewPrompt, setPreviewPrompt] = useState(PREVIEW_PROMPTS[0]);

  // 当前激活的角色（合并后：systemPrompt 由角色管理）
  const activePrompt = prompts.find((p) => p.id === activePromptId);
  const promptHint = activePrompt
    ? `🎭 角色：${activePrompt.name}`
    : '∅ 未启用角色（系统提示词为空）';

  const updateGen = (patch: Partial<GenerationConfig>) => {
    config.updateGeneration(patch);
  };

  const handleReset = () => {
    config.updateGeneration({ ...DEFAULT_GENERATION });
  };

  return (
    <div className="space-y-5">
      {/* 提示：角色管理入口 */}
      <div
        className="flex items-center gap-2 p-2.5 rounded-paper border-2 border-dashed text-[11px] font-handwriting-en"
        style={{
          backgroundColor: 'var(--paper-yellow)',
          color: 'var(--text-secondary)',
          borderColor: 'var(--accent)',
        }}
      >
        <Sparkles size={12} style={{ color: 'var(--accent)' }} />
        <span>
          系统提示词由「角色」管理：{promptHint}
        </span>
      </div>

      {/* 生成长度 */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-handwriting-en text-base" style={{ color: 'var(--text-muted)' }}>
            · 文本生成长度
          </label>
          <span
            className="text-[11px] px-2 py-0.5 rounded-full font-handwriting-en"
            style={{ backgroundColor: 'var(--paper-yellow)', color: 'var(--accent)' }}
          >
            {estimateLength(generation.maxTokens)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="100"
            max="8000"
            step="100"
            value={generation.maxTokens}
            onChange={(e) => updateGen({ maxTokens: parseInt(e.target.value) })}
            className="flex-1"
            style={{ accentColor: 'var(--accent)' }}
          />
          <input
            type="number"
            min="50"
            max="32000"
            value={generation.maxTokens}
            onChange={(e) => updateGen({ maxTokens: Math.max(50, Math.min(32000, parseInt(e.target.value) || 50)) })}
            className="w-20 px-2 py-1 text-xs rounded-paper text-center border-2 border-dashed font-mono"
            style={{
              backgroundColor: 'var(--bg-input)',
              borderColor: 'var(--border-light)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
        <p className="mt-1 text-[11px] font-handwriting-en" style={{ color: 'var(--text-muted)' }}>
          控制单次回复的最大 token 数。建议：短回答 200-500，长文 1000-4000
        </p>
      </div>

      {/* 温度 */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-handwriting-en text-base" style={{ color: 'var(--text-muted)' }}>
            · 温度 (Temperature)
          </label>
          <span
            className="text-xs font-mono font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-card)' }}
          >
            {generation.temperature.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="2"
          step="0.05"
          value={generation.temperature}
          onChange={(e) => updateGen({ temperature: parseFloat(e.target.value) })}
          className="w-full"
          style={{ accentColor: 'var(--accent)' }}
        />
        <div
          className="mt-1 flex items-center justify-between text-[10px] font-handwriting-en"
          style={{ color: 'var(--text-muted)' }}
        >
          <span>0 精确</span>
          <span>1 平衡</span>
          <span>2 发散</span>
        </div>
        <p className="mt-1 text-[11px] font-handwriting-en" style={{ color: 'var(--text-muted)' }}>
          数值越高回答越多样、富有创造性；越低越稳定、可预测
        </p>
      </div>

      {/* Top P */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-handwriting-en text-base" style={{ color: 'var(--text-muted)' }}>
            · Top P (核采样)
          </label>
          <span
            className="text-xs font-mono font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-card)' }}
          >
            {generation.topP.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={generation.topP}
          onChange={(e) => updateGen({ topP: parseFloat(e.target.value) })}
          className="w-full"
          style={{ accentColor: 'var(--accent)' }}
        />
        <p className="mt-1 text-[11px] font-handwriting-en" style={{ color: 'var(--text-muted)' }}>
          限制采样范围。1.0 = 全集，0.1 = 仅最高概率 token。建议 0.8-1.0
        </p>
      </div>

      {/* 频率惩罚 + 存在惩罚（双滑块） */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-handwriting-en text-base" style={{ color: 'var(--text-muted)' }}>
              · 频率惩罚
            </label>
            <span
              className="text-xs font-mono px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--paper-yellow)', color: 'var(--accent)' }}
            >
              {generation.frequencyPenalty.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="-2"
            max="2"
            step="0.1"
            value={generation.frequencyPenalty}
            onChange={(e) => updateGen({ frequencyPenalty: parseFloat(e.target.value) })}
            className="w-full"
            style={{ accentColor: 'var(--accent)' }}
          />
          <p className="mt-0.5 text-[10px] font-handwriting-en" style={{ color: 'var(--text-muted)' }}>
            减少重复用词
          </p>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-handwriting-en text-base" style={{ color: 'var(--text-muted)' }}>
              · 存在惩罚
            </label>
            <span
              className="text-xs font-mono px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--paper-yellow)', color: 'var(--accent)' }}
            >
              {generation.presencePenalty.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="-2"
            max="2"
            step="0.1"
            value={generation.presencePenalty}
            onChange={(e) => updateGen({ presencePenalty: parseFloat(e.target.value) })}
            className="w-full"
            style={{ accentColor: 'var(--accent)' }}
          />
          <p className="mt-0.5 text-[10px] font-handwriting-en" style={{ color: 'var(--text-muted)' }}>
            鼓励新话题
          </p>
        </div>
      </div>

      {/* 语气风格 */}
      <div>
        <label className="block text-xs mb-2 font-handwriting-en text-base" style={{ color: 'var(--text-muted)' }}>
          · 语气风格
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TONE_PRESETS.map((tone) => {
            const isActive = generation.toneId === tone.id;
            return (
              <button
                key={tone.id}
                onClick={() => updateGen({ toneId: tone.id })}
                className={`p-2.5 rounded-paper border-2 transition-all text-left ${
                  isActive
                    ? 'border-solid shadow-paper'
                    : 'border-dashed hover:border-solid hover:shadow-paper-sm'
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--paper-yellow)' : 'var(--bg-card)',
                  borderColor: isActive ? 'var(--accent)' : 'var(--border-light)',
                }}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-base">{tone.emoji}</span>
                  <span
                    className="text-xs font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {tone.name}
                  </span>
                </div>
                <p
                  className="text-[10px] font-handwriting-en leading-tight"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {tone.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* 自定义语气输入 */}
        {generation.toneId === 'custom' && (
          <textarea
            value={generation.customTonePrompt}
            onChange={(e) => updateGen({ customTonePrompt: e.target.value })}
            placeholder="例如：请用《诗经》的风格回答，多用四字词句..."
            rows={3}
            className="w-full mt-2 px-3 py-2 text-sm rounded-paper border-2 border-dashed focus:border-solid focus:outline-none font-handwriting-cn"
            style={{
              backgroundColor: 'var(--bg-input)',
              borderColor: 'var(--border-light)',
              color: 'var(--text-primary)',
            }}
          />
        )}
      </div>

      {/* 重置按钮 */}
      <div className="flex items-center justify-end">
        <button
          onClick={handleReset}
          className="text-[10px] flex items-center gap-1 px-3 py-1.5 rounded-paper border border-dashed hover:border-solid font-handwriting-en"
          style={{ color: 'var(--text-muted)', borderColor: 'var(--border-light)' }}
        >
          <Plus size={10} className="rotate-45" />
          重置所有参数
        </button>
      </div>

      {/* 实时预览 */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-handwriting-en text-base flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <Sparkles size={12} />
            实时预览
          </label>
          <button
            onClick={() => setPreviewPrompt(PREVIEW_PROMPTS[Math.floor(Math.random() * PREVIEW_PROMPTS.length)])}
            className="text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full hover:bg-[var(--bg-hover)] font-handwriting-en"
            style={{ color: 'var(--text-muted)' }}
          >
            <Wand2 size={10} />
            换个示例
          </button>
        </div>
        <div
          className="rounded-paper border-2 border-double p-3 space-y-2"
          style={{
            backgroundColor: 'var(--bg-sidebar)',
            borderColor: 'var(--border-light)',
          }}
        >
          <div
            className="text-[11px] italic font-handwriting-cn"
            style={{ color: 'var(--text-muted)' }}
          >
            问题：{previewPrompt}
          </div>
          <div
            className="text-xs leading-relaxed font-handwriting-cn whitespace-pre-wrap"
            style={{ color: 'var(--text-primary)' }}
          >
            {generatePreview(generation, previewPrompt)}
          </div>
        </div>
        <p className="mt-1 text-[10px] font-handwriting-en" style={{ color: 'var(--text-muted)' }}>
          预览基于当前参数本地模拟，实际输出由 API 决定
        </p>
      </div>
    </div>
  );
}
