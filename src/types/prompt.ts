export interface Prompt {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  memoryMode: 'session' | 'persistent';
  tags: string[];
  isBuiltIn: boolean;
  /**
   * 是否为"常用"角色（显示在侧边栏下拉）
   * 默认为 undefined（视为 false）
   */
  pinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromptStore {
  prompts: Prompt[];
  activePromptId: string | null;
  /**
   * 设置当前激活的角色
   * - 传 null 或空字符串 = 清除激活（回到默认）
   * - 传有效 id = 切换到该角色
   */
  setActivePrompt: (id: string | null) => void;
  addPrompt: (prompt: Prompt) => void;
  updatePrompt: (id: string, updates: Partial<Prompt>) => void;
  removePrompt: (id: string) => void;
  getActivePrompt: () => Prompt | undefined;
  exportPrompts: () => string;
  importPrompts: (json: string) => boolean;
  resetPrompts: () => void;
  /**
   * 「常用」操作
   */
  pinPrompt: (id: string) => void;
  unpinPrompt: (id: string) => void;
  togglePin: (id: string) => void;
}
