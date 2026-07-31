/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_PROVIDER: string;
  readonly VITE_API_KEY: string;
  readonly VITE_API_MODEL: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_ENABLE_SKILL_AUTO_DETECT: string;
  readonly VITE_ENABLE_STREAMING: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
