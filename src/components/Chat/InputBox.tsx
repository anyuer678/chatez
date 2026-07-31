import { useState, useRef, useEffect } from 'react';
import { Send, Command, Play, X, Square } from 'lucide-react';
import { skillEngine } from '../../lib/skill-engine';
import { useConfigStore } from '../../stores/configStore';
import { useSkillStore } from '../../stores/skillStore';
import { usePromptStore } from '../../stores/promptStore';
import { InkSplash } from '../../assets/illustrations';

interface InputBoxProps {
  onSend: (message: string) => void;
  /**
   * 是否正在流式生成：禁用输入框 + 发送按钮变成"停止"按钮
   */
  isStreaming?: boolean;
  /**
   * 停止流式生成回调
   */
  onStop?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function InputBox({
  onSend,
  isStreaming = false,
  onStop,
  disabled,
  placeholder = '输入你的问题...',
}: InputBoxProps) {
  const sendWithEnter = useConfigStore((s) => s.ui.sendWithEnter);
  const { activeSkillId, skills, setActiveSkill } = useSkillStore();
  const { activePromptId, prompts } = usePromptStore();
  const [input, setInput] = useState('');
  const [showCommands, setShowCommands] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState<
    Array<{ command: string; name: string; description: string }>
  >([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const commandsRef = useRef<HTMLDivElement>(null);

  const activeSkill = skills.find((s) => s.id === activeSkillId) ?? null;
  const activePrompt = prompts.find((p) => p.id === activePromptId) ?? null;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  useEffect(() => {
    if (input.startsWith('/')) {
      const commands = skillEngine.getAvailableCommands();
      const search = input.toLowerCase();
      const filtered = commands.filter(
        (cmd) =>
          cmd.command.toLowerCase().includes(search) ||
          cmd.name.toLowerCase().includes(search)
      );
      setFilteredCommands(filtered);
      setShowCommands(filtered.length > 0);
      setSelectedIndex(0);
    } else {
      setShowCommands(false);
    }
  }, [input]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (commandsRef.current && !commandsRef.current.contains(e.target as Node)) {
        setShowCommands(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    const msg = input.trim().slice(0, 32000);
    onSend(msg);
    setInput('');
    setShowCommands(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showCommands) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        return;
      }
      if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
        e.preventDefault();
        const selected = filteredCommands[selectedIndex];
        if (selected) {
          setInput(selected.command + ' ');
          setShowCommands(false);
        }
        return;
      }
      if (e.key === 'Escape') {
        setShowCommands(false);
        return;
      }
    }

    if (sendWithEnter && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (!sendWithEnter && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCommandClick = (command: string) => {
    setInput(command + ' ');
    setShowCommands(false);
    textareaRef.current?.focus();
  };

  return (
    <div
      className="border-t-2 border-double px-3 sm:px-4 py-3 sm:py-4 relative flex-shrink-0"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-light)',
      }}
    >
      <div className="max-w-4xl mx-auto relative">
        {/* 命令面板 */}
        {showCommands && (
          <div
            ref={commandsRef}
            className="absolute bottom-full left-0 right-0 mb-2 rounded-paper shadow-paper-lg overflow-hidden z-10 border-2 border-double"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-medium)',
            }}
          >
            <div className="p-2">
              <div
                className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-handwriting-en text-base"
                style={{ color: 'var(--text-muted)' }}
              >
                <Command size={10} />
                <span>· commands ·</span>
              </div>
              {filteredCommands.map((cmd, index) => (
                <button
                  key={cmd.command}
                  onClick={() => handleCommandClick(cmd.command)}
                  className={`w-full flex items-center gap-2 px-2 py-2 rounded-paper-sm text-left transition-colors ${
                    index === selectedIndex
                      ? 'border-l-2'
                      : 'hover:bg-[var(--bg-hover)]'
                  }`}
                  style={
                    index === selectedIndex
                      ? {
                          backgroundColor: 'var(--accent-light)',
                          borderColor: 'var(--accent)',
                          color: 'var(--text-primary)',
                        }
                      : { color: 'var(--text-secondary)' }
                  }
                >
                  <code
                    className="text-xs font-mono px-2 py-0.5 rounded-sm flex-shrink-0"
                    style={{
                      backgroundColor: 'var(--paper-yellow)',
                      color: 'var(--accent)',
                    }}
                  >
                    {cmd.command}
                  </code>
                  <span className="text-xs truncate">{cmd.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 当前激活状态指示器 - 让用户清晰看到 skill/role 是否生效 */}
        {(activeSkill || activePrompt) && (
          <div className="flex items-center gap-1.5 mb-2 px-1 flex-wrap">
            {activeSkill && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border animate-fade-in"
                style={{
                  backgroundColor: 'var(--accent-light)',
                  borderColor: 'var(--accent)',
                  color: 'var(--accent)',
                }}
                title={`当前激活技能：${activeSkill.name}（${activeSkill.trigger}）`}
              >
                <Play size={9} fill="currentColor" />
                <code
                  className="font-mono text-[10px] px-1 rounded-sm"
                  style={{ backgroundColor: 'var(--paper-yellow)' }}
                >
                  {activeSkill.trigger}
                </code>
                <span className="font-handwriting-cn">{activeSkill.name}</span>
                <button
                  onClick={() => setActiveSkill(null)}
                  className="ml-0.5 p-0.5 rounded-full hover:bg-[var(--bg-hover)] transition-colors"
                  aria-label="停用技能"
                  title="停用技能"
                >
                  <X size={10} />
                </button>
              </span>
            )}
            {activePrompt && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border animate-fade-in"
                style={{
                  backgroundColor: 'var(--paper-yellow)',
                  borderColor: 'var(--border-medium)',
                  color: 'var(--text-secondary)',
                }}
                title={`当前角色：${activePrompt.name}`}
              >
                <span style={{ color: 'var(--accent)' }}>·</span>
                <span className="font-handwriting-cn">{activePrompt.name}</span>
              </span>
            )}
          </div>
        )}

        {/* 输入框 —— 使用 :focus-within 让父容器响应内部 textarea 焦点 */}
        <div
          className={`input-shell flex items-end gap-3 rounded-paper-lg p-3 border-2 shadow-paper ${
            isStreaming ? 'opacity-80' : ''
          }`}
          style={{
            backgroundColor: 'var(--bg-input)',
            borderStyle: 'dashed',
            borderColor: 'var(--border-medium)',
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isStreaming}
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none min-h-[24px] max-h-[140px] text-sm leading-relaxed"
            style={{
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-handwriting-cn)',
              fontSize: '15px',
            }}
          />

          {/* 发送 / 停止按钮 —— 流式时切换为"停止"形态 */}
          {isStreaming ? (
            <button
              onClick={onStop}
              className="btn-ink p-2.5 text-[var(--bg-card)] rounded-full transition-all flex-shrink-0 border-2 border-double relative group min-w-[44px] min-h-[44px] flex items-center justify-center"
              style={{
                backgroundColor: 'var(--accent-hover)',
                borderColor: 'var(--ink)',
                boxShadow: 'var(--shadow-sm)',
              }}
              title="停止生成"
              aria-label="停止生成"
            >
              <Square size={14} fill="currentColor" />
              {/* 脉冲呼吸环：提示用户正在生成中 */}
              <span
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  animation: 'ink-pulse 1.4s var(--ease-ink) infinite',
                  boxShadow: '0 0 0 0 var(--accent)',
                }}
                aria-hidden
              />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim() || disabled}
              className="btn-ink p-2.5 text-[var(--bg-card)] rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0 border-2 border-double relative group min-w-[44px] min-h-[44px] flex items-center justify-center"
              style={{
                backgroundColor: 'var(--accent)',
                borderColor: 'var(--accent-hover)',
                boxShadow: 'var(--shadow-sm)',
              }}
              title="发送 (Enter)"
              aria-label="发送"
            >
              <Send size={16} />
              {/* 墨点装饰（hover 时显示，仅 md+） */}
              <span
                className="absolute -inset-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
                aria-hidden
              >
                <span style={{ color: 'var(--accent)' }} className="opacity-70">
                  <InkSplash size={48} />
                </span>
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
