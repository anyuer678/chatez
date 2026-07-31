import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Skill, SkillStore } from '../types/skill';
import { DEFAULT_SKILLS } from '../constants/default-skills';

export const useSkillStore = create<SkillStore>()(
  persist(
    (set, get) => ({
      skills: DEFAULT_SKILLS,
      activeSkillId: null,

      setActiveSkill: (id: string | null) => {
        // 兼容空字符串/null/undefined：视为"清除激活"
        const normalized = id && (typeof id === 'string' ? id.trim() : id) ? id : null;
        // 校验 id 必须存在（防御"幽灵角色"：被删除的 skill 残留在 activeSkillId）
        if (normalized !== null) {
          const exists = get().skills.some((s) => s.id === normalized);
          if (!exists) {
            console.warn(`[skillStore] setActiveSkill: id "${normalized}" 不存在，已忽略`);
            return;
          }
        }
        set({ activeSkillId: normalized });
      },

      addSkill: (skill: Skill) => {
        set((state) => ({
          skills: [...state.skills, skill],
        }));
      },

      removeSkill: (id: string) => {
        set((state) => ({
          skills: state.skills.filter((s) => s.id !== id),
          activeSkillId: state.activeSkillId === id ? null : state.activeSkillId,
        }));
      },

      updateSkill: (id: string, updates: Partial<Skill>) => {
        set((state) => ({
          skills: state.skills.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
          ),
        }));
      },

      getSkill: (id: string) => {
        return get().skills.find((s) => s.id === id);
      },

      getAllSkills: () => {
        return get().skills;
      },

      getCustomSkills: () => {
        return get().skills.filter((s) => !s.isBuiltIn);
      },

      getBuiltInSkills: () => {
        return get().skills.filter((s) => s.isBuiltIn);
      },

      // 导出所有 Skill
      exportSkills: () => {
        const customSkills = get().getCustomSkills();
        return JSON.stringify(customSkills, null, 2);
      },

      // 导入 Skill
      importSkills: (json: string) => {
        try {
          const imported = JSON.parse(json) as Skill[];
          if (!Array.isArray(imported)) return false;

          // 验证数据结构
          const isValid = imported.every(
            (s) => s.id && s.name && s.trigger && s.systemPrompt
          );
          if (!isValid) return false;

          set((state) => {
            const existingIds = new Set(state.skills.map((s) => s.id));
            const newSkills = imported
              .filter((s) => !existingIds.has(s.id))
              .map((s) => ({
                ...s,
                isBuiltIn: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }));
            return { skills: [...state.skills, ...newSkills] };
          });
          return true;
        } catch {
          return false;
        }
      },

      // 重置为默认
      resetSkills: () => {
        set({ skills: DEFAULT_SKILLS, activeSkillId: null });
      },
    }),
    {
      name: 'chatez-skills',
      version: 3, // 升级：触发迁移确保 activeSkillId 归一化为 null 而非 undefined
      // 显式声明持久化字段，确保 activeSkillId 不会被部分恢复
      partialize: (state) => ({
        skills: state.skills,
        activeSkillId: state.activeSkillId,
      }),
      migrate: (persistedState, version) => {
        const s = (persistedState ?? {}) as { skills?: typeof DEFAULT_SKILLS; activeSkillId?: string | null };
        // v1 -> v2: 合并新默认技能（保留用户自定义 + activeSkillId）
        if (version < 2) {
          const existingIds = new Set((s.skills ?? []).map((sk) => sk.id));
          const newSkills = DEFAULT_SKILLS.filter((sk) => !existingIds.has(sk.id));
          s.skills = [...(s.skills ?? []), ...newSkills];
        }
        // v2 -> v3: 归一化 activeSkillId（undefined → null，清理空字符串）
        if (version < 3) {
          if (s.activeSkillId === undefined || s.activeSkillId === '') {
            s.activeSkillId = null;
          } else {
            // 校验 id 必须存在于 skills 中
            const exists = (s.skills ?? []).some((sk) => sk.id === s.activeSkillId);
            if (!exists) s.activeSkillId = null;
          }
        }
        return s as { skills: typeof DEFAULT_SKILLS; activeSkillId: string | null };
      },
      // 显式声明 storage：在 Android WebView 内优先用 localStorage
      storage: {
        getItem: (name) => {
          const value = localStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);
