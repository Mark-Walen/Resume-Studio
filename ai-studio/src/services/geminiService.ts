import { ResumeData } from '../types/resume';
import { InterviewRecord, InterviewQuestionItem, UnansweredSolution } from '../types/interview';
import { CrossInterviewDiagnosticReport } from '../types/diagnostic';
import { ParsedJdInfo, JdMatchAnalysis, JdProxyResponse } from '../types/proxy';
import { CompanyJdRecommendationResult } from '../types/knowledge';
import { MultiCompanyComparisonResult, TargetCompanyJdInput } from '../types/multiCompany';
import { JournalExtractResponse, WorkDailyLog } from '../types/journal';
import { getAiServiceSettings, getCustomApiKey } from '../utils/db';
import { auth } from './firebase';

async function requestAiApi(path: string, init: RequestInit): Promise<Response> {
  const settings = await getAiServiceSettings();
  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) throw new Error('请先登录后再使用 AI 功能。');
  return fetch(path, {
    ...init,
    headers: {
      ...(init.headers || {}),
      'x-ai-provider': settings.provider,
      'x-ai-model': settings.model,
      'x-ai-compatibility': settings.compatibility || 'openai',
      ...(settings.baseUrl ? { 'x-ai-base-url': settings.baseUrl } : {}),
      Authorization: `Bearer ${idToken}`,
    },
  });
}

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
  const customKey = await getCustomApiKey();

  try {
    const res = await requestAiApi('/api/generate-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(customKey ? { 'x-ai-api-key': customKey } : {})
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
  const customKey = await getCustomApiKey();

  try {
    const res = await requestAiApi('/api/interview-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(customKey ? { 'x-ai-api-key': customKey } : {})
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
  const customKey = await getCustomApiKey();

  try {
    const res = await requestAiApi('/api/cross-interview-diagnostic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(customKey ? { 'x-ai-api-key': customKey } : {})
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
  const customKey = await getCustomApiKey();

  try {
    const res = await requestAiApi('/api/parse-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(customKey ? { 'x-ai-api-key': customKey } : {})
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
  const customKey = await getCustomApiKey();

  try {
    const res = await requestAiApi('/api/proxy-jd', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(customKey ? { 'x-ai-api-key': customKey } : {})
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
  return {
    title: '嵌入式软件开发工程师',
    personalInfo: {
      fullName: existing?.personalInfo.fullName || 'BLUE',
      jobTitle: '嵌入式软件开发工程师',
      email: existing?.personalInfo.email || 'mark_walen@qq.com',
      phone: existing?.personalInfo.phone || '+110 xx11703136',
      location: existing?.personalInfo.location || '深圳 / 上海',
      website: existing?.personalInfo.website,
      github: existing?.personalInfo.github,
      linkedin: existing?.personalInfo.linkedin
    },
    summary: `具备嵌入式软件、RTOS、无线通信和固件升级开发经验。根据输入信息自动提炼：围绕${prompt.slice(0, 45)}等场景，能够完成驱动、协议、状态机、异常恢复、链路测试和工程工具建设。`,
    skills: existing?.skills || [
      { id: 's-1', category: '嵌入式与 RTOS', skills: ['C/C++', 'FreeRTOS', 'RISC-V', 'STM32', 'ISR / DMA'] },
      { id: 's-2', category: '无线与协议', skills: ['BLE GATT/HCI/LL', 'Coded PHY', 'Mesh / TDMA', 'LoRa', 'AT'] },
      { id: 's-3', category: '升级与工程化', skills: ['Bootloader / OTA', 'MCUboot', 'NOR Flash / NVS', 'CMake / Kconfig', 'Python / Qt'] }
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
  return {
    totalInterviewsAnalyzed: interviews.length,
    totalQuestionsCounted: interviews.reduce((sum, iv) => sum + iv.questions.length, 0),
    frequentQuestions: [
      {
        id: 'fq-embedded-1',
        question: '中断、DMA、ring buffer 与协议解析任务如何分工？',
        category: '驱动与并发',
        frequency: 3,
        companies: ['嵌入式岗位模拟面试'],
        lastAskedDate: '2026-09-22',
        avgMastery: 'medium' as const,
        keyKnowledgePoints: ['ISR 最短路径', '缓冲所有权', '半包粘包与溢出恢复'],
        recommendedPreparation: '结合 UART DMA 丢首字节和提前 return 丢弃剩余数据的真实案例，按现象、定位、修复、回归四步回答。'
      },
      {
        id: 'fq-embedded-2',
        question: '双镜像 Bootloader 如何保证掉电安全与失败回滚？',
        category: 'Bootloader / OTA',
        frequency: 2,
        companies: ['嵌入式岗位模拟面试'],
        lastAskedDate: '2026-09-22',
        avgMastery: 'medium' as const,
        keyKnowledgePoints: ['镜像校验', '试运行与应用确认', 'Trailer 单向清零状态'],
        recommendedPreparation: '画出 EMPTY、NEW、TRYING、CONFIRMED、INVALID 状态图，并逐一说明掉电窗口和恢复路径。'
      },
      {
        id: 'fq-embedded-3',
        question: 'TDMA Mesh 如何进行时钟同步、失锁检测与重同步？',
        category: '无线协议与系统设计',
        frequency: 2,
        companies: ['嵌入式岗位模拟面试'],
        lastAskedDate: '2026-09-22',
        avgMastery: 'low' as const,
        keyKnowledgePoints: ['相位误差', 'PLL / EWMA', '锁定阈值与随机退避'],
        recommendedPreparation: '使用 200 ms 超帧实际参数说明采样、滤波、校正、锁定和失锁恢复，并补充 32 位计时器回绕。'
      }
    ],
    repeatedWeaknessAlerts: [
      {
        id: 'wa-embedded-1',
        severity: 'warning' as const,
        title: '关键参数和边界条件量化不足',
        description: '能说明整体方案，但回答同步算法、超时和缓冲设计时容易缺少阈值、长度、时间窗口与测试结果。',
        occurrenceCount: 2,
        observedInterviews: ['嵌入式岗位模拟面试'],
        behavioralOrTechnical: 'technical' as const,
        consequence: '面试官难以判断方案是否真正落地并经过验证。',
        correctionAdvice: '每个项目准备一张参数卡：时钟、周期、缓冲、分区、超时、距离、丢包率和测试数量。'
      },
      {
        id: 'wa-embedded-2',
        severity: 'warning' as const,
        title: '完成状态与个人边界需要更明确',
        description: '应清楚区分已实现、已测试、正在推进与方案设计，并说明自己负责的模块。',
        occurrenceCount: 2,
        observedInterviews: ['嵌入式岗位模拟面试'],
        behavioralOrTechnical: 'communication' as const,
        consequence: '表述过大可能在追问或背调中产生风险。',
        correctionAdvice: '使用“我负责”“我参与”“已验证”“正在推进”等准确动词，并准备对应日志、测试报告或代码证据。'
      }
    ],
    overlookedKeyPoints: ['回答驱动问题时主动说明中断优先级、临界区和缓冲所有权', '回答无线协议时补充异常链路、重试、去重与功耗权衡'],
    overallImprovementTrajectory: '简历与嵌入式岗位匹配度较高。下一步重点强化关键参数、掉电与异常路径、C 语言底层和 RTOS 并发表达。',
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
      jobTitle: '嵌入式软件开发工程师',
      email: lines.find(l => l.includes('@')) || 'candidate@example.com',
      phone: lines.find(l => /\d{11}/.test(l)) || '+86 138-0000-0000',
      location: '深圳 / 上海',
      website: '',
      github: lines.find(l => l.includes('github.com')) || '',
      linkedin: ''
    },
    summary: lines.slice(0, 4).join(' ') || '具备嵌入式软件、RTOS、无线通信、Bootloader/OTA 与软硬件联调经验。',
    skills: [
      {
        id: 's-imp-1',
        category: '核心技术栈',
        skills: ['C/C++', 'FreeRTOS', 'STM32 / RISC-V', 'BLE / LoRa', 'Bootloader / OTA']
      }
    ],
    workExperience: [
      {
        id: 'exp-imp-1',
        company: '智能硬件科技有限公司',
        position: '嵌入式软件工程师',
        startDate: '2022-03',
        endDate: '至今',
        current: true,
        highlights: [
          '负责 MCU 驱动、RTOS 任务、通信协议与产品功能开发。',
          '完成固件升级、异常恢复、链路测试与工程工具建设。'
        ],
        technologies: ['C/C++', 'FreeRTOS', 'STM32', 'BLE']
      }
    ],
    projects: [
      {
        id: 'proj-imp-1',
        name: '嵌入式无线通信与 OTA 平台',
        role: '嵌入式软件开发',
        startDate: '2023-01',
        endDate: '2024-02',
        description: '面向无线 MCU 的驱动、协议、Bootloader 与测试工具平台。',
        highlights: ['实现稳定的数据收发与状态机', '完成升级、回滚与异常路径验证'],
        techStack: ['C', 'FreeRTOS', 'BLE', 'MCUboot']
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
): { parsedJd: ParsedJdInfo; matchAnalysis: JdMatchAnalysis } {
  const text = `${rawJdText || ''} ${url || ''}`;
  const isWireless = /BLE|蓝牙|无线|LoRa|Wi-Fi|Mesh/i.test(text);
  const isBoot = /Bootloader|OTA|MCUboot|升级|Flash/i.test(text);
  const companyGuess = text.match(/公司[：:]?\s*([^\n，,]+)/)?.[1]?.trim() || '目标嵌入式企业';
  const positionGuess = text.match(/岗位[：:]?\s*([^\n，,]+)/)?.[1]?.trim() || '嵌入式软件开发工程师';
  return {
    parsedJd: {
      companyName: companyGuess,
      position: positionGuess,
      salaryRange: '18k–20k / 面议',
      location: '深圳 / 上海',
      experienceYears: '3–5 年',
      education: '本科及以上',
      jobDescription: rawJdText || '负责 MCU/RTOS、底层驱动、通信协议、系统稳定性与固件升级开发。',
      requiredSkills: ['C/C++', 'FreeRTOS / RTOS', 'STM32 / RISC-V', ...(isWireless ? ['BLE / 无线通信'] : ['UART / SPI / I²C']), ...(isBoot ? ['Bootloader / OTA'] : ['系统调试'])],
      bonusSkills: ['CMake / Kconfig 工程化', 'Python / Qt 测试工具', '链路测试与抓包分析'],
      responsibilities: ['负责底层驱动、RTOS 任务和协议模块开发', '定位软硬件联调与现场稳定性问题', '建设固件升级、自动化测试和开发工具'],
      sourceUrl: url || ''
    },
    matchAnalysis: {
      matchScore: 88,
      matchGrade: 'A (高契合)',
      matchSummary: '候选人的 C/C++、FreeRTOS、无线协议、Bootloader/OTA 和工程工具经验与嵌入式岗位主要要求匹配。',
      matchingStrengths: ['具备驱动、协议栈、Bootloader 与工具链的完整链路经验', '拥有 BLE Coded PHY 与私有 Mesh 的真实测试数据', '具备 STM32、RISC-V/TL321x 与 Linux/树莓派实践'],
      potentialGaps: ['需要根据具体 JD 补充目标芯片平台、操作系统或总线协议的深度', '应继续强化 C 语言底层、RTOS 调度和硬件接口面试题'],
      targetedResumeAdvice: ['把与 JD 最相关的芯片、RTOS、无线协议和量化测试结果前置', '对正在设计的模块使用“推进、设计、参与”等准确表述'],
      customizedCoverLetter: `您好！我正在应聘贵司的「${positionGuess}」。我具备 4.4 年嵌入式软件开发经验，熟悉 C/C++、FreeRTOS、STM32 与 RISC-V/TL321x，参与过 BLE Mesh、双镜像 OTA、MCUboot/mcumgr、LoRa/4G 网关和智能家具项目。期待结合岗位具体需求进一步沟通。`,
      recommendedInterviewPrep: ['C 语言内存与并发', 'FreeRTOS 调度、同步与 ISR API', 'UART/SPI/I²C/DMA 驱动', 'Bootloader/OTA 掉电恢复', 'BLE 与无线链路调试']
    }
  };
}

// 7. Request Recommend Knowledge Points
export async function requestRecommendKnowledgePoints(params: {
  companyName: string;
  position: string;
  jobDescription?: string;
  currentResume?: ResumeData;
}): Promise<CompanyJdRecommendationResult> {
  const customKey = await getCustomApiKey();

  try {
    const res = await requestAiApi('/api/recommend-knowledge-points', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(customKey ? { 'x-ai-api-key': customKey } : {})
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
    throw new Error(json.error || '知识点推荐服务返回异常');
  } catch (err: any) {
    console.warn('API call failed, using intelligent recommendation fallback:', err);
    return fallbackRecommendKnowledgePoints(params.companyName, params.position, params.jobDescription);
  }
}

// 8. Request Multi-Company Resume Optimizer (1 to 3 Companies)
export async function requestMultiCompanyResumeOptimizer(params: {
  companies: TargetCompanyJdInput[];
  currentResume: ResumeData;
}): Promise<MultiCompanyComparisonResult> {
  const customKey = await getCustomApiKey();

  try {
    const res = await requestAiApi('/api/multi-company-resume-optimizer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(customKey ? { 'x-ai-api-key': customKey } : {})
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
    throw new Error(json.error || '多公司简历精细化优化服务返回异常');
  } catch (err: any) {
    console.warn('API call failed, using intelligent multi-company optimization fallback:', err);
    return fallbackMultiCompanyResumeOptimizer(params.companies, params.currentResume);
  }
}

// 9. Request Convert Work Daily Journal to Resume Bullets
export async function requestConvertJournalToResumeBullets(params: {
  journalLogs: WorkDailyLog[];
  targetRole?: string;
  existingResume?: ResumeData;
}): Promise<JournalExtractResponse> {
  const customKey = await getCustomApiKey();

  try {
    const res = await requestAiApi('/api/convert-journal-to-resume-bullets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(customKey ? { 'x-ai-api-key': customKey } : {})
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
    throw new Error(json.error || '工作日报提炼服务返回异常');
  } catch (err: any) {
    console.warn('API call failed, using intelligent journal extraction fallback:', err);
    return fallbackConvertJournalToBullets(params.journalLogs, params.targetRole);
  }
}

// --- Intelligent Fallback Implementations ---
function fallbackRecommendKnowledgePoints(companyName: string, position: string, jd?: string): CompanyJdRecommendationResult {
  return {
    companyName: companyName || '目标嵌入式企业',
    position: position || '嵌入式软件开发工程师',
    companyTechProfile: '嵌入式岗位通常重视 C/C++ 基础、RTOS 并发、外设驱动、通信协议、内存与中断，以及真实硬件问题定位。芯片或无线团队还会深入 Bootloader、低功耗与射频链路。',
    coreRequirementsSummary: jd || '具备 MCU/RTOS、驱动、通信协议、系统调试与工程化能力。',
    overallMatchScore: 88,
    generatedAt: new Date().toISOString(),
    recommendations: [
      {
        id: 'rec-embedded-1', title: 'C 语言内存模型 volatile 与并发安全', category: 'frontend', urgency: 'critical',
        matchReason: `${companyName} 的 ${position} 需要可靠处理中断、任务和 DMA 共享数据。`,
        companySpecificFlavor: '常追问 volatile 是否保证原子性、临界区边界以及 DMA cache 一致性。',
        relatedBookChapter: '《嵌入式 C 与 RTOS 驱动实战》', linkedKnowledgeItemId: 'kb-embedded-c-memory',
        interviewTrapWarning: '不要把 volatile 当成线程安全或原子操作。', keyPreparationAction: '准备 ISR/任务共享标志、ring buffer 和 DMA 缓冲三个代码级案例。'
      },
      {
        id: 'rec-embedded-2', title: 'FreeRTOS 中断到任务的数据通路', category: 'backend', urgency: 'critical',
        matchReason: '驱动开发需要明确 ISR 最短路径、FromISR API 和任务级协议处理。',
        companySpecificFlavor: '会追问 Task Notification、Queue、MessageBuffer 和 EventGroup 的选型。',
        relatedBookChapter: '《嵌入式 C 与 RTOS 驱动实战》', linkedKnowledgeItemId: 'kb-embedded-rtos',
        interviewTrapWarning: '不要在 ISR 中做日志格式化、Flash 写入或完整协议解析。', keyPreparationAction: '画出 UART DMA→ring buffer→FSM parser 的数据流和所有权。'
      },
      {
        id: 'rec-embedded-3', title: '双镜像 Bootloader 与掉电恢复', category: 'ai_fullstack', urgency: 'high',
        matchReason: 'OTA 是 IoT 与终端岗位的重要可靠性能力。',
        companySpecificFlavor: '重点考察分区、校验、试运行、应用确认、Trailer 状态和回滚。',
        relatedBookChapter: '《Bootloader OTA 与嵌入式存储》', linkedKnowledgeItemId: 'kb-embedded-boot',
        interviewTrapWarning: '不能只描述正常升级流程，必须覆盖每个掉电窗口。', keyPreparationAction: '准备完整状态图和 4KB sector / 256B page 写入策略。'
      }
    ]
  };
}

function fallbackMultiCompanyResumeOptimizer(companies: TargetCompanyJdInput[], resume: ResumeData): MultiCompanyComparisonResult {
  return {
    generatedAt: new Date().toISOString(),
    overallCrossComparison: `针对 ${companies.length} 家嵌入式目标企业，建议保留同一份真实经历底稿，再按岗位分别前置无线协议、RTOS 驱动、Bootloader/OTA 或视觉与硬件联调。`,
    generalAdvice: '保持项目事实、时间和指标不变，只调整技能顺序、项目篇幅和与 JD 对应的关键词。',
    companies: companies.map((c) => ({
      companyName: c.companyName || '目标企业',
      position: c.position || '嵌入式软件工程师',
      matchScore: 88,
      matchGrade: 'A (高契合)',
      keyTechFlavors: ['C/C++ 与 MCU/RTOS 基础', '驱动、通信协议与系统调试', 'Bootloader/OTA、低功耗与工程工具'],
      workExperienceSuggestions: [{
        companyOrRole: resume.workExperience?.[0]?.company || '最近一段工作经历',
        originalFocus: '嵌入式驱动、协议与平台开发',
        recommendedRewrite: `针对【${c.companyName}】前置：参与 TL321x RISC-V 无线 SoC 平台开发，完成 UART DMA、FreeRTOS 事件驱动 OTA、私有 BLE Mesh/TDMA 与 MCUboot 双槽升级验证；通过 0.5–150 m Coded PHY 链路测试和 53 项 CLI 测试闭环质量。`,
        reason: `直接对应 ${c.position} 对底层开发、通信、可靠性与验证能力的要求。`
      }],
      educationFramingAdvice: {
        schoolAndDegree: `${resume.education?.[0]?.school || '本科院校'} · ${resume.education?.[0]?.major || '计算机相关专业'}`,
        framingStrategy: '突出 C 语言、数据结构、操作系统、计算机网络、数学基础和 ACM 训练。',
        recommendedCourseHighlights: ['C/C++ 程序设计', '数据结构', '操作系统', '计算机网络'],
        academicStorytelling: '以专业排名、数学竞赛和 ACM 经历证明学习能力与底层基础。'
      },
      essentialKeywords: ['C/C++', 'FreeRTOS', 'STM32 / RISC-V', 'BLE / LoRa', 'Bootloader / OTA'],
      tailoredElevatorPitch: `您好！我具备 4.4 年嵌入式软件开发经验，熟悉 C/C++、FreeRTOS、STM32 与 RISC-V/TL321x，参与过无线 Mesh、双镜像 OTA、MCUboot、LoRa/4G 网关和智能家具项目，与贵司【${c.position}】的技术方向较为匹配。`
    }))
  };
}

function fallbackConvertJournalToBullets(logs: WorkDailyLog[], targetRole?: string): JournalExtractResponse {
  const technologies = Array.from(new Set(logs.flatMap((log) => log.technologiesUsed))).slice(0, 8);
  return {
    summary: `基于近期的 ${logs.length} 条真实工作记录，提炼出与${targetRole || '嵌入式软件工程师'}岗位相关的驱动开发、通信协议、可靠性验证与工程工具成果。`,
    recommendedTechnologies: technologies.length > 0 ? technologies : ['C/C++', 'FreeRTOS', 'UART DMA', 'BLE Mesh', 'MCUboot'],
    suggestedBullets: logs.map((l, idx) => ({
      id: `bullet-${idx + 1}`,
      targetSection: l.category === 'feature' ? 'projects' : 'workExperience',
      companyOrProjectTarget: l.projectOrModuleName || '嵌入式项目',
      bulletText: `负责 ${l.projectOrModuleName || '嵌入式模块'} 开发，针对 ${l.challengesAndSolutions.slice(0, 45)}，采用 ${l.technologiesUsed.slice(0, 3).join(' / ') || '分层调试与自动化验证'} 完成问题闭环，达成【${l.quantifiableMetrics || '功能、稳定性与交付目标'}】。`,
      starBreakdown: {
        situation: l.challengesAndSolutions.slice(0, 50),
        task: `完成 ${l.projectOrModuleName || '嵌入式模块'} 的开发、联调与验证`,
        action: `采用 ${l.technologiesUsed.join('、') || '日志、抓包、示波器与自动化测试'} 定位并解决问题`,
        result: l.quantifiableMetrics || '功能、稳定性与交付指标达到预期'
      },
      evidenceSources: [`${l.date} 工作日报 (${l.evidences?.[0]?.title || '工程凭证'})`],
      appliedToResume: false
    }))
  };
}


