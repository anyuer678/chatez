import { Skill } from '../types/skill';
import { useSkillStore } from '../stores/skillStore';
import { useConfigStore } from '../stores/configStore';

export interface SkillDetectionResult {
  skill: Skill;
  args: string;
  triggerType: 'command' | 'auto';
}

export class SkillEngine {
  /**
   * 检测用户输入是否触发 Skill
   * 优先级：用户主动激活 (activeSkillId) > 命令触发 (/cmd) > 自然语言关键字
   */
  detectSkill(input: string, autoDetect: boolean = true): SkillDetectionResult | null {
    if (!input || !input.trim()) return null;

    const trimmedInput = input.trim();
    const { skills } = useSkillStore.getState();
    const { enabledSkills } = useConfigStore.getState().skill;
    const availableSkills = this.filterAvailableSkills(skills, enabledSkills);

    // 1. 命令触发检测（优先级最高）
    const commandResult = this.detectByCommand(trimmedInput, availableSkills);
    if (commandResult) {
      return commandResult;
    }

    // 2. 自动识别（可选）
    if (autoDetect) {
      const autoResult = this.detectByKeywords(trimmedInput, availableSkills);
      if (autoResult) {
        return autoResult;
      }
    }

    return null;
  }

  /**
   * 过滤可用的 skill：
   * - 内置 skill 始终可用（向后兼容）
   * - 自定义 skill 需要在 enabledSkills 中才可用
   * - 如果 enabledSkills 为空，则所有 skill 都可用（首次使用体验）
   * - 如果 enabledSkills 有内容，只放行：内置 skill + enabledSkills 中列出的自定义 skill
   */
  private filterAvailableSkills(
    skills: Skill[],
    enabledSkills: string[],
  ): Skill[] {
    if (!enabledSkills || enabledSkills.length === 0) {
      // 向后兼容：enabledSkills 为空时所有 skill 可用
      return skills;
    }
    const enabledSet = new Set(enabledSkills);
    return skills.filter((s) => s.isBuiltIn || enabledSet.has(s.id));
  }

  private detectByCommand(input: string, skills: Skill[]): SkillDetectionResult | null {
    // 匹配 /command args 格式
    const match = input.match(/^\/(\w+)(?:\s+([\s\S]*))?$/);
    if (!match) return null;

    const commandName = match[1].toLowerCase();
    const args = (match[2] || '').trim();

    // 查找匹配的 Skill（按 trigger 完全匹配）
    for (const skill of skills) {
      const trigger = skill.trigger.replace(/^\//, '').toLowerCase();
      if (trigger === commandName) {
        return { skill, args: args || input, triggerType: 'command' };
      }
    }

    return null;
  }

  /**
   * 基于 skill.keywords 字段做自然语言自动识别
   * 匹配规则：大小写不敏感、子串包含
   * 优先级：先匹配关键词长度大的（更精确），后匹配长度小的
   */
  private detectByKeywords(input: string, skills: Skill[]): SkillDetectionResult | null {
    const lowerInput = input.toLowerCase();

    // 收集所有 (skill, keyword) 对，按 keyword 长度降序
    const candidates: Array<{ skill: Skill; keyword: string }> = [];
    for (const skill of skills) {
      if (!skill.keywords || skill.keywords.length === 0) continue;
      for (const keyword of skill.keywords) {
        candidates.push({ skill, keyword: keyword.toLowerCase() });
      }
    }
    // 关键词长的优先匹配（更精确，例如 "代码解释" 比 "代码" 更精准）
    candidates.sort((a, b) => b.keyword.length - a.keyword.length);

    for (const { skill, keyword } of candidates) {
      if (lowerInput.includes(keyword)) {
        return { skill, args: input, triggerType: 'auto' };
      }
    }

    return null;
  }

  /**
   * 构建 Skill 增强的系统提示词
   * 拼接顺序：skill.systemPrompt → 角色 prompt → 语气 → 用户输入
   * 让 skill 的"专业规则"在最前，用户的具体诉求在最后（LLM 更易聚焦）
   */
  buildSkillPrompt(skill: Skill, userArgs: string, baseSystemPrompt?: string): string {
    const parts: string[] = [];

    // 1. Skill 系统提示词（最高优先级）
    parts.push(skill.systemPrompt);

    // 2. 基础系统提示词（角色 + 语气等）
    if (baseSystemPrompt) {
      parts.push(`\n---\n补充规则：\n${baseSystemPrompt}`);
    }

    // 3. 用户输入
    if (userArgs) {
      parts.push(`\n---\n用户输入：${userArgs}`);
    }

    return parts.join('\n\n');
  }

  /**
   * 获取可用命令列表（用于 UI 显示 / 命令面板补全）
   * 返回的列表只包含当前可用的 skill（受 enabledSkills 限制）
   */
  getAvailableCommands(): Array<{ command: string; name: string; description: string }> {
    const { skills } = useSkillStore.getState();
    const { enabledSkills } = useConfigStore.getState().skill;
    const availableSkills = this.filterAvailableSkills(skills, enabledSkills);
    return availableSkills.map((skill) => ({
      command: skill.trigger,
      name: skill.name,
      description: skill.description,
    }));
  }

  /**
   * 获取 Skill 信息
   */
  getSkill(id: string): Skill | undefined {
    const { skills } = useSkillStore.getState();
    return skills.find((s) => s.id === id);
  }

  /**
   * 获取所有可用的 skill（受 enabledSkills 限制）
   * 用于 SkillSelector 显示列表
   */
  getAvailableSkills(): Skill[] {
    const { skills } = useSkillStore.getState();
    const { enabledSkills } = useConfigStore.getState().skill;
    return this.filterAvailableSkills(skills, enabledSkills);
  }
}

// 单例实例
export const skillEngine = new SkillEngine();
