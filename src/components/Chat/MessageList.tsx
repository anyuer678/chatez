import { useEffect, useRef } from 'react';
import { Message } from '../../types/chat';
import { MessageBubble } from './MessageBubble';
import { Logo } from '../common';
import { PenLine } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isStreaming?: boolean;
  onRegenerate?: () => void;
}

export function MessageList({ messages, isStreaming, onRegenerate }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          onRegenerate={
            index === messages.length - 1 && message.role === 'assistant' && !isStreaming
              ? onRegenerate
              : undefined
          }
        />
      ))}

      {/* 流式生成指示器 —— 墨点脉冲 + 思考文字 + 笔尖图标 */}
      {isStreaming && (
        <div
          className="flex justify-start mb-4 animate-paper-fade-in"
          aria-live="polite"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-2 sm:mr-3 mt-1 border-2 border-double overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-medium)',
            }}
          >
            <Logo variant="avatar" size={32} />
          </div>
          <div
            className="rounded-paper-lg rounded-tl-sm border border-dashed px-4 py-3"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div className="flex items-center gap-2.5">
              {/* 墨点脉冲（取代了 3 个 bounce 圆点，更柔和） */}
              <div className="flex items-center gap-1" aria-hidden>
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: 'var(--accent)',
                    animation: 'ink-pulse 1.2s var(--ease-ink) infinite',
                    animationDelay: '0ms',
                  }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: 'var(--accent)',
                    animation: 'ink-pulse 1.2s var(--ease-ink) infinite',
                    animationDelay: '200ms',
                  }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: 'var(--accent)',
                    animation: 'ink-pulse 1.2s var(--ease-ink) infinite',
                    animationDelay: '400ms',
                  }}
                />
              </div>
              <PenLine
                size={12}
                style={{ color: 'var(--accent-soft)' }}
                className="animate-paper-shake"
              />
              <span
                className="text-sm font-handwriting-cn text-base"
                style={{ color: 'var(--text-muted)' }}
              >
                AI 正在落笔...
              </span>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
