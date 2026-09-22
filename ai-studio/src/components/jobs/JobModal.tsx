import React, { useState } from 'react';
import { JobApplication, ApplicationStatus } from '../../types/job';
import { X, Building2, Briefcase, DollarSign, MapPin, Calendar, UserCheck } from 'lucide-react';

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
      alert('请填写公司名称与目标岗位！');
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
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              {editingJob ? '编辑投递与目标公司' : '新建预投递/投递记录'}
            </h2>
          </div>
          <button onClick={onClose} aria-label="关闭" className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">公司名称 *</label>
              <input
                type="text"
                required
                placeholder="如: 大疆创新、乐鑫科技、Nordic"
                value={formData.companyName || ''}
                onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">目标岗位 *</label>
              <input
                type="text"
                required
                placeholder="如: 嵌入式软件工程师 / 固件工程师"
                value={formData.position || ''}
                onChange={e => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">投递状态</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="wishlist">预投递目标</option>
                <option value="applied">已投递简历</option>
                <option value="screening">简历筛选通过</option>
                <option value="interviewing">面试中</option>
                <option value="offer">已获得 Offer</option>
                <option value="rejected">未通过 / 归档</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">意向优先级</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="high">重点关注</option>
                <option value="medium">常规意向</option>
                <option value="low">储备目标</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">期望薪资 / Package</label>
              <input
                type="text"
                placeholder="如: 45k - 60k · 16薪"
                value={formData.salaryExpectation || ''}
                onChange={e => setFormData({ ...formData, salaryExpectation: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">工作地点</label>
              <input
                type="text"
                placeholder="如: 北京 / 杭州 / 远程"
                value={formData.location || ''}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">招聘来源 / 渠道</label>
              <input
                type="text"
                placeholder="如: 猎头推荐 / 员工内推 / Boss"
                value={formData.source || ''}
                onChange={e => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">HR / 猎头联系方式</label>
              <input
                type="text"
                placeholder="如: 微信 / 邮箱 / 电话"
                value={formData.recruiterContact || ''}
                onChange={e => setFormData({ ...formData, recruiterContact: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">岗位职责描述 (JD) / 重点关注点</label>
            <textarea
              rows={2}
              placeholder="粘贴核心岗位JD要求或技术考点..."
              value={formData.jobDescription || ''}
              onChange={e => setFormData({ ...formData, jobDescription: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">跟踪备忘 / 最新进展笔记</label>
            <textarea
              rows={2}
              placeholder="记录沟通进度、面试反馈关键信息..."
              value={formData.notes || ''}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              保存记录
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
