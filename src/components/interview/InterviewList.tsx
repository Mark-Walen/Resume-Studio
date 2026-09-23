import React, { useState } from 'react';
import { InterviewRecord } from '../../types/interview';
import { Plus, Video, Music, Sparkles, ChevronRight, Trash2, Calendar, Clock, Search, HelpCircle, CheckCircle2 } from 'lucide-react';

interface InterviewListProps {
  interviews: InterviewRecord[];
  onSelectInterview: (id: string) => void;
  onAddInterview: () => void;
  onDeleteInterview: (id: string) => void;
}

export const InterviewList: React.FC<InterviewListProps> = ({
  interviews,
  onSelectInterview,
  onAddInterview,
  onDeleteInterview,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = interviews.filter(iv =>
    iv.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    iv.round.toLowerCase().includes(searchTerm.toLowerCase()) ||
    iv.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 font-sans">
      {/* Action and Search Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜索面试公司、轮次、职位..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0071e3]"
          />
        </div>

        <button
          id="btn-add-interview"
          onClick={onAddInterview}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-xs font-bold shadow-xs transition-colors w-full sm:w-auto justify-center cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          新增面试复盘 (含音视频)
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map(iv => {
          const mediaCount = iv.mediaAttachments?.length || 0;
          const questionsCount = iv.questions?.length || 0;
          const unansweredCount = iv.questions?.filter(q => q.struggleLevel === 'unanswered').length || 0;

          return (
            <div
              key={iv.id}
              onClick={() => onSelectInterview(iv.id)}
              className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#0071e3] dark:hover:border-[#0071e3] hover:shadow-sm transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#0071e3] transition-colors">
                    {iv.companyName}
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {iv.round}
                  </span>
                  <span className="text-xs text-[#0071e3] font-medium">
                    {iv.position}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {iv.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {iv.durationMinutes} 分钟
                  </span>
                  {mediaCount > 0 && (
                    <span className="flex items-center gap-1 text-[#0071e3] font-medium bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-900/50">
                      <Video className="w-3.5 h-3.5" />
                      {mediaCount} 个音视频录音
                    </span>
                  )}
                  {iv.aiFeedback && (
                    <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900/50">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      评分 {iv.aiFeedback.overallScore} 分
                    </span>
                  )}
                </div>

                {iv.notes && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                    面经备忘: {iv.notes}
                  </p>
                )}
              </div>

              {/* Right side stats & action */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <div className="text-right text-xs">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    共 {questionsCount} 道考题
                  </div>
                  {unansweredCount > 0 ? (
                    <div className="text-[11px] text-red-600 dark:text-red-400 font-medium">
                      {unansweredCount} 道未答上待攻克
                    </div>
                  ) : (
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      全部流利掌握
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('确定删除该场面试记录吗？')) {
                        onDeleteInterview(iv.id);
                      }
                    }}
                    className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="p-2 text-slate-400 dark:text-slate-500 group-hover:text-[#0071e3] transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
