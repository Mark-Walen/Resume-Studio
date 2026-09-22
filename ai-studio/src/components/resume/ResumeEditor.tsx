import React, { useState } from 'react';
import { ResumeData, WorkExperience, ProjectExperience, SkillCategory, Education, CustomResumeSection } from '../../types/resume';
import { Plus, Trash2, ChevronDown, ChevronUp, Sparkles, User, Briefcase, FolderGit2, GraduationCap, Wrench, LayoutList, GripVertical, Upload, X, WalletCards } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';

interface ResumeEditorProps {
  resume: ResumeData;
  onChange: (updated: ResumeData) => void;
  onOpenAiGenerator: () => void;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({
  resume,
  onChange,
  onOpenAiGenerator,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'skills' | 'experience' | 'projects' | 'education' | 'custom'>('info');
  const [draggedSection, setDraggedSection] = useState<string | null>(null);

  const builtInOrder = ['summary', 'skills', 'workExperience', 'projects', 'education', 'certificates'];
  const customSections = resume.customSections || [];
  const sectionOrder = resume.sectionOrder || [...builtInOrder, ...customSections.map(section => `custom:${section.id}`)];
  const sectionLabels: Record<string, string> = {
    summary: '个人总结', skills: '专业技能', workExperience: '工作经历', projects: '项目经历', education: '教育背景', certificates: '证书与荣誉'
  };

  const markChanged = (patch: Partial<ResumeData>) => onChange({ ...resume, ...patch, lastModified: new Date().toISOString().split('T')[0] });

  const handleAvatarUpload = (file?: File) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type) || file.size > 2 * 1024 * 1024) {
      window.alert('头像仅支持 JPG、PNG 或 WebP，文件大小不超过 2 MB。');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updatePersonalInfo('avatarUrl', String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const reorderSection = (target: string) => {
    if (!draggedSection || draggedSection === target) return;
    const next = [...sectionOrder];
    const sourceIndex = next.indexOf(draggedSection);
    const targetIndex = next.indexOf(target);
    if (sourceIndex < 0 || targetIndex < 0) return;
    next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, draggedSection);
    markChanged({ sectionOrder: next });
    setDraggedSection(null);
  };

  const moveSection = (key: string, direction: -1 | 1) => {
    const currentIndex = sectionOrder.indexOf(key);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= sectionOrder.length) return;
    const next = [...sectionOrder];
    [next[currentIndex], next[nextIndex]] = [next[nextIndex], next[currentIndex]];
    markChanged({ sectionOrder: next });
  };

  const addCustomSection = () => {
    const section: CustomResumeSection = { id: `custom-${Date.now()}`, title: '自定义模块', content: '<p>在这里填写补充经历、开源贡献、个人作品或其他信息。</p>' };
    markChanged({ customSections: [...customSections, section], sectionOrder: [...sectionOrder, `custom:${section.id}`] });
  };

  const updateCustomSection = (id: string, patch: Partial<CustomResumeSection>) => markChanged({
    customSections: customSections.map(section => section.id === id ? { ...section, ...patch } : section)
  });

  const removeCustomSection = (id: string) => markChanged({
    customSections: customSections.filter(section => section.id !== id),
    sectionOrder: sectionOrder.filter(key => key !== `custom:${id}`)
  });

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

  // Work Experience
  const addExperience = () => {
    const newExp: WorkExperience = {
      id: 'exp-' + Date.now(),
      company: '新公司名称',
      position: '职位头衔',
      startDate: '2024-01',
      endDate: '至今',
      current: true,
      highlights: ['主导核心功能开发，提升系统稳定性与业务吞吐量。']
    };
    onChange({
      ...resume,
      workExperience: [newExp, ...resume.workExperience]
    });
  };

  const removeExperience = (id: string) => {
    onChange({
      ...resume,
      workExperience: resume.workExperience.filter(e => e.id !== id)
    });
  };

  const updateExperience = (id: string, field: keyof WorkExperience, value: any) => {
    onChange({
      ...resume,
      workExperience: resume.workExperience.map(e => e.id === id ? { ...e, [field]: value } : e)
    });
  };

  // Project Experience
  const addProject = () => {
    const newProj: ProjectExperience = {
      id: 'proj-' + Date.now(),
      name: '新项目名称',
      role: '主导研发',
      startDate: '2024-01',
      endDate: '2024-06',
      description: '简要说明项目背景与核心目标。',
      highlights: ['完成核心驱动或协议模块设计、联调与异常路径验证。'],
      techStack: ['C/C++', 'FreeRTOS', 'STM32']
    };
    onChange({
      ...resume,
      projects: [newProj, ...resume.projects]
    });
  };

  const removeProject = (id: string) => {
    onChange({
      ...resume,
      projects: resume.projects.filter(p => p.id !== id)
    });
  };

  const updateProject = (id: string, field: keyof ProjectExperience, value: any) => {
    onChange({
      ...resume,
      projects: resume.projects.map(p => p.id === id ? { ...p, [field]: value } : p)
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Editor Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">简历内容编辑</h2>
          <p className="text-xs text-slate-500">实时同步预览，支持多模块增删改</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="btn-open-ai-generator"
            onClick={onOpenAiGenerator}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI 语音/经历生成
          </button>
        </div>
      </div>

      {/* Editor Sub-Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-2 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'info' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          基本信息与总结
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'skills' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          专业技能 ({resume.skills.length})
        </button>
        <button
          onClick={() => setActiveTab('experience')}
          className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'experience' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          工作经历 ({resume.workExperience.length})
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'projects' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          项目经历 ({resume.projects.length})
        </button>
        <button
          onClick={() => setActiveTab('education')}
          className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'education' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          教育与证书
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'custom' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <LayoutList className="w-3.5 h-3.5" />
          模块与排版 ({customSections.length})
        </button>
      </div>

      {/* Editor Content Area */}
      <div className="p-4 overflow-y-auto max-h-[720px] space-y-4">
        {/* Tab: Info & Summary */}
        {activeTab === 'info' && (
          <div className="space-y-3.5">
            <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
                {resume.personalInfo.avatarUrl ? <img src={resume.personalInfo.avatarUrl} alt="简历头像" className="w-full h-full object-cover" /> : <User className="w-8 h-8" />}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 mb-1">个人头像</div>
                <p className="text-[11px] text-slate-500 mb-2">支持 JPG、PNG、WebP，最大 2 MB。头像会同步到预览和 Word 导出。</p>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-blue-300 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    {resume.personalInfo.avatarUrl ? '更换头像' : '添加头像'}
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={event => handleAvatarUpload(event.target.files?.[0])} />
                  </label>
                  {resume.personalInfo.avatarUrl && <button type="button" onClick={() => updatePersonalInfo('avatarUrl', '')} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:text-red-600"><X className="w-3.5 h-3.5" />移除</button>}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">姓名</label>
                <input
                  type="text"
                  value={resume.personalInfo.fullName}
                  onChange={e => updatePersonalInfo('fullName', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">求职岗位 / 头衔</label>
                <input
                  type="text"
                  value={resume.personalInfo.jobTitle}
                  onChange={e => updatePersonalInfo('jobTitle', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">电子邮箱</label>
                <input
                  type="email"
                  value={resume.personalInfo.email}
                  onChange={e => updatePersonalInfo('email', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">联系电话</label>
                <input
                  type="tel"
                  value={resume.personalInfo.phone}
                  onChange={e => updatePersonalInfo('phone', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">所在城市 / 偏好</label>
                <input
                  type="text"
                  value={resume.personalInfo.location}
                  onChange={e => updatePersonalInfo('location', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="flex items-center gap-1 block text-xs font-semibold text-slate-700 mb-1"><WalletCards className="w-3.5 h-3.5" />期望薪资</label>
                <input
                  type="text"
                  value={resume.personalInfo.expectedSalary || ''}
                  onChange={e => updatePersonalInfo('expectedSalary', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                  placeholder="例如：18–20K / 面议"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub / 作品集主页</label>
                <input
                  type="text"
                  value={resume.personalInfo.github || ''}
                  onChange={e => updatePersonalInfo('github', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                  placeholder="https://github.com/..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">专业优势与职业总结 (Summary)</label>
              <RichTextEditor value={resume.summary} onChange={summary => markChanged({ summary })} placeholder="总结核心技术、攻坚成果与岗位优势；可像 Notion 一样设置标题、列表和重点。" />
            </div>
          </div>
        )}

        {/* Tab: Skills */}
        {activeTab === 'skills' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">将技能按类别分组展示，便于 HR / 技术面试官快速匹配岗位</span>
              <button
                onClick={() => {
                  const newCat: SkillCategory = {
                    id: 'skill-' + Date.now(),
                    category: '新技能类别',
                    skills: ['技能1', '技能2']
                  };
                  onChange({ ...resume, skills: [...resume.skills, newCat] });
                }}
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                添加技能分类
              </button>
            </div>

            <div className="space-y-3">
              {resume.skills.map((cat, idx) => (
                <div key={cat.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 relative">
                  <div className="flex items-center justify-between mb-2">
                    <input
                      type="text"
                      value={cat.category}
                      onChange={e => {
                        const updated = [...resume.skills];
                        updated[idx].category = e.target.value;
                        onChange({ ...resume, skills: updated });
                      }}
                      className="font-bold text-xs bg-white px-2 py-1 rounded border border-slate-300 w-44"
                    />
                    <button
                      onClick={() => {
                        onChange({ ...resume, skills: resume.skills.filter(s => s.id !== cat.id) });
                      }}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <label className="block text-[11px] text-slate-500 mb-1">具体技能点 (英文逗号或换行分隔):</label>
                  <textarea
                    rows={2}
                    value={cat.skills.join(', ')}
                    onChange={e => {
                      const list = e.target.value.split(/[,，、\n]/).map(s => s.trim()).filter(Boolean);
                      const updated = [...resume.skills];
                      updated[idx].skills = list;
                      onChange({ ...resume, skills: updated });
                    }}
                    className="w-full text-xs p-2 bg-white rounded border border-slate-200"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Experience */}
        {activeTab === 'experience' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">按倒序记录工作经历，遵循 STAR 原则突出量化指标</span>
              <button
                onClick={addExperience}
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                添加经历
              </button>
            </div>

            <div className="space-y-4">
              {resume.workExperience.map(exp => (
                <div key={exp.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <div className="grid grid-cols-2 gap-2 flex-1 mr-2">
                      <input
                        type="text"
                        placeholder="公司名称"
                        value={exp.company}
                        onChange={e => updateExperience(exp.id, 'company', e.target.value)}
                        className="px-2 py-1 text-xs font-bold bg-white border border-slate-300 rounded"
                      />
                      <input
                        type="text"
                        placeholder="岗位头衔"
                        value={exp.position}
                        onChange={e => updateExperience(exp.id, 'position', e.target.value)}
                        className="px-2 py-1 text-xs bg-white border border-slate-300 rounded"
                      />
                    </div>
                    <button
                      onClick={() => removeExperience(exp.id)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="开始时间 (如: 2023-03)"
                      value={exp.startDate}
                      onChange={e => updateExperience(exp.id, 'startDate', e.target.value)}
                      className="px-2 py-1 bg-white border border-slate-200 rounded text-[11px]"
                    />
                    <input
                      type="text"
                      placeholder="结束时间 (如: 至今)"
                      value={exp.endDate}
                      onChange={e => updateExperience(exp.id, 'endDate', e.target.value)}
                      className="px-2 py-1 bg-white border border-slate-200 rounded text-[11px]"
                    />
                    <input
                      type="text"
                      placeholder="部门与城市"
                      value={exp.department || ''}
                      onChange={e => updateExperience(exp.id, 'department', e.target.value)}
                      className="px-2 py-1 bg-white border border-slate-200 rounded text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">主要产出与职责 (每行一条):</label>
                    <textarea
                      rows={3}
                      value={exp.highlights.join('\n')}
                      onChange={e => {
                        const lines = e.target.value.split('\n').filter(Boolean);
                        updateExperience(exp.id, 'highlights', lines);
                      }}
                      className="w-full text-xs p-2 bg-white rounded border border-slate-200 leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">关联核心技术 (逗号分隔):</label>
                    <input
                      type="text"
                      value={(exp.technologies || []).join(', ')}
                      onChange={e => {
                        const list = e.target.value.split(/[,，]/).map(s => s.trim()).filter(Boolean);
                        updateExperience(exp.id, 'technologies', list);
                      }}
                      className="w-full px-2 py-1 text-xs bg-white rounded border border-slate-200"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Projects */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">重点项目经验 (突出架构设计、难点攻关与量化结果)</span>
              <button
                onClick={addProject}
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                添加项目
              </button>
            </div>

            <div className="space-y-4">
              {resume.projects.map(proj => (
                <div key={proj.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="grid grid-cols-2 gap-2 flex-1 mr-2">
                      <input
                        type="text"
                        placeholder="项目名称"
                        value={proj.name}
                        onChange={e => updateProject(proj.id, 'name', e.target.value)}
                        className="px-2 py-1 text-xs font-bold bg-white border border-slate-300 rounded"
                      />
                      <input
                        type="text"
                        placeholder="担任角色"
                        value={proj.role}
                        onChange={e => updateProject(proj.id, 'role', e.target.value)}
                        className="px-2 py-1 text-xs bg-white border border-slate-300 rounded"
                      />
                    </div>
                    <button
                      onClick={() => removeProject(proj.id)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="开始时间"
                      value={proj.startDate}
                      onChange={e => updateProject(proj.id, 'startDate', e.target.value)}
                      className="px-2 py-1 bg-white border border-slate-200 rounded text-[11px]"
                    />
                    <input
                      type="text"
                      placeholder="结束时间"
                      value={proj.endDate}
                      onChange={e => updateProject(proj.id, 'endDate', e.target.value)}
                      className="px-2 py-1 bg-white border border-slate-200 rounded text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">项目简介:</label>
                    <input
                      type="text"
                      value={proj.description}
                      onChange={e => updateProject(proj.id, 'description', e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-white rounded border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">核心亮点与攻关难点 (每行一条):</label>
                    <textarea
                      rows={2}
                      value={proj.highlights.join('\n')}
                      onChange={e => {
                        const lines = e.target.value.split('\n').filter(Boolean);
                        updateProject(proj.id, 'highlights', lines);
                      }}
                      className="w-full text-xs p-2 bg-white rounded border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">项目技术栈 (逗号分隔):</label>
                    <input
                      type="text"
                      value={proj.techStack.join(', ')}
                      onChange={e => {
                        const list = e.target.value.split(/[,，]/).map(s => s.trim()).filter(Boolean);
                        updateProject(proj.id, 'techStack', list);
                      }}
                      className="w-full px-2 py-1 text-xs bg-white rounded border border-slate-200"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Education */}
        {activeTab === 'education' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900">学历背景</h3>
              {resume.education.map(edu => (
                <div key={edu.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="院校名称"
                      value={edu.school}
                      onChange={e => {
                        const updated = resume.education.map(ed => ed.id === edu.id ? { ...ed, school: e.target.value } : ed);
                        onChange({ ...resume, education: updated });
                      }}
                      className="px-2 py-1 text-xs font-bold bg-white border border-slate-300 rounded"
                    />
                    <input
                      type="text"
                      placeholder="学位学历"
                      value={edu.degree}
                      onChange={e => {
                        const updated = resume.education.map(ed => ed.id === edu.id ? { ...ed, degree: e.target.value } : ed);
                        onChange({ ...resume, education: updated });
                      }}
                      className="px-2 py-1 text-xs bg-white border border-slate-300 rounded"
                    />
                    <input
                      type="text"
                      placeholder="主修专业"
                      value={edu.major}
                      onChange={e => {
                        const updated = resume.education.map(ed => ed.id === edu.id ? { ...ed, major: e.target.value } : ed);
                        onChange({ ...resume, education: updated });
                      }}
                      className="px-2 py-1 text-xs bg-white border border-slate-300 rounded"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="起止时间"
                      value={`${edu.startDate} ~ ${edu.endDate}`}
                      onChange={e => {
                        const parts = e.target.value.split('~').map(s => s.trim());
                        const updated = resume.education.map(ed => ed.id === edu.id ? { ...ed, startDate: parts[0] || '', endDate: parts[1] || '' } : ed);
                        onChange({ ...resume, education: updated });
                      }}
                      className="px-2 py-1 text-xs bg-white border border-slate-200 rounded"
                    />
                    <input
                      type="text"
                      placeholder="GPA / 成绩"
                      value={edu.gpa || ''}
                      onChange={e => {
                        const updated = resume.education.map(ed => ed.id === edu.id ? { ...ed, gpa: e.target.value } : ed);
                        onChange({ ...resume, education: updated });
                      }}
                      className="px-2 py-1 text-xs bg-white border border-slate-200 rounded"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-900">专业证书与荣誉</h3>
                <button
                  onClick={() => {
                    const newCert = {
                      id: 'cert-' + Date.now(),
                      name: '新证书名称',
                      issuer: '颁发机构',
                      date: '2024'
                    };
                    onChange({ ...resume, certificates: [...resume.certificates, newCert] });
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                >
                  + 添加证书
                </button>
              </div>
              {resume.certificates.map(c => (
                <div key={c.id} className="flex gap-2 items-center bg-slate-50 p-2 rounded border border-slate-200">
                  <input
                    type="text"
                    value={c.name}
                    onChange={e => {
                      const updated = resume.certificates.map(ct => ct.id === c.id ? { ...ct, name: e.target.value } : ct);
                      onChange({ ...resume, certificates: updated });
                    }}
                    className="flex-1 px-2 py-1 text-xs bg-white border border-slate-200 rounded"
                    placeholder="证书名称"
                  />
                  <input
                    type="text"
                    value={c.issuer}
                    onChange={e => {
                      const updated = resume.certificates.map(ct => ct.id === c.id ? { ...ct, issuer: e.target.value } : ct);
                      onChange({ ...resume, certificates: updated });
                    }}
                    className="w-32 px-2 py-1 text-xs bg-white border border-slate-200 rounded"
                    placeholder="颁发机构"
                  />
                  <button
                    onClick={() => {
                      onChange({ ...resume, certificates: resume.certificates.filter(ct => ct.id !== c.id) });
                    }}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'custom' && (
          <div className="space-y-5">
            <section>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">模块顺序</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">拖动模块调整简历展示顺序，头像与基本信息始终位于顶部。</p>
                </div>
                <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-full">拖动排序</span>
              </div>
              <div className="space-y-2">
                {sectionOrder.map((key, index) => {
                  const custom = key.startsWith('custom:') ? customSections.find(section => `custom:${section.id}` === key) : undefined;
                  return (
                    <div key={key} draggable onDragStart={() => setDraggedSection(key)} onDragEnd={() => setDraggedSection(null)} onDragOver={event => event.preventDefault()} onDrop={() => reorderSection(key)} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition ${draggedSection === key ? 'border-blue-400 bg-blue-50 opacity-60' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                      <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                      <span className="w-5 h-5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 flex items-center justify-center">{index + 1}</span>
                      <span className="flex-1 text-xs font-semibold text-slate-700">{custom?.title || sectionLabels[key] || '自定义模块'}</span>
                      {custom && <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">自定义</span>}
                      <div className="flex items-center gap-0.5">
                        <button type="button" onClick={() => moveSection(key, -1)} disabled={index === 0} className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-25" title="上移"><ChevronUp className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => moveSection(key, 1)} disabled={index === sectionOrder.length - 1} className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-25" title="下移"><ChevronDown className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">自定义模块</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">适合开源贡献、作品、语言能力、专利或自我评价。</p>
                </div>
                <button type="button" onClick={addCustomSection} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700">
                  <Plus className="w-3.5 h-3.5" />添加模块
                </button>
              </div>

              {customSections.length === 0 ? (
                <button type="button" onClick={addCustomSection} className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-xs text-slate-500 hover:border-blue-400 hover:text-blue-600">添加第一个自定义模块</button>
              ) : (
                <div className="space-y-4">
                  {customSections.map(section => (
                    <div key={section.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-3">
                      <div className="flex items-center gap-2">
                        <input value={section.title} onChange={event => updateCustomSection(section.id, { title: event.target.value })} className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold focus:outline-none focus:border-blue-500" placeholder="模块名称" />
                        <button type="button" onClick={() => removeCustomSection(section.id)} className="p-1.5 text-slate-400 hover:text-red-600" title="删除模块"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <RichTextEditor value={section.content} onChange={content => updateCustomSection(section.id, { content })} placeholder="像 Notion 或语雀一样编辑模块内容…" minHeight="150px" />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
