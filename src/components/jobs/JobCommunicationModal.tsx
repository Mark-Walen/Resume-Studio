import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BrainCircuit,
  Check,
  ChevronRight,
  LoaderCircle,
  MessageCircleQuestion,
  Save,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { ResumeData } from '../../types/resume';
import { JobApplication, JobCommunicationAdvice, JobCommunicationRecord } from '../../types/job';
import { requestJobCommunicationAdvice } from '../../services/geminiService';
import { showAppConfirm, showAppMessage } from '../common/AppFeedback';

const PRESET_QUESTIONS = [
  '您怎么理解软件工程师和程序员岗位？您对自己的定位是什么？',
  '为什么想加入我们公司、选择这个岗位？',
  '请介绍一个最能体现你能力的项目。',
  '你的优势是什么？有哪些方面还需要提升？',
  '为什么考虑离职或寻找新的机会？',
  '你的期望薪资是多少？为什么？',
];

interface JobCommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: JobApplication;
  currentResume: ResumeData;
  onSave: (records: JobCommunicationRecord[]) => void;
}

export const JobCommunicationModal: React.FC<JobCommunicationModalProps> = ({
  isOpen,
  onClose,
  application,
  currentResume,
  onSave,
}) => {
  const [question, setQuestion] = useState(PRESET_QUESTIONS[0]);
  const [advice, setAdvice] = useState<JobCommunicationAdvice | null>(null);
  const [editedAnswer, setEditedAnswer] = useState('');
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [records, setRecords] = useState<JobCommunicationRecord[]>(application.communicationRecords || []);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setQuestion(PRESET_QUESTIONS[0]);
    setAdvice(null);
    setEditedAnswer('');
    setActiveRecordId(null);
    setRecords(application.communicationRecords || []);
  }, [application.id, isOpen]);

  const canSave = Boolean(advice && editedAnswer.trim());
  const jobContext = useMemo(
    () => [application.companyName, application.position, application.location].filter(Boolean).join(' · '),
    [application.companyName, application.position, application.location]
  );

  if (!isOpen) return null;

  const generateAdvice = async () => {
    const normalizedQuestion = question.trim();
    if (!normalizedQuestion) {
      showAppMessage('请先输入对方提出的问题。', 'warning');
      return;
    }
    setIsGenerating(true);
    try {
      const result = await requestJobCommunicationAdvice({
        question: normalizedQuestion,
        currentResume,
        job: application,
      });
      setAdvice(result);
      setEditedAnswer(result.suggestedAnswer || '');
      setActiveRecordId(null);
    } catch (error) {
      showAppMessage(error instanceof Error ? error.message : '生成沟通建议失败，请稍后重试。', 'error', 5200);
    } finally {
      setIsGenerating(false);
    }
  };

  const loadRecord = (record: JobCommunicationRecord) => {
    setQuestion(record.question);
    setAdvice({
      interviewerIntent: record.interviewerIntent,
      answerFramework: record.answerFramework,
      suggestedAnswer: record.aiSuggestedAnswer || record.suggestedAnswer,
      followUpQuestions: record.followUpQuestions,
      cautions: record.cautions,
    });
    setEditedAnswer(record.suggestedAnswer);
    setActiveRecordId(record.id);
  };

  const saveRecord = () => {
    if (!advice || !editedAnswer.trim()) return;
    const now = new Date().toISOString();
    const existing = records.find(record => record.id === activeRecordId);
    const record: JobCommunicationRecord = {
      id: existing?.id || `job-communication-${Date.now()}`,
      question: question.trim(),
      interviewerIntent: advice.interviewerIntent,
      answerFramework: advice.answerFramework || [],
      suggestedAnswer: editedAnswer.trim(),
      aiSuggestedAnswer: advice.suggestedAnswer,
      followUpQuestions: advice.followUpQuestions || [],
      cautions: advice.cautions || [],
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
    const nextRecords = existing
      ? records.map(item => item.id === existing.id ? record : item)
      : [record, ...records];
    setRecords(nextRecords);
    setActiveRecordId(record.id);
    onSave(nextRecords);
    showAppMessage(existing ? '沟通回答已更新并同步到云端。' : '沟通回答已保存并同步到云端。', 'success');
  };

  const deleteRecord = async (recordId: string) => {
    const confirmed = await showAppConfirm('删除后，该岗位下保存的这条沟通回答也会从云端同步记录中移除。', {
      title: '删除沟通回答？',
      confirmLabel: '删除',
      danger: true,
    });
    if (!confirmed) return;
    const nextRecords = records.filter(record => record.id !== recordId);
    setRecords(nextRecords);
    onSave(nextRecords);
    if (activeRecordId === recordId) {
      setActiveRecordId(null);
      setAdvice(null);
      setEditedAnswer('');
    }
    showAppMessage('沟通回答已删除。', 'success');
  };

  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-labelledby="job-communication-title">
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-2xl dark:border-slate-700 dark:bg-slate-950">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex min-w-0 items-start gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 text-[#0071e3] dark:bg-blue-950/50">
              <MessageCircleQuestion className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 id="job-communication-title" className="text-base font-bold text-slate-900 dark:text-white">职位沟通助手</h2>
              <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{jobContext}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white" aria-label="关闭">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[270px_minmax(0,1fr)]">
          <aside className="min-h-0 overflow-y-auto border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:border-b-0 lg:border-r">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">常见问题</h3>
            <div className="mt-2 space-y-1.5">
              {PRESET_QUESTIONS.map((item, index) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => { setQuestion(item); setAdvice(null); setEditedAnswer(''); setActiveRecordId(null); }}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left text-xs leading-5 transition-colors ${question === item && !activeRecordId ? 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-200' : 'border-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                >
                  <span className="mr-1.5 font-mono text-[10px] text-slate-400">{String(index + 1).padStart(2, '0')}</span>
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">已保存回答</h3>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">{records.length}</span>
            </div>
            <div className="mt-2 space-y-1.5">
              {records.length === 0 && <p className="rounded-xl border border-dashed border-slate-200 p-3 text-[11px] leading-5 text-slate-400 dark:border-slate-700">生成后保存的回答会归档在当前岗位，并随工作区跨设备同步。</p>}
              {records.map(record => (
                <div key={record.id} className={`group flex items-center gap-1 rounded-xl border p-1 ${activeRecordId === record.id ? 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40' : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60'}`}>
                  <button type="button" onClick={() => loadRecord(record)} className="min-w-0 flex-1 px-2 py-1.5 text-left">
                    <span className="line-clamp-2 text-[11px] font-semibold leading-4 text-slate-700 dark:text-slate-200">{record.question}</span>
                  </button>
                  <button type="button" onClick={() => deleteRecord(record.id)} className="rounded-lg p-1.5 text-slate-400 opacity-0 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-950/50" aria-label="删除回答">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </div>
              ))}
            </div>
          </aside>

          <main className="min-h-0 overflow-y-auto p-4 sm:p-6">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200" htmlFor="job-communication-question">对方问了什么？</label>
            <textarea
              id="job-communication-question"
              value={question}
              onChange={event => { setQuestion(event.target.value); setActiveRecordId(null); }}
              rows={3}
              maxLength={2000}
              placeholder="输入 HR、猎头或面试官的问题……"
              className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-[#0071e3] focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-950"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">AI 将结合当前简历和该岗位 JD，不虚构未提供的经历。</p>
              <button
                id="btn-generate-job-communication"
                type="button"
                onClick={generateAdvice}
                disabled={isGenerating || !question.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0071e3] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#0077ed] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isGenerating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {isGenerating ? '正在组织回答…' : '生成沟通建议'}
              </button>
            </div>

            {!advice && !isGenerating && (
              <div className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900/60">
                <BrainCircuit className="mx-auto h-9 w-9 text-slate-300 dark:text-slate-600" />
                <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">从“知道大概”到“能够清楚表达”</p>
                <p className="mx-auto mt-1 max-w-lg text-xs leading-5 text-slate-400">选择一个常见问题或输入实际问题，获得面试官意图、回答结构、口语化示例和追问准备。</p>
              </div>
            )}

            {advice && (
              <div className="mt-6 space-y-4">
                <section className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-900/60 dark:bg-blue-950/30">
                  <h3 className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-200"><BrainCircuit className="h-4 w-4" /> 面试官真正想了解什么</h3>
                  <p className="mt-2 text-xs leading-6 text-blue-800/90 dark:text-blue-200/90">{advice.interviewerIntent}</p>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">回答框架</h3>
                  <ol className="mt-3 space-y-2">
                    {advice.answerFramework.map((item, index) => (
                      <li key={`${item}-${index}`} className="flex gap-2.5 text-xs leading-5 text-slate-600 dark:text-slate-300">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 font-mono text-[10px] font-bold text-slate-500 dark:bg-slate-800">{index + 1}</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">可直接使用的回答</h3>
                    <span className="text-[10px] text-slate-400">可按自己的说话方式修改后保存</span>
                  </div>
                  <textarea
                    id="job-communication-answer"
                    value={editedAnswer}
                    onChange={event => setEditedAnswer(event.target.value)}
                    rows={8}
                    maxLength={8000}
                    className="mt-3 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm leading-7 text-slate-800 outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-blue-950"
                  />
                </section>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">可能的追问</h3>
                    <div className="mt-3 space-y-3">
                      {advice.followUpQuestions.map((item, index) => (
                        <div key={`${item.question}-${index}`}>
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{item.question}</p>
                          <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">准备方向：{item.answerHint}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                  <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
                    <h3 className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200"><AlertTriangle className="h-4 w-4" /> 回答时避免</h3>
                    <ul className="mt-3 space-y-2">
                      {advice.cautions.map((item, index) => (
                        <li key={`${item}-${index}`} className="flex gap-2 text-xs leading-5 text-amber-800 dark:text-amber-200/90"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />{item}</li>
                      ))}
                    </ul>
                  </section>
                </div>

                <div className="sticky bottom-0 flex justify-end border-t border-slate-200 bg-slate-50/95 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
                  <button type="button" onClick={saveRecord} disabled={!canSave} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
                    <Save className="h-4 w-4" />
                    {activeRecordId ? '更新已保存回答' : '保存到当前岗位'}
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
