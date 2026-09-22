import React, { useEffect, useMemo, useState } from 'react';
import { AiServiceSettings, getAiServiceSettings, saveAiServiceSettings } from '../utils/db';
import { checkApiHealth } from '../services/geminiService';
import { AI_PROVIDERS, fetchProviderModels, getProviderDefinition } from '../services/aiProviderService';
import { Check, Eye, EyeOff, KeyRound, LoaderCircle, RefreshCw, ShieldCheck, X } from 'lucide-react';

interface ApiKeyModalProps { isOpen: boolean; onClose: () => void; }

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<AiServiceSettings>(getAiServiceSettings());
  const [models, setModels] = useState<string[]>([]);
  const [hasEnvKey, setHasEnvKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelMessage, setModelMessage] = useState('');
  const provider = useMemo(() => getProviderDefinition(settings.provider), [settings.provider]);

  useEffect(() => {
    if (!isOpen) return;
    const stored = getAiServiceSettings();
    const selectedProvider = getProviderDefinition(stored.provider);
    setSettings(stored);
    setModels([...new Set([stored.model, ...selectedProvider.fallbackModels].filter(Boolean))]);
    setModelMessage('');
    checkApiHealth().then(res => setHasEnvKey(res.hasEnvKey));
    if (stored.apiKey) {
      setIsLoadingModels(true);
      fetchProviderModels(stored)
        .then(fetched => { setModels([...new Set([stored.model, ...fetched].filter(Boolean))]); setModelMessage(`已自动获取 ${fetched.length} 个可用模型`); })
        .catch(() => setModelMessage('实时模型列表暂不可用，已显示推荐模型，也可手动输入。'))
        .finally(() => setIsLoadingModels(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const updateSettings = (patch: Partial<AiServiceSettings>) => setSettings(current => ({ ...current, ...patch }));
  const handleProviderChange = (providerId: AiServiceSettings['provider']) => {
    const nextProvider = getProviderDefinition(providerId);
    const nextSettings = { ...settings, provider: providerId, model: nextProvider.defaultModel, apiKey: '', baseUrl: providerId === 'custom' ? settings.baseUrl : undefined };
    setSettings(nextSettings);
    setModels(nextProvider.fallbackModels);
    setModelMessage('');
  };

  const handleLoadModels = async () => {
    setIsLoadingModels(true);
    setModelMessage('');
    try {
      const fetched = await fetchProviderModels(settings);
      setModels([...new Set([settings.model, ...fetched].filter(Boolean))]);
      if (!settings.model && fetched[0]) updateSettings({ model: fetched[0] });
      setModelMessage(`已获取 ${fetched.length} 个可用模型`);
    } catch (error) {
      setModels([...new Set([settings.model, ...provider.fallbackModels].filter(Boolean))]);
      setModelMessage(`${error instanceof Error ? error.message : '无法获取模型列表'}；已显示推荐模型，也可手动输入。`);
    } finally { setIsLoadingModels(false); }
  };

  const handleSave = () => {
    saveAiServiceSettings(settings);
    setIsSaved(true);
    window.setTimeout(() => { setIsSaved(false); onClose(); }, 700);
  };
  const handleClear = () => {
    const cleared = { ...settings, apiKey: '' };
    saveAiServiceSettings(cleared);
    setSettings(cleared);
    setModelMessage('已清除当前浏览器保存的密钥');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4 sm:p-5">
          <div className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-blue-600" /><div><h2 className="text-base font-bold text-slate-900">AI 服务与隐私设置</h2><p className="mt-0.5 text-[11px] text-slate-500">选择 Model Provider、模型及凭据</p></div></div>
          <button onClick={onClose} aria-label="关闭" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X className="h-5 w-5" /></button>
        </div>

        <div className="space-y-5 overflow-y-auto p-5 text-xs">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3"><div><span className="font-bold text-slate-800">平台内置 AI 服务：</span><span className={hasEnvKey ? 'font-bold text-emerald-600' : 'font-medium text-slate-500'}>{hasEnvKey ? '已安全配置' : '未配置'}</span></div>{hasEnvKey && <ShieldCheck className="h-4 w-4 text-emerald-600" />}</div>

          <section className="space-y-4">
            <div><label className="mb-1.5 block font-semibold text-slate-700">Model Provider</label><select className={inputClass} value={settings.provider} onChange={event => handleProviderChange(event.target.value as AiServiceSettings['provider'])}>{AI_PROVIDERS.map(item => <option key={item.id} value={item.id}>{item.name} · {item.description}</option>)}</select></div>
            {settings.provider === 'custom' && <div><label className="mb-1.5 block font-semibold text-slate-700">Base URL</label><input className={inputClass} value={settings.baseUrl || ''} onChange={event => updateSettings({ baseUrl: event.target.value })} placeholder="https://example.com/v1" /></div>}
            <div><label className="mb-1.5 block font-semibold text-slate-700">API Key</label><div className="relative"><input type={showKey ? 'text' : 'password'} className={`${inputClass} pr-10 font-mono`} value={settings.apiKey} onChange={event => updateSettings({ apiKey: event.target.value })} onBlur={() => settings.apiKey.trim() && handleLoadModels()} placeholder={`输入 ${provider.name} API Key`} /><button type="button" onClick={() => setShowKey(value => !value)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700" aria-label={showKey ? '隐藏密钥' : '显示密钥'}>{showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div><p className="mt-1 text-[11px] text-slate-400">密钥仅保存在当前浏览器；输入后会向所选 Provider 获取可用模型。</p></div>
            <div><div className="mb-1.5 flex items-center justify-between"><label className="font-semibold text-slate-700">Model Name</label><button type="button" onClick={handleLoadModels} disabled={isLoadingModels} className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60">{isLoadingModels ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}获取模型列表</button></div><input className={inputClass} list="ai-model-options" value={settings.model} onChange={event => updateSettings({ model: event.target.value })} placeholder="选择或输入模型名称" /><datalist id="ai-model-options">{models.map(model => <option key={model} value={model} />)}</datalist>{modelMessage && <p className={`mt-1.5 text-[11px] ${modelMessage.startsWith('已') ? 'text-emerald-600' : 'text-amber-700'}`}>{modelMessage}</p>}</div>
          </section>

          <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 text-[11px] text-blue-900"><div className="flex items-center gap-1.5 font-bold text-blue-950"><ShieldCheck className="h-4 w-4 text-blue-600" />隐私与文件安全</div><ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-blue-800"><li>上传资料仅接受允许的文件类型，并检查文件头与危险内容</li><li>API Key 保存在本机浏览器，不写入简历或附件</li><li>音视频保存在本地 IndexedDB；AI 摘要仅在用户主动生成时调用所选服务</li></ul></div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 p-4"><button onClick={handleClear} className="text-xs font-medium text-red-500 hover:text-red-700">清空已存密钥</button><div className="flex gap-2"><button onClick={onClose} className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900">取消</button><button onClick={handleSave} disabled={!settings.model.trim()} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{isSaved && <Check className="h-3.5 w-3.5" />}{isSaved ? '已保存' : '保存设置'}</button></div></div>
      </div>
    </div>
  );
};
