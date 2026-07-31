import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../../types/chat';
import { Copy, Check, RefreshCw, Sparkles, Play, Terminal } from 'lucide-react';
import { Logo } from '../common';
import { useSkillStore } from '../../stores/skillStore';

interface MessageBubbleProps {
  message: Message;
  onRegenerate?: () => void;
}

/**
 * 渲染 skill 触发来源标签
 * - command: 用户输入 /sql xxx 显式触发
 * - auto: 自然语言关键字自动识别
 * - manual: 用户从 SkillSelector 主动激活
 */
function SkillTriggerBadge({ message }: { message: Message }) {
  const skills = useSkillStore((s) => s.skills);
  if (!message.skillId) return null;
  const skill = skills.find((s) => s.id === message.skillId);
  if (!skill) return null;

  const meta = {
    command: { icon: Terminal, label: '/cmd', color: 'var(--accent)' },
    auto: { icon: Sparkles, label: '自动识别', color: 'var(--accent)' },
    manual: { icon: Play, label: '手动激活', color: 'var(--accent)' },
  }[message.skillTrigger ?? 'auto'];

  const Icon = meta.icon;

  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-handwriting-cn px-1.5 py-0.5 rounded-sm"
      style={{
        backgroundColor: 'var(--accent-light)',
        color: meta.color,
        border: '1px solid var(--border-light)',
      }}
      title={`${skill.name}（${meta.label}）`}
    >
      <Icon size={9} />
      <code className="font-mono text-[9px]">{skill.trigger}</code>
      <span>{skill.name}</span>
    </span>
  );
}

function CodeBlock({ language, children }: { language: string; children: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className="my-3 rounded-paper overflow-hidden border-2 border-double"
      style={{ borderColor: 'var(--border-medium)' }}
    >
      <div
        className="flex items-center justify-between px-4 py-2 text-xs"
        style={{
          backgroundColor: 'var(--bg-hover)',
          color: 'var(--text-muted)',
          borderBottom: '1px dashed var(--border-medium)',
        }}
      >
        <span className="font-handwriting-code text-sm">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:opacity-80 transition-colors"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          <span className="font-handwriting-en text-base">{copied ? 'copied!' : 'copy'}</span>
        </button>
      </div>
      <pre
        className="p-4 overflow-x-auto text-sm"
        style={{ backgroundColor: 'var(--ink)', color: 'var(--bg-card)' }}
      >
        <code>{children}</code>
      </pre>
    </div>
  );
}

export function MessageBubble({ message, onRegenerate }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 sm:mb-5 group animate-message-pop`}
      style={{ animationDuration: 'var(--dur-slow)' }}
    >
      {/* AI 头像 */}
      {!isUser && (
        <div
          className="w-8 h-8 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-2 sm:mr-3 mt-1 border-2 border-double overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-medium)',
          }}
        >
          <Logo variant="avatar" size={32} />
        </div>
      )}

      <div className={`relative max-w-[85%] sm:max-w-[75%] ${isUser ? '' : 'pl-3'}`}>
        {/* AI 气泡：左侧装订线 */}
        {!isUser && (
          <span
            className="absolute left-0 top-2 bottom-2 w-px opacity-40"
            style={{
              backgroundImage:
                'linear-gradient(to bottom, var(--border-medium) 50%, transparent 50%)',
              backgroundSize: '1px 5px',
            }}
          />
        )}

        <div
          className={`rounded-paper-lg px-4 py-3 ${
            isUser
              ? 'rounded-tr-sm border-2 border-dashed'
              : 'rounded-tl-sm border border-dashed'
          }`}
          style={
            isUser
              ? {
                  backgroundColor: 'var(--paper-yellow)',
                  borderColor: 'var(--border-medium)',
                  color: 'var(--text-primary)',
                  transform: 'rotate(-0.4deg)',
                }
              : {
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-primary)',
                  boxShadow: 'var(--shadow-sm)',
                }
          }
        >
          {/* 用户气泡：胶带装饰 */}
          {isUser && (
            <div
              className="absolute -top-2 right-6 w-12 h-3 opacity-75 shadow-sm"
              style={{
                backgroundColor: 'var(--tape)',
                transform: 'rotate(2deg)',
              }}
            />
          )}

          {isUser ? (
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed font-handwriting-cn text-base">
              {message.content}
            </p>
          ) : (
            <div className="prose prose-sm max-w-none break-words">
              <ReactMarkdown
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match;

                    if (isInline) {
                      return (
                        <code
                          className="px-1.5 py-0.5 rounded-sm text-xs"
                          style={{
                            backgroundColor: 'var(--paper-yellow)',
                            color: 'var(--text-primary)',
                            fontFamily: 'var(--font-handwriting-code)',
                            border: '1px solid var(--border-light)',
                          }}
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }

                    const codeString = String(children).replace(/\n$/, '');
                    return <CodeBlock language={match[1]}>{codeString}</CodeBlock>;
                  },
                  p({ children }) {
                    return (
                      <p
                        className="my-1.5 leading-relaxed text-sm"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {children}
                      </p>
                    );
                  },
                  ul({ children }) {
                    return <ul className="list-disc pl-5 my-1.5 space-y-1">{children}</ul>;
                  },
                  ol({ children }) {
                    return <ol className="list-decimal pl-5 my-1.5 space-y-1">{children}</ol>;
                  },
                  li({ children }) {
                    return (
                      <li className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        {children}
                      </li>
                    );
                  },
                  h1({ children }) {
                    return (
                      <h1
                        className="text-lg font-bold my-3"
                        style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}
                      >
                        {children}
                      </h1>
                    );
                  },
                  h2({ children }) {
                    return (
                      <h2
                        className="text-base font-bold my-3"
                        style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}
                      >
                        {children}
                      </h2>
                    );
                  },
                  h3({ children }) {
                    return (
                      <h3
                        className="text-sm font-bold my-3"
                        style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}
                      >
                        {children}
                      </h3>
                    );
                  },
                  blockquote({ children }) {
                    return (
                      <blockquote
                        className="my-3 px-4 py-2.5 text-sm italic relative border-l-4"
                        style={{
                          backgroundColor: 'var(--accent-light)',
                          borderColor: 'var(--accent)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {/* 卷轴装饰（左） */}
                        <span
                          className="absolute left-0 top-0 bottom-0 w-1 rounded-l"
                          style={{ backgroundColor: 'var(--accent)' }}
                        />
                        {children}
                      </blockquote>
                    );
                  },
                  a({ href, children }) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:opacity-80 transition-colors"
                        style={{ color: 'var(--accent)' }}
                      >
                        {children}
                      </a>
                    );
                  },
                  table({ children }) {
                    return (
                      <div className="overflow-x-auto my-3">
                        <table
                          className="min-w-full border-collapse text-sm"
                          style={{ borderColor: 'var(--border-light)' }}
                        >
                          {children}
                        </table>
                      </div>
                    );
                  },
                  th({ children }) {
                    return (
                      <th
                        className="border px-3 py-2 text-left font-medium"
                        style={{
                          borderColor: 'var(--border-light)',
                          backgroundColor: 'var(--bg-hover)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {children}
                      </th>
                    );
                  },
                  td({ children }) {
                    return (
                      <td
                        className="border px-3 py-2"
                        style={{
                          borderColor: 'var(--border-light)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {children}
                      </td>
                    );
                  },
                  hr() {
                    return (
                      <hr
                        className="my-4 border-dashed"
                        style={{ borderColor: 'var(--border-medium)' }}
                      />
                    );
                  },
                  strong({ children }) {
                    return (
                      <strong
                        className="font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {children}
                      </strong>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* 操作栏 */}
          <div
            className="flex items-center gap-2 mt-2 pt-2 border-t border-dashed flex-wrap"
            style={{ borderColor: isUser ? 'rgba(139,111,71,0.3)' : 'var(--border-light)' }}
          >
            <span
              className="text-[11px] font-handwriting-en text-base italic"
              style={{ color: isUser ? 'var(--accent)' : 'var(--text-muted)' }}
            >
              {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>

            {/* Skill 触发来源（仅用户消息且有 skillId） */}
            {isUser && message.skillId && <SkillTriggerBadge message={message} />}

            {!isUser && (
              <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity ml-auto">
                <button
                  onClick={handleCopyMessage}
                  className="p-1.5 rounded-paper-sm transition-all flex items-center gap-1"
                  style={{ color: 'var(--text-muted)' }}
                  title="复制"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span className="text-[11px] font-handwriting-en text-base">
                    {copied ? 'copied' : 'copy'}
                  </span>
                </button>
                {onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="p-1.5 rounded-paper-sm transition-all flex items-center gap-1"
                    style={{ color: 'var(--text-muted)' }}
                    title="重新生成"
                  >
                    <RefreshCw size={14} />
                    <span className="text-[11px] font-handwriting-en text-base">retry</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
