import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bug, LoaderCircle, MessageSquareText, Send, X } from 'lucide-react';
import { submitUserFeedback } from '../../services/feedbackService';
import { showAppMessage } from './AppFeedback';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageContext: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, pageContext }) => {
  const [category, setCategory] = useState('suggestion');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [isOpen]);

  if (!isOpen) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const saved = await submitUserFeedback({ category, subject, message, pageContext });
      showAppMessage(`反馈已提交（编号 #${saved.id}），管理员可在反馈后台查看。`, 'success');
      setSubject('');
      setMessage('');
      onClose();
    } catch (error) {
      showAppMessage(error instanceof Error ? error.message : '反馈提交失败。', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[320] isolate flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 text-[#0071e3] dark:bg-blue-950/50"><MessageSquareText className="h-5 w-5" /></div>
            <div><h2 id="feedback-title" className="text-sm font-bold text-slate-900 dark:text-white">问题反馈</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">反馈会保存到管理员反馈中心，并附带当前模块名称。</p></div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="关闭"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={submit} className="space-y-4 p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[150px_1fr]">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">类型</label>
              <select value={category} onChange={event => setCategory(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                <option value="bug">功能异常</option><option value="suggestion">产品建议</option><option value="content">内容问题</option><option value="account">账户与同步</option><option value="other">其他</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">标题</label>
              <input required maxLength={160} value={subject} onChange={event => setSubject(event.target.value)} placeholder="用一句话描述问题" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#0071e3] dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">详细说明</label>
            <textarea required minLength={5} maxLength={8000} rows={7} value={message} onChange={event => setMessage(event.target.value)} placeholder="请描述发生了什么、期望结果是什么；如可复现，请写下操作步骤。" className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs leading-6 outline-none focus:border-[#0071e3] dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
            <span className="flex items-center gap-1.5 text-[10px] text-slate-400"><Bug className="h-3.5 w-3.5" />当前模块：{pageContext}</span>
            <button type="submit" disabled={submitting || !subject.trim() || message.trim().length < 5} className="inline-flex items-center gap-2 rounded-xl bg-[#0071e3] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
              {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{submitting ? '提交中…' : '提交反馈'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};
