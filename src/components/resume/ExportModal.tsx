import React, { useState, useEffect } from 'react';
import { ResumeData, ResumeTemplateId } from '../../types/resume';
import { ResumePreview } from './ResumePreview';
import {
  exportToWord,
  exportToMarkdown,
  exportToShareJson,
  exportToNativePrint,
  generateMailToLink
} from '../../utils/exporters';
import {
  FileDown,
  FileText,
  Printer,
  Mail,
  Copy,
  Check,
  X,
  Send,
  ExternalLink,
  Info,
  Share2
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: ResumeData;
  templateId: ResumeTemplateId;
  sortByDate?: boolean;
  initialTab?: 'export' | 'email';
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  resume,
  templateId,
  sortByDate = true,
  initialTab = 'export'
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'email'>(initialTab);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [copied, setCopied] = useState(false);
  const [emailNotice, setEmailNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setEmailNotice(null);
    }
  }, [isOpen, initialTab]);

  const [emailBody, setEmailBody] = useState(`尊敬的招聘负责人：

您好！

我是 ${resume.personalInfo.fullName}，长期从事「${resume.personalInfo.jobTitle}」相关研发与系统架构工作。
非常关注贵司在相关技术领域的卓越业务成果与未来战略方向。

【我的核心专长与求职意向】
1. 期望职位：${resume.jobIntent?.desiredPosition || resume.personalInfo.jobTitle}
2. 期望薪资：${resume.jobIntent?.desiredSalary || '面议'}
3. 具备扎实的技术架构经验，注重系统性能调优、稳定性与可扩展性设计；
4. 倡导工程卓越与业务协同，具备良好的跨职能沟通能力。

期待能有机会与贵团队进一步沟通交流！

祝工作顺利，万事顺意！

此致，
${resume.personalInfo.fullName}
电话：${resume.personalInfo.phone}
邮箱：${resume.personalInfo.email}`);

  if (!isOpen) return null;

  const handleExportPdf = () => {
    exportToNativePrint();
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailBody);
    setCopied(true);
    setEmailNotice('已成功复制自荐信正文至剪贴板！');
    setTimeout(() => {
      setCopied(false);
      setEmailNotice(null);
    }, 3000);
  };

  // Direct Email Sending without PDF Export
  const handleDirectSendEmail = () => {
    const link = generateMailToLink({
      recipientEmail: recipientEmail.trim(),
      candidateName: resume.personalInfo.fullName,
      jobTitle: resume.personalInfo.jobTitle,
      companyName: targetCompany.trim() || '贵司',
      customBody: emailBody
    });

    // Copy body text
    navigator.clipboard.writeText(emailBody);
    setCopied(true);
    setEmailNotice('已复制自荐信正文，并调起本地邮件客户端！');

    // Trigger mailto link directly
    window.location.href = link;
    setTimeout(() => setCopied(false), 3000);
  };

  // Direct Webmail Handlers
  const handleOpenGmail = () => {
    const subject = `【应聘】${resume.personalInfo.fullName} - 求职「${resume.jobIntent?.desiredPosition || resume.personalInfo.jobTitle}」`;
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail.trim())}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(url, '_blank');
    setEmailNotice('已在网页版 Gmail 中打开邮件草稿！');
  };

  const handleOpenOutlook = () => {
    const subject = `【应聘】${resume.personalInfo.fullName} - 求职「${resume.jobIntent?.desiredPosition || resume.personalInfo.jobTitle}」`;
    const url = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(recipientEmail.trim())}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(url, '_blank');
    setEmailNotice('已在网页版 Outlook 中打开邮件草稿！');
  };

  return (
    <>
      <div className="resume-pdf-print-stage" aria-hidden="true">
        <ResumePreview
          resume={resume}
          templateId={templateId}
          sortByDate={sortByDate}
          documentId="resume-print-document"
        />
      </div>

      <div className="fixed inset-0 z-50 min-h-full bg-slate-900/60 backdrop-blur-xs flex items-center justify-center px-4 py-6 overflow-y-auto">
      <div className="my-auto bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {activeTab === 'export' ? '导出简历文件' : '通过邮箱发送求职信'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {activeTab === 'export'
                ? '支持 PDF、Word、用户共享数据和 Agent 可读 Markdown'
                : '一键生成自荐信并调起邮件客户端直接发送，不导出 PDF'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher: Apple HIG Segmented Control */}
        <div className="px-5 pt-4 bg-white dark:bg-slate-900">
          <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center text-xs font-semibold text-slate-600 dark:text-slate-400">
            <button
              onClick={() => setActiveTab('export')}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'export'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>文件格式导出</span>
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'email'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>直接发送邮件</span>
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 overflow-y-auto max-h-[60vh] space-y-4 bg-white dark:bg-slate-900">
          {activeTab === 'export' ? (
            <div className="space-y-3">
              {/* 1. PDF Preview / Export Card */}
              <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 hover:border-[#0071e3] dark:hover:border-[#0071e3] transition-all flex items-center justify-between gap-3 bg-white dark:bg-slate-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-sm">
                    PDF
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">矢量无损 PDF (.pdf)</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">进入系统 A4 打印预览，再选择“保存为 PDF”</p>
                  </div>
                </div>
                <button
                  id="btn-export-pdf"
                  onClick={handleExportPdf}
                  className="px-3.5 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex-shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>打印 / 保存 PDF</span>
                </button>
              </div>

              {/* 2. Word (.doc) Card */}
              <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 hover:border-[#0071e3] dark:hover:border-[#0071e3] transition-all flex items-center justify-between gap-3 bg-white dark:bg-slate-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#0071e3] flex items-center justify-center font-bold text-xs">
                    DOC
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Word 格式文档 (.doc)</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">结构化表格布局，方便 HR 或猎头进一步编辑修改</p>
                  </div>
                </div>
                <button
                  id="btn-export-word"
                  onClick={() => exportToWord(resume)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex-shrink-0 cursor-pointer"
                >
                  下载 Word
                </button>
              </div>

              {/* 3. Markdown (.md) Card */}
              <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 hover:border-[#0071e3] dark:hover:border-[#0071e3] transition-all flex items-center justify-between gap-3 bg-white dark:bg-slate-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">
                    MD
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Agent 可读 Markdown (.md)</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">稳定标题与字段结构，适合交给 AI Agent 阅读和分析</p>
                  </div>
                </div>
                <button
                  id="btn-export-md"
                  onClick={() => exportToMarkdown(resume)}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex-shrink-0 cursor-pointer"
                >
                  下载 Agent 版
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 hover:border-[#0071e3] dark:hover:border-[#0071e3] transition-all flex items-center justify-between gap-3 bg-white dark:bg-slate-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Resume Pilot 用户共享包</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">导出完整结构数据，其他用户可直接导入继续编辑</p>
                  </div>
                </div>
                <button
                  id="btn-export-share"
                  onClick={() => exportToShareJson(resume)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex-shrink-0 cursor-pointer"
                >
                  导出共享包
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Notification Banner */}
              <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#0071e3] flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed text-[11px]">
                  <strong className="text-slate-900 dark:text-white block font-semibold mb-0.5">
                    纯文本直接发送模式（不生成 / 导出 PDF）
                  </strong>
                  填写目标公司与招聘邮箱后，点击「调起本地邮箱发送」将自动为您准备好求职信并调起邮件客户端发送，无需在本地下载 PDF 文件。
                </div>
              </div>

              {emailNotice && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span>{emailNotice}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    目标公司名称
                  </label>
                  <input
                    type="text"
                    placeholder="如: 阿里巴巴、字节跳动、腾讯"
                    value={targetCompany}
                    onChange={e => setTargetCompany(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    HR / 招聘官邮箱
                  </label>
                  <input
                    type="email"
                    placeholder="hr@company.com"
                    value={recipientEmail}
                    onChange={e => setRecipientEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    求职自荐信正文 (Cover Letter)
                  </label>
                  <button
                    onClick={handleCopyEmail}
                    className="inline-flex items-center gap-1 text-xs text-[#0071e3] hover:text-[#0077ed] font-semibold cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? '已复制' : '一键复制正文'}</span>
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3] font-sans leading-relaxed"
                />
              </div>

              {/* Webmail Quick Access */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  也可通过快捷网页邮箱发送：
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenGmail}
                    className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Gmail 网页版</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenOutlook}
                    className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Outlook 网页版</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            关闭
          </button>

          {activeTab === 'email' ? (
            <button
              onClick={handleDirectSendEmail}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>调起本地邮箱发送 (mailto)</span>
            </button>
          ) : (
            <button
              onClick={handleExportPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>预览并保存 PDF</span>
            </button>
          )}
        </div>
      </div>
      </div>
    </>
  );
};
