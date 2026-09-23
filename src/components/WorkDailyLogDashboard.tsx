import React, { useState } from 'react';
import {
  Plus,
  Sparkles,
  Calendar,
  Layers,
  Link2,
  TrendingUp,
  CheckCircle,
  Copy,
  Trash2,
  Edit2,
  X,
  FileText,
  ShieldCheck,
  BookmarkPlus,
  BarChart3
} from 'lucide-react';
import { WorkDailyLog, WorkCategory, EvidenceProof, GeneratedResumeBullet, JournalExtractResponse } from '../types/journal';
import { ResumeData } from '../types/resume';
import { requestConvertJournalToResumeBullets } from '../services/geminiService';

interface WorkDailyLogDashboardProps {
  logs: WorkDailyLog[];
  onSaveLogs: (logs: WorkDailyLog[]) => void;
  currentResume: ResumeData;
  onUpdateResume: (updated: ResumeData) => void;
}

export const WorkDailyLogDashboard: React.FC<WorkDailyLogDashboardProps> = ({
  logs,
  onSaveLogs,
  currentResume,
  onUpdateResume,
}) => {
  const [selectedLogIds, setSelectedLogIds] = useState<Set<string>>(new Set(logs.map((l) => l.id)));
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  // Form State
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formProject, setFormProject] = useState('');
  const [formCategory, setFormCategory] = useState<WorkCategory>('performance');
  const [formTasks, setFormTasks] = useState('');
  const [formChallenges, setFormChallenges] = useState('');
  const [formMetrics, setFormMetrics] = useState('');
  const [formTechs, setFormTechs] = useState('');
  const [formEvidenceTitle, setFormEvidenceTitle] = useState('');
  const [formEvidenceUrl, setFormEvidenceUrl] = useState('');

  // AI Extraction State
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractResult, setExtractResult] = useState<JournalExtractResponse | null>(null);
  const [appliedBulletIds, setAppliedBulletIds] = useState<Set<string>>(new Set());

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedLogIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedLogIds(next);
  };

  const handleSelectAll = () => {
    if (selectedLogIds.size === logs.length) {
      setSelectedLogIds(new Set());
    } else {
      setSelectedLogIds(new Set(logs.map((l) => l.id)));
    }
  };

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProject.trim() || !formTasks.trim()) return;

    const evidences: EvidenceProof[] = [];
    if (formEvidenceTitle.trim()) {
      evidences.push({
        id: `ev-${Date.now()}`,
        type: formEvidenceUrl ? 'pr_link' : 'doc_link',
        title: formEvidenceTitle.trim(),
        urlOrRef: formEvidenceUrl.trim() || undefined
      });
    }

    const techArray = formTechs
      .split(/[,，\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingLogId) {
      const now = new Date().toISOString();
      const updated = logs.map((l) =>
        l.id === editingLogId
          ? {
              ...l,
              date: formDate,
              projectOrModuleName: formProject.trim(),
              category: formCategory,
              tasksCompleted: formTasks.trim(),
              challengesAndSolutions: formChallenges.trim(),
              quantifiableMetrics: formMetrics.trim() || undefined,
              technologiesUsed: techArray,
              evidences: evidences.length > 0 ? evidences : l.evidences,
              updatedAt: now
            }
          : l
      );
      onSaveLogs(updated);
    } else {
      const now = new Date().toISOString();
      const newLog: WorkDailyLog = {
        id: `log-${Date.now()}`,
        date: formDate,
        projectOrModuleName: formProject.trim(),
        category: formCategory,
        tasksCompleted: formTasks.trim(),
        challengesAndSolutions: formChallenges.trim(),
        quantifiableMetrics: formMetrics.trim() || undefined,
        technologiesUsed: techArray,
        evidences,
        createdAt: now,
        updatedAt: now
      };
      onSaveLogs([newLog, ...logs]);
      selectedLogIds.add(newLog.id);
      setSelectedLogIds(new Set(selectedLogIds));
    }

    resetForm();
    setShowAddLogModal(false);
  };

  const handleEditClick = (log: WorkDailyLog) => {
    setEditingLogId(log.id);
    setFormDate(log.date);
    setFormProject(log.projectOrModuleName);
    setFormCategory(log.category);
    setFormTasks(log.tasksCompleted);
    setFormChallenges(log.challengesAndSolutions);
    setFormMetrics(log.quantifiableMetrics || '');
    setFormTechs(log.technologiesUsed.join(', '));
    if (log.evidences && log.evidences.length > 0) {
      setFormEvidenceTitle(log.evidences[0].title);
      setFormEvidenceUrl(log.evidences[0].urlOrRef || '');
    } else {
      setFormEvidenceTitle('');
      setFormEvidenceUrl('');
    }
    setShowAddLogModal(true);
  };

  const handleDeleteLog = (id: string) => {
    if (confirm('确定要删除此条工作日志吗？')) {
      const updated = logs.filter((l) => l.id !== id);
      onSaveLogs(updated);
      selectedLogIds.delete(id);
      setSelectedLogIds(new Set(selectedLogIds));
    }
  };

  const resetForm = () => {
    setEditingLogId(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormProject('');
    setFormCategory('performance');
    setFormTasks('');
    setFormChallenges('');
    setFormMetrics('');
    setFormTechs('');
    setFormEvidenceTitle('');
    setFormEvidenceUrl('');
  };

  const handleRunAiExtract = async () => {
    const chosen = logs.filter((l) => selectedLogIds.has(l.id));
    if (chosen.length === 0) {
      alert('请先勾选需要提炼为简历亮点的日志条目！');
      return;
    }

    setIsExtracting(true);
    try {
      const res = await requestConvertJournalToResumeBullets({
        journalLogs: chosen,
        existingResume: currentResume
      });
      setExtractResult(res);
      setAppliedBulletIds(new Set());
    } catch (err: any) {
      alert('AI 提炼失败：' + (err.message || '网络繁忙，请稍后重试'));
    } finally {
      setIsExtracting(false);
    }
  };

  const handleApplyBulletToResume = (bullet: GeneratedResumeBullet) => {
    const existing = [...currentResume.workExperience];
    if (existing.length > 0) {
      existing[0] = {
        ...existing[0],
        highlights: [...existing[0].highlights, bullet.bulletText]
      };
      onUpdateResume({
        ...currentResume,
        workExperience: existing
      });
    } else {
      onUpdateResume({
        ...currentResume,
        workExperience: [
          {
            id: `work-${Date.now()}`,
            company: bullet.companyOrProjectTarget || '核心业务团队',
            position: currentResume.personalInfo.jobTitle || '研发工程师',
            startDate: '2024-01',
            endDate: '至今',
            current: true,
            highlights: [bullet.bulletText]
          }
        ]
      });
    }
    setAppliedBulletIds((prev) => new Set(prev).add(bullet.id));
  };

  return (
    <div id="work-daily-log-dashboard" className="space-y-6 font-sans">
      {/* Header Banner - Apple HIG Card Style */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  求职手记与实操凭证库
                </h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] font-semibold border border-blue-100 dark:border-blue-900/60">
                  真实工作沉淀
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                随手记录工作日常的技术难点、攻坚方案、量化数据与文档凭证。求职时一键由 AI 提炼为符合 STAR 原则的简历亮点。
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto flex-shrink-0">
          <button
            id="btn-add-work-daily-log"
            onClick={() => {
              resetForm();
              setShowAddLogModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>记录今日日志</span>
          </button>

          <button
            id="btn-extract-to-resume-bullets"
            onClick={handleRunAiExtract}
            disabled={selectedLogIds.size === 0 || isExtracting}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 ${isExtracting ? 'animate-spin' : ''}`} />
            <span>
              {isExtracting ? '正在提炼...' : `提炼选中 (${selectedLogIds.size}) 条至简历`}
            </span>
          </button>
        </div>
      </div>

      {/* AI Extracted Result Banner */}
      {extractResult && (
        <div className="p-6 rounded-2xl bg-blue-50/50 dark:bg-slate-900 border border-blue-200 dark:border-slate-800 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-blue-200/60 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#0071e3]" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">提炼生成的 STAR 简历论据</h3>
            </div>
            <span className="text-xs text-[#0071e3] font-mono font-bold">
              共生成 {extractResult.suggestedBullets.length} 条亮点
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <span className="font-bold text-slate-900 dark:text-white">能力画像归纳：</span>
            {extractResult.summary}
          </p>

          <div className="space-y-3">
            {extractResult.suggestedBullets.map((b) => {
              const isApplied = appliedBulletIds.has(b.id);

              return (
                <div
                  key={b.id}
                  className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 shadow-xs space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] font-semibold border border-blue-100 dark:border-blue-900/50">
                        {b.companyOrProjectTarget}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        溯源：{b.evidenceSources?.join('、')}
                      </span>
                    </div>

                    <button
                      onClick={() => handleApplyBulletToResume(b)}
                      disabled={isApplied}
                      className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-xl font-medium transition-colors cursor-pointer ${
                        isApplied
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-xs'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>已注入当前简历</span>
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="w-3.5 h-3.5" />
                          <span>一键注入简历工作经历</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-100 font-sans leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
                    {b.bulletText}
                  </p>

                  {/* STAR Breakdown */}
                  {b.starBreakdown && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                        <span className="font-bold text-slate-800 dark:text-slate-200">[业务情境与目标]：</span>
                        {b.starBreakdown.situation}
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                        <span className="font-bold text-[#0071e3]">[行动方案与成效]：</span>
                        {b.starBreakdown.result}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Log List View */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedLogIds.size === logs.length && logs.length > 0}
              onChange={handleSelectAll}
              className="rounded border-slate-300 dark:border-slate-700 text-[#0071e3] focus:ring-[#0071e3] cursor-pointer"
            />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              已积累工作日志 ({logs.length} 条)
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">已勾选 {selectedLogIds.size} 条用于提炼</span>
        </div>

        <div className="space-y-3.5">
          {logs.map((log) => {
            const isSelected = selectedLogIds.has(log.id);

            const categoryBadge =
              log.category === 'architecture'
                ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                : log.category === 'performance'
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                : log.category === 'ai_infra'
                ? 'bg-blue-50 dark:bg-blue-950/40 text-[#0071e3] dark:text-blue-400 border-blue-200 dark:border-blue-800'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';

            const categoryLabel =
              log.category === 'architecture'
                ? '架构演进'
                : log.category === 'performance'
                ? '性能攻坚'
                : log.category === 'ai_infra'
                ? 'AI 基建'
                : '核心业务';

            return (
              <div
                key={log.id}
                className={`p-4 sm:p-5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-blue-50/20 dark:bg-slate-800/80 border-[#0071e3]/40 shadow-xs'
                    : 'bg-white dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(log.id)}
                      className="mt-1 rounded border-slate-300 dark:border-slate-700 text-[#0071e3] focus:ring-[#0071e3] cursor-pointer"
                    />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
                          {log.date}
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded border font-semibold ${categoryBadge}`}>
                          {categoryLabel}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{log.projectOrModuleName}</h4>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                        <span className="text-slate-400 font-medium">任务概要：</span>
                        {log.tasksCompleted}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleEditClick(log)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer"
                      title="编辑"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer"
                      title="删除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Technical Challenges & Solutions */}
                <div className="mt-3 pl-7 space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed">
                    <span className="font-bold text-amber-700 dark:text-amber-400">【技术难点与解法】：</span>
                    {log.challengesAndSolutions}
                  </div>

                  {log.quantifiableMetrics && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                      <BarChart3 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="font-semibold">量化数据指标：</span>
                      <span className="font-medium text-emerald-700 dark:text-emerald-200">{log.quantifiableMetrics}</span>
                    </div>
                  )}

                  {/* Tech stack & Evidences */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex flex-wrap gap-1.5">
                      {log.technologiesUsed.map((tech, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {log.evidences && log.evidences.length > 0 && (
                      <div className="flex items-center gap-1 text-[11px] text-[#0071e3] font-medium">
                        <Link2 className="w-3 h-3" />
                        <span>已附凭证：{log.evidences[0].title}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Add/Edit Log - Apple HIG Clean Design */}
      {showAddLogModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingLogId ? '编辑工作日志' : '记录今日工作日志'}
              </h3>
              <button
                onClick={() => setShowAddLogModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveLog} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs bg-white dark:bg-slate-900">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">记录日期</label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">所属分类</label>
                    <select
                      value={formCategory}
                      onChange={(e: any) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                    >
                      <option value="performance">性能攻坚 / 延时优化</option>
                      <option value="architecture">架构重构 / 底层改造</option>
                      <option value="ai_infra">AI 智能体 / RAG基建</option>
                      <option value="feature">核心高并发业务研发</option>
                      <option value="stability">生产稳定性 / 故障排查</option>
                      <option value="engineering">CI/CD 与工程效能</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    所属项目或模块名称
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="如：交易链路秒级调度优化、微前端沙箱隔离改造"
                    value={formProject}
                    onChange={(e) => setFormProject(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">完成任务概要</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="概述今天完成的关键研发任务或系统改造范围..."
                    value={formTasks}
                    onChange={(e) => setFormTasks(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3] resize-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    技术挑战与攻坚方案
                  </label>
                  <textarea
                    rows={3}
                    placeholder="说明遇到了什么系统性能瓶颈或兼容性问题，设计并采取了哪些架构或算法解法..."
                    value={formChallenges}
                    onChange={(e) => setFormChallenges(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3] resize-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    量化数据指标
                  </label>
                  <input
                    type="text"
                    placeholder="如：P99 响应延时降低 65%，单节点并发支撑提升至 8000 QPS"
                    value={formMetrics}
                    onChange={(e) => setFormMetrics(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    涉及技术栈
                  </label>
                  <input
                    type="text"
                    placeholder="React 19, TypeScript, WebAssembly, Tailwind CSS, Redis"
                    value={formTechs}
                    onChange={(e) => setFormTechs(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                  />
                </div>

                {/* Evidence inputs */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 space-y-2">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">经历凭证绑定：</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="凭证名称，如：压测对比报告.pdf"
                      value={formEvidenceTitle}
                      onChange={(e) => setFormEvidenceTitle(e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                    />
                    <input
                      type="text"
                      placeholder="文档链接或内网引用地址 (选填)"
                      value={formEvidenceUrl}
                      onChange={(e) => setFormEvidenceUrl(e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer with distinct HIG surface styling */}
              <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowAddLogModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0071e3] hover:bg-[#0077ed] rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  保存日志
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
