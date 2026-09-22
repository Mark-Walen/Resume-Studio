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
      companyName: '大疆创新（DJI）',
      position: '嵌入式软件工程师（无线通信方向）',
      jobDescription:
        '负责 MCU/RTOS 平台、无线通信协议、底层驱动和系统稳定性开发，要求熟悉 C/C++、FreeRTOS、BLE 与软硬件联调。',
      isHighPriority: true
    },
    {
      id: 'c-2',
      companyName: '乐鑫科技（Espressif）',
      position: 'IoT 嵌入式软件工程师',
      jobDescription:
        '负责 IoT 芯片 SDK、驱动、网络连接、低功耗、系统组件和开发工具，要求具备 RTOS 与工程化能力。',
      isHighPriority: true
    },
    {
      id: 'c-3',
      companyName: 'Nordic Semiconductor',
      position: 'Embedded Software Engineer',
      jobDescription:
        '负责低功耗无线 SoC、BLE 协议栈、RTOS、驱动、Bootloader 和开发者工具相关研发。'
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MultiCompanyComparisonResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTabCompanyIdx, setActiveTabCompanyIdx] = useState(0);
  const [copiedPitchIndex, setCopiedPitchIndex] = useState<number | null>(null);
  const [appliedRewriteIds, setAppliedRewriteIds] = useState<Set<string>>(new Set());

  const handleAddCompany = () => {
    if (targetCompanies.length >= 3) return;
    setTargetCompanies([
      ...targetCompanies,
      {
        id: `c-${Date.now()}`,
        companyName: '',
        position: '',
        jobDescription: ''
      }
    ]);
  };

  const handleRemoveCompany = (id: string) => {
    if (targetCompanies.length <= 1) return;
    setTargetCompanies(targetCompanies.filter((c) => c.id !== id));
  };

  const handleUpdateCompany = (id: string, field: keyof TargetCompanyJdInput, val: any) => {
    setTargetCompanies(
      targetCompanies.map((c) => (c.id === id ? { ...c, [field]: val } : c))
    );
  };

  const handleFillFromApplication = (companyId: string, appId: string) => {
    const app = jobApplications.find((j) => j.id === appId);
    if (!app) return;
    setTargetCompanies(
      targetCompanies.map((c) =>
        c.id === companyId
          ? {
              ...c,
              companyName: app.companyName,
              position: app.position,
              jobDescription: app.jobDescription || ''
            }
          : c
      )
    );
  };

  const handleRunOptimization = async () => {
    const valid = targetCompanies.filter((c) => c.companyName.trim());
    if (valid.length === 0) {
      setErrorMsg('请至少填写 1 家期望公司的名称与 JD 信息');
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

    // Prepend or enrich first work experience bullet points
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
    <div id="multi-company-optimizer-view" className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-blue-600">
            <Layers className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            多公司 JD 精细化简历优化 (最多支持 3 家)
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-medium">
            工作经历 + 求学经历深度结合
          </span>
        </div>
        <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
          不同一线大厂对同一岗位的侧重点截然不同。添加您最期望上岸的 1-3 家目标公司
          JD，AI 将横向拆解各家面试与技术诉求，为您深度改写工作经历中的 STAR
          量化成果，并将您的求学学历、课程及学术背景包装出最具说服力的故事线！
        </p>
      </div>

      {/* Target Companies Configuration Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              已配置目标企业 ({targetCompanies.length} / 3)
            </h3>
          </div>
          {targetCompanies.length < 3 && (
            <button
              id="btn-add-company-slot"
              onClick={handleAddCompany}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors border border-slate-200"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>添加第 {targetCompanies.length + 1} 家目标企业</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {targetCompanies.map((comp, idx) => (
            <div
              key={comp.id}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5 flex flex-col justify-between relative group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 font-mono">
                    目标企业 #{idx + 1}
                  </span>
                  {targetCompanies.length > 1 && (
                    <button
                      onClick={() => handleRemoveCompany(comp.id)}
                      className="text-slate-500 hover:text-red-600 p-1"
                      title="移除该目标公司"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Quick select from pipeline */}
                {jobApplications.length > 0 && (
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      从投递管理快速同步：
                    </label>
                    <select
                      onChange={(e) => handleFillFromApplication(comp.id, e.target.value)}
                      defaultValue=""
                      className="w-full px-2.5 py-1 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
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
                  <label className="block text-xs font-medium text-slate-700 mb-1">公司名称</label>
                  <input
                    type="text"
                    placeholder="如：大疆创新"
                    value={comp.companyName}
                    onChange={(e) => handleUpdateCompany(comp.id, 'companyName', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">目标岗位</label>
                  <input
                    type="text"
                    placeholder="如：嵌入式软件工程师"
                    value={comp.position}
                    onChange={(e) => handleUpdateCompany(comp.id, 'position', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    岗位 JD (核心要求与职责)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="粘贴该职位的 JD 描述或核心任职要求..."
                    value={comp.jobDescription}
                    onChange={(e) =>
                      handleUpdateCompany(comp.id, 'jobDescription', e.target.value)
                    }
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 resize-none font-mono"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-700">
            {errorMsg}
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-center pt-2">
          <button
            id="btn-run-multi-optimizer"
            onClick={handleRunOptimization}
            disabled={isLoading}
            className="flex items-center space-x-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-sm transition-all"
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
        <div className="space-y-6">
          {/* Overall Cross-Comparison Box */}
          <div className="p-6 rounded-2xl bg-blue-50 border border-blue-200 space-y-3 shadow-sm">
            <div className="flex items-center space-x-2 text-blue-600">
              <TrendingUp className="w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-900 tracking-wide">
                多企业横向技术侧重点对比分析
              </h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {result.overallCrossComparison}
            </p>
            {result.generalAdvice && (
              <div className="text-xs text-amber-700/90 pt-2 border-t border-indigo-500/20 flex items-start gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span><span className="font-semibold">求职专家总评建议：</span> {result.generalAdvice}</span>
              </div>
            )}
          </div>

          {/* Company Specific Tabs */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
              {result.companies.map((comp, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTabCompanyIdx(idx)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTabCompanyIdx === idx
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{comp.companyName}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20 font-mono">
                    {comp.matchGrade}级 · {comp.matchScore}分
                  </span>
                </button>
              ))}
            </div>

            {/* Active Company Detailed Recommendation */}
            {result.companies[activeTabCompanyIdx] && (
              <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200">
                {/* Company Header & Key Tech Flavors */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                      <span>{result.companies[activeTabCompanyIdx].companyName}</span>
                      <span className="text-xs font-normal text-slate-500">
                        ({result.companies[activeTabCompanyIdx].position})
                      </span>
                    </h4>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-slate-500">核心考察倾向：</span>
                      {result.companies[activeTabCompanyIdx].keyTechFlavors.map((fl, i) => (
                        <span
                          key={i}
                          className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/10 text-blue-700 border border-indigo-500/20"
                        >
                          {fl}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-[11px] text-slate-500">针对该岗位契合评级</div>
                      <div className="text-base font-extrabold text-amber-600 font-mono">
                        {result.companies[activeTabCompanyIdx].matchGrade} (
                        {result.companies[activeTabCompanyIdx].matchScore}分)
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1. Work Experience Targeted Rewrite */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    <span>【工作经历精细化改写建议】（突出该企业期望的量化指标）</span>
                  </div>

                  {result.companies[activeTabCompanyIdx].workExperienceSuggestions.map(
                    (sug, idx) => {
                      const rewriteId = `rewrite-${activeTabCompanyIdx}-${idx}`;
                      const isApplied = appliedRewriteIds.has(rewriteId);

                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-700 font-mono">
                              对应经历 / 项目：{sug.companyOrRole}
                            </span>
                            <span className="text-slate-500 text-[11px]">
                              原先侧重点：{sug.originalFocus}
                            </span>
                          </div>

                          <div className="p-3 bg-emerald-50 border border-emerald-500/30 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>针对 {result.companies[activeTabCompanyIdx].companyName} 的专属 STAR 改写范本：</span>
                              </span>
                              <button
                                onClick={() => handleApplyRewriteToResume(sug.recommendedRewrite, rewriteId)}
                                disabled={isApplied}
                                className={`flex items-center space-x-1 px-2.5 py-1 text-xs rounded-lg transition-colors ${
                                  isApplied
                                    ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/40'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
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
                            <p className="text-xs text-emerald-700/90 leading-relaxed font-mono">
                              {sug.recommendedRewrite}
                            </p>
                          </div>

                          <div className="text-xs text-slate-500">
                            <span className="text-blue-600 font-medium">改写收益分析：</span>
                            {sug.reason}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                {/* 2. Education & Academic Background Framing */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
                    <GraduationCap className="w-4 h-4 text-purple-400" />
                    <span>【求学经历与学术背景精细化包装】</span>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-purple-300">
                        求学背景：{result.companies[activeTabCompanyIdx].educationFramingAdvice?.schoolAndDegree}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 leading-relaxed">
                      <span className="text-purple-300 font-semibold">求学叙事策略：</span>
                      {result.companies[activeTabCompanyIdx].educationFramingAdvice?.framingStrategy}
                    </div>

                    {result.companies[activeTabCompanyIdx].educationFramingAdvice?.recommendedCourseHighlights && (
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-slate-500">建议突出的课程与课题：</span>
                        {result.companies[activeTabCompanyIdx].educationFramingAdvice.recommendedCourseHighlights.map(
                          (c, i) => (
                            <span
                              key={i}
                              className="text-[11px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono"
                            >
                              {c}
                            </span>
                          )
                        )}
                      </div>
                    )}

                    <div className="text-xs text-purple-200/90 leading-relaxed bg-purple-900/30 p-2.5 rounded-lg border border-purple-500/20">
                      <span className="font-semibold text-purple-300 inline-flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" />面试学术到实战故事线：</span>
                      <span className="ml-1">
                        {result.companies[activeTabCompanyIdx].educationFramingAdvice?.academicStorytelling}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Essential Keywords & Tailored Pitch */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Essential Keywords */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="text-xs font-bold text-slate-700">必填高频技术关键词：</div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.companies[activeTabCompanyIdx].essentialKeywords.map((kw, i) => (
                        <span
                          key={i}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 text-blue-700 border border-indigo-500/30 font-mono"
                        >
                          +{kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tailored Elevator Pitch */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                        <span>30秒专属打招呼 / 自荐话术</span>
                        <button
                          onClick={() =>
                            handleCopyPitch(
                              result.companies[activeTabCompanyIdx].tailoredElevatorPitch,
                              activeTabCompanyIdx
                            )
                          }
                          className="flex items-center space-x-1 text-[11px] text-blue-600 hover:text-blue-700"
                        >
                          {copiedPitchIndex === activeTabCompanyIdx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">已复制</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>复制话术</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-mono">
                        "{result.companies[activeTabCompanyIdx].tailoredElevatorPitch}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
