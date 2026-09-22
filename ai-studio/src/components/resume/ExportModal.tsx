import React, { useState } from 'react';
import { ResumeData } from '../../types/resume';
import { exportToWord, exportToMarkdown, exportToPdf, generateMailToLink } from '../../utils/exporters';
import { FileDown, FileText, Printer, Mail, Copy, Check, X, Send, Sparkles } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: ResumeData;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, resume }) => {
  const [activeTab, setActiveTab] = useState<'export' | 'email'>('export');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [copied, setCopied] = useState(false);
  const [emailBody, setEmailBody] = useState(`尊敬的招聘负责人：

您好！

我是 ${resume.personalInfo.fullName}，长期从事「${resume.personalInfo.jobTitle}」相关研发与系统架构工作。
非常关注贵司在相关技术领域的卓越业务成果与未来战略方向。

【我的核心优势】
1. 具备深厚的技术架构经验，注重代码质量、高性能与高可用系统设计；
2. 倡导数据驱动与工程卓越，具备敏锐的业务洞察和跨职能协同能力；
3. 附件为我最新更新的个人简历，涵盖过往项目沉淀与成果，供您审阅评估。

期待能有机会与贵团队进一步沟通交流！

祝工作顺利，万事顺意！

此致，
${resume.personalInfo.fullName}
电话：${resume.personalInfo.phone}
邮箱：${resume.personalInfo.email}`);

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMailTo = () => {
    const link = generateMailToLink({
      recipientEmail: recipientEmail.trim(),
      candidateName: resume.personalInfo.fullName,
      jobTitle: resume.personalInfo.jobTitle,
      companyName: targetCompany.trim() || '贵司',
      customBody: emailBody
    });
    window.location.href = link;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">简历导出与邮件分发</h2>
            <p className="text-xs text-slate-500">支持 Word、PDF、Markdown 格式及直连邮箱投递</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 px-5 bg-white text-xs font-semibold">
          <button
            onClick={() => setActiveTab('export')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'export' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            本地文件导出 (Word / PDF / MD)
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'email' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            通过邮箱投递发送
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[70vh]">
          {activeTab === 'export' ? (
            <div className="space-y-3.5">
              {/* Word */}
              <div className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <FileDown className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Microsoft Word (.doc)</h3>
                    <p className="text-xs text-slate-500">保留完整排版结构，兼容 Office Word、WPS 及各类 ATS 系统</p>
                  </div>
                </div>
                <button
                  id="btn-export-word"
                  onClick={() => exportToWord(resume)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  下载 Word
                </button>
              </div>

              {/* PDF */}
              <div className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">矢量无损 PDF (.pdf)</h3>
                    <p className="text-xs text-slate-500">调用系统打印引擎，完美呈现 A4 分页与当前模板高保真排版</p>
                  </div>
                </div>
                <button
                  id="btn-export-pdf"
                  onClick={() => exportToPdf()}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  打印 / 保存 PDF
                </button>
              </div>

              {/* Markdown */}
              <div className="p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-xs transition-all flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">纯文本 Markdown (.md)</h3>
                    <p className="text-xs text-slate-500">GitHub 风格标准 Markdown，适用于博客展示或极客投递</p>
                  </div>
                </div>
                <button
                  id="btn-export-md"
                  onClick={() => exportToMarkdown(resume)}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  下载 Markdown
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">目标公司名称</label>
                  <input
                    type="text"
                    placeholder="如: 大疆创新、乐鑫科技"
                    value={targetCompany}
                    onChange={e => setTargetCompany(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">HR / 招聘官邮箱</label>
                  <input
                    type="email"
                    placeholder="hr@company.com"
                    value={recipientEmail}
                    onChange={e => setRecipientEmail(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-700">求职信与自荐正文 (Cover Letter)</label>
                  <button
                    onClick={handleCopyEmail}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? '已复制正文' : '一键复制'}
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-sans leading-relaxed"
                />
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">投递小贴士：</span>
                  <span>点击下方「唤起本地邮件客户端」将自动填写收件人、标题与正文；您也可以直接「一键复制」并粘贴到网页版邮箱（网易/QQ/Gmail），并将导出的 Word 或 PDF 作为附件发送！</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200/50 transition-colors"
          >
            关闭
          </button>
          {activeTab === 'email' && (
            <button
              onClick={handleSendMailTo}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              唤起本地邮件客户端发送
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
