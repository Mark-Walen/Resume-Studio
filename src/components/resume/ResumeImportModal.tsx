import React, { useState, useRef } from 'react';
import { ResumeData } from '../../types/resume';
import { scanUploadedFile, SecurityScanResult } from '../../utils/security';
import { parseResumeWithAi } from '../../services/geminiService';
import { extractPdfText } from '../../utils/pdf';
import {
  FileInput,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Loader2,
  Check,
  Layers,
  UserCheck,
  Briefcase,
  Code2,
  GraduationCap,
  ClipboardPaste,
  FolderOpen,
  X
} from 'lucide-react';

interface ResumeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentResume: ResumeData;
  onImportSuccess: (importedData: ResumeData, mergeMode: 'replace' | 'merge') => void;
}

export const ResumeImportModal: React.FC<ResumeImportModalProps> = ({
  isOpen,
  onClose,
  currentResume,
  onImportSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'paste'>('file');
  const [pastedText, setPastedText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [securityResult, setSecurityResult] = useState<SecurityScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<ResumeData | null>(null);
  const [mergeMode, setMergeMode] = useState<'replace' | 'merge'>('replace');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('文件超过 10MB 限制，请压缩或换用文本版简历。');
      return;
    }
    setSelectedFile(file);
    setErrorMsg(null);
    setParsedPreview(null);
    setIsScanning(true);

    try {
      // 1. Virus & Injection Security Scan
      const scan = await scanUploadedFile(file);
      setSecurityResult(scan);
      setIsScanning(false);

      if (!scan.isSafe) {
        setErrorMsg(`安全扫描未通过：${scan.detectedThreats.join('; ')}`);
        return;
      }

      // 2. Read content safely
      let textContent = '';
      const lowerName = file.name.toLowerCase();
      if (lowerName.endsWith('.pdf')) {
        textContent = await extractPdfText(file);
      } else if (lowerName.endsWith('.json')) {
        const raw = await file.text();
        const decoded = JSON.parse(raw);
        const sharedResume = decoded?.format === 'resume-pilot.resume'
          ? decoded.resume
          : decoded;
        if (sharedResume?.personalInfo && Array.isArray(sharedResume?.workExperience)) {
          setParsedPreview(sharedResume as ResumeData);
          setIsParsing(false);
          return;
        }
        textContent = raw;
      } else {
        textContent = scan.sanitizedContent || (await file.text());
      }

      if (!textContent || textContent.trim().length === 0) {
        setErrorMsg('文件内容为空，无法提取简历信息。');
        return;
      }

      // 3. AI Smart Resume Parsing
      setIsParsing(true);
      const parsed = await parseResumeWithAi(
        textContent,
        lowerName.endsWith('.json')
          ? 'application/json'
          : lowerName.endsWith('.pdf')
            ? 'application/pdf-extracted-text'
            : 'text/markdown'
      );
      setParsedPreview(parsed);
      setIsParsing(false);
    } catch (err: any) {
      setIsScanning(false);
      setIsParsing(false);
      setErrorMsg(err.message || '文件读取或解析失败，请检查文件编码或直接粘贴文本');
    }
  };

  const handlePasteSubmit = async () => {
    if (!pastedText.trim() || pastedText.trim().length < 20) {
      setErrorMsg('请粘贴较为完整的简历文字内容（至少 20 字符）');
      return;
    }

    setErrorMsg(null);
    setParsedPreview(null);
    setIsParsing(true);

    try {
      const parsed = await parseResumeWithAi(pastedText, 'text/plain');
      setParsedPreview(parsed);
      setIsParsing(false);
    } catch (err: any) {
      setIsParsing(false);
      setErrorMsg(err.message || '解析失败，请检查网络或配置 API Key');
    }
  };

  const handleApplyImport = () => {
    if (!parsedPreview) return;
    onImportSuccess(parsedPreview, mergeMode);
    onClose();
  };

  const resetState = () => {
    setSelectedFile(null);
    setSecurityResult(null);
    setParsedPreview(null);
    setErrorMsg(null);
    setPastedText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-950/80 text-[#0071e3] dark:text-blue-300 rounded-xl">
              <FileInput className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">智能简历导入与结构化重构</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">支持 PDF、Markdown、TXT 和 Resume Pilot 共享包</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-lg leading-none cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Tabs */}
          {!parsedPreview && (
            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                onClick={() => { setActiveTab('file'); resetState(); }}
                className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === 'file'
                    ? 'bg-white dark:bg-slate-700 text-[#0071e3] dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="inline-flex items-center justify-center gap-1.5"><FolderOpen className="w-3.5 h-3.5" />导入文件</span>
              </button>
              <button
                onClick={() => { setActiveTab('paste'); resetState(); }}
                className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === 'paste'
                    ? 'bg-white dark:bg-slate-700 text-[#0071e3] dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="inline-flex items-center justify-center gap-1.5"><ClipboardPaste className="w-3.5 h-3.5" />粘贴简历正文</span>
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {/* Tab 1: File Upload */}
          {!parsedPreview && activeTab === 'file' && (
            <div className="space-y-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileSelect(e.dataTransfer.files[0]);
                  }
                }}
                className="border-2 border-dashed border-blue-200 dark:border-blue-800/80 hover:border-blue-500 dark:hover:border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50/70 dark:hover:bg-blue-950/30 p-8 rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5"
              >
                <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xs text-[#0071e3] dark:text-blue-400 border border-blue-100 dark:border-slate-700">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    点击选择或拖拽简历文件到此处
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    支持 PDF、Markdown、TXT 与 Resume Pilot 共享 JSON（最大 10MB）
                  </div>
                </div>
                <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-[#0071e3] dark:text-blue-300 rounded-lg text-xs font-semibold shadow-2xs">
                  浏览本地文件
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md,.txt,.json,.pdf"
                  className="hidden"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>内置多层防病毒检查：自动扫描 PE 二进制头、危险脚本与恶意 Prompt 注入</span>
                </div>
                <span className="font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">沙箱安全隔离</span>
              </div>
            </div>
          )}

          {/* Tab 2: Paste Raw Text */}
          {!parsedPreview && activeTab === 'paste' && (
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  粘贴旧简历、脉脉/BOSS复制的经历或任何纯文本：
                </label>
                <textarea
                  rows={8}
                  placeholder={`例如：
张三 | 资深前端架构师 | 13800000000 | zhangsan@example.com
个人总结：8年互联网高并发大厂经历，擅长React架构与全链路性能治理...
工作经历：
2022.03-至今 某核心科技 资深研发
- 主导千万级核心电商前端架构演化，首屏加载降低40%
- 搭建团队Monorepo基建与发布流水线...`}
                  value={pastedText}
                  onChange={e => setPastedText(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#0071e3] font-mono text-xs leading-relaxed"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handlePasteSubmit}
                  disabled={isParsing || !pastedText.trim()}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  开始智能解析导入
                </button>
              </div>
            </div>
          )}

          {/* Scanning & Parsing Status */}
          {(isScanning || isParsing) && (
            <div className="p-8 bg-blue-50/50 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/60 text-center space-y-3 animate-pulse">
              <Loader2 className="w-8 h-8 text-[#0071e3] dark:text-blue-400 animate-spin mx-auto" />
              <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                {isScanning ? '正在执行文件安全排毒与防注入检查...' : 'Gemini AI 正在将原始简历结构化重构 (STAR提炼)...'}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {isScanning
                  ? '检验二进制头签名、可执行脚本及沙箱权限'
                  : '自动提取基本信息、量化工作成就、提炼核心技能栈并矫正格式'}
              </p>
            </div>
          )}

          {/* Parsed Result Preview */}
          {parsedPreview && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-bold">解析完成！已将原始信息提炼为标准简历结构</span>
                </div>
                <button
                  onClick={resetState}
                  className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 underline font-semibold text-[11px] cursor-pointer"
                >
                  重新上传/导入
                </button>
              </div>

              {/* Preview Cards */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#0071e3] dark:text-blue-400" />
                    <span className="font-bold text-slate-800 dark:text-white text-sm">
                      {parsedPreview.personalInfo?.fullName || '未命名'}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      · {parsedPreview.personalInfo?.jobTitle || '期望岗位'}
                    </span>
                  </div>
                  <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                    {parsedPreview.personalInfo?.email} | {parsedPreview.personalInfo?.phone}
                  </span>
                </div>

                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">专业概述：</span>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{parsedPreview.summary}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                      <Briefcase className="w-3.5 h-3.5 text-[#0071e3] dark:text-blue-400" />
                      工作履历 ({parsedPreview.workExperience?.length || 0} 段)
                    </div>
                    <ul className="text-slate-600 dark:text-slate-400 space-y-1">
                      {parsedPreview.workExperience?.map((w, idx) => (
                        <li key={idx} className="truncate">
                          • {w.company} - {w.position} ({w.startDate} ~ {w.endDate})
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                      <Code2 className="w-3.5 h-3.5 text-[#0071e3] dark:text-blue-400" />
                      核心项目 ({parsedPreview.projects?.length || 0} 个)
                    </div>
                    <ul className="text-slate-600 dark:text-slate-400 space-y-1">
                      {parsedPreview.projects?.map((p, idx) => (
                        <li key={idx} className="truncate">
                          • {p.name} ({p.role})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Merge Mode Selector */}
              <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900/60 space-y-2">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">选择应用到当前系统的方式：</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className={`p-2.5 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                    mergeMode === 'replace'
                      ? 'bg-[#0071e3] text-white border-[#0071e3] shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}>
                    <input
                      type="radio"
                      name="mergeMode"
                      value="replace"
                      checked={mergeMode === 'replace'}
                      onChange={() => setMergeMode('replace')}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-bold">全量替换覆盖当前简历</div>
                      <div className={`text-[11px] ${mergeMode === 'replace' ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                        将个人资料、工作与项目完全替换为导入的新数据
                      </div>
                    </div>
                  </label>

                  <label className={`p-2.5 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                    mergeMode === 'merge'
                      ? 'bg-[#0071e3] text-white border-[#0071e3] shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}>
                    <input
                      type="radio"
                      name="mergeMode"
                      value="merge"
                      checked={mergeMode === 'merge'}
                      onChange={() => setMergeMode('merge')}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-bold">增量智能合并</div>
                      <div className={`text-[11px] ${mergeMode === 'merge' ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                        保留您当前的联系方式，将新工作与项目追加到列表中
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl cursor-pointer"
          >
            取消
          </button>

          {parsedPreview && (
            <button
              onClick={handleApplyImport}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              确认载入到工作区
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
