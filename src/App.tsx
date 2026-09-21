import React, { useState, useEffect } from 'react';
import { ResumeData, ResumeTemplateId } from './types/resume';
import { JobApplication, ApplicationStatus } from './types/job';
import { InterviewRecord } from './types/interview';
import { CrossInterviewDiagnosticReport } from './types/diagnostic';
import { defaultResume } from './data/defaultResume';
import { mockInterviews } from './data/mockInterviews';
import { INITIAL_KNOWLEDGE_BASE } from './data/knowledgeBaseData';
import { KnowledgeItem } from './types/knowledge';
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
import {
  Sparkles,
  Download,
  RotateCcw,
  Layout,
  Columns,
  Eye,
  FileEdit,
  ShieldCheck
} from 'lucide-react';

const INITIAL_JOBS: JobApplication[] = [
  {
    id: 'job-1',
    companyName: '字节跳动 (Bytedance)',
    position: '资深前端 / 架构师 (商业化大模型应用)',
    salaryExpectation: '50k - 65k · 16薪',
    location: '北京 / 望京',
    status: 'interviewing',
    priority: 'high',
    source: '猎头推荐',
    recruiterContact: 'WeChat: bytedance_talent_anna',
    jobDescription: '主导广告与商业化AI前端系统架构，负责大并发场景下的WebAssembly/Canvas渲染性能调优。',
    notes: '已通过一面和二面架构技术面，等待三面交叉评审。注意准备线上稳定性排障与SLA防线。',
    appliedDate: '2026-09-08',
    updatedAt: '2026-09-17'
  },
  {
    id: 'job-2',
    companyName: '阿里巴巴 (Alibaba)',
    position: '前端技术专家 (国际电商)',
    salaryExpectation: '48k - 60k · 16薪 + 股票',
    location: '杭州 / 西溪',
    status: 'interviewing',
    priority: 'high',
    source: '员工内推',
    recruiterContact: 'ali_talent_leo@alibaba-inc.com',
    jobDescription: '负责全球化跨境多端基建，支撑全球高可用电商交易闭环。',
    notes: '已完成三面交叉面，面试官重点考察了异常兜底与故障熔断降级机制。',
    appliedDate: '2026-09-10',
    updatedAt: '2026-09-18'
  },
  {
    id: 'job-3',
    companyName: '腾讯 (Tencent)',
    position: '资深全栈开发工程师 (PCG 核心平台)',
    salaryExpectation: '45k - 55k · 16薪',
    location: '深圳 / 滨海',
    status: 'screening',
    priority: 'medium',
    source: 'Boss直聘',
    recruiterContact: 'hr_tencent@tencent.com',
    jobDescription: '海量用户内容分发平台架构，微前端基建与全链路性能监控。',
    notes: 'HR 已通过简历筛选，预约下周初技术一面。',
    appliedDate: '2026-09-14',
    updatedAt: '2026-09-15'
  },
  {
    id: 'job-4',
    companyName: '小红书 (RED)',
    position: 'AI 全栈开发专家 (推荐与搜索)',
    salaryExpectation: '50k - 60k',
    location: '上海 / 新天地',
    status: 'wishlist',
    priority: 'high',
    source: '猎头推荐',
    wishlistTargetDate: '2026-09-25',
    jobDescription: '探索生成式 AI 与社区搜索推荐深度结合，落地确定性 Guardrails 与 Agent 应用。',
    notes: '目标公司储备，待准备好 AI 落地架构案例集后再投递。',
    updatedAt: '2026-09-19'
  },
  {
    id: 'job-5',
    companyName: '美团 (Meituan)',
    position: '资深前端工程师 (到店事业群)',
    salaryExpectation: '42k - 50k · 15.5薪',
    location: '北京 / 恒基',
    status: 'wishlist',
    priority: 'medium',
    wishlistTargetDate: '2026-09-28',
    notes: '预投递池储备，待复盘完生产稳定性考点后再投递。',
    updatedAt: '2026-09-19'
  }
];

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<MainTab>('resume');

  // Resume State
  const [resume, setResume] = useState<ResumeData>(() => loadResumeData(defaultResume));
  const [templateId, setTemplateId] = useState<ResumeTemplateId>('modern');
  const [resumeViewMode, setResumeViewMode] = useState<'split' | 'edit' | 'preview'>('split');

  // Jobs Pipeline State
  const [jobs, setJobs] = useState<JobApplication[]>(() => {
    const saved = loadJobApplications();
    return saved.length > 0 ? saved : INITIAL_JOBS;
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
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'interviews') {
            // Keep current view or null
          }
        }}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenApiKey={() => setIsApiKeyOpen(true)}
        onOpenAiGenerator={() => setIsAiResumeOpen(true)}
        onOpenImportResume={() => setIsResumeImportOpen(true)}
        onOpenJobProxy={() => setIsJobProxyOpen(true)}
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
                  👔 现代轻简 (推荐)
                </button>
                <button
                  onClick={() => setTemplateId('classic')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    templateId === 'classic'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  🏛️ 经典精炼 (传统大厂)
                </button>
                <button
                  onClick={() => setTemplateId('tech-sidebar')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    templateId === 'tech-sidebar'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  ⚡ 极客双栏 (技能密集)
                </button>
                <button
                  onClick={() => setTemplateId('creative')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    templateId === 'creative'
                      ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  🎨 创意活力 (活力视觉)
                </button>
                <button
                  onClick={() => setTemplateId('compact')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    templateId === 'compact'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  📄 紧凑一页 (高密度排版)
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

        {/* ================= TAB 2: JOB PIPELINE & WISHLIST ================= */}
        {currentTab === 'pipeline' && (
          <JobPipeline
            jobs={jobs}
            onOpenJobProxy={() => setIsJobProxyOpen(true)}
            onAddJob={() => {
              setEditingJob(null);
              setIsJobModalOpen(true);
            }}
            onEditJob={(job) => {
              setEditingJob(job);
              setIsJobModalOpen(true);
            }}
            onDeleteJob={handleDeleteJob}
            onUpdateStatus={handleUpdateJobStatus}
            onNavigateToInterview={(companyName) => {
              setCurrentTab('interviews');
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

        {/* ================= TAB 3: INTERVIEWS & MEDIA PLAYBACK ================= */}
        {currentTab === 'interviews' && (
          <div>
            {selectedInterview ? (
              <InterviewDetail
                record={selectedInterview}
                onBack={() => setSelectedInterviewId(null)}
                onEdit={() => {
                  setEditingInterview(selectedInterview);
                  setIsInterviewModalOpen(true);
                }}
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

        {/* ================= TAB 4: DIAGNOSTIC DASHBOARD ================= */}
        {currentTab === 'diagnostics' && (
          <DiagnosticDashboard
            interviews={interviews}
            report={diagnosticReport}
            onUpdateReport={setDiagnosticReport}
          />
        )}

        {/* ================= TAB 5: BASIC KNOWLEDGE BASE ================= */}
        {currentTab === 'knowledge' && (
          <KnowledgeBase
            items={knowledgeItems}
            onUpdateItems={setKnowledgeItems}
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
    </div>
  );
}
