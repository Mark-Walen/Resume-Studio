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
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl border border-indigo-900 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400 text-slate-950">
              Cross-Round AI Intelligence
            </span>
            <span className="text-xs text-indigo-200">基于全量多轮面试深度交叉分析</span>
          </div>
          <h2 className="text-xl font-black tracking-tight">高频考点穿透与多轮失分红线诊断</h2>
          <p className="text-xs text-indigo-200 mt-1 max-w-2xl leading-relaxed">
            自动聚合您在各家企业多轮面试中的问答表现，精准提炼高频复考问题，并对多次出现的「不当表现」或「反复遗漏的盲区」发出严肃警示，督促引起高度重视！
          </p>
        </div>

        <button
          id="btn-run-diagnostic"
          disabled={isAnalyzing}
          onClick={handleRunDiagnostic}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-900/50 transition-all flex-shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? '正在进行跨轮多维穿透计算...' : '重新全量深度诊断'}
        </button>
      </div>

      {/* Meta counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">已纳入样本池</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {interviews.length} <span className="text-xs font-normal text-slate-400">场面试</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">累计考题追踪</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {interviews.reduce((sum, iv) => sum + iv.questions.length, 0)} <span className="text-xs font-normal text-slate-400">道考点</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">识别高频重复考题</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {report?.frequentQuestions.length || 0} <span className="text-xs font-normal text-slate-400">个焦点</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">多轮不当表现/短板预警</div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {report?.repeatedWeaknessAlerts.length || 0} <span className="text-xs font-normal text-slate-400">个警示</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: Repeated Weakness Alerts (Highest Priority - MUST ATTRACT USER ATTENTION) */}
      {report?.repeatedWeaknessAlerts && report.repeatedWeaknessAlerts.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border-2 border-red-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-red-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold animate-pulse">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-950 flex items-center gap-2">
                  <span>多次不当表现与丢分盲区警示</span>
                  <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200">
                    请务必引起高度重视
                  </span>
                </h3>
                <p className="text-xs text-red-700">根据多轮面试记录交叉比对，候选人在不同企业面试中反复出现以下扣分点：</p>
              </div>
            </div>
            <span className="text-[11px] text-red-500 font-bold hidden sm:inline">
              致命程度高 · 直接影响 Offer 评级
            </span>
          </div>

          <div className="space-y-3.5">
            {report.repeatedWeaknessAlerts.map(alertItem => (
              <div
                key={alertItem.id}
                className={`p-4 rounded-xl border transition-all text-xs ${
                  alertItem.severity === 'critical'
                    ? 'bg-red-50/60 border-red-200 text-red-950'
                    : 'bg-amber-50/60 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        alertItem.severity === 'critical'
                          ? 'bg-red-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {alertItem.severity === 'critical' ? '🚨 致命红线' : '⚠️ 关键短板'}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">{alertItem.title}</h4>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">
                    频次: 已在 <span className="text-red-600 font-bold">{alertItem.occurrenceCount}</span> 场面试中被观测到
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed mb-2">
                  {alertItem.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 my-2 text-[11px]">
                  <div className="bg-white/80 p-2.5 rounded-lg border border-red-100">
                    <span className="font-bold text-red-800">观测场次：</span>
                    <span className="text-slate-700">{alertItem.observedInterviews.join('、')}</span>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-lg border border-red-100">
                    <span className="font-bold text-red-800">直接负面影响：</span>
                    <span className="text-slate-700">{alertItem.consequence}</span>
                  </div>
                </div>

                {/* Correction action */}
                <div className="mt-2.5 p-3 bg-white rounded-lg border border-emerald-200 shadow-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-950">立刻整改纠偏建议：</span>
                    <span className="text-emerald-900 leading-relaxed block mt-0.5">
                      {alertItem.correctionAdvice}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: Frequent Interview Questions Alert */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">高频面试问题穿透榜单</h3>
              <p className="text-xs text-slate-500">被多家大厂或多轮面试官反复考察的重灾区题型，须重点加强突击</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            高频必考核心
          </span>
        </div>

        <div className="space-y-3.5">
          {report?.frequentQuestions && report.frequentQuestions.length > 0 ? (
            report.frequentQuestions.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-amber-300 bg-white shadow-xs transition-all text-xs space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        考查频次: {item.frequency} 次
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{item.category}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">{item.question}</h4>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[11px] text-slate-400">平均掌握度:</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.avgMastery === 'low'
                          ? 'bg-red-100 text-red-700'
                          : item.avgMastery === 'medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.avgMastery === 'low' ? '较生疏 / 弱' : item.avgMastery === 'medium' ? '中等 / 需深化' : '掌握良好'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    涉及企业: {item.companies.join('、')}
                  </span>
                  <span>•</span>
                  <span>最近提问: {item.lastAskedDate}</span>
                </div>

                {/* Key knowledge points */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                  <div className="font-semibold text-slate-700 mb-1 text-[11px]">核心知识点考察链条:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.keyKnowledgePoints.map((kp, idx) => (
                      <span key={idx} className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px] text-slate-700">
                        {kp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recommended prep */}
                <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-200 text-[11px] text-blue-950 flex items-start gap-1.5">
                  <Target className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-blue-900">专项备战指导：</span>
                    <span>{item.recommendedPreparation}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs">
              暂无高频统计数据，请点击上方「重新全量深度诊断」
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: Overlooked Key Points & Trajectory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Overlooked points */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <EyeOff className="w-4 h-4 text-purple-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              多次未关注的关键盲区 (Overlooked Points)
            </h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {report?.overlookedKeyPoints && report.overlookedKeyPoints.length > 0 ? (
              report.overlookedKeyPoints.map((pt, i) => (
                <li key={i} className="p-2.5 bg-purple-50/50 rounded-xl border border-purple-100 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 flex-shrink-0"></span>
                  <span className="leading-relaxed">{pt}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-400 text-xs">暂无盲区归纳</li>
            )}
          </ul>
        </div>

        {/* Overall Trajectory */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              综合演进轨迹与通关指引
            </h3>
          </div>
          <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs text-emerald-950 leading-relaxed">
            {report?.overallImprovementTrajectory || '完成多轮面试后，系统将为您生成大厂通关轨迹。'}
          </div>
        </div>
      </div>
    </div>
  );
};
