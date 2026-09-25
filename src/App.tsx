import React, { useState, useEffect, useRef, useCallback } from 'react';
import { showAppConfirm } from './components/common/AppFeedback';
import { ResumeData, ResumeTemplateId } from './types/resume';
import { JobApplication, ApplicationStatus } from './types/job';
import { InterviewRecord } from './types/interview';
import { CrossInterviewDiagnosticReport } from './types/diagnostic';
import { defaultResume } from './data/defaultResume';
import { KnowledgeItem, KnowledgeBook } from './types/knowledge';
import { WorkDailyLog } from './types/journal';
import {
  loadResumeData,
  saveResumeData,
  loadResumeLibrary,
  saveResumeLibrary,
  loadActiveResumeId,
  saveActiveResumeId,
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
import { migrateLocalMediaToCloud } from './services/mediaStorageService';
import { Header, MainTab } from './components/Header';
import {
  RotateCcw,
  Layout,
  Columns,
  Eye,
  FileEdit
} from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { APP_COPYRIGHT, APP_VERSION } from './config/appMeta';

const lazyNamed = <T extends React.ComponentType<any>>(loader: () => Promise<Record<string, unknown>>, name: string) =>
  React.lazy(async () => ({ default: (await loader())[name] as T }));

const ResumePreview = lazyNamed(() => import('./components/resume/ResumePreview'), 'ResumePreview');
const ResumeLibraryControls = lazyNamed(() => import('./components/resume/ResumeLibraryControls'), 'ResumeLibraryControls');
const ResumeEditor = lazyNamed(() => import('./components/resume/ResumeEditor'), 'ResumeEditor');
const ResumeImportModal = lazyNamed(() => import('./components/resume/ResumeImportModal'), 'ResumeImportModal');
const AiResumeGeneratorModal = lazyNamed(() => import('./components/resume/AiResumeGeneratorModal'), 'AiResumeGeneratorModal');
const ExportModal = lazyNamed(() => import('./components/resume/ExportModal'), 'ExportModal');
const InterviewManagementDashboard = lazyNamed(() => import('./components/interview_management/InterviewManagementDashboard'), 'InterviewManagementDashboard');
const InterviewsAndReplayDashboard = lazyNamed(() => import('./components/interview/InterviewsAndReplayDashboard'), 'InterviewsAndReplayDashboard');
const InterviewModal = lazyNamed(() => import('./components/interview/InterviewModal'), 'InterviewModal');
const KnowledgeBase = lazyNamed(() => import('./components/knowledge/KnowledgeBase'), 'KnowledgeBase');
const ApiKeyModal = lazyNamed(() => import('./components/ApiKeyModal'), 'ApiKeyModal');
const WorkDailyLogDashboard = lazyNamed(() => import('./components/WorkDailyLogDashboard'), 'WorkDailyLogDashboard');
const JdKnowledgeRecommenderModal = lazyNamed(() => import('./components/JdKnowledgeRecommenderModal'), 'JdKnowledgeRecommenderModal');
const FeedbackModal = lazyNamed(() => import('./components/common/FeedbackModal'), 'FeedbackModal');
const AccountSettingsModal = lazyNamed(() => import('./components/auth/AccountSettingsModal'), 'AccountSettingsModal');

function createBlankResume(index: number): ResumeData {
  const now = new Date().toISOString();
  return {
    id: `resume-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: `未命名简历 ${index}`,
    lastModified: now,
    personalInfo: { fullName: '', jobTitle: '', email: '', phone: '', location: '' },
    jobIntent: { desiredPosition: '', desiredSalary: '', desiredCity: '', jobStatus: '', workType: '' },
    summary: '',
    skills: [],
    workExperience: [],
    projects: [],
    education: [],
    certificates: [],
    customSections: [],
  };
}

export default function App() {
  const { signOutUser, user } = useAuth();
  const hadLocalWorkspaceOnLogin = useRef(hasLocalWorkspaceData()).current;
  const [workspaceReady, setWorkspaceReady] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveStatusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mediaMigrationUser = useRef<string | null>(null);
  // Navigation
  const [currentTab, setCurrentTab] = useState<MainTab>(() => window.location.hash.startsWith('#knowledge-book=') ? 'knowledge' : 'resume');

  // Resume State
  const [resumeLibrary, setResumeLibrary] = useState<ResumeData[]>(() => loadResumeLibrary(defaultResume));
  const [activeResumeId, setActiveResumeId] = useState<string>(() => loadActiveResumeId(loadResumeLibrary(defaultResume)));
  const [resume, setResume] = useState<ResumeData>(() => {
    const library = loadResumeLibrary(defaultResume);
    const activeId = loadActiveResumeId(library);
    return library.find(item => item.id === activeId) || loadResumeData(defaultResume);
  });
  const [templateId, setTemplateId] = useState<ResumeTemplateId>('modern');
  const [resumeViewMode, setResumeViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [sortResumeByDate, setSortResumeByDate] = useState(true);

  // Jobs Pipeline State
  const [jobs, setJobs] = useState<JobApplication[]>(() => {
    const saved = loadJobApplications();
    return saved;
  });

  // Interviews State
  const [interviews, setInterviews] = useState<InterviewRecord[]>(() => {
    const saved = loadInterviewRecords();
    return saved;
  });
  const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(null);

  // Cross-Interview Diagnostic Report
  const [diagnosticReport, setDiagnosticReport] = useState<CrossInterviewDiagnosticReport | null>(() => {
    return loadDiagnosticReport();
  });

  // Basic Knowledge Base State
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>(() => {
    return loadKnowledgeItems();
  });

  // LeetBooks State
  const [books, setBooks] = useState<KnowledgeBook[]>(() => {
    return loadLeetBooks();
  });

  // Work Daily Logs State
  const [workLogs, setWorkLogs] = useState<WorkDailyLog[]>(() => {
    return loadWorkDailyLogs();
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
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
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
        setResumeLibrary(synced.resumes);
        setActiveResumeId(synced.activeResumeId);
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

  const saveWorkspaceNow = useCallback(async () => {
    if (!workspaceReady) return;
    if (saveStatusTimer.current) clearTimeout(saveStatusTimer.current);
    setSaveStatus('saving');
    try {
      await saveCloudWorkspace(createLocalWorkspaceSnapshot());
      setSyncError('');
      setSaveStatus('saved');
      saveStatusTimer.current = setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (error) {
      console.error('Cloud workspace save failed:', error);
      setSyncError(error instanceof Error ? error.message : '云端保存失败。');
      setSaveStatus('error');
    }
  }, [workspaceReady]);

  useEffect(() => {
    if (!workspaceReady) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const queueCloudSave = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        void saveWorkspaceNow();
      }, 900);
    };
    window.addEventListener(WORKSPACE_DATA_CHANGED_EVENT, queueCloudSave);
    return () => {
      window.removeEventListener(WORKSPACE_DATA_CHANGED_EVENT, queueCloudSave);
      if (timer) clearTimeout(timer);
    };
  }, [workspaceReady, saveWorkspaceNow]);

  useEffect(() => {
    if (!workspaceReady || !user?.uid || mediaMigrationUser.current === user.uid) return;
    mediaMigrationUser.current = user.uid;
    void migrateLocalMediaToCloud(interviews).then(result => {
      if (result.migrated > 0) setInterviews(result.records);
      if (result.failed > 0) {
        setSyncError(`${result.failed} 个本地附件暂未上传到 Cloud Storage，下次登录会继续重试。`);
      }
    }).catch(error => {
      console.error('Local media migration failed:', error);
      setSyncError(error instanceof Error ? error.message : '附件迁移失败。');
    });
  }, [interviews, user?.uid, workspaceReady]);

  // Auto persist
  useEffect(() => {
    if (!workspaceReady) return;
    const updatedResume = { ...resume, lastModified: new Date().toISOString() };
    const updatedLibrary = resumeLibrary.some(item => item.id === activeResumeId)
      ? resumeLibrary.map(item => item.id === activeResumeId ? updatedResume : item)
      : [...resumeLibrary, updatedResume];
    setResumeLibrary(updatedLibrary);
    saveResumeData(updatedResume);
    saveResumeLibrary(updatedLibrary);
    saveActiveResumeId(activeResumeId);
  }, [resume, activeResumeId, workspaceReady]);

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

  const handleImportResumeSuccess = (imported: ResumeData, mergeMode: 'replace' | 'merge') => {
    setResume((prev) => {
      if (mergeMode === 'replace') {
        return {
          ...imported,
          id: activeResumeId,
          title: imported.title || prev.title,
          lastModified: new Date().toISOString(),
        };
      }

      const importedId = (prefix: string, id?: string) => `${prefix}-${Date.now()}-${id || Math.random().toString(36).slice(2, 8)}`;
      const importedCustomSections = (imported.customSections || []).map(item => ({ ...item, id: importedId('custom', item.id) }));
      const currentSectionOrder = prev.sectionOrder || [
        'workExperience',
        'projects',
        'skills',
        'education',
        'certificates',
        ...(prev.customSections || []).map(item => item.id),
      ];
      return {
        ...prev,
        summary: [prev.summary, imported.summary].filter(Boolean).join('\n\n'),
        skills: [...prev.skills, ...(imported.skills || []).map(item => ({ ...item, id: importedId('skill', item.id) }))],
        workExperience: [...prev.workExperience, ...(imported.workExperience || []).map(item => ({ ...item, id: importedId('work', item.id) }))],
        projects: [...prev.projects, ...(imported.projects || []).map(item => ({ ...item, id: importedId('project', item.id) }))],
        education: [...prev.education, ...(imported.education || []).map(item => ({ ...item, id: importedId('education', item.id) }))],
        certificates: [...prev.certificates, ...(imported.certificates || []).map(item => ({ ...item, id: importedId('certificate', item.id) }))],
        customSections: [...(prev.customSections || []), ...importedCustomSections],
        sectionOrder: [...currentSectionOrder, ...importedCustomSections.map(item => item.id)],
        sectionVisibility: {
          ...(prev.sectionVisibility || {}),
          ...Object.fromEntries(importedCustomSections.map(item => [item.id, true])),
        },
        lastModified: new Date().toISOString(),
      };
    });
  };

  const handleSelectResume = (id: string) => {
    const selected = resumeLibrary.find(item => item.id === id);
    if (!selected || id === activeResumeId) return;
    setActiveResumeId(id);
    setResume(selected);
  };

  const handleCreateResume = () => {
    const created = createBlankResume(resumeLibrary.length + 1);
    setResumeLibrary(prev => [...prev, created]);
    setActiveResumeId(created.id);
    setResume(created);
  };

  const handleDuplicateResume = () => {
    const duplicated: ResumeData = {
      ...structuredClone(resume),
      id: `resume-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: `${resume.title || resume.personalInfo.fullName || '未命名简历'} 副本`,
      lastModified: new Date().toISOString(),
    };
    setResumeLibrary(prev => [...prev, duplicated]);
    setActiveResumeId(duplicated.id);
    setResume(duplicated);
  };

  const handleRenameResume = () => {
    const nextTitle = prompt('请输入新的简历名称：', resume.title || resume.personalInfo.fullName || '未命名简历')?.trim();
    if (!nextTitle) return;
    setResume(prev => ({ ...prev, title: nextTitle }));
  };

  const handleDeleteResume = async () => {
    if (resumeLibrary.length <= 1) return;
    if (!(await showAppConfirm(`确定删除“${resume.title || '当前简历'}”吗？`, { title: '删除简历', confirmLabel: '删除', danger: true }))) return;
    const remaining = resumeLibrary.filter(item => item.id !== activeResumeId);
    const next = remaining[0];
    setResumeLibrary(remaining);
    setActiveResumeId(next.id);
    setResume(next);
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

  const handleDeleteJob = async (id: string) => {
    if (await showAppConfirm('确定删除该投递记录吗？', { title: '删除投递记录', confirmLabel: '删除', danger: true })) {
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
        onSaveWorkspace={() => void saveWorkspaceNow()}
        saveStatus={saveStatus}
        userName={user?.displayName || user?.email || '用户'}
        userPhotoURL={user?.photoURL || undefined}
        onSignOut={() => void signOutUser()}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        onOpenAccountSettings={() => setIsAccountSettingsOpen(true)}
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

      <React.Suspense fallback={<div className="flex flex-1 items-center justify-center py-24 text-sm font-semibold text-slate-400">正在加载工作区…</div>}>
      {/* Main Workspace */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* ================= TAB 1: RESUME STUDIO ================= */}
        {currentTab === 'resume' && (
          <div className="space-y-4">
            <ResumeLibraryControls
              resumes={resumeLibrary}
              activeResumeId={activeResumeId}
              onSelect={handleSelectResume}
              onCreate={handleCreateResume}
              onDuplicate={handleDuplicateResume}
              onRename={handleRenameResume}
              onDelete={handleDeleteResume}
            />
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
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" title="只调整预览和导出顺序，不改写原始数据">
                    <input
                      type="checkbox"
                      checked={sortResumeByDate}
                      onChange={event => setSortResumeByDate(event.target.checked)}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-[#0071e3]"
                    />
                    按时间倒序
                  </label>
                  <button
                    onClick={async () => {
                      if (await showAppConfirm('确定清空当前简历内容吗？此操作不会影响其他简历。', { title: '清空当前简历', confirmLabel: '确认清空', danger: true })) {
                        setResume({ ...structuredClone(defaultResume), id: activeResumeId, title: resume.title });
                      }
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    title="清空当前简历内容"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    清空内容
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
                    <ResumePreview resume={resume} templateId={templateId} sortByDate={sortResumeByDate} />
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
            onAddApplication={(app: JobApplication) => {
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
            onStartMockInterview={(companyName: string) => {
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
            onSelectInterview={(id: string) => setSelectedInterviewId(id)}
            onAddInterview={() => {
              setEditingInterview(null);
              setInitialInterviewCompany(undefined);
              setIsInterviewModalOpen(true);
            }}
            onDeleteInterview={handleDeleteInterview}
            onEditInterview={(rec: InterviewRecord) => {
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
            onOpenJdRecommender={(sectionTitle?: string) => {
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

      <footer className="mx-auto flex w-full max-w-[1720px] flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-slate-200 px-5 py-5 text-[11px] text-slate-400 dark:border-slate-800">
        <span>{APP_COPYRIGHT}</span><span>Version {APP_VERSION}</span><button type="button" onClick={() => setIsFeedbackOpen(true)} className="font-semibold hover:text-[#0071e3]">问题反馈</button>
      </footer>

      {/* Global Modals */}
      {isResumeImportOpen && <ResumeImportModal
        isOpen={isResumeImportOpen}
        onClose={() => setIsResumeImportOpen(false)}
        currentResume={resume}
        onImportSuccess={handleImportResumeSuccess}
      />}

      {isAiResumeOpen && <AiResumeGeneratorModal
        isOpen={isAiResumeOpen}
        onClose={() => setIsAiResumeOpen(false)}
        existingResume={resume}
        onGenerated={setResume}
        onOpenApiKeySettings={() => {
          setIsAiResumeOpen(false);
          setIsApiKeyOpen(true);
        }}
      />}

      {isExportOpen && <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        resume={resume}
        templateId={templateId}
        sortByDate={sortResumeByDate}
        initialTab={exportInitialTab}
      />}

      {isApiKeyOpen && <ApiKeyModal
        isOpen={isApiKeyOpen}
        onClose={() => setIsApiKeyOpen(false)}
      />}

      {isFeedbackOpen && <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        pageContext={currentTab}
      />}

      {isAccountSettingsOpen && <AccountSettingsModal isOpen={isAccountSettingsOpen} onClose={() => setIsAccountSettingsOpen(false)} />}

      {isInterviewModalOpen && <InterviewModal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        onSave={handleSaveInterview}
        editingRecord={editingInterview}
        initialCompanyName={initialInterviewCompany}
      />}

      {/* JD to Knowledge Recommender Modal */}
      {isJdRecommenderOpen && <JdKnowledgeRecommenderModal
        isOpen={isJdRecommenderOpen}
        onClose={() => {
          setIsJdRecommenderOpen(false);
          setJdRecommenderInitialSection(undefined);
        }}
        jobApplications={jobs}
        currentResume={resume}
        preselectedSectionTitle={jdRecommenderInitialSection}
        onAddKnowledgeItem={(item: KnowledgeItem) => {
          setKnowledgeItems((prev) => [item, ...prev]);
        }}
      />}
      </React.Suspense>
    </div>
  );
}
