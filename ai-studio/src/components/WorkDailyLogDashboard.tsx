import React, { useState } from 'react';
import {
  FileCheck2,
  Plus,
  Sparkles,
  Calendar,
  Layers,
  Link2,
  TrendingUp,
  Cpu,
  CheckCircle,
  Copy,
  Trash2,
  Edit2,
  X,
  FileText,
  ShieldCheck,
  ArrowRight,
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
      const updated = logs.map((l) =>
        l.id === editingLogId
          ? {
              ...l,
              date: formDate,
              projectOrModuleName: formProject.trim(),
              category: formCategory,
              tasksCompleted: formTasks.trim(),
              challengesAndSolutions: formChallenges.trim(),
              quantifiableMetrics: formMetrics.trim(),
              technologiesUsed: techArray,
              evidences: evidences.length > 0 ? evidences : l.evidences,
              updatedAt: new Date().toISOString()
            }
          : l
      );
      onSaveLogs(updated);
    } else {
      const newLog: WorkDailyLog = {
        id: `log-${Date.now()}`,
        date: formDate,
        projectOrModuleName: formProject.trim(),
        category: formCategory,
        tasksCompleted: formTasks.trim(),
        challengesAndSolutions: formChallenges.trim(),
        quantifiableMetrics: formMetrics.trim(),
        technologiesUsed: techArray,
        evidences,
        extractedToResume: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      onSaveLogs([newLog, ...logs]);
      setSelectedLogIds((prev) => new Set(prev).add(newLog.id));
    }

    setShowAddLogModal(false);
    resetForm();
  };

  const handleDeleteLog = (id: string) => {
    onSaveLogs(logs.filter((l) => l.id !== id));
    setSelectedLogIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
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
    setFormEvidenceTitle(log.evidences?.[0]?.title || '');
    setFormEvidenceUrl(log.evidences?.[0]?.urlOrRef || '');
    setShowAddLogModal(true);
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
    const selectedLogs = logs.filter((l) => selectedLogIds.has(l.id));
    if (selectedLogs.length === 0) return;

    setIsExtracting(true);
    try {
      const res = await requestConvertJournalToResumeBullets({
        journalLogs: selectedLogs,
        targetRole: currentResume.title || '资深架构研发',
        existingResume: currentResume
      });
      setExtractResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleApplyBulletToResume = (bullet: GeneratedResumeBullet) => {
    const nextWork = [...(currentResume.workExperience || [])];
    if (nextWork.length > 0) {
      nextWork[0] = {
        ...nextWork[0],
        highlights: [bullet.bulletText, ...(nextWork[0].highlights || [])]
      };
      onUpdateResume({
        ...currentResume,
        workExperience: nextWork
      });
    } else {
      // Create work experience
      onUpdateResume({
        ...currentResume,
        workExperience: [
          {
            id: `work-${Date.now()}`,
            company: bullet.companyOrProjectTarget || '当前业务团队',
            position: currentResume.title || '资深研发工程师',
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
    <div id="work-daily-log-dashboard" className="space-y-8">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              工作日报与经历凭证 (让经历变成有证据的简历)
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-medium">
              防背调翻车 · STAR量化
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            平日随手记录真实工作挑战、攻坚方案、量化数据与 PR/设计文档凭证。求职时，AI
            可一键将碎片化日报转化为严苛遵循 STAR 原则、无法造假的高价值简历亮点！
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            id="btn-add-work-daily-log"
            onClick={() => {
              resetForm();
              setShowAddLogModal(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>记录今天的工作日报</span>
          </button>

          <button
            id="btn-extract-to-resume-bullets"
            onClick={handleRunAiExtract}
            disabled={selectedLogIds.size === 0 || isExtracting}
            className="flex items-center space-x-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Sparkles className={`w-4 h-4 ${isExtracting ? 'animate-spin' : ''}`} />
            <span>
              {isExtracting ? '正在提炼 STAR 亮点...' : `提炼选中 (${selectedLogIds.size}) 条至简历`}
            </span>
          </button>
        </div>
      </div>

      {/* AI Extracted Result Banner */}
      {extractResult && (
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">AI 智能提炼生成的专业简历亮点</h3>
            </div>
            <span className="text-xs text-emerald-600 font-mono">
              已生成 {extractResult.suggestedBullets.length} 条高价值 STAR 论据
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            <span className="text-emerald-600 font-semibold">能力画像归纳：</span>
            {extractResult.summary}
          </p>

          <div className="space-y-3">
            {extractResult.suggestedBullets.map((b) => {
              const isApplied = appliedBulletIds.has(b.id);

              return (
                <div
                  key={b.id}
                  className="p-4 rounded-xl bg-white border border-emerald-500/30 space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 font-mono">
                        {b.companyOrProjectTarget}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        溯源：{b.evidenceSources?.join('、')}
                      </span>
                    </div>

                    <button
                      onClick={() => handleApplyBulletToResume(b)}
                      disabled={isApplied}
                      className={`flex items-center space-x-1 px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                        isApplied
                          ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/40'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>已同步注入当前简历</span>
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="w-3.5 h-3.5" />
                          <span>一键注入简历工作经历</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-emerald-700/90 font-mono leading-relaxed bg-emerald-50 p-3 rounded-lg border border-emerald-500/20">
                    {b.bulletText}
                  </p>

                  {/* STAR Breakdown */}
                  {b.starBreakdown && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                      <div>
                        <span className="text-blue-600 font-medium">[S/T 业务痛点]：</span>
                        {b.starBreakdown.situation}
                      </div>
                      <div>
                        <span className="text-emerald-600 font-medium">[A/R 方案与成效]：</span>
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
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={selectedLogIds.size === logs.length && logs.length > 0}
              onChange={handleSelectAll}
              className="rounded border-slate-200 text-emerald-600 focus:ring-emerald-500"
            />
            <h3 className="text-sm font-bold text-slate-900">
              已积累工作日志 ({logs.length} 条)
            </h3>
          </div>
          <span className="text-xs text-slate-500">已勾选 {selectedLogIds.size} 条用于提炼</span>
        </div>

        <div className="space-y-4">
          {logs.map((log) => {
            const isSelected = selectedLogIds.has(log.id);

            const categoryBadge =
              log.category === 'architecture'
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                : log.category === 'performance'
                ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                : log.category === 'ai_infra'
                ? 'bg-indigo-500/10 text-blue-600 border-indigo-500/20'
                : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';

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
                className={`p-5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-slate-100 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(log.id)}
                      className="mt-1 rounded border-slate-200 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-semibold text-slate-500">
                          {log.date}
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded border font-medium ${categoryBadge}`}>
                          {categoryLabel}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{log.projectOrModuleName}</h4>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed pt-1">
                        <span className="text-slate-500 font-medium">任务概要：</span>
                        {log.tasksCompleted}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      onClick={() => handleEditClick(log)}
                      className="p-1.5 text-slate-500 hover:text-slate-700 rounded"
                      title="编辑"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="p-1.5 text-slate-500 hover:text-red-600 rounded"
                      title="删除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Technical Challenges & Solutions */}
                <div className="mt-3 pl-7 space-y-2 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">
                    <span className="text-amber-600 font-semibold">【技术攻坚与解法】：</span>
                    {log.challengesAndSolutions}
                  </div>

                  {log.quantifiableMetrics && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-500/20 text-emerald-700">
                      <span className="font-semibold inline-flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5" />量化业务指标：</span>
                      <span className="ml-1 text-emerald-700/90">{log.quantifiableMetrics}</span>
                    </div>
                  )}

                  {/* Tech stack & Evidences */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex flex-wrap gap-1">
                      {log.technologiesUsed.map((tech, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {log.evidences && log.evidences.length > 0 && (
                      <div className="flex items-center space-x-1.5 text-[11px] text-blue-600">
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

      {/* Modal: Add/Edit Log */}
      {showAddLogModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingLogId ? '编辑工作日报' : '记录今日真实工作日报'}
              </h3>
              <button
                onClick={() => setShowAddLogModal(false)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLog} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">记录日期</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">所属分类</label>
                  <select
                    value={formCategory}
                    onChange={(e: any) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
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
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  所属项目或模块名称
                </label>
                <input
                  type="text"
                  required
                  placeholder="如：秒杀交易链路防超卖重构、微前端多实例沙箱改造"
                  value={formProject}
                  onChange={(e) => setFormProject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">今日完成任务概要</label>
                <textarea
                  rows={2}
                  required
                  placeholder="完成的任务概要、重构范围..."
                  value={formTasks}
                  onChange={(e) => setFormTasks(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  遇到的技术挑战与攻坚解法 (STAR 核心)
                </label>
                <textarea
                  rows={3}
                  placeholder="详细记录当时的瓶颈是什么（如锁冲突、内存膨胀、白屏），采取了什么方案（如Lua原子扣减、Proxy沙箱）..."
                  value={formChallenges}
                  onChange={(e) => setFormChallenges(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  可量化数据指标 (QPS/延时/构建耗时/错误率)
                </label>
                <input
                  type="text"
                  placeholder="如：P99延时从820ms降至38ms (95%)，QPS峰值支撑达12,000"
                  value={formMetrics}
                  onChange={(e) => setFormMetrics(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  涉及技术栈 (逗号分隔)
                </label>
                <input
                  type="text"
                  placeholder="Redis, Lua, RocketMQ, Vite, TypeScript"
                  value={formTechs}
                  onChange={(e) => setFormTechs(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Evidence inputs */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-medium text-slate-700">经历凭证绑定 (PR / 压测报告 / 架构文档)：</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="凭证名称 (如：JMeter压测对比报告.pdf)"
                    value={formEvidenceTitle}
                    onChange={(e) => setFormEvidenceTitle(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="PR链接或文档地址 (选填)"
                    value={formEvidenceUrl}
                    onChange={(e) => setFormEvidenceUrl(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLogModal(false)}
                  className="px-4 py-2 text-xs text-slate-500 hover:text-slate-900 bg-slate-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm"
                >
                  保存日报
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
