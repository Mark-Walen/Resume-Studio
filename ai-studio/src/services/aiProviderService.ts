import { AiProviderId, AiServiceSettings } from '../utils/db';

export interface AiProviderDefinition {
  id: AiProviderId;
  name: string;
  description: string;
  defaultModel: string;
  fallbackModels: string[];
  baseUrl?: string;
}

export const AI_PROVIDERS: AiProviderDefinition[] = [
  { id: 'anthropic', name: 'Claude / Claude Code', description: 'Anthropic API', defaultModel: 'claude-sonnet-5', fallbackModels: ['claude-sonnet-5', 'claude-opus-5', 'claude-opus-4-8', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001'], baseUrl: 'https://api.anthropic.com/v1' },
  { id: 'openai', name: 'ChatGPT / OpenAI', description: 'OpenAI API', defaultModel: 'gpt-5.6-terra', fallbackModels: ['gpt-5.6-sol', 'gpt-5.6-terra', 'gpt-5.6-luna'], baseUrl: 'https://api.openai.com/v1' },
  { id: 'xai', name: 'Grok', description: 'xAI API', defaultModel: 'grok-4.7', fallbackModels: ['grok-4.7'], baseUrl: 'https://api.x.ai/v1' },
  { id: 'google', name: 'Gemini', description: 'Google AI API', defaultModel: 'gemini-3.8-flash', fallbackModels: ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash'], baseUrl: 'https://generativelanguage.googleapis.com/v1beta' },
  { id: 'deepseek', name: 'DeepSeek', description: 'DeepSeek API', defaultModel: 'deepseek-flash', fallbackModels: ['deepseek-flash', 'deepseek-v4-pro'], baseUrl: 'https://api.deepseek.com' },
  { id: 'zai', name: 'Z.ai / GLM', description: 'Z.ai API', defaultModel: 'glm-4.5', fallbackModels: ['glm-4.5', 'glm-4.5-air'], baseUrl: 'https://api.z.ai/api/paas/v4' },
  { id: 'custom', name: '自定义兼容服务', description: 'OpenAI 兼容 API', defaultModel: '', fallbackModels: [] },
];

export function getProviderDefinition(provider: AiProviderId): AiProviderDefinition {
  return AI_PROVIDERS.find(item => item.id === provider) || AI_PROVIDERS[3];
}

export async function fetchProviderModels(settings: AiServiceSettings): Promise<string[]> {
  const provider = getProviderDefinition(settings.provider);
  if (!settings.apiKey.trim()) throw new Error('请先填写该 Provider 的 API Key');
  if (settings.provider === 'custom' && !settings.baseUrl?.trim()) throw new Error('请先填写兼容接口地址');

  const baseUrl = (settings.baseUrl?.trim() || provider.baseUrl || '').replace(/\/$/, '');
  let url = `${baseUrl}/models`;
  const headers: Record<string, string> = { Accept: 'application/json' };

  if (settings.provider === 'google') {
    url = `${baseUrl}/models?key=${encodeURIComponent(settings.apiKey.trim())}&pageSize=1000`;
  } else if (settings.provider === 'anthropic') {
    headers['x-api-key'] = settings.apiKey.trim();
    headers['anthropic-version'] = '2023-06-01';
    headers['anthropic-dangerous-direct-browser-access'] = 'true';
  } else {
    headers.Authorization = `Bearer ${settings.apiKey.trim()}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(detail.slice(0, 160) || `获取模型失败（${response.status}）`);
  }

  const payload = await response.json();
  const rows: any[] = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload?.models) ? payload.models : [];
  const models: string[] = rows
    .filter((item: any) => settings.provider !== 'google' || !item.supportedGenerationMethods || item.supportedGenerationMethods.includes('generateContent'))
    .map((item: any) => String(item.id || item.name || '').replace(/^models\//, ''))
    .filter(Boolean);
  return [...new Set(models)].sort((a, b) => a.localeCompare(b));
}
