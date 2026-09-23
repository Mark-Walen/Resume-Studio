import React, { useState, useRef, useEffect } from 'react';
import { ResumeData } from '../../types/resume';
import { requestGenerateResume } from '../../services/geminiService';
import { scanUploadedFile, SecurityScanResult } from '../../utils/security';
import { Mic, MicOff, Upload, ShieldCheck, ShieldAlert, Sparkles, X, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AiResumeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingResume: ResumeData;
  onGenerated: (newResume: ResumeData) => void;
  onOpenApiKeySettings: () => void;
}

export const AiResumeGeneratorModal: React.FC<AiResumeGeneratorModalProps> = ({
  isOpen,
  onClose,
  existingResume,
  onGenerated,
  onOpenApiKeySettings,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // File Upload & Anti-Virus Security Scanning
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    file: File;
    scanResult: SecurityScanResult;
  }>>([]);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Speech Recognition Reference
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check SpeechRecognition browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'zh-CN';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript) {
          setPrompt(prev => prev ? `${prev} ${currentTranscript}` : currentTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  if (!isOpen) return null;

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert('当前浏览器未原生支持 Web Speech 语音听写，建议直接文本输入，或使用 Chrome/Edge 浏览器。');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsScanning(true);
    setErrorMessage(null);

    const newScanned: Array<{ file: File; scanResult: SecurityScanResult }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Run security and virus inspection
      const scanResult = await scanUploadedFile(file);
      newScanned.push({ file, scanResult });
    }

    setUploadedFiles(prev => [...prev, ...newScanned]);
    setIsScanning(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && uploadedFiles.length === 0) {
      setErrorMessage('请输入经历描述、进行语音口述，或上传辅助材料。');
      return;
    }

    // Check if any uploaded file was blocked
    const hasBlocked = uploadedFiles.some(f => !f.scanResult.isSafe);
    if (hasBlocked) {
      setErrorMessage('已检测并拦截恶意或高危文件，请先移除未通过安全杀毒扫描的文件后再生成。');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    // Collect safe text from uploaded files
    const auxiliaryText = uploadedFiles
      .filter(f => f.scanResult.isSafe && f.scanResult.sanitizedContent)
      .map(f => `--- 文件: ${f.scanResult.fileName} ---\n${f.scanResult.sanitizedContent}`)
      .join('\n\n');

    try {
      const partial = await requestGenerateResume({
        prompt: prompt.trim(),
        existingResume,
        auxiliaryText
      });

      const merged: ResumeData = {
        ...existingResume,
        title: partial.title || existingResume.title,
        lastModified: new Date().toISOString().split('T')[0],
        personalInfo: {
          ...existingResume.personalInfo,
          ...(partial.personalInfo || {})
        },
        summary: partial.summary || existingResume.summary,
        skills: (partial.skills && partial.skills.length > 0) ? (partial.skills as any) : existingResume.skills,
        workExperience: (partial.workExperience && partial.workExperience.length > 0) ? (partial.workExperience as any) : existingResume.workExperience,
        projects: (partial.projects && partial.projects.length > 0) ? (partial.projects as any) : existingResume.projects,
        education: (partial.education && partial.education.length > 0) ? (partial.education as any) : existingResume.education,
      };

      onGenerated(merged);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || '生成简历时发生异常，请重试。');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-blue-950/40 dark:to-indigo-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0071e3] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">AI 智能简历生成工坊</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">支持语音口述、文字描述与多源材料提取，全流程防病毒与安全过滤</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Quick Guidance */}
          <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/70 dark:border-slate-700/60 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[#0071e3] dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-slate-900 dark:text-white">使用技巧：</span>
              <span>您可以直接用语音或文字口述：“我叫张三，求职前端架构师，过去三年在美团负责外卖商家端系统重构，用 React 19 和 Vite 提升了 50% 构建效率...”，大模型将自动按照大厂简历规范转化为精炼排版。</span>
            </div>
          </div>

          {/* Voice & Text Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span>经历与求职意向描述</span>
                {isListening && (
                  <span className="flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 font-semibold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400"></span> 正在实时语音识别...
                  </span>
                )}
              </label>
              <button
                type="button"
                onClick={toggleVoiceRecording}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isListening
                    ? 'bg-red-500 text-white shadow-sm ring-2 ring-red-300'
                    : 'bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60'
                }`}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                {isListening ? '点击结束听写' : '开启语音输入'}
              </button>
            </div>

            <textarea
              rows={5}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="请输入或语音描述您的教育背景、工作历程、主导项目、核心突破、技术专长及期望岗位..."
              className="w-full text-xs p-3 rounded-xl bg-white dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 transition-all leading-relaxed"
            />
          </div>

          {/* Auxiliary File Upload with Anti-Virus Scanning */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                  辅助材料与项目文档 (可选)
                </label>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">支持上传既往项目说明、Markdown、TXT 等，系统自动进行多维病毒查杀与防代码注入隔离</p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors border border-transparent dark:border-slate-700 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                选择材料
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".txt,.md,.markdown,.json,.csv,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Scanned files list with status badges */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2 mt-2">
                {uploadedFiles.map((item, idx) => {
                  const { scanResult } = item;
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                        scanResult.isSafe
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200'
                          : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/60 text-red-950 dark:text-red-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {scanResult.isSafe ? (
                          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold">{scanResult.fileName}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">({(scanResult.fileSize / 1024).toFixed(1)} KB)</span>
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                                scanResult.isSafe
                                  ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                                  : 'bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300'
                              }`}
                            >
                              {scanResult.isSafe ? '已通过防病毒扫描' : '危险拦截 / 威胁已隔离'}
                            </span>
                          </div>
                          {scanResult.isSafe ? (
                            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5 flex items-center gap-2">
                              <span>✓ 后缀白名单校验</span>
                              <span>✓ 无二进制可执行后门</span>
                              <span>✓ 无跨站脚本/Prompt注入</span>
                            </div>
                          ) : (
                            <div className="text-[11px] text-red-600 dark:text-red-400 mt-0.5">
                              {scanResult.detectedThreats.join('；')}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(idx)}
                        className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 p-1 rounded cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{errorMessage}</span>
                {errorMessage.includes('API Key') && (
                  <button
                    onClick={onOpenApiKeySettings}
                    className="ml-2 underline font-bold text-red-800 dark:text-red-300 hover:text-red-900 dark:hover:text-red-200 cursor-pointer"
                  >
                    前往配置 API Key
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onOpenApiKeySettings}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 underline font-medium cursor-pointer"
          >
            API Key 配置说明
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              disabled={isGenerating || isScanning}
              onClick={handleGenerate}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  正在智能分析并重构简历...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  开始智能生成简历
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
