import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Phone,
  MapPin,
  Bell,
  BellRing,
  ExternalLink,
  Plus,
  CheckCircle2,
  AlertCircle,
  Building,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Play
} from 'lucide-react';
import { JobApplication } from '../types/job';

interface InterviewCalendarViewProps {
  jobApplications: JobApplication[];
  onUpdateApplication: (app: JobApplication) => void;
  onStartMockInterview?: (companyName: string, round: string, position: string) => void;
  onOpenDossier?: (app: JobApplication) => void;
}

export const InterviewCalendarView: React.FC<InterviewCalendarViewProps> = ({
  jobApplications,
  onUpdateApplication,
  onStartMockInterview,
  onOpenDossier,
}) => {
  const [selectedAppId, setSelectedAppId] = useState<string>(jobApplications[0]?.id || '');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Form state
  const [formDate, setFormDate] = useState('2026-09-24T14:30');
  const [formRound, setFormRound] = useState('二面技术深度面');
  const [formFormat, setFormFormat] = useState<'线上视频' | '电话面试' | '现场面试'>('线上视频');
  const [formMeetingUrl, setFormMeetingUrl] = useState('');
  const [formReminderEnabled, setFormReminderEnabled] = useState(true);
  const [formReminderMinutes, setFormReminderMinutes] = useState(30);

  // Filter scheduled applications
  const scheduledApps = jobApplications
    .filter((a) => !!a.scheduledInterviewDate)
    .sort((a, b) => new Date(a.scheduledInterviewDate!).getTime() - new Date(b.scheduledInterviewDate!).getTime());

  // Find next closest upcoming interview
  const now = new Date();
  const upcomingInterviews = scheduledApps.filter((a) => new Date(a.scheduledInterviewDate!).getTime() >= now.getTime() - 3600000);
  const nextInterview = upcomingInterviews.length > 0 ? upcomingInterviews[0] : null;

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const app = jobApplications.find((a) => a.id === selectedAppId);
    if (!app) return;

    const updated: JobApplication = {
      ...app,
      scheduledInterviewDate: formDate,
      scheduledInterviewRound: formRound,
      scheduledInterviewFormat: formFormat,
      scheduledInterviewMeetingUrl: formMeetingUrl.trim(),
      reminderEnabled: formReminderEnabled,
      reminderMinutesBefore: formReminderMinutes,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    onUpdateApplication(updated);
    setShowScheduleModal(false);
  };

  const calculateCountdown = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    if (diff < 0) return '进行中或已结束';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remainHours = hours % 24;

    if (days > 0) {
      return `倒计时 ${days} 天 ${remainHours} 小时`;
    }
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    return `倒计时 ${remainHours} 小时 ${mins} 分钟`;
  };

  return (
    <div id="interview-calendar-view" className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">面试日历与开考提醒</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              日程管理 & 提醒
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            聚合所有投递记录中的面试排期，提供时间倒计时、视频会议直达与提前开考提醒，临考随时发起针对性模拟面试。
          </p>
        </div>

        <button
          id="btn-schedule-new-interview"
          onClick={() => {
            if (jobApplications.length > 0) setSelectedAppId(jobApplications[0].id);
            setShowScheduleModal(true);
          }}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>登记新面试排期</span>
        </button>
      </div>

      {/* Next Upcoming Highlight Card */}
      {nextInterview && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/40 border border-indigo-500/40 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400">
                <BellRing className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    下一场临近面试
                  </span>
                  <span className="text-xs text-amber-400 font-mono font-semibold">
                    {calculateCountdown(nextInterview.scheduledInterviewDate!)}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  {nextInterview.companyName} · {nextInterview.scheduledInterviewRound || '技术面试'}
                </h3>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              {onStartMockInterview && (
                <button
                  onClick={() =>
                    onStartMockInterview(
                      nextInterview.companyName,
                      nextInterview.scheduledInterviewRound || '核心技术面',
                      nextInterview.position
                    )
                  }
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>临考全真模拟</span>
                </button>
              )}

              {nextInterview.scheduledInterviewMeetingUrl && (
                <a
                  href={nextInterview.scheduledInterviewMeetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>进入会议室</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-indigo-500/20 text-xs">
            <div className="flex items-center space-x-2 text-slate-300">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>
                时间：{new Date(nextInterview.scheduledInterviewDate!).toLocaleString('zh-CN', {
                  month: 'numeric',
                  day: 'numeric',
                  weekday: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <Video className="w-4 h-4 text-emerald-400" />
              <span>形式：{nextInterview.scheduledInterviewFormat || '线上视频'}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <Bell className="w-4 h-4 text-purple-400" />
              <span>
                提醒：
                {nextInterview.reminderEnabled
                  ? `已开启 (提前 ${nextInterview.reminderMinutesBefore || 30} 分钟)`
                  : '未开启'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Interviews Timeline List */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white">所有已排期面试日程 ({scheduledApps.length})</h3>
          <span className="text-xs text-slate-500">按时间先后排序</span>
        </div>

        {scheduledApps.length > 0 ? (
          <div className="space-y-4">
            {scheduledApps.map((app) => {
              const isUpcoming = new Date(app.scheduledInterviewDate!).getTime() >= Date.now();

              return (
                <div
                  key={app.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isUpcoming
                      ? 'bg-slate-800/60 border-slate-700/80 hover:border-indigo-500/50'
                      : 'bg-slate-900/40 border-slate-800/80 opacity-70'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                        {new Date(app.scheduledInterviewDate!).toLocaleString('zh-CN', {
                          month: 'numeric',
                          day: 'numeric',
                          weekday: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded font-mono ${
                          isUpcoming
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {calculateCountdown(app.scheduledInterviewDate!)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <h4 className="text-base font-bold text-white">{app.companyName}</h4>
                      <span className="text-xs text-slate-400">· {app.position}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>轮次：{app.scheduledInterviewRound || '常规技术面'}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Video className="w-3.5 h-3.5 text-slate-500" />
                        <span>形式：{app.scheduledInterviewFormat || '线上视频'}</span>
                      </span>
                      {app.reminderEnabled && (
                        <span className="flex items-center space-x-1 text-emerald-400 font-mono">
                          <Bell className="w-3.5 h-3.5" />
                          <span>开考前 {app.reminderMinutesBefore || 30}m 提醒</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2.5 flex-wrap">
                    {onOpenDossier && (
                      <button
                        onClick={() => onOpenDossier(app)}
                        className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                      >
                        查看企业背调
                      </button>
                    )}

                    {onStartMockInterview && isUpcoming && (
                      <button
                        onClick={() =>
                          onStartMockInterview(
                            app.companyName,
                            app.scheduledInterviewRound || '核心技术面',
                            app.position
                          )
                        }
                        className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>模拟此轮面试</span>
                      </button>
                    )}

                    {app.scheduledInterviewMeetingUrl && (
                      <a
                        href={app.scheduledInterviewMeetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center space-x-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm"
                      >
                        <Video className="w-3 h-3" />
                        <span>进入会议室</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 space-y-3">
            <CalendarIcon className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm">暂无已登记的面试排期，点击上方按钮登记即将到来的面试吧！</p>
          </div>
        )}
      </div>

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">登记 / 修改面试排期</h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">选择目标投递公司</label>
                <select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {jobApplications.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.companyName} - {j.position}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">面试时间</label>
                  <input
                    type="datetime-local"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">面试形式</label>
                  <select
                    value={formFormat}
                    onChange={(e: any) => setFormFormat(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="线上视频">线上视频 (飞书/腾讯/钉钉)</option>
                    <option value="电话面试">电话面试</option>
                    <option value="现场面试">现场面试</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">面试轮次名称</label>
                <input
                  type="text"
                  placeholder="如：二面技术深度面 / 三面总监交叉面"
                  value={formRound}
                  onChange={(e) => setFormRound(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  视频会议链接或电话号码
                </label>
                <input
                  type="text"
                  placeholder="如：https://meeting.feishu.cn/j/829102938"
                  value={formMeetingUrl}
                  onChange={(e) => setFormMeetingUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Reminder Settings */}
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-200 flex items-center space-x-1.5">
                    <Bell className="w-3.5 h-3.5 text-indigo-400" />
                    <span>开启面试开考提醒</span>
                  </label>
                  <input
                    type="checkbox"
                    checked={formReminderEnabled}
                    onChange={(e) => setFormReminderEnabled(e.target.checked)}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>

                {formReminderEnabled && (
                  <div className="flex items-center space-x-2 pt-1 text-xs">
                    <span className="text-slate-400">提前：</span>
                    {[15, 30, 60, 1440].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setFormReminderMinutes(mins)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                          formReminderMinutes === mins
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {mins < 60 ? `${mins}m` : mins === 60 ? '1h' : '1天'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm"
                >
                  保存排期
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
