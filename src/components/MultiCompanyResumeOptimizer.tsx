import React, { useState } from 'react';
import {
  Sparkles,
  Building2,
  GraduationCap,
  Briefcase,
  Plus,
  Trash2,
  Copy,
  Check,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  FileCheck,
  ChevronRight,
  Lightbulb
} from 'lucide-react';
import { ResumeData } from '../types/resume';
import { JobApplication } from '../types/job';
import {
  TargetCompanyJdInput,
  MultiCompanyComparisonResult,
  CompanySpecificOptimization
} from '../types/multiCompany';
import { requestMultiCompanyResumeOptimizer } from '../services/geminiService';

interface MultiCompanyResumeOptimizerProps {
  currentResume: ResumeData;
  jobApplications: JobApplication[];
  onUpdateResume?: (updated: ResumeData) => void;
}

export const MultiCompanyResumeOptimizer: React.FC<MultiCompanyResumeOptimizerProps> = ({
  currentResume,
  jobApplications,
  onUpdateResume,
}) => {
  // Preset default companies up to 3
  const [targetCompanies, setTargetCompanies] = useState<TargetCompanyJdInput[]>([
    {
      id: 'c-1',
      companyName: '字节跳动 (ByteDance)',
      position: '资深全栈工程师 / 架构师',
      jobDescription:
        '负责创作者工作台架构演进，高并发低延迟复杂 Web 交互，以及大模型生成式 AI 工作流探索。具备海量并发优化与复杂状态管理经验。',
      isHighPriority: true
    },
    {
      id: 'c-2',
      companyName: '阿里巴巴 (Alibaba)',
      position: '前端技术专家 (P7+)',
      jobDescription:
        '核心管控台微前端体系架构，高可用稳定性保障与研发工程效能工具链。要求深入分布式缓存与一致性，具备中台抽象能力。',
      isHighPriority: true
    },
    {
      id: 'c-3',
      companyName: '美团 (Meituan)',
      position: '前端架构师',
      jobDescription:
        '本地生活履约复杂业务线架构，离线化与首屏毫秒级加载优化，大规模团队代码规范与持续集成流水线建设。',
      isHighPriority: false
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MultiCompanyComparisonResult | null>(null);
  const [activeTabCompanyIdx, setActiveTabCompanyIdx] = useState(0);
  const [copiedPitchIndex, setCopiedPitchIndex] = useState<number | null>(null);
  const [appliedRewriteIds, setAppliedRewriteIds] = useState<Set<string>>(new Set());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUpdateCompany = (
    id: string,
    field: keyof TargetCompanyJdInput,
    value: any
  ) => {
    setTargetCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleAddCompany = () => {
    if (targetCompanies.length >= 3) return;
    const newComp: TargetCompanyJdInput = {
      id: `c-${Date.now()}`,
      companyName: '',
      position: '',
      jobDescription: '',
      isHighPriority: false
    };
    setTargetCompanies([...targetCompanies, newComp]);
  };

  const handleRemoveCompany = (id: string) => {
    if (targetCompanies.length <= 1) return;
    setTargetCompanies(targetCompanies.filter((c) => c.id !== id));
  };

  const handleFillFromApplication = (companyId: string, appId: string) => {
    const found = jobApplications.find((a) => a.id === appId);
    if (!found) return;
    setTargetCompanies((prev) =>
      prev.map((c) =>
        c.id === companyId
          ? {
              ...c,
              companyName: found.companyName,
              position: found.position,
              jobDescription: found.jobDescription || ''
            }
          : c
      )
    );
  };

  const handleRunOptimization = async () => {
    const valid = targetCompanies.filter(
      (c) => c.companyName.trim() && (c.position.trim() || c.jobDescription.trim())
    );
    if (valid.length === 0) {
      setErrorMsg('请至少完整填写一家目标公司的名称和职位/JD 描述');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await requestMultiCompanyResumeOptimizer({
        companies: valid,
        currentResume
      });
      setResult(res);
      setActiveTabCompanyIdx(0);
    } catch (err: any) {
      setErrorMsg(err.message || '优化分析服务繁忙，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPitch = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedPitchIndex(idx);
    setTimeout(() => setCopiedPitchIndex(null), 2000);
  };

  const handleApplyRewriteToResume = (rewriteText: string, rewriteId: string) => {
    if (!onUpdateResume) return;

    const currentExp = [...(currentResume.workExperience || [])];
    if (currentExp.length > 0) {
      const first = currentExp[0];
      const newHighlights = [rewriteText, ...(first.highlights || [])];
      currentExp[0] = { ...first, highlights: newHighlights };
      onUpdateResume({
        ...currentResume,
        workExperience: currentExp
      });
      setAppliedRewriteIds((prev) => new Set(prev).add(rewriteId));
    }
  };

  return (
    <div id="multi-company-optimizer-view" className="space-y-6 font-sans">
      {/* Top Banner (Apple HIG Theme) */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
            <Layers className="w-5 h-5" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            多公司 JD 定向精细化简历优化 (最多 3 家)
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
            工作经历 + 求学背景深度结合
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
          不同一线大厂对同一岗位的侧重点截然不同。添加您最期望上岸的 1-3 家目标公司
          JD，AI 将横向拆解各家面试与技术诉求，为您深度改写工作经历中的 STAR
          量化成果，并将您的求学学历、课程及学术背景包装出最具说服力的故事线！
        </p>
      </div>

      {/* Target Companies Configuration Box */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              已配置目标企业 ({targetCompanies.length} / 3)
            </h3>
          </div>
          {targetCompanies.length < 3 && (
            <button
              id="btn-add-company-slot"
              onClick={handleAddCompany}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>添加第 {targetCompanies.length + 1} 家目标企业</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {targetCompanies.map((comp, idx) => (
            <div
              key={comp.id}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/90 dark:border-slate-700/80 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                    目标企业 #{idx + 1}
                  </span>
                  {targetCompanies.length > 1 && (
                    <button
                      onClick={() => handleRemoveCompany(comp.id)}
                      className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-1 cursor-pointer"
                      title="移除该目标公司"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Quick select from pipeline */}
                {jobApplications.length > 0 && (
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                      从投递管理快速同步：
                    </label>
                    <select
                      onChange={(e) => handleFillFromApplication(comp.id, e.target.value)}
                      defaultValue=""
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#0071e3]"
                    >
                      <option value="" disabled>
                        -- 选择已保存投递目标 --
                      </option>
                      {jobApplications.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.companyName} - {j.position}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">公司名称</label>
                  <input
                    type="text"
                    placeholder="如：字节跳动"
                    value={comp.companyName}
                    onChange={(e) => handleUpdateCompany(comp.id, 'companyName', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#0071e3]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">目标岗位</label>
                  <input
                    type="text"
                    placeholder="如：资深前端架构师"
                    value={comp.position}
                    onChange={(e) => handleUpdateCompany(comp.id, 'position', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#0071e3]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    岗位 JD 要求
                  </label>
                  <textarea
                    rows={4}
                    placeholder="粘贴该职位的 JD 描述或核心任职要求..."
                    value={comp.jobDescription}
                    onChange={(e) =>
                      handleUpdateCompany(comp.id, 'jobDescription', e.target.value)
                    }
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#0071e3] resize-none font-mono"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-600 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-center pt-2">
          <button
            id="btn-run-multi-optimizer"
            onClick={handleRunOptimization}
            disabled={isLoading}
            className="flex items-center space-x-2 px-6 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>
              {isLoading
                ? 'AI 正在精细比对经历、求学背景与各公司 JD...'
                : `一键对 ${targetCompanies.length} 家公司进行精细化简历深度定制建议`}
            </span>
          </button>
        </div>
      </div>

      {/* Optimization Results */}
      {result && (
        <div className="space-y-5">
          {/* Overall Cross-Comparison Box */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-2.5 shadow-xs">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white">
              <TrendingUp className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              <h3 className="text-sm font-bold tracking-wide">
                多企业横向技术侧重点对比分析
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {result.overallCrossComparison}
            </p>
            {result.generalAdvice && (
              <div className="text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-start gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">求职专家总评建议：</span> {result.generalAdvice}
                </div>
              </div>
            )}
          </div>

          {/* Company Specific Tabs */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              {result.companies.map((comp, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTabCompanyIdx(idx)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTabCompanyIdx === idx
                      ? 'bg-[#0071e3] text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{comp.companyName}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 font-mono">
                    {comp.matchGrade}级 · {comp.matchScore}分
                  </span>
                </button>
              ))}
            </div>

            {/* Active Company Detailed Recommendation */}
            {result.companies[activeTabCompanyIdx] && (
              <div className="space-y-5 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
                {/* Company Header & Key Tech Flavors */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <span>{result.companies[activeTabCompanyIdx].companyName}</span>
                      <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                        ({result.companies[activeTabCompanyIdx].position})
                      </span>
                    </h4>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400">核心考察倾向：</span>
                      {result.companies[activeTabCompanyIdx].keyTechFlavors.map((fl, i) => (
                        <span
                          key={i}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium"
                        >
                          {fl}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400 dark:text-slate-500">岗位契合评级</div>
                      <div className="text-base font-bold text-slate-900 dark:text-white font-mono">
                        {result.companies[activeTabCompanyIdx].matchGrade} (
                        {result.companies[activeTabCompanyIdx].matchScore}分)
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1. Work Experience Targeted Rewrite */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white">
                    <Briefcase className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    <span>【工作经历精细化改写建议】</span>
                  </div>

                  {result.companies[activeTabCompanyIdx].workExperienceSuggestions.map(
                    (sug, idx) => {
                      const rewriteId = `rewrite-${activeTabCompanyIdx}-${idx}`;
                      const isApplied = appliedRewriteIds.has(rewriteId);

                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/90 dark:border-slate-700/80 space-y-3 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                              对应经历 / 项目：{sug.companyOrRole}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                              原先侧重点：{sug.originalFocus}
                            </span>
                          </div>

                          <div className="p-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1">
                                <Sparkles className="w-3.5 h-3.5 text-[#0071e3]" />
                                <span>针对 {result.companies[activeTabCompanyIdx].companyName} 的专属 STAR 改写范本：</span>
                              </span>
                              <button
                                onClick={() => handleApplyRewriteToResume(sug.recommendedRewrite, rewriteId)}
                                disabled={isApplied}
                                className={`flex items-center space-x-1 px-3 py-1 text-xs rounded-lg transition-colors font-semibold cursor-pointer ${
                                  isApplied
                                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                    : 'bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-xs'
                                }`}
                              >
                                {isApplied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>已加入简历首条经历</span>
                                  </>
                                ) : (
                                  <>
                                    <FileCheck className="w-3.5 h-3.5" />
                                    <span>一键采纳并应用到简历</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono">
                              {sug.recommendedRewrite}
                            </p>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                {/* 2. Education & Academic Packaging */}
                {result.companies[activeTabCompanyIdx].educationHighlightPackaging && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/90 dark:border-slate-700/80 space-y-2 text-xs">
                    <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white">
                      <GraduationCap className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                      <span>【学历与求学背景深度包装建议】</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {result.companies[activeTabCompanyIdx].educationHighlightPackaging}
                    </p>
                  </div>
                )}

                {/* 3. Elevator Pitch for this Company */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/90 dark:border-slate-700/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white">
                      <Award className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                      <span>针对本岗位的 30 秒电梯演讲 (Elevator Pitch)</span>
                    </div>
                    <button
                      onClick={() =>
                        handleCopyPitch(
                          result.companies[activeTabCompanyIdx].tailoredElevatorPitch,
                          activeTabCompanyIdx
                        )
                      }
                      className="flex items-center space-x-1 px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors font-medium text-xs cursor-pointer"
                    >
                      {copiedPitchIndex === activeTabCompanyIdx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>已复制</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>复制话术</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 italic leading-relaxed bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    "{result.companies[activeTabCompanyIdx].tailoredElevatorPitch}"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
