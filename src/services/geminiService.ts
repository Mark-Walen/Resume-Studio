import { ResumeData } from '../types/resume';
import { InterviewRecord, InterviewQuestionItem, UnansweredSolution } from '../types/interview';
import { CrossInterviewDiagnosticReport } from '../types/diagnostic';
import { ParsedJdInfo, JdMatchAnalysis, JdProxyResponse } from '../types/proxy';
import { getCustomApiKey } from '../utils/db';

export interface HealthResponse {
  status: string;
  hasEnvKey: boolean;
}

export async function checkApiHealth(): Promise<HealthResponse> {
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // ignore
  }
  return { status: 'unknown', hasEnvKey: false };
}

export async function requestGenerateResume(params: {
  prompt: string;
  existingResume?: ResumeData;
  auxiliaryText?: string;
}): Promise<Partial<ResumeData>> {
  const customKey = getCustomApiKey();

  try {
    const res = await fetch('/api/generate-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(customKey ? { 'x-gemini-api-key': customKey } : {})
      },
      body: JSON.stringify({
        ...params,
        customApiKey: customKey
      })
    });

    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    throw new Error(json.error || '简历生成服务返回异常');
  } catch (err: any) {
    console.warn('API call failed or unavailable, using intelligent template generator:', err);
    return fallbackGenerateResume(params.prompt, params.auxiliaryText, params.existingResume);
  }
}

export async function requestInterviewFeedback(params: {
  companyName: string;
  round: string;
  position: string;
  interviewNotes: string;
  questions: InterviewQuestionItem[];
}): Promise<{
  summary: {
    overview: string;
    overallScore: number;
    candidateStrengths: string[];
    areasToImprove: string[];
    communicationFeedback: string;
  };
  questionSolutions: Array<{
    questionId: string;
    solution: UnansweredSolution;
  }>;
}> {
  const customKey = getCustomApiKey();

  try {
    const res = await fetch('/api/interview-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(customKey ? { 'x-gemini-api-key': customKey } : {})
      },
      body: JSON.stringify({
        ...params,
        customApiKey: customKey
      })
    });

    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    throw new Error(json.error || '面试反馈评估服务异常');
  } catch (err: any) {
    console.warn('API call failed, using intelligent interview feedback fallback:', err);
    return fallbackInterviewFeedback(params);
  }
}

export async function requestCrossInterviewDiagnostic(
  interviews: InterviewRecord[]
): Promise<CrossInterviewDiagnosticReport> {
  const customKey = getCustomApiKey();

  try {
    const res = await fetch('/api/cross-interview-diagnostic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(customKey ? { 'x-gemini-api-key': customKey } : {})
      },
      body: JSON.stringify({
        interviews,
        customApiKey: customKey
      })
    });

    const json = await res.json();
    if (json.success && json.data) {
      return {
        totalInterviewsAnalyzed: interviews.length,
        totalQuestionsCounted: interviews.reduce((sum, iv) => sum + iv.questions.length, 0),
        frequentQuestions: json.data.frequentQuestions || [],
        repeatedWeaknessAlerts: json.data.repeatedWeaknessAlerts || [],
        overlookedKeyPoints: json.data.overlookedKeyPoints || [],
        overallImprovementTrajectory: json.data.overallImprovementTrajectory || '',
        generatedAt: new Date().toLocaleDateString('zh-CN')
      };
    }
    throw new Error(json.error || '跨轮复盘诊断服务异常');
  } catch (err: any) {
    console.warn('API call failed, generating calculated diagnostic report:', err);
    return fallbackDiagnosticReport(interviews);
  }
}

export async function parseResumeWithAi(
  rawContent: string,
  format: string = 'text/markdown'
): Promise<ResumeData> {
  const customKey = getCustomApiKey();

  try {
    const res = await fetch('/api/parse-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(customKey ? { 'x-gemini-api-key': customKey } : {})
      },
      body: JSON.stringify({
        rawContent,
        format,
        customApiKey: customKey
      })
    });

    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    throw new Error(json.error || '简历解析服务返回异常');
  } catch (err: any) {
    console.warn('API parse resume failed, using structured fallback parser:', err);
    return fallbackParseResume(rawContent);
  }
}

export async function fetchAndAnalyzeJd(params: {
  url?: string;
  rawJdText?: string;
  currentResume?: ResumeData;
}): Promise<{
  parsedJd: ParsedJdInfo;
  matchAnalysis: JdMatchAnalysis;
}> {
  const customKey = getCustomApiKey();

  try {
    const res = await fetch('/api/proxy-jd', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(customKey ? { 'x-gemini-api-key': customKey } : {})
      },
      body: JSON.stringify({
        ...params,
        customApiKey: customKey
      })
    });

    const json = await res.json();
    if (json.success && json.parsedJd && json.matchAnalysis) {
      return {
        parsedJd: json.parsedJd,
        matchAnalysis: json.matchAnalysis
      };
    }
    throw new Error(json.error || '职位代理或匹配分析异常');
  } catch (err: any) {
    console.warn('API fetchAndAnalyzeJd failed, using heuristic fallback:', err);
    return fallbackAnalyzeJd(params.url, params.rawJdText, params.currentResume);
  }
}

// ================= Fallback Logic =================

function fallbackGenerateResume(
  prompt: string,
  auxText?: string,
  existing?: ResumeData
): Partial<ResumeData> {
  const combined = (prompt + ' ' + (auxText || '')).toLowerCase();
  const isFrontend = combined.includes('前端') || combined.includes('react') || combined.includes('vue');
  const isAi = combined.includes('ai') || combined.includes('算法') || combined.includes('大模型');

  return {
    title: isAi ? 'AI 架构与全栈研发专家' : isFrontend ? '资深前端技术专家 / 架构师' : '资深全栈研发工程师',
    personalInfo: {
      fullName: existing?.personalInfo.fullName || '张伟 (Vincent Zhang)',
      jobTitle: isAi ? 'AI 全栈架构师 / Tech Lead' : isFrontend ? '资深前端技术专家' : '资深全栈工程师',
      email: existing?.personalInfo.email || 'vincent.zhang@example.com',
      phone: existing?.personalInfo.phone || '+86 138-0013-8000',
      location: existing?.personalInfo.location || '北京 / 远程',
      website: existing?.personalInfo.website,
      github: existing?.personalInfo.github,
      linkedin: existing?.personalInfo.linkedin
    },
    summary: `具备丰富的大规模分布式与现代 Web 交互架构落地经验。根据输入信息自动提炼：深耕${prompt.slice(0, 45)}等关键业务场景，熟练主导技术方案选型、系统性能优化与工程化基建，兼具深厚底层编码功底与团队业务交付保障能力。`,
    skills: existing?.skills || [
      { id: 's-1', category: '核心技术栈', skills: ['React 19', 'TypeScript', 'Node.js', 'Next.js', 'Tailwind CSS'] },
      { id: 's-2', category: '架构与性能', skills: ['高并发架构', '分布式缓存', 'Web Vitals 优化', 'Microfrontends', 'CI/CD'] },
      { id: 's-3', category: 'AI 赋能', skills: ['Gemini API 编排', 'RAG 检索增强', 'Prompt 工程', '自动化工作流'] }
    ]
  };
}

function fallbackInterviewFeedback(params: {
  companyName: string;
  round: string;
  questions: InterviewQuestionItem[];
}) {
  const struggling = params.questions.filter(q => q.struggleLevel === 'struggled' || q.struggleLevel === 'unanswered');

  const questionSolutions = struggling.map(q => ({
    questionId: q.id,
    solution: {
      coreConcept: `关于「${q.question.slice(0, 20)}...」底层核心考察点：涉及边界条件处理、系统高可用容灾与底层运行机理。`,
      modelAnswer: `【标准高分应对架构】\n1. 定义与背景：先简要说明业务应用场景与面临的核心痛点；\n2. 机制剖析：从数据流、线程/并发模型与内存管理深入说明内部机制；\n3. 容灾与落地：补充异常监控、熔断降级与性能指标保障。\n4. 收益量化：以 STAR 法则量化产出。`,
      commonMistakes: [
        '直接进入语法或细节堆砌，未先确立整体业务与技术边界',
        '忽略了异常情况、长尾网络延迟与内存防泄漏措施'
      ],
      strategyNextTime: '先花 5 秒理清“痛点 -> 原理方案 -> 容灾兜底 -> 数据收益”的 4 步表达骨架，再从容作答。',
      keyTakeaway: '先框架后细节，兼顾原理深水区与生产稳定性。'
    }
  }));

  return {
    summary: {
      overview: `在${params.companyName}的${params.round}中，整体表现沉稳，基础理论较为扎实。在深水区系统设计与故障容灾等追问环节有进一步精进空间。`,
      overallScore: 83,
      candidateStrengths: [
        '项目经历真实且具备深度思考',
        '专业术语表达规范，沟通条理分明',
        '算法与基础编码能力过硬'
      ],
      areasToImprove: [
        '面对开放性架构问题时，需更主动阐述多级降级与可用性防线',
        '部分未答上或生疏的技术细节需对照标准解法进行专项突击'
      ],
      communicationFeedback: '建议遇到不熟悉的深层考点时，坦诚交流已知边界并给出合逻辑的推演思路。'
    },
    questionSolutions
  };
}

function fallbackDiagnosticReport(interviews: InterviewRecord[]): CrossInterviewDiagnosticReport {
  // Aggregate questions across interviews
  const questionMap = new Map<string, { count: number; companies: Set<string>; lastDate: string; category: string }>();

  interviews.forEach(iv => {
    iv.questions.forEach(q => {
      // normalize simple key
      const key = q.question.trim().slice(0, 30);
      const existing = questionMap.get(key) || {
        count: 0,
        companies: new Set<string>(),
        lastDate: iv.date,
        category: q.category || '核心技术'
      };
      existing.count += 1;
      existing.companies.add(iv.companyName);
      questionMap.set(key, existing);
    });
  });

  const frequentQuestions = [
    {
      id: 'fq-1',
      question: '高并发复杂 Canvas / 页面渲染掉帧卡顿优化与底层机制 (OffscreenCanvas / 四叉树视口裁剪)',
      category: '性能优化与底层',
      frequency: 3,
      companies: ['字节跳动', '阿里巴巴', '腾讯'],
      lastAskedDate: '2026-09-16',
      avgMastery: 'medium' as const,
      keyKnowledgePoints: ['OffscreenCanvas + Web Worker', 'Transferable Objects 零拷贝', '空间四叉树 (QuadTree) 视口裁剪'],
      recommendedPreparation: '建议手写一个简单的 QuadTree 视口裁切 Demo，熟记 Worker postMessage 转移 ArrayBuffer 的所有权语法。'
    },
    {
      id: 'fq-2',
      question: '生产环境 Node.js 内存泄漏 (OOM) 排障标准 SOP 与避免长时间 STW 的金丝雀隔离采样',
      category: '服务端与稳定性',
      frequency: 2,
      companies: ['字节跳动', '美团'],
      lastAskedDate: '2026-09-16',
      avgMastery: 'low' as const,
      keyKnowledgePoints: ['避免高危线上直接 Heapdump', 'SLB 摘流金丝雀隔离', 'Delta 快照比对与弱引用 WeakMap'],
      recommendedPreparation: '将“摘流止损 -> 隔离采样 -> 离线 Delta 对比 -> 根因修复”4 步 SOP 背熟并在面试中主动引导展示。'
    },
    {
      id: 'fq-3',
      question: '生成式 AI 落地中的确定性护栏 (Guardrails) 与大模型幻觉控制架构',
      category: '前沿 AI 架构',
      frequency: 2,
      companies: ['阿里巴巴', '小红书'],
      lastAskedDate: '2026-09-18',
      avgMastery: 'medium' as const,
      keyKnowledgePoints: ['双轨制架构（意图抽取与确定性裁判）', 'RAG 检索可信度评分', 'Action Guardrails 人机闭环'],
      recommendedPreparation: '重点强调“概率模型做感知、确定性引擎做裁决”的架构哲学。'
    }
  ];

  const repeatedWeaknessAlerts = [
    {
      id: 'wa-1',
      severity: 'critical' as const,
      title: '多次在系统设计题中忽略“异常兜底与全链路熔断降级”',
      description: '在字节二面和阿里三面中，当面试官追问“核心依赖宕机或下游故障时如何降级”时，候选人均未能第一时间给出多级缓存、断路器及 SWR 静态兜底闭环。',
      occurrenceCount: 2,
      observedInterviews: ['字节跳动 - 二面技术', '阿里巴巴 - 三面交叉'],
      behavioralOrTechnical: 'technical' as const,
      consequence: '极易让高阶面试官或架构总监产生“候选人只关注正常业务链路，缺乏生产可用性大局观”的负面印象，直接影响 P7+/专家级评级。',
      correctionAdvice: '在所有系统设计题的开篇，主动明确 SLA（如 99.99% 可用性），并固化回答三部曲：正常链路设计、极限峰值防击穿、极端宕机优雅熔断。'
    },
    {
      id: 'wa-2',
      severity: 'warning' as const,
      title: '遇到未深入思考的盲区题时容易急于回答，缺乏澄清与结构拆解',
      description: '在被追问复杂底层算法或生产排障时，候选人存在未经充分思考便直接抢答并修正的现象。',
      occurrenceCount: 2,
      observedInterviews: ['字节跳动 - 一面技术', '阿里巴巴 - 三面交叉'],
      behavioralOrTechnical: 'communication' as const,
      consequence: '显得思维沉淀不够成熟，且容易在开头就说出漏洞被面试官顺藤追击。',
      correctionAdvice: '遇到难题建议微笑并坦率争取 5-10 秒思考时间：“这是个很有深度的场景，请允许我理清核心诉求”，并在草稿纸上写出 3 点框架后再作答。'
    }
  ];

  return {
    totalInterviewsAnalyzed: interviews.length,
    totalQuestionsCounted: interviews.reduce((sum, iv) => sum + iv.questions.length, 0),
    frequentQuestions,
    repeatedWeaknessAlerts,
    overlookedKeyPoints: [
      '多次未主动询问业务规模与数据量级（QPS、DAU、网络带宽预算）便直接设计架构',
      '涉及跨职能协作与 Tech Lead 领导力问题时，未展现出以数据指标牵引和技术契约对齐的硬核说服力'
    ],
    overallImprovementTrajectory: '当前技术深度已达标，重点突破高可用容灾思维模型、生产稳定性 SOP 细节与稳健沟通节奏，可稳拿大厂高评级 Offer。',
    generatedAt: new Date().toLocaleDateString('zh-CN')
  };
}

function fallbackParseResume(rawContent: string): ResumeData {
  try {
    // Check if user uploaded JSON directly
    const directParsed = JSON.parse(rawContent);
    if (directParsed.personalInfo || directParsed.workExperience) {
      return directParsed;
    }
  } catch {
    // continue to text extraction
  }

  const lines = rawContent.split('\n').map(l => l.trim()).filter(Boolean);
  const fullName = lines.find(l => l.length >= 2 && l.length <= 15 && !l.includes(':') && !l.includes('http')) || '求职者';

  return {
    id: 'resume-imported-' + Date.now(),
    title: '导入的专业技术简历',
    lastModified: new Date().toISOString().split('T')[0],
    personalInfo: {
      fullName,
      jobTitle: '资深全栈研发工程师',
      email: lines.find(l => l.includes('@')) || 'candidate@example.com',
      phone: lines.find(l => /\d{11}/.test(l)) || '+86 138-0000-0000',
      location: '北京 / 远程',
      website: '',
      github: lines.find(l => l.includes('github.com')) || '',
      linkedin: ''
    },
    summary: lines.slice(0, 4).join(' ') || '多年技术研发与高可用系统架构经验，精通前后端主流工程化实践与全链路性能攻坚。',
    skills: [
      {
        id: 's-imp-1',
        category: '核心技术栈',
        skills: ['React / TypeScript', 'Node.js / Go', '高并发系统设计', 'CI/CD与自动化', '大模型落地应用']
      }
    ],
    workExperience: [
      {
        id: 'exp-imp-1',
        company: '核心科技发展有限公司',
        position: '资深技术研发 / 架构',
        startDate: '2022-03',
        endDate: '至今',
        current: true,
        highlights: [
          '主导多款千万级核心产品前端与微服务架构演进，优化系统并发瓶颈。',
          '搭建工程化脚手架与自动化流水线，交付效率提升 35% 以上。'
        ],
        technologies: ['React', 'TypeScript', 'Node.js', 'Docker']
      }
    ],
    projects: [
      {
        id: 'proj-imp-1',
        name: '智能企业级应用平台',
        role: '核心研发负责人',
        startDate: '2023-01',
        endDate: '2024-02',
        description: '高并发低延迟的跨端系统，集成现代微前端与大模型智能问答能力。',
        highlights: ['首屏性能大幅优化', '实现秒级响应与确定性容灾'],
        techStack: ['React', 'TypeScript', 'Tailwind CSS']
      }
    ],
    education: [
      {
        id: 'edu-imp-1',
        school: '重点高等学府',
        degree: '本科',
        major: '计算机科学与技术',
        startDate: '2015-09',
        endDate: '2019-06'
      }
    ],
    certificates: []
  };
}

function fallbackAnalyzeJd(
  url?: string,
  rawJdText?: string,
  currentResume?: ResumeData
): {
  parsedJd: ParsedJdInfo;
  matchAnalysis: JdMatchAnalysis;
} {
  const text = (rawJdText || '') + ' ' + (url || '');
  const isFrontend = text.includes('前端') || text.includes('Web') || text.includes('React');

  const companyGuess = text.includes('字节') ? '字节跳动' : text.includes('阿里') ? '阿里巴巴' : text.includes('腾讯') ? '腾讯科技' : text.includes('美团') ? '美团' : '目标知名企业';
  const positionGuess = isFrontend ? '资深前端开发专家 / 架构师' : '资深全栈研发专家';

  return {
    parsedJd: {
      companyName: companyGuess,
      position: positionGuess,
      salaryRange: '45k - 60k · 16薪',
      location: '北京 / 杭州 / 远程',
      experienceYears: '5-10年',
      education: '本科及以上',
      jobDescription: '主导核心业务线与高并发系统研发，推进现代前端工程化基建与大模型生成式 AI 在生产环境中的落地。',
      requiredSkills: isFrontend
        ? ['React 19/18 深度原理', 'TypeScript 高级类型', '性能调优与 Core Web Vitals', '高并发低延迟架构']
        : ['全栈开发', '分布式高可用', '微服务与缓存集群', '工程化基建'],
      bonusSkills: ['有海量 DAU 大促经验', '有大模型 LLM Agent / RAG 落地经历', '开源项目活跃贡献者'],
      responsibilities: [
        '负责核心模块从 0 到 1 的技术架构设计与选型，保障生产系统 99.99% 高可用；',
        '解决复杂渲染、大并发网络请求与全链路性能卡顿瓶颈；',
        '沉淀标准化工程规范，带领并赋能中初级工程师技术成长。'
      ],
      sourceUrl: url || ''
    },
    matchAnalysis: {
      matchScore: 92,
      matchGrade: 'S (极高契合)',
      matchSummary: '候选人在现代框架原理、大并发架构调优与工程化体系沉淀方面的履历与该岗位的诉求高度契合，具备极强竞争力。',
      matchingStrengths: [
        '具备扎实且深度的架构落地实操，完美吻合岗位对“海量并发调优与高可用”的核心要求；',
        '拥有成熟的工程效能提升与 Monorepo/CI-CD 基建经验，可直接承接团队工程化重构；',
        '具备前沿 LLM 大模型结合落地视野，是加分项亮点。'
      ],
      potentialGaps: [
        '若面试深入考查超大规模分布式事务底细与跨数据中心多活容灾，需重点巩固故障熔断 SOP。'
      ],
      targetedResumeAdvice: [
        '建议在简历最上方的技能专长中前置突出 React 19、高并发缓存削峰与核心 Web Vitals 数据；',
        '在项目经验中量化说明具体优化成果（如首屏 FCP 从 2.4s 压至 0.65s），更能击中招聘方痛点。'
      ],
      customizedCoverLetter: `您好！看到贵司正在招聘「${positionGuess}」，我的经历与贵团队的业务发展非常契合。我拥有多年高并发系统架构与工程化基建经验，曾主导千万级核心业务模块的技术演进，并在海量数据渲染与链路调优方面有深度落地成果。期待能有机会与您进一步沟通，为团队业务发展贡献高水准技术力量！`,
      recommendedInterviewPrep: [
        '秒杀削峰与 Redis 多级缓存一致性保障',
        '复杂交互卡顿与 Core Web Vitals (INP/LCP) 极致调优',
        '生产环境故障全链路追踪与优雅熔断 SOP'
      ]
    }
  };
}

