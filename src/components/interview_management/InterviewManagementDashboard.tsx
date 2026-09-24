import React, { useState } from 'react';
import { JobPipeline } from '../jobs/JobPipeline';
import { JobModal } from '../jobs/JobModal';
import { JobSiteProxyModal } from '../jobs/JobSiteProxyModal';
import { InterviewCalendarView } from '../InterviewCalendarView';
import { MultiCompanyResumeOptimizer } from '../MultiCompanyResumeOptimizer';
import { CompanyDossierModal } from '../CompanyDossierModal';
import { JobCommunicationModal } from '../jobs/JobCommunicationModal';
import { JobApplication, CompanyDossier, ApplicationStatus, JobCommunicationRecord } from '../../types/job';
import { ResumeData } from '../../types/resume';
import {
  Briefcase,
  Calendar,
  Layers
} from 'lucide-react';

interface InterviewManagementDashboardProps {
  jobApplications: JobApplication[];
  onAddApplication: (app: JobApplication) => void;
  onUpdateApplication: (app: JobApplication) => void;
  onDeleteApplication: (id: string) => void;
  currentResume: ResumeData;
  onUpdateResume?: (updated: ResumeData) => void;
  onStartMockInterview?: (companyName: string) => void;
  initialSubTab?: 'pipeline' | 'calendar' | 'multi_optimize';
}

export const InterviewManagementDashboard: React.FC<InterviewManagementDashboardProps> = ({
  jobApplications,
  onAddApplication,
  onUpdateApplication,
  onDeleteApplication,
  currentResume,
  onUpdateResume,
  onStartMockInterview,
  initialSubTab = 'pipeline',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'pipeline' | 'calendar' | 'multi_optimize'>(initialSubTab);
  const [selectedDossierApp, setSelectedDossierApp] = useState<JobApplication | null>(null);
  const [communicationApp, setCommunicationApp] = useState<JobApplication | null>(null);

  // Modal states for adding/editing job
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [isJobProxyOpen, setIsJobProxyOpen] = useState(false);

  // Count scheduled interviews
  const scheduledCount = jobApplications.filter((a) => !!a.scheduledInterviewDate).length;

  const handleSaveDossier = (appId: string, dossier: CompanyDossier) => {
    const app = jobApplications.find((a) => a.id === appId);
    if (!app) return;
    onUpdateApplication({
      ...app,
      companyDossier: dossier,
      updatedAt: new Date().toISOString().split('T')[0]
    });
  };

  const handleUpdateStatus = (id: string, status: ApplicationStatus) => {
    const app = jobApplications.find((a) => a.id === id);
    if (!app) return;
    onUpdateApplication({
      ...app,
      status,
      updatedAt: new Date().toISOString().split('T')[0]
    });
  };

  const handleSaveCommunication = (appId: string, records: JobCommunicationRecord[]) => {
    const app = jobApplications.find((item) => item.id === appId) || communicationApp;
    if (!app) return;
    const updated = {
      ...app,
      communicationRecords: records,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setCommunicationApp(updated);
    onUpdateApplication(updated);
  };

  return (
    <div id="interview-management-dashboard" className="space-y-5 font-sans">
      {/* Unified Apple HIG Sub-Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <button
            id="subtab-pipeline"
            onClick={() => setActiveSubTab('pipeline')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'pipeline'
                ? 'bg-[#0071e3] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>投递漏斗与背调看板</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeSubTab === 'pipeline' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
              {jobApplications.length}
            </span>
          </button>

          <button
            id="subtab-calendar"
            onClick={() => setActiveSubTab('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'calendar'
                ? 'bg-[#0071e3] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>面试日程与开考提醒</span>
            {scheduledCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeSubTab === 'calendar' ? 'bg-white/20 text-white' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
              }`}>
                {scheduledCount}
              </span>
            )}
          </button>

          <button
            id="subtab-multi-optimize"
            onClick={() => setActiveSubTab('multi_optimize')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'multi_optimize'
                ? 'bg-[#0071e3] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>3家目标公司精修</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center text-xs text-slate-400 dark:text-slate-500 font-medium pr-3">
          求职管理与面试全流程协作
        </div>
      </div>

      {/* Sub-view Rendering */}
      {activeSubTab === 'pipeline' && (
        <JobPipeline
          jobs={jobApplications}
          onAddJob={() => {
            setEditingJob(null);
            setIsJobModalOpen(true);
          }}
          onEditJob={(job) => {
            setEditingJob(job);
            setIsJobModalOpen(true);
          }}
          onDeleteJob={onDeleteApplication}
          onUpdateStatus={handleUpdateStatus}
          onNavigateToInterview={(companyName) => onStartMockInterview?.(companyName)}
          onOpenDossier={(app) => setSelectedDossierApp(app)}
          onOpenCalendar={() => setActiveSubTab('calendar')}
          onOpenJobProxy={() => setIsJobProxyOpen(true)}
          onOpenCommunication={(app) => setCommunicationApp(app)}
        />
      )}

      {activeSubTab === 'calendar' && (
        <InterviewCalendarView
          jobApplications={jobApplications}
          onUpdateApplication={onUpdateApplication}
          onStartMockInterview={(companyName) => onStartMockInterview?.(companyName)}
          onOpenDossier={(app) => setSelectedDossierApp(app)}
        />
      )}

      {activeSubTab === 'multi_optimize' && (
        <MultiCompanyResumeOptimizer
          currentResume={currentResume}
          jobApplications={jobApplications}
          onUpdateResume={onUpdateResume}
        />
      )}

      {/* Shared Modals */}
      {selectedDossierApp && (
        <CompanyDossierModal
          isOpen={!!selectedDossierApp}
          onClose={() => setSelectedDossierApp(null)}
          application={selectedDossierApp}
          onSaveDossier={handleSaveDossier}
        />
      )}

      {communicationApp && (
        <JobCommunicationModal
          isOpen={!!communicationApp}
          onClose={() => setCommunicationApp(null)}
          application={communicationApp}
          currentResume={currentResume}
          onSave={(records) => handleSaveCommunication(communicationApp.id, records)}
        />
      )}

      <JobModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        editingJob={editingJob}
        onSave={(job) => {
          if (editingJob) {
            onUpdateApplication(job);
          } else {
            onAddApplication(job);
          }
        }}
      />

      <JobSiteProxyModal
        isOpen={isJobProxyOpen}
        onClose={() => setIsJobProxyOpen(false)}
        currentResume={currentResume}
        onAddJob={(job) => onAddApplication(job)}
      />
    </div>
  );
};
