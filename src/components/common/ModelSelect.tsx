import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

export interface ModelOption {
  value: string;
  label: string;
  provider: 'OpenAI' | 'Anthropic' | '自定义';
  description?: string;
  tag?: string; // 推荐 / 快速 / 强力
}

interface ModelSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: ModelOption[];
  placeholder?: string;
}

export function ModelSelect({ value, onChange, options, placeholder = '选择模型' }: ModelSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = options.find((o) => o.value === value);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // 打开时聚焦搜索框
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const filtered = query
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(query.toLowerCase()) ||
          o.value.toLowerCase().includes(query.toLowerCase()) ||
          (o.description ?? '').toLowerCase().includes(query.toLowerCase())
      )
    : options;

  // 按 provider 分组
  const grouped = filtered.reduce<Record<string, ModelOption[]>>((acc, opt) => {
    if (!acc[opt.provider]) acc[opt.provider] = [];
    acc[opt.provider].push(opt);
    return acc;
  }, {});

  const providerColor: Record<string, string> = {
    OpenAI: '#10a37f',
    Anthropic: '#d97706',
    自定义: '#6b7280',
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative">
      {/* 触发按钮 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2.5 rounded-paper text-sm focus:outline-none border-2 border-dashed hover:border-solid flex items-center justify-between gap-2 transition-all"
        style={{
          backgroundColor: 'var(--bg-input)',
          borderColor: isOpen ? 'var(--accent)' : 'var(--border-light)',
          color: 'var(--text-primary)',
        }}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {current && (
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: providerColor[current.provider] ?? 'var(--accent)' }}
            />
          )}
          <span className="truncate text-left">
            {current ? current.label : placeholder}
          </span>
          {current?.tag && (
            <span
              className="px-1.5 py-0.5 text-[10px] font-bold rounded-full flex-shrink-0 font-handwriting-en"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--bg-card)',
              }}
            >
              {current.tag}
            </span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: 'var(--text-muted)' }}
        />
      </button>

      {/* 下拉面板 */}
      {isOpen && (
        <div
          className="absolute z-50 left-0 right-0 mt-1 rounded-paper-lg border-2 border-double shadow-paper-lg overflow-hidden animate-fade-in"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-medium)',
            maxHeight: 360,
          }}
        >
          {/* 搜索框 */}
          <div
            className="px-3 py-2 border-b border-dashed flex items-center gap-2"
            style={{ borderColor: 'var(--border-light)' }}
          >
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索模型..."
              className="flex-1 bg-transparent text-sm focus:outline-none font-handwriting-en"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          {/* 选项列表 */}
          <div className="overflow-y-auto" style={{ maxHeight: 280 }}>
            {filtered.length === 0 ? (
              <div
                className="px-3 py-6 text-center text-xs font-handwriting-en"
                style={{ color: 'var(--text-muted)' }}
              >
                未找到匹配的模型
              </div>
            ) : (
              Object.entries(grouped).map(([provider, items]) => (
                <div key={provider}>
                  <div
                    className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide font-handwriting-en sticky top-0"
                    style={{
                      color: providerColor[provider] ?? 'var(--text-muted)',
                      backgroundColor: 'var(--bg-sidebar)',
                    }}
                  >
                    {provider}
                  </div>
                  {items.map((opt) => {
                    const isSelected = opt.value === value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelect(opt.value)}
                        className="w-full px-3 py-2.5 flex items-start gap-2 text-left hover:bg-[var(--bg-hover)] transition-colors"
                        style={{
                          backgroundColor: isSelected ? 'var(--bg-hover)' : 'transparent',
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                          style={{ backgroundColor: providerColor[opt.provider] ?? 'var(--accent)' }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="text-sm font-medium"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {opt.label}
                            </span>
                            {opt.tag && (
                              <span
                                className="px-1.5 py-0.5 text-[9px] font-bold rounded-full font-handwriting-en"
                                style={{
                                  backgroundColor: 'var(--accent)',
                                  color: 'var(--bg-card)',
                                }}
                              >
                                {opt.tag}
                              </span>
                            )}
                          </div>
                          {opt.description && (
                            <p
                              className="text-[11px] font-handwriting-en mt-0.5"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {opt.description}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <Check
                            size={14}
                            className="flex-shrink-0 mt-1.5"
                            style={{ color: 'var(--accent)' }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
