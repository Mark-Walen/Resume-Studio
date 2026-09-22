import React, { useState, useEffect } from 'react';
import { ResumeData, ResumeTemplateId } from './types/resume';
import { JobApplication, ApplicationStatus, CompanyDossier } from './types/job';
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
} from './utils/db';
import { Header, MainTab } from './components/Header';
import { ResumePreview } from './components/resume/ResumePreview';
import { ResumeEditor } from './components/resume/ResumeEditor';
import { ResumeImportModal } from './components/resume/ResumeImportModal';
import { AiResumeGeneratorModal } from './components/resume/AiResumeGeneratorModal';
import { ExportModal } from './components/resume/ExportModal';
import { JobPipeline } from './components/jobs/JobPipeline';
import { JobModal } from './components/jobs/JobModal';
import { JobSiteProxyModal } from './components/jobs/JobSiteProxyModal';
import { InterviewList } from './components/interview/InterviewList';
import { InterviewDetail } from './components/interview/InterviewDetail';
import { InterviewModal } from './components/interview/InterviewModal';
import { DiagnosticDashboard } from './components/diagnostic/DiagnosticDashboard';
import { KnowledgeBase } from './components/knowledge/KnowledgeBase';
import { ApiKeyModal } from './components/ApiKeyModal';
import { MultiCompanyResumeOptimizer } from './components/MultiCompanyResumeOptimizer';
import { InterviewCalendarView } from './components/InterviewCalendarView';
import { WorkDailyLogDashboard } from './components/WorkDailyLogDashboard';
import { CompanyDossierModal } from './components/CompanyDossierModal';
import { JdKnowledgeRecommenderModal } from './components/JdKnowledgeRecommenderModal';
import {
  Sparkles,
  Download,
  RotateCcw,
  Layout,
  Columns,
  Eye,
  FileEdit,
  Briefcase,
  SlidersHorizontal,
  CalendarDays,
  Video,
  BarChart3,
  BookOpen,
  PenTool,
  UserRound,
  Landmark,
  Code2,
  Palette,
  FileText
} from 'lucide-react';

type CareerSection = 'pipeline' | 'optimize' | 'calendar' | 'interviews' | 'diagnostics';
type KnowledgeSection = 'library' | 'work_materials';

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<MainTab>('resume');
  const [careerSection, setCareerSection] = useState<CareerSection>('pipeline');
  const [knowledgeSection, setKnowledgeSection] = useState<KnowledgeSection>('library');

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

  // Dossier Modal State
  const [selectedDossierJob, setSelectedDossierJob] = useState<JobApplication | null>(null);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);

  // JD Recommender Modal State
  const [isJdRecommenderOpen, setIsJdRecommenderOpen] = useState(false);
  const [jdRecommenderInitialSection, setJdRecommenderInitialSection] = useState<string | undefined>();

  // Modals
  const [isAiResumeOpen, setIsAiResumeOpen] = useState(false);
  const [isResumeImportOpen, setIsResumeImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isJobProxyOpen, setIsJobProxyOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<InterviewRecord | null>(null);
  const [initialInterviewCompany, setInitialInterviewCompany] = useState<string | undefined>();

  // Auto persist
  useEffect(() => {
    saveResumeData(resume);
  }, [resume]);

  useEffect(() => {
    saveJobApplications(jobs);
  }, [jobs]);

  useEffect(() => {
    saveInterviewRecords(interviews);
  }, [interviews]);

  useEffect(() => {
    saveKnowledgeItems(knowledgeItems);
  }, [knowledgeItems]);

  useEffect(() => {
    saveLeetBooks(books);
  }, [books]);

  useEffect(() => {
    saveWorkDailyLogs(workLogs);
  }, [workLogs]);

  useEffect(() => {
    if (diagnosticReport) {
      saveDiagnosticReport(diagnosticReport);
    }
  }, [diagnosticReport]);

  const handleImportResumeSuccess = (importedData: ResumeData, mergeMode: 'replace' | 'merge') => {
    if (mergeMode === 'replace') {
      setResume(importedData);
    } else {
      setResume(prev => ({
        ...prev,
        title: importedData.title || prev.title,
        summary: importedData.summary || prev.summary,
        workExperience: [...(importedData.workExperience || []), ...prev.workExperience],
        projects: [...(importedData.projects || []), ...prev.projects],
        skills: [...prev.skills, ...(importedData.skills || [])],
        certificates: [...prev.certificates, ...(importedData.certificates || [])]
      }));
    }
  };



  // Initial diagnostic report bootstrapping if not present
  useEffect(() => {
    if (!diagnosticReport && interviews.length > 0) {
      import('./services/geminiService').then(({ requestCrossInterviewDiagnostic }) => {
        requestCrossInterviewDiagnostic(interviews).then(res => {
          setDiagnosticReport(res);
        }).catch(err => console.warn('Diagnostic bootstrap notice:', err));
      });
    }
  }, []);

  // Job handlers
  const handleSaveJob = (job: JobApplication) => {
    setJobs(prev => {
      const exists = prev.some(j => j.id === job.id);
      if (exists) {
        return prev.map(j => j.id === job.id ? job : j);
      }
      return [job, ...prev];
    });
  };

  const handleDeleteJob = (id: string) => {
    if (confirm('确定删除该投递记录吗？')) {
      setJobs(prev => prev.filter(j => j.id !== id));
    }
  };

  const handleUpdateJobStatus = (id: string, status: ApplicationStatus) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status, updatedAt: new Date().toISOString().split('T')[0] } : j));
  };

  // Interview handlers
  const handleSaveInterview = (record: InterviewRecord) => {
    setInterviews(prev => {
      const exists = prev.some(iv => iv.id === record.id);
      if (exists) {
        return prev.map(iv => iv.id === record.id ? record : iv);
      }
      return [record, ...prev];
    });
    setSelectedInterviewId(record.id);
  };

  const handleDeleteInterview = (id: string) => {
    setInterviews(prev => prev.filter(iv => iv.id !== id));
    if (selectedInterviewId === id) {
      setSelectedInterviewId(null);
    }
  };

  const handleUpdateInterviewRecord = (updated: InterviewRecord) => {
    setInterviews(prev => prev.map(iv => iv.id === updated.id ? updated : iv));
  };

  const selectedInterview = interviews.find(iv => iv.id === selectedInterviewId);

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenApiKey={() => setIsApiKeyOpen(true)}
        onOpenAiGenerator={() => setIsAiResumeOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {/* ================= TAB 1: RESUME STUDIO ================= */}
        {currentTab === 'resume' && (
          <div className="space-y-4">
            {/* Template Selector & Toolbar */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
              {/* Template Chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-700 mr-1 flex items-center gap-1">
                  <Layout className="w-3.5 h-3.5 text-blue-600" />
                  精选简历模板:
                </span>
                <button
                  onClick={() => setTemplateId('modern')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    templateId === 'modern'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <UserRound className="w-3.5 h-3.5 inline mr-1.5" />
                  现代轻简（推荐）
                </button>
                <button
                  onClick={() => setTemplateId('classic')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    templateId === 'classic'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Landmark className="w-3.5 h-3.5 inline mr-1.5" />
                  经典精炼（传统大厂）
                </button>
                <button
                  onClick={() => setTemplateId('tech-sidebar')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    templateId === 'tech-sidebar'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 inline mr-1.5" />
                  极客双栏（技能密集）
                </button>
                <button
                  onClick={() => setTemplateId('creative')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    templateId === 'creative'
                      ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5 inline mr-1.5" />
                  创意活力（视觉表达）
                </button>
                <button
                  onClick={() => setTemplateId('compact')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    templateId === 'compact'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 inline mr-1.5" />
                  紧凑一页（高密度排版）
                </button>
              </div>

              {/* View mode toggle & actions */}
              <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
                {/* View Mode Toggle */}
                <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl text-xs">
                  <button
                    onClick={() => setResumeViewMode('split')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                      resumeViewMode === 'split' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5" />
                    双栏对照
                  </button>
                  <button
                    onClick={() => setResumeViewMode('edit')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                      resumeViewMode === 'edit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    仅编辑
                  </button>
                  <button
                    onClick={() => setResumeViewMode('preview')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                      resumeViewMode === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    仅预览
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsResumeImportOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold transition-colors"
                    title="导入已有简历文件 (Markdown/JSON/TXT) 或粘贴文本"
                  >
                    <Download className="w-3.5 h-3.5 rotate-180" />
                    导入已有简历
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('确定重置为您提供的默认优质高阶简历模板吗？')) {
                        setResume(defaultResume);
                      }
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100"
                    title="恢复默认简历数据"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    重置模板
                  </button>

                  <button
                    onClick={() => setIsExportOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    导出 / 邮箱发送
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

        {/* ================= CAREER MANAGEMENT HUB ================= */}
        {currentTab === 'career' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-xs overflow-x-auto">
              <div className="flex min-w-max items-center gap-1">
                {[
                  { id: 'pipeline', label: '投递与背调', hint: '公司与进度', icon: Briefcase },
                  { id: 'optimize', label: '定向精修', hint: '最多 3 家公司', icon: SlidersHorizontal },
                  { id: 'calendar', label: '面试日程', hint: '安排与提醒', icon: CalendarDays },
                  { id: 'interviews', label: '面试复盘', hint: '音视频与总结', icon: Video },
                  { id: 'diagnostics', label: '趋势诊断', hint: '跨轮高频问题', icon: BarChart3 },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = careerSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCareerSection(item.id as CareerSection)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-left transition-all ${
                        active ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>
                        <span className="block text-xs font-bold leading-tight">{item.label}</span>
                        <span className={`block text-[10px] mt-0.5 ${active ? 'text-blue-100' : 'text-slate-400'}`}>{item.hint}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {careerSection === 'optimize' && (
              <MultiCompanyResumeOptimizer currentResume={resume} jobApplications={jobs} onUpdateResume={setResume} />
            )}

            {careerSection === 'pipeline' && (
              <JobPipeline
                jobs={jobs}
                onOpenJobProxy={() => setIsJobProxyOpen(true)}
                onAddJob={() => { setEditingJob(null); setIsJobModalOpen(true); }}
                onEditJob={(job) => { setEditingJob(job); setIsJobModalOpen(true); }}
                onDeleteJob={handleDeleteJob}
                onUpdateStatus={handleUpdateJobStatus}
                onOpenDossier={(job) => { setSelectedDossierJob(job); setIsDossierModalOpen(true); }}
                onOpenCalendar={() => setCareerSection('calendar')}
                onOpenJdRecommend={() => setIsJdRecommenderOpen(true)}
                onNavigateToInterview={(companyName) => {
                  setCareerSection('interviews');
                  const found = interviews.find(iv => iv.companyName.includes(companyName) || companyName.includes(iv.companyName));
                  if (found) {
                    setSelectedInterviewId(found.id);
                  } else {
                    setSelectedInterviewId(null);
                    setInitialInterviewCompany(companyName);
                    setIsInterviewModalOpen(true);
                  }
                }}
              />
            )}

            {careerSection === 'calendar' && (
              <InterviewCalendarView
                jobApplications={jobs}
                onUpdateApplication={handleSaveJob}
                onOpenDossier={(app) => { setSelectedDossierJob(app); setIsDossierModalOpen(true); }}
                onStartMockInterview={(companyName) => {
                  setCareerSection('interviews');
                  setInitialInterviewCompany(companyName);
                  setIsInterviewModalOpen(true);
                }}
              />
            )}

            {careerSection === 'interviews' && (
              <div>
                {selectedInterview ? (
                  <InterviewDetail
                    record={selectedInterview}
                    onBack={() => setSelectedInterviewId(null)}
                    onEdit={() => { setEditingInterview(selectedInterview); setIsInterviewModalOpen(true); }}
                    onUpdateRecord={handleUpdateInterviewRecord}
                  />
                ) : (
                  <InterviewList
                    interviews={interviews}
                    onSelectInterview={(id) => setSelectedInterviewId(id)}
                    onAddInterview={() => {
                      setEditingInterview(null);
                      setInitialInterviewCompany(undefined);
                      setIsInterviewModalOpen(true);
                    }}
                    onDeleteInterview={handleDeleteInterview}
                  />
                )}
              </div>
            )}

            {careerSection === 'diagnostics' && (
              <DiagnosticDashboard interviews={interviews} report={diagnosticReport} onUpdateReport={setDiagnosticReport} />
            )}
          </div>
        )}

        {/* ================= KNOWLEDGE & WORK MATERIALS ================= */}
        {currentTab === 'knowledge' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-xs inline-flex items-center gap-1">
              <button
                onClick={() => setKnowledgeSection('library')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  knowledgeSection === 'library' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                技术知识库
              </button>
              <button
                onClick={() => setKnowledgeSection('work_materials')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  knowledgeSection === 'work_materials' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <PenTool className="w-4 h-4" />
                工作素材
              </button>
            </div>

            {knowledgeSection === 'library' ? (
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
            ) : (
              <WorkDailyLogDashboard
                logs={workLogs}
                onSaveLogs={setWorkLogs}
                currentResume={resume}
                onUpdateResume={setResume}
              />
            )}
          </div>
        )}
      </main>

      {/* Global Modals */}
      <ResumeImportModal
        isOpen={isResumeImportOpen}
        onClose={() => setIsResumeImportOpen(false)}
        currentResume={resume}
        onImportSuccess={handleImportResumeSuccess}
      />

      <JobSiteProxyModal
        isOpen={isJobProxyOpen}
        onClose={() => setIsJobProxyOpen(false)}
        currentResume={resume}
        onAddJob={handleSaveJob}
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
      />

      <ApiKeyModal
        isOpen={isApiKeyOpen}
        onClose={() => setIsApiKeyOpen(false)}
      />

      <JobModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        onSave={handleSaveJob}
        editingJob={editingJob}
      />

      <InterviewModal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        onSave={handleSaveInterview}
        editingRecord={editingInterview}
        initialCompanyName={initialInterviewCompany}
      />

      {/* Company Dossier Modal */}
      {selectedDossierJob && (
        <CompanyDossierModal
          isOpen={isDossierModalOpen}
          onClose={() => setIsDossierModalOpen(false)}
          application={selectedDossierJob}
          onSaveDossier={(appId, dossier) => {
            setJobs(prev => prev.map(j => j.id === appId ? { ...j, companyDossier: dossier } : j));
            if (selectedDossierJob.id === appId) {
              setSelectedDossierJob(prev => prev ? { ...prev, companyDossier: dossier } : null);
            }
          }}
        />
      )}

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
          setKnowledgeItems(prev => [item, ...prev]);
        }}
      />
    </div>
  );
}
