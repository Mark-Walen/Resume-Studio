import React, { useState, useEffect, useRef } from 'react';
import { ResumeData, ResumeTemplateId } from './types/resume';
import { JobApplication, ApplicationStatus } from './types/job';
import { InterviewRecord } from './types/interview';
import { CrossInterviewDiagnosticReport } from './types/diagnostic';
import { defaultResume } from './data/defaultResume';
import { INITIAL_JOB_APPLICATIONS, mockInterviews } from './data/mockInterviews';
import { INITIAL_KNOWLEDGE_BASE } from './data/knowledgeBaseData';
import { DEFAULT_LEETBOOKS } from './data/defaultBooks';
import { INITIAL_WORK_DAILY_LOGS } from './data/defaultJournals';
import { KnowledgeItem, KnowledgeBook } from './types/knowledge';
import { WorkDailyLog } from './types/journal';
import {
  loadResumeData,
  saveResumeData,
  loadJobApplications,
  saveJobApplications,
  loadInterviewRecords,
  saveInterviewRecords,
  loadDiagnosticReport,
  saveDiagnosticReport,
  loadKnowledgeItems,
  saveKnowledgeItems,
  loadLeetBooks,
  saveLeetBooks,
  loadWorkDailyLogs,
  saveWorkDailyLogs,
  applyCloudWorkspaceSnapshot,
  createLocalWorkspaceSnapshot,
  hasLocalWorkspaceData,
  WORKSPACE_DATA_CHANGED_EVENT,
} from './utils/db';
import { migrateOrLoadCloudWorkspace, saveCloudWorkspace } from './services/workspaceSyncService';
import { Header, MainTab } from './components/Header';
import { ResumePreview } from './components/resume/ResumePreview';
import { ResumeEditor } from './components/resume/ResumeEditor';
import { ResumeImportModal } from './components/resume/ResumeImportModal';
import { AiResumeGeneratorModal } from './components/resume/AiResumeGeneratorModal';
import { ExportModal } from './components/resume/ExportModal';
import { InterviewManagementDashboard } from './components/interview_management/InterviewManagementDashboard';
import { InterviewsAndReplayDashboard } from './components/interview/InterviewsAndReplayDashboard';
import { InterviewModal } from './components/interview/InterviewModal';
import { KnowledgeBase } from './components/knowledge/KnowledgeBase';
import { ApiKeyModal } from './components/ApiKeyModal';
import { WorkDailyLogDashboard } from './components/WorkDailyLogDashboard';
import { JdKnowledgeRecommenderModal } from './components/JdKnowledgeRecommenderModal';
import {
  RotateCcw,
  Layout,
  Columns,
  Eye,
  FileEdit
} from 'lucide-react';
import { useAuth } from './contexts/AuthContext';

export default function App() {
  const { signOutUser, user } = useAuth();
  const hadLocalWorkspaceOnLogin = useRef(hasLocalWorkspaceData()).current;
  const [workspaceReady, setWorkspaceReady] = useState(false);
  const [syncError, setSyncError] = useState('');
  // Navigation
  const [currentTab, setCurrentTab] = useState<MainTab>('resume');

  // Resume State
  const [resume, setResume] = useState<ResumeData>(() => loadResumeData(defaultResume));
  const [templateId, setTemplateId] = useState<ResumeTemplateId>('modern');
  const [resumeViewMode, setResumeViewMode] = useState<'split' | 'edit' | 'preview'>('split');

  // Jobs Pipeline State
  const [jobs, setJobs] = useState<JobApplication[]>(() => {
    const saved = loadJobApplications();
    return saved.length > 0 ? saved : INITIAL_JOB_APPLICATIONS;
  });

  // Interviews State
  const [interviews, setInterviews] = useState<InterviewRecord[]>(() => {
    const saved = loadInterviewRecords();
    return saved.length > 0 ? saved : mockInterviews;
  });
  const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(null);

  // Cross-Interview Diagnostic Report
  const [diagnosticReport, setDiagnosticReport] = useState<CrossInterviewDiagnosticReport | null>(() => {
    return loadDiagnosticReport();
  });

  // Basic Knowledge Base State
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>(() => {
    return loadKnowledgeItems(INITIAL_KNOWLEDGE_BASE);
  });

  // LeetBooks State
  const [books, setBooks] = useState<KnowledgeBook[]>(() => {
    return loadLeetBooks(DEFAULT_LEETBOOKS);
  });

  // Work Daily Logs State
  const [workLogs, setWorkLogs] = useState<WorkDailyLog[]>(() => {
    return loadWorkDailyLogs(INITIAL_WORK_DAILY_LOGS);
  });

  // JD Recommender Modal State
  const [isJdRecommenderOpen, setIsJdRecommenderOpen] = useState(false);
  const [jdRecommenderInitialSection, setJdRecommenderInitialSection] = useState<string | undefined>();

  // Modals
  const [isAiResumeOpen, setIsAiResumeOpen] = useState(false);
  const [isResumeImportOpen, setIsResumeImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportInitialTab, setExportInitialTab] = useState<'export' | 'email'>('export');
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<InterviewRecord | null>(null);
  const [initialInterviewCompany, setInitialInterviewCompany] = useState<string | undefined>();

  const handleOpenExport = (tab: 'export' | 'email' = 'export') => {
    setExportInitialTab(tab);
    setIsExportOpen(true);
  };

  useEffect(() => {
    let cancelled = false;
    setWorkspaceReady(false);
    setSyncError('');
    void migrateOrLoadCloudWorkspace(createLocalWorkspaceSnapshot(), hadLocalWorkspaceOnLogin)
      .then(result => {
        if (cancelled) return;
        const synced = applyCloudWorkspaceSnapshot(result.payload);
        setResume(synced.resume);
        setJobs(synced.jobs);
        setInterviews(synced.interviews);
        setDiagnosticReport(synced.diagnosticReport);
        setKnowledgeItems(synced.knowledgeItems);
        setBooks(synced.books);
        setWorkLogs(synced.workLogs);
        setWorkspaceReady(true);
      })
      .catch(error => {
        if (cancelled) return;
        console.error('Cloud workspace initialization failed:', error);
        setSyncError(error instanceof Error ? error.message : '云端同步暂时不可用。');
        setWorkspaceReady(true);
      });
    return () => { cancelled = true; };
  }, [hadLocalWorkspaceOnLogin, user?.uid]);

  useEffect(() => {
    if (!workspaceReady) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const queueCloudSave = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        void saveCloudWorkspace(createLocalWorkspaceSnapshot())
          .then(() => setSyncError(''))
          .catch(error => {
            console.error('Cloud workspace save failed:', error);
            setSyncError(error instanceof Error ? error.message : '云端保存失败。');
          });
      }, 900);
    };
    window.addEventListener(WORKSPACE_DATA_CHANGED_EVENT, queueCloudSave);
    return () => {
      window.removeEventListener(WORKSPACE_DATA_CHANGED_EVENT, queueCloudSave);
      if (timer) clearTimeout(timer);
    };
  }, [workspaceReady]);

  // Auto persist
  useEffect(() => {
    if (workspaceReady) saveResumeData(resume);
  }, [resume, workspaceReady]);

  useEffect(() => {
    if (workspaceReady) saveJobApplications(jobs);
  }, [jobs, workspaceReady]);

  useEffect(() => {
    if (workspaceReady) saveInterviewRecords(interviews);
  }, [interviews, workspaceReady]);

  useEffect(() => {
    if (workspaceReady) saveKnowledgeItems(knowledgeItems);
  }, [knowledgeItems, workspaceReady]);

  useEffect(() => {
    if (workspaceReady) saveLeetBooks(books);
  }, [books, workspaceReady]);

  useEffect(() => {
    if (workspaceReady) saveWorkDailyLogs(workLogs);
  }, [workLogs, workspaceReady]);

  useEffect(() => {
    if (workspaceReady && diagnosticReport) {
      saveDiagnosticReport(diagnosticReport);
    }
  }, [diagnosticReport, workspaceReady]);

  const handleImportResumeSuccess = (imported: Partial<ResumeData>) => {
    setResume((prev) => ({
      ...prev,
      ...imported,
      personalInfo: {
        ...prev.personalInfo,
        ...(imported.personalInfo || {}),
      },
      skills: imported.skills || prev.skills,
      workExperience: imported.workExperience || prev.workExperience,
      projects: imported.projects || prev.projects,
      education: imported.education || prev.education,
      certificates: imported.certificates || prev.certificates,
      customSections: imported.customSections || prev.customSections,
    }));
  };

  const handleSaveJob = (job: JobApplication) => {
    setJobs((prev) => {
      const exists = prev.some((j) => j.id === job.id);
      if (exists) {
        return prev.map((j) => (j.id === job.id ? job : j));
      }
      return [job, ...prev];
    });
  };

  const handleDeleteJob = (id: string) => {
    if (confirm('确定删除该投递记录吗？')) {
      setJobs((prev) => prev.filter((j) => j.id !== id));
    }
  };

  // Interview handlers
  const handleSaveInterview = (record: InterviewRecord) => {
    setInterviews((prev) => {
      const exists = prev.some((iv) => iv.id === record.id);
      if (exists) {
        return prev.map((iv) => (iv.id === record.id ? record : iv));
      }
      return [record, ...prev];
    });
    setSelectedInterviewId(record.id);
  };

  const handleDeleteInterview = (id: string) => {
    setInterviews((prev) => prev.filter((iv) => iv.id !== id));
    if (selectedInterviewId === id) {
      setSelectedInterviewId(null);
    }
  };

  const handleUpdateInterviewRecord = (updated: InterviewRecord) => {
    setInterviews((prev) => prev.map((iv) => (iv.id === updated.id ? updated : iv)));
  };

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-clip bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-100 dark:selection:bg-blue-900/40 transition-colors">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'interviews') {
            setSelectedInterviewId(null);
          }
        }}
        onOpenExport={() => handleOpenExport('export')}
        onOpenApiKey={() => setIsApiKeyOpen(true)}
        onOpenImportResume={() => setIsResumeImportOpen(true)}
        userName={user?.displayName || user?.email || '用户'}
        onSignOut={() => void signOutUser()}
      />

      {!workspaceReady && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-xl">
            正在同步云端工作区…
          </div>
        </div>
      )}
      {workspaceReady && syncError && (
        <div className="fixed right-4 top-20 z-[115] max-w-sm rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950 px-3 py-2 text-xs text-amber-800 dark:text-amber-200 shadow-lg">
          云端同步暂时不可用，当前修改仍已保存在本机：{syncError}
        </div>
      )}

      {/* Main Workspace */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* ================= TAB 1: RESUME STUDIO ================= */}
        {currentTab === 'resume' && (
          <div className="space-y-4">
            {/* Template Selector & Toolbar */}
            <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 transition-colors">
              {/* Template Chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-1 flex items-center gap-1">
                  <Layout className="w-3.5 h-3.5 text-[#0071e3]" />
                  精选模板:
                </span>
                <button
                  onClick={() => setTemplateId('modern')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    templateId === 'modern'
                      ? 'bg-[#0071e3] border-[#0071e3] text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  现代轻简
                </button>
                <button
                  onClick={() => setTemplateId('classic')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    templateId === 'classic'
                      ? 'bg-[#0071e3] border-[#0071e3] text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  经典精炼
                </button>
                <button
                  onClick={() => setTemplateId('tech-sidebar')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    templateId === 'tech-sidebar'
                      ? 'bg-[#0071e3] border-[#0071e3] text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  极客双栏
                </button>
                <button
                  onClick={() => setTemplateId('creative')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    templateId === 'creative'
                      ? 'bg-[#0071e3] border-[#0071e3] text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  创意活力
                </button>
                <button
                  onClick={() => setTemplateId('compact')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    templateId === 'compact'
                      ? 'bg-[#0071e3] border-[#0071e3] text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  密集单页
                </button>
              </div>

              {/* View Switcher & Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
                  <button
                    onClick={() => setResumeViewMode('split')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      resumeViewMode === 'split' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5" />
                    双栏协作
                  </button>
                  <button
                    onClick={() => setResumeViewMode('edit')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      resumeViewMode === 'edit' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    仅编辑
                  </button>
                  <button
                    onClick={() => setResumeViewMode('preview')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      resumeViewMode === 'preview' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    仅预览
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (confirm('确定重置为您提供的默认优质高阶简历模板吗？')) {
                        setResume(defaultResume);
                      }
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    title="恢复默认简历数据"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    重置模板
                  </button>
                </div>
              </div>
            </div>

            {/* Split Screen Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Editor Side */}
              {(resumeViewMode === 'split' || resumeViewMode === 'edit') && (
                <div className={resumeViewMode === 'split' ? 'lg:col-span-5' : 'lg:col-span-12'}>
                  <ResumeEditor
                    resume={resume}
                    onChange={setResume}
                    onOpenAiGenerator={() => setIsAiResumeOpen(true)}
                    onOpenImportResume={() => setIsResumeImportOpen(true)}
                  />
                </div>
              )}

              {/* Document Preview Side */}
              {(resumeViewMode === 'split' || resumeViewMode === 'preview') && (
                <div className={resumeViewMode === 'split' ? 'lg:col-span-7' : 'lg:col-span-12'}>
                  <div className="sticky top-20">
                    <ResumePreview resume={resume} templateId={templateId} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: INTERVIEW MANAGEMENT (PIPELINE, CALENDAR, 3-COMPANY OPTIMIZER) ================= */}
        {currentTab === 'interview_management' && (
          <InterviewManagementDashboard
            jobApplications={jobs}
            onAddApplication={(app) => {
              const newApp: JobApplication = {
                ...app,
                id: `job-${Date.now()}`,
                createdAt: new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString().split('T')[0],
              };
              handleSaveJob(newApp);
            }}
            onUpdateApplication={handleSaveJob}
            onDeleteApplication={handleDeleteJob}
            currentResume={resume}
            onUpdateResume={setResume}
            onStartMockInterview={(companyName) => {
              setCurrentTab('interviews');
              setInitialInterviewCompany(companyName);
              setIsInterviewModalOpen(true);
            }}
          />
        )}

        {/* ================= TAB 3: MOCK INTERVIEWS & CROSS-ROUND REPLAY/DIAGNOSTICS ================= */}
        {currentTab === 'interviews' && (
          <InterviewsAndReplayDashboard
            interviews={interviews}
            selectedInterviewId={selectedInterviewId}
            onSelectInterview={(id) => setSelectedInterviewId(id)}
            onAddInterview={() => {
              setEditingInterview(null);
              setInitialInterviewCompany(undefined);
              setIsInterviewModalOpen(true);
            }}
            onDeleteInterview={handleDeleteInterview}
            onEditInterview={(rec) => {
              setEditingInterview(rec);
              setIsInterviewModalOpen(true);
            }}
            onUpdateInterviewRecord={handleUpdateInterviewRecord}
            diagnosticReport={diagnosticReport}
            onUpdateDiagnosticReport={setDiagnosticReport}
          />
        )}

        {/* ================= TAB 4: DEEP KNOWLEDGE LIBRARY ================= */}
        {currentTab === 'knowledge' && (
          <KnowledgeBase
            items={knowledgeItems}
            onUpdateItems={setKnowledgeItems}
            books={books}
            onSaveBooks={setBooks}
            onOpenJdRecommender={(sectionTitle) => {
              setJdRecommenderInitialSection(sectionTitle);
              setIsJdRecommenderOpen(true);
            }}
          />
        )}

        {/* ================= TAB 5: WORK DAILY LOG (DAILY LOG TO RESUME EVIDENCE) ================= */}
        {currentTab === 'daily_log' && (
          <WorkDailyLogDashboard
            logs={workLogs}
            onSaveLogs={setWorkLogs}
            currentResume={resume}
            onUpdateResume={setResume}
          />
        )}
      </main>

      {/* Global Modals */}
      <ResumeImportModal
        isOpen={isResumeImportOpen}
        onClose={() => setIsResumeImportOpen(false)}
        currentResume={resume}
        onImportSuccess={handleImportResumeSuccess}
      />

      <AiResumeGeneratorModal
        isOpen={isAiResumeOpen}
        onClose={() => setIsAiResumeOpen(false)}
        existingResume={resume}
        onGenerated={setResume}
        onOpenApiKeySettings={() => {
          setIsAiResumeOpen(false);
          setIsApiKeyOpen(true);
        }}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        resume={resume}
        initialTab={exportInitialTab}
      />

      <ApiKeyModal
        isOpen={isApiKeyOpen}
        onClose={() => setIsApiKeyOpen(false)}
      />

      <InterviewModal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        onSave={handleSaveInterview}
        editingRecord={editingInterview}
        initialCompanyName={initialInterviewCompany}
      />

      {/* JD to Knowledge Recommender Modal */}
      <JdKnowledgeRecommenderModal
        isOpen={isJdRecommenderOpen}
        onClose={() => {
          setIsJdRecommenderOpen(false);
          setJdRecommenderInitialSection(undefined);
        }}
        jobApplications={jobs}
        currentResume={resume}
        preselectedSectionTitle={jdRecommenderInitialSection}
        onAddKnowledgeItem={(item) => {
          setKnowledgeItems((prev) => [item, ...prev]);
        }}
      />
    </div>
  );
}
