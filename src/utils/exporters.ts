import { ResumeData } from '../types/resume';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import DOMPurify from 'dompurify';
import { sanitizeExternalUrl, sanitizeImageUrl } from './security';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeResumeForHtml(resume: ResumeData): ResumeData {
  const escapeValue = (value: unknown): unknown => {
    if (typeof value === 'string') return escapeHtml(value);
    if (Array.isArray(value)) return value.map(escapeValue);
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, escapeValue(item)]));
    }
    return value;
  };
  const escaped = escapeValue(resume) as ResumeData;
  const safeAvatar = sanitizeImageUrl(resume.personalInfo.avatarUrl);
  escaped.personalInfo.avatarUrl = safeAvatar ? escapeHtml(safeAvatar) : undefined;
  return escaped;
}

/**
 * 导出为 Word 格式 (.doc)
 * 基于标准 HTML+Office 命名空间生成，能在 Microsoft Word、WPS 和 Pages 中完美保留排版和样式
 */
export function exportToWord(resume: ResumeData): void {
  resume = escapeResumeForHtml(resume);
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

  const sanitizedDocument = DOMPurify.sanitize(htmlContent, { WHOLE_DOCUMENT: true, ADD_TAGS: ['style'] });
  const blob = new Blob(['\ufeff' + sanitizedDocument], {
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
  const safeLinks = {
    website: sanitizeExternalUrl(resume.personalInfo.website),
    github: sanitizeExternalUrl(resume.personalInfo.github),
    linkedin: sanitizeExternalUrl(resume.personalInfo.linkedin),
  };
  resume = escapeResumeForHtml(resume);
  const lines: string[] = [];

  lines.push('<!-- Resume Pilot Agent Resume v1 -->');
  lines.push(`# ${resume.personalInfo.fullName}`);
  lines.push(`**${resume.personalInfo.jobTitle}**\n`);
  lines.push(`- **邮箱**: ${resume.personalInfo.email}`);
  lines.push(`- **电话**: ${resume.personalInfo.phone}`);
  lines.push(`- **城市**: ${resume.personalInfo.location}`);
  if (safeLinks.website) lines.push(`- **个人主页**: [${escapeHtml(safeLinks.website)}](${safeLinks.website})`);
  if (safeLinks.github) lines.push(`- **GitHub**: [${escapeHtml(safeLinks.github)}](${safeLinks.github})`);
  if (safeLinks.linkedin) lines.push(`- **LinkedIn**: [${escapeHtml(safeLinks.linkedin)}](${safeLinks.linkedin})`);
  lines.push('\n---\n');

  lines.push(`## 个人优势与专业总结\n`);
  lines.push(`${resume.summary}\n`);

  lines.push(`## 专业技能\n`);
  resume.skills.forEach(s => {
    lines.push(`- **${s.category}**: ${s.skills.join('、')}`);
  });
  lines.push('\n');

  lines.push(`## 工作经历\n`);
  resume.workExperience.forEach(exp => {
    lines.push(`### ${exp.company} | ${exp.position} (${exp.startDate} ~ ${exp.endDate})`);
    if (exp.department) lines.push(`*部门: ${exp.department} | 坐标: ${exp.location || '在职'}*`);
    exp.highlights.forEach(h => lines.push(`- ${h}`));
    if (exp.technologies && exp.technologies.length > 0) {
      lines.push(`\n**技术栈**: \`${exp.technologies.join('` `')}\`\n`);
    }
    lines.push('');
  });

  lines.push(`## 核心项目经历\n`);
  resume.projects.forEach(proj => {
    lines.push(`### ${proj.name} (${proj.role})`);
    lines.push(`*周期: ${proj.startDate} ~ ${proj.endDate}*`);
    lines.push(`${proj.description}\n`);
    proj.highlights.forEach(h => lines.push(`- ${h}`));
    lines.push(`\n**核心架构**: ${proj.techStack.join(' · ')}\n`);
  });

  lines.push(`## 教育背景\n`);
  resume.education.forEach(edu => {
    lines.push(`- **${edu.school}** | ${edu.degree} · ${edu.major} (${edu.startDate} ~ ${edu.endDate})`);
    if (edu.gpa) lines.push(`  - 成绩绩点: ${edu.gpa}`);
    if (edu.honors && edu.honors.length > 0) lines.push(`  - 奖项荣誉: ${edu.honors.join('、')}`);
  });

  if (resume.certificates.length > 0) {
    lines.push(`\n## 荣誉认证\n`);
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
 * 生成可用于无头/离屏渲染的 HTML 简历结构
 */
function createOffscreenResumeNode(resume: ResumeData): HTMLDivElement {
  resume = escapeResumeForHtml(resume);
  const container = document.createElement('div');
  container.id = 'temp-resume-export-container';
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.padding = '40px';
  container.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif";
  container.style.lineHeight = '1.6';
  container.style.zIndex = '-9999';

  const p = resume.personalInfo;
  const intent = resume.jobIntent;

  let html = `
    <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h1 style="font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0;">${p.fullName}</h1>
          <div style="font-size: 15px; font-weight: 600; color: #0071e3; margin-bottom: 10px;">${p.jobTitle}</div>
          <div style="font-size: 12px; color: #475569; display: flex; flex-wrap: wrap; gap: 12px;">
            <span>📧 ${p.email}</span>
            <span>📱 ${p.phone}</span>
            <span>📍 ${p.location}</span>
          </div>
        </div>
        ${p.avatarUrl ? `<img src="${p.avatarUrl}" style="width: 80px; height: 104px; object-fit: cover; border-radius: 4px; border: 1px solid #cbd5e1;" />` : ''}
      </div>
    </div>
  `;

  if (intent && (intent.desiredPosition || intent.desiredSalary || intent.desiredCity)) {
    html += `
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 20px; font-size: 12px;">
        <div style="font-weight: 700; color: #0f172a; margin-bottom: 6px;">求职意向</div>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; color: #334155;">
          <div><span style="color: #64748b;">职位：</span><strong>${intent.desiredPosition || p.jobTitle}</strong></div>
          <div><span style="color: #64748b;">期望薪资：</span><strong style="color: #0071e3;">${intent.desiredSalary || '面议'}</strong></div>
          <div><span style="color: #64748b;">城市：</span>${intent.desiredCity || p.location}</div>
          <div><span style="color: #64748b;">状态：</span>${intent.jobStatus || '随时到岗'}</div>
        </div>
      </div>
    `;
  }

  if (resume.summary) {
    html += `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 14px; font-weight: 700; color: #0f172a; border-bottom: 1.5px solid #0071e3; padding-bottom: 4px; margin-bottom: 10px;">个人总结与核心优势</div>
        <div style="font-size: 12px; color: #334155; white-space: pre-line; line-height: 1.7;">${resume.summary.replace(/[#*`>-]/g, '').trim()}</div>
      </div>
    `;
  }

  if (resume.workExperience && resume.workExperience.length > 0) {
    html += `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 14px; font-weight: 700; color: #0f172a; border-bottom: 1.5px solid #0071e3; padding-bottom: 4px; margin-bottom: 10px;">工作经历</div>
        ${resume.workExperience.map(exp => `
          <div style="margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; color: #0f172a;">
              <span>${exp.company} <span style="font-weight: 500; color: #475569;">| ${exp.position}</span></span>
              <span style="font-size: 11px; color: #64748b; font-family: monospace;">${exp.startDate} ~ ${exp.endDate}</span>
            </div>
            ${exp.department ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">${exp.department} ${exp.location ? '· ' + exp.location : ''}</div>` : ''}
            <ul style="margin: 6px 0 0 16px; padding: 0; font-size: 12px; color: #334155;">
              ${exp.highlights.map(h => `<li style="margin-bottom: 3px;">${h}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
    `;
  }

  if (resume.projects && resume.projects.length > 0) {
    html += `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 14px; font-weight: 700; color: #0f172a; border-bottom: 1.5px solid #0071e3; padding-bottom: 4px; margin-bottom: 10px;">重点项目</div>
        ${resume.projects.map(proj => `
          <div style="margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; color: #0f172a;">
              <span>${proj.name} <span style="font-weight: 500; color: #0071e3;">(${proj.role})</span></span>
              <span style="font-size: 11px; color: #64748b; font-family: monospace;">${proj.startDate} ~ ${proj.endDate}</span>
            </div>
            <div style="font-size: 11.5px; color: #475569; margin: 3px 0;">${proj.description}</div>
            <ul style="margin: 4px 0 0 16px; padding: 0; font-size: 12px; color: #334155;">
              ${proj.highlights.map(h => `<li style="margin-bottom: 3px;">${h}</li>`).join('')}
            </ul>
            <div style="font-size: 11px; color: #0071e3; margin-top: 4px;"><strong>技术栈：</strong>${proj.techStack.join(' · ')}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  if (resume.skills && resume.skills.length > 0) {
    html += `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 14px; font-weight: 700; color: #0f172a; border-bottom: 1.5px solid #0071e3; padding-bottom: 4px; margin-bottom: 10px;">专业技能</div>
        ${resume.skills.map(s => `
          <div style="font-size: 12px; margin-bottom: 4px; color: #334155;">
            <strong style="color: #0f172a;">${s.category}：</strong>${s.skills.join('、')}
          </div>
        `).join('')}
      </div>
    `;
  }

  if (resume.education && resume.education.length > 0) {
    html += `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 14px; font-weight: 700; color: #0f172a; border-bottom: 1.5px solid #0071e3; padding-bottom: 4px; margin-bottom: 10px;">教育背景</div>
        ${resume.education.map(edu => `
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: #334155; margin-bottom: 4px;">
            <span><strong style="color: #0f172a;">${edu.school}</strong> · ${edu.degree} (${edu.major})</span>
            <span style="color: #64748b; font-family: monospace;">${edu.startDate} ~ ${edu.endDate}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  if (resume.certificates && resume.certificates.length > 0) {
    html += `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 14px; font-weight: 700; color: #0f172a; border-bottom: 1.5px solid #0071e3; padding-bottom: 4px; margin-bottom: 10px;">证书与荣誉</div>
        <ul style="margin: 4px 0 0 16px; padding: 0; font-size: 12px; color: #334155;">
          ${resume.certificates.map(c => `<li><strong>${c.name}</strong> - ${c.issuer} (${c.date})</li>`).join('')}
        </ul>
      </div>
    `;
  }

  container.innerHTML = DOMPurify.sanitize(html);
  return container;
}

/**
 * 导出为高保真 PDF (.pdf) 文件
 * 支持传入 ResumeData，即使不在预览视图中也能自动在离屏沙箱中无损采样并导出
 */
export async function exportToPdf(resume: ResumeData, candidateName?: string): Promise<boolean> {
  let targetEl = document.getElementById('resume-document');
  let tempNode: HTMLDivElement | null = null;

  if (!targetEl) {
    tempNode = createOffscreenResumeNode(resume);
    document.body.appendChild(tempNode);
    targetEl = tempNode;
  }

  try {
    const canvas = await html2canvas(targetEl, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        // 导出时严格统一为浅色高保真主题，去除所有深色模式样式
        clonedDoc.documentElement.classList.remove('dark');
        clonedDoc.body.classList.remove('dark');
        const darkElements = clonedDoc.querySelectorAll('.dark');
        darkElements.forEach(el => el.classList.remove('dark'));

        const clonedResume = clonedDoc.getElementById('resume-document');
        if (clonedResume) {
          clonedResume.classList.remove('dark');
          clonedResume.style.backgroundColor = '#ffffff';
          clonedResume.style.color = '#0f172a';
          clonedResume.style.borderColor = '#e2e8f0';
          clonedResume.style.boxShadow = 'none';
        }
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210;
    const pageHeight = 297;
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // 绘制第一页
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // 跨页处理
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const name = candidateName || resume.personalInfo.fullName || '个人简历';
    const filename = `${name}_个人简历.pdf`;
    pdf.save(filename);
    return true;
  } catch (err) {
    console.error('Canvas PDF export failed, fallback to jsPDF native:', err);
    try {
      const pdf = new jsPDF('p', 'pt', 'a4');
      pdf.text(`${resume.personalInfo.fullName} - 个人简历`, 40, 50);
      pdf.text(`职位: ${resume.personalInfo.jobTitle} | 电话: ${resume.personalInfo.phone} | 邮箱: ${resume.personalInfo.email}`, 40, 75);
      const filename = `${candidateName || resume.personalInfo.fullName}_个人简历.pdf`;
      pdf.save(filename);
      return true;
    } catch {
      window.print();
      return false;
    }
  } finally {
    if (tempNode && tempNode.parentNode) {
      tempNode.parentNode.removeChild(tempNode);
    }
  }
}

/**
 * 生成 PDF 的 Blob 实例（用于邮件发送准备、附件分享或本地校验）
 */
export async function generatePdfBlob(resume: ResumeData, candidateName?: string): Promise<{ blob: Blob; filename: string } | null> {
  let targetEl = document.getElementById('resume-document');
  let tempNode: HTMLDivElement | null = null;

  if (!targetEl) {
    tempNode = createOffscreenResumeNode(resume);
    document.body.appendChild(tempNode);
    targetEl = tempNode;
  }

  try {
    const canvas = await html2canvas(targetEl, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        // 导出时严格统一为浅色高保真主题，去除所有深色模式样式
        clonedDoc.documentElement.classList.remove('dark');
        clonedDoc.body.classList.remove('dark');
        const darkElements = clonedDoc.querySelectorAll('.dark');
        darkElements.forEach(el => el.classList.remove('dark'));

        const clonedResume = clonedDoc.getElementById('resume-document');
        if (clonedResume) {
          clonedResume.classList.remove('dark');
          clonedResume.style.backgroundColor = '#ffffff';
          clonedResume.style.color = '#0f172a';
          clonedResume.style.borderColor = '#e2e8f0';
          clonedResume.style.boxShadow = 'none';
        }
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210;
    const pageHeight = 297;
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const name = candidateName || resume.personalInfo.fullName || '个人简历';
    const filename = `${name}_个人简历.pdf`;
    const blob = pdf.output('blob');
    return { blob, filename };
  } catch (err) {
    console.error('Failed to generate PDF blob:', err);
    return null;
  } finally {
    if (tempNode && tempNode.parentNode) {
      tempNode.parentNode.removeChild(tempNode);
    }
  }
}

/**
 * 调起浏览器系统原生打印窗口
 */
export function exportToNativePrint(): void {
  const wasDark = document.documentElement.classList.contains('dark');
  if (wasDark) {
    document.documentElement.classList.remove('dark');
  }

  window.print();

  if (wasDark) {
    // 调起打印后恢复当前深色主题
    setTimeout(() => {
      document.documentElement.classList.add('dark');
    }, 500);
  }
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
  const recipient = encodeURIComponent(params.recipientEmail.trim().replace(/[\r\n]/g, ''));
  return `mailto:${recipient}?subject=${subject}&body=${body}`;
}

/**
 * 导出可在不同 Resume Pilot 用户之间导入的无执行数据文件。
 */
export function exportToShareJson(resume: ResumeData): void {
  const payload = {
    format: 'resume-pilot.resume',
    version: 1,
    exportedAt: new Date().toISOString(),
    resume,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${resume.personalInfo.fullName || resume.title || '未命名简历'}_ResumePilot.resume.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
