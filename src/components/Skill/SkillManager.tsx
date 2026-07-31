import { useState } from 'react';
import { useSkillStore } from '../../stores/skillStore';
import { Plus, Edit2, Trash2, Download, Upload, X, Save, Sparkles } from 'lucide-react';

interface SkillEditorProps {
  skill?: {
    id: string;
    name: string;
    trigger: string;
    description: string;
    systemPrompt: string;
    keywords?: string[];
  };
  onSave: (skill: {
    id: string;
    name: string;
    trigger: string;
    description: string;
    systemPrompt: string;
    keywords?: string[];
  }) => void;
  onCancel: () => void;
}

function SkillEditor({ skill, onSave, onCancel }: SkillEditorProps) {
  const [name, setName] = useState(skill?.name || '');
  const [trigger, setTrigger] = useState(skill?.trigger || '/');
  const [description, setDescription] = useState(skill?.description || '');
  const [systemPrompt, setSystemPrompt] = useState(skill?.systemPrompt || '');
  const [keywordsText, setKeywordsText] = useState(
    (skill?.keywords ?? []).join('、'),
  );

  const handleSave = () => {
    if (!name || !trigger || !systemPrompt) {
      alert('请填写必填字段');
      return;
    }

    const keywords = keywordsText
      .split(/[、,，\s]+/)
      .map((k) => k.trim())
      .filter(Boolean);

    onSave({
      id: skill?.id || `custom_${Date.now()}`,
      name,
      trigger: trigger.startsWith('/') ? trigger : `/${trigger}`,
      description,
      systemPrompt,
      keywords: keywords.length > 0 ? keywords : undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(28, 20, 10, 0.5)', backdropFilter: 'blur(2px)' }}
    >
      <div
        className="rounded-paper-lg shadow-paper-lg w-full max-w-lg max-h-[85vh] flex flex-col mx-4 border-2 border-double"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-medium)',
        }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b-2 border-double"
          style={{ borderColor: 'var(--border-light)' }}
        >
          <h3 className="text-lg font-semibold font-handwriting-cn">
            {skill ? '编辑 Skill' : '新建 Skill'}
          </h3>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-paper transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-1 font-handwriting-cn"
              style={{ color: 'var(--text-secondary)' }}
            >
              名称 *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：SQL 生成器"
              className="w-full px-4 py-2.5 rounded-paper text-sm focus:outline-none border-2"
              style={{
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-handwriting-cn)',
              }}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1 font-handwriting-cn"
              style={{ color: 'var(--text-secondary)' }}
            >
              触发命令 *
            </label>
            <input
              type="text"
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              placeholder="例如：/sql"
              className="w-full px-4 py-2.5 rounded-paper text-sm focus:outline-none border-2 font-mono"
              style={{
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1 font-handwriting-cn"
              style={{ color: 'var(--text-secondary)' }}
            >
              描述
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简短描述功能"
              className="w-full px-4 py-2.5 rounded-paper text-sm focus:outline-none border-2"
              style={{
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1 font-handwriting-cn flex items-center gap-1.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Sparkles size={12} style={{ color: 'var(--accent)' }} />
              自然语言关键字
              <span
                className="text-[10px] font-handwriting-en"
                style={{ color: 'var(--text-muted)' }}
              >
                · optional
              </span>
            </label>
            <input
              type="text"
              value={keywordsText}
              onChange={(e) => setKeywordsText(e.target.value)}
              placeholder="用 、 分隔，例如：总结、摘要、概括"
              className="w-full px-4 py-2.5 rounded-paper text-sm focus:outline-none border-2"
              style={{
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)',
              }}
            />
            <p
              className="text-[10px] mt-1 font-handwriting-en"
              style={{ color: 'var(--text-muted)' }}
            >
              用户输入包含任一关键字时自动触发（无需 /command）
            </p>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1 font-handwriting-cn"
              style={{ color: 'var(--text-secondary)' }}
            >
              系统提示词 *
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="定义 AI 的行为..."
              rows={6}
              className="w-full px-4 py-2.5 rounded-paper text-sm resize-none focus:outline-none border-2"
              style={{
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>

        <div
          className="flex justify-end gap-3 px-6 py-4 border-t-2 border-double"
          style={{ borderColor: 'var(--border-light)' }}
        >
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-paper transition-colors font-handwriting-cn"
            style={{
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-hover)',
            }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-paper transition-colors flex items-center gap-2 border-2 border-double"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--bg-card)',
              borderColor: 'var(--accent-hover)',
            }}
          >
            <Save size={16} />
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

export function SkillManager() {
  const { skills, addSkill, removeSkill, updateSkill, exportSkills, importSkills, resetSkills } =
    useSkillStore();
  const [showEditor, setShowEditor] = useState(false);
  const [editingSkill, setEditingSkill] = useState<{
    id: string;
    name: string;
    trigger: string;
    description: string;
    systemPrompt: string;
    keywords?: string[];
  } | null>(null);

  const handleSave = (skillData: {
    id: string;
    name: string;
    trigger: string;
    description: string;
    systemPrompt: string;
    keywords?: string[];
  }) => {
    if (editingSkill) {
      updateSkill(editingSkill.id, skillData);
    } else {
      addSkill({
        ...skillData,
        isBuiltIn: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    setShowEditor(false);
    setEditingSkill(null);
  };

  const handleExport = () => {
    const json = exportSkills();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatez-skills-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
          const success = importSkills(text);
          alert(success ? 'Skill 导入成功！' : '导入失败，请检查文件格式');
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const customSkills = skills.filter((s) => !s.isBuiltIn);
  const builtInSkills = skills.filter((s) => s.isBuiltIn);

  return (
    <div className="space-y-6">
      {/* 操作栏 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            setEditingSkill(null);
            setShowEditor(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-paper transition-colors border-2 border-double"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--bg-card)',
            borderColor: 'var(--accent-hover)',
          }}
        >
          <Plus size={16} />
          <span className="font-handwriting-cn">新建 Skill</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 rounded-paper transition-colors"
            style={{
              backgroundColor: 'var(--bg-hover)',
              color: 'var(--text-secondary)',
            }}
          >
            <Download size={14} />
            导出
          </button>
          <button
            onClick={handleImport}
            className="flex items-center gap-2 px-3 py-2 rounded-paper transition-colors"
            style={{
              backgroundColor: 'var(--bg-hover)',
              color: 'var(--text-secondary)',
            }}
          >
            <Upload size={14} />
            导入
          </button>
        </div>
      </div>

      {/* 自定义 Skill */}
      {customSkills.length > 0 && (
        <div>
          <h4
            className="font-medium mb-3 font-handwriting-cn text-base"
            style={{ color: 'var(--text-secondary)' }}
          >
            · 自定义 Skill ·
          </h4>
          <div className="space-y-2">
            {customSkills.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center justify-between p-4 rounded-paper border-2"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-light)',
                  borderStyle: 'dashed',
                }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <code
                      className="text-sm font-mono px-2 py-0.5 rounded-sm"
                      style={{
                        backgroundColor: 'var(--paper-yellow)',
                        color: 'var(--accent)',
                      }}
                    >
                      {skill.trigger}
                    </code>
                    <span
                      className="font-medium font-handwriting-cn text-base"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {skill.name}
                    </span>
                  </div>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    {skill.description}
                  </p>
                  {skill.keywords && skill.keywords.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {skill.keywords.slice(0, 6).map((kw, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-handwriting-cn px-1.5 py-0.5 rounded-sm"
                          style={{
                            backgroundColor: 'var(--paper-yellow)',
                            color: 'var(--text-muted)',
                          }}
                          title={`自然语言关键字：${kw}`}
                        >
                          "{kw}"
                        </span>
                      ))}
                      {skill.keywords.length > 6 && (
                        <span
                          className="text-[10px] font-handwriting-en"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          +{skill.keywords.length - 6}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingSkill(skill);
                      setShowEditor(true);
                    }}
                    className="p-2 rounded-paper-sm transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('确定删除这个 Skill 吗？')) {
                        removeSkill(skill.id);
                      }
                    }}
                    className="p-2 rounded-paper-sm transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 内置 Skill */}
      <div>
        <h4
          className="font-medium mb-3 font-handwriting-cn text-base"
          style={{ color: 'var(--text-secondary)' }}
        >
          · 内置 Skill ·
        </h4>
        <div className="space-y-2">
          {builtInSkills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center justify-between p-4 rounded-paper border-2 border-double"
              style={{
                backgroundColor: 'var(--bg-hover)',
                borderColor: 'var(--border-light)',
              }}
            >
              <div>
                <div className="flex items-center gap-2">
                  <code
                    className="text-sm font-mono px-2 py-0.5 rounded-sm"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {skill.trigger}
                  </code>
                  <span
                    className="font-medium font-handwriting-cn text-base"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {skill.name}
                  </span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-sm font-handwriting-en text-sm"
                    style={{
                      backgroundColor: 'var(--accent-light)',
                      color: 'var(--accent)',
                    }}
                  >
                    built-in
                  </span>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  {skill.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 重置按钮 */}
      <div className="pt-4 border-t border-dashed" style={{ borderColor: 'var(--border-light)' }}>
        <button
          onClick={() => {
            if (confirm('确定要重置所有 Skill 吗？自定义 Skill 将被删除。')) {
              resetSkills();
            }
          }}
          className="text-sm hover:underline"
          style={{ color: 'var(--accent-hover)' }}
        >
          · 重置为默认 ·
        </button>
      </div>

      {/* 编辑器弹窗 */}
      {showEditor && (
        <SkillEditor
          skill={editingSkill || undefined}
          onSave={handleSave}
          onCancel={() => {
            setShowEditor(false);
            setEditingSkill(null);
          }}
        />
      )}
    </div>
  );
}
