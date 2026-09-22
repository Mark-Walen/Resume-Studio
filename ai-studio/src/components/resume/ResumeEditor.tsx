import React, { useState } from 'react';
import { ResumeData, WorkExperience, ProjectExperience, SkillCategory, CustomResumeSection } from '../../types/resume';
import { Briefcase, ChevronDown, ChevronUp, FileBadge, FolderGit2, GraduationCap, GripVertical, LayoutList, Plus, Sparkles, Trash2, Upload, User, Wrench, X } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';

interface ResumeEditorProps {
  resume: ResumeData;
  onChange: (updated: ResumeData) => void;
  onOpenAiGenerator: () => void;
}

type ModalKey = 'info' | 'skills' | 'workExperience' | 'projects' | 'education' | 'certificates' | `custom:${string}`;
const builtInOrder = ['jobIntent', 'summary', 'skills', 'workExperience', 'projects', 'education', 'certificates'];
const inputClass = 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100';

const Field = ({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) => (
  <label className="block"><span className="mb-1.5 block text-[11px] font-medium text-slate-500">{label}{required && <span className="ml-1 text-slate-400">（必填）</span>}</span>{children}</label>
);

const ModalShell = ({ title, onClose, onSave, children, danger }: { title: string; onClose: () => void; onSave: () => void; children: React.ReactNode; danger?: React.ReactNode }) => (
  <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-[2px]" onMouseDown={event => event.target === event.currentTarget && onClose()}>
    <div role="dialog" aria-modal="true" aria-label={title} className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4"><h2 className="text-lg font-bold text-slate-950">{title}</h2><button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="关闭"><X className="h-5 w-5" /></button></div>
      <div className="overflow-y-auto px-6 py-5">{children}</div>
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-6 py-4"><div>{danger}</div><div className="flex gap-2"><button type="button" onClick={onClose} className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">取消</button><button type="button" onClick={onSave} className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700">完成</button></div></div>
    </div>
  </div>
);

export const ResumeEditor: React.FC<ResumeEditorProps> = ({ resume, onChange, onOpenAiGenerator }) => {
  const [modalKey, setModalKey] = useState<ModalKey | null>(null);
  const [draft, setDraft] = useState<ResumeData | null>(null);
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const customSections = resume.customSections || [];
  const requestedOrder = [...(resume.sectionOrder || builtInOrder)];
  if (!requestedOrder.includes('jobIntent')) requestedOrder.splice(Math.max(0, requestedOrder.indexOf('summary')), 0, 'jobIntent');
  const sectionOrder = [...requestedOrder, ...builtInOrder.filter(key => !requestedOrder.includes(key)), ...customSections.map(section => `custom:${section.id}`).filter(key => !requestedOrder.includes(key))];

  const labels: Record<string, { title: string; description: string; icon: React.ElementType }> = {
    jobIntent: { title: '求职意向', description: '目标岗位、意向城市、薪资与到岗时间', icon: Briefcase },
    summary: { title: '基本信息与个人总结', description: '个人资料、头像与职业总结', icon: User },
    skills: { title: '专业技能', description: `${resume.skills.length} 个技能分类`, icon: Wrench },
    workExperience: { title: '工作经历', description: `${resume.workExperience.length} 段工作经历`, icon: Briefcase },
    projects: { title: '项目经历', description: `${resume.projects.length} 个项目`, icon: FolderGit2 },
    education: { title: '教育背景', description: `${resume.education.length} 段教育经历`, icon: GraduationCap },
    certificates: { title: '证书与荣誉', description: `${resume.certificates.length} 项证书或荣誉`, icon: FileBadge },
  };

  const openModal = (key: string) => {
    setDraft(JSON.parse(JSON.stringify(resume)));
    setModalKey(key === 'summary' || key === 'jobIntent' ? 'info' : key as ModalKey);
  };
  const closeModal = () => { setModalKey(null); setDraft(null); };
  const saveModal = () => {
    if (!draft) return;
    const personalInfo = { ...draft.personalInfo };
    if (personalInfo.salaryMin || personalInfo.salaryMax) personalInfo.expectedSalary = [personalInfo.salaryMin, personalInfo.salaryMax].filter(Boolean).join('–');
    onChange({ ...draft, personalInfo, lastModified: new Date().toISOString().split('T')[0] });
    closeModal();
  };
  const updateDraft = (patch: Partial<ResumeData>) => draft && setDraft({ ...draft, ...patch });
  const updatePersonal = (field: string, value: string) => draft && setDraft({ ...draft, personalInfo: { ...draft.personalInfo, [field]: value } });

  const handleAvatar = (file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) { window.alert('头像仅支持 JPG、PNG 或 WebP，文件大小不超过 2 MB。'); return; }
    const reader = new FileReader(); reader.onload = () => updatePersonal('avatarUrl', String(reader.result || '')); reader.readAsDataURL(file);
  };

  const moveSection = (key: string, direction: -1 | 1) => {
    const index = sectionOrder.indexOf(key); const target = index + direction;
    if (index < 0 || target < 0 || target >= sectionOrder.length) return;
    const next = [...sectionOrder]; [next[index], next[target]] = [next[target], next[index]];
    onChange({ ...resume, sectionOrder: next });
  };
  const dropSection = (target: string) => {
    if (!draggedSection || draggedSection === target) return;
    const next = [...sectionOrder]; const from = next.indexOf(draggedSection); const to = next.indexOf(target);
    if (from < 0 || to < 0) return; next.splice(from, 1); next.splice(to, 0, draggedSection);
    onChange({ ...resume, sectionOrder: next }); setDraggedSection(null);
  };
  const addCustom = () => {
    const section: CustomResumeSection = { id: `custom-${Date.now()}`, title: '自定义模块', content: '<p>填写开源贡献、个人作品、语言能力或其他补充信息。</p>' };
    const next = { ...resume, customSections: [...customSections, section], sectionOrder: [...sectionOrder, `custom:${section.id}`] };
    setDraft(JSON.parse(JSON.stringify(next))); setModalKey(`custom:${section.id}`);
  };

  const renderInfo = () => draft && (
    <div className="space-y-7">
      <section><h3 className="mb-4 text-sm font-bold text-slate-950">个人信息</h3><div className="grid gap-5 md:grid-cols-[1fr_112px]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="姓名" required><input className={inputClass} value={draft.personalInfo.fullName} onChange={e => updatePersonal('fullName', e.target.value)} /></Field>
          <Field label="性别"><select className={inputClass} value={draft.personalInfo.gender || ''} onChange={e => updatePersonal('gender', e.target.value)}><option value="">请选择</option><option>男</option><option>女</option><option>不展示</option></select></Field>
          <Field label="出生年月"><input type="month" className={inputClass} value={draft.personalInfo.birthDate || ''} onChange={e => updatePersonal('birthDate', e.target.value)} /></Field>
          <Field label="参加工作时间"><input type="month" className={inputClass} value={draft.personalInfo.workStartDate || ''} onChange={e => updatePersonal('workStartDate', e.target.value)} /></Field>
          <Field label="手机号" required><input className={inputClass} value={draft.personalInfo.phone} onChange={e => updatePersonal('phone', e.target.value)} /></Field>
          <Field label="邮箱" required><input type="email" className={inputClass} value={draft.personalInfo.email} onChange={e => updatePersonal('email', e.target.value)} /></Field>
          <Field label="籍贯 / 民族"><input className={inputClass} value={draft.personalInfo.ethnicity || ''} onChange={e => updatePersonal('ethnicity', e.target.value)} placeholder="按需填写" /></Field>
          <Field label="政治面貌"><select className={inputClass} value={draft.personalInfo.politicalStatus || ''} onChange={e => updatePersonal('politicalStatus', e.target.value)}><option value="">不展示</option><option>群众</option><option>共青团员</option><option>中共党员</option></select></Field>
          <Field label="所在地"><input className={inputClass} value={draft.personalInfo.location} onChange={e => updatePersonal('location', e.target.value)} /></Field>
          <Field label="最高学历"><select className={inputClass} value={draft.personalInfo.highestEducation || ''} onChange={e => updatePersonal('highestEducation', e.target.value)}><option value="">请选择</option><option>大专</option><option>本科</option><option>硕士</option><option>博士</option></select></Field>
        </div>
        <div><div className="mb-1.5 text-[11px] font-medium text-slate-500">照片</div><div className="aspect-[5/7] w-[96px] overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-inner">{draft.personalInfo.avatarUrl ? <img src={draft.personalInfo.avatarUrl} alt="证件照预览" className="h-full w-full object-cover object-center" /> : <div className="flex h-full items-center justify-center text-slate-300"><User className="h-9 w-9" /></div>}</div><label className="mt-2 inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-blue-600"><Upload className="h-3.5 w-3.5" />上传照片<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => handleAvatar(e.target.files?.[0])} /></label><div className="mt-1 text-[10px] leading-4 text-slate-400">自动按 5:7 证件照比例居中裁切</div></div>
      </div></section>
      <section className="border-t border-slate-100 pt-6"><h3 className="mb-4 text-sm font-bold text-slate-950">求职意向</h3><div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="求职岗位" required><input className={inputClass} value={draft.personalInfo.jobTitle} onChange={e => updatePersonal('jobTitle', e.target.value)} /></Field>
        <Field label="意向城市"><input className={inputClass} value={draft.personalInfo.targetCities || ''} onChange={e => updatePersonal('targetCities', e.target.value)} placeholder="深圳 / 上海" /></Field>
        <Field label="最低期望薪资"><input className={inputClass} value={draft.personalInfo.salaryMin || ''} onChange={e => updatePersonal('salaryMin', e.target.value)} placeholder="18K" /></Field>
        <Field label="最高期望薪资"><input className={inputClass} value={draft.personalInfo.salaryMax || ''} onChange={e => updatePersonal('salaryMax', e.target.value)} placeholder="20K" /></Field>
        <div className="sm:col-span-2"><Field label="到岗时间"><select className={inputClass} value={draft.personalInfo.availability || ''} onChange={e => updatePersonal('availability', e.target.value)}><option value="">请选择</option><option>随时到岗</option><option>一周内</option><option>两周内</option><option>一个月内</option><option>需协商</option></select></Field></div>
      </div></section>
      <section className="border-t border-slate-100 pt-6"><h3 className="mb-1 text-sm font-bold text-slate-950">个人总结</h3><p className="mb-3 text-[11px] text-slate-500">突出与目标岗位最相关的技术能力、项目结果和职业优势。</p><RichTextEditor value={draft.summary} onChange={summary => updateDraft({ summary })} minHeight="160px" /></section>
    </div>
  );

  const renderSkills = () => draft && <div className="space-y-3">{draft.skills.map(group => <div key={group.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="flex gap-2"><input className={`${inputClass} font-semibold`} value={group.category} onChange={e => updateDraft({ skills: draft.skills.map(item => item.id === group.id ? { ...item, category: e.target.value } : item) })} /><button onClick={() => updateDraft({ skills: draft.skills.filter(item => item.id !== group.id) })} className="p-2 text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div><textarea rows={2} className={`${inputClass} mt-2`} value={group.skills.join('、')} onChange={e => updateDraft({ skills: draft.skills.map(item => item.id === group.id ? { ...item, skills: e.target.value.split(/[、,，]/).map(value => value.trim()).filter(Boolean) } : item) })} /></div>)}<button onClick={() => updateDraft({ skills: [...draft.skills, { id: `skill-${Date.now()}`, category: '新技能分类', skills: ['技能一', '技能二'] } as SkillCategory] })} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600"><Plus className="h-4 w-4" />添加技能分类</button></div>;

  const renderExperience = () => draft && <div className="space-y-4">{draft.workExperience.map(item => <div key={item.id} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex justify-between"><strong className="text-xs text-slate-800">工作经历</strong><button onClick={() => updateDraft({ workExperience: draft.workExperience.filter(value => value.id !== item.id) })} className="text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div><div className="grid gap-3 sm:grid-cols-2"><input className={inputClass} value={item.company} onChange={e => updateDraft({ workExperience: draft.workExperience.map(value => value.id === item.id ? { ...value, company: e.target.value } : value) })} placeholder="公司名称" /><input className={inputClass} value={item.position} onChange={e => updateDraft({ workExperience: draft.workExperience.map(value => value.id === item.id ? { ...value, position: e.target.value } : value) })} placeholder="职位" /><input className={inputClass} value={item.startDate} onChange={e => updateDraft({ workExperience: draft.workExperience.map(value => value.id === item.id ? { ...value, startDate: e.target.value } : value) })} placeholder="开始时间" /><input className={inputClass} value={item.endDate} onChange={e => updateDraft({ workExperience: draft.workExperience.map(value => value.id === item.id ? { ...value, endDate: e.target.value } : value) })} placeholder="结束时间" /></div><textarea rows={4} className={inputClass} value={item.highlights.join('\n')} onChange={e => updateDraft({ workExperience: draft.workExperience.map(value => value.id === item.id ? { ...value, highlights: e.target.value.split('\n').filter(Boolean) } : value) })} placeholder="每行一条成果" /></div>)}<button onClick={() => { const item: WorkExperience = { id: `exp-${Date.now()}`, company: '新公司', position: '嵌入式软件工程师', startDate: '', endDate: '', current: false, highlights: ['填写职责与量化成果。'] }; updateDraft({ workExperience: [item, ...draft.workExperience] }); }} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600"><Plus className="h-4 w-4" />添加工作经历</button></div>;

  const renderProjects = () => draft && <div className="space-y-4">{draft.projects.map(item => <div key={item.id} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex justify-between"><strong className="text-xs text-slate-800">项目经历</strong><button onClick={() => updateDraft({ projects: draft.projects.filter(value => value.id !== item.id) })} className="text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div><div className="grid gap-3 sm:grid-cols-2"><input className={inputClass} value={item.name} onChange={e => updateDraft({ projects: draft.projects.map(value => value.id === item.id ? { ...value, name: e.target.value } : value) })} placeholder="项目名称" /><input className={inputClass} value={item.role} onChange={e => updateDraft({ projects: draft.projects.map(value => value.id === item.id ? { ...value, role: e.target.value } : value) })} placeholder="角色" /></div><input className={inputClass} value={item.description} onChange={e => updateDraft({ projects: draft.projects.map(value => value.id === item.id ? { ...value, description: e.target.value } : value) })} placeholder="项目简介" /><textarea rows={3} className={inputClass} value={item.highlights.join('\n')} onChange={e => updateDraft({ projects: draft.projects.map(value => value.id === item.id ? { ...value, highlights: e.target.value.split('\n').filter(Boolean) } : value) })} placeholder="每行一条亮点" /></div>)}<button onClick={() => { const item: ProjectExperience = { id: `project-${Date.now()}`, name: '新项目', role: '核心开发', startDate: '', endDate: '', description: '', highlights: ['填写项目成果。'], techStack: ['C', 'FreeRTOS'] }; updateDraft({ projects: [item, ...draft.projects] }); }} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600"><Plus className="h-4 w-4" />添加项目</button></div>;

  const renderEducation = () => draft && <div className="space-y-4">{draft.education.map(item => <div key={item.id} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2"><input className={inputClass} value={item.school} onChange={e => updateDraft({ education: draft.education.map(value => value.id === item.id ? { ...value, school: e.target.value } : value) })} placeholder="学校" /><input className={inputClass} value={item.major} onChange={e => updateDraft({ education: draft.education.map(value => value.id === item.id ? { ...value, major: e.target.value } : value) })} placeholder="专业" /><input className={inputClass} value={item.degree} onChange={e => updateDraft({ education: draft.education.map(value => value.id === item.id ? { ...value, degree: e.target.value } : value) })} placeholder="学历" /><input className={inputClass} value={item.gpa || ''} onChange={e => updateDraft({ education: draft.education.map(value => value.id === item.id ? { ...value, gpa: e.target.value } : value) })} placeholder="成绩 / 排名" /></div>)}</div>;
  const renderCertificates = () => draft && <div className="space-y-3">{draft.certificates.map(item => <div key={item.id} className="flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3"><input className={inputClass} value={item.name} onChange={e => updateDraft({ certificates: draft.certificates.map(value => value.id === item.id ? { ...value, name: e.target.value } : value) })} /><input className={inputClass} value={item.issuer} onChange={e => updateDraft({ certificates: draft.certificates.map(value => value.id === item.id ? { ...value, issuer: e.target.value } : value) })} /><button onClick={() => updateDraft({ certificates: draft.certificates.filter(value => value.id !== item.id) })} className="text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div>)}<button onClick={() => updateDraft({ certificates: [...draft.certificates, { id: `cert-${Date.now()}`, name: '新证书', issuer: '颁发机构', date: '' }] })} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600"><Plus className="h-4 w-4" />添加证书</button></div>;

  const renderCustom = () => {
    if (!draft || !modalKey?.startsWith('custom:')) return null;
    const id = modalKey.slice(7); const section = (draft.customSections || []).find(item => item.id === id); if (!section) return null;
    return <div className="space-y-4"><Field label="模块名称"><input className={inputClass} value={section.title} onChange={e => updateDraft({ customSections: (draft.customSections || []).map(item => item.id === id ? { ...item, title: e.target.value } : item) })} /></Field><Field label="模块内容"><RichTextEditor value={section.content} onChange={content => updateDraft({ customSections: (draft.customSections || []).map(item => item.id === id ? { ...item, content } : item) })} minHeight="240px" /></Field></div>;
  };

  const modalTitle = modalKey === 'info' ? '基本信息与总结' : modalKey === 'skills' ? '专业技能' : modalKey === 'workExperience' ? '工作经历' : modalKey === 'projects' ? '项目经历' : modalKey === 'education' ? '教育背景' : modalKey === 'certificates' ? '证书与荣誉' : '自定义模块';
  const modalBody = modalKey === 'info' ? renderInfo() : modalKey === 'skills' ? renderSkills() : modalKey === 'workExperience' ? renderExperience() : modalKey === 'projects' ? renderProjects() : modalKey === 'education' ? renderEducation() : modalKey === 'certificates' ? renderCertificates() : renderCustom();

  return <>
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4"><div><h2 className="text-sm font-bold text-slate-900">模块与排版</h2><p className="text-xs text-slate-500">拖动调整顺序，单击模块打开编辑弹窗</p></div><button id="btn-open-ai-generator" onClick={onOpenAiGenerator} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"><Sparkles className="h-3.5 w-3.5" />AI 生成</button></div>
      <div className="max-h-[720px] flex-1 space-y-2 overflow-y-auto p-4">
        {sectionOrder.map((key, index) => { const custom = key.startsWith('custom:') ? customSections.find(section => `custom:${section.id}` === key) : undefined; const meta = custom ? { title: custom.title || '自定义模块', description: '自定义富文本内容', icon: LayoutList } : labels[key]; if (!meta) return null; const Icon = meta.icon; return <div key={key} role="button" tabIndex={0} aria-label={`编辑${meta.title}`} draggable onDragStart={() => setDraggedSection(key)} onDragEnd={() => setDraggedSection(null)} onDragOver={e => e.preventDefault()} onDrop={() => dropSection(key)} onClick={() => openModal(key)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(key); } }} className={`group flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition focus:outline-none focus:ring-2 focus:ring-blue-200 ${draggedSection === key ? 'border-blue-400 bg-blue-50 opacity-60' : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'}`}><GripVertical className="h-4 w-4 cursor-grab text-slate-300 group-hover:text-slate-500" onClick={e => e.stopPropagation()} /><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><Icon className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="truncate text-xs font-bold text-slate-800">{meta.title}</div><div className="truncate text-[11px] text-slate-500">{meta.description}</div></div><div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}><button onClick={() => moveSection(key, -1)} disabled={index === 0} className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-20"><ChevronUp className="h-3.5 w-3.5" /></button><button onClick={() => moveSection(key, 1)} disabled={index === sectionOrder.length - 1} className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-20"><ChevronDown className="h-3.5 w-3.5" /></button></div></div>; })}
        <button type="button" onClick={addCustom} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs font-semibold text-slate-500 hover:border-blue-400 hover:text-blue-600"><Plus className="h-4 w-4" />添加自定义模块</button>
      </div>
    </div>
    {modalKey && draft && <ModalShell title={modalTitle} onClose={closeModal} onSave={saveModal} danger={modalKey.startsWith('custom:') ? <button type="button" onClick={() => { const id = modalKey.slice(7); onChange({ ...resume, customSections: customSections.filter(item => item.id !== id), sectionOrder: sectionOrder.filter(key => key !== modalKey) }); closeModal(); }} className="inline-flex items-center gap-1 text-xs text-red-600"><Trash2 className="h-3.5 w-3.5" />删除模块</button> : undefined}>{modalBody}</ModalShell>}
  </>;
};
