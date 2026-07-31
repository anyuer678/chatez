import type { ModelOption } from '../components/common/ModelSelect';

/**
 * 常用 AI 模型清单（按 provider 分组）
 * - OpenAI: GPT 系列
 * - Anthropic: Claude 系列
 * - 自定义: 兼容 OpenAI 协议的其他服务
 */
export const MODEL_OPTIONS: ModelOption[] = [
  // OpenAI
  {
    value: 'gpt-4o-mini',
    label: 'GPT-4o Mini',
    provider: 'OpenAI',
    description: '快速、轻量，适合日常对话',
    tag: '推荐',
  },
  {
    value: 'gpt-4o',
    label: 'GPT-4o',
    provider: 'OpenAI',
    description: '多模态旗舰，能力均衡',
  },
  {
    value: 'gpt-4-turbo',
    label: 'GPT-4 Turbo',
    provider: 'OpenAI',
    description: '高性能，上下文 128K',
    tag: '强力',
  },
  {
    value: 'gpt-3.5-turbo',
    label: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    description: '经典经济之选',
  },
  {
    value: 'o1-preview',
    label: 'o1 Preview',
    provider: 'OpenAI',
    description: '推理增强，适合复杂问题',
    tag: '新',
  },
  {
    value: 'o1-mini',
    label: 'o1 Mini',
    provider: 'OpenAI',
    description: '推理增强轻量版',
  },
  // Anthropic
  {
    value: 'claude-3-5-sonnet-20241022',
    label: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: '长上下文 200K，写作/分析',
    tag: '推荐',
  },
  {
    value: 'claude-3-5-haiku-20241022',
    label: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    description: '快速响应，经济实惠',
  },
  {
    value: 'claude-3-opus-20240229',
    label: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: '深度推理旗舰',
    tag: '强力',
  },
  // 自定义（兼容 OpenAI 协议）
  {
    value: 'custom-model',
    label: '自定义模型',
    provider: '自定义',
    description: '由 API URL 决定',
  },
];
