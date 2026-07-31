export interface Skill {
  id: string;
  name: string;
  trigger: string;
  description: string;
  systemPrompt: string;
  inputTransform?: string;
  /**
   * 自然语言自动识别关键字
   * 当用户输入包含任一关键字时，会自动触发该 skill（无需输入 /command）
   * 匹配规则：大小写不敏感、子串包含
   */
  keywords?: string[];
  isBuiltIn: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SkillTriggerType = 'command' | 'auto' | 'button';

export interface SkillStore {
  skills: Skill[];
  activeSkillId: string | null;
  setActiveSkill: (id: string | null) => void;
  addSkill: (skill: Skill) => void;
  removeSkill: (id: string) => void;
  updateSkill: (id: string, updates: Partial<Skill>) => void;
  getSkill: (id: string) => Skill | undefined;
  getAllSkills: () => Skill[];
  getCustomSkills: () => Skill[];
  getBuiltInSkills: () => Skill[];
  exportSkills: () => string;
  importSkills: (json: string) => boolean;
  resetSkills: () => void;
}
