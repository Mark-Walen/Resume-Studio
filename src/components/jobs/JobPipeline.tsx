import React, { useState } from 'react';
import { JobApplication, ApplicationStatus } from '../../types/job';
import { Plus, Search, Building2, MapPin, DollarSign, Calendar, Edit3, Trash2, ArrowRight, UserCheck, Video, Globe } from 'lucide-react';

interface JobPipelineProps {
  jobs: JobApplication[];
  onAddJob: () => void;
  onEditJob: (job: JobApplication) => void;
  onDeleteJob: (id: string) => void;
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
  onNavigateToInterview: (companyName: string) => void;
  onOpenJobProxy?: () => void;
}


const COLUMNS: Array<{ id: ApplicationStatus; title: string; color: string; badgeColor: string }> = [
  { id: 'wishlist', title: '🎯 预投递目标', color: 'border-slate-300 bg-slate-50/50', badgeColor: 'bg-slate-200 text-slate-700' },
  { id: 'applied', title: '📨 已投递简历', color: 'border-blue-300 bg-blue-50/30', badgeColor: 'bg-blue-100 text-blue-700' },
  { id: 'screening', title: '🔎 筛选与初筛', color: 'border-purple-300 bg-purple-50/30', badgeColor: 'bg-purple-100 text-purple-700' },
  { id: 'interviewing', title: '🎙️ 面试推进中', color: 'border-amber-300 bg-amber-50/30', badgeColor: 'bg-amber-100 text-amber-800' },
  { id: 'offer', title: '🎉 已斩获 Offer', color: 'border-emerald-300 bg-emerald-50/30', badgeColor: 'bg-emerald-100 text-emerald-800' },
  { id: 'rejected', title: '📁 未通过/归档', color: 'border-slate-200 bg-slate-50/20', badgeColor: 'bg-slate-100 text-slate-500' }
];

export const JobPipeline: React.FC<JobPipelineProps> = ({
  jobs,
  onAddJob,
  onEditJob,
  onDeleteJob,
  onUpdateStatus,
  onNavigateToInterview,
  onOpenJobProxy,
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
    <div className="space-y-4">
      {/* Top Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">预投递与目标储备</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{wishlistCount} <span className="text-xs font-normal text-slate-400">家企业</span></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">总跟踪投递</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{totalCount} <span className="text-xs font-normal text-slate-400">个岗位</span></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">正在面试中</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{interviewingCount} <span className="text-xs font-normal text-slate-400">个流程</span></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">斩获 Offer</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{offerCount} <span className="text-xs font-normal text-slate-400">个意向</span></div>
        </div>
      </div>

      {/* Filter and Actions Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索公司名、职位..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700"
          >
            <option value="all">全部优先级</option>
            <option value="high">🔥 重点关注</option>
            <option value="medium">⚡ 常规意向</option>
            <option value="low">🌱 储备兜底</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onOpenJobProxy && (
            <button
              id="btn-proxy-job"
              onClick={onOpenJobProxy}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold shadow-2xs transition-colors w-full sm:w-auto justify-center"
              title="输入招聘网址或粘贴JD，智能解析并一键加入意向池"
            >
              <Globe className="w-3.5 h-3.5" />
              网站代理获取 JD
            </button>
          )}

          <button
            id="btn-add-job"
            onClick={onAddJob}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors w-full sm:w-auto justify-center"
          >
            <Plus className="w-3.5 h-3.5" />
            新增目标公司/投递
          </button>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 items-start">
        {COLUMNS.map(col => {
          const colJobs = filteredJobs.filter(j => j.status === col.id);

          return (
            <div key={col.id} className={`rounded-xl border p-3 flex flex-col min-h-[500px] ${col.color}`}>
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80">
                <span className="text-xs font-bold text-slate-800">{col.title}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${col.badgeColor}`}>
                  {colJobs.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-2.5 flex-1">
                {colJobs.map(job => (
                  <div
                    key={job.id}
                    className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm transition-all text-xs relative group"
                  >
                    {/* Top Row */}
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1">
                          {job.companyName}
                          {job.priority === 'high' && <span className="text-[10px] text-red-500 font-bold">🔥</span>}
                        </h4>
                        <p className="text-slate-600 font-medium text-[11px] mt-0.5">{job.position}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={() => onEditJob(job)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                          title="编辑"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDeleteJob(job.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata tags */}
                    <div className="space-y-1 my-2 text-[10px] text-slate-500">
                      {job.salaryExpectation && (
                        <div className="flex items-center gap-1 text-amber-700 font-medium">
                          <DollarSign className="w-3 h-3 flex-shrink-0" />
                          <span>{job.salaryExpectation}</span>
                        </div>
                      )}
                      {job.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span>{job.location}</span>
                        </div>
                      )}
                      {job.source && (
                        <div className="text-slate-400">
                          渠道: {job.source}
                        </div>
                      )}
                      {job.notes && (
                        <div className="bg-slate-50 p-1.5 rounded text-[10px] text-slate-600 line-clamp-2 mt-1">
                          {job.notes}
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[10px]">
                      {job.status === 'interviewing' ? (
                        <button
                          onClick={() => onNavigateToInterview(job.companyName)}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold"
                        >
                          <Video className="w-3 h-3" />
                          查看面试记录
                        </button>
                      ) : (
                        <span className="text-slate-400">{job.updatedAt}</span>
                      )}

                      {/* Status select */}
                      <select
                        value={job.status}
                        onChange={e => onUpdateStatus(job.id, e.target.value as ApplicationStatus)}
                        className="text-[10px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5"
                      >
                        <option value="wishlist">🎯 预投递</option>
                        <option value="applied">📨 已投递</option>
                        <option value="screening">🔎 初筛中</option>
                        <option value="interviewing">🎙️ 面试中</option>
                        <option value="offer">🎉 Offer</option>
                        <option value="rejected">📁 归档</option>
                      </select>
                    </div>
                  </div>
                ))}

                {colJobs.length === 0 && (
                  <div className="h-24 border-2 border-dashed border-slate-200/60 rounded-xl flex items-center justify-center text-[11px] text-slate-400">
                    暂无记录
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
