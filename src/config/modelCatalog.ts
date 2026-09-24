export type BuiltinProviderId = 'anthropic' | 'openai' | 'xai' | 'google' | 'deepseek' | 'zai';

export const MODEL_CATALOG_UPDATED_AT = '2026-09-24';

export const PROVIDER_MODEL_CATALOG: Record<BuiltinProviderId, readonly string[]> = {
  anthropic: [
    'claude-opus-5-5',
    'claude-fable-5-1',
    'claude-sonnet-5',
    'claude-haiku-4-5-20251001',
  ],
  openai: [
    'gpt-5.6-sol',
    'gpt-5.6-terra',
    'gpt-5.6-luna',
  ],
  xai: [
    'grok-4.7',
    'grok-4.7-latest',
  ],
  google: [
    'gemini-3.8-flash',
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3.1-pro-preview',
    'gemini-3-flash-preview',
  ],
  deepseek: [
    'deepseek-flash',
    'deepseek-v4-pro',
  ],
  zai: [
    'glm-5.3',
    'glm-5.2',
    'glm-5.1',
  ],
};

