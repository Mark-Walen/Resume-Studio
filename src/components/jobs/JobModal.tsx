import React, { useState } from 'react';
import { JobApplication, ApplicationStatus } from '../../types/job';
import { showAppMessage } from '../common/AppFeedback';
import {
  X,
  Building2,
  Bookmark,
  Send,
  Search,
  Mic,
  Trophy,
  Archive,
  Flame,
  Zap,
  Sprout,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'wishlist', label: '预投递目标', icon: Bookmark },
  { value: 'applied', label: '已投递简历', icon: Send },
  { value: 'screening', label: '简历筛选通过', icon: Search },
  { value: 'interviewing', label: '面试中', icon: Mic },
  { value: 'offer', label: '已拿 Offer', icon: Trophy },
  { value: 'rejected', label: '未通过/归档', icon: Archive },
] as const;

const PRIORITY_OPTIONS = [
  { value: 'high', label: '重点关注', hint: '高', icon: Flame },
  { value: 'medium', label: '常规意向', hint: '中', icon: Zap },
  { value: 'low', label: '储备兜底', hint: '低', icon: Sprout },
] as const;

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (app: JobApplication) => void;
  editingJob?: JobApplication | null;
}

export const JobModal: React.FC<JobModalProps> = ({ isOpen, onClose, onSave, editingJob }) => {
  const [formData, setFormData] = useState<Partial<JobApplication>>(editingJob || {
    companyName: '',
    position: '',
    salaryExpectation: '',
    location: '',
    status: 'wishlist',
    priority: 'high',
    source: 'Boss直聘',
    recruiterContact: '',
    jobDescription: '',
    notes: '',
    wishlistTargetDate: new Date().toISOString().split('T')[0]
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName?.trim() || !formData.position?.trim()) {
      showAppMessage('请填写公司名称与目标岗位！', 'warning');
      return;
    }

    const application: JobApplication = {
      id: editingJob?.id || 'job-' + Date.now(),
      companyName: formData.companyName.trim(),
      position: formData.position.trim(),
      salaryExpectation: formData.salaryExpectation?.trim(),
      location: formData.location?.trim(),
      status: formData.status as ApplicationStatus,
      priority: formData.priority as 'high' | 'medium' | 'low',
      source: formData.source?.trim(),
      recruiterContact: formData.recruiterContact?.trim(),
      jobDescription: formData.jobDescription?.trim(),
      appliedDate: formData.status === 'applied' ? (formData.appliedDate || new Date().toISOString().split('T')[0]) : formData.appliedDate,
      wishlistTargetDate: formData.wishlistTargetDate,
      notes: formData.notes?.trim(),
      updatedAt: new Date().toISOString().split('T')[0]
    };

    onSave(application);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#0071e3]" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {editingJob ? '编辑投递与目标公司' : '新建预投递/投递记录'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs max-h-[75vh] overflow-y-auto font-sans">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">公司名称 *</label>
              <input
                type="text"
                required
                placeholder="如: 字节跳动、腾讯、微软"
                value={formData.companyName || ''}
                onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">目标岗位 *</label>
              <input
                type="text"
                required
                placeholder="如: 资深全栈工程师 / 架构师"
                value={formData.position || ''}
                onChange={e => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
              />
            </div>
          </div>

          <div className="space-y-3">
            <fieldset>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">投递状态</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {STATUS_OPTIONS.map(option => {
                  const Icon = option.icon;
                  const selected = formData.status === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setFormData({ ...formData, status: option.value })}
                      className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-2 text-left font-semibold transition-colors ${selected ? 'border-[#0071e3] bg-blue-50 text-[#0071e3] dark:bg-blue-950/40' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}
                    >
                      <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <fieldset>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">意向优先级</label>
              <div className="grid grid-cols-3 gap-1.5">
                {PRIORITY_OPTIONS.map(option => {
                  const Icon = option.icon;
                  const selected = formData.priority === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setFormData({ ...formData, priority: option.value })}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2 font-semibold transition-colors ${selected ? 'border-[#0071e3] bg-blue-50 text-[#0071e3] dark:bg-blue-950/40' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{option.label} ({option.hint})</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">期望薪资 / Package</label>
              <input
                type="text"
                placeholder="如: 45k - 60k · 16薪"
                value={formData.salaryExpectation || ''}
                onChange={e => setFormData({ ...formData, salaryExpectation: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">工作地点</label>
              <input
                type="text"
                placeholder="如: 北京 / 杭州 / 远程"
                value={formData.location || ''}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">招聘来源 / 渠道</label>
              <input
                type="text"
                placeholder="如: 猎头推荐 / 员工内推 / Boss"
                value={formData.source || ''}
                onChange={e => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">HR / 猎头联系方式</label>
              <input
                type="text"
                placeholder="如: 微信 / 邮箱 / 电话"
                value={formData.recruiterContact || ''}
                onChange={e => setFormData({ ...formData, recruiterContact: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">岗位职责描述 (JD)</label>
            <textarea
              rows={2}
              placeholder="粘贴核心岗位JD要求或技术考点..."
              value={formData.jobDescription || ''}
              onChange={e => setFormData({ ...formData, jobDescription: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">跟踪备忘 / 最新进展笔记</label>
            <textarea
              rows={2}
              placeholder="记录沟通进度、面试反馈关键信息..."
              value={formData.notes || ''}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#0071e3] hover:bg-[#0077ed] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              保存记录
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
