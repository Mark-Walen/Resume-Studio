import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

function readBody(req: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: any) => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

type ProviderId = 'anthropic' | 'openai' | 'xai' | 'google' | 'deepseek' | 'zai' | 'custom';

const PROVIDER_BASE_URLS: Record<Exclude<ProviderId, 'custom'>, string> = {
  anthropic: 'https://api.anthropic.com/v1',
  openai: 'https://api.openai.com/v1',
  xai: 'https://api.x.ai/v1',
  google: 'https://generativelanguage.googleapis.com/v1beta',
  deepseek: 'https://api.deepseek.com',
  zai: 'https://api.z.ai/api/paas/v4',
};

type Compatibility = 'openai' | 'anthropic';

function getPublicCustomBaseUrl(rawUrl?: string): string {
  if (!rawUrl) throw new Error('请先填写自定义兼容服务的 Base URL。');
  const url = new URL(rawUrl);
  if (url.protocol !== 'https:') throw new Error('自定义兼容服务仅支持 HTTPS 地址。');
  const hostname = url.hostname.toLowerCase();
  const blockedIpv4 = /^(0|10|127|169\.254|192\.168)\./.test(hostname) || /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);
  if (hostname === 'localhost' || hostname === '::1' || hostname.endsWith('.local') || blockedIpv4) {
    throw new Error('自定义兼容服务不能使用本机或内网地址。');
  }
  return url.toString().replace(/\/$/, '');
}

function getAiClient(customKey?: string, provider: ProviderId = 'google', selectedModel?: string, compatibility: Compatibility = 'openai', customBaseUrl?: string) {
  const apiKey = customKey || process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('未检测到 AI 服务 API Key。请在“AI 服务与隐私设置”中配置个人密钥，或由部署方配置服务端密钥。');
  }
  if (provider === 'google') {
    const client = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
    return { models: { generateContent: (request: any) => client.models.generateContent({ ...request, model: selectedModel || request.model }) } };
  }

  return {
    models: {
      generateContent: async (request: any) => {
        const model = selectedModel || request.model;
        const systemInstruction = request.config?.systemInstruction || '';
        const wantsJson = request.config?.responseMimeType === 'application/json';
        const protocol = provider === 'custom' ? compatibility : provider;
        const baseUrl = provider === 'custom' ? getPublicCustomBaseUrl(customBaseUrl) : PROVIDER_BASE_URLS[provider];
        let response: Response;

        if (protocol === 'anthropic') {
          response = await fetch(`${baseUrl}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
            body: JSON.stringify({ model, max_tokens: 8192, system: systemInstruction, messages: [{ role: 'user', content: request.contents }] }),
          });
        } else {
          response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
            body: JSON.stringify({ model, messages: [{ role: 'system', content: systemInstruction }, { role: 'user', content: request.contents }], ...(wantsJson ? { response_format: { type: 'json_object' } } : {}) }),
          });
        }

        const payload: any = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload?.error?.message || payload?.message || `AI 服务请求失败（${response.status}）`);
        const text = protocol === 'anthropic' ? payload?.content?.map((item: any) => item.text || '').join('') : payload?.choices?.[0]?.message?.content;
        return { text: text || '' };
      },
    },
  };
}

function getProviderConfig(req: any): { provider: ProviderId; model?: string; compatibility: Compatibility; baseUrl?: string } {
  const rawProvider = String(req.headers['x-ai-provider'] || 'google') as ProviderId;
  const provider = (rawProvider in PROVIDER_BASE_URLS || rawProvider === 'custom') ? rawProvider : 'google';
  const compatibility = req.headers['x-ai-compatibility'] === 'anthropic' ? 'anthropic' : 'openai';
  return { provider, model: String(req.headers['x-ai-model'] || '') || undefined, compatibility, baseUrl: String(req.headers['x-ai-base-url'] || '') || undefined };
}

function getConfiguredAiClient(customKey: string | undefined, req: any) {
  const { provider, model, compatibility, baseUrl } = getProviderConfig(req);
  return getAiClient(customKey, provider, model, compatibility, baseUrl);
}

const apiPlugin: Plugin = {
  name: 'ai-service-api',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const url = req.url?.split('?')[0];

      // 1. Health check
      if (url === '/api/health' && req.method === 'GET') {
        const hasEnvKey = !!(process.env.AI_API_KEY || process.env.GEMINI_API_KEY);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ status: 'ok', hasEnvKey }));
        return;
      }

      // 2. Generate Resume
      if (url === '/api/generate-resume' && req.method === 'POST') {
        try {
          const body = await readBody(req);
          const customKey = (req.headers['x-ai-api-key'] as string) || (req.headers['x-gemini-api-key'] as string) || body.customApiKey;
          const ai = getConfiguredAiClient(customKey, req);

          const { prompt, existingResume, auxiliaryText } = body;

          const systemPrompt = `你是一位顶级技术猎头兼资深架构师简历专家。
根据用户提供的经历描述（可能来自语音转文字）、现有简历和通过安全杀毒扫描的辅助材料，生成一份结构完整、用词专业、量化成果突出的简历数据。
严格返回合法 JSON，格式如下：
{
  "title": "简历标题（如：嵌入式软件开发工程师）",
  "personalInfo": {
    "fullName": "姓名",
    "jobTitle": "求职岗位",
    "email": "邮箱",
    "phone": "电话",
    "location": "城市",
    "website": "",
    "github": "",
    "linkedin": ""
  },
  "summary": "专业总结（3-4句话，包含核心优势与工程视野）",
  "skills": [
    { "id": "s-1", "category": "分类名称", "skills": ["技能1", "技能2"] }
  ],
  "workExperience": [
    {
      "id": "w-1",
      "company": "公司名称",
      "position": "岗位",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM 或 至今",
      "current": false,
      "highlights": ["重点产出1（包含具体指标与STAR原则）", "重点产出2"],
      "technologies": ["技术1", "技术2"]
    }
  ],
  "projects": [
    {
      "id": "p-1",
      "name": "项目名称",
      "role": "主导角色",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "description": "项目简要背景",
      "highlights": ["核心技术攻坚点", "可量化收益"],
      "techStack": ["C/C++", "FreeRTOS", "STM32"]
    }
  ],
  "education": [
    {
      "id": "e-1",
      "school": "学校名称",
      "degree": "学历",
      "major": "专业",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "gpa": "",
      "honors": []
    }
  ],
  "certificates": []
}`;

          const userContent = `【用户需求与背景经历】：
${prompt || '请基于提供的背景优化完善简历'}

${auxiliaryText ? `【辅助资料/项目材料提取内容】：\n${auxiliaryText}\n` : ''}
${existingResume ? `【参考现有简历】：\n${JSON.stringify(existingResume).slice(0, 4000)}\n` : ''}`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: userContent,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          });

          const rawText = response.text || '{}';
          const parsed = JSON.parse(rawText);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, data: parsed }));
        } catch (err: any) {
          console.error('Error generating resume:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: err.message || '生成简历失败' }));
        }
        return;
      }

      // 3. Interview Feedback & Unanswered Questions Solution
      if (url === '/api/interview-feedback' && req.method === 'POST') {
        try {
          const body = await readBody(req);
          const customKey = (req.headers['x-ai-api-key'] as string) || (req.headers['x-gemini-api-key'] as string) || body.customApiKey;
          const ai = getConfiguredAiClient(customKey, req);

          const { companyName, round, position, interviewNotes, questions } = body;

          const systemPrompt = `你是一位国内一线互联网大厂资深面试官。
请深入分析本次面试记录、现场面经及问答情况：
1. 输出本次面试总体摘要评价、综合打分（0-100分）、候选人展现的亮点优势、待提升的关键短板，以及现场沟通表达评价。
2. 尤其对候选人【未答上 (unanswered)】或【表现不佳/答得一般 (struggled/average)】的题目，提供一份极为详尽、可直接落地的解题方案：
   - 核心考点剖析 (面试官底层到底在考察什么？)
   - 标准高分回答 (STAR结构/步骤化架构推演)
   - 常见误区与避坑指南 (绝大多数候选人踩雷的点)
   - 下次遇到类似问题的应对策略 (一秒建立逻辑框架的方法)
   - 一句话核心总结

严格输出如下结构的合法 JSON：
{
  "summary": {
    "overview": "面试整体总结回顾",
    "overallScore": 85,
    "candidateStrengths": ["亮点1", "亮点2"],
    "areasToImprove": ["需要提升点1", "需要提升点2"],
    "communicationFeedback": "沟通反馈"
  },
  "questionSolutions": [
    {
      "questionId": "对应传入的题目id",
      "solution": {
        "coreConcept": "核心考点剖析",
        "modelAnswer": "标准高分回答",
        "commonMistakes": ["误区1", "误区2"],
        "strategyNextTime": "下次应对策略",
        "keyTakeaway": "一句话核心总结"
      }
    }
  ]
}`;

          const content = `面试公司: ${companyName}
面试轮次: ${round}
目标岗位: ${position}
现场面经与回顾:
${interviewNotes || '无特殊面经记录'}

面试问题列表与候选人掌握情况:
${JSON.stringify(questions, null, 2)}`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: content,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          });

          const rawText = response.text || '{}';
          const parsed = JSON.parse(rawText);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, data: parsed }));
        } catch (err: any) {
          console.error('Error generating interview feedback:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: err.message || '生成面试反馈失败' }));
        }
        return;
      }

      // 4. Cross-interview Diagnostic Engine
      if (url === '/api/cross-interview-diagnostic' && req.method === 'POST') {
        try {
          const body = await readBody(req);
          const customKey = (req.headers['x-ai-api-key'] as string) || (req.headers['x-gemini-api-key'] as string) || body.customApiKey;
          const ai = getConfiguredAiClient(customKey, req);

          const { interviews } = body;

          const systemPrompt = `你是一位高阶技术总监兼候选人面试复盘教练。
用户经过了多轮/多家公司的面试，请深度对比分析所有面试记录：
1. 聚合统计高频面试考点 (Frequent Questions)：找出被重复考查的技术/行为问题，统计频次，评估平均掌握度，给出复习备战建议。
2. 识别候选人多次出现的【不当表现】或【未关注的关键盲区】(Repeated Weakness & Blindspots)：
   - 必须严肃且具有建设性地给予提醒，引起用户高度重视！
   - 明确指出严重程度 (critical: 致命红线 / warning: 显著丢分点 / notice: 建议优化)、发生过的场次、带来的负面影响，以及纠偏整改行动。
3. 归纳用户多次未关注的重点及综合提升路径。

严格输出合法 JSON：
{
  "frequentQuestions": [
    {
      "id": "fq-1",
      "question": "高频问题名称",
      "category": "分类",
      "frequency": 2,
      "companies": ["公司A", "公司B"],
      "lastAskedDate": "2026-09-18",
      "avgMastery": "low 或 medium 或 high",
      "keyKnowledgePoints": ["考点1", "考点2"],
      "recommendedPreparation": "具体突击准备指导"
    }
  ],
  "repeatedWeaknessAlerts": [
    {
      "id": "wa-1",
      "severity": "critical",
      "title": "不当表现/盲区标题",
      "description": "详细问题描述",
      "occurrenceCount": 2,
      "observedInterviews": ["场次1", "场次2"],
      "behavioralOrTechnical": "technical",
      "consequence": "负面影响",
      "correctionAdvice": "立刻采取的纠偏步骤"
    }
  ],
  "overlookedKeyPoints": [
    "被用户反复忽略的重要关注点1",
    "被用户反复忽略的重要关注点2"
  ],
  "overallImprovementTrajectory": "系统性改进建议"
}`;

          const content = `以下是用户多轮面试全量记录：
${JSON.stringify(interviews, null, 2)}`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: content,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          });

          const rawText = response.text || '{}';
          const parsed = JSON.parse(rawText);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, data: parsed }));
        } catch (err: any) {
          console.error('Error generating diagnostic:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: err.message || '跨轮复盘诊断失败' }));
        }
        return;
      }

      // 5. Parse and Import Resume from Raw Text / Document
      if (url === '/api/parse-resume' && req.method === 'POST') {
        try {
          const body = await readBody(req);
          const customKey = (req.headers['x-ai-api-key'] as string) || (req.headers['x-gemini-api-key'] as string) || body.customApiKey;
          const ai = getConfiguredAiClient(customKey, req);

          const { rawContent, format } = body;
          if (!rawContent || typeof rawContent !== 'string' || rawContent.trim().length === 0) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: '请提供待解析的简历内容' }));
            return;
          }

          const systemPrompt = `你是一位顶级求职顾问兼简历结构化解析专家。
你的任务是将用户导入的各种非结构化或半结构化简历文本（包含 PDF文本、Word文本、Markdown 或 JSON 等），
精准解析、纠错并归纳为标准的 ResumeData JSON 结构。
严格输出标准 JSON 格式，不含任何包裹字符：
{
  "id": "resume-imported-auto",
  "title": "简历标题（如：嵌入式软件开发工程师）",
  "lastModified": "2026-09-21",
  "personalInfo": {
    "fullName": "姓名",
    "jobTitle": "期望职位",
    "email": "邮箱",
    "phone": "电话",
    "location": "城市/地点",
    "website": "个人主页或博客",
    "github": "GitHub主页",
    "linkedin": "领英主页"
  },
  "summary": "个人专业综述与核心价值",
  "skills": [
    {
      "id": "s-1",
      "category": "技能模块名称（如：前端工程与框架、后端服务与并发、DevOps等）",
      "skills": ["技能1", "技能2"]
    }
  ],
  "workExperience": [
    {
      "id": "exp-1",
      "company": "公司名称",
      "position": "担任职位",
      "department": "部门（若有）",
      "location": "工作地点（若有）",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM 或 至今",
      "current": false,
      "highlights": [
        "成果亮点1（符合STAR原则与数据量化）",
        "成果亮点2"
      ],
      "technologies": ["核心技术栈1", "核心技术栈2"]
    }
  ],
  "projects": [
    {
      "id": "proj-1",
      "name": "项目名称",
      "role": "所任角色",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "description": "项目简述",
      "highlights": ["重点产出/攻坚成果1", "重点产出2"],
      "techStack": ["技术1", "技术2"],
      "link": "开源或演示链接（若有）"
    }
  ],
  "education": [
    {
      "id": "edu-1",
      "school": "院校名称",
      "degree": "学历（如学士、硕士）",
      "major": "专业",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "gpa": "GPA或排名（若有）",
      "honors": ["荣誉1"]
    }
  ],
  "certificates": [
    {
      "id": "cert-1",
      "name": "证书名称",
      "issuer": "颁发机构",
      "date": "YYYY-MM"
    }
  ]
}`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `以下是用户导入的原始简历文本（格式识别：${format || 'text/markdown'}）：\n\n${rawContent.slice(0, 16000)}`,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          });

          const rawJson = response.text || '{}';
          const parsedResume = JSON.parse(rawJson);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, data: parsedResume }));
        } catch (err: any) {
          console.error('Error parsing resume:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: err.message || '简历智能解析导入失败' }));
        }
        return;
      }

      // 6. Job Site Proxy & JD Parsing with Match Analysis
      if (url === '/api/proxy-jd' && req.method === 'POST') {
        try {
          const body = await readBody(req);
          const customKey = (req.headers['x-ai-api-key'] as string) || (req.headers['x-gemini-api-key'] as string) || body.customApiKey;
          const ai = getConfiguredAiClient(customKey, req);

          const { url: targetUrl, rawJdText, currentResume } = body;

          let fetchedHtmlOrText = '';

          // If URL is provided, fetch via server-side proxy
          if (targetUrl && typeof targetUrl === 'string' && targetUrl.startsWith('http')) {
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 8000);

              const fetchRes = await fetch(targetUrl, {
                signal: controller.signal,
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                },
              });
              clearTimeout(timeoutId);

              if (fetchRes.ok) {
                const html = await fetchRes.text();
                // Strip scripts, styles, and html tags
                fetchedHtmlOrText = html
                  .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                  .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                  .replace(/<(br|p|div|li|tr|h1|h2|h3|h4|h5|h6)[^>]*>/gi, '\n')
                  .replace(/<[^>]+>/g, ' ')
                  .replace(/&nbsp;/g, ' ')
                  .replace(/&amp;/g, '&')
                  .replace(/&lt;/g, '<')
                  .replace(/&gt;/g, '>')
                  .replace(/\n\s*\n/g, '\n')
                  .trim();
              }
            } catch (fetchErr: any) {
              console.warn('Direct fetch proxy failed or timed out:', fetchErr.message);
            }
          }

          // Combine fetched text with any raw JD text provided by the user
          const combinedJdSource = (rawJdText && rawJdText.trim().length > 0)
            ? rawJdText
            : (fetchedHtmlOrText || '');

          if (!combinedJdSource || combinedJdSource.trim().length < 20) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              error: '未能从目标招聘网站直接提取出完整岗位信息（可能由于反爬虫验证或内网限制）。请直接将招聘网页中的 JD 文字复制并粘贴在输入框中，AI 仍可为您一键智能解析！'
            }));
            return;
          }

          const systemPrompt = `你是一位拥有大厂招聘经验的资深猎头总监兼技术面试官。
你的任务是：
1. 从给定的招聘岗位内容（可能来自网页爬虫提取的文本或用户粘贴的 JD）中提炼规范的企业与职位信息；
2. 对比候选人当前的简历数据，评估【匹配度得分 (0-100)】、【优势契合点】、【潜在风险缺口】、【定制化简历优化微调建议】、【针对该岗位的专属自荐求职信/开场白】以及【面试前须重点突击的针对性考点】。

严格输出合法 JSON，结构如下：
{
  "parsedJd": {
    "companyName": "公司名称（如：大疆、乐鑫科技，若未能提取写目标企业）",
    "position": "招聘职位全称",
    "salaryRange": "薪资范围（如：40k-60k · 16薪，未提写面议）",
    "location": "工作地点/城市",
    "experienceYears": "经验年限要求（如：5-10年）",
    "education": "学历要求（如：本科及以上）",
    "jobDescription": "岗位职责与核心任务精炼概述（150字以内）",
    "requiredSkills": ["核心硬性技能1", "核心硬性技能2"],
    "bonusSkills": ["加分技能1", "加分技能2"],
    "responsibilities": ["职责要点1", "职责要点2", "职责要点3"],
    "sourceUrl": "${targetUrl || ''}"
  },
  "matchAnalysis": {
    "matchScore": 88,
    "matchGrade": "S (极高契合) 或 A (高契合) 或 B (基本匹配) 或 C (跨度较大)",
    "matchSummary": "一句话客观精辟总结候选人与该岗位的契合度与竞争力",
    "matchingStrengths": [
      "优势契合点1：结合候选人实际项目或技能说明",
      "优势契合点2"
    ],
    "potentialGaps": [
      "潜在风险或技能短板1：提醒面试时可能被重点深挖的部分",
      "潜在风险2"
    ],
    "targetedResumeAdvice": [
      "简历优化建议1：投递该岗位前建议重点强化哪些关键词或数据指标",
      "简历优化建议2"
    ],
    "customizedCoverLetter": "专为该岗位定制的高情商求职打招呼/自荐信正文（200-300字，突出针对性价值，言辞干练自信）",
    "recommendedInterviewPrep": [
      "面试突击考点1：该岗位必问技术",
      "面试突击考点2"
    ]
  }
}`;

          const userPrompt = `【目标岗位 JD 内容】：
${combinedJdSource.slice(0, 10000)}

【候选人当前简历信息】：
${currentResume ? JSON.stringify(currentResume).slice(0, 8000) : '未提供具体简历，请根据常规高级技术人才画像评估'}`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: userPrompt,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          });

          const rawJson = response.text || '{}';
          const result = JSON.parse(rawJson);

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            rawTextLength: combinedJdSource.length,
            parsedJd: result.parsedJd,
            matchAnalysis: result.matchAnalysis,
          }));
        } catch (err: any) {
          console.error('Error in proxy-jd:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: err.message || '获取或解析职位信息失败' }));
        }
        return;
      }

      // 7. Recommend Knowledge Points based on Resume + Target Company JD
      if (url === '/api/recommend-knowledge-points' && req.method === 'POST') {
        try {
          const body = await readBody(req);
          const customKey = (req.headers['x-ai-api-key'] as string) || (req.headers['x-gemini-api-key'] as string) || body.customApiKey;
          const ai = getConfiguredAiClient(customKey, req);

          const { companyName, position, jobDescription, currentResume } = body;

          const systemPrompt = `你是一位精通各大互联网巨头（字节、阿里、腾讯、美团、微软、快手等）技术面风格的高级架构技术面试官兼求职导师。
根据用户提供的【即将面试的目标公司与岗位JD】以及【当前简历信息】：
1. 深入剖析该公司的技术风格画像（如：终端团队重 C/RTOS/驱动与系统调试，芯片团队重 SoC 外设、无线协议与低功耗，IoT 团队重设备接入、OTA 与可靠性）；
2. 对比候选人简历与该岗位需求，精准推荐 5-8 个最需要重点突击的核心知识点与考题；
3. 为每个考点标明紧急度（critical: 必考高危 / high: 核心重点 / bonus: 加分亮点），明确指出“为什么针对这家公司必考”、该公司的特有考察侧重点，以及面试前30分钟速记要点与翻车避坑指南。

严格输出合法 JSON 格式：
{
  "companyName": "${companyName || '目标公司'}",
  "position": "${position || '求职岗位'}",
  "companyTechProfile": "该企业的技术文化与面试风格特征剖析（80-150字）",
  "coreRequirementsSummary": "岗位核心硬性诉求精炼",
  "overallMatchScore": 86,
  "recommendations": [
    {
      "id": "rec-1",
      "title": "考点名称（如：分布式双写一致性与Canal方案）",
      "category": "backend / frontend / algorithm / system_design / ai_fullstack",
      "urgency": "critical",
      "matchReason": "为什么针对该岗位此考点是面试焦点？",
      "companySpecificFlavor": "该公司面试官最爱追问的独特切入角度",
      "interviewTrapWarning": "绝大多数候选人容易踩坑答错的点",
      "keyPreparationAction": "面试前务必牢记的3句话标准回答框架"
    }
  ]
}`;

          const userContent = `【目标面试公司】：${companyName}
【目标岗位】：${position}
【岗位 JD 描述】：
${jobDescription || '未提供详细JD，请基于该公司同类高级研发岗常见考察标准推荐'}

【候选人当前简历】：
${currentResume ? JSON.stringify(currentResume).slice(0, 7000) : '常规高级全栈架构师人才画像'}`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: userContent,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          });

          const rawJson = response.text || '{}';
          const parsed = JSON.parse(rawJson);

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            data: {
              ...parsed,
              generatedAt: new Date().toISOString(),
            }
          }));
        } catch (err: any) {
          console.error('Error in recommend-knowledge-points:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: err.message || '知识点智能推荐失败' }));
        }
        return;
      }

      // 8. Multi-Company Targeted Resume Optimizer (1 to 3 Companies)
      if (url === '/api/multi-company-resume-optimizer' && req.method === 'POST') {
        try {
          const body = await readBody(req);
          const customKey = (req.headers['x-ai-api-key'] as string) || (req.headers['x-gemini-api-key'] as string) || body.customApiKey;
          const ai = getConfiguredAiClient(customKey, req);

          const { companies, currentResume } = body;

          if (!companies || !Array.isArray(companies) || companies.length === 0) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: '请至少提供 1 家期望公司的 JD，最多支持同时添加 3 家公司' }));
            return;
          }

          const systemPrompt = `你是一位顶级科技猎头顾问兼技术简历精修专家。
用户希望根据 1 至 3 家重点期望公司的 Job Description (JD)，结合候选人的工作经历以及求学经历，进行针对性的精细化定制与差异化优化。

请完成以下核心分析：
1. 【横向对比总结】分析这几家公司在技术选型、架构侧重点、业务文化上的异同；
2. 【分公司精细优化建议】：针对每家目标企业：
   - 计算匹配度评分 (0-100) 与评级 (S/A/B/C)；
   - 提取该公司的核心技术倾向（如：对 C/C++ 基础、RTOS 并发、外设驱动、无线协议、Bootloader/OTA 与硬件调试的不同偏好）；
   - 【工作经历改写指导】：选取候选人最具代表性的工作/项目经历，针对该公司 JD 的关键词提供【量化 STAR 改写范例】，明确改写理由；
   - 【求学经历包装建议】：深度结合候选人的学历、专业、核心课程、学术研究/论文或毕业设计，指导如何讲好“从高校学术思维到工业级工程实战”的故事，贴合该公司对应职位的诉求；
   - 必须在简历中强化的核心关键词清单；
   - 针对该公司的定制化投递打招呼自荐亮点（高情商自荐信）。

严格输出合法 JSON 格式：
{
  "overallCrossComparison": "2-3 家公司侧重点横向差异对比概述（150-250字）",
  "generalAdvice": "通用提升建议",
  "companies": [
    {
      "companyName": "公司名",
      "position": "岗位名",
      "matchScore": 88,
      "matchGrade": "S 或 A 或 B",
      "keyTechFlavors": ["侧重点1", "侧重点2"],
      "workExperienceSuggestions": [
        {
          "companyOrRole": "某段工作经历/项目",
          "originalFocus": "原简历侧重点",
          "recommendedRewrite": "针对该公司 JD 量身打造的 STAR 精修改写版（包含量化指标与核心技术词）",
          "reason": "为什么这样改能切中该公司的痛点"
        }
      ],
      "educationFramingAdvice": {
        "schoolAndDegree": "院校与学历",
        "framingStrategy": "求学经历叙事策略",
        "recommendedCourseHighlights": ["相关课程或研究方向1", "方向2"],
        "academicStorytelling": "如何结合学术背景展现底层逻辑与快速学习能力"
      },
      "essentialKeywords": ["高频词1", "高频词2", "高频词3"],
      "tailoredElevatorPitch": "针对该公司的30秒高价值自荐话术"
    }
  ]
}`;

          const userContent = `【目标期望公司列表（最多3家）】：
${JSON.stringify(companies.slice(0, 3), null, 2)}

【候选人当前工作经历与求学经历】：
${JSON.stringify({
  workExperience: currentResume?.workExperience || [],
  education: currentResume?.education || [],
  projects: currentResume?.projects || [],
  skills: currentResume?.skills || []
}, null, 2)}`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: userContent,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: 'application/json',
              temperature: 0.25,
            },
          });

          const rawJson = response.text || '{}';
          const parsed = JSON.parse(rawJson);

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            data: {
              ...parsed,
              generatedAt: new Date().toISOString(),
            }
          }));
        } catch (err: any) {
          console.error('Error in multi-company-resume-optimizer:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: err.message || '多公司精细化简历优化分析失败' }));
        }
        return;
      }

      // 9. Convert Work Daily Journal into Evidence-backed Resume Bullets
      if (url === '/api/convert-journal-to-resume-bullets' && req.method === 'POST') {
        try {
          const body = await readBody(req);
          const customKey = (req.headers['x-ai-api-key'] as string) || (req.headers['x-gemini-api-key'] as string) || body.customApiKey;
          const ai = getConfiguredAiClient(customKey, req);

          const { journalLogs, targetRole, existingResume } = body;

          if (!journalLogs || !Array.isArray(journalLogs) || journalLogs.length === 0) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: '请选择至少一条工作日报记录进行提炼' }));
            return;
          }

          const systemPrompt = `你是一位高阶技术总监兼技术简历专家。
用户的目标是：“让真实经历变成有据可查、无法造假的高价值简历”。
根据用户平时的【工作日报记录】（包含完成任务、攻坚挑战、量化数据、技术栈及证据链）：
1. 提炼出可以直接补充进【工作经历 (workExperience)】或【核心项目 (projects)】的专业简历亮点语句 (Bullet Points)；
2. 每条语句必须严格遵循 STAR 原则：
   - 动词开头（如：主导架构、攻关重构、自研实现）
   - 量化指标驱动（如：延时降低 65%、吞吐量提升 8 倍、发布耗时缩减至 42 秒）
   - 紧密绑定真实业务场景与技术选型；
3. 标注溯源日期与 STAR 拆解。

严格输出合法 JSON 格式：
{
  "summary": "提炼总结：根据这些工作日报，突出的核心工程能力画像（80字以内）",
  "recommendedTechnologies": ["提取的高频关键技术栈1", "技术2"],
  "suggestedBullets": [
    {
      "id": "bullet-1",
      "targetSection": "workExperience",
      "companyOrProjectTarget": "推荐归属的项目或工作经历名称",
      "bulletText": "负责 BLE 到 UART 的 OTA 数据通路，针对无线分包、Flash 写入与掉电恢复问题，采用 FreeRTOS 事件驱动、双槽镜像与完整性校验完成升级闭环，并通过链路和回滚测试验证可靠性。",
      "starBreakdown": {
        "situation": "OTA 数据需要跨 BLE 与 UART 传输，并覆盖分包、Flash 写入和异常断电场景",
        "task": "完成可恢复、可校验的双镜像升级链路",
        "action": "采用 FreeRTOS 事件驱动、双槽镜像、完整性校验和自动化回滚测试",
        "result": "P99 延时由 820ms 降至 38ms（降幅95%），承载力提升8倍，零故障"
      },
      "evidenceSources": ["2026-09-18 日报"]
    }
  ]
}`;

          const userContent = `【目标期望求职岗位】：${targetRole || '资深工程师 / 架构师'}

【待提炼的工作日报记录】：
${JSON.stringify(journalLogs, null, 2)}

【候选人参考现有简历】：
${existingResume ? JSON.stringify({
  title: existingResume.title,
  skills: existingResume.skills,
  workExperience: existingResume.workExperience?.map((w: any) => ({ company: w.company, position: w.position })),
  projects: existingResume.projects?.map((p: any) => ({ name: p.name, role: p.role }))
}, null, 2) : '无'}`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: userContent,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: 'application/json',
              temperature: 0.25,
            },
          });

          const rawJson = response.text || '{}';
          const parsed = JSON.parse(rawJson);

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            data: parsed,
          }));
        } catch (err: any) {
          console.error('Error in convert-journal-to-resume-bullets:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: err.message || '工作日报提炼简历失败' }));
        }
        return;
      }


      next();
    });
  },
};

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiPlugin],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

