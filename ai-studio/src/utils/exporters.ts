import { ResumeData } from '../types/resume';
import { escapeHtml, richTextToMarkdown, sanitizeRichText, toRichHtml } from './richText';

const sortableBuiltInSections = ['jobIntent', 'skills', 'workExperience', 'projects', 'education', 'certificates'];

function getSectionOrder(resume: ResumeData): string[] {
  const customKeys = (resume.customSections || []).map(section => `custom:${section.id}`);
  const requested = [...(resume.sectionOrder || sortableBuiltInSections)].filter(key => key !== 'summary');
  if (!requested.includes('jobIntent')) requested.unshift('jobIntent');
  const hiddenSections = new Set(resume.hiddenSections || []);
  const sortableOrder = [...requested.filter(key => sortableBuiltInSections.includes(key) || customKeys.includes(key)), ...sortableBuiltInSections.filter(key => !requested.includes(key)), ...customKeys.filter(key => !requested.includes(key))];
  const sectionOrder = sortableOrder.filter(key => !hiddenSections.has(key));
  const jobIntentIndex = sectionOrder.indexOf('jobIntent');
  sectionOrder.splice(jobIntentIndex >= 0 ? jobIntentIndex + 1 : 0, 0, 'summary');
  return sectionOrder;
}

function wordSection(resume: ResumeData, key: string): string {
  if (key === 'jobIntent') {
    const salary = resume.personalInfo.salaryMin && resume.personalInfo.salaryMax ? `${resume.personalInfo.salaryMin}–${resume.personalInfo.salaryMax}` : resume.personalInfo.expectedSalary || '面议';
    return `<h2>求职意向</h2><div class="summary"><strong>目标岗位：</strong>${escapeHtml(resume.personalInfo.jobTitle)}　<strong>意向城市：</strong>${escapeHtml(resume.personalInfo.targetCities || resume.personalInfo.location)}<br><strong>期望薪资：</strong>${escapeHtml(salary)}　<strong>到岗时间：</strong>${escapeHtml(resume.personalInfo.availability || '需协商')}</div>`;
  }
  if (key === 'summary') return `<h2>个人总结</h2><div class="summary">${sanitizeRichText(toRichHtml(resume.summary))}</div>`;
  if (key === 'skills') return `<h2>专业技能</h2>${resume.skills.map(group => `<div class="skill-group"><strong>${escapeHtml(group.category)}：</strong>${group.skills.map(escapeHtml).join('、')}</div>`).join('')}`;
  if (key === 'workExperience') return `<h2>工作经历</h2>${resume.workExperience.map(item => `<div class="item-header"><span class="item-title">${escapeHtml(item.company)}</span> · <span class="item-role">${escapeHtml(item.position)}</span><span class="item-date">${escapeHtml(item.startDate)} ~ ${escapeHtml(item.endDate)}</span></div>${item.department || item.location ? `<div class="meta">${[item.department, item.location].filter(Boolean).map(value => escapeHtml(value || '')).join(' · ')}</div>` : ''}<ul>${item.highlights.map(highlight => `<li>${escapeHtml(highlight)}</li>`).join('')}</ul>${item.technologies?.length ? `<div class="meta"><strong>核心技术：</strong>${item.technologies.map(escapeHtml).join(' · ')}</div>` : ''}`).join('')}`;
  if (key === 'projects') return `<h2>项目经历</h2>${resume.projects.map(item => `<div class="item-header"><span class="item-title">${escapeHtml(item.name)}</span> · ${escapeHtml(item.role)}<span class="item-date">${escapeHtml(item.startDate)} ~ ${escapeHtml(item.endDate)}</span></div><div class="meta">${escapeHtml(item.description)}</div><ul>${item.highlights.map(highlight => `<li>${escapeHtml(highlight)}</li>`).join('')}</ul><div class="meta"><strong>技术栈：</strong>${item.techStack.map(escapeHtml).join(' · ')}</div>`).join('')}`;
  if (key === 'education') return `<h2>教育背景</h2>${resume.education.map(item => `<div class="item-header"><span class="item-title">${escapeHtml(item.school)}</span> · ${escapeHtml(item.degree)} · ${escapeHtml(item.major)}<span class="item-date">${escapeHtml(item.startDate)} ~ ${escapeHtml(item.endDate)}</span></div>${item.gpa ? `<div class="meta">成绩：${escapeHtml(item.gpa)}</div>` : ''}${item.honors?.length ? `<div class="meta">荣誉：${item.honors.map(escapeHtml).join('、')}</div>` : ''}`).join('')}`;
  if (key === 'certificates') return resume.certificates.length ? `<h2>证书与荣誉</h2><ul>${resume.certificates.map(item => `<li><strong>${escapeHtml(item.name)}</strong>${item.issuer ? ` · ${escapeHtml(item.issuer)}` : ''}${item.date ? ` · ${escapeHtml(item.date)}` : ''}</li>`).join('')}</ul>` : '';
  if (key.startsWith('custom:')) {
    const custom = (resume.customSections || []).find(section => `custom:${section.id}` === key);
    return custom ? `<h2>${escapeHtml(custom.title || '自定义模块')}</h2><div class="summary">${sanitizeRichText(toRichHtml(custom.content))}</div>` : '';
  }
  return '';
}

export function exportToWord(resume: ResumeData): void {
  const avatar = resume.personalInfo.avatarUrl && /^data:image\/(png|jpeg|webp);base64,/i.test(resume.personalInfo.avatarUrl) ? `<img class="avatar" src="${resume.personalInfo.avatarUrl}" alt="头像" />` : '';
  const htmlContent = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${escapeHtml(resume.personalInfo.fullName)} - 个人简历</title><style>
  body{font-family:'Microsoft YaHei','PingFang SC',Arial,sans-serif;line-height:1.6;color:#1e293b;padding:20px}.header{border-bottom:2px solid #2563eb;padding-bottom:12px}.avatar{width:70px;height:98px;object-fit:cover;border-radius:0;float:right;margin-left:16px}h1{font-size:24pt;color:#0f172a;margin:0 0 4px}.subtitle{font-size:14pt;color:#2563eb;font-weight:bold}.contact{font-size:10pt;color:#475569;margin-top:8px}h2{font-size:14pt;color:#1e3a8a;border-bottom:1.5pt solid #3b82f6;padding-bottom:4px;margin:18px 0 8px}.summary,.skill-group{font-size:10.5pt;color:#334155}.item-header{margin-top:10px}.item-title{font-size:11pt;font-weight:bold;color:#0f172a}.item-role{font-weight:bold;color:#2563eb}.item-date{font-size:9.5pt;color:#64748b;float:right}.meta{font-size:9.5pt;color:#64748b;margin:3px 0}ul{margin:4px 0 10px;padding-left:20px}li{font-size:10pt;color:#334155;margin-bottom:4px}blockquote{border-left:3px solid #93c5fd;padding-left:8px;color:#475569}
  </style></head><body><div class="header">${avatar}<h1>${escapeHtml(resume.personalInfo.fullName)}</h1><div class="subtitle">${escapeHtml(resume.personalInfo.jobTitle)}</div><div class="contact">邮箱：${escapeHtml(resume.personalInfo.email)}　电话：${escapeHtml(resume.personalInfo.phone)}　地点：${escapeHtml(resume.personalInfo.location)}${resume.personalInfo.github ? `　GitHub：${escapeHtml(resume.personalInfo.github)}` : ''}</div></div>${getSectionOrder(resume).map(key => wordSection(resume, key)).join('')}</body></html>`;
  downloadBlob(new Blob(['\ufeff' + htmlContent], { type: 'application/msword;charset=utf-8' }), `${resume.personalInfo.fullName}_${resume.personalInfo.jobTitle}_简历.doc`);
}

function markdownSection(resume: ResumeData, key: string): string {
  if (key === 'jobIntent') { const salary = resume.personalInfo.salaryMin && resume.personalInfo.salaryMax ? `${resume.personalInfo.salaryMin}–${resume.personalInfo.salaryMax}` : resume.personalInfo.expectedSalary || '面议'; return `## 求职意向\n\n- **目标岗位**：${resume.personalInfo.jobTitle}\n- **意向城市**：${resume.personalInfo.targetCities || resume.personalInfo.location}\n- **期望薪资**：${salary}\n- **到岗时间**：${resume.personalInfo.availability || '需协商'}\n`; }
  if (key === 'summary') return `## 个人总结\n\n${richTextToMarkdown(resume.summary)}\n`;
  if (key === 'skills') return `## 专业技能\n\n${resume.skills.map(group => `- **${group.category}**：${group.skills.join('、')}`).join('\n')}\n`;
  if (key === 'workExperience') return `## 工作经历\n\n${resume.workExperience.map(item => `### ${item.company}｜${item.position}（${item.startDate} ~ ${item.endDate}）\n${item.department || item.location ? `*${[item.department, item.location].filter(Boolean).join(' · ')}*\n` : ''}${item.highlights.map(highlight => `- ${highlight}`).join('\n')}${item.technologies?.length ? `\n\n**核心技术**：${item.technologies.join(' · ')}` : ''}`).join('\n\n')}\n`;
  if (key === 'projects') return `## 项目经历\n\n${resume.projects.map(item => `### ${item.name}（${item.role}）\n*${item.startDate} ~ ${item.endDate}*\n\n${item.description}\n\n${item.highlights.map(highlight => `- ${highlight}`).join('\n')}\n\n**技术栈**：${item.techStack.join(' · ')}`).join('\n\n')}\n`;
  if (key === 'education') return `## 教育背景\n\n${resume.education.map(item => `- **${item.school}** · ${item.degree} · ${item.major}（${item.startDate} ~ ${item.endDate}）${item.gpa ? ` · ${item.gpa}` : ''}${item.honors?.length ? `\n  - ${item.honors.join('、')}` : ''}`).join('\n')}\n`;
  if (key === 'certificates') return resume.certificates.length ? `## 证书与荣誉\n\n${resume.certificates.map(item => `- **${item.name}**${item.issuer ? ` · ${item.issuer}` : ''}${item.date ? ` · ${item.date}` : ''}`).join('\n')}\n` : '';
  if (key.startsWith('custom:')) { const custom = (resume.customSections || []).find(section => `custom:${section.id}` === key); return custom ? `## ${custom.title || '自定义模块'}\n\n${richTextToMarkdown(custom.content)}\n` : ''; }
  return '';
}

export function exportToMarkdown(resume: ResumeData): void {
  const header = [`# ${resume.personalInfo.fullName}`, `**${resume.personalInfo.jobTitle}**`, '', `- **邮箱**：${resume.personalInfo.email}`, `- **电话**：${resume.personalInfo.phone}`, `- **城市**：${resume.personalInfo.location}`];
  if (resume.personalInfo.website) header.push(`- **个人主页**：[${resume.personalInfo.website}](${resume.personalInfo.website})`);
  if (resume.personalInfo.github) header.push(`- **GitHub**：[${resume.personalInfo.github}](${resume.personalInfo.github})`);
  if (resume.personalInfo.linkedin) header.push(`- **LinkedIn**：[${resume.personalInfo.linkedin}](${resume.personalInfo.linkedin})`);
  const content = `${header.join('\n')}\n\n---\n\n${getSectionOrder(resume).map(key => markdownSection(resume, key)).filter(Boolean).join('\n')}`;
  downloadBlob(new Blob([content], { type: 'text/markdown;charset=utf-8' }), `${resume.personalInfo.fullName}_简历.md`);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
}

export function exportToPdf(): void { window.print(); }

export function generateMailToLink(params: { recipientEmail: string; candidateName: string; jobTitle: string; companyName: string; customBody?: string; }): string {
  const subject = encodeURIComponent(`【应聘】${params.candidateName} - 求职「${params.jobTitle}」- 附个人简历与作品集`);
  const defaultBody = `尊敬的 ${params.companyName} 招聘团队 / 负责人：\n\n您好！\n\n我是 ${params.candidateName}，非常关注贵公司的发展与在「${params.jobTitle}」岗位的招聘需求。\n\n我的核心经历与技术专长：\n1. 具备扎实的技术架构与业务交付能力，持续关注系统性能、稳定性与工程质量；\n2. 附上我的最新简历与详细项目成果，供您审阅评估；\n3. 期待有机会与您或用人团队进一步沟通。\n\n感谢您的时间！\n\n此致，\n${params.candidateName}`;
  return `mailto:${params.recipientEmail}?subject=${subject}&body=${encodeURIComponent(params.customBody || defaultBody)}`;
}
