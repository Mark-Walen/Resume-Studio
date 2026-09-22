import React, { useState } from 'react';
import { ResumeData, WorkExperience, ProjectExperience, SkillCategory, Education } from '../../types/resume';
import { Plus, Trash2, ChevronDown, ChevronUp, Sparkles, User, Briefcase, FolderGit2, GraduationCap, Wrench } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'info' | 'skills' | 'experience' | 'projects' | 'education'>('info');

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
      highlights: ['设计高可用架构，并实现自动化CI/CD持续交付。'],
      techStack: ['React', 'TypeScript', 'Node.js']
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
      </div>

      {/* Editor Content Area */}
      <div className="p-4 overflow-y-auto max-h-[720px] space-y-4">
        {/* Tab: Info & Summary */}
        {activeTab === 'info' && (
          <div className="space-y-3.5">
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
              <textarea
                rows={4}
                value={resume.summary}
                onChange={e => onChange({ ...resume, summary: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
                placeholder="总结您的多年经验、擅长的核心技术架构、攻坚成果与软技能..."
              />
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
      </div>
    </div>
  );
};
