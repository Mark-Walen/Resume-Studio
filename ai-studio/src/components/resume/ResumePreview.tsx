import React from 'react';
import { ResumeData, ResumeTemplateId } from '../../types/resume';
import { Mail, Phone, MapPin, Github, WalletCards } from 'lucide-react';
import { sanitizeRichText, toRichHtml } from '../../utils/richText';

interface ResumePreviewProps { resume: ResumeData; templateId: ResumeTemplateId; }

const builtInSections = ['summary', 'skills', 'workExperience', 'projects', 'education', 'certificates'];
const templateStyles: Record<ResumeTemplateId, { accent: string; heading: string; rule: string; surface: string; compact?: boolean; centered?: boolean }> = {
  modern: { accent: 'text-blue-600', heading: 'text-slate-900', rule: 'border-blue-500', surface: 'border-slate-200' },
  classic: { accent: 'text-slate-700', heading: 'text-slate-950 uppercase tracking-wider', rule: 'border-slate-800', surface: 'border-slate-300', centered: true },
  'tech-sidebar': { accent: 'text-cyan-700', heading: 'text-slate-950 uppercase tracking-wider', rule: 'border-cyan-600', surface: 'border-cyan-900' },
  creative: { accent: 'text-amber-700', heading: 'text-amber-900 uppercase tracking-wider', rule: 'border-amber-500', surface: 'border-amber-200' },
  compact: { accent: 'text-slate-600', heading: 'text-slate-900 uppercase tracking-wider', rule: 'border-slate-500', surface: 'border-slate-200', compact: true },
};

export const ResumePreview: React.FC<ResumePreviewProps> = ({ resume, templateId }) => {
  const style = templateStyles[templateId];
  const customSections = resume.customSections || [];
  const customKeys = customSections.map(section => `custom:${section.id}`);
  const requestedOrder = resume.sectionOrder || builtInSections;
  const sectionOrder = [...requestedOrder.filter(key => builtInSections.includes(key) || customKeys.includes(key)), ...builtInSections.filter(key => !requestedOrder.includes(key)), ...customKeys.filter(key => !requestedOrder.includes(key))];
  const bodySize = style.compact ? 'text-[10.5px]' : 'text-xs';
  const blockSpace = style.compact ? 'mb-3' : 'mb-6';

  const Heading = ({ children }: { children: React.ReactNode }) => <h2 className={`${style.heading} ${style.rule} ${style.compact ? 'text-[11px] mb-1.5 pb-0.5' : 'text-xs mb-3 pb-1'} font-bold border-b`}>{children}</h2>;
  const RichContent = ({ value }: { value: string }) => <div className={`resume-rich-text text-slate-700 leading-relaxed ${bodySize}`} dangerouslySetInnerHTML={{ __html: sanitizeRichText(toRichHtml(value)) }} />;

  const renderSection = (key: string) => {
    if (key === 'summary') return <section key={key} className={blockSpace}><Heading>个人总结</Heading><RichContent value={resume.summary} /></section>;
    if (key === 'skills') return (
      <section key={key} className={blockSpace}><Heading>专业技能</Heading><div className={`${bodySize} space-y-1.5`}>
        {resume.skills.map(group => <div key={group.id} className="flex items-baseline gap-2"><span className="font-bold text-slate-900 min-w-28">{group.category}</span><span className="text-slate-600">{group.skills.join(' · ')}</span></div>)}
      </div></section>
    );
    if (key === 'workExperience') return (
      <section key={key} className={blockSpace}><Heading>工作经历</Heading><div className={style.compact ? 'space-y-2.5' : 'space-y-5'}>
        {resume.workExperience.map(experience => <article key={experience.id} className={bodySize}>
          <div className="flex justify-between items-baseline gap-4 mb-1"><div className="font-bold text-slate-900">{experience.company} <span className={`font-semibold ${style.accent}`}>· {experience.position}</span></div><span className="text-slate-500 font-mono whitespace-nowrap text-[10px]">{experience.startDate} ~ {experience.endDate}</span></div>
          {(experience.department || experience.location) && <div className="text-[10px] text-slate-500 mb-1">{[experience.department, experience.location].filter(Boolean).join(' · ')}</div>}
          <ul className="list-disc ml-4 space-y-1 text-slate-700 leading-relaxed">{experience.highlights.map((highlight, index) => <li key={index}>{highlight}</li>)}</ul>
          {!!experience.technologies?.length && <div className="mt-1.5 text-[10px] text-slate-500"><strong className="text-slate-700">核心技术：</strong>{experience.technologies.join(' · ')}</div>}
        </article>)}
      </div></section>
    );
    if (key === 'projects') return (
      <section key={key} className={blockSpace}><Heading>项目经历</Heading><div className={style.compact ? 'space-y-2.5' : 'space-y-4'}>
        {resume.projects.map(project => <article key={project.id} className={bodySize}>
          <div className="flex justify-between items-baseline gap-4 mb-1"><div className="font-bold text-slate-900">{project.name} <span className="font-normal text-slate-500">({project.role})</span></div><span className="text-slate-500 font-mono whitespace-nowrap text-[10px]">{project.startDate} ~ {project.endDate}</span></div>
          <p className="text-slate-600 mb-1 leading-relaxed">{project.description}</p><ul className="list-disc ml-4 space-y-1 text-slate-700 leading-relaxed">{project.highlights.map((highlight, index) => <li key={index}>{highlight}</li>)}</ul>
          <div className={`mt-1.5 text-[10px] ${style.accent}`}><strong>技术栈：</strong>{project.techStack.join(' · ')}</div>
        </article>)}
      </div></section>
    );
    if (key === 'education') return (
      <section key={key} className={blockSpace}><Heading>教育背景</Heading><div className="space-y-2">
        {resume.education.map(item => <div key={item.id} className={`${bodySize} flex justify-between items-baseline gap-4`}><div><strong className="text-slate-900">{item.school}</strong> · {item.degree} · {item.major}{item.gpa && <span className="text-slate-500"> · {item.gpa}</span>}</div><span className="text-slate-500 font-mono whitespace-nowrap text-[10px]">{item.startDate} ~ {item.endDate}</span></div>)}
      </div></section>
    );
    if (key === 'certificates') return resume.certificates.length ? (
      <section key={key} className={blockSpace}><Heading>证书与荣誉</Heading><ul className={`${bodySize} grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-slate-700`}>
        {resume.certificates.map(item => <li key={item.id}>• <strong>{item.name}</strong>{item.issuer ? ` · ${item.issuer}` : ''}{item.date ? ` · ${item.date}` : ''}</li>)}
      </ul></section>
    ) : null;
    if (key.startsWith('custom:')) {
      const custom = customSections.find(section => `custom:${section.id}` === key);
      return custom ? <section key={key} className={blockSpace}><Heading>{custom.title || '自定义模块'}</Heading><RichContent value={custom.content} /></section> : null;
    }
    return null;
  };

  const headerTheme = templateId === 'tech-sidebar' ? 'bg-slate-950 text-white border-slate-900 -mx-8 -mt-8 px-8 pt-8 pb-6 mb-6' : templateId === 'creative' ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 mb-6' : `border-b-2 ${style.rule} pb-5 mb-6`;
  return (
    <div id="resume-document" className={`resume-print-container bg-white text-slate-900 ${style.compact ? 'p-6 sm:p-8' : 'p-8 sm:p-12'} shadow-sm rounded-lg border ${style.surface} min-h-[1050px]`}>
      <header className={`${headerTheme} ${style.centered ? 'text-center' : ''}`}>
        <div className={`flex ${style.centered ? 'flex-col items-center' : 'flex-col sm:flex-row justify-between items-start'} gap-4`}>
          <div className={`flex items-center gap-4 ${style.centered ? 'flex-col' : ''}`}>
            {resume.personalInfo.avatarUrl && <img src={resume.personalInfo.avatarUrl} alt="个人头像" className={`${style.compact ? 'w-16 h-16' : 'w-24 h-24'} rounded-2xl object-cover border-2 border-white shadow-sm`} />}
            <div><h1 className={`${style.compact ? 'text-2xl' : 'text-3xl'} font-bold tracking-tight`}>{resume.personalInfo.fullName}</h1><p className={`${templateId === 'tech-sidebar' ? 'text-cyan-300' : style.accent} text-sm font-semibold mt-1`}>{resume.personalInfo.jobTitle}</p></div>
          </div>
          <div className={`${style.compact ? 'text-[10px]' : 'text-xs'} space-y-1 ${style.centered ? 'flex flex-wrap justify-center gap-x-4' : 'sm:text-right'}`}>
            <div className="flex items-center gap-1.5 sm:justify-end"><Mail className="w-3.5 h-3.5" />{resume.personalInfo.email}</div><div className="flex items-center gap-1.5 sm:justify-end"><Phone className="w-3.5 h-3.5" />{resume.personalInfo.phone}</div><div className="flex items-center gap-1.5 sm:justify-end"><MapPin className="w-3.5 h-3.5" />{resume.personalInfo.location}</div>
            {(resume.personalInfo.salaryMin || resume.personalInfo.expectedSalary) && <div className="flex items-center gap-1.5 sm:justify-end"><WalletCards className="w-3.5 h-3.5" />期望薪资 {resume.personalInfo.salaryMin && resume.personalInfo.salaryMax ? `${resume.personalInfo.salaryMin}–${resume.personalInfo.salaryMax}` : resume.personalInfo.expectedSalary}</div>}{resume.personalInfo.github && <div className="flex items-center gap-1.5 sm:justify-end"><Github className="w-3.5 h-3.5" />{resume.personalInfo.github.replace('https://', '')}</div>}
          </div>
        </div>
      </header>
      <main>{sectionOrder.map(renderSection)}</main>
    </div>
  );
};
