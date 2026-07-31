import { useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSkillStore } from '../../stores/skillStore';
import { useConfigStore } from '../../stores/configStore';
import { Skill } from '../../types/skill';
import { useDropdownPortal } from '../../hooks/useDropdownPortal';
import {
  ChevronDown,
  Pencil,
  Plus,
  Save,
  X,
  Play,
  Square,
  Check,
  Sparkles,
  Power,
  PowerOff,
  Search,
} from 'lucide-react';

interface EditorState {
  mode: 'edit' | 'create';
  skillId?: string;
  name: string;
  trigger: string;
  description: string;
  systemPrompt: string;
  keywords: string;
}

export function SkillSelector() {
  const { skills, activeSkillId, setActiveSkill, addSkill, updateSkill, removeSkill } = useSkillStore();
  const { skill: skillConfig, updateSkillConfig } = useConfigStore();
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { isOpen, toggle, close, position } = useDropdownPortal(buttonRef);

  // 过滤 skill：按 trigger / name / description / keywords 匹配
  const filteredSkills = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return skills;
    return skills.filter((s) => {
      if (s.trigger.toLowerCase().includes(q)) return true;
      if (s.name.toLowerCase().includes(q)) return true;
      if (s.description.toLowerCase().includes(q)) return true;
      if (s.keywords?.some((k) => k.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [skills, searchQuery]);

  const startEdit = (e: React.MouseEvent, skill: Skill) => {
    e.stopPropagation();
    setEditor({
      mode: 'edit',
      skillId: skill.id,
      name: skill.name,
      trigger: skill.trigger,
      description: skill.description,
      systemPrompt: skill.systemPrompt,
      keywords: (skill.keywords ?? []).join('、'),
    });
  };

  const startCreate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditor({
      mode: 'create',
      name: '',
      trigger: '/',
      description: '',
      systemPrompt: '',
      keywords: '',
    });
  };

  const handleSave = () => {
    if (!editor) return;
    if (!editor.name.trim() || !editor.trigger.trim() || !editor.systemPrompt.trim()) {
      alert('名称、触发命令和系统提示词不能为空');
      return;
    }

    const trigger = editor.trigger.startsWith('/') ? editor.trigger : `/${editor.trigger}`;
    const keywords = editor.keywords
      .split(/[、,，\s]+/)
      .map((k) => k.trim())
      .filter(Boolean);

    if (editor.mode === 'edit' && editor.skillId) {
      updateSkill(editor.skillId, {
        name: editor.name.trim(),
        trigger,
        description: editor.description.trim(),
        systemPrompt: editor.systemPrompt.trim(),
        keywords: keywords.length > 0 ? keywords : undefined,
      });
    } else {
      const newSkill: Skill = {
        id: `custom_${Date.now()}`,
        name: editor.name.trim(),
        trigger,
        description: editor.description.trim(),
        systemPrompt: editor.systemPrompt.trim(),
        keywords: keywords.length > 0 ? keywords : undefined,
        isBuiltIn: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addSkill(newSkill);
    }
    setEditor(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('确定删除这个 Skill？')) {
      removeSkill(id);
    }
  };

  /** 切换"激活"状态：再次点击当前激活的 Skill 即可关闭 */
  const handleActivate = (e: React.MouseEvent, skill: Skill) => {
    e.stopPropagation();
    if (activeSkillId === skill.id) {
      setActiveSkill(null);
    } else {
      setActiveSkill(skill.id);
      close(); // 选完即关
    }
  };

  /**
   * 切换"启用"状态（控制 detectByCommand / detectByKeywords 是否能匹配）
   * 内置 skill 始终启用（不允许禁用）
   */
  const handleToggleEnabled = (e: React.MouseEvent, skill: Skill) => {
    e.stopPropagation();
    if (skill.isBuiltIn) return; // 内置不可禁
    const current = skillConfig.enabledSkills;
    const isEnabled = current.includes(skill.id);
    const next = isEnabled
      ? current.filter((id) => id !== skill.id)
      : [...current, skill.id];
    updateSkillConfig({ enabledSkills: next });
  };

  /**
   * 全部启用 / 全部禁用 自定义 skill
   * 内置 skill 始终启用，所以只对自定义 skill 操作
   */
  const handleToggleAll = () => {
    const customSkills = skills.filter((s) => !s.isBuiltIn);
    if (customSkills.length === 0) return;
    const customIds = customSkills.map((s) => s.id);
    const allEnabled = customIds.every((id) => skillConfig.enabledSkills.includes(id));
    // 如果全部已启用则全部禁用，否则全部启用
    const next = allEnabled ? [] : customIds;
    updateSkillConfig({ enabledSkills: next });
  };

  const activeSkill = skills.find((s) => s.id === activeSkillId);

  /**
   * 统计：已启用的 skill 数量
   * 内置 skill 永远启用 + enabledSkills 中的自定义 skill
   */
  const enabledCount = useMemo(() => {
    const builtInCount = skills.filter((s) => s.isBuiltIn).length;
    const customEnabledCount = skills.filter(
      (s) => !s.isBuiltIn && skillConfig.enabledSkills.includes(s.id),
    ).length;
    return builtInCount + customEnabledCount;
  }, [skills, skillConfig.enabledSkills]);

  const allCustomEnabled = useMemo(() => {
    const customSkills = skills.filter((s) => !s.isBuiltIn);
    if (customSkills.length === 0) return true; // 没有自定义 skill 时按钮置灰
    return customSkills.every((s) => skillConfig.enabledSkills.includes(s.id));
  }, [skills, skillConfig.enabledSkills]);

  const renderButton = () => (
    <button
      ref={buttonRef}
      onClick={toggle}
      className="w-full flex items-center justify-between px-3 py-2 rounded-paper border-2 transition-all text-sm min-h-[40px]"
      style={{
        backgroundColor: activeSkill ? 'var(--accent-light)' : 'var(--bg-card)',
        borderColor: isOpen
          ? 'var(--accent)'
          : activeSkill
            ? 'var(--accent)'
            : 'var(--border-light)',
        borderStyle: isOpen || activeSkill ? 'solid' : 'dashed',
      }}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {activeSkill ? (
          <Play size={10} style={{ color: 'var(--accent)' }} fill="currentColor" className="flex-shrink-0" />
        ) : null}
        <span
          style={{ color: activeSkill ? 'var(--accent)' : 'var(--text-secondary)' }}
          className="truncate font-handwriting-cn text-base"
        >
          {activeSkill ? activeSkill.name : `技能 (${skills.length})`}
        </span>
        {!activeSkill && (
          <span
            className="text-[9px] font-handwriting-en px-1 rounded-sm flex-shrink-0"
            style={{
              backgroundColor: 'var(--paper-yellow)',
              color: 'var(--accent)',
              border: '1px dashed var(--border-light)',
            }}
          >
            {enabledCount}/{skills.length}
          </span>
        )}
      </div>
      <ChevronDown
        size={14}
        className={`transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        style={{ color: 'var(--text-muted)' }}
      />
    </button>
  );

  const renderDropdown = () => {
    if (!isOpen) return null;
    if (typeof document === 'undefined') return null;

    const transformOrigin = position.canOpenDown ? 'top left' : 'bottom left';
    const transform = position.canOpenDown ? 'translateY(0)' : 'translateY(-100%)';

    return createPortal(
      <>
        {/* 透明遮罩（捕获点击关闭） */}
        <div
          className="fixed inset-0"
          style={{ zIndex: 9998 }}
          onClick={() => { close(); setEditor(null); setSearchQuery(''); }}
        />
        {/* 下拉菜单本体：使用 fixed 定位 + portal 渲染，跳出父级 overflow 上下文 */}
        <div
          className="fixed rounded-paper shadow-paper-lg border-2 border-double"
          style={{
            top: position.top,
            left: position.left,
            width: position.width,
            maxHeight: '70vh',
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-medium)',
            zIndex: 9999,
            transformOrigin,
            transform,
          }}
        >
          {/* 顶部：已启用数 + 全部启用/禁用按钮 + autoDetect 开关 */}
          <div
            className="px-3 py-2 border-b-2 border-double flex items-center justify-between gap-2"
            style={{ borderColor: 'var(--border-light)' }}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Sparkles size={11} style={{ color: 'var(--accent)' }} className="flex-shrink-0" />
              <span
                className="text-[11px] font-handwriting-cn truncate"
                style={{ color: 'var(--text-secondary)' }}
              >
                已启用 <strong style={{ color: 'var(--accent)' }}>{enabledCount}</strong> / {skills.length}
              </span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* autoDetect 总开关 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateSkillConfig({ autoDetect: !skillConfig.autoDetect });
                }}
                className="text-[10px] font-handwriting-en px-1.5 py-0.5 rounded-sm flex items-center gap-1"
                style={{
                  backgroundColor: skillConfig.autoDetect ? 'var(--accent-light)' : 'var(--bg-hover)',
                  color: skillConfig.autoDetect ? 'var(--accent)' : 'var(--text-muted)',
                  border: '1px solid var(--border-light)',
                }}
                title={skillConfig.autoDetect ? '已开启自然语言识别' : '已关闭自然语言识别'}
              >
                <Power size={9} />
                auto
              </button>
              {/* 全部启用/禁用（仅自定义 skill） */}
              {skills.some((s) => !s.isBuiltIn) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleAll();
                  }}
                  className="text-[10px] font-handwriting-en px-1.5 py-0.5 rounded-sm flex items-center gap-1"
                  style={{
                    backgroundColor: allCustomEnabled ? 'var(--bg-hover)' : 'var(--accent-light)',
                    color: allCustomEnabled ? 'var(--text-muted)' : 'var(--accent)',
                    border: '1px solid var(--border-light)',
                  }}
                  title={allCustomEnabled ? '全部禁用自定义 skill' : '全部启用自定义 skill'}
                >
                  {allCustomEnabled ? <PowerOff size={9} /> : <Power size={9} />}
                  {allCustomEnabled ? '全禁用' : '全启用'}
                </button>
              )}
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {/* 搜索框 + 计数 */}
            <div
              className="px-3 py-2 flex items-center gap-2 sticky top-0 z-10"
              style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px dashed var(--border-light)' }}
            >
              <Search size={11} style={{ color: 'var(--text-muted)' }} className="flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索 trigger / name / 关键字"
                className="flex-1 bg-transparent text-xs focus:outline-none"
                style={{ color: 'var(--text-primary)' }}
                onClick={(e) => e.stopPropagation()}
              />
              {searchQuery && (
                <button
                  onClick={(e) => { e.stopPropagation(); setSearchQuery(''); }}
                  className="p-0.5 rounded-sm flex-shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                  aria-label="清空搜索"
                >
                  <X size={10} />
                </button>
              )}
              <span
                className="text-[9px] font-handwriting-en flex-shrink-0"
                style={{ color: 'var(--text-muted)' }}
              >
                {filteredSkills.length}/{skills.length}
              </span>
            </div>
            {filteredSkills.length === 0 && (
              <div
                className="px-3 py-6 text-center text-[11px] font-handwriting-cn"
                style={{ color: 'var(--text-muted)' }}
              >
                · 没有匹配的 skill ·
              </div>
            )}
            {filteredSkills.map((skill) => {
              const isActive = skill.id === activeSkillId;
              const isEnabled = skill.isBuiltIn || skillConfig.enabledSkills.includes(skill.id);
              return (
                <div
                  key={skill.id}
                  className="flex flex-col px-3 py-2 transition-colors group"
                  style={{
                    backgroundColor: isActive ? 'var(--accent-light)' : 'transparent',
                    borderBottom: '1px dashed var(--border-light)',
                    opacity: isEnabled ? 1 : 0.55,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div className="flex items-center gap-2">
                    {/* 激活按钮 */}
                    <button
                      onClick={(e) => handleActivate(e, skill)}
                      className="p-1 rounded-sm flex-shrink-0 transition-all"
                      style={{
                        color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                        backgroundColor: isActive ? 'var(--bg-card)' : 'transparent',
                      }}
                      title={isActive ? '点击停止激活' : '点击激活'}
                      aria-label={isActive ? '停止' : '激活'}
                    >
                      {isActive ? <Square size={10} fill="currentColor" /> : <Play size={10} />}
                    </button>
                    {/* skill 名 + trigger */}
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={(e) => handleActivate(e, skill)}
                    >
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <code
                          className="text-[11px] font-mono px-1.5 py-0.5 rounded-sm"
                          style={{ backgroundColor: 'var(--paper-yellow)', color: 'var(--accent)' }}
                        >
                          {skill.trigger}
                        </code>
                        <span className="text-sm font-handwriting-cn" style={{ color: 'var(--text-primary)' }}>
                          {skill.name}
                        </span>
                        {!isEnabled && (
                          <span
                            className="text-[9px] px-1 rounded-sm"
                            style={{
                              backgroundColor: 'var(--bg-hover)',
                              color: 'var(--text-muted)',
                              border: '1px dashed var(--border-light)',
                            }}
                          >
                            已禁用
                          </span>
                        )}
                        {skill.isBuiltIn && (
                          <span
                            className="text-[9px] px-1 rounded-sm font-handwriting-en"
                            style={{
                              backgroundColor: 'var(--bg-hover)',
                              color: 'var(--text-muted)',
                            }}
                          >
                            内置
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {skill.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {/* 启用/禁用开关（仅自定义 skill 可切换） */}
                      {!skill.isBuiltIn && (
                        <button
                          onClick={(e) => handleToggleEnabled(e, skill)}
                          className="p-1 rounded-sm"
                          style={{ color: isEnabled ? 'var(--accent)' : 'var(--text-muted)' }}
                          title={isEnabled ? '已启用（点击禁用）' : '已禁用（点击启用）'}
                          aria-label={isEnabled ? '禁用' : '启用'}
                        >
                          {isEnabled ? <Check size={12} /> : <PowerOff size={12} />}
                        </button>
                      )}
                      <button
                        onClick={(e) => startEdit(e, skill)}
                        className="p-1 rounded-sm"
                        style={{ color: 'var(--text-muted)' }}
                        title="编辑"
                      >
                        <Pencil size={12} />
                      </button>
                      {!skill.isBuiltIn && (
                        <button
                          onClick={(e) => handleDelete(e, skill.id)}
                          className="p-1 rounded-sm"
                          style={{ color: 'var(--text-muted)' }}
                          title="删除"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                  {/* 关键词提示：让用户知道自然语言如何触发 */}
                  {skill.keywords && skill.keywords.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1 pl-7">
                      {skill.keywords.slice(0, 5).map((kw, i) => (
                        <span
                          key={i}
                          className="text-[9px] font-handwriting-cn px-1 py-0.5 rounded-sm"
                          style={{
                            backgroundColor: 'var(--paper-yellow)',
                            color: 'var(--text-muted)',
                            opacity: 0.75,
                          }}
                        >
                          "{kw}"
                        </span>
                      ))}
                      {skill.keywords.length > 5 && (
                        <span
                          className="text-[9px] font-handwriting-en px-1 py-0.5"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          +{skill.keywords.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t" style={{ borderColor: 'var(--border-light)' }}>
            <button
              onClick={startCreate}
              className="w-full flex items-center gap-2 px-3 py-2.5 transition-colors text-sm font-handwriting-cn text-base"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Plus size={14} />
              新建 · create
            </button>
          </div>

          {/* 编辑器 */}
          {editor && (
            <div
              className="border-t p-3 space-y-2.5"
              style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-hover)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-xs font-medium font-handwriting-en text-base" style={{ color: 'var(--text-muted)' }}>
                {editor.mode === 'edit' ? '· editing ·' : '· creating ·'}
              </p>

              <input
                type="text"
                value={editor.name}
                onChange={(e) => setEditor({ ...editor, name: e.target.value })}
                placeholder="名称 · name"
                className="w-full px-2.5 py-1.5 rounded-paper-sm text-sm focus:outline-none border-2"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-handwriting-cn)',
                }}
              />

              <input
                type="text"
                value={editor.trigger}
                onChange={(e) => setEditor({ ...editor, trigger: e.target.value })}
                placeholder="触发命令 · /sql"
                className="w-full px-2.5 py-1.5 rounded-paper-sm text-sm font-mono focus:outline-none border-2"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-primary)',
                }}
              />

              <input
                type="text"
                value={editor.description}
                onChange={(e) => setEditor({ ...editor, description: e.target.value })}
                placeholder="描述 · description"
                className="w-full px-2.5 py-1.5 rounded-paper-sm text-sm focus:outline-none border-2"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-primary)',
                }}
              />

              <input
                type="text"
                value={editor.keywords}
                onChange={(e) => setEditor({ ...editor, keywords: e.target.value })}
                placeholder="自然语言关键字 · 用 、 分隔"
                className="w-full px-2.5 py-1.5 rounded-paper-sm text-sm focus:outline-none border-2"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-primary)',
                }}
              />

              <textarea
                value={editor.systemPrompt}
                onChange={(e) => setEditor({ ...editor, systemPrompt: e.target.value })}
                placeholder="系统提示词 · system prompt..."
                rows={4}
                className="w-full px-2.5 py-1.5 rounded-paper-sm text-sm resize-none focus:outline-none border-2"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-primary)',
                }}
              />

              <div className="flex gap-2 pt-0.5">
                <button
                  onClick={() => setEditor(null)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-paper-sm transition-colors"
                  style={{
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--border-light)',
                  }}
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs rounded-paper-sm transition-colors"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--bg-card)',
                  }}
                >
                  <Save size={12} />
                  保存
                </button>
              </div>
            </div>
          )}
        </div>
      </>,
      document.body
    );
  };

  return (
    <>
      {renderButton()}
      {renderDropdown()}
    </>
  );
}
