import { useState, useEffect } from 'react';
import { useConfigStore } from '../../stores/configStore';
import { usePromptStore } from '../../stores/promptStore';
import { SkillManager } from '../Skill';
import { GenerationPanel } from './GenerationPanel';
import { SkillPresetsPanel } from './SkillPresetsPanel';
import { IMAGES } from '../../config/images';
import { X, RotateCcw, Download, Upload, Eye, EyeOff, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsTab;
}

export type SettingsTab = 'api' | 'generation' | 'ui' | 'skill' | 'about';

export function SettingsModal({ isOpen, onClose, initialTab = 'api' }: SettingsModalProps) {
  const config = useConfigStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [showApiKey, setShowApiKey] = useState(false);
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // 弹窗打开时同步 initialTab
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleExport = () => {
    const json = config.exportConfig();
    if (!json) return;
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatez-config-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const success = config.importConfig(importText);
    setImportStatus(success ? 'success' : 'error');
    setTimeout(() => setImportStatus('idle'), 2000);
    if (success) setImportText('');
  };

  const tabs = [
    { id: 'api' as const, label: 'API' },
    { id: 'generation' as const, label: '生成' },
    { id: 'ui' as const, label: '界面' },
    { id: 'skill' as const, label: 'Skill' },
    { id: 'about' as const, label: '关于' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-paper-fade-in"
      style={{ backgroundColor: 'rgba(28, 20, 10, 0.5)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div
        className="rounded-paper-lg shadow-paper-lg w-full max-w-lg max-h-[90vh] flex flex-col mx-4 border-4 border-double relative animate-drawer-in-up"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-medium)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部书脊装饰 */}
        <div
          className="absolute top-0 left-0 bottom-0 w-1.5 rounded-l-paper-lg"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, var(--accent) 0px, var(--accent) 4px, transparent 4px, transparent 8px)',
          }}
        />

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b-2 border-double"
          style={{ borderColor: 'var(--border-light)' }}
        >
          <h2 className="text-base font-semibold font-handwriting-cn text-lg" style={{ color: 'var(--text-primary)' }}>
            设置 · Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-paper transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-double" style={{ borderColor: 'var(--border-light)' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm transition-all relative ${
                activeTab === tab.id ? 'font-medium' : ''
              }`}
              style={
                activeTab === tab.id
                  ? { color: 'var(--accent)' }
                  : { color: 'var(--text-muted)' }
              }
            >
              {tab.label}
              {activeTab === tab.id && (
                <span
                  className="absolute bottom-0 left-1/4 right-1/4 h-0.5"
                  style={{
                    backgroundColor: 'var(--accent)',
                    backgroundImage:
                      'repeating-linear-gradient(to right, var(--accent) 0px, var(--accent) 3px, transparent 3px, transparent 5px)',
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* API 配置 */}
          {activeTab === 'api' && (
            <div className="space-y-4">
              <div>
                <label
                  className="block text-xs mb-1.5 font-handwriting-en text-base"
                  style={{ color: 'var(--text-muted)' }}
                >
                  · API Provider
                </label>
                <select
                  value={config.api.provider}
                  onChange={(e) => config.updateApiConfig({ provider: e.target.value as 'openai' | 'custom' })}
                  className="w-full px-3 py-2.5 rounded-paper text-sm focus:outline-none border-2 border-dashed focus:border-solid"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    borderColor: 'var(--border-light)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="openai">OpenAI</option>
                  <option value="custom">自定义</option>
                </select>
              </div>

              <div>
                <label
                  className="block text-xs mb-1.5 font-handwriting-en text-base"
                  style={{ color: 'var(--text-muted)' }}
                >
                  · API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={config.api.apiKey}
                    onChange={(e) => config.updateApiConfig({ apiKey: e.target.value })}
                    placeholder="sk-..."
                    className="w-full px-3 py-2.5 pr-10 rounded-paper text-sm focus:outline-none border-2 border-dashed focus:border-solid font-mono"
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      borderColor: 'var(--border-light)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  className="block text-xs mb-1.5 font-handwriting-en text-base"
                  style={{ color: 'var(--text-muted)' }}
                >
                  · API URL
                </label>
                <input
                  type="text"
                  value={config.api.baseUrl}
                  onChange={(e) => config.updateApiConfig({ baseUrl: e.target.value })}
                  placeholder="https://api.openai.com/v1"
                  className="w-full px-3 py-2.5 rounded-paper text-sm focus:outline-none border-2 border-dashed focus:border-solid font-mono"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    borderColor: 'var(--border-light)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-xs mb-1.5 font-handwriting-en text-base"
                  style={{ color: 'var(--text-muted)' }}
                >
                  · Model
                </label>
                <input
                  type="text"
                  value={config.api.model}
                  onChange={(e) => config.updateApiConfig({ model: e.target.value })}
                  placeholder="例如 gpt-4o-mini / claude-3-5-sonnet / deepseek-chat / qwen-turbo"
                  className="w-full px-3 py-2.5 rounded-paper text-sm focus:outline-none border-2 border-dashed focus:border-solid font-mono"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    borderColor: 'var(--border-light)',
                    color: 'var(--text-primary)',
                  }}
                />
                <p
                  className="mt-1.5 text-[11px] font-handwriting-en"
                  style={{ color: 'var(--text-muted)' }}
                >
                  可填写任意兼容 OpenAI 协议的模型名
                </p>
              </div>

              <div>
                <label
                  className="block text-xs mb-1.5 font-handwriting-en text-base"
                  style={{ color: 'var(--text-muted)' }}
                >
                  · temperature: {config.api.temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.api.temperature}
                  onChange={(e) => config.updateApiConfig({ temperature: parseFloat(e.target.value) })}
                  className="w-full"
                  style={{ accentColor: 'var(--accent)' }}
                />
              </div>

              <div>
                <label
                  className="block text-xs mb-1.5 font-handwriting-en text-base"
                  style={{ color: 'var(--text-muted)' }}
                >
                  · max tokens
                </label>
                <input
                  type="number"
                  value={config.api.maxTokens}
                  onChange={(e) => config.updateApiConfig({ maxTokens: parseInt(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-paper text-sm focus:outline-none border-2 border-dashed focus:border-solid"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    borderColor: 'var(--border-light)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>
          )}

          {/* 生成微调设置 */}
          {activeTab === 'generation' && <GenerationPanel />}

          {/* 提示：角色管理入口（统一到提示词市场） */}
          {activeTab === 'api' && (
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
                提示：系统提示词（角色）请到侧边栏「提示词市场」统一管理。
              </span>
            </div>
          )}

          {/* 界面设置 */}
          {activeTab === 'ui' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-handwriting-cn text-base" style={{ color: 'var(--text-primary)' }}>
                    深色模式
                  </span>
                  <p className="text-[11px] font-handwriting-en text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    like candlelight at night
                  </p>
                </div>
                <button
                  onClick={() => config.updateUiConfig({ theme: config.ui.theme === 'dark' ? 'light' : 'dark' })}
                  className="relative w-11 h-6 rounded-full transition-colors border-2 border-double"
                  style={{
                    backgroundColor: config.ui.theme === 'dark' ? 'var(--accent)' : 'var(--border-medium)',
                    borderColor: 'var(--border-light)',
                  }}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      config.ui.theme === 'dark' ? 'translate-x-[22px]' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label
                  className="block text-xs mb-1.5 font-handwriting-en text-base"
                  style={{ color: 'var(--text-muted)' }}
                >
                  · font size: {config.ui.fontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="18"
                  step="1"
                  value={config.ui.fontSize}
                  onChange={(e) => config.updateUiConfig({ fontSize: parseInt(e.target.value) })}
                  className="w-full"
                  style={{ accentColor: 'var(--accent)' }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-handwriting-cn text-base" style={{ color: 'var(--text-primary)' }}>
                  Enter 发送
                </span>
                <button
                  onClick={() => config.updateUiConfig({ sendWithEnter: !config.ui.sendWithEnter })}
                  className="relative w-11 h-6 rounded-full transition-colors border-2 border-double"
                  style={{
                    backgroundColor: config.ui.sendWithEnter ? 'var(--accent)' : 'var(--border-medium)',
                    borderColor: 'var(--border-light)',
                  }}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      config.ui.sendWithEnter ? 'translate-x-[22px]' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Skill 设置 */}
          {activeTab === 'skill' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-handwriting-cn text-base" style={{ color: 'var(--text-primary)' }}>
                    自动识别 Skill
                  </span>
                  <p className="text-[11px] font-handwriting-en text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    auto-detect from input
                  </p>
                </div>
                <button
                  onClick={() => config.updateSkillConfig({ autoDetect: !config.skill.autoDetect })}
                  className="relative w-11 h-6 rounded-full transition-colors border-2 border-double"
                  style={{
                    backgroundColor: config.skill.autoDetect ? 'var(--accent)' : 'var(--border-medium)',
                    borderColor: 'var(--border-light)',
                  }}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      config.skill.autoDetect ? 'translate-x-[22px]' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="border-t-2 border-double pt-4" style={{ borderColor: 'var(--border-light)' }}>
                <SkillPresetsPanel />
              </div>

              <div className="border-t-2 border-double pt-4" style={{ borderColor: 'var(--border-light)' }}>
                <SkillManager />
              </div>
            </div>
          )}

          {/* 关于 */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <img
                  src="/images/quote-card.png"
                  alt="ChatEZ"
                  className="w-full max-w-sm mx-auto rounded-paper"
                  style={{ objectFit: 'contain' }}
                />
                <p className="text-xs font-handwriting-en text-base mt-3" style={{ color: 'var(--text-muted)' }}>
                  v1.14.0 · 2026
                </p>
              </div>

              {/* 4 个功能模块图 —— 1x4 并排，含中文标签和副描述 */}
              <div
                className="border-t-2 border-dashed pt-4"
                style={{ borderColor: 'var(--border-light)' }}
              >
                <p
                  className="text-xs font-medium mb-3 font-handwriting-en text-base"
                  style={{ color: 'var(--text-muted)' }}
                >
                  · features ·
                </p>
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {[
                    { src: IMAGES.moduleChat, label: '智能对话', desc: '与 AI 自由交谈' },
                    { src: IMAGES.moduleBook, label: '知识库', desc: '管理和检索知识' },
                    { src: IMAGES.moduleQuill, label: '写作助手', desc: '辅助创作内容' },
                    { src: IMAGES.modulePuzzle, label: '插件拓展', desc: '扩展更多功能' },
                  ].map((feature) => (
                    <div key={feature.label} className="flex flex-col items-center text-center">
                      <div className="w-full relative overflow-hidden mb-2" style={{ aspectRatio: '1 / 1' }}>
                        <img
                          src={feature.src}
                          alt={feature.label}
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 w-full h-full"
                          style={{ objectFit: 'contain' }}
                        />
                      </div>
                      <p
                        className="text-xs font-medium font-handwriting-cn"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {feature.label}
                      </p>
                      <p
                        className="text-[10px] mt-0.5 font-handwriting-cn leading-tight"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {feature.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 快捷键 */}
              <div className="border-t-2 border-dashed pt-4" style={{ borderColor: 'var(--border-light)' }}>
                <p
                  className="text-xs font-medium mb-3 font-handwriting-en text-base"
                  style={{ color: 'var(--text-muted)' }}
                >
                  · shortcuts ·
                </p>
                <div className="space-y-2">
                  {[
                    { key: 'Ctrl+N', desc: '新建对话' },
                    { key: 'Ctrl+,', desc: '设置' },
                    { key: 'Ctrl+B', desc: '侧边栏' },
                    { key: '/', desc: '命令' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-1.5">
                      <span className="text-sm font-handwriting-cn" style={{ color: 'var(--text-secondary)' }}>
                        {item.desc}
                      </span>
                      <kbd
                        className="text-xs px-2 py-1 rounded-paper-sm font-handwriting-code text-sm border"
                        style={{
                          backgroundColor: 'var(--bg-hover)',
                          color: 'var(--text-secondary)',
                          borderColor: 'var(--border-light)',
                        }}
                      >
                        {item.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>

              {/* 配置管理 */}
              <div className="border-t-2 border-dashed pt-4" style={{ borderColor: 'var(--border-light)' }}>
                <p
                  className="text-xs font-medium mb-3 font-handwriting-en text-base"
                  style={{ color: 'var(--text-muted)' }}
                >
                  · config ·
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleExport}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-paper transition-colors text-sm"
                    style={{
                      backgroundColor: 'var(--bg-hover)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <Download size={14} />
                    导出配置
                  </button>
                  <button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.json';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            const text = e.target?.result as string;
                            setImportText(text);
                          };
                          reader.readAsText(file);
                        }
                      };
                      input.click();
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-paper transition-colors text-sm"
                    style={{
                      backgroundColor: 'var(--bg-hover)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <Upload size={14} />
                    导入配置
                  </button>
                </div>

                {importText && (
                  <button
                    onClick={handleImport}
                    className="w-full mt-3 px-3 py-2.5 rounded-paper transition-colors text-sm font-handwriting-cn"
                    style={{
                      backgroundColor: 'var(--accent)',
                      color: 'var(--bg-card)',
                    }}
                  >
                    {importStatus === 'success' ? '导入成功' : importStatus === 'error' ? '导入失败' : '确认导入'}
                  </button>
                )}
              </div>

              {/* Prompt 导入导出 */}
              <div className="border-t-2 border-dashed pt-4" style={{ borderColor: 'var(--border-light)' }}>
                <p
                  className="text-xs font-medium mb-3 font-handwriting-en text-base"
                  style={{ color: 'var(--text-muted)' }}
                >
                  · prompts ·
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      const json = usePromptStore.getState().exportPrompts();
                      const blob = new Blob([json], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `chatez-prompts-${new Date().toISOString().slice(0, 10)}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-paper transition-colors text-sm"
                    style={{
                      backgroundColor: 'var(--bg-hover)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <Download size={14} />
                    导出 Prompt
                  </button>
                  <button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.json';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            const text = e.target?.result as string;
                            const success = usePromptStore.getState().importPrompts(text);
                            alert(success ? '导入成功' : '导入失败');
                          };
                          reader.readAsText(file);
                        }
                      };
                      input.click();
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-paper transition-colors text-sm"
                    style={{
                      backgroundColor: 'var(--bg-hover)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <Upload size={14} />
                    导入 Prompt
                  </button>
                </div>
              </div>

              {/* 重置 */}
              <div className="border-t-2 border-dashed pt-4" style={{ borderColor: 'var(--border-light)' }}>
                <button
                  onClick={() => {
                    if (confirm('确定重置所有配置？')) {
                      config.resetConfig();
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-paper transition-colors text-sm"
                  style={{
                    color: 'var(--accent-hover)',
                    backgroundColor: 'var(--accent-light)',
                    border: '1px dashed var(--accent)',
                  }}
                >
                  <RotateCcw size={14} />
                  <span className="font-handwriting-cn">重置配置</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
