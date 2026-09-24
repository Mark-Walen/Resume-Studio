import React, { useState } from 'react';
import {
  ResumeData,
  WorkExperience,
  ProjectExperience,
  SkillCategory,
  Education,
  Certificate,
  JobIntent,
  CustomSection
} from '../../types/resume';
import { sanitizeImageUrl } from '../../utils/security';
import {
  User,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Wrench,
  Award,
  Target,
  FileText,
  Plus,
  Trash2,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  GripVertical,
  CheckSquare,
  Square,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Edit2,
  SlidersHorizontal,
  Layers,
  Lock,
  ExternalLink
} from 'lucide-react';
import { RichTextEditor } from '../common/RichTextEditor';
import { DEFAULT_TEST_AVATAR } from '../../data/defaultResume';

interface ResumeEditorProps {
  resume: ResumeData;
  onChange: (updated: ResumeData) => void;
  onOpenAiGenerator: () => void;
  onOpenImportResume?: () => void;
}

type EditingModuleType =
  | 'personalInfo'
  | 'jobIntent'
  | 'summary'
  | 'skills'
  | 'workExperience'
  | 'projects'
  | 'education'
  | 'certificates'
  | 'custom';

export const ResumeEditor: React.FC<ResumeEditorProps> = ({
  resume,
  onChange,
  onOpenAiGenerator
}) => {
  // Unified Organize State: toggle between normal view and drag-and-drop sort + multi-select visibility
  const [isOrganizing, setIsOrganizing] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<EditingModuleType | null>(null);
  const [activeCustomId, setActiveCustomId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Fallback defaults for ordering & visibility
  const sectionOrder = resume.sectionOrder || [
    'workExperience',
    'projects',
    'skills',
    'education',
    'certificates',
    ...(resume.customSections?.map(c => c.id) || [])
  ];

  const sectionVisibility = resume.sectionVisibility || {
    workExperience: true,
    projects: true,
    skills: true,
    education: true,
    certificates: true,
    ...(resume.customSections?.reduce((acc, c) => ({ ...acc, [c.id]: true }), {}) || {})
  };

  const updateSectionVisibility = (key: string, visible: boolean) => {
    const updated = { ...sectionVisibility, [key]: visible };
    onChange({
      ...resume,
      sectionVisibility: updated
    });
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...sectionOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    onChange({
      ...resume,
      sectionOrder: newOrder
    });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const newOrder = [...sectionOrder];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, removed);
    onChange({
      ...resume,
      sectionOrder: newOrder
    });
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // --- Helpers to update Resume sections ---
  const updatePersonalInfo = (field: string, value: string) => {
    onChange({
      ...resume,
      personalInfo: {
        ...resume.personalInfo,
        [field]: value
      },
      lastModified: new Date().toISOString().split('T')[0]
    });
  };

  const updateJobIntent = (field: keyof JobIntent, value: string) => {
    onChange({
      ...resume,
      jobIntent: {
        ...(resume.jobIntent || {
          desiredPosition: '',
          desiredSalary: '',
          desiredCity: '',
          jobStatus: '在职 · 考虑新机会',
          workType: '全职'
        }),
        [field]: value
      },
      lastModified: new Date().toISOString().split('T')[0]
    });
  };

  const updateSummary = (val: string) => {
    onChange({
      ...resume,
      summary: val,
      lastModified: new Date().toISOString().split('T')[0]
    });
  };

  // Add Custom Section
  const handleAddCustomSection = () => {
    const newId = 'custom-' + Date.now();
    const newCustom: CustomSection = {
      id: newId,
      title: '自定义特色模块',
      content: '- 详细记录您的额外成果、论文专利或代表作品\n- 支持富文本排版与清单列表'
    };
    const updatedCustoms = [...(resume.customSections || []), newCustom];
    const updatedOrder = [...sectionOrder, newId];
    const updatedVisibility = { ...sectionVisibility, [newId]: true };

    onChange({
      ...resume,
      customSections: updatedCustoms,
      sectionOrder: updatedOrder,
      sectionVisibility: updatedVisibility
    });

    setActiveCustomId(newId);
    setActiveModal('custom');
  };

  const handleRemoveCustomSection = (id: string) => {
    const updatedCustoms = (resume.customSections || []).filter(c => c.id !== id);
    const updatedOrder = sectionOrder.filter(k => k !== id);
    const updatedVisibility = { ...sectionVisibility };
    delete updatedVisibility[id];

    onChange({
      ...resume,
      customSections: updatedCustoms,
      sectionOrder: updatedOrder,
      sectionVisibility: updatedVisibility
    });
  };

  // Module configuration metadata
  const getModuleMeta = (key: string) => {
    switch (key) {
      case 'workExperience':
        return {
          title: '工作经历',
          sub: `${resume.workExperience.length} 段工作沉淀`,
          icon: <Briefcase className="w-4 h-4 text-[#0071e3]" />,
          type: 'workExperience' as EditingModuleType
        };
      case 'projects':
        return {
          title: '重点项目',
          sub: `${resume.projects.length} 个核心项目`,
          icon: <FolderGit2 className="w-4 h-4 text-[#0071e3]" />,
          type: 'projects' as EditingModuleType
        };
      case 'skills':
        return {
          title: '专业技能矩阵',
          sub: `${resume.skills.length} 个技能分类`,
          icon: <Wrench className="w-4 h-4 text-[#0071e3]" />,
          type: 'skills' as EditingModuleType
        };
      case 'education':
        return {
          title: '教育背景',
          sub: `${resume.education.length} 项学历记录`,
          icon: <GraduationCap className="w-4 h-4 text-[#0071e3]" />,
          type: 'education' as EditingModuleType
        };
      case 'certificates':
        return {
          title: '证书与荣誉',
          sub: `${resume.certificates.length} 项资质认证`,
          icon: <Award className="w-4 h-4 text-[#0071e3]" />,
          type: 'certificates' as EditingModuleType
        };
      default: {
        const custom = (resume.customSections || []).find(c => c.id === key);
        return {
          title: custom?.title || '自定义模块',
          sub: '富文本自定义版块',
          icon: <Layers className="w-4 h-4 text-[#0071e3]" />,
          type: 'custom' as EditingModuleType,
          customId: key
        };
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col h-full font-sans overflow-hidden">
      {/* Top Header & Mode Switcher */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
              简历模块与排版排布
            </h2>
            <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-600 whitespace-nowrap hidden sm:inline-block">
              单击卡片即可弹出精修
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate" title="核心模块固定置顶，其它模块支持自由勾选显隐与拖动排序">
            核心模块固定置顶，其它模块自由勾选显隐与拖动排序
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
          {/* AI Generator Button (placed to the left of organize button) */}
          <button
            type="button"
            onClick={onOpenAiGenerator}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#0071e3] dark:text-blue-300 border border-blue-200 dark:border-blue-800/70 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
            title="唤起 AI 智能简历生成工坊"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0071e3] flex-shrink-0" />
            <span className="whitespace-nowrap">AI 生成</span>
          </button>

          {/* Merged Organize Button (Multi-select visibility & Drag reorder) */}
          <button
            type="button"
            onClick={() => setIsOrganizing(!isOrganizing)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex-shrink-0 shadow-2xs ${
              isOrganizing
                ? 'bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
            }`}
            title={isOrganizing ? '完成排布并退出排序' : '一键开启拖拽排序与多选显隐'}
          >
            {isOrganizing ? (
              <>
                <Check className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="whitespace-nowrap">完成排布</span>
              </>
            ) : (
              <>
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#0071e3] flex-shrink-0" />
                <span className="whitespace-nowrap">调整模块顺序</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main List of Modules */}
      <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 bg-white dark:bg-slate-900">
        {/* Fixed & Mandatory Group - Displayed row by row */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              固定置顶核心模块 · 必选展示
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              置顶保留，单击卡片即可编辑
            </span>
          </div>

          <div className="space-y-2.5">
            {/* 1. 个人基本信息 */}
            <div
              onClick={() => setActiveModal('personalInfo')}
              className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-[#0071e3] dark:hover:border-[#0071e3] hover:shadow-xs cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3.5">
                {resume.personalInfo.avatarUrl ? (
                  <img
                    src={sanitizeImageUrl(resume.personalInfo.avatarUrl)}
                    alt={resume.personalInfo.fullName}
                    className="w-10 h-13 object-cover rounded-xs border border-slate-200 dark:border-slate-700 shadow-xs flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] flex items-center justify-center font-bold flex-shrink-0 group-hover:bg-[#0071e3] group-hover:text-white transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">1. 个人基本信息</span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full font-semibold border border-emerald-200/60 dark:border-emerald-800/60">
                      必选置顶
                    </span>
                    {resume.personalInfo.avatarUrl && (
                      <span className="text-[10px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full font-medium border border-blue-200/60 dark:border-blue-800/60">
                        {resume.personalInfo.avatarUrl === DEFAULT_TEST_AVATAR ? '已配置测试头像' : '已上传证件照'}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{resume.personalInfo.fullName || '未设置姓名'}</span>
                    <span>·</span>
                    <span>{resume.personalInfo.jobTitle || '求职职位'}</span>
                    <span>·</span>
                    <span>{resume.personalInfo.phone || '联系电话'}</span>
                    <span>·</span>
                    <span>{resume.personalInfo.email || '电子邮箱'}</span>
                    <span>·</span>
                    <span>{resume.personalInfo.location || '所在城市'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0 text-xs font-semibold text-[#0071e3]">
                <span>编辑信息</span>
                <Edit2 className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 2. 求职意向 */}
            <div
              onClick={() => setActiveModal('jobIntent')}
              className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-[#0071e3] dark:hover:border-[#0071e3] hover:shadow-xs cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] flex items-center justify-center font-bold flex-shrink-0 group-hover:bg-[#0071e3] group-hover:text-white transition-colors">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">2. 求职意向与期望薪资</span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full font-semibold border border-emerald-200/60 dark:border-emerald-800/60">
                      必选置顶
                    </span>
                    {resume.jobIntent?.desiredSalary && (
                      <span className="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full font-bold border border-amber-200/60 dark:border-amber-800/60">
                        期望: {resume.jobIntent.desiredSalary}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      目标职位: {resume.jobIntent?.desiredPosition || resume.personalInfo.jobTitle || '未设置'}
                    </span>
                    <span>·</span>
                    <span>城市: {resume.jobIntent?.desiredCity || '全国/待定'}</span>
                    <span>·</span>
                    <span>状态: {resume.jobIntent?.jobStatus || '离职-随时到岗'}</span>
                    <span>·</span>
                    <span>形式: {resume.jobIntent?.workType || '全职'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0 text-xs font-semibold text-[#0071e3]">
                <span>编辑意向</span>
                <Edit2 className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 3. 个人总结与优势 */}
            <div
              onClick={() => setActiveModal('summary')}
              className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-[#0071e3] dark:hover:border-[#0071e3] hover:shadow-xs cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] flex items-center justify-center font-bold flex-shrink-0 group-hover:bg-[#0071e3] group-hover:text-white transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">3. 个人总结与核心优势</span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full font-semibold border border-emerald-200/60 dark:border-emerald-800/60">
                      必选置顶
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 max-w-xl">
                    {resume.summary ? resume.summary.replace(/[#*`>-]/g, '').trim() : '富文本编辑核心技术栈沉淀、架构深度与业务交付优势'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0 text-xs font-semibold text-[#0071e3]">
                <span>编辑总结</span>
                <Edit2 className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Reorderable & Toggleable Group */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {isOrganizing ? '按住抓手拖动或按箭头排序 · 勾选多选框控制显隐' : '模块排布与显隐'}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              共 {sectionOrder.length} 个可调模块
            </span>
          </div>

          <div className="space-y-2">
            {sectionOrder.map((key, idx) => {
              const meta = getModuleMeta(key);
              const isVisible = sectionVisibility[key] ?? true;
              const isDragging = draggedIndex === idx;
              const isDragOver = dragOverIndex === idx && draggedIndex !== idx;

              return (
                <div
                  key={key}
                  draggable={isOrganizing}
                  onDragStart={(e) => isOrganizing && handleDragStart(e, idx)}
                  onDragOver={(e) => isOrganizing && handleDragOver(e, idx)}
                  onDrop={(e) => isOrganizing && handleDrop(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                    isDragging
                      ? 'opacity-40 scale-[0.98] border-[#0071e3] bg-blue-50/50 dark:bg-blue-950/20'
                      : isDragOver
                      ? 'border-t-2 border-[#0071e3] shadow-md bg-blue-50/20 dark:bg-blue-950/10'
                      : isVisible
                      ? 'bg-white dark:bg-slate-800/80 border-slate-200/90 dark:border-slate-700/80 hover:border-[#0071e3] dark:hover:border-[#0071e3] shadow-xs'
                      : 'bg-slate-50/70 dark:bg-slate-900/40 border-dashed border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  {/* Left: Grip Handle (if organizing) + Checkbox + Icon + Title */}
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    {isOrganizing && (
                      <div
                        className="flex items-center gap-1 text-slate-400 dark:text-slate-500 p-1 cursor-grab active:cursor-grabbing hover:text-[#0071e3] flex-shrink-0"
                        title="按住鼠标拖动即可上下调换顺序"
                      >
                        <GripVertical className="w-4 h-4" />
                        <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 w-3 text-center">
                          {idx + 1}
                        </span>
                      </div>
                    )}

                    {/* Multi-select Checkbox */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateSectionVisibility(key, !isVisible);
                      }}
                      className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors p-1 cursor-pointer flex-shrink-0"
                      title={isVisible ? '点击隐藏此模块' : '点击展示此模块'}
                    >
                      {isVisible ? (
                        <CheckSquare className="w-4 h-4 text-[#0071e3]" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                      )}
                    </button>

                    <div
                      onClick={() => {
                        if (meta.type === 'custom') {
                          setActiveCustomId(key);
                        }
                        setActiveModal(meta.type);
                      }}
                      className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-[#0071e3] flex-shrink-0">
                        {meta.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="truncate">{meta.title}</span>
                          {!isVisible && (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded-sm font-normal">已隐藏</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{meta.sub}</div>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Reorder arrows in organize mode, or Edit button */}
                  <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                    {isOrganizing ? (
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveSection(idx, 'up')}
                          className="p-1 rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-20 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          title="上移"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === sectionOrder.length - 1}
                          onClick={() => moveSection(idx, 'down')}
                          className="p-1 rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-20 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          title="下移"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (meta.type === 'custom') {
                            setActiveCustomId(key);
                          }
                          setActiveModal(meta.type);
                        }}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                      >
                        编辑内容
                      </button>
                    )}

                    {meta.type === 'custom' && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomSection(key)}
                        className="p-1 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors ml-1 cursor-pointer"
                        title="删除此自定义模块"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 添加自定义模块 - 放置在内置模块最后 */}
          <div className="pt-3">
            <button
              type="button"
              onClick={handleAddCustomSection}
              className="w-full py-3 px-4 border-2 border-dashed border-slate-300 dark:border-slate-700/80 hover:border-[#0071e3] dark:hover:border-[#0071e3] hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-[#0071e3] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer group shadow-2xs"
            >
              <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>添加自定义模块 (如开源作品、专刊著作、海外背景、个人专利等)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= MODAL DIALOGS ================= */}

      {/* 1. 基本信息弹窗 (Personal Info Modal) */}
      {activeModal === 'personalInfo' && (
        <ModalWrapper
          title="编辑个人基本信息"
          subtitle="配置基本联系方式、个人主页及标准免冠证件照"
          onClose={() => setActiveModal(null)}
        >
          <div className="space-y-4">
            {/* 证件照上传与预览 */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-start gap-4">
              <div className="relative">
                {resume.personalInfo.avatarUrl ? (
                  <img
                    src={sanitizeImageUrl(resume.personalInfo.avatarUrl)}
                    alt="证件照"
                    className="w-20 h-26 object-cover border border-slate-300 dark:border-slate-600 rounded-xs shadow-xs bg-white dark:bg-slate-900"
                  />
                ) : (
                  <div
                    onClick={() => updatePersonalInfo('avatarUrl', DEFAULT_TEST_AVATAR)}
                    className="w-20 h-26 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-[#0071e3] dark:hover:border-[#0071e3] rounded-xs flex flex-col items-center justify-center text-slate-400 hover:text-[#0071e3] bg-white dark:bg-slate-900 cursor-pointer transition-colors group/ph"
                    title="点击一键填入测试头像占位符"
                  >
                    <ImageIcon className="w-5 h-5 mb-1 group-hover/ph:scale-110 transition-transform" />
                    <span className="text-[10px] font-medium">点击填入</span>
                    <span className="text-[8px] text-slate-400">测试头像</span>
                  </div>
                )}
              </div>
              <div className="space-y-2 flex-1">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">标准大头证件照 (1寸/2寸标准比例)</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  支持上传本地免冠大头照。按规范的证件照标准比例展示，简历预览时不裁切大圆角。
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="px-3 py-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-xs font-medium cursor-pointer transition-colors inline-flex items-center gap-1 shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>上传照片</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            updatePersonalInfo('avatarUrl', reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => updatePersonalInfo('avatarUrl', DEFAULT_TEST_AVATAR)}
                    className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-[#0071e3] border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1"
                    title="一键填入高清标准免冠证件照（仅用于效果测试）"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>使用测试头像</span>
                  </button>
                  {resume.personalInfo.avatarUrl && (
                    <button
                      type="button"
                      onClick={() => updatePersonalInfo('avatarUrl', '')}
                      className="px-2.5 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl font-medium cursor-pointer"
                    >
                      移除照片
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">真实姓名 *</label>
                <input
                  type="text"
                  value={resume.personalInfo.fullName}
                  onChange={e => updatePersonalInfo('fullName', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                  placeholder="例如：张伟"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">专业头衔 / 岗位 *</label>
                <input
                  type="text"
                  value={resume.personalInfo.jobTitle}
                  onChange={e => updatePersonalInfo('jobTitle', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                  placeholder="例如：资深全栈研发专家"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">联系电话 *</label>
                <input
                  type="text"
                  value={resume.personalInfo.phone}
                  onChange={e => updatePersonalInfo('phone', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                  placeholder="+86 138-0000-0000"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">电子邮箱 *</label>
                <input
                  type="email"
                  value={resume.personalInfo.email}
                  onChange={e => updatePersonalInfo('email', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                  placeholder="name@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">现居城市 / 工作地</label>
                <input
                  type="text"
                  value={resume.personalInfo.location}
                  onChange={e => updatePersonalInfo('location', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                  placeholder="北京 / 杭州 (支持远程)"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">个人主页 / 技术博客</label>
                <input
                  type="text"
                  value={resume.personalInfo.website || ''}
                  onChange={e => updatePersonalInfo('website', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                  placeholder="https://myblog.dev"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">GitHub 链接</label>
                <input
                  type="text"
                  value={resume.personalInfo.github || ''}
                  onChange={e => updatePersonalInfo('github', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                  placeholder="https://github.com/username"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">LinkedIn 链接</label>
                <input
                  type="text"
                  value={resume.personalInfo.linkedin || ''}
                  onChange={e => updatePersonalInfo('linkedin', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* 2. 求职意向弹窗 (Job Intent Modal) */}
      {activeModal === 'jobIntent' && (
        <ModalWrapper
          title="编辑求职意向与期望薪资"
          subtitle="明确期望职位、期望薪资、期望城市与求职状态，在简历中作为独立版块展示"
          onClose={() => setActiveModal(null)}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">期望职位 *</label>
                <input
                  type="text"
                  value={resume.jobIntent?.desiredPosition || ''}
                  onChange={e => updateJobIntent('desiredPosition', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                  placeholder="例如：前端专家 / 全栈架构师"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">期望薪资 *</label>
                <input
                  type="text"
                  value={resume.jobIntent?.desiredSalary || ''}
                  onChange={e => updateJobIntent('desiredSalary', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                  placeholder="例如：35k - 45k · 16薪 (可面议)"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">期望城市 / 工作地点</label>
                <input
                  type="text"
                  value={resume.jobIntent?.desiredCity || ''}
                  onChange={e => updateJobIntent('desiredCity', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                  placeholder="北京 / 杭州 / 远程"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">当前求职状态</label>
                <select
                  value={resume.jobIntent?.jobStatus || '在职 · 考虑新机会'}
                  onChange={e => updateJobIntent('jobStatus', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                >
                  <option value="离职 · 随时到岗">离职 · 随时到岗</option>
                  <option value="在职 · 考虑新机会">在职 · 考虑新机会</option>
                  <option value="在职 · 暂不考虑新机会">在职 · 暂不考虑新机会</option>
                  <option value="应届生求职">应届生求职</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">工作性质偏好</label>
                <input
                  type="text"
                  value={resume.jobIntent?.workType || '全职'}
                  onChange={e => updateJobIntent('workType', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                  placeholder="全职 / 远程办公 / 顾问兼职"
                />
              </div>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* 3. 个人总结弹窗 (Summary Modal with RichTextEditor) */}
      {activeModal === 'summary' && (
        <ModalWrapper
          title="编辑个人总结"
          subtitle="支持高保真富文本排版与格式清单，提炼您的技术深度、业务成果与核心壁垒"
          onClose={() => setActiveModal(null)}
        >
          <div className="space-y-3">
            <RichTextEditor
              label="个人专业优势与总结"
              value={resume.summary}
              onChange={updateSummary}
              placeholder="概括您的核心技术栈、团队领导经验、千万级高并发/复杂架构落地沉淀..."
              minHeight="min-h-[180px]"
            />
          </div>
        </ModalWrapper>
      )}

      {/* 4. 工作经历弹窗 (Work Experience Modal) */}
      {activeModal === 'workExperience' && (
        <WorkExperienceModal
          workExperience={resume.workExperience}
          onChange={(newExp) => onChange({ ...resume, workExperience: newExp })}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* 5. 重点项目弹窗 (Project Experience Modal) */}
      {activeModal === 'projects' && (
        <ProjectExperienceModal
          projects={resume.projects}
          onChange={(newProj) => onChange({ ...resume, projects: newProj })}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* 6. 专业技能弹窗 (Skills Modal) */}
      {activeModal === 'skills' && (
        <SkillsModal
          skills={resume.skills}
          onChange={(newSkills) => onChange({ ...resume, skills: newSkills })}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* 7. 教育背景弹窗 (Education Modal) */}
      {activeModal === 'education' && (
        <EducationModal
          education={resume.education}
          onChange={(newEdu) => onChange({ ...resume, education: newEdu })}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* 8. 证书荣誉弹窗 (Certificates Modal) */}
      {activeModal === 'certificates' && (
        <CertificatesModal
          certificates={resume.certificates}
          onChange={(newCerts) => onChange({ ...resume, certificates: newCerts })}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* 9. 自定义模块弹窗 (Custom Section Modal) */}
      {activeModal === 'custom' && activeCustomId && (
        <CustomSectionModal
          section={resume.customSections?.find(c => c.id === activeCustomId)}
          onSave={(updated) => {
            const list = (resume.customSections || []).map(c => c.id === updated.id ? updated : c);
            onChange({ ...resume, customSections: list });
            setActiveModal(null);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
};

// ================= SUB-MODAL COMPONENTS =================

interface ModalWrapperProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
  hideFooter?: boolean;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({ title, subtitle, children, onClose, hideFooter = false }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900">
          {children}
        </div>

        {!hideFooter && <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            保存并应用
          </button>
        </div>}
      </div>
    </div>
  );
};

// 1. Work Experience Sub-Modal
const WorkExperienceModal: React.FC<{
  workExperience: WorkExperience[];
  onChange: (items: WorkExperience[]) => void;
  onClose: () => void;
}> = ({ workExperience, onChange, onClose }) => {
  const [editingId, setEditingId] = useState<string | null>(workExperience[0]?.id || null);

  const addExperience = () => {
    const newId = 'exp-' + Date.now();
    const item: WorkExperience = {
      id: newId,
      company: '新公司名称',
      position: '职位头衔',
      department: '核心技术部',
      location: '北京',
      startDate: '2023-01',
      endDate: '至今',
      current: true,
      highlights: ['主导核心业务系统开发，提升系统响应速度与稳定性。']
    };
    onChange([item, ...workExperience]);
    setEditingId(newId);
  };

  const currentItem = workExperience.find(w => w.id === editingId);

  const updateCurrent = (field: keyof WorkExperience, val: any) => {
    if (!editingId) return;
    onChange(workExperience.map(w => w.id === editingId ? { ...w, [field]: val } : w));
  };

  return (
    <ModalWrapper
      title="工作经历管理"
      subtitle="按时间倒序列举您的企业任职履历与技术职责亮点"
      onClose={onClose}
    >
      <div className="flex flex-col sm:flex-row gap-4 min-h-[380px]">
        {/* Left List */}
        <div className="sm:w-56 border-r border-slate-200 dark:border-slate-800 pr-3 space-y-2 flex-shrink-0">
          <button
            type="button"
            onClick={addExperience}
            className="w-full py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>添加工作履历</span>
          </button>

          <div className="space-y-1 overflow-y-auto max-h-[320px]">
            {workExperience.map(exp => (
              <div
                key={exp.id}
                onClick={() => setEditingId(exp.id)}
                className={`p-2 rounded-lg cursor-pointer text-xs transition-colors flex items-center justify-between ${
                  editingId === exp.id
                    ? 'bg-[#0071e3] text-white'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="truncate flex-1">
                  <div className="font-bold truncate">{exp.company || '未命名公司'}</div>
                  <div className={`text-[10px] truncate ${editingId === exp.id ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                    {exp.position}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(workExperience.filter(w => w.id !== exp.id));
                  }}
                  className={`p-1 hover:text-red-400 rounded-md ml-1 ${editingId === exp.id ? 'text-blue-200' : 'text-slate-400'}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Detail Edit with Notion/Yuque Editor */}
        <div className="flex-1 space-y-3">
          {currentItem ? (
            <>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">公司名称</label>
                  <input
                    type="text"
                    value={currentItem.company}
                    onChange={e => updateCurrent('company', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">职位头衔</label>
                  <input
                    type="text"
                    value={currentItem.position}
                    onChange={e => updateCurrent('position', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">起止周期</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={currentItem.startDate}
                      onChange={e => updateCurrent('startDate', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#0071e3]"
                      placeholder="2022-01"
                    />
                    <span className="text-slate-400">~</span>
                    <input
                      type="text"
                      value={currentItem.endDate}
                      onChange={e => updateCurrent('endDate', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#0071e3]"
                      placeholder="至今"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">部门 / 城市</label>
                  <input
                    type="text"
                    value={currentItem.department || ''}
                    onChange={e => updateCurrent('department', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#0071e3]"
                    placeholder="基础架构部 · 北京"
                  />
                </div>
              </div>

              {/* Highlights using RichTextEditor */}
              <RichTextEditor
                label="工作职责与突出成就亮点"
                value={currentItem.highlights.join('\n')}
                onChange={val => updateCurrent('highlights', val.split('\n').filter(Boolean))}
                placeholder="- 主导核心系统性能重构，首屏耗时降低 50%\n- 带领团队落地 AI 辅助生成体系"
                minHeight="min-h-[140px]"
              />
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              请在左侧选择或添加一段工作经历进行编辑
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};

// 2. Project Experience Sub-Modal
const ProjectExperienceModal: React.FC<{
  projects: ProjectExperience[];
  onChange: (items: ProjectExperience[]) => void;
  onClose: () => void;
}> = ({ projects, onChange, onClose }) => {
  const [editingId, setEditingId] = useState<string | null>(projects[0]?.id || null);

  const addProject = () => {
    const newId = 'proj-' + Date.now();
    const item: ProjectExperience = {
      id: newId,
      name: '新项目名称',
      role: '主导研发',
      startDate: '2023-06',
      endDate: '2024-01',
      description: '简要介绍项目背景与业务目标。',
      highlights: ['采用分布式架构实现毫秒级响应', '基于 React 19 实现实时协作'],
      techStack: ['React', 'TypeScript', 'Node.js']
    };
    onChange([item, ...projects]);
    setEditingId(newId);
  };

  const currentItem = projects.find(p => p.id === editingId);

  const updateCurrent = (field: keyof ProjectExperience, val: any) => {
    if (!editingId) return;
    onChange(projects.map(p => p.id === editingId ? { ...p, [field]: val } : p));
  };

  return (
    <ModalWrapper
      title="重点项目经历管理"
      subtitle="突出核心架构设计、攻坚难点与量化业务成果"
      onClose={onClose}
    >
      <div className="flex flex-col sm:flex-row gap-4 min-h-[380px]">
        <div className="sm:w-56 border-r border-slate-200 dark:border-slate-800 pr-3 space-y-2 flex-shrink-0">
          <button
            type="button"
            onClick={addProject}
            className="w-full py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>添加重点项目</span>
          </button>

          <div className="space-y-1 overflow-y-auto max-h-[320px]">
            {projects.map(proj => (
              <div
                key={proj.id}
                onClick={() => setEditingId(proj.id)}
                className={`p-2 rounded-lg cursor-pointer text-xs transition-colors flex items-center justify-between ${
                  editingId === proj.id
                    ? 'bg-[#0071e3] text-white'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="truncate flex-1">
                  <div className="font-bold truncate">{proj.name || '未命名项目'}</div>
                  <div className={`text-[10px] truncate ${editingId === proj.id ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                    {proj.role}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(projects.filter(p => p.id !== proj.id));
                  }}
                  className={`p-1 hover:text-red-400 rounded-md ml-1 ${editingId === proj.id ? 'text-blue-200' : 'text-slate-400'}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {currentItem ? (
            <>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">项目名称</label>
                  <input
                    type="text"
                    value={currentItem.name}
                    onChange={e => updateCurrent('name', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">负责角色</label>
                  <input
                    type="text"
                    value={currentItem.role}
                    onChange={e => updateCurrent('role', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">起止时间</label>
                  <input
                    type="text"
                    value={`${currentItem.startDate} ~ ${currentItem.endDate}`}
                    onChange={e => {
                      const [s, end] = e.target.value.split('~');
                      updateCurrent('startDate', s?.trim() || '');
                      updateCurrent('endDate', end?.trim() || '');
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#0071e3]"
                    placeholder="2023-01 ~ 2023-08"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">技术栈 (逗号分隔)</label>
                  <input
                    type="text"
                    value={currentItem.techStack.join(', ')}
                    onChange={e => updateCurrent('techStack', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#0071e3]"
                    placeholder="React, TypeScript, Go"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">项目简述与背景</label>
                <textarea
                  value={currentItem.description}
                  onChange={e => updateCurrent('description', e.target.value)}
                  rows={2}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#0071e3] resize-none"
                />
              </div>

              <RichTextEditor
                label="项目攻坚亮点与量化成果"
                value={currentItem.highlights.join('\n')}
                onChange={val => updateCurrent('highlights', val.split('\n').filter(Boolean))}
                placeholder="- 优化系统算法，降低延迟 40%\n- 架构创新落地"
                minHeight="min-h-[120px]"
              />
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              请在左侧选择或添加一个项目经历进行编辑
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};

// 3. Skills Sub-Modal
const SkillsModal: React.FC<{
  skills: SkillCategory[];
  onChange: (items: SkillCategory[]) => void;
  onClose: () => void;
}> = ({ skills, onChange, onClose }) => {
  const addCategory = () => {
    const newCat: SkillCategory = {
      id: 'skill-' + Date.now(),
      category: '新分类技能',
      skills: ['技能1', '技能2']
    };
    onChange([...skills, newCat]);
  };

  return (
    <ModalWrapper
      title="专业技能矩阵编辑"
      subtitle="按技术方向进行模块化分类展示，便于招聘主管快速建立技术标签画像"
      onClose={onClose}
    >
      <div className="space-y-3">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={addCategory}
            className="px-3 py-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>添加技能分类</span>
          </button>
        </div>

        <div className="space-y-3 max-h-[360px] overflow-y-auto">
          {skills.map(s => (
            <div key={s.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={s.category}
                  onChange={e => onChange(skills.map(item => item.id === s.id ? { ...item, category: e.target.value } : item))}
                  className="font-bold text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#0071e3]"
                  placeholder="分类名称 (如：前端核心工程)"
                />
                <button
                  type="button"
                  onClick={() => onChange(skills.filter(item => item.id !== s.id))}
                  className="text-slate-400 hover:text-red-500 text-xs p-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <input
                  type="text"
                  value={s.skills.join(' · ')}
                  onChange={e => onChange(skills.map(item => item.id === s.id ? { ...item, skills: e.target.value.split(/[·,、]/).map(t => t.trim()).filter(Boolean) } : item))}
                  className="w-full text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#0071e3]"
                  placeholder="以中点或逗号分隔技能标签，如：React 19 · TypeScript · Next.js"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </ModalWrapper>
  );
};

// 4. Education Sub-Modal
const EducationModal: React.FC<{
  education: Education[];
  onChange: (items: Education[]) => void;
  onClose: () => void;
}> = ({ education, onChange, onClose }) => {
  const addEducation = () => {
    const item: Education = {
      id: 'edu-' + Date.now(),
      school: '院校名称',
      degree: '本科学士',
      major: '计算机科学',
      startDate: '2016-09',
      endDate: '2020-06'
    };
    onChange([...education, item]);
  };

  return (
    <ModalWrapper
      title="教育背景管理"
      subtitle="毕业院校、专业学历与起止年份"
      onClose={onClose}
    >
      <div className="space-y-3">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={addEducation}
            className="px-3 py-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>添加教育背景</span>
          </button>
        </div>

        <div className="space-y-3 max-h-[360px] overflow-y-auto">
          {education.map(edu => (
            <div key={edu.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">学历记录</span>
                <button
                  type="button"
                  onClick={() => onChange(education.filter(e => e.id !== edu.id))}
                  className="text-slate-400 hover:text-red-500 text-xs p-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  value={edu.school}
                  onChange={e => onChange(education.map(item => item.id === edu.id ? { ...item, school: e.target.value } : item))}
                  placeholder="学校名称"
                  className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#0071e3]"
                />
                <input
                  type="text"
                  value={edu.degree}
                  onChange={e => onChange(education.map(item => item.id === edu.id ? { ...item, degree: e.target.value } : item))}
                  placeholder="学位学历 (如：工学学士)"
                  className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#0071e3]"
                />
                <input
                  type="text"
                  value={edu.major}
                  onChange={e => onChange(education.map(item => item.id === edu.id ? { ...item, major: e.target.value } : item))}
                  placeholder="专业名称"
                  className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#0071e3]"
                />
                <input
                  type="text"
                  value={`${edu.startDate} ~ ${edu.endDate}`}
                  onChange={e => {
                    const [s, end] = e.target.value.split('~');
                    onChange(education.map(item => item.id === edu.id ? { ...item, startDate: s?.trim() || '', endDate: end?.trim() || '' } : item));
                  }}
                  placeholder="起止时间 (2016-09 ~ 2020-06)"
                  className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#0071e3]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </ModalWrapper>
  );
};

// 5. Certificates Sub-Modal (按行列举)
const CertificatesModal: React.FC<{
  certificates: Certificate[];
  onChange: (items: Certificate[]) => void;
  onClose: () => void;
}> = ({ certificates, onChange, onClose }) => {
  const addCert = () => {
    const item: Certificate = {
      id: 'cert-' + Date.now(),
      name: '资质证书 / 竞赛荣誉名称',
      issuer: '认证机构',
      date: '2023-01'
    };
    onChange([...certificates, item]);
  };

  return (
    <ModalWrapper
      title="资质认证与专业荣誉"
      subtitle="每个资质独立单行列举，保持简历排版端正整齐"
      onClose={onClose}
    >
      <div className="space-y-3">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={addCert}
            className="px-3 py-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>添加证书荣誉</span>
          </button>
        </div>

        <div className="space-y-2 max-h-[360px] overflow-y-auto">
          {certificates.map(c => (
            <div key={c.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center gap-3">
              <Award className="w-4 h-4 text-[#0071e3] flex-shrink-0" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 text-xs">
                <input
                  type="text"
                  value={c.name}
                  onChange={e => onChange(certificates.map(item => item.id === c.id ? { ...item, name: e.target.value } : item))}
                  placeholder="证书/奖项名称"
                  className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold focus:outline-none focus:border-[#0071e3]"
                />
                <input
                  type="text"
                  value={c.issuer}
                  onChange={e => onChange(certificates.map(item => item.id === c.id ? { ...item, issuer: e.target.value } : item))}
                  placeholder="发证机构 (如 AWS / CNCF)"
                  className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#0071e3]"
                />
                <input
                  type="text"
                  value={c.date}
                  onChange={e => onChange(certificates.map(item => item.id === c.id ? { ...item, date: e.target.value } : item))}
                  placeholder="获得时间 (如 2023-05)"
                  className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#0071e3]"
                />
              </div>
              <button
                type="button"
                onClick={() => onChange(certificates.filter(item => item.id !== c.id))}
                className="text-slate-400 hover:text-red-500 p-1 rounded-md cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </ModalWrapper>
  );
};

// 6. Custom Section Sub-Modal (with Notion/Yuque RichTextEditor)
const CustomSectionModal: React.FC<{
  section?: CustomSection;
  onSave: (updated: CustomSection) => void;
  onClose: () => void;
}> = ({ section, onSave, onClose }) => {
  const [title, setTitle] = useState(section?.title || '自定义模块');
  const [content, setContent] = useState(section?.content || '');

  if (!section) return null;

  return (
    <ModalWrapper
      title="编辑自定义模块"
      subtitle="自定义模块标题与富文本正文，支持任意定制扩展"
      onClose={onClose}
      hideFooter
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">模块标题 *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#0071e3]"
            placeholder="例如：开源贡献与专利 / 行业影响力"
          />
        </div>

        <RichTextEditor
          label="模块富文本内容"
          value={content}
          onChange={setContent}
          placeholder="输入自定义模块正文，支持 Markdown 标记与列表..."
          minHeight="min-h-[180px]"
        />

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => onSave({ ...section, title, content })}
            className="px-5 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors"
          >
            保存此模块
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};
