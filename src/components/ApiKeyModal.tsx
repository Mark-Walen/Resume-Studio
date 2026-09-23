import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  ShieldCheck,
  Check,
  Cpu,
  Layers,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import {
  ModelProviderType,
  AiModelProfile,
  PROVIDER_CONFIGS
} from '../types/aiProvider';
import {
  loadAiModelProfiles,
  saveAiModelProfiles,
  getActiveAiProfile,
  setActiveAiProfile
} from '../utils/db';
import { encryptApiKey, decryptApiKey } from '../utils/crypto';
import { fetchAvailableModels } from '../services/modelCatalogService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [profiles, setProfiles] = useState<AiModelProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');

  // Form fields for active editing profile
  const [profileName, setProfileName] = useState('');
  const [provider, setProvider] = useState<ModelProviderType>('claude');
  const [modelName, setModelName] = useState('');
  const [customBaseUrl, setCustomBaseUrl] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showPlainKey, setShowPlainKey] = useState(false);
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [modelFetchError, setModelFetchError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const loaded = loadAiModelProfiles();
      setProfiles(loaded);
      const active = getActiveAiProfile();
      if (active) {
        selectProfile(active);
      } else if (loaded.length > 0) {
        selectProfile(loaded[0]);
      }
      setIsSavedToast(false);
    }
  }, [isOpen]);

  const selectProfile = (p: AiModelProfile) => {
    setSelectedProfileId(p.id);
    setProfileName(p.name);
    setProvider(p.provider);
    setModelName(p.modelName);
    setModelOptions([...new Set([p.modelName, ...PROVIDER_CONFIGS[p.provider].supportedModels].filter(Boolean))]);
    setModelFetchError('');
    setCustomBaseUrl(p.customBaseUrl || '');
    setApiKeyInput(p.encryptedApiKey ? decryptApiKey(p.encryptedApiKey) : '');
  };

  const handleProviderChange = (newProvider: ModelProviderType) => {
    setProvider(newProvider);
    const cfg = PROVIDER_CONFIGS[newProvider];
    setModelName(cfg.defaultModel);
    setModelOptions([...cfg.supportedModels]);
    setModelFetchError('');
    if (cfg.defaultBaseUrl) {
      setCustomBaseUrl(cfg.defaultBaseUrl);
    }
  };

  const handleCreateNewProfile = () => {
    const newId = `profile-${Date.now()}`;
    const newProfile: AiModelProfile = {
      id: newId,
      name: `方案 ${profiles.length + 1}`,
      provider: 'claude',
      modelName: PROVIDER_CONFIGS.claude.defaultModel,
      encryptedApiKey: '',
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [...profiles, newProfile];
    setProfiles(updated);
    selectProfile(newProfile);
  };

  const handleDeleteProfile = (id: string) => {
    if (profiles.length <= 1) {
      alert('至少需要保留一组模型方案。');
      return;
    }
    const updated = profiles.filter(p => p.id !== id);
    if (!updated.some(p => p.isActive)) {
      updated[0].isActive = true;
    }
    setProfiles(updated);
    saveAiModelProfiles(updated);
    if (selectedProfileId === id) {
      selectProfile(updated[0]);
    }
  };

  const handleSaveAndApply = (makeActive: boolean = true) => {
    const encKey = apiKeyInput.trim() ? encryptApiKey(apiKeyInput.trim()) : '';
    const now = new Date().toISOString();

    const updated = profiles.map(p => {
      if (p.id === selectedProfileId) {
        return {
          ...p,
          name: profileName.trim() || `${PROVIDER_CONFIGS[provider].label} 配置`,
          provider,
          modelName: modelName.trim() || PROVIDER_CONFIGS[provider].defaultModel,
          customBaseUrl: customBaseUrl.trim() || undefined,
          encryptedApiKey: encKey,
          isActive: makeActive ? true : p.isActive,
          updatedAt: now
        };
      }
      return makeActive ? { ...p, isActive: false } : p;
    });

    setProfiles(updated);
    saveAiModelProfiles(updated);
    if (makeActive) {
      setActiveAiProfile(selectedProfileId);
    }

    setIsSavedToast(true);
    setTimeout(() => {
      setIsSavedToast(false);
      if (onSave) onSave();
      onClose();
    }, 600);
  };

  const handleFetchModels = async () => {
    setIsFetchingModels(true);
    setModelFetchError('');
    try {
      const fetched = await fetchAvailableModels({ provider, apiKey: apiKeyInput, baseUrl: customBaseUrl });
      const merged = [...new Set([...fetched, modelName, ...currentProviderConfig.supportedModels].filter(Boolean))];
      setModelOptions(merged);
      if (!modelName && merged[0]) setModelName(merged[0]);
      if (!fetched.length) setModelFetchError('服务商未返回可用模型，你仍可手动输入模型名称。');
    } catch (error) {
      setModelFetchError(error instanceof Error ? error.message : '获取模型失败。');
    } finally {
      setIsFetchingModels(false);
    }
  };

  if (!isOpen) return null;

  const currentProviderConfig = PROVIDER_CONFIGS[provider];
  const isCompatibleProvider = provider === 'openai_compatible' || provider === 'anthropic_compatible';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150 font-sans">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0071e3] text-white flex items-center justify-center shadow-xs">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">AI 服务与模型配置中心</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">支持多模型方案灵活配置与一键快速切换</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Multi-Profile Selector Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#0071e3]" />
                模型配置方案列表
              </span>
              <button
                type="button"
                onClick={handleCreateNewProfile}
                className="text-xs text-[#0071e3] hover:text-[#0077ed] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                新建方案
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {profiles.map(p => (
                <div
                  key={p.id}
                  onClick={() => selectProfile(p)}
                  className={`px-3 py-1.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center gap-2 ${
                    p.id === selectedProfileId
                      ? 'bg-[#0071e3] text-white border-[#0071e3] shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className="font-semibold">{p.name}</span>
                  {p.isActive && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        p.id === selectedProfileId
                          ? 'bg-white/20 text-white'
                          : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      生效中
                    </span>
                  )}
                  {profiles.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProfile(p.id);
                      }}
                      className="opacity-70 hover:opacity-100 hover:text-red-300 p-0.5 ml-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Inputs */}
          <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200/90 dark:border-slate-800 space-y-3.5">
            {/* Profile Name */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">方案备注名称</label>
              <input
                type="text"
                value={profileName}
                onChange={e => setProfileName(e.target.value)}
                placeholder="例如：主力高精度推理方案"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#0071e3] bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {/* Model Provider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">模型服务提供商 (Provider) *</label>
                {currentProviderConfig?.docUrl && (
                  <a
                    href={currentProviderConfig.docUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#0071e3] hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>获取密钥</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
              <select
                value={provider}
                onChange={e => handleProviderChange(e.target.value as ModelProviderType)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#0071e3] bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              >
                <optgroup label="主流原生内置提供商">
                  <option value="claude">Claude (Anthropic Claude 3.7 Sonnet / Opus)</option>
                  <option value="chatgpt">ChatGPT (OpenAI GPT-4o / o3-mini)</option>
                  <option value="deepseek">DeepSeek (深度求索 V3 / R1)</option>
                  <option value="grok">Grok (xAI Grok-3)</option>
                  <option value="gemini">Google Gemini (Gemini 2.5 Flash / Pro)</option>
                  <option value="zhipu">Z.ai (智谱清言 GLM-4)</option>
                </optgroup>
                <optgroup label="通用开放协议提供商">
                  <option value="openai_compatible">OpenAI 兼容协议 (Ollama / vLLM / Moonshot / 硅基流动等)</option>
                  <option value="anthropic_compatible">Anthropic 兼容协议</option>
                </optgroup>
              </select>
            </div>

            {/* Model Name */}
            <div>
              <div className="mb-1 flex items-center justify-between gap-3">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  模型标识名称 (Model Name) *
                </label>
                <button
                  type="button"
                  onClick={() => void handleFetchModels()}
                  disabled={isFetchingModels || !apiKeyInput.trim()}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0071e3] hover:underline disabled:cursor-not-allowed disabled:text-slate-400"
                  title="使用当前 API Key 从服务商获取模型列表"
                >
                  <RefreshCw className={`h-3 w-3 ${isFetchingModels ? 'animate-spin' : ''}`} />
                  {isFetchingModels ? '正在获取' : '联网获取'}
                </button>
              </div>
                <input
                  type="text"
                  value={modelName}
                  onChange={e => setModelName(e.target.value)}
                  list="available-ai-models"
                  placeholder="可选列表中的模型，或直接输入自定义模型名"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#0071e3] bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              <datalist id="available-ai-models">
                {modelOptions.map(model => <option key={model} value={model} />)}
              </datalist>
              <p className="mt-1 text-[11px] text-slate-400">可自由输入，也可填写 Key 后从服务商实时获取。</p>
              {modelFetchError && <p className="mt-1.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">{modelFetchError}</p>}
            </div>

            {/* If compatible provider, show Base URL */}
            {isCompatibleProvider && (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">API Base URL (服务接口地址) *</label>
                <input
                  type="text"
                  value={customBaseUrl}
                  onChange={e => setCustomBaseUrl(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#0071e3] bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>
            )}

            {/* API Key */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  API Key (密钥凭证) *
                </label>
                <button
                  type="button"
                  onClick={() => setShowPlainKey(!showPlainKey)}
                  className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  {showPlainKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPlainKey ? '掩码隐藏' : '查看明文'}</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPlainKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={e => setApiKeyInput(e.target.value)}
                  placeholder={currentProviderConfig?.placeholderKey || '请输入对应模型的 API Key'}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#0071e3] bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
                <Key className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              <p className="text-[11px] text-slate-400 mt-1">
                密钥保存在本地安全隔离存储，前端及网页源码绝不暴露明文。
              </p>
            </div>
          </div>

          {/* Privacy and Encryption Statement */}
          <div className="bg-slate-50 dark:bg-slate-800/30 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>本地隔离与反探针安全保护</span>
            </div>
            <ul className="space-y-0.5 pl-4 list-disc text-slate-500 dark:text-slate-400">
              <li>API Key 仅存放于浏览器本地沙箱安全层，绝不向第三方服务器泄露</li>
              <li>支持保存多组模型方案，随时无缝切换主力与备用模型</li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {isSavedToast && (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 animate-in fade-in">
                <Check className="w-4 h-4" />
                已保存并设为当前生效方案
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              onClick={() => handleSaveAndApply(true)}
              className="px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              保存并设为当前生效
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
