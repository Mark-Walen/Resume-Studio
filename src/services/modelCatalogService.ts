import { ModelProviderType } from '../types/aiProvider';
import { auth } from './firebase';

const PROVIDER_IDS: Record<ModelProviderType, string> = {
  claude: 'anthropic',
  chatgpt: 'openai',
  grok: 'xai',
  gemini: 'google',
  deepseek: 'deepseek',
  zhipu: 'zai',
  openai_compatible: 'custom',
  anthropic_compatible: 'custom',
};

export async function fetchAvailableModels(options: {
  provider: ModelProviderType;
  apiKey: string;
  baseUrl?: string;
}): Promise<string[]> {
  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) throw new Error('请先登录。');
  const response = await fetch('/api/models', {
    headers: {
      Authorization: `Bearer ${idToken}`,
      ...(options.apiKey.trim() ? { 'x-ai-api-key': options.apiKey.trim() } : {}),
      'x-ai-provider': PROVIDER_IDS[options.provider],
      'x-ai-compatibility': options.provider === 'anthropic_compatible' ? 'anthropic' : 'openai',
      ...(options.baseUrl?.trim() ? { 'x-ai-base-url': options.baseUrl.trim() } : {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.success) throw new Error(payload.error || '获取模型失败。');
  return Array.isArray(payload.models) ? payload.models : [];
}
