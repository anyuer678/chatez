import { useState, useMemo } from 'react';
import {
  Sparkles,
  Check,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Download,
  Upload,
  X,
  Save,
  Search,
  Star,
  Users,
  Wand2,
  Copy,
} from 'lucide-react';
import { usePromptStore } from '../../stores/promptStore';
import type { Prompt } from '../../types/prompt';
import { IMAGES } from '../../config/images';
import {
  BookStack,
  InkSplash,
  TapeStrip,
  DividerHandDrawn,
  PlantLeaf,
  PaperCorner,
} from '../../assets/illustrations';

interface PromptMarketPanelProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * 是否为移动端（true 时全屏显示；false 时右侧抽屉）
   */
  isMobile?: boolean;
}

/**
 * 提示词市场
 * - 桌面端：右侧抽屉（从右滑入）
 * - 移动端：全屏页面
 * - UI 与其他页面一致：双线边框、便签纸、胶带、暖色调
 *
 * 功能：
 * - 浏览全部 30+ 内置角色
 * - 搜索 / 标签筛选
 * - 启用角色（一键激活）
 * - 「★」加入/移出常用（与侧边栏下拉共享）
 * - 「微调」内置角色 → 另存为新角色（用户自定义名字）
 * - 新建 / 编辑 / 删除（仅自定义）
 * - 导入 / 导出 JSON
 * - 还原内置
 */
export function PromptMarketPanel({ isOpen, onClose, isMobile = false }: PromptMarketPanelProps) {
  const {
    prompts,
    activePromptId,
    setActivePrompt,
    addPrompt,
    updatePrompt,
    removePrompt,
    importPrompts,
    exportPrompts,
    resetPrompts,
    togglePin,
  } = usePromptStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  // 全部标签
  const allTags = useMemo(() => {
    const set = new Set<string>();
    prompts.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [prompts]);

  // 过滤后的角色
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return prompts.filter((p) => {
      if (activeTag && !p.tags.includes(activeTag)) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.systemPrompt.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [prompts, searchQuery, activeTag]);

  // 排序：常用 → 内置 → 自定义，每组内按名称
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const ap = a.pinned === true ? 0 : 1;
      const bp = b.pinned === true ? 0 : 1;
      if (ap !== bp) return ap - bp;
      const ab = a.isBuiltIn ? 0 : 1;
      const bb = b.isBuiltIn ? 0 : 1;
      if (ab !== bb) return ab - bb;
      return a.name.localeCompare(b.name, 'zh-CN');
    });
  }, [filtered]);

  const builtInCount = prompts.filter((p) => p.isBuiltIn).length;
  const customCount = prompts.length - builtInCount;
  const pinnedCount = prompts.filter((p) => p.pinned === true).length;

  // 启用角色
  const handleApply = (p: Prompt) => {
    setActivePrompt(p.id);
    setAppliedId(p.id);
    setTimeout(() => setAppliedId(null), 800);
  };

  // 删除自定义角色
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('确定删除这个角色？')) {
      removePrompt(id);
    }
  };

  // 切换常用
  const handleTogglePin = (e: React.MouseEvent, p: Prompt) => {
    e.stopPropagation();
    togglePin(p.id);
  };

  // 导出
  const handleExport = () => {
    const json = exportPrompts();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatez-roles-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导入
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          const success = importPrompts(text);
          alert(success ? '导入成功' : '导入失败：JSON 格式错误');
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // 还原内置
  const handleRestoreBuiltIn = () => {
    if (confirm('将追加缺失的内置角色（保留自定义和常用设置），是否继续？')) {
      resetPrompts();
    }
  };

  // 新建
  const startCreate = () => {
    setEditor({
      mode: 'create',
      name: '',
      description: '',
      systemPrompt: '',
      temperature: 0.7,
    });
  };

  // 编辑自定义角色
  const startEdit = (e: React.MouseEvent, p: Prompt) => {
    e.stopPropagation();
    setEditor({
      mode: 'edit',
      promptId: p.id,
      name: p.name,
      description: p.description,
      systemPrompt: p.systemPrompt,
      temperature: p.temperature,
    });
  };

  // 微调：把任一角色（内置/自定义）当作模板，预填到编辑器，要求用户填新名字后另存
  const startTweak = (e: React.MouseEvent, p: Prompt) => {
    e.stopPropagation();
    setEditor({
      mode: 'tweak',
      sourceId: p.id,
      name: p.isBuiltIn ? `${p.name}（微调）` : `${p.name} 副本`,
      description: p.description,
      systemPrompt: p.systemPrompt,
      temperature: p.temperature,
    });
  };

  // 保存
  const handleSave = () => {
    if (!editor) return;
    const name = editor.name.trim();
    if (!name || !editor.systemPrompt.trim()) {
      alert('名称和系统提示词不能为空');
      return;
    }

    if (editor.mode === 'edit' && editor.promptId) {
      // 编辑已有自定义
      updatePrompt(editor.promptId, {
        name,
        description: editor.description.trim(),
        systemPrompt: editor.systemPrompt.trim(),
        temperature: editor.temperature,
      });
    } else if (editor.mode === 'tweak' && editor.sourceId) {
      // 微调：另存为新角色
      const source = prompts.find((p) => p.id === editor.sourceId);
      const newPrompt: Prompt = {
        id: `custom_${Date.now()}`,
        name,
        description: editor.description.trim(),
        systemPrompt: editor.systemPrompt.trim(),
        temperature: editor.temperature,
        memoryMode: source?.memoryMode ?? 'session',
        tags: source ? ['微调', ...source.tags.filter((t) => t !== '自定义')] : ['自定义'],
        isBuiltIn: false,
        pinned: true, // 新建的角色自动加入常用
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addPrompt(newPrompt);
      // 立即激活新角色，让用户看到效果
      setActivePrompt(newPrompt.id);
    } else {
      // 新建
      const newPrompt: Prompt = {
        id: `custom_${Date.now()}`,
        name,
        description: editor.description.trim(),
        systemPrompt: editor.systemPrompt.trim(),
        temperature: editor.temperature,
        memoryMode: 'session',
        tags: ['自定义'],
        isBuiltIn: false,
        pinned: true, // 新建的角色自动加入常用
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addPrompt(newPrompt);
    }
    setEditor(null);
  };

  if (!isOpen) return null;

  // iOS / 安卓安全区：底部 safe-area，避免被 Home Indicator 遮挡
  return (
    <div
      className={`fixed inset-0 z-50 flex ${
        isMobile ? '' : 'justify-end'
      } animate-paper-fade-in`}
      style={{
        backgroundColor: isMobile ? 'var(--bg-main)' : 'rgba(28, 20, 10, 0.4)',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      onClick={isMobile ? undefined : onClose}
    >
      <div
        className={`${
          isMobile
            ? 'w-full h-full animate-drawer-in-up'
            : 'w-full max-w-2xl h-full shadow-paper-lg border-l-4 border-double animate-drawer-in-right'
        } flex flex-col overflow-hidden relative`}
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-medium)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 书脊装饰（桌面端） */}
        {!isMobile && (
          <div
            className="absolute top-0 left-0 bottom-0 w-1.5 z-20"
            style={{
              backgroundImage:
                'repeating-linear-gradient(to bottom, var(--accent) 0px, var(--accent) 4px, transparent 4px, transparent 8px)',
            }}
          />
        )}

        {/* 背景装饰：书堆（右下角，极低不透明） */}
        <div
          className="absolute -bottom-6 -right-6 pointer-events-none z-0"
          style={{ color: 'var(--accent-soft)', opacity: 0.08 }}
          aria-hidden
        >
          <BookStack size={180} />
        </div>

        {/* 背景装饰：墨点（左上角飞溅） */}
        <div
          className="absolute top-32 -left-2 pointer-events-none z-0"
          style={{ color: 'var(--accent)', opacity: 0.06 }}
          aria-hidden
        >
          <InkSplash size={120} />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-3.5 sm:px-5 py-3 sm:py-4 border-b-2 border-double flex-shrink-0 gap-2 relative z-10"
          style={{
            borderColor: 'var(--border-light)',
            backgroundColor: 'var(--bg-card)',
            // 暖色细微渐变：顶部微微向 paper-yellow 过渡
            backgroundImage:
              'linear-gradient(to bottom, var(--paper-yellow) 0%, var(--bg-card) 100%)',
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Logo 圆角方块版（来自 newimages/IMG_20260709_171628.png） */}
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-paper-sm flex items-center justify-center flex-shrink-0 border-2 border-double overflow-hidden shadow-paper-sm"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-medium)',
              }}
            >
              <img
                src={IMAGES.brandMarkV2}
                alt="ChatEZ"
                className="w-7 h-7 sm:w-8 sm:h-8 object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h2
                  className="text-[15px] sm:text-lg font-semibold font-handwriting-cn leading-tight truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  提示词市场
                </h2>
                <span style={{ color: 'var(--accent-soft)' }} aria-hidden>
                  <PlantLeaf size={14} />
                </span>
              </div>
              <p
                className="text-[10px] sm:text-[11px] font-handwriting-en mt-0.5 truncate"
                style={{ color: 'var(--text-muted)' }}
              >
                {isMobile
                  ? `· ${builtInCount} 内置 · ${customCount} 自定义 · ${pinnedCount} 常用`
                  : `· ${builtInCount} built-in · ${customCount} custom · ${pinnedCount} pinned`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 min-w-[40px] min-h-[40px] rounded-paper transition-colors hover:bg-[var(--bg-hover)] flex items-center justify-center flex-shrink-0"
            style={{ color: 'var(--text-muted)' }}
            aria-label="关闭"
          >
            <X size={20} />
          </button>
        </div>

        {/* Toolbar */}
        <div
          className="px-3.5 sm:px-5 py-3 border-b-2 border-dashed flex-shrink-0 relative z-10"
          style={{ borderColor: 'var(--border-light)' }}
        >
          {/* 搜索 + 新建 */}
          <div className="flex items-center gap-2 mb-2.5">
            <div className="flex-1 relative">
              <Search
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isMobile ? '搜索角色…' : '搜索角色名 / 描述 / 标签...'}
                className="w-full pl-8 pr-3 py-2 text-sm rounded-paper border-2 border-dashed focus:border-solid focus:outline-none min-h-[36px]"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <button
              onClick={startCreate}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-2 text-xs rounded-paper border-2 border-double font-handwriting-cn flex-shrink-0 min-h-[36px] min-w-[36px] justify-center shadow-paper-sm btn-ink"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--bg-card)',
                borderColor: 'var(--accent-hover)',
              }}
              title="新建角色"
            >
              <Plus size={12} />
              <span className="hidden xs:inline sm:inline">新建</span>
            </button>
          </div>

          {/* 标签筛选 */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              <TagChip
                label={`全部 (${prompts.length})`}
                active={activeTag === null}
                onClick={() => setActiveTag(null)}
              />
              {allTags.map((t) => {
                const count = prompts.filter((p) => p.tags.includes(t)).length;
                return (
                  <TagChip
                    key={t}
                    label={`${t} (${count})`}
                    active={activeTag === t}
                    onClick={() => setActiveTag(activeTag === t ? null : t)}
                  />
                );
              })}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex items-center gap-1.5 text-[10px] font-handwriting-en flex-wrap">
            <button
              onClick={handleExport}
              className="flex items-center gap-1 px-2 py-1 rounded-paper border border-dashed hover:border-solid min-h-[32px] transition-colors"
              style={{ color: 'var(--text-muted)', borderColor: 'var(--border-light)' }}
            >
              <Download size={10} />
              导出
            </button>
            <button
              onClick={handleImport}
              className="flex items-center gap-1 px-2 py-1 rounded-paper border border-dashed hover:border-solid min-h-[32px] transition-colors"
              style={{ color: 'var(--text-muted)', borderColor: 'var(--border-light)' }}
            >
              <Upload size={10} />
              导入
            </button>
            <button
              onClick={handleRestoreBuiltIn}
              className="flex items-center gap-1 px-2 py-1 rounded-paper border border-dashed hover:border-solid min-h-[32px] transition-colors"
              style={{ color: 'var(--text-muted)', borderColor: 'var(--border-light)' }}
              title="追加缺失的内置角色（保留自定义和常用）"
            >
              <Sparkles size={10} />
              还原内置
            </button>
            <span
              className="ml-auto text-[10px] font-handwriting-en flex items-center gap-1"
              style={{ color: 'var(--text-muted)' }}
            >
              <Users size={10} />
              {filtered.length} / {prompts.length}
            </span>
          </div>
        </div>

        {/* 角色列表 */}
        <div className="flex-1 overflow-y-auto px-3.5 sm:px-5 py-3 min-h-0 relative z-10">
          {filtered.length === 0 ? (
            <EmptyState
              onCreate={startCreate}
              onClearSearch={() => {
                setSearchQuery('');
                setActiveTag(null);
              }}
              hasFilter={!!searchQuery || !!activeTag}
            />
          ) : (
            <div className="space-y-2">
              {sorted.map((p) => (
                <RoleCard
                  key={p.id}
                  prompt={p}
                  isActive={activePromptId === p.id}
                  isApplied={appliedId === p.id}
                  isExpanded={expandedId === p.id}
                  onApply={() => handleApply(p)}
                  onToggleExpand={() => setExpandedId(expandedId === p.id ? null : p.id)}
                  onEdit={(e) => startEdit(e, p)}
                  onTweak={(e) => startTweak(e, p)}
                  onDelete={(e) => handleDelete(e, p.id)}
                  onTogglePin={(e) => handleTogglePin(e, p)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Editor (drawer) */}
        {editor && (
          <div
            className="border-t-2 border-double flex-shrink-0 max-h-[60vh] overflow-y-auto relative z-10"
            style={{
              borderColor: 'var(--border-medium)',
              backgroundColor: 'var(--bg-card)',
            }}
          >
            {/* 胶带装饰（顶部） */}
            <div className="relative h-0 z-20">
              <div
                className="absolute left-6 -top-2 w-20 pointer-events-none"
                style={{ color: 'var(--tape)', transform: 'rotate(-2deg)' }}
                aria-hidden
              >
                <TapeStrip size={80} />
              </div>
              <div
                className="absolute right-12 -top-2 w-16 pointer-events-none"
                style={{ color: 'var(--tape)', transform: 'rotate(3deg)' }}
                aria-hidden
              >
                <TapeStrip size={64} />
              </div>
            </div>

            <div className="p-4 sm:p-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <p
                  className="text-xs font-medium font-handwriting-en text-base flex items-center gap-1.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {editor.mode === 'edit'
                    ? '· editing role ·'
                    : editor.mode === 'tweak'
                    ? '· tweak & save as new ·'
                    : '· creating new role ·'}
                </p>
                <button
                  onClick={() => setEditor(null)}
                  className="p-1.5 min-w-[32px] min-h-[32px] rounded-paper flex items-center justify-center"
                  style={{ color: 'var(--text-muted)' }}
                  aria-label="取消"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={editor.name}
                  onChange={(e) => setEditor({ ...editor, name: e.target.value })}
                  placeholder="角色名 · name"
                  className="w-full px-3 py-2 rounded-paper-sm text-sm focus:outline-none border-2 font-handwriting-cn"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    borderColor: 'var(--border-light)',
                    color: 'var(--text-primary)',
                  }}
                />
                {/* 折角装饰 */}
                <div
                  className="absolute -top-1 -right-1 pointer-events-none"
                  style={{ color: 'var(--border-medium)' }}
                  aria-hidden
                >
                  <PaperCorner size={18} />
                </div>
              </div>

              <input
                type="text"
                value={editor.description}
                onChange={(e) => setEditor({ ...editor, description: e.target.value })}
                placeholder="简短描述 · description"
                className="w-full px-3 py-2 rounded-paper-sm text-sm focus:outline-none border-2"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-primary)',
                }}
              />

              <textarea
                value={editor.systemPrompt}
                onChange={(e) => setEditor({ ...editor, systemPrompt: e.target.value })}
                placeholder="系统提示词 · system prompt..."
                rows={5}
                className="w-full px-3 py-2 rounded-paper-sm text-sm resize-none focus:outline-none border-2 font-handwriting-cn"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-primary)',
                  lineHeight: '1.6',
                }}
              />

              <div>
                <label
                  className="text-[11px] font-handwriting-en text-base"
                  style={{ color: 'var(--text-muted)' }}
                >
                  temperature: {editor.temperature.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={editor.temperature}
                  onChange={(e) => setEditor({ ...editor, temperature: parseFloat(e.target.value) })}
                  className="w-full mt-0.5"
                  style={{ accentColor: 'var(--accent)' }}
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setEditor(null)}
                  className="flex-1 px-3 py-2 text-xs rounded-paper-sm transition-colors min-h-[36px]"
                  style={{
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--border-light)',
                  }}
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-paper-sm transition-colors font-handwriting-cn min-h-[36px] btn-ink shadow-paper-sm"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--bg-card)',
                    border: '2px solid var(--accent-hover)',
                  }}
                >
                  {editor.mode === 'tweak' ? (
                    <>
                      <Copy size={12} />
                      另存为新角色
                    </>
                  ) : editor.mode === 'edit' ? (
                    <>
                      <Save size={12} />
                      保存修改
                    </>
                  ) : (
                    <>
                      <Save size={12} />
                      创建
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface EditorState {
  mode: 'edit' | 'create' | 'tweak';
  promptId?: string;
  sourceId?: string; // 微调来源
  name: string;
  description: string;
  systemPrompt: string;
  temperature: number;
}

interface TagChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function TagChip({ label, active, onClick }: TagChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-1.5 py-0.5 text-[10px] rounded-paper border font-handwriting-cn transition-all min-h-[24px] ${
        active ? 'border-solid shadow-paper-sm' : 'border-dashed hover:border-solid'
      }`}
      style={{
        backgroundColor: active ? 'var(--accent)' : 'var(--bg-card)',
        borderColor: active ? 'var(--accent)' : 'var(--border-light)',
        color: active ? 'var(--bg-card)' : 'var(--text-muted)',
      }}
    >
      {label}
    </button>
  );
}

interface RoleCardProps {
  prompt: Prompt;
  isActive: boolean;
  isApplied: boolean;
  isExpanded: boolean;
  onApply: () => void;
  onToggleExpand: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onTweak: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onTogglePin: (e: React.MouseEvent) => void;
}

function RoleCard({
  prompt,
  isActive,
  isApplied,
  isExpanded,
  onApply,
  onToggleExpand,
  onEdit,
  onTweak,
  onDelete,
  onTogglePin,
}: RoleCardProps) {
  const isPinned = prompt.pinned === true;

  // 背景：根据状态用协调色
  // - 激活/已应用：信纸黄
  // - 常用：浅 accent
  // - 普通：纸卡色
  let cardBg = 'var(--bg-card)';
  let cardBorder = 'var(--border-light)';
  let cardBorderStyle: 'dashed' | 'solid' | 'double' = 'dashed';
  if (isActive || isApplied) {
    cardBg = 'var(--paper-yellow)';
    cardBorder = 'var(--accent)';
    cardBorderStyle = 'solid';
  } else if (isPinned) {
    cardBg = 'var(--accent-light)';
    cardBorder = 'var(--accent)';
  }

  return (
    <div
      className="rounded-paper border-2 transition-all overflow-hidden relative"
      style={{
        backgroundColor: cardBg,
        borderColor: cardBorder,
        borderStyle: cardBorderStyle,
      }}
    >
      {/* 常用时：右上角小型 TapeStrip 装饰 */}
      {isPinned && !isActive && !isApplied && (
        <div
          className="absolute -top-1.5 right-12 pointer-events-none"
          style={{ color: 'var(--tape)', transform: 'rotate(8deg)' }}
          aria-hidden
        >
          <TapeStrip size={48} />
        </div>
      )}

      <div className="flex items-start gap-2 p-2.5 sm:p-3">
        <button
          onClick={onTogglePin}
          className="p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center flex-shrink-0 rounded-paper hover:bg-black/5"
          style={{ color: isPinned ? 'var(--accent)' : 'var(--text-muted)' }}
          title={isPinned ? '从常用中移除' : '加入常用（侧边栏下拉可见）'}
        >
          <Star size={14} fill={isPinned ? 'currentColor' : 'none'} />
        </button>

        <div className="flex-1 min-w-0">
          <div
            className="text-sm font-medium font-handwriting-cn flex items-center gap-1.5 flex-wrap"
            style={{ color: 'var(--text-primary)' }}
          >
            <span className="truncate max-w-full">{prompt.name}</span>
            {prompt.isBuiltIn ? (
              <span
                className="text-[9px] font-handwriting-en px-1.5 py-0.5 rounded-paper flex-shrink-0"
                style={{
                  backgroundColor: 'var(--paper-yellow)',
                  color: 'var(--accent-hover)',
                  border: '1px dashed var(--accent)',
                }}
              >
                内置
              </span>
            ) : (
              <span
                className="text-[9px] font-handwriting-en px-1.5 py-0.5 rounded-paper flex-shrink-0"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--bg-card)',
                  border: '1px dashed var(--accent-hover)',
                }}
              >
                自定义
              </span>
            )}
            {isActive && (
              <span
                className="text-[9px] font-handwriting-cn px-1.5 py-0.5 rounded-paper flex-shrink-0 font-semibold"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--bg-card)',
                }}
              >
                ✓ 已激活
              </span>
            )}
            {isPinned && !isActive && (
              <span
                className="text-[9px] font-handwriting-en px-1.5 py-0.5 rounded-paper flex-shrink-0"
                style={{
                  backgroundColor: 'var(--paper-yellow)',
                  color: 'var(--accent-hover)',
                  border: '1px dashed var(--accent)',
                }}
              >
                ★ 常用
              </span>
            )}
          </div>
          <div
            className="text-[10px] font-handwriting-cn text-base truncate mt-0.5"
            style={{ color: 'var(--text-muted)' }}
          >
            {prompt.description || '—'}
          </div>
          {prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {prompt.tags.map((t) => (
                <span
                  key={t}
                  className="text-[9px] font-handwriting-cn px-1 py-0.5 rounded-paper"
                  style={{
                    backgroundColor: isActive || isApplied ? 'var(--bg-card)' : 'var(--bg-hover)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  {t}
                </span>
              ))}
              <span
                className="text-[9px] font-handwriting-en font-mono px-1 py-0.5"
                style={{ color: 'var(--text-muted)' }}
              >
                T={prompt.temperature}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          {/* 微调按钮：所有角色都可用 */}
          <button
            onClick={onTweak}
            className="p-1.5 min-w-[32px] min-h-[32px] rounded-paper hover:bg-black/5 flex items-center justify-center"
            style={{ color: 'var(--accent)' }}
            title={prompt.isBuiltIn ? '微调并另存为新角色' : '复制此角色并微调'}
          >
            <Wand2 size={12} />
          </button>
          {!prompt.isBuiltIn && (
            <button
              onClick={onEdit}
              className="p-1.5 min-w-[32px] min-h-[32px] rounded-paper hover:bg-black/5 flex items-center justify-center"
              style={{ color: 'var(--text-muted)' }}
              title="编辑"
            >
              <Pencil size={12} />
            </button>
          )}
          {!prompt.isBuiltIn && (
            <button
              onClick={onDelete}
              className="p-1.5 min-w-[32px] min-h-[32px] rounded-paper hover:bg-black/5 flex items-center justify-center"
              style={{ color: 'var(--text-muted)' }}
              title="删除"
            >
              <Trash2 size={12} />
            </button>
          )}
          <button
            onClick={onToggleExpand}
            className="p-1.5 min-w-[32px] min-h-[32px] rounded-paper hover:bg-black/5 flex items-center justify-center"
            title="查看详情"
          >
            <ChevronRight
              size={12}
              style={{
                color: 'var(--text-muted)',
                transform: isExpanded ? 'rotate(90deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div
          className="px-3 pb-3 pt-1 border-t space-y-1.5"
          style={{ borderColor: 'var(--border-light)' }}
        >
          <div
            className="text-[10px] font-handwriting-en"
            style={{ color: 'var(--text-muted)' }}
          >
            · 系统提示词 ·
          </div>
          <div
            className="text-[11px] font-handwriting-cn p-2 rounded-paper leading-relaxed"
            style={{
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              border: '1px dashed var(--border-light)',
              whiteSpace: 'pre-wrap',
              maxHeight: '160px',
              overflowY: 'auto',
            }}
          >
            {prompt.systemPrompt}
          </div>
          <div
            className="flex items-center gap-2 text-[10px] font-handwriting-en flex-wrap"
            style={{ color: 'var(--text-muted)' }}
          >
            <span>温度 {prompt.temperature.toFixed(2)}</span>
            <span>·</span>
            <span>记忆 {prompt.memoryMode === 'session' ? '会话级' : '持久'}</span>
            <span>·</span>
            <span>更新 {prompt.updatedAt.slice(0, 10)}</span>
          </div>
        </div>
      )}

      <div className="px-2.5 sm:px-3 pb-2.5 sm:pb-3">
        <div className="flex items-stretch gap-1.5">
          {/* 主按钮：启用/已激活 */}
          <button
            onClick={onApply}
            className="flex-1 text-[11px] flex items-center justify-center gap-1 py-1.5 rounded-paper border-2 border-double font-handwriting-cn transition-all min-h-[36px] btn-ink"
            style={{
              backgroundColor: isActive || isApplied ? 'var(--accent)' : 'var(--paper-yellow)',
              color: isActive || isApplied ? 'var(--bg-card)' : 'var(--accent-hover)',
              borderColor: 'var(--accent)',
            }}
          >
            {isActive ? (
              <>
                <Check size={12} />
                当前激活
              </>
            ) : isApplied ? (
              <>
                <Check size={12} />
                已激活
              </>
            ) : (
              <>
                <Sparkles size={12} />
                启用此角色
              </>
            )}
          </button>
          {/* 微调快捷按钮（仅图标，与启用按钮并排） */}
          <button
            onClick={onTweak}
            className="px-2.5 py-1.5 rounded-paper border-2 border-double transition-all flex items-center justify-center min-h-[36px] min-w-[36px]"
            style={{
              backgroundColor: 'var(--bg-card)',
              color: 'var(--accent)',
              borderColor: 'var(--accent)',
            }}
            title="微调此角色并另存为新角色"
          >
            <Wand2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  onCreate: () => void;
  onClearSearch: () => void;
  hasFilter: boolean;
}

function EmptyState({ onCreate, onClearSearch, hasFilter }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 sm:py-14 px-4 relative">
      {/* 装饰：书堆 */}
      <div
        className="mb-3 pointer-events-none"
        style={{ color: 'var(--accent)', opacity: 0.5 }}
        aria-hidden
      >
        <BookStack size={88} />
      </div>
      {/* 装饰：墨点 */}
      <div
        className="absolute top-4 right-6 pointer-events-none"
        style={{ color: 'var(--accent)', opacity: 0.3 }}
        aria-hidden
      >
        <InkSplash size={48} />
      </div>
      <p
        className="text-sm font-handwriting-cn mb-1 text-center"
        style={{ color: 'var(--text-secondary)' }}
      >
        {hasFilter ? '没有匹配的角色' : '还没有自定义角色'}
      </p>
      <p
        className="text-[11px] font-handwriting-en mb-5 text-center max-w-xs"
        style={{ color: 'var(--text-muted)' }}
      >
        {hasFilter
          ? '— no matching roles —'
          : '— start by creating a new role —'}
      </p>

      {/* 手绘分隔线 */}
      <div className="w-full max-w-xs flex justify-center mb-5" aria-hidden>
        <DividerHandDrawn
          size={200}
          className="w-32"
          style={{ color: 'var(--border-medium)' }}
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-center">
        {hasFilter ? (
          <button
            onClick={onClearSearch}
            className="px-3 py-1.5 text-xs rounded-paper border-2 border-dashed font-handwriting-cn transition-all min-h-[36px]"
            style={{
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-secondary)',
              borderColor: 'var(--border-light)',
            }}
          >
            清除筛选
          </button>
        ) : null}
        <button
          onClick={onCreate}
          className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-paper border-2 border-double font-handwriting-cn transition-all min-h-[36px] btn-ink shadow-paper-sm"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--bg-card)',
            borderColor: 'var(--accent-hover)',
          }}
        >
          <Plus size={12} />
          {hasFilter ? '新建一个' : '新建第一个角色'}
        </button>
      </div>
    </div>
  );
}
