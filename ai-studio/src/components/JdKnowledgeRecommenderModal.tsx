import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Building2,
  Briefcase,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  BookmarkPlus
} from 'lucide-react';
import { JobApplication } from '../types/job';
import { ResumeData } from '../types/resume';
import { CompanyJdRecommendationResult, RecommendedKnowledgePoint, KnowledgeItem } from '../types/knowledge';
import { requestRecommendKnowledgePoints } from '../services/geminiService';

interface JdKnowledgeRecommenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobApplications: JobApplication[];
  currentResume: ResumeData;
  onAddKnowledgeItem?: (item: KnowledgeItem) => void;
  preselectedSectionTitle?: string;
}

export const JdKnowledgeRecommenderModal: React.FC<JdKnowledgeRecommenderModalProps> = ({
  isOpen,
  onClose,
  jobApplications,
  currentResume,
  onAddKnowledgeItem,
  preselectedSectionTitle,
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>(jobApplications[0]?.id || 'custom');
  const [companyName, setCompanyName] = useState<string>(jobApplications[0]?.companyName || '字节跳动');
  const [position, setPosition] = useState<string>(jobApplications[0]?.position || '资深架构研发');
  const [jobDescription, setJobDescription] = useState<string>(jobApplications[0]?.jobDescription || '');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CompanyJdRecommendationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedItemIds, setSavedItemIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleSelectJob = (jobId: string) => {
    setSelectedJobId(jobId);
    if (jobId === 'custom') {
      setCompanyName('');
      setPosition('');
      setJobDescription('');
    } else {
      const job = jobApplications.find((j) => j.id === jobId);
      if (job) {
        setCompanyName(job.companyName);
        setPosition(job.position);
        setJobDescription(job.jobDescription || '');
      }
    }
  };

  const handleAnalyze = async () => {
    if (!companyName.trim()) {
      setErrorMsg('请填写即将面试的目标公司名称');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await requestRecommendKnowledgePoints({
        companyName,
        position,
        jobDescription,
        currentResume,
      });
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || '推荐知识点失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToFlashcard = (rec: RecommendedKnowledgePoint) => {
    if (!onAddKnowledgeItem) return;

    const newItem: KnowledgeItem = {
      id: `kb-rec-${Date.now()}`,
      category: rec.category,
      difficulty: rec.urgency === 'critical' ? 'architecture' : 'advanced',
      title: rec.title,
      summary: `${rec.matchReason}\n【该公司考察特色】：${rec.companySpecificFlavor}`,
      tags: [companyName, 'JD定制推荐', rec.category],
      corePrinciples: [
        `目标公司考法：${rec.companySpecificFlavor}`,
        `速记核心策略：${rec.keyPreparationAction}`
      ],
      interviewerQuestions: [rec.companySpecificFlavor],
      modelAnswer: `针对 ${companyName}「${position}」岗位的回答标准：\n${rec.keyPreparationAction}`,
      commonPitfalls: [rec.interviewTrapWarning],
      relatedCompanies: [companyName],
      customAdded: true
    };

    onAddKnowledgeItem(newItem);
    setSavedItemIds((prev) => new Set(prev).add(rec.id));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">基于目标公司 JD 智能推荐知识考点</h3>
              <p className="text-xs text-slate-400">
                结合您当前的真实简历与即将面试的企业技术风格，反查考点盲区与必考压轴题
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Company & JD Selector */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span>快速从投递管理选择即将面试的公司：</span>
              </div>
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
                {jobApplications.map((j) => (
                  <button
                    key={j.id}
                    onClick={() => handleSelectJob(j.id)}
                    className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors whitespace-nowrap ${
                      selectedJobId === j.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {j.companyName}
                  </button>
                ))}
                <button
                  onClick={() => handleSelectJob('custom')}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors whitespace-nowrap ${
                    selectedJobId === 'custom'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  + 自定义输入
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">目标公司名称</label>
                <input
                  type="text"
                  placeholder="如：字节跳动、阿里巴巴、美团..."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">即将面试的职位</label>
                <input
                  type="text"
                  placeholder="如：全栈架构师 / 资深研发专家"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                岗位 Job Description (JD 描述或核心要求)
              </label>
              <textarea
                rows={3}
                placeholder="粘贴该职位的 JD 描述、或者面试官侧重的技术栈要点..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                id="btn-run-jd-recommendation"
                onClick={handleAnalyze}
                disabled={isLoading}
                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
              >
                <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'AI 正在对齐简历与技术画像...' : '生成针对该公司的必考考点与知识清单'}</span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="space-y-6 pt-2">
              {/* Profile Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-500/20 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <Building2 className="w-5 h-5 text-amber-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {result.companyName} · {result.position}
                      </h4>
                      <div className="text-xs text-indigo-300 font-mono">
                        对齐匹配度评分：<span className="font-bold text-amber-400">{result.overallMatchScore}分</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    针对性技术突击
                  </span>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed">
                  <span className="text-indigo-400 font-semibold">【企业技术风格画像】：</span>
                  {result.companyTechProfile}
                </div>

                {result.coreRequirementsSummary && (
                  <div className="text-xs text-slate-400 leading-relaxed">
                    <span className="text-slate-300 font-medium">【核心硬性门槛】：</span>
                    {result.coreRequirementsSummary}
                  </div>
                )}
              </div>

              {/* Recommended Points List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    推荐必背考点 ({result.recommendations.length})
                  </h4>
                  <span className="text-[11px] text-slate-500">按考察紧迫性由高到低排列</span>
                </div>

                <div className="space-y-3">
                  {result.recommendations.map((rec) => {
                    const isSaved = savedItemIds.has(rec.id);
                    const urgencyBadge =
                      rec.urgency === 'critical'
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : rec.urgency === 'high'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

                    const urgencyLabel =
                      rec.urgency === 'critical'
                        ? '必考红线'
                        : rec.urgency === 'high'
                        ? '核心重点'
                        : '突出亮点';
                    const UrgencyIcon = rec.urgency === 'critical' ? ShieldAlert : rec.urgency === 'high' ? AlertTriangle : Sparkles;

                    return (
                      <div
                        key={rec.id}
                        className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/80 hover:border-indigo-500/40 space-y-3 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border ${urgencyBadge}`}>
                              <UrgencyIcon className="w-3 h-3" />{urgencyLabel}
                            </span>
                            <h5 className="text-sm font-bold text-white">{rec.title}</h5>
                          </div>

                          <div className="flex items-center space-x-2">
                            {onAddKnowledgeItem && (
                              <button
                                onClick={() => handleSaveToFlashcard(rec)}
                                disabled={isSaved}
                                className={`flex items-center space-x-1 px-2.5 py-1 text-xs rounded-lg transition-colors ${
                                  isSaved
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                                }`}
                              >
                                {isSaved ? (
                                  <>
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    <span>已加入复习闪卡</span>
                                  </>
                                ) : (
                                  <>
                                    <BookmarkPlus className="w-3.5 h-3.5" />
                                    <span>存入复习库</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Match Reason */}
                        <div className="text-xs text-slate-300 leading-relaxed">
                          <span className="text-amber-400 font-medium">为什么必考：</span>
                          {rec.matchReason}
                        </div>

                        {/* Specific flavor */}
                        <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 space-y-1">
                          <div className="font-semibold text-indigo-300 flex items-center space-x-1.5">
                            <Lightbulb className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{result.companyName} 面试官最常追问的独特切入点：</span>
                          </div>
                          <p className="pl-5 leading-relaxed">{rec.companySpecificFlavor}</p>
                        </div>

                        {/* Trap Warning */}
                        {rec.interviewTrapWarning && (
                          <div className="p-2.5 rounded-lg bg-red-950/20 border border-red-500/20 text-xs text-red-200 flex items-start space-x-2">
                            <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-red-300">易踩坑翻车点：</span>
                              <span className="ml-1 text-red-200/90">{rec.interviewTrapWarning}</span>
                            </div>
                          </div>
                        )}

                        {/* Preparation Action */}
                        <div className="text-xs text-emerald-300/90 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-500/20">
                          <span className="font-semibold text-emerald-300 inline-flex items-center gap-1.5"><Lightbulb className="w-3.5 h-3.5" />面试标准回答思路：</span>
                          <span className="ml-1">{rec.keyPreparationAction}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            完成查看
          </button>
        </div>
      </div>
    </div>
  );
};
