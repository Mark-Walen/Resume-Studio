import React, { useState } from 'react';
import { ResumeData } from '../../types/resume';
import { JobApplication } from '../../types/job';
import { ParsedJdInfo, JdMatchAnalysis } from '../../types/proxy';
import { fetchAndAnalyzeJd } from '../../services/geminiService';
import { sanitizeExternalUrl } from '../../utils/security';
import {
  Globe,
  Link,
  Sparkles,
  Loader2,
  Check,
  AlertCircle,
  Building2,
  MapPin,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  Send,
  Copy,
  ExternalLink,
  FileCheck,
  BookmarkPlus,
  HelpCircle,
  X,
  ClipboardPaste,
  Monitor,
  Server
} from 'lucide-react';

interface JobSiteProxyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentResume: ResumeData;
  onAddJob: (job: JobApplication) => void;
}

export const JobSiteProxyModal: React.FC<JobSiteProxyModalProps> = ({
  isOpen,
  onClose,
  currentResume,
  onAddJob
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [rawJdInput, setRawJdInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<{
    parsedJd: ParsedJdInfo;
    matchAnalysis: JdMatchAnalysis;
    extractionMethod?: 'pasted-text' | 'http' | 'browser';
    sourceTitle?: string;
  } | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);
  const [targetStatus, setTargetStatus] = useState<'wishlist' | 'applied'>('wishlist');

  if (!isOpen) return null;

  const handleFetchAndAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!urlInput.trim() && !rawJdInput.trim()) {
      setErrorMsg('请提供招聘网页链接或直接粘贴岗位 JD 描述');
      return;
    }

    setErrorMsg(null);
    setResult(null);
    setIsLoading(true);
    setIsAddedSuccess(false);

    try {
      const data = await fetchAndAnalyzeJd({
        url: urlInput.trim() || undefined,
        rawJdText: rawJdInput.trim() || undefined,
        currentResume
      });
      setResult(data);
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || '抓取或分析岗位信息失败，请检查网络或在右上角配置通用 API Key');
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) throw new Error('剪贴板中没有可用文本。');
      setRawJdInput(text.slice(0, 50_000));
      setErrorMsg(null);
      setResult(null);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : '无法读取剪贴板，请允许剪贴板权限或手动粘贴。');
    }
  };

  const handleOneClickAddToWishlist = () => {
    if (!result) return;
    const { parsedJd, matchAnalysis } = result;

    const newJob: JobApplication = {
      id: 'job-proxy-' + Date.now(),
      companyName: parsedJd.companyName || '目标招聘企业',
      position: parsedJd.position || '期望岗位',
      salaryExpectation: parsedJd.salaryRange || '面议',
      location: parsedJd.location || '待定',
      status: targetStatus,
      priority: matchAnalysis.matchScore >= 85 ? 'high' : 'medium',
      source: urlInput ? (urlInput.includes('zhipin') ? 'Boss直聘' : urlInput.includes('lagou') ? '拉勾招聘' : urlInput.includes('liepin') ? '猎聘' : '网页代理导入') : 'JD直接解析',
      jobDescription: `【核心要求与职责】：\n${parsedJd.jobDescription}\n\n【必备技能】：${parsedJd.requiredSkills.join('、')}\n\n【匹配度得分】：${matchAnalysis.matchScore} (${matchAnalysis.matchGrade})\n\n【AI 建议】：\n${matchAnalysis.targetedResumeAdvice.join('\n')}`,
      wishlistTargetDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      appliedDate: targetStatus === 'applied' ? new Date().toISOString().split('T')[0] : undefined,
      notes: `【AI 自荐信】：\n${matchAnalysis.customizedCoverLetter}`,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    onAddJob(newJob);
    setIsAddedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleCopyCoverLetter = () => {
    if (!result?.matchAnalysis?.customizedCoverLetter) return;
    navigator.clipboard.writeText(result.matchAnalysis.customizedCoverLetter);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-[#0071e3] rounded-xl border border-blue-100 dark:border-blue-900">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                招聘网站代理抓取 · JD 深度分析与一键投递
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                输入职位网页链接或粘贴 JD，AI 自动提取要求、评估匹配度并生成定制自荐信
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Input Form */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-[#0071e3]" />
                目标岗位招聘网址 (支持主流招聘平台与官网直聘)：
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://www.zhipin.com/job_detail/... 或 https://..."
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3] font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleFetchAndAnalyze()}
                  disabled={isLoading || (!urlInput.trim() && !rawJdInput.trim())}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex-shrink-0 cursor-pointer"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isLoading ? '代理抓取中...' : '代理抓取并分析'}
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-400 text-[11px]">
                    浏览器辅助导入 / 直接粘贴 JD：
                  </label>
                  <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">遇到登录或验证码时，在原页面复制可见职位内容，再从剪贴板导入。</p>
                </div>
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 hover:border-[#0071e3] hover:text-[#0071e3] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <ClipboardPaste className="h-3.5 w-3.5" />
                  读取剪贴板
                </button>
                {(urlInput || rawJdInput) && (
                  <button
                    onClick={() => { setUrlInput(''); setRawJdInput(''); setResult(null); }}
                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    清空输入
                  </button>
                )}
              </div>
              <textarea
                rows={3}
                placeholder="例如：职位描述：负责核心业务前端架构设计，要求精通 React / TypeScript，5年以上经验..."
                value={rawJdInput}
                onChange={e => setRawJdInput(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3] font-mono"
              />
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="p-8 bg-blue-50/50 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900 text-center space-y-3 animate-pulse">
              <Loader2 className="w-8 h-8 text-[#0071e3] animate-spin mx-auto" />
              <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                正在通过服务器代理获取岗位数据并进行 AI 人岗匹配诊断...
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                解析核心职责、必备技能、计算候选人契合度并撰写针对性自荐信
              </p>
            </div>
          )}

          {/* Analysis Result */}
          {result && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
                {result.extractionMethod === 'browser' ? <Monitor className="h-4 w-4" /> : <Server className="h-4 w-4" />}
                <span className="font-semibold">
                  {result.extractionMethod === 'browser' ? '已通过云端 Chromium 读取页面' : result.extractionMethod === 'pasted-text' ? '已使用浏览器辅助导入内容' : '已通过服务器读取静态页面'}
                </span>
                {result.sourceTitle && <span className="truncate text-emerald-700/80 dark:text-emerald-400/80">· {result.sourceTitle}</span>}
              </div>
              {/* Job Header Card */}
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 dark:text-white text-base">
                      {result.parsedJd.position}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/50 text-[#0071e3] dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {result.parsedJd.companyName}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px]">
                    {result.parsedJd.salaryRange && (
                      <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5">
                        <DollarSign className="w-3.5 h-3.5" />
                        {result.parsedJd.salaryRange}
                      </span>
                    )}
                    {result.parsedJd.location && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {result.parsedJd.location}
                      </span>
                    )}
                    {result.parsedJd.experienceYears && (
                      <span>经验：{result.parsedJd.experienceYears}</span>
                    )}
                    {result.parsedJd.education && (
                      <span>学历：{result.parsedJd.education}</span>
                    )}
                  </div>
                </div>

                {/* Score badge */}
                <div className="flex items-center gap-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-blue-950/50 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-medium">人岗匹配度</div>
                    <div className="text-xl font-black text-[#0071e3] dark:text-blue-400 leading-none">
                      {result.matchAnalysis.matchScore}分
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-[#0071e3] text-white font-bold text-xs rounded-lg shadow-xs">
                    {result.matchAnalysis.matchGrade}
                  </div>
                </div>
              </div>

              {/* Responsibilities & Skills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-[#0071e3]" />
                    岗位职责与核心任务：
                  </div>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-300 pl-4 list-disc">
                    {result.parsedJd.responsibilities.map((r, idx) => (
                      <li key={idx} className="leading-relaxed">{r}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    候选人核心优势契合点：
                  </div>
                  <ul className="space-y-1 text-emerald-900 dark:text-emerald-300 pl-4 list-disc">
                    {result.matchAnalysis.matchingStrengths.map((s, idx) => (
                      <li key={idx} className="leading-relaxed">{s}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Gaps & Resume Advice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/60 space-y-1.5">
                  <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    潜在短板与面试深挖风险提示：
                  </div>
                  <ul className="space-y-1 text-amber-950 dark:text-amber-200 pl-4 list-disc">
                    {result.matchAnalysis.potentialGaps.map((g, idx) => (
                      <li key={idx} className="leading-relaxed">{g}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900/60 space-y-1.5">
                  <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#0071e3]" />
                    投递该岗位的简历优化微调建议：
                  </div>
                  <ul className="space-y-1 text-blue-950 dark:text-blue-200 pl-4 list-disc">
                    {result.matchAnalysis.targetedResumeAdvice.map((a, idx) => (
                      <li key={idx} className="leading-relaxed">{a}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommended Interview Prep */}
              {result.matchAnalysis.recommendedInterviewPrep && result.matchAnalysis.recommendedInterviewPrep.length > 0 && (
                <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-900/60 space-y-1.5">
                  <div className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    面试前必须突击的针对性考点：
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {result.matchAnalysis.recommendedInterviewPrep.map((prep, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 rounded-lg font-medium text-[11px]">
                        🎯 {prep}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tailored Cover Letter / Greeting */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-[#0071e3]" />
                    针对该岗位的定制自荐信：
                  </div>
                  <button
                    onClick={handleCopyCoverLetter}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {isCopied ? '已复制自荐信' : '复制自荐文案'}
                  </button>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 leading-relaxed font-mono whitespace-pre-line text-[11.5px]">
                  {result.matchAnalysis.customizedCoverLetter}
                </div>
              </div>

              {/* One-Click Wishlist & Apply Section */}
              <div className="p-4 bg-blue-50/70 dark:bg-slate-800 rounded-2xl border border-blue-200 dark:border-slate-700 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">一键投递预投递目标管理</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                      将该岗位自动写入投递看板追踪，随时查看面试进展与定制笔记
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTargetStatus('wishlist')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        targetStatus === 'wishlist'
                          ? 'bg-[#0071e3] text-white border-[#0071e3]'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      加入预投递目标
                    </button>
                    <button
                      onClick={() => setTargetStatus('applied')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        targetStatus === 'applied'
                          ? 'bg-[#0071e3] text-white border-[#0071e3]'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      直接标记为已投递
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-blue-100 dark:border-slate-700">
                  {sanitizeExternalUrl(urlInput) ? (
                    <a
                      href={sanitizeExternalUrl(urlInput)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#0071e3] hover:underline font-semibold text-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      在新窗口打开原招聘页面
                    </a>
                  ) : <div />}

                  <button
                    onClick={handleOneClickAddToWishlist}
                    disabled={isAddedSuccess}
                    className="inline-flex items-center gap-1.5 px-6 py-2 bg-[#0071e3] hover:bg-[#0077ed] disabled:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    {isAddedSuccess ? <Check className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
                    {isAddedSuccess ? '已成功添加到看板！' : '一键加入预投递看板'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
