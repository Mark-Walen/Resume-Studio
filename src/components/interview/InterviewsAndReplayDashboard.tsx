import React, { useState } from 'react';
import { InterviewRecord } from '../../types/interview';
import { CrossInterviewDiagnosticReport } from '../../types/diagnostic';
import { InterviewList } from './InterviewList';
import { InterviewDetail } from './InterviewDetail';
import { DiagnosticDashboard } from '../diagnostic/DiagnosticDashboard';
import { Video, Target } from 'lucide-react';

interface InterviewsAndReplayDashboardProps {
  interviews: InterviewRecord[];
  selectedInterviewId: string | null;
  onSelectInterview: (id: string | null) => void;
  onAddInterview: () => void;
  onDeleteInterview: (id: string) => void;
  onEditInterview: (record: InterviewRecord) => void;
  onUpdateInterviewRecord: (record: InterviewRecord) => void;
  diagnosticReport: CrossInterviewDiagnosticReport | null;
  onUpdateDiagnosticReport: (report: CrossInterviewDiagnosticReport) => void;
  initialSubTab?: 'records' | 'diagnostics';
}

export const InterviewsAndReplayDashboard: React.FC<InterviewsAndReplayDashboardProps> = ({
  interviews,
  selectedInterviewId,
  onSelectInterview,
  onAddInterview,
  onDeleteInterview,
  onEditInterview,
  onUpdateInterviewRecord,
  diagnosticReport,
  onUpdateDiagnosticReport,
  initialSubTab = 'records',
}) => {
  const [subTab, setSubTab] = useState<'records' | 'diagnostics'>(initialSubTab);

  const selectedInterview = interviews.find((i) => i.id === selectedInterviewId) || null;

  return (
    <div id="interviews-and-replay-dashboard" className="space-y-5 font-sans">
      {/* Sub navigation segmented control (only show if not inside detail) */}
      {!selectedInterview && (
        <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <button
              id="subtab-interview-records"
              onClick={() => setSubTab('records')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                subTab === 'records'
                  ? 'bg-[#0071e3] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>模拟实战与音视频复盘</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  subTab === 'records'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {interviews.length}
              </span>
            </button>

            <button
              id="subtab-interview-diagnostics"
              onClick={() => setSubTab('diagnostics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                subTab === 'diagnostics'
                  ? 'bg-[#0071e3] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>多轮失分诊断与考点预警</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center text-xs text-slate-400 dark:text-slate-500 font-medium pr-3">
            实战录制 · 逐题复盘 · 跨轮能力穿透
          </div>
        </div>
      )}

      {/* Detail view takes precedence */}
      {selectedInterview ? (
        <InterviewDetail
          record={selectedInterview}
          onBack={() => onSelectInterview(null)}
          onEdit={() => onEditInterview(selectedInterview)}
          onUpdateRecord={onUpdateInterviewRecord}
        />
      ) : subTab === 'records' ? (
        <InterviewList
          interviews={interviews}
          onSelectInterview={onSelectInterview}
          onAddInterview={onAddInterview}
          onDeleteInterview={onDeleteInterview}
        />
      ) : (
        <DiagnosticDashboard
          interviews={interviews}
          report={diagnosticReport}
          onUpdateReport={onUpdateDiagnosticReport}
        />
      )}
    </div>
  );
};
