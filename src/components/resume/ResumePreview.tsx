import React from 'react';
import { ResumeData, ResumeTemplateId } from '../../types/resume';
import { Mail, Phone, MapPin, Globe, Github, Linkedin, ExternalLink } from 'lucide-react';

interface ResumePreviewProps {
  resume: ResumeData;
  templateId: ResumeTemplateId;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ resume, templateId }) => {
  const { personalInfo, summary, skills, workExperience, projects, education, certificates } = resume;

  // 1. Classic Executive Template
  if (templateId === 'classic') {
    return (
      <div id="resume-document" className="resume-print-container bg-white text-slate-900 p-8 sm:p-12 shadow-sm rounded-lg border border-slate-200 min-h-[1050px] font-sans">
        {/* Header */}
        <div className="text-center border-b-2 border-slate-800 pb-6 mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">{personalInfo.fullName}</h1>
          <p className="text-base font-semibold text-slate-700 tracking-wide mb-3">{personalInfo.jobTitle}</p>
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-xs text-slate-600">
            <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-500" />{personalInfo.email}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-500" />{personalInfo.phone}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-500" />{personalInfo.location}</span>
            {personalInfo.github && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1"><Github className="w-3.5 h-3.5 text-slate-500" />{personalInfo.github.replace('https://', '')}</span>
              </>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6">
          <h2 className="text-sm font-bold tracking-wider text-slate-900 uppercase border-b border-slate-300 pb-1 mb-2">个人总结 / SUMMARY</h2>
          <p className="text-xs leading-relaxed text-slate-700 text-justify">{summary}</p>
        </div>

        {/* Skills */}
        <div className="mb-6">
          <h2 className="text-sm font-bold tracking-wider text-slate-900 uppercase border-b border-slate-300 pb-1 mb-2">专业技能 / CORE SKILLS</h2>
          <div className="space-y-1.5 text-xs text-slate-700">
            {skills.map(s => (
              <div key={s.id} className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                <span className="font-bold text-slate-800 w-32 flex-shrink-0">{s.category}:</span>
                <span className="text-slate-600">{s.skills.join(' · ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div className="mb-6">
          <h2 className="text-sm font-bold tracking-wider text-slate-900 uppercase border-b border-slate-300 pb-1 mb-3">工作经历 / EXPERIENCE</h2>
          <div className="space-y-5">
            {workExperience.map(exp => (
              <div key={exp.id} className="text-xs">
                <div className="flex justify-between items-baseline font-bold text-slate-900 mb-0.5">
                  <span className="text-sm">{exp.company} <span className="font-normal text-slate-600">| {exp.position}</span></span>
                  <span className="text-slate-500 font-medium text-xs">{exp.startDate} ~ {exp.endDate}</span>
                </div>
                {exp.department && <p className="text-slate-500 mb-1.5">{exp.department} {exp.location ? `· ${exp.location}` : ''}</p>}
                <ul className="list-disc list-outside ml-4 space-y-1 text-slate-700 leading-relaxed">
                  {exp.highlights.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
                {exp.technologies && exp.technologies.length > 0 && (
                  <div className="mt-1.5 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">核心技术: </span>{exp.technologies.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="mb-6">
          <h2 className="text-sm font-bold tracking-wider text-slate-900 uppercase border-b border-slate-300 pb-1 mb-3">重点项目 / KEY PROJECTS</h2>
          <div className="space-y-4">
            {projects.map(proj => (
              <div key={proj.id} className="text-xs">
                <div className="flex justify-between items-baseline font-bold text-slate-900 mb-0.5">
                  <span className="text-sm">{proj.name} <span className="font-normal text-slate-600">({proj.role})</span></span>
                  <span className="text-slate-500 font-medium text-xs">{proj.startDate} ~ {proj.endDate}</span>
                </div>
                <p className="text-slate-600 mb-1 leading-relaxed">{proj.description}</p>
                <ul className="list-disc list-outside ml-4 space-y-1 text-slate-700 leading-relaxed">
                  {proj.highlights.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
                <div className="mt-1 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">技术栈: </span>{proj.techStack.join(' · ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="mb-5">
          <h2 className="text-sm font-bold tracking-wider text-slate-900 uppercase border-b border-slate-300 pb-1 mb-2">教育背景 / EDUCATION</h2>
          {education.map(edu => (
            <div key={edu.id} className="flex justify-between items-baseline text-xs mb-1">
              <div>
                <span className="font-bold text-slate-900">{edu.school}</span> · <span>{edu.degree} - {edu.major}</span>
                {edu.gpa && <span className="text-slate-500 ml-2">(GPA: {edu.gpa})</span>}
              </div>
              <span className="text-slate-500">{edu.startDate} ~ {edu.endDate}</span>
            </div>
          ))}
        </div>

        {/* Certs */}
        {certificates.length > 0 && (
          <div>
            <h2 className="text-sm font-bold tracking-wider text-slate-900 uppercase border-b border-slate-300 pb-1 mb-2">专业认证 / CERTIFICATIONS</h2>
            <div className="flex flex-wrap gap-x-4 text-xs text-slate-700">
              {certificates.map(c => (
                <span key={c.id}>• {c.name} ({c.issuer}, {c.date})</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. Modern Minimalist Template (Default)
  if (templateId === 'modern') {
    return (
      <div id="resume-document" className="resume-print-container bg-white text-slate-900 p-8 sm:p-12 shadow-sm rounded-lg border border-slate-200 min-h-[1050px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{personalInfo.fullName}</h1>
            <p className="text-base font-semibold text-blue-600 mt-1">{personalInfo.jobTitle}</p>
          </div>
          <div className="text-xs text-slate-600 space-y-1 sm:text-right">
            <div className="flex items-center sm:justify-end gap-1.5"><Mail className="w-3.5 h-3.5 text-blue-500" />{personalInfo.email}</div>
            <div className="flex items-center sm:justify-end gap-1.5"><Phone className="w-3.5 h-3.5 text-blue-500" />{personalInfo.phone}</div>
            <div className="flex items-center sm:justify-end gap-1.5"><MapPin className="w-3.5 h-3.5 text-blue-500" />{personalInfo.location}</div>
            {personalInfo.github && (
              <div className="flex items-center sm:justify-end gap-1.5 text-slate-700">
                <Github className="w-3.5 h-3.5 text-slate-700" />
                <a href={personalInfo.github} target="_blank" rel="noreferrer" className="hover:underline">{personalInfo.github.replace('https://', '')}</a>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-5 mb-6 bg-slate-50 p-3.5 rounded border-l-3 border-blue-600">
          <p className="text-xs leading-relaxed text-slate-700">{summary}</p>
        </div>

        {/* Skills */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">核心技能栈</h2>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {skills.map(s => (
              <div key={s.id} className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <h3 className="text-xs font-bold text-blue-700 mb-1.5">{s.category}</h3>
                <div className="flex flex-wrap gap-1">
                  {s.skills.map((item, idx) => (
                    <span key={idx} className="inline-block bg-white text-slate-700 border border-slate-200 text-[10px] px-1.5 py-0.5 rounded font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Work Experience */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">工作经历</h2>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>
          <div className="space-y-5">
            {workExperience.map(exp => (
              <div key={exp.id} className="relative pl-3 border-l-2 border-blue-200">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-sm text-slate-900">{exp.company}</span>
                    <span className="text-xs font-semibold text-blue-600">· {exp.position}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{exp.startDate} ~ {exp.endDate}</span>
                </div>
                {exp.department && <div className="text-[11px] text-slate-500 mb-1.5">{exp.department} | {exp.location}</div>}
                <ul className="space-y-1 text-xs text-slate-700">
                  {exp.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-blue-500 font-bold leading-none mt-1">›</span>
                      <span className="leading-relaxed">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Key Projects */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">重点项目成果</h2>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>
          <div className="space-y-4">
            {projects.map(proj => (
              <div key={proj.id} className="bg-white p-3 rounded border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-sm text-slate-900">{proj.name}</span>
                    <span className="text-xs text-slate-500 font-medium">({proj.role})</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{proj.startDate} ~ {proj.endDate}</span>
                </div>
                <p className="text-xs text-slate-600 mb-2">{proj.description}</p>
                <ul className="space-y-1 text-xs text-slate-700 mb-2">
                  {proj.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-blue-500 font-bold leading-none mt-1">▪</span>
                      <span className="leading-relaxed">{h}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-500 font-medium">技术栈:</span>
                  {proj.techStack.map((t, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education & Certs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">教育背景</h2>
            {education.map(edu => (
              <div key={edu.id} className="text-xs text-slate-700">
                <div className="font-bold text-slate-900">{edu.school}</div>
                <div className="text-slate-600">{edu.degree} · {edu.major} ({edu.startDate} ~ {edu.endDate})</div>
                {edu.gpa && <div className="text-slate-500 text-[11px]">成绩: {edu.gpa}</div>}
              </div>
            ))}
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">资质与证书</h2>
            <div className="space-y-1 text-xs text-slate-700">
              {certificates.map(c => (
                <div key={c.id} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  <span className="font-medium text-slate-900">{c.name}</span>
                  <span className="text-slate-500 text-[11px]">({c.date})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Tech Sidebar (Two-Column Geek)
  if (templateId === 'tech-sidebar') {
    return (
      <div id="resume-document" className="resume-print-container bg-white text-slate-900 shadow-sm rounded-lg border border-slate-200 min-h-[1050px] flex flex-col md:flex-row overflow-hidden">
        {/* Left Column Sidebar */}
        <div className="w-full md:w-72 bg-slate-900 text-slate-200 p-6 md:p-8 flex-shrink-0 flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{personalInfo.fullName}</h1>
            <p className="text-xs font-medium text-blue-400 mt-1">{personalInfo.jobTitle}</p>
          </div>

          {/* Contact */}
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-blue-400" /><span className="truncate">{personalInfo.email}</span></div>
            <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-blue-400" /><span>{personalInfo.phone}</span></div>
            <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-blue-400" /><span>{personalInfo.location}</span></div>
            {personalInfo.github && (
              <div className="flex items-center gap-2"><Github className="w-3.5 h-3.5 text-blue-400" /><span className="truncate">{personalInfo.github.replace('https://', '')}</span></div>
            )}
          </div>

          {/* Skills Sidebar */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-slate-700 pb-1 mb-3">技能专长</h3>
            <div className="space-y-3 text-xs">
              {skills.map(s => (
                <div key={s.id}>
                  <div className="font-semibold text-slate-100 text-[11px] mb-1">{s.category}</div>
                  <div className="flex flex-wrap gap-1">
                    {s.skills.map((skill, idx) => (
                      <span key={idx} className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px] border border-slate-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education Sidebar */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-slate-700 pb-1 mb-3">教育背景</h3>
            {education.map(edu => (
              <div key={edu.id} className="text-xs space-y-0.5 text-slate-300 mb-2">
                <div className="font-bold text-white">{edu.school}</div>
                <div>{edu.degree} · {edu.major}</div>
                <div className="text-slate-400 text-[10px]">{edu.startDate} ~ {edu.endDate}</div>
              </div>
            ))}
          </div>

          {/* Certs Sidebar */}
          {certificates.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-slate-700 pb-1 mb-3">资质认证</h3>
              <div className="space-y-1.5 text-xs text-slate-300">
                {certificates.map(c => (
                  <div key={c.id} className="text-[11px]">
                    <div className="font-medium text-slate-200">• {c.name}</div>
                    <div className="text-slate-400 text-[10px] pl-2">{c.issuer}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column Main Body */}
        <div className="flex-1 p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-xs font-bold tracking-wider text-blue-600 uppercase mb-2">职业概述</h2>
            <p className="text-xs leading-relaxed text-slate-700">{summary}</p>
          </div>

          <div>
            <h2 className="text-xs font-bold tracking-wider text-blue-600 uppercase border-b border-slate-200 pb-1 mb-3">工作经历</h2>
            <div className="space-y-5">
              {workExperience.map(exp => (
                <div key={exp.id} className="text-xs">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold text-sm text-slate-900">{exp.company} <span className="text-slate-500 font-normal">| {exp.position}</span></span>
                    <span className="text-slate-400 font-mono text-[11px]">{exp.startDate} ~ {exp.endDate}</span>
                  </div>
                  <ul className="space-y-1 text-slate-700 pl-3 border-l border-slate-200">
                    {exp.highlights.map((h, i) => (
                      <li key={i} className="leading-relaxed">{h}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold tracking-wider text-blue-600 uppercase border-b border-slate-200 pb-1 mb-3">主要项目</h2>
            <div className="space-y-4">
              {projects.map(proj => (
                <div key={proj.id} className="text-xs">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-bold text-slate-900">{proj.name}</span>
                    <span className="text-slate-400 font-mono text-[11px]">{proj.startDate} ~ {proj.endDate}</span>
                  </div>
                  <p className="text-slate-600 mb-1">{proj.description}</p>
                  <ul className="space-y-1 text-slate-700 pl-3 border-l border-slate-200 mb-1.5">
                    {proj.highlights.map((h, i) => (
                      <li key={i} className="leading-relaxed">{h}</li>
                    ))}
                  </ul>
                  <div className="text-[11px] text-slate-500">
                    <span className="font-medium text-slate-700">技术栈: </span>{proj.techStack.join(' · ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. Creative Amber / Emerald
  if (templateId === 'creative') {
    return (
      <div id="resume-document" className="resume-print-container bg-white text-slate-900 p-8 sm:p-12 shadow-sm rounded-lg border border-amber-200 min-h-[1050px]">
        {/* Header with Amber accent */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200 mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <span className="inline-block px-2.5 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider mb-2">资深候选人</span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{personalInfo.fullName}</h1>
            <p className="text-sm font-bold text-amber-700 mt-0.5">{personalInfo.jobTitle}</p>
          </div>
          <div className="text-xs text-slate-700 space-y-1 text-left sm:text-right">
            <div>{personalInfo.email}</div>
            <div>{personalInfo.phone}</div>
            <div>{personalInfo.location}</div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1.5">专业优势亮点</h2>
          <p className="text-xs text-slate-700 leading-relaxed bg-amber-50/50 p-3 rounded-lg border border-amber-100">{summary}</p>
        </div>

        {/* Skills */}
        <div className="mb-6">
          <h2 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">技能矩阵</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {skills.map(s => (
              <div key={s.id} className="p-2.5 rounded-lg border border-slate-200 bg-white">
                <div className="text-xs font-bold text-slate-900 mb-1">{s.category}</div>
                <div className="text-[11px] text-slate-600 leading-relaxed">{s.skills.join('、')}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Work Experience */}
        <div className="mb-6">
          <h2 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-3">工作历程</h2>
          <div className="space-y-4">
            {workExperience.map(exp => (
              <div key={exp.id} className="text-xs bg-slate-50/60 p-3.5 rounded-lg border border-slate-100">
                <div className="flex justify-between items-baseline font-bold text-slate-900 mb-1">
                  <span>{exp.company} <span className="text-amber-700 font-semibold">({exp.position})</span></span>
                  <span className="text-slate-400 font-mono text-[11px]">{exp.startDate} ~ {exp.endDate}</span>
                </div>
                <ul className="space-y-1 text-slate-700 pl-3">
                  {exp.highlights.map((h, i) => (
                    <li key={i} className="list-disc list-inside leading-relaxed">{h}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="mb-6">
          <h2 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-3">代表项目</h2>
          <div className="space-y-3">
            {projects.map(proj => (
              <div key={proj.id} className="text-xs p-3.5 rounded-lg border border-slate-200">
                <div className="flex justify-between items-baseline font-bold text-slate-900 mb-1">
                  <span>{proj.name} <span className="text-slate-500 font-normal">[{proj.role}]</span></span>
                  <span className="text-slate-400 font-mono text-[11px]">{proj.startDate} ~ {proj.endDate}</span>
                </div>
                <p className="text-slate-600 mb-1">{proj.description}</p>
                <ul className="space-y-1 text-slate-700 pl-3 mb-2">
                  {proj.highlights.map((h, i) => (
                    <li key={i} className="list-disc list-inside leading-relaxed">{h}</li>
                  ))}
                </ul>
                <div className="text-[11px] text-amber-700 font-medium">
                  核心栈: {proj.techStack.join(' · ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div>
          <h2 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">学历信息</h2>
          {education.map(edu => (
            <div key={edu.id} className="flex justify-between text-xs text-slate-700">
              <span className="font-bold text-slate-900">{edu.school} · {edu.degree} ({edu.major})</span>
              <span className="text-slate-400 font-mono">{edu.startDate} ~ {edu.endDate}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 5. Compact One-Page Template
  return (
    <div id="resume-document" className="resume-print-container bg-white text-slate-900 p-6 sm:p-8 shadow-sm rounded-lg border border-slate-200 min-h-[1050px] text-xs">
      {/* Dense Header */}
      <div className="flex justify-between items-end border-b-2 border-slate-900 pb-3 mb-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">{personalInfo.fullName}</h1>
          <p className="text-xs font-semibold text-slate-600 mt-1">{personalInfo.jobTitle}</p>
        </div>
        <div className="text-[11px] text-slate-600 text-right leading-tight">
          <div>{personalInfo.email} | {personalInfo.phone} | {personalInfo.location}</div>
          {personalInfo.github && <div>GitHub: {personalInfo.github}</div>}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-3">
        <p className="text-[11px] leading-relaxed text-slate-700">{summary}</p>
      </div>

      {/* Skills */}
      <div className="mb-3">
        <div className="font-bold text-[11px] uppercase tracking-wider text-slate-900 bg-slate-100 px-2 py-0.5 mb-1.5">核心技术矩阵</div>
        <div className="space-y-0.5 text-[11px] text-slate-700 pl-1">
          {skills.map(s => (
            <div key={s.id} className="flex gap-1">
              <span className="font-bold text-slate-800 w-28 flex-shrink-0">{s.category}:</span>
              <span>{s.skills.join('、')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="mb-3">
        <div className="font-bold text-[11px] uppercase tracking-wider text-slate-900 bg-slate-100 px-2 py-0.5 mb-2">专业工作经历</div>
        <div className="space-y-3">
          {workExperience.map(exp => (
            <div key={exp.id}>
              <div className="flex justify-between items-baseline font-bold text-[11px] text-slate-900">
                <span>{exp.company} — <span className="font-semibold text-slate-700">{exp.position}</span></span>
                <span className="text-slate-500 font-mono text-[10px]">{exp.startDate} ~ {exp.endDate}</span>
              </div>
              <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-0.5 pl-1 mt-0.5">
                {exp.highlights.map((h, i) => <li key={i} className="leading-snug">{h}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div className="mb-3">
        <div className="font-bold text-[11px] uppercase tracking-wider text-slate-900 bg-slate-100 px-2 py-0.5 mb-2">主导重大项目</div>
        <div className="space-y-2.5">
          {projects.map(proj => (
            <div key={proj.id}>
              <div className="flex justify-between items-baseline font-bold text-[11px] text-slate-900">
                <span>{proj.name} ({proj.role})</span>
                <span className="text-slate-500 font-mono text-[10px]">{proj.startDate} ~ {proj.endDate}</span>
              </div>
              <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-0.5 pl-1 mt-0.5">
                {proj.highlights.map((h, i) => <li key={i} className="leading-snug">{h}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div>
        <div className="font-bold text-[11px] uppercase tracking-wider text-slate-900 bg-slate-100 px-2 py-0.5 mb-1.5">教育背景</div>
        {education.map(edu => (
          <div key={edu.id} className="flex justify-between text-[11px] text-slate-700 pl-1">
            <span className="font-bold">{edu.school} · {edu.degree} · {edu.major}</span>
            <span className="text-slate-500 font-mono text-[10px]">{edu.startDate} ~ {edu.endDate}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
