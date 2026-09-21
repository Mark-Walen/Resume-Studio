import { ResumeData } from '../types/resume';

/**
 * 导出为 Word 格式 (.doc)
 * 基于标准 HTML+Office 命名空间生成，能在 Microsoft Word、WPS 和 Pages 中完美保留排版和样式
 */
export function exportToWord(resume: ResumeData): void {
  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${resume.personalInfo.fullName} - 个人简历</title>
      <style>
        body { font-family: 'Microsoft YaHei', 'PingFang SC', Arial, sans-serif; line-height: 1.6; color: #1e293b; padding: 20px; }
        h1 { font-size: 24pt; color: #0f172a; margin-bottom: 4px; }
        .subtitle { font-size: 14pt; color: #2563eb; font-weight: bold; margin-bottom: 12px; }
        .contact { font-size: 10pt; color: #475569; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
        h2 { font-size: 14pt; color: #1e3a8a; border-bottom: 1.5pt solid #3b82f6; padding-bottom: 4px; margin-top: 18px; margin-bottom: 8px; text-transform: uppercase; }
        .summary { font-size: 10.5pt; color: #334155; margin-bottom: 16px; }
        .item-header { margin-top: 10px; margin-bottom: 4px; }
        .item-title { font-size: 11pt; font-weight: bold; color: #0f172a; }
        .item-role { font-size: 10.5pt; font-weight: 600; color: #2563eb; }
        .item-date { font-size: 9.5pt; color: #64748b; float: right; }
        ul { margin-top: 4px; margin-bottom: 10px; padding-left: 20px; }
        li { font-size: 10pt; color: #334155; margin-bottom: 4px; }
        .skill-group { margin-bottom: 6px; font-size: 10pt; }
        .skill-cat { font-weight: bold; color: #0f172a; }
      </style>
    </head>
    <body>
      <h1>${resume.personalInfo.fullName}</h1>
      <div class="subtitle">${resume.personalInfo.jobTitle}</div>
      <div class="contact">
        邮箱: ${resume.personalInfo.email} | 电话: ${resume.personalInfo.phone} | 坐标: ${resume.personalInfo.location}
        ${resume.personalInfo.website ? ` | 个人网站: ${resume.personalInfo.website}` : ''}
        ${resume.personalInfo.github ? ` | GitHub: ${resume.personalInfo.github}` : ''}
      </div>

      <h2>个人优势与专业总结</h2>
      <div class="summary">${resume.summary}</div>

      <h2>专业技能矩阵</h2>
      ${resume.skills.map(s => `
        <div class="skill-group">
          <span class="skill-cat">${s.category}: </span>
          <span>${s.skills.join('、')}</span>
        </div>
      `).join('')}

      <h2>工作与项目经历</h2>
      ${resume.workExperience.map(exp => `
        <div class="item-header">
          <span class="item-title">${exp.company}</span> - <span class="item-role">${exp.position}</span>
          <span class="item-date">${exp.startDate} ~ ${exp.endDate}</span>
        </div>
        ${exp.department ? `<div style="font-size: 9pt; color: #64748b; margin-bottom: 4px;">所在部门: ${exp.department} | ${exp.location || ''}</div>` : ''}
        <ul>
          ${exp.highlights.map(h => `<li>${h}</li>`).join('')}
        </ul>
        ${exp.technologies && exp.technologies.length > 0 ? `<div style="font-size: 9pt; color: #475569; margin-bottom: 8px;"><strong>核心技术:</strong> ${exp.technologies.join(', ')}</div>` : ''}
      `).join('')}

      <h2>重点核心项目</h2>
      ${resume.projects.map(proj => `
        <div class="item-header">
          <span class="item-title">${proj.name}</span> (${proj.role})
          <span class="item-date">${proj.startDate} ~ ${proj.endDate}</span>
        </div>
        <div style="font-size: 9.5pt; color: #475569; margin-bottom: 4px;">${proj.description}</div>
        <ul>
          ${proj.highlights.map(h => `<li>${h}</li>`).join('')}
        </ul>
        <div style="font-size: 9pt; color: #2563eb; margin-bottom: 10px;">技术栈: ${proj.techStack.join(' · ')}</div>
      `).join('')}

      <h2>教育背景</h2>
      ${resume.education.map(edu => `
        <div class="item-header">
          <span class="item-title">${edu.school}</span> - ${edu.degree} (${edu.major})
          <span class="item-date">${edu.startDate} ~ ${edu.endDate}</span>
        </div>
        ${edu.gpa ? `<div style="font-size: 9.5pt; color: #475569;">GPA: ${edu.gpa}</div>` : ''}
        ${edu.honors && edu.honors.length > 0 ? `<div style="font-size: 9pt; color: #64748b;">荣誉奖项: ${edu.honors.join('、')}</div>` : ''}
      `).join('')}

      ${resume.certificates.length > 0 ? `
        <h2>资质证书</h2>
        <ul>
          ${resume.certificates.map(cert => `<li><strong>${cert.name}</strong> - ${cert.issuer} (${cert.date})</li>`).join('')}
        </ul>
      ` : ''}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + htmlContent], {
    type: 'application/msword;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${resume.personalInfo.fullName}_${resume.personalInfo.jobTitle}_简历.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 导出为标准 Markdown 格式 (.md)
 */
export function exportToMarkdown(resume: ResumeData): void {
  const lines: string[] = [];

  lines.push(`# ${resume.personalInfo.fullName}`);
  lines.push(`**${resume.personalInfo.jobTitle}**\n`);
  lines.push(`- 📧 **邮箱**: ${resume.personalInfo.email}`);
  lines.push(`- 📱 **电话**: ${resume.personalInfo.phone}`);
  lines.push(`- 📍 **城市**: ${resume.personalInfo.location}`);
  if (resume.personalInfo.website) lines.push(`- 🌐 **个人主页**: [${resume.personalInfo.website}](${resume.personalInfo.website})`);
  if (resume.personalInfo.github) lines.push(`- 💻 **GitHub**: [${resume.personalInfo.github}](${resume.personalInfo.github})`);
  if (resume.personalInfo.linkedin) lines.push(`- 💼 **LinkedIn**: [${resume.personalInfo.linkedin}](${resume.personalInfo.linkedin})`);
  lines.push('\n---\n');

  lines.push(`## 📌 个人优势与专业总结\n`);
  lines.push(`${resume.summary}\n`);

  lines.push(`## 🛠 专业技能\n`);
  resume.skills.forEach(s => {
    lines.push(`- **${s.category}**: ${s.skills.join('、')}`);
  });
  lines.push('\n');

  lines.push(`## 💼 工作经历\n`);
  resume.workExperience.forEach(exp => {
    lines.push(`### ${exp.company} | ${exp.position} (${exp.startDate} ~ ${exp.endDate})`);
    if (exp.department) lines.push(`*部门: ${exp.department} | 坐标: ${exp.location || '在职'}*`);
    exp.highlights.forEach(h => lines.push(`- ${h}`));
    if (exp.technologies && exp.technologies.length > 0) {
      lines.push(`\n**技术栈**: \`${exp.technologies.join('` `')}\`\n`);
    }
    lines.push('');
  });

  lines.push(`## 🚀 核心项目经历\n`);
  resume.projects.forEach(proj => {
    lines.push(`### ${proj.name} (${proj.role})`);
    lines.push(`*周期: ${proj.startDate} ~ ${proj.endDate}*`);
    lines.push(`${proj.description}\n`);
    proj.highlights.forEach(h => lines.push(`- ${h}`));
    lines.push(`\n**核心架构**: ${proj.techStack.join(' · ')}\n`);
  });

  lines.push(`## 🎓 教育背景\n`);
  resume.education.forEach(edu => {
    lines.push(`- **${edu.school}** | ${edu.degree} · ${edu.major} (${edu.startDate} ~ ${edu.endDate})`);
    if (edu.gpa) lines.push(`  - 成绩绩点: ${edu.gpa}`);
    if (edu.honors && edu.honors.length > 0) lines.push(`  - 奖项荣誉: ${edu.honors.join('、')}`);
  });

  if (resume.certificates.length > 0) {
    lines.push(`\n## 🏆 荣誉认证\n`);
    resume.certificates.forEach(c => {
      lines.push(`- **${c.name}** - ${c.issuer} (${c.date})`);
    });
  }

  const content = lines.join('\n');
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${resume.personalInfo.fullName}_简历.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 导出为 PDF (通过系统打印原生生成无损高保真矢量 PDF)
 */
export function exportToPdf(): void {
  window.print();
}

/**
 * 生成预填充的求职邮件发送链接 (mailto:)
 */
export function generateMailToLink(params: {
  recipientEmail: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  customBody?: string;
}): string {
  const subject = encodeURIComponent(`【应聘】${params.candidateName} - 求职「${params.jobTitle}」- 附个人简历与作品集`);
  const defaultBody = `尊敬的 ${params.companyName} 招聘团队 / 负责人：

您好！

我是 ${params.candidateName}，非常关注贵公司的发展与在「${params.jobTitle}」岗位的招聘需求。

我的核心经历与技术专长：
1. 具备扎实的技术架构与业务交付能力，持续关注系统性能、稳定性与工程卓越；
2. 附上我的最新简历与详细项目成果，供您审阅评估；
3. 期待能有机会与您或用人团队进一步沟通交流！

感谢您的宝贵时间，祝工作顺利！

此致，
${params.candidateName}
联系方式：${params.recipientEmail ? '' : '请查阅简历上方联系信息'}`;

  const body = encodeURIComponent(params.customBody || defaultBody);
  return `mailto:${params.recipientEmail}?subject=${subject}&body=${body}`;
}
