import React, { useState } from 'react';
import { FileCheck2, ShieldCheck, X } from 'lucide-react';
import { LEGAL_DOCUMENTS, LEGAL_EFFECTIVE_DATE, LegalDocumentType } from '../../config/legal';

export function LegalDocumentDialog({ type, onClose }: { type: LegalDocumentType; onClose: () => void }) {
  const document = LEGAL_DOCUMENTS[type];
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby={`legal-${type}-title`}>
      <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <header className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div className="flex gap-3"><span className="rounded-2xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/60"><ShieldCheck className="h-5 w-5" /></span><div><h2 id={`legal-${type}-title`} className="text-xl font-black text-slate-950 dark:text-white">{document.title}</h2><p className="mt-1 text-xs text-slate-500">版本 {document.version} · 生效日期 {LEGAL_EFFECTIVE_DATE}</p></div></div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white" aria-label="关闭"><X className="h-5 w-5" /></button>
        </header>
        <div className="overflow-y-auto px-6 py-5 text-sm leading-7 text-slate-600 dark:text-slate-300">
          <p className="rounded-2xl bg-blue-50 p-4 font-medium text-blue-900 dark:bg-blue-950/40 dark:text-blue-200">{document.summary}</p>
          <div className="mt-6 space-y-6">{document.sections.map(section => <section key={section.heading}><h3 className="font-extrabold text-slate-900 dark:text-white">{section.heading}</h3>{section.paragraphs?.map(paragraph => <p key={paragraph} className="mt-2">{paragraph}</p>)}{section.items && <ul className="mt-2 list-disc space-y-1 pl-5">{section.items.map(item => <li key={item}>{item}</li>)}</ul>}</section>)}</div>
        </div>
      </div>
    </div>
  );
}

export function LegalLinks({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState<LegalDocumentType | null>(null);
  return <>
    <span className={className}>
      <button type="button" onClick={() => setOpen('terms')} className="font-semibold hover:text-blue-600">用户协议</button>
      <span aria-hidden="true">·</span>
      <button type="button" onClick={() => setOpen('privacy')} className="font-semibold hover:text-blue-600">隐私政策</button>
      <span aria-hidden="true">·</span>
      <button type="button" onClick={() => setOpen('collection')} className="font-semibold hover:text-blue-600">个人信息收集清单</button>
    </span>
    {open && <LegalDocumentDialog type={open} onClose={() => setOpen(null)} />}
  </>;
}

export function LegalConsent({ checked, onChange, onOpen, googleOnly = false }: { checked: boolean; onChange: (checked: boolean) => void; onOpen: (type: LegalDocumentType) => void; googleOnly?: boolean }) {
  return <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
    <input required type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600" />
    <span><FileCheck2 className="mr-1 inline h-3.5 w-3.5 text-blue-600" />{googleOnly ? '使用 Google 账户继续前，我已阅读并同意 ' : '我已阅读并同意 '}<button type="button" onClick={() => onOpen('terms')} className="font-bold text-blue-600">《用户协议》</button>、<button type="button" onClick={() => onOpen('privacy')} className="font-bold text-blue-600">《隐私政策》</button> 和 <button type="button" onClick={() => onOpen('collection')} className="font-bold text-blue-600">《个人信息收集清单》</button>。</span>
  </label>;
}
