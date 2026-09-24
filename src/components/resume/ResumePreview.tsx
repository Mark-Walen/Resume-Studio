import React from 'react';
import { ResumeData, ResumeTemplateId } from '../../types/resume';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Github,
  Linkedin,
  Target,
  Award,
  DollarSign,
  Calendar,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Wrench,
  Layers,
  Sparkles,
  ExternalLink,
  Code,
  User
} from 'lucide-react';
import { sanitizeImageUrl } from '../../utils/security';

interface ResumePreviewProps {
  resume: ResumeData;
  templateId: ResumeTemplateId;
  sortByDate?: boolean;
  documentId?: string;
}

function dateRank(value?: string, current = false): number {
  if (current || !value || /(至今|现在|present|current)/i.test(value)) return Number.MAX_SAFE_INTEGER;
  const matched = value.match(/(19|20)\d{2}(?:[-/.](\d{1,2}))?/);
  if (!matched) return 0;
  return Number(matched[0].slice(0, 4)) * 12 + Number(matched[2] || 1);
}

function newestFirst<T extends { startDate?: string; endDate?: string; current?: boolean; date?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const endDifference = dateRank(b.endDate || b.date, b.current) - dateRank(a.endDate || a.date, a.current);
    return endDifference || dateRank(b.startDate) - dateRank(a.startDate);
  });
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  resume,
  templateId,
  sortByDate = true,
  documentId = 'resume-document'
}) => {
  const {
    personalInfo: rawPersonalInfo,
    jobIntent,
    summary,
    skills = [],
    workExperience: rawWorkExperience = [],
    projects: rawProjects = [],
    education: rawEducation = [],
    certificates: rawCertificates = [],
    customSections = []
  } = resume;
  const workExperience = sortByDate ? newestFirst(rawWorkExperience) : rawWorkExperience;
  const projects = sortByDate ? newestFirst(rawProjects) : rawProjects;
  const education = sortByDate ? newestFirst(rawEducation) : rawEducation;
  const certificates = sortByDate ? newestFirst(rawCertificates) : rawCertificates;
  const personalInfo = { ...rawPersonalInfo, avatarUrl: sanitizeImageUrl(rawPersonalInfo.avatarUrl) };

  // Active section ordering & visibility
  const sectionOrder = resume.sectionOrder || [
    'workExperience',
    'projects',
    'skills',
    'education',
    'certificates',
    ...customSections.map(c => c.id)
  ];

  const isVisible = (key: string) => {
    if (!resume.sectionVisibility) return true;
    return resume.sectionVisibility[key] !== false;
  };

  // Helper to render markdown-like text in summary or custom content
  const renderTextContent = (text: string, isCompact = false) => {
    if (!text) return null;
    const lines = text.split('\n');
    return (
      <div className={isCompact ? 'space-y-0.5' : 'space-y-1'}>
        {lines.map((line, i) => {
          if (line.startsWith('### ')) {
            return (
              <div key={i} className="font-bold text-xs text-slate-900 dark:text-white mt-1.5">
                {line.replace('### ', '')}
              </div>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <div key={i} className="font-bold text-sm text-slate-900 dark:text-white mt-2">
                {line.replace('## ', '')}
              </div>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <div key={i} className="flex items-start gap-1.5 pl-2 leading-relaxed text-slate-700 dark:text-slate-300">
                <span className="text-slate-400 dark:text-slate-500 mt-0.5">•</span>
                <span>{line.replace(/^[-*] /, '')}</span>
              </div>
            );
          }
          if (line.startsWith('> ')) {
            return (
              <div key={i} className="border-l-2 border-[#0071e3] pl-2.5 py-0.5 text-slate-600 dark:text-slate-300 bg-blue-50/40 dark:bg-blue-950/20 rounded-r text-xs my-1 italic">
                {line.replace('> ', '')}
              </div>
            );
          }
          if (!line.trim()) return <div key={i} className="h-1" />;
          return <p key={i} className="leading-relaxed text-slate-700 dark:text-slate-300">{line}</p>;
        })}
      </div>
    );
  };

  // ================= TEMPLATE 1: MODERN (现代极简 - Apple HIG Style) =================
  const renderModernTemplate = () => {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-5 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-start gap-4 flex-1">
            {personalInfo.avatarUrl ? (
              <div className="flex-shrink-0">
                <img
                  src={personalInfo.avatarUrl}
                  alt={personalInfo.fullName}
                  className="w-20 h-26 object-cover border border-slate-200 dark:border-slate-700 rounded-xs shadow-xs bg-slate-50 dark:bg-slate-800"
                />
              </div>
            ) : (
              <div className="flex-shrink-0 w-20 h-26 border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 rounded-xs flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-[10px] print:hidden">
                <User className="w-5 h-5 mb-0.5 text-slate-300 dark:text-slate-600" />
                <span className="font-medium text-[10px]">1寸照片</span>
                <span className="text-[8px] text-slate-400 dark:text-slate-500">测试占位</span>
              </div>
            )}

            <div>
              <div className="flex items-baseline gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {personalInfo.fullName}
                </h1>
              </div>
              <p className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300 mt-1">
                {personalInfo.jobTitle}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400 mt-2.5">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-[#0071e3]" />{personalInfo.email}</span>
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-[#0071e3]" />{personalInfo.phone}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#0071e3]" />{personalInfo.location}</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 sm:text-right flex-shrink-0">
            {personalInfo.website && (
              <div className="flex items-center sm:justify-end gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate max-w-[200px]">{personalInfo.website.replace('https://', '')}</span>
              </div>
            )}
            {personalInfo.github && (
              <div className="flex items-center sm:justify-end gap-1.5">
                <Github className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate max-w-[200px]">{personalInfo.github.replace('https://', '')}</span>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="flex items-center sm:justify-end gap-1.5">
                <Linkedin className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate max-w-[200px]">{personalInfo.linkedin.replace('https://', '')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Job Intent Card */}
        {jobIntent && (
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/90 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-[#0071e3]" />
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wide text-xs">求职意向</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700 dark:text-slate-300">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[11px]">期望职位</span>
                <span className="font-semibold text-slate-900 dark:text-white">{jobIntent.desiredPosition || personalInfo.jobTitle}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[11px]">期望薪资</span>
                <span className="font-bold text-[#0071e3]">{jobIntent.desiredSalary || '面议'}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[11px]">期望城市</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{jobIntent.desiredCity || personalInfo.location}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[11px]">求职状态</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{jobIntent.jobStatus || '随时到岗'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        {summary && (
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-1 h-3.5 bg-[#0071e3] rounded-full" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                个人优势与专业总结
              </h2>
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
            </div>
            <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              {renderTextContent(summary)}
            </div>
          </div>
        )}

        {/* Reordered Modules */}
        {sectionOrder.map(key => renderStandardSection(key, 'modern'))}
      </div>
    );
  };

  // ================= TEMPLATE 2: CLASSIC (经典传统 - Traditional Serif Academic) =================
  const renderClassicTemplate = () => {
    return (
      <div className="font-serif space-y-5">
        {/* Centered Classic Header */}
        <div className="text-center pb-4 border-b-2 border-slate-900 dark:border-slate-300">
          <div className="flex justify-center mb-2">
            {personalInfo.avatarUrl ? (
              <img
                src={personalInfo.avatarUrl}
                alt={personalInfo.fullName}
                className="w-18 h-24 object-cover border-2 border-slate-800 dark:border-slate-300 rounded-none shadow-xs mb-2"
              />
            ) : (
              <div className="w-18 h-24 border border-dashed border-slate-400 dark:border-slate-600 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-[10px] mb-2 print:hidden">
                <User className="w-5 h-5 mb-0.5 text-slate-400" />
                <span className="text-[9px]">测试照</span>
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold text-slate-950 dark:text-white tracking-wide uppercase">
            {personalInfo.fullName}
          </h1>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1 italic">
            {personalInfo.jobTitle}
          </p>

          <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs text-slate-700 dark:text-slate-300 mt-2 font-sans">
            <span>{personalInfo.phone}</span>
            <span>•</span>
            <span>{personalInfo.email}</span>
            <span>•</span>
            <span>{personalInfo.location}</span>
            {personalInfo.github && (
              <>
                <span>•</span>
                <span>{personalInfo.github.replace('https://', '')}</span>
              </>
            )}
          </div>
        </div>

        {/* Classic Job Intent */}
        {jobIntent && (
          <div className="text-center py-2 border-b border-slate-200 dark:border-slate-800 text-xs font-sans">
            <span className="font-bold text-slate-900 dark:text-white mr-2">求职意向：</span>
            <span>{jobIntent.desiredPosition || personalInfo.jobTitle}</span>
            <span className="mx-2">|</span>
            <span>期望薪资：{jobIntent.desiredSalary || '面议'}</span>
            <span className="mx-2">|</span>
            <span>城市：{jobIntent.desiredCity || personalInfo.location}</span>
            <span className="mx-2">|</span>
            <span>状态：{jobIntent.jobStatus || '随时到岗'}</span>
          </div>
        )}

        {/* Classic Summary */}
        {summary && (
          <div>
            <div className="border-b border-slate-900 dark:border-slate-300 pb-0.5 mb-2">
              <h2 className="text-xs font-bold text-slate-950 dark:text-white uppercase tracking-widest">
                专业综述 / PROFESSIONAL SUMMARY
              </h2>
            </div>
            <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
              {renderTextContent(summary)}
            </div>
          </div>
        )}

        {/* Reordered Modules */}
        {sectionOrder.map(key => renderStandardSection(key, 'classic'))}
      </div>
    );
  };

  // ================= TEMPLATE 3: TECH-SIDEBAR (技术双栏 - Developer 2-Column) =================
  const renderTechSidebarTemplate = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column (Sidebar ~35%) */}
        <div className="md:col-span-4 bg-slate-50 dark:bg-slate-800/80 p-5 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-5">
          {/* Avatar & Basic Info */}
          <div className="text-center sm:text-left">
            {personalInfo.avatarUrl ? (
              <img
                src={personalInfo.avatarUrl}
                alt={personalInfo.fullName}
                className="w-24 h-32 object-cover border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm mx-auto sm:mx-0 mb-3"
              />
            ) : (
              <div className="w-24 h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 mb-3 mx-auto sm:mx-0 print:hidden">
                <User className="w-8 h-8 mb-1 text-slate-300 dark:text-slate-600" />
                <span className="text-[11px] font-medium">证件照</span>
                <span className="text-[9px] text-slate-400">测试占位</span>
              </div>
            )}
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{personalInfo.fullName}</h1>
            <p className="text-xs font-semibold text-[#0071e3] mt-0.5">{personalInfo.jobTitle}</p>
          </div>

          {/* Contact Links */}
          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-4">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#0071e3] flex-shrink-0" />
              <span className="truncate">{personalInfo.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#0071e3] flex-shrink-0" />
              <span>{personalInfo.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#0071e3] flex-shrink-0" />
              <span>{personalInfo.location}</span>
            </div>
            {personalInfo.github && (
              <div className="flex items-center gap-2">
                <Github className="w-3.5 h-3.5 text-[#0071e3] flex-shrink-0" />
                <span className="truncate">{personalInfo.github.replace('https://', '')}</span>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="flex items-center gap-2">
                <Linkedin className="w-3.5 h-3.5 text-[#0071e3] flex-shrink-0" />
                <span className="truncate">{personalInfo.linkedin.replace('https://', '')}</span>
              </div>
            )}
            {personalInfo.website && (
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-[#0071e3] flex-shrink-0" />
                <span className="truncate">{personalInfo.website.replace('https://', '')}</span>
              </div>
            )}
          </div>

          {/* Job Intent in Sidebar */}
          {jobIntent && (
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 text-xs space-y-1.5">
              <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#0071e3]" />
                求职目标
              </div>
              <div className="text-slate-700 dark:text-slate-300">
                <div className="font-semibold text-slate-900 dark:text-white">{jobIntent.desiredPosition}</div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px]">期望: {jobIntent.desiredSalary}</div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px]">{jobIntent.desiredCity} · {jobIntent.jobStatus}</div>
              </div>
            </div>
          )}

          {/* Skills in Sidebar */}
          {isVisible('skills') && skills.length > 0 && (
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
              <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-[#0071e3]" />
                技能矩阵
              </div>
              {skills.map(s => (
                <div key={s.id} className="text-xs space-y-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">{s.category}</span>
                  <div className="flex flex-wrap gap-1">
                    {s.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/90 px-1.5 py-0.5 rounded shadow-2xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Education in Sidebar */}
          {isVisible('education') && education.length > 0 && (
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2">
              <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#0071e3]" />
                教育背景
              </div>
              {education.map(edu => (
                <div key={edu.id} className="resume-print-item text-xs">
                  <div className="font-bold text-slate-900 dark:text-white">{edu.school}</div>
                  <div className="text-slate-600 dark:text-slate-400 text-[11px]">{edu.degree} · {edu.major}</div>
                  <div className="text-slate-400 dark:text-slate-500 text-[10px] font-mono">{edu.startDate} ~ {edu.endDate}</div>
                </div>
              ))}
            </div>
          )}

          {/* Certificates in Sidebar */}
          {isVisible('certificates') && certificates.length > 0 && (
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2">
              <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#0071e3]" />
                资质与荣誉
              </div>
              {certificates.map(c => (
                <div key={c.id} className="resume-print-item text-xs">
                  <div className="font-semibold text-slate-900 dark:text-white">{c.name}</div>
                  <div className="text-slate-400 dark:text-slate-500 text-[10px]">{c.issuer} {c.date ? `(${c.date})` : ''}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Main Column (~65%) */}
        <div className="md:col-span-8 space-y-6 pt-1">
          {/* Summary */}
          {summary && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                  个人综述与架构优势
                </h2>
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
              </div>
              <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {renderTextContent(summary)}
              </div>
            </div>
          )}

          {/* Work Experience */}
          {isVisible('workExperience') && workExperience.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="w-4 h-4 text-[#0071e3]" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                  工作经历与架构落地
                </h2>
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
              </div>
              <div className="space-y-4">
                {workExperience.map(exp => (
                  <div key={exp.id} className="resume-print-item text-xs border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                    <div className="flex justify-between items-baseline font-bold text-slate-900 dark:text-white mb-0.5 gap-2">
                      <span className="text-sm flex-1 min-w-0 pr-2">{exp.company} <span className="font-normal text-slate-600 dark:text-slate-400">| {exp.position}</span></span>
                      <span className="text-slate-500 dark:text-slate-400 font-medium text-xs font-mono flex-shrink-0 whitespace-nowrap ml-2">{exp.startDate} ~ {exp.endDate}</span>
                    </div>
                    {exp.department && (
                      <p className="text-slate-500 dark:text-slate-400 mb-1 text-[11px]">{exp.department} {exp.location ? `· ${exp.location}` : ''}</p>
                    )}
                    <ul className="list-disc list-outside ml-4 space-y-1 text-slate-700 dark:text-slate-300 leading-relaxed">
                      {exp.highlights.map((h, i) => <li key={i}>{h}</li>)}
                    </ul>
                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">技术栈: </span>{exp.technologies.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {isVisible('projects') && projects.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FolderGit2 className="w-4 h-4 text-[#0071e3]" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                  重点项目深度实战
                </h2>
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
              </div>
              <div className="space-y-4">
                {projects.map(proj => (
                  <div key={proj.id} className="resume-print-item text-xs border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                    <div className="flex justify-between items-baseline font-bold text-slate-900 dark:text-white mb-0.5 gap-2">
                      <span className="text-sm flex-1 min-w-0 pr-2">{proj.name} <span className="font-normal text-slate-600 dark:text-slate-400">({proj.role})</span></span>
                      <span className="text-slate-500 dark:text-slate-400 font-medium text-xs font-mono flex-shrink-0 whitespace-nowrap ml-2">{proj.startDate} ~ {proj.endDate}</span>
                    </div>
                    {proj.description && <p className="text-slate-600 dark:text-slate-400 mb-1 leading-relaxed">{proj.description}</p>}
                    <ul className="list-disc list-outside ml-4 space-y-1 text-slate-700 dark:text-slate-300 leading-relaxed">
                      {proj.highlights.map((h, i) => <li key={i}>{h}</li>)}
                    </ul>
                    {proj.techStack && proj.techStack.length > 0 && (
                      <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">技术选型: </span>{proj.techStack.join(' · ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Sections */}
          {customSections.map(custom => {
            if (!isVisible(custom.id)) return null;
            return (
              <div key={custom.id}>
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="w-4 h-4 text-[#0071e3]" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">{custom.title}</h2>
                  <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {renderTextContent(custom.content)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ================= TEMPLATE 4: CREATIVE (创意科技 - Silicon Valley Timeline) =================
  const renderCreativeTemplate = () => {
    return (
      <div className="space-y-6">
        {/* Gradient Top Bar */}
        <div className="h-2 rounded-t-xl bg-gradient-to-r from-[#0071e3] via-indigo-500 to-cyan-400 -mx-8 sm:-mx-12 -mt-8 sm:-mt-12 mb-6" />

        {/* Creative Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-5 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {personalInfo.avatarUrl ? (
              <img
                src={personalInfo.avatarUrl}
                alt={personalInfo.fullName}
                className="w-20 h-26 object-cover rounded-xl border-2 border-indigo-200 dark:border-indigo-900/60 shadow-md flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-26 rounded-xl border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 flex flex-col items-center justify-center text-indigo-400 dark:text-indigo-400 text-[10px] print:hidden flex-shrink-0">
                <User className="w-5 h-5 mb-0.5" />
                <span className="font-medium text-[10px]">测试占位</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {personalInfo.fullName}
              </h1>
              <p className="text-sm font-semibold bg-gradient-to-r from-[#0071e3] to-indigo-600 bg-clip-text text-transparent mt-0.5">
                {personalInfo.jobTitle}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-lg text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 whitespace-nowrap shadow-2xs">
                  <Mail className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                  <span>{personalInfo.email}</span>
                </span>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-lg text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 whitespace-nowrap shadow-2xs">
                  <Phone className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                  <span>{personalInfo.phone}</span>
                </span>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-lg text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 whitespace-nowrap shadow-2xs">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                  <span>{personalInfo.location}</span>
                </span>
                {personalInfo.github && (
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-lg text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 whitespace-nowrap shadow-2xs">
                    <Github className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                    <span>{personalInfo.github.replace('https://', '')}</span>
                  </span>
                )}
                {personalInfo.website && (
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-lg text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 whitespace-nowrap shadow-2xs">
                    <Globe className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                    <span>{personalInfo.website.replace('https://', '')}</span>
                  </span>
                )}
                {personalInfo.linkedin && (
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-lg text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 whitespace-nowrap shadow-2xs">
                    <Linkedin className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                    <span>{personalInfo.linkedin.replace('https://', '')}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Job Intent in Creative Style */}
        {jobIntent && (
          <div className="p-3 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200/80 dark:border-blue-900/40 text-xs">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="font-bold text-slate-900 dark:text-white">求职目标与期望待遇</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-700 dark:text-slate-300 text-xs">
              <span>职位: <strong className="text-slate-900 dark:text-white">{jobIntent.desiredPosition}</strong></span>
              <span>•</span>
              <span>期望: <strong className="text-indigo-600 dark:text-indigo-400">{jobIntent.desiredSalary}</strong></span>
              <span>•</span>
              <span>工作地点: <strong>{jobIntent.desiredCity}</strong></span>
              <span>•</span>
              <span>求职状态: <strong>{jobIntent.jobStatus}</strong></span>
            </div>
          </div>
        )}

        {/* Summary */}
        {summary && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#0071e3] to-indigo-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                核心沉淀与技术愿景
              </h2>
              <div className="h-px bg-gradient-to-r from-indigo-200 to-transparent dark:from-indigo-900 flex-1" />
            </div>
            <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              {renderTextContent(summary)}
            </div>
          </div>
        )}

        {/* Reordered Modules in Creative Layout (with Timeline Track for Work & Projects) */}
        {sectionOrder.map(key => renderStandardSection(key, 'creative'))}
      </div>
    );
  };

  // ================= TEMPLATE 5: COMPACT (紧凑单页 - High Density HR 1-Pager) =================
  const renderCompactTemplate = () => {
    return (
      <div className="space-y-3.5 text-xs">
        {/* Ultra-compact Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-300 dark:border-slate-700">
          <div className="flex items-center gap-3">
            {personalInfo.avatarUrl ? (
              <img
                src={personalInfo.avatarUrl}
                alt={personalInfo.fullName}
                className="w-14 h-18 object-cover rounded-xs border border-slate-300 dark:border-slate-700 flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-18 border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-[9px] flex-shrink-0 print:hidden">
                <User className="w-4 h-4" />
                <span>测试</span>
              </div>
            )}
            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{personalInfo.fullName}</h1>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{personalInfo.jobTitle}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                <span>{personalInfo.phone}</span>
                <span>·</span>
                <span>{personalInfo.email}</span>
                <span>·</span>
                <span>{personalInfo.location}</span>
                {personalInfo.github && (
                  <>
                    <span>·</span>
                    <span>{personalInfo.github.replace('https://', '')}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {jobIntent && (
            <div className="text-right text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-[#0071e3] block">{jobIntent.desiredPosition}</span>
              <span>期望: {jobIntent.desiredSalary} · {jobIntent.jobStatus}</span>
            </div>
          )}
        </div>

        {/* Compact Summary */}
        {summary && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold text-xs">
              <span className="w-1.5 h-3 bg-[#0071e3] rounded-xs" />
              <span>专业综述</span>
            </div>
            <div className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
              {renderTextContent(summary, true)}
            </div>
          </div>
        )}

        {/* Reordered Modules */}
        {sectionOrder.map(key => renderStandardSection(key, 'compact'))}
      </div>
    );
  };

  // ================= MODULAR SECTION RENDERER =================
  const renderStandardSection = (key: string, tpl: ResumeTemplateId) => {
    if (!isVisible(key)) return null;

    // 1. Work Experience
    if (key === 'workExperience') {
      if (workExperience.length === 0) return null;

      const isTimeline = tpl === 'creative';
      const isCompact = tpl === 'compact';
      const isClassic = tpl === 'classic';

      return (
        <div key="workExperience" className={isCompact ? 'mb-3' : 'mb-6'}>
          <div className="flex items-center gap-2 mb-2.5">
            {tpl === 'modern' && <span className="w-1 h-3.5 bg-[#0071e3] rounded-full" />}
            {tpl === 'creative' && <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#0071e3] to-indigo-500" />}
            {isCompact && <span className="w-1.5 h-3 bg-[#0071e3] rounded-xs" />}
            <h2 className={`font-bold text-slate-900 dark:text-white uppercase tracking-wide ${isCompact ? 'text-xs' : 'text-sm'} ${isClassic ? 'font-serif border-b border-slate-900 dark:border-slate-300 w-full pb-0.5' : ''}`}>
              {isClassic ? '工作经历 / EXPERIENCE' : '工作经历'}
            </h2>
            {!isClassic && <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />}
          </div>

          <div className={isTimeline ? 'relative pl-5 border-l-2 border-blue-500/30 dark:border-blue-400/30 space-y-5' : isCompact ? 'space-y-2.5' : 'space-y-4'}>
            {workExperience.map(exp => (
              <div key={exp.id} className={`resume-print-item text-xs ${isTimeline ? 'relative' : ''}`}>
                {isTimeline && (
                  <div className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-[#0071e3] border-2 border-white dark:border-slate-900" />
                )}
                <div className="flex justify-between items-baseline font-bold text-slate-900 dark:text-white mb-0.5 gap-2">
                  <span className={`${isCompact ? 'text-xs' : 'text-sm'} flex-1 min-w-0 pr-2`}>
                    {exp.company} <span className="font-normal text-slate-600 dark:text-slate-400">| {exp.position}</span>
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium text-xs font-mono flex-shrink-0 whitespace-nowrap ml-2">{exp.startDate} ~ {exp.endDate}</span>
                </div>
                {exp.department && (
                  <p className="text-slate-500 dark:text-slate-400 mb-1 text-[11px]">{exp.department} {exp.location ? `· ${exp.location}` : ''}</p>
                )}
                <ul className="list-disc list-outside ml-4 space-y-1 text-slate-700 dark:text-slate-300 leading-relaxed">
                  {exp.highlights.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
                {exp.technologies && exp.technologies.length > 0 && (
                  <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">核心技术栈: </span>{exp.technologies.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 2. Projects
    if (key === 'projects') {
      if (projects.length === 0) return null;

      const isTimeline = tpl === 'creative';
      const isCompact = tpl === 'compact';
      const isClassic = tpl === 'classic';

      return (
        <div key="projects" className={isCompact ? 'mb-3' : 'mb-6'}>
          <div className="flex items-center gap-2 mb-2.5">
            {tpl === 'modern' && <span className="w-1 h-3.5 bg-[#0071e3] rounded-full" />}
            {tpl === 'creative' && <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#0071e3] to-indigo-500" />}
            {isCompact && <span className="w-1.5 h-3 bg-[#0071e3] rounded-xs" />}
            <h2 className={`font-bold text-slate-900 dark:text-white uppercase tracking-wide ${isCompact ? 'text-xs' : 'text-sm'} ${isClassic ? 'font-serif border-b border-slate-900 dark:border-slate-300 w-full pb-0.5' : ''}`}>
              {isClassic ? '重点项目 / KEY PROJECTS' : '核心项目经历'}
            </h2>
            {!isClassic && <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />}
          </div>

          <div className={isTimeline ? 'relative pl-5 border-l-2 border-blue-500/30 dark:border-blue-400/30 space-y-5' : isCompact ? 'space-y-2.5' : 'space-y-4'}>
            {projects.map(proj => (
              <div key={proj.id} className={`resume-print-item text-xs ${isTimeline ? 'relative' : ''}`}>
                {isTimeline && (
                  <div className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-[#0071e3] border-2 border-white dark:border-slate-900" />
                )}
                <div className="flex justify-between items-baseline font-bold text-slate-900 dark:text-white mb-0.5 gap-2">
                  <span className={`${isCompact ? 'text-xs' : 'text-sm'} flex-1 min-w-0 pr-2`}>
                    {proj.name} <span className="font-normal text-slate-600 dark:text-slate-400">({proj.role})</span>
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium text-xs font-mono flex-shrink-0 whitespace-nowrap ml-2">{proj.startDate} ~ {proj.endDate}</span>
                </div>
                {proj.description && <p className="text-slate-600 dark:text-slate-400 mb-1 leading-relaxed">{proj.description}</p>}
                <ul className="list-disc list-outside ml-4 space-y-1 text-slate-700 dark:text-slate-300 leading-relaxed">
                  {proj.highlights.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
                {proj.techStack && proj.techStack.length > 0 && (
                  <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">技术选型: </span>{proj.techStack.join(' · ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 3. Skills
    if (key === 'skills') {
      if (skills.length === 0) return null;
      const isClassic = tpl === 'classic';
      const isCreative = tpl === 'creative';
      const isCompact = tpl === 'compact';

      return (
        <div key="skills" className={isCompact ? 'mb-3' : 'mb-6'}>
          <div className="flex items-center gap-2 mb-2.5">
            {tpl === 'modern' && <span className="w-1 h-3.5 bg-[#0071e3] rounded-full" />}
            {isCreative && <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#0071e3] to-indigo-500" />}
            {isCompact && <span className="w-1.5 h-3 bg-[#0071e3] rounded-xs" />}
            <h2 className={`font-bold text-slate-900 dark:text-white uppercase tracking-wide ${isCompact ? 'text-xs' : 'text-sm'} ${isClassic ? 'font-serif border-b border-slate-900 dark:border-slate-300 w-full pb-0.5' : ''}`}>
              {isClassic ? '专业技能 / CORE SKILLS' : '核心技术矩阵'}
            </h2>
            {!isClassic && <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />}
          </div>

          <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            {skills.map(s => (
              <div key={s.id} className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 w-36 flex-shrink-0">{s.category}:</span>
                {isCreative ? (
                  <div className="flex flex-wrap gap-1 flex-1">
                    {s.skills.map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/50 text-[#0071e3] dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50 rounded-md text-[11px] font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-600 dark:text-slate-300">{s.skills.join(' · ')}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 4. Education
    if (key === 'education') {
      if (education.length === 0) return null;
      const isClassic = tpl === 'classic';
      const isCompact = tpl === 'compact';

      return (
        <div key="education" className={isCompact ? 'mb-3' : 'mb-6'}>
          <div className="flex items-center gap-2 mb-2.5">
            {tpl === 'modern' && <span className="w-1 h-3.5 bg-[#0071e3] rounded-full" />}
            {tpl === 'creative' && <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#0071e3] to-indigo-500" />}
            {isCompact && <span className="w-1.5 h-3 bg-[#0071e3] rounded-xs" />}
            <h2 className={`font-bold text-slate-900 dark:text-white uppercase tracking-wide ${isCompact ? 'text-xs' : 'text-sm'} ${isClassic ? 'font-serif border-b border-slate-900 dark:border-slate-300 w-full pb-0.5' : ''}`}>
              {isClassic ? '教育背景 / EDUCATION' : '教育背景'}
            </h2>
            {!isClassic && <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />}
          </div>

          <div className="space-y-2.5">
            {education.map(edu => (
              <div key={edu.id} className="resume-print-item text-xs">
                <div className="flex justify-between items-baseline gap-2">
                  <div className="font-bold text-slate-900 dark:text-white flex-1 min-w-0 pr-2">
                    <span>{edu.school}</span>
                    <span className="font-normal text-slate-700 dark:text-slate-300"> · {edu.degree} ({edu.major})</span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-xs flex-shrink-0 whitespace-nowrap ml-2">
                    {edu.startDate} ~ {edu.endDate}
                  </span>
                </div>
                {(edu.gpa || (edu.honors && edu.honors.length > 0)) && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                    {edu.gpa && (
                      <span>GPA: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{edu.gpa}</strong></span>
                    )}
                    {edu.honors && edu.honors.length > 0 && (
                      <span>荣誉: <span className="text-slate-600 dark:text-slate-300">{edu.honors.join('、')}</span></span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 5. Certificates & Honors
    if (key === 'certificates') {
      if (certificates.length === 0) return null;
      const isClassic = tpl === 'classic';
      const isCompact = tpl === 'compact';

      return (
        <div key="certificates" className={isCompact ? 'mb-3' : 'mb-6'}>
          <div className="flex items-center gap-2 mb-2.5">
            {tpl === 'modern' && <span className="w-1 h-3.5 bg-[#0071e3] rounded-full" />}
            {tpl === 'creative' && <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#0071e3] to-indigo-500" />}
            {isCompact && <span className="w-1.5 h-3 bg-[#0071e3] rounded-xs" />}
            <h2 className={`font-bold text-slate-900 dark:text-white uppercase tracking-wide ${isCompact ? 'text-xs' : 'text-sm'} ${isClassic ? 'font-serif border-b border-slate-900 dark:border-slate-300 w-full pb-0.5' : ''}`}>
              {isClassic ? '专业认证与荣誉 / CERTIFICATIONS & HONORS' : '资质认证与专业荣誉'}
            </h2>
            {!isClassic && <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />}
          </div>

          <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            {certificates.map(c => (
              <div key={c.id} className="resume-print-item flex items-baseline justify-between py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <div className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-[#0071e3] flex-shrink-0" />
                  <span className="font-semibold text-slate-900 dark:text-white">{c.name}</span>
                  {c.issuer && <span className="text-slate-500 dark:text-slate-400 text-[11px]">· {c.issuer}</span>}
                </div>
                {c.date && <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px] flex-shrink-0 ml-4">{c.date}</span>}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 6. Custom Section
    const custom = customSections.find(c => c.id === key);
    if (custom) {
      const isClassic = tpl === 'classic';
      const isCompact = tpl === 'compact';

      return (
        <div key={custom.id} className={isCompact ? 'mb-3' : 'mb-6'}>
          <div className="flex items-center gap-2 mb-2.5">
            {tpl === 'modern' && <span className="w-1 h-3.5 bg-[#0071e3] rounded-full" />}
            {tpl === 'creative' && <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#0071e3] to-indigo-500" />}
            {isCompact && <span className="w-1.5 h-3 bg-[#0071e3] rounded-xs" />}
            <h2 className={`font-bold text-slate-900 dark:text-white uppercase tracking-wide ${isCompact ? 'text-xs' : 'text-sm'} ${isClassic ? 'font-serif border-b border-slate-900 dark:border-slate-300 w-full pb-0.5' : ''}`}>
              {custom.title}
            </h2>
            {!isClassic && <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />}
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {renderTextContent(custom.content, isCompact)}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      id={documentId}
      className="resume-print-container bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-8 sm:p-12 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 min-h-[1050px] font-sans max-w-4xl mx-auto transition-colors duration-200 print:bg-white print:text-black print:border-none print:shadow-none print:p-0"
    >
      {templateId === 'modern' && renderModernTemplate()}
      {templateId === 'classic' && renderClassicTemplate()}
      {templateId === 'tech-sidebar' && renderTechSidebarTemplate()}
      {templateId === 'creative' && renderCreativeTemplate()}
      {templateId === 'compact' && renderCompactTemplate()}
    </div>
  );
};
