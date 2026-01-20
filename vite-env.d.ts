interface ImportMetaEnv {
  readonly VITE_AI_PROVIDER: 'deepseek' | 'glm';
  readonly VITE_AI_API_KEY: string;
  readonly VITE_AI_BASE_URL?: string;
  readonly VITE_AI_MODEL?: string;
  readonly VITE_BACKEND_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
