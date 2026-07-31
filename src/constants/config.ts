export const APP_CONFIG = {
  name: 'Chatez',
  version: '1.0.0',
  description: '可配置 Prompt + Skill 的 AI 工作台',
  
  api: {
    defaultProvider: 'openai',
    defaultModel: 'gpt-4o-mini',
    maxTokens: 4096,
    streamTimeout: 30000,
  },
  
  storage: {
    prefix: 'chatez_',
    maxSessions: 100,
    maxMessagesPerSession: 1000,
  },
  
  ui: {
    sidebarWidth: 280,
    maxMessageWidth: 800,
    typingSpeed: 30,
  },
} as const;
