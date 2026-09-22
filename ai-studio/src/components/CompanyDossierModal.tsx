import React, { useState } from 'react';
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
    const newL: DossierLink = {
      id: `dl-${Date.now()}`,
      title: newLinkTitle.trim(),
      url: newLinkUrl.trim(),
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
    const isChipCompany = /乐鑫|Nordic|芯片|半导体/i.test(application.companyName);
    const isDeviceCompany = /大疆|华为|终端|智能/i.test(application.companyName);

    setDossier({
      hrIntro:
        dossier.hrIntro ||
        `${application.companyName}嵌入式研发岗位，具体业务线、汇报关系和 HC 原因需要通过正式招聘渠道确认。`,
      compensationStructure:
        dossier.compensationStructure ||
        `${application.salaryExpectation || '面议'}；薪资结构、年终奖、社保公积金与其他福利待 HR 确认。`,
      teamAndTechStack:
        dossier.teamAndTechStack ||
        (isChipCompany
          ? 'C/C++ + RTOS + BLE/Wi-Fi 协议栈 + SoC 外设驱动 + Bootloader/SDK 工具链。'
          : isDeviceCompany
          ? 'C/C++ + ARM/RISC-V MCU + FreeRTOS + 通信协议 + 传感器与电机等硬件联调。'
          : 'C/C++ + MCU/RTOS + UART/SPI/I²C/CAN + 无线通信 + OTA 与系统调试。'),
      reputationAndWorkLife:
        dossier.reputationAndWorkLife ||
        '作息、出差、现场支持和量产阶段节奏需要结合具体团队与项目确认。',
      keyInterviewStyle:
        dossier.keyInterviewStyle ||
        '重点准备 C 语言底层、RTOS 调度与同步、驱动接口、通信协议、内存与并发，以及真实硬件问题定位。',
      reverseQuestions:
        dossier.reverseQuestions && dossier.reverseQuestions.length > 0
          ? dossier.reverseQuestions
          : [
              '请问目前团队在该业务线未来半年最核心的 3 项技术挑战是什么？',
              '对于该岗位入职后，前 3 个月期望达成怎样的标志性交付成果？',
              '团队当前主要 MCU、RTOS、无线协议和调试工具链是什么？'
            ],
      riskAlerts:
        dossier.riskAlerts && dossier.riskAlerts.length > 0
          ? dossier.riskAlerts
          : ['岗位职责、量产节奏、出差与现场支持比例需要在面试中确认。'],
      collectedLinks:
        dossier.collectedLinks && dossier.collectedLinks.length > 0
          ? dossier.collectedLinks
          : []
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-blue-600">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">{application.companyName}</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                  {application.position}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                企业背调档案 · HR 简介 · 薪酬待遇 · 员工风评 · 搜集资料合集
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleAiAutoFill}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 border border-amber-500/30 rounded-lg text-xs font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>AI 辅助补充背调模板</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: HR & Compensation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>HR 提供的公司及团队简介</span>
              </div>
              <textarea
                rows={3}
                placeholder="记录 HR 电话沟通时描绘的业务现状、部门定位与发展前景..."
                value={dossier.hrIntro || ''}
                onChange={(e) => setDossier({ ...dossier, hrIntro: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>薪酬待遇与期权归属结构</span>
              </div>
              <textarea
                rows={3}
                placeholder="基本工资、年终奖月数、期权份额与归属节奏、餐补房补、公积金比例..."
                value={dossier.compensationStructure || ''}
                onChange={(e) => setDossier({ ...dossier, compensationStructure: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>

          {/* Section 2: Team, Tech Stack, and Work-Life */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
                <Users className="w-4 h-4 text-blue-400" />
                <span>团队规模与主力技术栈</span>
              </div>
              <textarea
                rows={3}
                placeholder="团队研发人数、前端/后端技术栈体系、是否自研框架等..."
                value={dossier.teamAndTechStack || ''}
                onChange={(e) => setDossier({ ...dossier, teamAndTechStack: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>员工真实风评与加班作息 (WLB)</span>
              </div>
              <textarea
                rows={3}
                placeholder="上班/下班作息、是否打卡、大小周情况、脉脉/看准真实评价..."
                value={dossier.reputationAndWorkLife || ''}
                onChange={(e) => setDossier({ ...dossier, reputationAndWorkLife: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>

          {/* Section 3: Interview Style & Trap Warnings */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>面试风格倾向与高频考题偏好</span>
            </div>
            <textarea
              rows={2}
              placeholder="该部门面试官偏爱算法、架构设计还是业务指标？前人面经复盘总结..."
              value={dossier.keyInterviewStyle || ''}
              onChange={(e) => setDossier({ ...dossier, keyInterviewStyle: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Section 4: Reverse Questions */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>面试结束专属反向提问清单 (展示专业度)</span>
              </div>
              <span className="text-[11px] text-slate-500">
                {dossier.reverseQuestions?.length || 0} 个提问
              </span>
            </div>

            <div className="space-y-2">
              {dossier.reverseQuestions?.map((q, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between p-2.5 bg-white rounded-lg text-xs border border-slate-200"
                >
                  <span className="text-slate-700 leading-relaxed pr-2">
                    {idx + 1}. {q}
                  </span>
                  <button
                    onClick={() => handleRemoveQuestion(idx)}
                    className="text-slate-500 hover:text-red-600 p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="flex space-x-2 pt-1">
                <input
                  type="text"
                  placeholder="添加一条高价值反向提问..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddQuestion()}
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 rounded-lg border border-slate-200"
                >
                  添加提问
                </button>
              </div>
            </div>
          </div>

          {/* Section 5: Collected Links & Dossier Dossier */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
                <Link2 className="w-4 h-4 text-blue-600" />
                <span>自己搜集的相关资料与链接合集</span>
              </div>
              <span className="text-[11px] text-slate-500">
                {dossier.collectedLinks?.length || 0} 条资料
              </span>
            </div>

            <div className="space-y-2">
              {dossier.collectedLinks?.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg text-xs border border-slate-200"
                >
                  <div className="space-y-0.5 min-w-0 pr-3">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-blue-700 hover:text-blue-700 flex items-center space-x-1 truncate"
                    >
                      <span className="truncate">{link.title}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                    {link.note && <div className="text-[11px] text-slate-500 truncate">{link.note}</div>}
                  </div>
                  <button
                    onClick={() => handleRemoveLink(link.id)}
                    className="text-slate-500 hover:text-red-600 p-1 flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                <div className="text-[11px] font-medium text-slate-700">添加新资料链接：</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="资料标题 (如：部门架构演进复盘)"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="链接 URL (如：https://juejin.cn/...)"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="备注要点说明 (选填)"
                    value={newLinkNote}
                    onChange={(e) => setNewLinkNote(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white rounded-lg"
                  >
                    添加资料
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {isSavedRecently && (
              <span className="text-emerald-600 font-medium flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>背调档案已成功保存</span>
              </span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              关闭
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
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
