import React, { useState } from 'react';
import { InterviewRecord } from '../../types/interview';
import { CrossInterviewDiagnosticReport } from '../../types/diagnostic';
import { requestCrossInterviewDiagnostic } from '../../services/geminiService';
import {
  AlertOctagon,
  Flame,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Building2,
  BookOpen,
  EyeOff,
  RefreshCw,
  Zap,
  Target
} from 'lucide-react';

interface DiagnosticDashboardProps {
  interviews: InterviewRecord[];
  report: CrossInterviewDiagnosticReport | null;
  onUpdateReport: (report: CrossInterviewDiagnosticReport) => void;
}

export const DiagnosticDashboard: React.FC<DiagnosticDashboardProps> = ({
  interviews,
  report,
  onUpdateReport,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleRunDiagnostic = async () => {
    if (interviews.length === 0) {
      alert('请先至少添加或记录一场面试！');
      return;
    }

    setIsAnalyzing(true);
    try {
      const newReport = await requestCrossInterviewDiagnostic(interviews);
      onUpdateReport(newReport);
    } catch (err: any) {
      alert('跨轮复盘诊断失败：' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Top Banner (Apple HIG Style) */}
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#0071e3] border border-blue-100 dark:border-blue-900/50">
              <Target className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              高频考点穿透与多轮失分诊断
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
              交叉分析
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            自动聚合您在各家企业多轮面试中的问答表现，精准提炼高频复考问题，并对多次出现的「不当表现」或「反复遗漏的盲区」发出严肃警示，督促引起高度重视！
          </p>
        </div>

        <button
          id="btn-run-diagnostic"
          disabled={isAnalyzing}
          onClick={handleRunDiagnostic}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex-shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? '正在进行跨轮多维穿透计算...' : '重新全量深度诊断'}</span>
        </button>
      </div>

      {/* Meta counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">已纳入样本池</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {interviews.length} <span className="text-xs font-normal text-slate-400">场面试</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">累计考题追踪</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {interviews.reduce((sum, iv) => sum + iv.questions.length, 0)} <span className="text-xs font-normal text-slate-400">道考点</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">识别高频重复考题</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {report?.frequentQuestions.length || 0} <span className="text-xs font-normal text-slate-400">个焦点</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">多轮不当表现/短板预警</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            {report?.repeatedWeaknessAlerts.length || 0} <span className="text-xs font-normal text-slate-400">个警示</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: Repeated Weakness Alerts (Highest Priority) */}
      {report?.repeatedWeaknessAlerts && report.repeatedWeaknessAlerts.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-red-200 dark:border-red-900/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-red-100 dark:border-red-900/40">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-950 dark:text-red-300 flex items-center gap-2">
                  <span>多次不当表现与丢分盲区警示</span>
                  <span className="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">
                    请务必引起高度重视
                  </span>
                </h3>
                <p className="text-xs text-red-700 dark:text-red-400">根据多轮面试记录交叉比对，候选人在不同企业面试中反复出现以下扣分点：</p>
              </div>
            </div>
            <span className="text-[11px] text-red-600 dark:text-red-400 font-medium hidden sm:inline">
              直接影响面试评级
            </span>
          </div>

          <div className="space-y-3">
            {report.repeatedWeaknessAlerts.map(alertItem => (
              <div
                key={alertItem.id}
                className={`p-4 rounded-xl border transition-all text-xs ${
                  alertItem.severity === 'critical'
                    ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/60 text-red-950 dark:text-red-300'
                    : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60 text-amber-950 dark:text-amber-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{alertItem.topic || alertItem.title}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-600 dark:text-slate-300">
                      发生频次: {alertItem.frequency || alertItem.occurrenceCount} 次
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>涉及公司/轮次:</span>
                    {(alertItem.occurredInCompanies || alertItem.observedInterviews || []).map((c: string, i: number, arr: string[]) => (
                      <span key={i} className="font-semibold text-slate-700 dark:text-slate-300">
                        {c}{i < arr.length - 1 ? '、' : ''}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="leading-relaxed text-slate-700 dark:text-slate-300 mb-2.5">
                  <span className="font-semibold text-red-900 dark:text-red-300">问题剖析：</span>
                  {alertItem.warningDetail || alertItem.description}
                </p>

                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>改进指南与标准破局话术范本</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{alertItem.actionableAdvice || alertItem.correctionAdvice}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: Frequent Questions Across Interviews */}
      {report?.frequentQuestions && report.frequentQuestions.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">跨公司高频被问考点清单</h3>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">重点突击这些被反复考察的技术问题</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {report.frequentQuestions.map(fq => (
              <div key={fq.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{fq.questionSnippet || fq.question}</span>
                  <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                    频次: {fq.askedCount || fq.frequency}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px]">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>被考公司: {fq.companies.join('、')}</span>
                </div>

                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-white">推荐解题范式：</span>
                  {fq.recommendedStrategy || fq.recommendedPreparation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: Knowledge Gaps & Unanswered Topics */}
      {((report?.knowledgeGaps && report.knowledgeGaps.length > 0) || (report?.overlookedKeyPoints && report.overlookedKeyPoints.length > 0)) && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">知识盲区与未完全作答考点</h3>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">现场卡壳或语焉不详的知识短板</span>
          </div>

          <div className="space-y-2.5">
            {report?.knowledgeGaps && report.knowledgeGaps.map((gap: any) => (
              <div key={gap.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{gap.topic}</span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">({gap.lastFailedCompany || '多轮面试'} 暴露)</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{gap.suggestedStudyPlan}</p>
                </div>
              </div>
            ))}

            {(!report?.knowledgeGaps || report.knowledgeGaps.length === 0) && report?.overlookedKeyPoints?.map((pt, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{pt}</span>
                <span className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">建议复盘补全</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
