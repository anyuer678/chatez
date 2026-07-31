import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Prompt, PromptStore } from '../types/prompt';
import { DEFAULT_PROMPTS, DEFAULT_PINNED_IDS, PINNED_DEFAULT_PROMPTS } from '../constants/default-prompts';

export const usePromptStore = create<PromptStore>()(
  persist(
    (set, get) => ({
      prompts: PINNED_DEFAULT_PROMPTS,
      activePromptId: null,

      setActivePrompt: (id: string | null) => {
        // 兼容空字符串：将空字符串视为"清除激活"
        const normalized = id && id.trim() ? id : null;
        // 校验 id 必须存在
        if (normalized !== null) {
          const exists = get().prompts.some((p) => p.id === normalized);
          if (!exists) {
            console.warn(`[promptStore] setActivePrompt: id "${normalized}" 不存在，已忽略`);
            return;
          }
        }
        set({ activePromptId: normalized });
      },

      addPrompt: (prompt: Prompt) => {
        set((state) => ({
          prompts: [...state.prompts, prompt],
        }));
      },

      updatePrompt: (id: string, updates: Partial<Prompt>) => {
        set((state) => ({
          prompts: state.prompts.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },

      removePrompt: (id: string) => {
        set((state) => ({
          prompts: state.prompts.filter((p) => p.id !== id),
          activePromptId: state.activePromptId === id ? null : state.activePromptId,
        }));
      },

      getActivePrompt: () => {
        const { prompts, activePromptId } = get();
        return prompts.find((p) => p.id === activePromptId);
      },

      // 导出所有 Prompt
      exportPrompts: () => {
        const { prompts } = get();
        const customPrompts = prompts.filter((p) => !p.isBuiltIn);
        return JSON.stringify(customPrompts, null, 2);
      },

      // 导入 Prompt
      importPrompts: (json: string) => {
        try {
          const imported = JSON.parse(json);
          if (!Array.isArray(imported)) return false;

          const isValid = imported.every(
            (p) =>
              p && typeof p === 'object' &&
              typeof p.id === 'string' && p.id.length > 0 &&
              typeof p.name === 'string' && p.name.length > 0 &&
              typeof p.systemPrompt === 'string'
          );
          if (!isValid) return false;

          set((state) => {
            const existingIds = new Set(state.prompts.map((p) => p.id));
            const newPrompts = imported
              .filter((p: Prompt) => !existingIds.has(p.id))
              .map((p: Prompt) => ({
                ...p,
                systemPrompt: p.systemPrompt.slice(0, 10000),
              }));
            return { prompts: [...state.prompts, ...newPrompts] };
          });
          return true;
        } catch {
          return false;
        }
      },

      // 重置为默认
      resetPrompts: () => {
        set({ prompts: PINNED_DEFAULT_PROMPTS, activePromptId: null });
      },

      // 收藏到「常用」
      pinPrompt: (id: string) => {
        get().updatePrompt(id, { pinned: true });
      },

      // 取消「常用」
      unpinPrompt: (id: string) => {
        get().updatePrompt(id, { pinned: false });
      },

      // 切换「常用」状态
      togglePin: (id: string) => {
        const prompt = get().prompts.find((p) => p.id === id);
        if (prompt) {
          get().updatePrompt(id, { pinned: !prompt.pinned });
        }
      },
    }),
    {
      name: 'chatez-prompt',
      version: 8, // 升级：触发迁移确保 activePromptId 归一化为 null
      // 显式声明持久化字段（防止 activePromptId 在 set 时丢失）
      partialize: (state) => ({
        prompts: state.prompts,
        activePromptId: state.activePromptId,
      }),
      migrate: (persistedState, version) => {
        const s = (persistedState ?? {}) as { prompts?: Prompt[]; activePromptId?: string | null };

        // v1/v2 -> v3: 合并新默认角色（保留用户已有，包括自定义）
        if (version < 3) {
          const existingIds = new Set((s.prompts ?? []).map((p) => p.id));
          const newPrompts = DEFAULT_PROMPTS.filter((p) => !existingIds.has(p.id));
          s.prompts = [...(s.prompts ?? []), ...newPrompts];
        }

        // v3 -> v4: 为所有角色添加「常用」状态（pinned）
        if (version < 4) {
          s.prompts = (s.prompts ?? []).map((p) => ({
            ...p,
            pinned: p.pinned ?? DEFAULT_PINNED_IDS.includes(p.id),
          }));
        }

        // v4 -> v5: 用最新的内置提示词覆盖（保证所有内置角色的 systemPrompt >= 200 字）
        // 保留用户 custom 角色（!isBuiltIn）的所有内容不动
        if (version < 5) {
          const latestBuiltIn = new Map(DEFAULT_PROMPTS.map((p) => [p.id, p]));
          s.prompts = (s.prompts ?? []).map((p) => {
            if (!p.isBuiltIn) return p; // 自定义角色不覆盖
            const latest = latestBuiltIn.get(p.id);
            if (!latest) return p;
            return {
              ...p,
              systemPrompt: latest.systemPrompt,
              description: latest.description,
              temperature: latest.temperature,
              memoryMode: latest.memoryMode,
              tags: latest.tags,
              name: latest.name,
              updatedAt: latest.updatedAt,
            };
          });
        }

        // v5/v6/v7 -> v8: 归一化 activePromptId
        // 1) undefined / ''  → null
        // 2) 指向已删除的 prompt  → null
        // 3) 不再依赖单一版本分支（之前 v5->v6 已做但 v6->v7 没有）
        if (version < 8) {
          const validIds = new Set((s.prompts ?? []).map((p) => p.id));
          if (!s.activePromptId || !validIds.has(s.activePromptId) || s.activePromptId === '') {
            s.activePromptId = null;
          }
        }

        return s as { prompts: Prompt[]; activePromptId: string | null };
      },
      // 显式声明 storage：避免 Android WebView 下默认 storage 出错
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
