import { PROVIDER_MODEL_CATALOG } from '../config/modelCatalog';

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
    label: 'Anthropic',
    category: 'builtin',
    defaultModel: 'claude-sonnet-5',
    supportedModels: [...PROVIDER_MODEL_CATALOG.anthropic],
    placeholderKey: 'sk-ant-api03-...',
    docUrl: 'https://console.anthropic.com/'
  },
  chatgpt: {
    type: 'chatgpt',
    label: 'OpenAI',
    category: 'builtin',
    defaultModel: 'gpt-5.6-terra',
    supportedModels: [...PROVIDER_MODEL_CATALOG.openai],
    placeholderKey: 'sk-proj-...',
    docUrl: 'https://platform.openai.com/api-keys'
  },
  grok: {
    type: 'grok',
    label: 'xAI',
    category: 'builtin',
    defaultModel: 'grok-4.7',
    supportedModels: [...PROVIDER_MODEL_CATALOG.xai],
    placeholderKey: 'xai-...',
    docUrl: 'https://console.x.ai/'
  },
  gemini: {
    type: 'gemini',
    label: 'Google AI',
    category: 'builtin',
    defaultModel: 'gemini-3.8-flash',
    supportedModels: [...PROVIDER_MODEL_CATALOG.google],
    placeholderKey: 'AIzaSy...',
    docUrl: 'https://aistudio.google.com/app/apikey'
  },
  deepseek: {
    type: 'deepseek',
    label: 'DeepSeek',
    category: 'builtin',
    defaultModel: 'deepseek-flash',
    supportedModels: [...PROVIDER_MODEL_CATALOG.deepseek],
    placeholderKey: 'sk-...',
    docUrl: 'https://platform.deepseek.com/'
  },
  zhipu: {
    type: 'zhipu',
    label: 'Z.ai',
    category: 'builtin',
    defaultModel: 'glm-5.3',
    supportedModels: [...PROVIDER_MODEL_CATALOG.zai],
    placeholderKey: 'api-key-...',
    docUrl: 'https://bigmodel.cn/'
  },
  openai_compatible: {
    type: 'openai_compatible',
    label: 'OpenAI-compatible endpoint',
    category: 'compatible',
    defaultModel: 'custom-model',
    supportedModels: ['custom-model'],
    defaultBaseUrl: 'https://api.openai.com/v1',
    placeholderKey: 'sk-...',
    docUrl: ''
  },
  anthropic_compatible: {
    type: 'anthropic_compatible',
    label: 'Anthropic-compatible endpoint',
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
