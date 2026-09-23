import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Phone,
  MapPin,
  BellRing,
  ExternalLink,
  Plus,
  CheckCircle2,
  AlertCircle,
  Building,
  Sparkles,
  Play,
  CalendarCheck,
  ChevronRight,
  ShieldCheck,
  X
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
      scheduledInterviewReminderMinutes: formReminderEnabled ? formReminderMinutes : undefined,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    onUpdateApplication(updated);
    setShowScheduleModal(false);
  };

  const calculateCountdown = (dateString: string) => {
    const target = new Date(dateString).getTime();
    const diff = target - now.getTime();
    if (diff <= 0) return '已到期 / 进行中';

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
    <div id="interview-calendar-view" className="space-y-6 font-sans">
      {/* Top Banner (Apple HIG Theme) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              面试日程与开考提醒
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
              共 {scheduledApps.length} 场排期
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            聚合所有目标企业投递记录中的面试排期，提供时间倒计时、视频会议直达与提前开考提醒，临考随时发起针对性模拟面试。
          </p>
        </div>

        <button
          id="btn-schedule-new-interview"
          onClick={() => {
            if (jobApplications.length > 0) setSelectedAppId(jobApplications[0].id);
            setShowScheduleModal(true);
          }}
          className="flex items-center space-x-1.5 px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex-shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>登记新面试排期</span>
        </button>
      </div>

      {/* Next Upcoming Highlight Card (Apple HIG Accent) */}
      {nextInterview && (
        <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-amber-700 dark:text-amber-300">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800/60">
                    下一场临近面试
                  </span>
                  <span className="text-xs text-amber-700 dark:text-amber-300 font-mono font-bold">
                    {calculateCountdown(nextInterview.scheduledInterviewDate!)}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {nextInterview.companyName} · {nextInterview.scheduledInterviewRound || '技术面试'}
                </h3>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {onStartMockInterview && (
                <button
                  onClick={() =>
                    onStartMockInterview(
                      nextInterview.companyName,
                      nextInterview.scheduledInterviewRound || '核心技术面',
                      nextInterview.position
                    )
                  }
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>临考模拟</span>
                </button>
              )}

              {nextInterview.scheduledInterviewMeetingUrl && (
                <a
                  href={nextInterview.scheduledInterviewMeetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-xl shadow-xs transition-colors"
                >
                  <Video className="w-3.5 h-3.5 text-[#0071e3]" />
                  <span>进入会议室</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 text-slate-400" />
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-amber-200/60 dark:border-amber-900/40 text-xs">
            <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
              <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>
                {new Date(nextInterview.scheduledInterviewDate!).toLocaleString('zh-CN', {
                  month: 'numeric',
                  day: 'numeric',
                  weekday: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
              <Building className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>{nextInterview.position}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>
                {nextInterview.scheduledInterviewReminderMinutes
                  ? `开考前 ${nextInterview.scheduledInterviewReminderMinutes} 分钟提醒`
                  : '已设置日程'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Applications List */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <CalendarCheck className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">全部已排期面试清单</h3>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">按时间先后顺序排列</span>
        </div>

        {scheduledApps.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
            <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p>暂无已排期的面试日程</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              点击上方「登记新面试排期」，录入收到的 HR 面试邀请
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {scheduledApps.map((app) => (
              <div
                key={app.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 -mx-2 px-2 rounded-xl transition-colors text-xs"
              >
                <div className="flex items-start sm:items-center space-x-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-200 font-bold flex-shrink-0">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{app.companyName}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-medium">· {app.position}</span>
                      <span className="px-2 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-full font-medium text-[11px]">
                        {app.scheduledInterviewRound || '面试'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 dark:text-slate-400 mt-1">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span className="font-mono">
                          {new Date(app.scheduledInterviewDate!).toLocaleString('zh-CN', {
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </span>
                      <span>形式：{app.scheduledInterviewFormat || '线上视频'}</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
                        {calculateCountdown(app.scheduledInterviewDate!)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-auto flex-shrink-0">
                  {onOpenDossier && (
                    <button
                      type="button"
                      onClick={() => onOpenDossier(app)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors cursor-pointer"
                    >
                      背调档案
                    </button>
                  )}

                  {app.scheduledInterviewMeetingUrl && (
                    <a
                      href={app.scheduledInterviewMeetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors flex items-center space-x-1"
                    >
                      <Video className="w-3.5 h-3.5 text-[#0071e3]" />
                      <span>会议室</span>
                    </a>
                  )}

                  {onStartMockInterview && (
                    <button
                      type="button"
                      onClick={() =>
                        onStartMockInterview(
                          app.companyName,
                          app.scheduledInterviewRound || '深度技术面',
                          app.position
                        )
                      }
                      className="px-3 py-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-lg font-semibold transition-colors cursor-pointer shadow-xs"
                    >
                      发起模拟
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/60">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">登记面试排期</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="p-5 space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">选择投递记录 *</label>
                <select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#0071e3]"
                >
                  {jobApplications.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.companyName} - {j.position}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">面试时间 *</label>
                <input
                  type="datetime-local"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#0071e3] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">面试轮次</label>
                  <input
                    type="text"
                    value={formRound}
                    onChange={(e) => setFormRound(e.target.value)}
                    placeholder="如: 二面核心业务架构"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#0071e3]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">面试形式</label>
                  <select
                    value={formFormat}
                    onChange={(e) => setFormFormat(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#0071e3]"
                  >
                    <option value="线上视频">线上视频会议</option>
                    <option value="电话面试">电话沟通</option>
                    <option value="现场面试">现场 Onsite 面试</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">会议链接 / 房间号</label>
                <input
                  type="text"
                  value={formMeetingUrl}
                  onChange={(e) => setFormMeetingUrl(e.target.value)}
                  placeholder="腾讯会议 / 飞书会议 / 钉钉会议链接"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#0071e3] font-mono"
                />
              </div>

              <div className="pt-1 flex items-center justify-between">
                <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formReminderEnabled}
                    onChange={(e) => setFormReminderEnabled(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-600 text-[#0071e3] focus:ring-0"
                  />
                  <span>开启开考前提醒通知</span>
                </label>

                {formReminderEnabled && (
                  <select
                    value={formReminderMinutes}
                    onChange={(e) => setFormReminderMinutes(Number(e.target.value))}
                    className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300"
                  >
                    <option value={15}>提前 15 分钟</option>
                    <option value={30}>提前 30 分钟</option>
                    <option value={60}>提前 1 小时</option>
                  </select>
                )}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-3.5 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl font-semibold shadow-xs transition-colors cursor-pointer"
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
