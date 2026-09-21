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
    <div className="space-y-4">
      {/* Action and Search Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜索面试公司、轮次、职位..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          id="btn-add-interview"
          onClick={onAddInterview}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors w-full sm:w-auto justify-center"
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
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {iv.companyName}
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {iv.round}
                  </span>
                  <span className="text-xs text-blue-600 font-medium">
                    {iv.position}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {iv.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {iv.durationMinutes} 分钟
                  </span>
                  {mediaCount > 0 && (
                    <span className="flex items-center gap-1 text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-md">
                      <Video className="w-3.5 h-3.5" />
                      {mediaCount} 个音视频录音
                    </span>
                  )}
                  {iv.aiFeedback && (
                    <span className="flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      评分 {iv.aiFeedback.overallScore} 分
                    </span>
                  )}
                </div>

                {iv.notes && (
                  <p className="text-xs text-slate-500 line-clamp-1 mt-1">
                    面经备忘: {iv.notes}
                  </p>
                )}
              </div>

              {/* Right side stats & action */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-right text-xs">
                  <div className="font-bold text-slate-800">
                    共 {questionsCount} 道考题
                  </div>
                  {unansweredCount > 0 ? (
                    <div className="text-[11px] text-red-600 font-medium">
                      {unansweredCount} 道未答上待攻克
                    </div>
                  ) : (
                    <div className="text-[11px] text-emerald-600 font-medium">
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
                    className="p-2 text-slate-300 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="p-2 text-slate-400 group-hover:text-blue-600 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center space-y-3">
            <Video className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-700">暂无符合条件的面试记录</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              记录每场面试的面经、录音与考题，AI 将为您提炼高频盲区并生成标准化复盘方案。
            </p>
            <button
              onClick={onAddInterview}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              立即新增第一场面试
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
