import React, { useState } from 'react';
import { showAppMessage } from './common/AppFeedback';
import {
  X,
  Building,
  DollarSign,
  Users,
  Clock,
  HelpCircle,
  AlertTriangle,
  Link2,
  Plus,
  Trash2,
  Save,
  Sparkles,
  ExternalLink,
  FileText,
  Check
} from 'lucide-react';
import { JobApplication, CompanyDossier, DossierLink } from '../types/job';
import { sanitizeExternalUrl } from '../utils/security';

interface CompanyDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: JobApplication;
  onSaveDossier: (appId: string, dossier: CompanyDossier) => void;
}

export const CompanyDossierModal: React.FC<CompanyDossierModalProps> = ({
  isOpen,
  onClose,
  application,
  onSaveDossier,
}) => {
  if (!isOpen) return null;

  const initialDossier: CompanyDossier = application.companyDossier || {
    hrIntro: '',
    compensationStructure: '',
    teamAndTechStack: '',
    reputationAndWorkLife: '',
    keyInterviewStyle: '',
    reverseQuestions: [],
    riskAlerts: [],
    collectedLinks: []
  };

  const [dossier, setDossier] = useState<CompanyDossier>(initialDossier);
  const [newQuestion, setNewQuestion] = useState('');
  const [newRisk, setNewRisk] = useState('');
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkNote, setNewLinkNote] = useState('');
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  const handleSave = () => {
    onSaveDossier(application.id, dossier);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2000);
  };

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    setDossier({
      ...dossier,
      reverseQuestions: [...(dossier.reverseQuestions || []), newQuestion.trim()]
    });
    setNewQuestion('');
  };

  const handleRemoveQuestion = (idx: number) => {
    setDossier({
      ...dossier,
      reverseQuestions: (dossier.reverseQuestions || []).filter((_, i) => i !== idx)
    });
  };

  const handleAddRisk = () => {
    if (!newRisk.trim()) return;
    setDossier({
      ...dossier,
      riskAlerts: [...(dossier.riskAlerts || []), newRisk.trim()]
    });
    setNewRisk('');
  };

  const handleRemoveRisk = (idx: number) => {
    setDossier({
      ...dossier,
      riskAlerts: (dossier.riskAlerts || []).filter((_, i) => i !== idx)
    });
  };

  const handleAddLink = () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;
    const safeUrl = sanitizeExternalUrl(newLinkUrl);
    if (!safeUrl) {
      showAppMessage('链接仅支持安全的 HTTP/HTTPS 地址。', 'warning');
      return;
    }
    const newL: DossierLink = {
      id: `dl-${Date.now()}`,
      title: newLinkTitle.trim(),
      url: safeUrl,
      note: newLinkNote.trim()
    };
    setDossier({
      ...dossier,
      collectedLinks: [...(dossier.collectedLinks || []), newL]
    });
    setNewLinkTitle('');
    setNewLinkUrl('');
    setNewLinkNote('');
  };

  const handleRemoveLink = (id: string) => {
    setDossier({
      ...dossier,
      collectedLinks: (dossier.collectedLinks || []).filter((l) => l.id !== id)
    });
  };

  const handleAiAutoFill = () => {
    const isByte = application.companyName.includes('字节');
    const isAli = application.companyName.includes('阿里');
    const isTencent = application.companyName.includes('腾讯');

    let sampleHr = '注重一线实战与解决复杂系统问题能力，技术扁平，倡导数据导向与业务敏捷闭环。';
    let sampleComp = '15~18 薪，年终绩效浮动 3~6 个月，期权归属满 1 年起生效，餐补房补齐全。';
    let sampleTeam = '核心研发团队约 80 人，技术栈覆盖 React / TypeScript / Go / 分布式高并发架构。';
    let sampleRep = '双休保障良好，项目攻坚期偶有加班；技术分享氛围浓厚，晋升评审注重技术深度。';
    let sampleStyle = '一面注重数据结构与高并发系统手撕，二面深挖真实业务架构演进与容灾降级方案。';
    let sampleQuestions = [
      '请问团队目前在架构升级上面临的最大技术挑战是什么？',
      '入职后前 3 个月期望我能主导交付的核心业务目标是什么？',
      '团队内部的代码评审流程与技术决策机制是怎样的？'
    ];
    let sampleRisks = [
      '近期有业务线重组合并动态，需在二面时关注组织架构稳定性',
      '试用期转正有绩效答辩要求，需提前了解量化指标'
    ];

    if (isByte) {
      sampleHr = '业务高速迭代，推崇 Context, not Control，追求极致工程效率。';
      sampleStyle = '代码手撕高频，重视算法复杂度与现场白板编码能力，二面三面深入项目底层原理。';
    } else if (isAli) {
      sampleHr = '推崇技术中台抽象与商业化落地，鼓励跨团队协同与长远技术沉淀。';
      sampleStyle = '深度追问高并发高可用分布式中间件源码，关注高可用故障演练与容量评估。';
    }

    setDossier({
      hrIntro: dossier.hrIntro || sampleHr,
      compensationStructure: dossier.compensationStructure || sampleComp,
      teamAndTechStack: dossier.teamAndTechStack || sampleTeam,
      reputationAndWorkLife: dossier.reputationAndWorkLife || sampleRep,
      keyInterviewStyle: dossier.keyInterviewStyle || sampleStyle,
      reverseQuestions: dossier.reverseQuestions?.length ? dossier.reverseQuestions : sampleQuestions,
      riskAlerts: dossier.riskAlerts?.length ? dossier.riskAlerts : sampleRisks,
      collectedLinks: dossier.collectedLinks || []
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] font-sans animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header with distinct Apple HIG surface styling */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#0071e3] text-white flex items-center justify-center font-bold shadow-xs">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {application.companyName}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 font-medium">
                  {application.position}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                企业背调档案 · HR 简介 · 薪酬待遇 · 员工风评 · 搜集资料合集
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleAiAutoFill}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-medium transition-colors cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0071e3]" />
              <span>智能填充参考模板</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs bg-white dark:bg-slate-900">
          {/* Section 1: HR & Compensation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-750 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white">
                <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span>HR 提供的公司及团队简介</span>
              </div>
              <textarea
                rows={3}
                placeholder="记录 HR 沟通时描绘的业务现状、部门定位与发展前景..."
                value={dossier.hrIntro || ''}
                onChange={(e) => setDossier({ ...dossier, hrIntro: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#0071e3] resize-none"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-750 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white">
                <DollarSign className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span>薪酬待遇与期权归属结构</span>
              </div>
              <textarea
                rows={3}
                placeholder="基本工资、年终奖月数、期权份额与归属节奏、餐补房补、公积金比例..."
                value={dossier.compensationStructure || ''}
                onChange={(e) => setDossier({ ...dossier, compensationStructure: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#0071e3] resize-none"
              />
            </div>
          </div>

          {/* Section 2: Team, Tech Stack, and Work-Life */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-750 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white">
                <Users className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span>团队规模与主力技术栈</span>
              </div>
              <textarea
                rows={3}
                placeholder="团队研发人数、前端/后端技术栈体系、是否自研框架等..."
                value={dossier.teamAndTechStack || ''}
                onChange={(e) => setDossier({ ...dossier, teamAndTechStack: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#0071e3] resize-none"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-750 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white">
                <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span>工作作息与内部风评口碑</span>
              </div>
              <textarea
                rows={3}
                placeholder="上下班时间、加班强度、脉脉/知乎评价、晋升通道与离职率..."
                value={dossier.reputationAndWorkLife || ''}
                onChange={(e) => setDossier({ ...dossier, reputationAndWorkLife: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#0071e3] resize-none"
              />
            </div>
          </div>

          {/* Section 3: Interview Style */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-750 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white">
              <Sparkles className="w-4 h-4 text-[#0071e3]" />
              <span>目标部门面试风格与高频考题规律</span>
            </div>
            <textarea
              rows={2}
              placeholder="该业务线面试官偏好：八股文/手撕算法/系统设计/架构深挖..."
              value={dossier.keyInterviewStyle || ''}
              onChange={(e) => setDossier({ ...dossier, keyInterviewStyle: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#0071e3] resize-none"
            />
          </div>

          {/* Section 4: Reverse Questions & Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Reverse Questions */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-750 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white">
                  <HelpCircle className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span>向面试官反问清单 ({dossier.reverseQuestions?.length || 0})</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="例如：入职后前3个月的首要目标是？"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddQuestion()}
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#0071e3]"
                />
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-3 py-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {dossier.reverseQuestions?.map((q, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between px-2.5 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 group"
                  >
                    <span className="leading-relaxed">{q}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(idx)}
                      className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 ml-2 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Alerts */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-750 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>潜在风险与避坑提示 ({dossier.riskAlerts?.length || 0})</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="例如：试用期转正率需进一步核实..."
                  value={newRisk}
                  onChange={(e) => setNewRisk(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddRisk()}
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#0071e3]"
                />
                <button
                  type="button"
                  onClick={handleAddRisk}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {dossier.riskAlerts?.map((r, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between px-2.5 py-1.5 bg-amber-50/70 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 group"
                  >
                    <span className="leading-relaxed">{r}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRisk(idx)}
                      className="text-amber-500 hover:text-red-500 dark:hover:text-red-400 ml-2 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 5: Collected Links */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-750 space-y-3">
            <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white">
              <Link2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>企业资料与面经外链合集 ({dossier.collectedLinks?.length || 0})</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="标题 (如: 牛客网三面面经)"
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#0071e3]"
              />
              <input
                type="text"
                placeholder="链接 URL (https://...)"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#0071e3]"
              />
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="备注 (如: 重点关注第二部分)"
                  value={newLinkNote}
                  onChange={(e) => setNewLinkNote(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#0071e3]"
                />
                <button
                  type="button"
                  onClick={handleAddLink}
                  className="px-3 py-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {dossier.collectedLinks?.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <a
                      href={sanitizeExternalUrl(link.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-[#0071e3] hover:underline flex items-center space-x-1"
                    >
                      <span className="truncate max-w-xs">{link.title}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {link.note && <span className="text-slate-400 text-[11px]">({link.note})</span>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(link.id)}
                    className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 ml-2 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer with distinct Apple HIG surface styling */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {isSavedRecently && (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1 animate-in fade-in">
                <Check className="w-4 h-4" />
                <span>背调档案已妥善保存！</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer"
            >
              关闭
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center space-x-1.5 px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>保存背调档案</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
