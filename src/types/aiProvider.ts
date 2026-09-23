export type ModelProviderType =
  | 'claude'
  | 'chatgpt'
  | 'grok'
  | 'gemini'
  | 'deepseek'
  | 'zhipu'
  | 'openai_compatible'
  | 'anthropic_compatible';

export interface ProviderOption {
  type: ModelProviderType;
  label: string;
  category: 'builtin' | 'compatible';
  defaultModel: string;
  supportedModels: string[];
  defaultBaseUrl?: string;
  placeholderKey: string;
  docUrl: string;
}

export const PROVIDER_CONFIGS: Record<ModelProviderType, ProviderOption> = {
  claude: {
    type: 'claude',
    label: 'Claude (Anthropic)',
    category: 'builtin',
    defaultModel: 'claude-3-7-sonnet-20250219',
    supportedModels: [
      'claude-3-7-sonnet-20250219',
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229'
    ],
    placeholderKey: 'sk-ant-api03-...',
    docUrl: 'https://console.anthropic.com/'
  },
  chatgpt: {
    type: 'chatgpt',
    label: 'ChatGPT (OpenAI)',
    category: 'builtin',
    defaultModel: 'gpt-4o',
    supportedModels: [
      'gpt-4o',
      'gpt-4o-mini',
      'o3-mini',
      'gpt-4.5-preview',
      'o1',
      'o1-mini'
    ],
    placeholderKey: 'sk-proj-...',
    docUrl: 'https://platform.openai.com/api-keys'
  },
  grok: {
    type: 'grok',
    label: 'Grok (xAI)',
    category: 'builtin',
    defaultModel: 'grok-3',
    supportedModels: [
      'grok-3',
      'grok-3-mini',
      'grok-2-1212',
      'grok-beta'
    ],
    placeholderKey: 'xai-...',
    docUrl: 'https://console.x.ai/'
  },
  gemini: {
    type: 'gemini',
    label: 'Google Gemini',
    category: 'builtin',
    defaultModel: 'gemini-2.5-flash',
    supportedModels: [
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-2.0-flash',
      'gemini-1.5-pro',
      'gemini-1.5-flash'
    ],
    placeholderKey: 'AIzaSy...',
    docUrl: 'https://aistudio.google.com/app/apikey'
  },
  deepseek: {
    type: 'deepseek',
    label: 'DeepSeek (深度求索)',
    category: 'builtin',
    defaultModel: 'deepseek-chat',
    supportedModels: [
      'deepseek-chat',
      'deepseek-reasoner'
    ],
    placeholderKey: 'sk-...',
    docUrl: 'https://platform.deepseek.com/'
  },
  zhipu: {
    type: 'zhipu',
    label: 'Z.ai (智谱清言 GLM)',
    category: 'builtin',
    defaultModel: 'glm-4-plus',
    supportedModels: [
      'glm-4-plus',
      'glm-4-flash',
      'glm-4-air',
      'glm-4-long'
    ],
    placeholderKey: 'api-key-...',
    docUrl: 'https://bigmodel.cn/'
  },
  openai_compatible: {
    type: 'openai_compatible',
    label: '自定义 OpenAI 兼容协议服务 (Ollama / vLLM / Moonshot 等)',
    category: 'compatible',
    defaultModel: 'custom-model',
    supportedModels: ['custom-model'],
    defaultBaseUrl: 'https://api.openai.com/v1',
    placeholderKey: 'sk-...',
    docUrl: ''
  },
  anthropic_compatible: {
    type: 'anthropic_compatible',
    label: '自定义 Anthropic 兼容协议服务',
    category: 'compatible',
    defaultModel: 'claude-compatible',
    supportedModels: ['claude-compatible'],
    defaultBaseUrl: 'https://api.anthropic.com/v1',
    placeholderKey: 'sk-ant-...',
    docUrl: ''
  }
};

export interface AiModelProfile {
  id: string;
  name: string;
  provider: ModelProviderType;
  modelName: string;
  customBaseUrl?: string;
  encryptedApiKey: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
