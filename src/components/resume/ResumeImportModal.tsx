import React, { useState, useRef } from 'react';
import { ResumeData } from '../../types/resume';
import { scanUploadedFile, SecurityScanResult } from '../../utils/security';
import { parseResumeWithAi } from '../../services/geminiService';
import {
  Upload,
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
  GraduationCap
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
      if (file.name.endsWith('.json')) {
        textContent = await file.text();
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
        file.name.endsWith('.json') ? 'application/json' : 'text/markdown'
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">智能简历导入与结构化重构</h3>
              <p className="text-xs text-slate-500">支持 PDF/Word文本、Markdown、JSON 及格式安全排毒扫描</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Tabs */}
          {!parsedPreview && (
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => { setActiveTab('file'); resetState(); }}
                className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                  activeTab === 'file' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📂 导入已有文件 (MD / TXT / JSON)
              </button>
              <button
                onClick={() => { setActiveTab('paste'); resetState(); }}
                className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                  activeTab === 'paste' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📝 直接粘贴简历正文 / 格式文本
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2">
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
                className="border-2 border-dashed border-blue-200 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50/70 p-8 rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5"
              >
                <div className="p-3 bg-white rounded-2xl shadow-xs text-blue-600 border border-blue-100">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">
                    点击选择或拖拽简历文件到此处
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    支持 .md, .txt, .json, .docx文本导出 (最大 10MB)
                  </div>
                </div>
                <span className="px-3 py-1 bg-white border border-blue-200 text-blue-700 rounded-lg text-xs font-semibold shadow-2xs">
                  浏览本地文件
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md,.txt,.json,.docx,.pdf"
                  className="hidden"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>内置多层防病毒检查：自动扫描 PE 二进制头、危险脚本与恶意 Prompt 注入</span>
                </div>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">沙箱安全隔离</span>
              </div>
            </div>
          )}

          {/* Tab 2: Paste Raw Text */}
          {!parsedPreview && activeTab === 'paste' && (
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
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
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs leading-relaxed"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handlePasteSubmit}
                  disabled={isParsing || !pastedText.trim()}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  开始智能解析导入
                </button>
              </div>
            </div>
          )}

          {/* Scanning & Parsing Status */}
          {(isScanning || isParsing) && (
            <div className="p-8 bg-blue-50/50 rounded-2xl border border-blue-100 text-center space-y-3 animate-pulse">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <div className="font-bold text-slate-800 text-sm">
                {isScanning ? '正在执行文件安全排毒与防注入检查...' : 'Gemini AI 正在将原始简历结构化重构 (STAR提炼)...'}
              </div>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                {isScanning
                  ? '检验二进制头签名、可执行脚本及沙箱权限'
                  : '自动提取基本信息、量化工作成就、提炼核心技能栈并矫正格式'}
              </p>
            </div>
          )}

          {/* Parsed Result Preview */}
          {parsedPreview && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold">解析完成！已将原始信息提炼为标准简历结构</span>
                </div>
                <button
                  onClick={resetState}
                  className="text-emerald-700 hover:text-emerald-900 underline font-semibold text-[11px]"
                >
                  重新上传/导入
                </button>
              </div>

              {/* Preview Cards */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-800 text-sm">
                      {parsedPreview.personalInfo?.fullName || '未命名'}
                    </span>
                    <span className="text-slate-500 font-medium">
                      · {parsedPreview.personalInfo?.jobTitle || '期望岗位'}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px]">
                    {parsedPreview.personalInfo?.email} | {parsedPreview.personalInfo?.phone}
                  </span>
                </div>

                <div>
                  <span className="font-semibold text-slate-700">专业概述：</span>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">{parsedPreview.summary}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                      <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                      工作履历 ({parsedPreview.workExperience?.length || 0} 段)
                    </div>
                    <ul className="text-slate-600 space-y-1">
                      {parsedPreview.workExperience?.map((w, idx) => (
                        <li key={idx} className="truncate">
                          • {w.company} - {w.position} ({w.startDate} ~ {w.endDate})
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                      <Code2 className="w-3.5 h-3.5 text-blue-600" />
                      核心项目 ({parsedPreview.projects?.length || 0} 个)
                    </div>
                    <ul className="text-slate-600 space-y-1">
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
              <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200 space-y-2">
                <label className="font-bold text-slate-800 block">选择应用到当前系统的方式：</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className={`p-2.5 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                    mergeMode === 'replace' ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
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
                      <div className={`text-[11px] ${mergeMode === 'replace' ? 'text-blue-100' : 'text-slate-400'}`}>
                        将个人资料、工作与项目完全替换为导入的新数据
                      </div>
                    </div>
                  </label>

                  <label className={`p-2.5 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                    mergeMode === 'merge' ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
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
                      <div className={`text-[11px] ${mergeMode === 'merge' ? 'text-blue-100' : 'text-slate-400'}`}>
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
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
          >
            取消
          </button>

          {parsedPreview && (
            <button
              onClick={handleApplyImport}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20"
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
