import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';

type MessageTone = 'info' | 'success' | 'warning' | 'error';

type MessageDetail = {
  message: string;
  tone?: MessageTone;
  duration?: number;
};

type ConfirmDetail = {
  message: string;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  resolve: (confirmed: boolean) => void;
};

const MESSAGE_EVENT = 'resume-pilot:message';
const CONFIRM_EVENT = 'resume-pilot:confirm';

export function showAppMessage(message: string, tone: MessageTone = 'info', duration = 3600): void {
  window.dispatchEvent(new CustomEvent<MessageDetail>(MESSAGE_EVENT, { detail: { message, tone, duration } }));
}

export function showAppConfirm(
  message: string,
  options: Omit<ConfirmDetail, 'message' | 'resolve'> = {}
): Promise<boolean> {
  return new Promise(resolve => {
    window.dispatchEvent(new CustomEvent<ConfirmDetail>(CONFIRM_EVENT, {
      detail: { message, resolve, ...options }
    }));
  });
}

const toneStyles: Record<MessageTone, string> = {
  info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200',
  warning: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200',
  error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200'
};

const toneIcons = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  error: AlertCircle
};

export const AppFeedbackProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [message, setMessage] = useState<(MessageDetail & { id: number }) | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmDetail | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMessage = (event: Event) => {
      const detail = (event as CustomEvent<MessageDetail>).detail;
      if (timerRef.current) window.clearTimeout(timerRef.current);
      setMessage({ ...detail, id: Date.now() });
      timerRef.current = window.setTimeout(() => setMessage(null), detail.duration ?? 3600);
    };
    const handleConfirm = (event: Event) => setConfirmation((event as CustomEvent<ConfirmDetail>).detail);
    window.addEventListener(MESSAGE_EVENT, handleMessage);
    window.addEventListener(CONFIRM_EVENT, handleConfirm);
    return () => {
      window.removeEventListener(MESSAGE_EVENT, handleMessage);
      window.removeEventListener(CONFIRM_EVENT, handleConfirm);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const finishConfirmation = (confirmed: boolean) => {
    confirmation?.resolve(confirmed);
    setConfirmation(null);
  };

  const tone = message?.tone ?? 'info';
  const MessageIcon = toneIcons[tone];

  return (
    <>
      {children}

      {message && (
        <div
          key={message.id}
          role="status"
          aria-live="polite"
          className={`fixed right-4 top-20 z-[220] flex max-w-sm items-start gap-2.5 rounded-xl border px-3.5 py-3 text-xs font-semibold shadow-xl animate-in fade-in slide-in-from-top-2 ${toneStyles[tone]}`}
        >
          <MessageIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="flex-1 leading-5">{message.message}</span>
          <button type="button" onClick={() => setMessage(null)} className="rounded p-0.5 opacity-70 hover:opacity-100" aria-label="关闭消息">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {confirmation && (
        <div className="fixed inset-0 z-[230] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="app-confirm-title">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start gap-3">
              <div className={`rounded-xl p-2 ${confirmation.danger ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'}`}>
                {confirmation.danger ? <TriangleAlert className="h-5 w-5" /> : <Info className="h-5 w-5" />}
              </div>
              <div>
                <h2 id="app-confirm-title" className="text-sm font-bold text-slate-900 dark:text-white">{confirmation.title || '请确认操作'}</h2>
                <p className="mt-1.5 text-xs leading-5 text-slate-600 dark:text-slate-300">{confirmation.message}</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => finishConfirmation(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                {confirmation.cancelLabel || '取消'}
              </button>
              <button type="button" onClick={() => finishConfirmation(true)} className={`rounded-xl px-4 py-2 text-xs font-bold text-white ${confirmation.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#0071e3] hover:bg-[#0077ed]'}`}>
                {confirmation.confirmLabel || '确认'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
