import React, { useState, useEffect } from 'react';
import { InterviewRecord, InterviewQuestionItem, MediaAttachment, UnansweredSolution } from '../../types/interview';
import { getMediaBlob } from '../../utils/db';
import { downloadMediaAttachment } from '../../services/mediaStorageService';
import { requestInterviewFeedback } from '../../services/geminiService';
import { showAppMessage } from '../common/AppFeedback';
import {
  Sparkles,
  Play,
  Video,
  Music,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Lightbulb,
  ShieldAlert,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Edit3
} from 'lucide-react';

interface InterviewDetailProps {
  record: InterviewRecord;
  onBack: () => void;
  onEdit: () => void;
  onUpdateRecord: (updated: InterviewRecord) => void;
}

export const InterviewDetail: React.FC<InterviewDetailProps> = ({
  record,
  onBack,
  onEdit,
  onUpdateRecord,
}) => {
  const [activeMediaUrl, setActiveMediaUrl] = useState<string | null>(null);
  const [activeMediaType, setActiveMediaType] = useState<'video' | 'audio'>('video');
  const [activeMediaName, setActiveMediaName] = useState<string>('');
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [expandedSolutionId, setExpandedSolutionId] = useState<string | null>(null);

  // Load media blob URL when user selects media
  const handlePlayMedia = async (attachment: MediaAttachment) => {
    try {
      const blobKey = attachment.blobId || attachment.id;
      let blob = await getMediaBlob(blobKey);
      if (!blob && attachment.cloudObjectPath) {
        blob = await downloadMediaAttachment(attachment.id);
      }
      if (blob) {
        if (activeMediaUrl) {
          URL.revokeObjectURL(activeMediaUrl);
        }
        const url = URL.createObjectURL(blob);
        setActiveMediaUrl(url);
        setActiveMediaType(attachment.type);
        setActiveMediaName(attachment.name);
      } else if (attachment.dataUrl) {
        setActiveMediaUrl(attachment.dataUrl);
        setActiveMediaType(attachment.type);
        setActiveMediaName(attachment.name);
      } else {
        showAppMessage('未找到可用的本地或云端附件，请重新上传。', 'warning');
      }
    } catch (err) {
      console.error('Error playing media:', err);
      showAppMessage(err instanceof Error ? err.message : '附件读取失败。', 'error');
    }
  };

  useEffect(() => {
    return () => {
      if (activeMediaUrl) {
        URL.revokeObjectURL(activeMediaUrl);
      }
    };
  }, [activeMediaUrl]);

  // Trigger AI Feedback Generation
  const handleGenerateAiFeedback = async () => {
    setIsGeneratingFeedback(true);
    try {
      const res = await requestInterviewFeedback({
        companyName: record.companyName,
        round: record.round,
        position: record.position,
        interviewNotes: record.notes || record.interviewNotes || '',
        questions: record.questions,
      });

      // Map solutions back to questions
      const updatedQuestions = record.questions.map(q => {
        const found = res.questionSolutions.find(s => s.questionId === q.id);
        if (found) {
          return {
            ...q,
            unansweredSolution: found.solution
          };
        }
        return q;
      });

      const updatedRecord: InterviewRecord = {
        ...record,
        aiFeedback: {
          overallScore: res.summary?.overallScore ?? 80,
          summary: res.summary?.overview ?? '',
          strengths: res.summary?.candidateStrengths ?? [],
          areasToImprove: res.summary?.areasToImprove ?? [],
          communicationFeedback: res.summary?.communicationFeedback ?? '',
          generatedAt: new Date().toISOString().split('T')[0]
        },
        questions: updatedQuestions
      };

      onUpdateRecord(updatedRecord);
    } catch (err: any) {
      showAppMessage('AI 复盘分析失败：' + err.message, 'error');
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const unansweredOrStruggled = record.questions.filter(
    q => q.struggleLevel === 'unanswered' || q.struggleLevel === 'struggled'
  );

  return (
    <div className="space-y-5 font-sans">
      {/* Top Bar Navigation */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            返回面试记录列表
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{record.companyName} · {record.round}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-[#0071e3] border border-blue-200 dark:border-blue-900">
              {record.position}
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            面试日期: {record.date} | 时长: {record.durationMinutes} 分钟 | 考官: {record.interviewers || '保密'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            编辑信息
          </button>
          <button
            id="btn-trigger-ai-feedback"
            disabled={isGeneratingFeedback}
            onClick={handleGenerateAiFeedback}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {isGeneratingFeedback ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                AI 正在生成深度复盘...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                {record.aiFeedback ? '重新生成 AI 诊断' : '一键生成 AI 摘要与未答解法'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Online Media Player Section (Video / Audio) */}
      {record.mediaAttachments && record.mediaAttachments.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Video className="w-4 h-4 text-[#0071e3]" />
              面试过程在线音视频播放 ({record.mediaAttachments.length} 个附件)
            </h3>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">支持倍速播放与原声还原</span>
          </div>

          {/* Attachment Selector Buttons */}
          <div className="flex flex-wrap gap-2">
            {record.mediaAttachments.map(m => (
              <button
                key={m.id}
                onClick={() => handlePlayMedia(m)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  activeMediaName === m.name
                    ? 'bg-[#0071e3] text-white border-[#0071e3] shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Play className="w-3 h-3" />
                <span>{m.name}</span>
                <span className="text-[10px] opacity-80">({m.type === 'video' ? '视频' : '音频'})</span>
              </button>
            ))}
          </div>

          {/* Active Media Player */}
          {activeMediaUrl && (
            <div className="p-4 bg-slate-950 dark:bg-black rounded-xl overflow-hidden mt-3 shadow-inner">
              <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                <span>正在播放: {activeMediaName}</span>
                <span className="text-[10px] text-[#0071e3]">安全播放中</span>
              </div>
              {activeMediaType === 'video' ? (
                <video
                  controls
                  className="w-full max-h-[420px] rounded-lg bg-black mx-auto"
                  src={activeMediaUrl}
                >
                  您的浏览器不支持 HTML5 视频播放
                </video>
              ) : (
                <div className="py-6 flex justify-center">
                  <audio controls className="w-full max-w-lg" src={activeMediaUrl}>
                    您的浏览器不支持 HTML5 音频播放
                  </audio>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Notes / Interview Experience */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">现场面经与个人反思</h3>
        <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-700 font-sans">
          {record.notes || '暂无面经记录，点击右上角“编辑信息”添加。'}
        </p>
      </div>

      {/* AI Summary & Diagnostic Feedback Card */}
      {record.aiFeedback ? (
        <div className="bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/70 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/30 p-6 rounded-2xl border border-blue-200 dark:border-blue-900/60 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-blue-100 dark:border-slate-800 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#0071e3] text-white flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI 考官综合评估报告</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">生成时间: {record.aiFeedback.generatedAt}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">当场综合评分:</span>
              <span className="text-2xl font-black text-[#0071e3] dark:text-blue-400">{record.aiFeedback.overallScore}</span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
          </div>

          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white/80 dark:bg-slate-800/80 p-3.5 rounded-xl border border-blue-100 dark:border-slate-700">
            <span className="font-bold text-[#0071e3] dark:text-blue-400 block mb-1">【总评摘要】</span>
            {record.aiFeedback.summary}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Strengths */}
            <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 p-3.5 rounded-xl text-xs space-y-1.5">
              <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                展现的亮点与优势
              </div>
              <ul className="space-y-1 text-emerald-800 dark:text-emerald-300 pl-1">
                {record.aiFeedback.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="font-bold">✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas to Improve */}
            <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 p-3.5 rounded-xl text-xs space-y-1.5">
              <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                当场暴露的短板与待提升点
              </div>
              <ul className="space-y-1 text-amber-800 dark:text-amber-300 pl-1">
                {record.aiFeedback.areasToImprove.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="font-bold">!</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {record.aiFeedback.communicationFeedback && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300">
              <span className="font-bold text-slate-900 dark:text-white">沟通表达建议：</span>
              <span>{record.aiFeedback.communicationFeedback}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 p-6 rounded-2xl text-center space-y-2">
          <Sparkles className="w-6 h-6 text-slate-400 dark:text-slate-500 mx-auto" />
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">尚未生成当场 AI 反馈与摘要</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">点击右上角「一键生成 AI 摘要与未答解法」，大模型将自动解析您的面经与问答作答情况！</p>
        </div>
      )}

      {/* Questions & Unanswered Solutions Section */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">面试题目全览与攻坚方案</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              共 {record.questions.length} 题 · 未答上/答得一般: {unansweredOrStruggled.length} 题
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#0071e3] border border-blue-200 dark:border-blue-900/60">
            精准赋能下次遇题
          </span>
        </div>

        <div className="space-y-4">
          {record.questions.map((q, idx) => {
            const isUnanswered = q.struggleLevel === 'unanswered';
            const isStruggled = q.struggleLevel === 'struggled';
            const solution = q.unansweredSolution;
            const isExpanded = expandedSolutionId === q.id || (isUnanswered && !expandedSolutionId);

            return (
              <div
                key={q.id}
                className={`rounded-xl border p-4 transition-all text-xs ${
                  isUnanswered
                    ? 'border-red-200 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/20'
                    : isStruggled
                    ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40'
                }`}
              >
                {/* Question Title Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-slate-400 mt-0.5">#{idx + 1}</span>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{q.question}</h4>
                      {q.category && <span className="text-[10px] text-slate-400 dark:text-slate-500">{q.category}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isUnanswered
                          ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900'
                          : isStruggled
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                      }`}
                    >
                      {isUnanswered ? '未答上 / 盲区' : isStruggled ? '答得一般 / 勉强' : '流利掌握'}
                    </span>

                    {solution && (
                      <button
                        onClick={() => setExpandedSolutionId(isExpanded ? null : q.id)}
                        className="inline-flex items-center gap-1 text-[#0071e3] hover:underline font-semibold text-[11px] cursor-pointer"
                      >
                        {isExpanded ? '收起高分解法' : '展开高分解法'}
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Candidate notes */}
                {q.userNotes && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-white/90 dark:bg-slate-800/90 p-2 rounded-lg border border-slate-200 dark:border-slate-700 mb-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">现场复盘备忘: </span>
                    {q.userNotes}
                  </div>
                )}

                {/* Unanswered / Struggled Solution Box */}
                {solution && isExpanded && (
                  <div className="mt-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-blue-200 dark:border-blue-900/50 shadow-xs space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-2 border-b border-blue-100 dark:border-slate-800">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        考官级高分解题方案 (下次遇到怎么答)
                      </span>
                      <span className="text-[10px] text-[#0071e3] font-medium">STAR 框架 + 避坑指南</span>
                    </div>

                    {/* Core Concept */}
                    <div>
                      <div className="font-bold text-[#0071e3] dark:text-blue-400 text-[11px] mb-0.5">🎯 核心考点剖析 (底层在考察什么):</div>
                      <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">{solution.coreConcept}</p>
                    </div>

                    {/* Model Answer */}
                    <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="font-bold text-slate-900 dark:text-white text-[11px] mb-1">🏆 标准高分回答架构:</div>
                      <p className="text-slate-800 dark:text-slate-200 text-xs whitespace-pre-wrap leading-relaxed font-sans">
                        {solution.modelAnswer}
                      </p>
                    </div>

                    {/* Common Mistakes */}
                    {solution.commonMistakes && solution.commonMistakes.length > 0 && (
                      <div className="bg-red-50/50 dark:bg-red-950/20 p-2.5 rounded-lg border border-red-100 dark:border-red-900/50 text-xs">
                        <div className="font-bold text-red-900 dark:text-red-300 text-[11px] mb-1 flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                          常见误区与避坑指南:
                        </div>
                        <ul className="space-y-0.5 text-red-800 dark:text-red-300 text-[11px] pl-1">
                          {solution.commonMistakes.map((m, i) => (
                            <li key={i}>• {m}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Next time strategy */}
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900/50 text-xs">
                      <div className="font-bold text-emerald-900 dark:text-emerald-300 text-[11px] mb-0.5">💡 下次遇到同类题的应对策略:</div>
                      <p className="text-emerald-900 dark:text-emerald-300 text-[11px] leading-relaxed">{solution.strategyNextTime}</p>
                    </div>

                    {/* Key takeaway */}
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-100 dark:border-slate-800">
                      一句话核心总结: {solution.keyTakeaway}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
