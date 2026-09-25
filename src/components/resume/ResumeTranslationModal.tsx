import React, { useState } from 'react';
import { Languages, Loader2, Sparkles, X } from 'lucide-react';
import { ResumeData, ResumeTemplateId } from '../../types/resume';
import { requestTranslateResume } from '../../services/geminiService';
import { showAppMessage } from '../common/AppFeedback';

interface ResumeTranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: ResumeData;
  onTranslated: (resume: ResumeData, suggestedTemplate: ResumeTemplateId) => void;
  onOpenApiKeySettings: () => void;
}

const languages = [
  ['English', '英语'], ['Simplified Chinese', '简体中文'], ['Traditional Chinese', '繁体中文'],
  ['Japanese', '日语'], ['Korean', '韩语'], ['German', '德语'], ['French', '法语'], ['Spanish', '西班牙语'],
];

const suggestedTemplate = (language: string): ResumeTemplateId => {
  if (/Chinese|Japanese|Korean/.test(language)) return 'modern';
  if (/German|French/.test(language)) return 'classic';
  return 'compact';
};

export const ResumeTranslationModal: React.FC<ResumeTranslationModalProps> = ({ isOpen, onClose, resume, onTranslated, onOpenApiKeySettings }) => {
  const [language, setLanguage] = useState('English');
  const [region, setRegion] = useState('United States');
  const [mode, setMode] = useState<'direct' | 'localized'>('localized');
  const [busy, setBusy] = useState(false);
  if (!isOpen) return null;
  const translate = async () => {
    setBusy(true);
    try {
      const translated = await requestTranslateResume({ resume, targetLanguage: language, targetRegion: region, mode });
      onTranslated({ ...translated, title: `${resume.title} · ${languages.find(item => item[0] === language)?.[1] || language}` }, suggestedTemplate(language));
      showAppMessage('翻译完成，已另存为新简历并匹配模板。', 'success');
    } catch (error) {
      showAppMessage(error instanceof Error ? error.message : '简历翻译失败。', 'error');
    } finally { setBusy(false); }
  };
  return <div className="fixed inset-0 z-[145] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true"><div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800"><div className="flex items-center gap-2"><Languages className="h-5 w-5 text-blue-600"/><h2 className="font-black">简历翻译与本地化</h2></div><button onClick={onClose} aria-label="关闭" className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4"/></button></div><div className="space-y-5 p-5"><div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold">目标语言<select value={language} onChange={event => setLanguage(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal dark:border-slate-700 dark:bg-slate-950">{languages.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="text-xs font-bold">目标地区<input value={region} onChange={event => setRegion(event.target.value)} placeholder="例如 United States / Japan" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal dark:border-slate-700 dark:bg-slate-950"/></label></div><div className="grid gap-3 sm:grid-cols-2"><button onClick={() => setMode('direct')} className={`rounded-2xl border p-4 text-left ${mode === 'direct' ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' : 'border-slate-200 dark:border-slate-700'}`}><b className="text-sm">忠实直译</b><p className="mt-1 text-xs leading-5 text-slate-400">保留原句结构，仅翻译语言，不调整表达风格。</p></button><button onClick={() => setMode('localized')} className={`rounded-2xl border p-4 text-left ${mode === 'localized' ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' : 'border-slate-200 dark:border-slate-700'}`}><b className="flex items-center gap-1.5 text-sm"><Sparkles className="h-4 w-4 text-blue-600"/>当地风格润色</b><p className="mt-1 text-xs leading-5 text-slate-400">保持事实不变，按当地招聘习惯调整措辞、日期与成果表达。</p></button></div><p className="rounded-xl bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500 dark:bg-slate-950">翻译结果会另存为新简历。东亚语言默认匹配现代轻简，欧美语言默认匹配 ATS 更友好的经典/密集模板。</p><div className="flex items-center justify-between"><button onClick={onOpenApiKeySettings} className="text-xs font-bold text-blue-600 hover:underline">配置翻译模型</button><button disabled={busy} onClick={() => void translate()} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">{busy && <Loader2 className="h-4 w-4 animate-spin"/>}生成翻译副本</button></div></div></div></div>;
};
