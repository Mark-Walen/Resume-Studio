import React, { useState } from 'react';
import { JobApplication, ApplicationStatus } from '../../types/job';
import {
  Plus,
  Search,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Edit3,
  Trash2,
  ArrowRight,
  UserCheck,
  Video,
  Globe,
  FileText,
  Clock,
  Sparkles,
  Link2,
  CheckCircle2,
  Bookmark,
  Send,
  HelpCircle,
  Archive
} from 'lucide-react';

interface JobPipelineProps {
  jobs: JobApplication[];
  onAddJob: () => void;
  onEditJob: (job: JobApplication) => void;
  onDeleteJob: (id: string) => void;
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
  onNavigateToInterview: (companyName: string) => void;
  onOpenJobProxy?: () => void;
  onOpenDossier?: (job: JobApplication) => void;
  onOpenCalendar?: () => void;
  onOpenJdRecommend?: (job: JobApplication) => void;
}

const COLUMNS: Array<{ id: ApplicationStatus; title: string; color: string; badgeColor: string; icon: React.FC<{ className?: string }> }> = [
  { id: 'wishlist', title: '预投递目标', color: 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50', badgeColor: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300', icon: Bookmark },
  { id: 'applied', title: '已投递简历', color: 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40', badgeColor: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300', icon: Send },
  { id: 'screening', title: '筛选与初筛', color: 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40', badgeColor: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300', icon: Clock },
  { id: 'interviewing', title: '面试推进中', color: 'border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20', badgeColor: 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300', icon: Video },
  { id: 'offer', title: '已斩获 Offer', color: 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20', badgeColor: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300', icon: CheckCircle2 },
  { id: 'rejected', title: '未通过/归档', color: 'border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30', badgeColor: 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400', icon: Archive },
];

export const JobPipeline: React.FC<JobPipelineProps> = ({
  jobs,
  onAddJob,
  onEditJob,
  onDeleteJob,
  onUpdateStatus,
  onNavigateToInterview,
  onOpenJobProxy,
  onOpenDossier,
  onOpenCalendar,
  onOpenJdRecommend,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const filteredJobs = jobs.filter(j => {
    const matchesSearch =
      j.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || j.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  // Calculate stats
  const totalCount = jobs.length;
  const wishlistCount = jobs.filter(j => j.status === 'wishlist').length;
  const interviewingCount = jobs.filter(j => j.status === 'interviewing').length;
  const offerCount = jobs.filter(j => j.status === 'offer').length;

  return (
    <div className="space-y-4 font-sans">
      {/* Top Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">预投递与目标储备</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{wishlistCount} <span className="text-xs font-normal text-slate-400">家企业</span></div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">总跟踪投递</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalCount} <span className="text-xs font-normal text-slate-400">个岗位</span></div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">正在面试中</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{interviewingCount} <span className="text-xs font-normal text-slate-400">个流程</span></div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">斩获 Offer</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{offerCount} <span className="text-xs font-normal text-slate-400">个意向</span></div>
        </div>
      </div>

      {/* Filter and Actions Bar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索公司名、职位..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
            />
          </div>
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <option value="all">全部优先级</option>
            <option value="high">重点关注 (高)</option>
            <option value="medium">常规意向 (中)</option>
            <option value="low">储备兜底 (低)</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onOpenJobProxy && (
            <button
              id="btn-proxy-job"
              onClick={onOpenJobProxy}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium transition-colors w-full sm:w-auto justify-center cursor-pointer"
              title="输入招聘网址或粘贴JD，智能解析并一键加入意向池"
            >
              <Globe className="w-3.5 h-3.5 text-[#0071e3]" />
              <span>网站代理获取 JD</span>
            </button>
          )}

          <button
            id="btn-add-job"
            onClick={onAddJob}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors w-full sm:w-auto justify-center cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新增目标公司/投递</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 items-start">
        {COLUMNS.map(col => {
          const colJobs = filteredJobs.filter(j => j.status === col.id);
          const ColIcon = col.icon;

          return (
            <div key={col.id} className={`rounded-xl border p-3 flex flex-col min-h-[480px] ${col.color}`}>
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center space-x-1.5">
                  <ColIcon className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{col.title}</span>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${col.badgeColor}`}>
                  {colJobs.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-2.5 flex-1">
                {colJobs.map(job => (
                  <div
                    key={job.id}
                    className="bg-white dark:bg-slate-800/90 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs hover:shadow-sm transition-all text-xs relative group"
                  >
                    {/* Top Row */}
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white text-sm block leading-snug">{job.companyName}</span>
                        <span className="text-slate-600 dark:text-slate-400 font-medium">{job.position}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => onEditJob(job)}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5"
                          title="编辑详情"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteJob(job.id)}
                          className="text-slate-400 hover:text-red-500 p-0.5"
                          title="删除记录"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap gap-1.5 my-2 text-[11px] text-slate-500 dark:text-slate-400">
                      {job.salary && (
                        <span className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700">
                          <DollarSign className="w-2.5 h-2.5" />
                          {job.salary}
                        </span>
                      )}
                      {job.location && (
                        <span className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700">
                          <MapPin className="w-2.5 h-2.5" />
                          {job.location}
                        </span>
                      )}
                      {job.scheduledInterviewDate && (
                        <span className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(job.scheduledInterviewDate).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                        </span>
                      )}
                    </div>

                    {/* Dossier status badge if filled */}
                    {job.companyDossier && (
                      <div className="mb-2 p-1.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">已建背调档案</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {job.companyDossier.reverseQuestions?.length || 0} 反问
                        </span>
                      </div>
                    )}

                    {/* Action Links */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between gap-1 flex-wrap">
                      <div className="flex items-center space-x-1">
                        {onOpenDossier && (
                          <button
                            type="button"
                            onClick={() => onOpenDossier(job)}
                            className="text-[11px] text-slate-600 dark:text-slate-400 hover:text-[#0071e3] dark:hover:text-[#0071e3] hover:bg-slate-100 dark:hover:bg-slate-700 px-1.5 py-0.5 rounded transition-colors"
                          >
                            背调档案
                          </button>
                        )}
                        {onOpenJdRecommend && job.jobDescription && (
                          <button
                            type="button"
                            onClick={() => onOpenJdRecommend(job)}
                            className="text-[11px] text-slate-600 dark:text-slate-400 hover:text-[#0071e3] dark:hover:text-[#0071e3] hover:bg-slate-100 dark:hover:bg-slate-700 px-1.5 py-0.5 rounded transition-colors flex items-center gap-0.5"
                            title="根据此岗位JD提取推荐考点"
                          >
                            <Sparkles className="w-3 h-3 text-[#0071e3]" />
                            <span>提考点</span>
                          </button>
                        )}
                      </div>

                      {/* Move to next status dropdown */}
                      <select
                        value={job.status}
                        onChange={(e) => onUpdateStatus(job.id, e.target.value as ApplicationStatus)}
                        className="text-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1 py-0.5 text-slate-700 dark:text-slate-300"
                      >
                        {COLUMNS.map(c => (
                          <option key={c.id} value={c.id}>
                            移至: {c.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Mock Interview Launch Button if in interview status */}
                    {job.status === 'interviewing' && (
                      <div className="mt-2 pt-1.5 border-t border-amber-100 dark:border-amber-900/40">
                        <button
                          type="button"
                          onClick={() => onNavigateToInterview(job.companyName)}
                          className="w-full py-1 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors shadow-2xs cursor-pointer"
                        >
                          <Video className="w-3 h-3" />
                          <span>发起模拟面试</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
