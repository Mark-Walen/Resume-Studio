export type WorkCategory = 
  | 'feature'      // 核心业务功能研发
  | 'architecture' // 系统架构与底层重构
  | 'performance'  // 性能基建与极致优化
  | 'stability'    // 稳定性建设与故障救火
  | 'engineering'  // CI/CD 与工程效能
  | 'ai_infra';    // AI / 大模型赋能业务

export interface EvidenceProof {
  id: string;
  type: 'pr_link' | 'metric_screenshot' | 'doc_link' | 'performance_report' | 'other';
  title: string;
  urlOrRef?: string;
  summary?: string;
}

export interface WorkDailyLog {
  id: string;
  date: string;                       // YYYY-MM-DD
  projectOrModuleName: string;         // 所属项目或业务模块名称 (如：云原生网关、中台低代码、大促秒杀)
  category: WorkCategory;
  tasksCompleted: string;              // 今日完成的核心工作
  challengesAndSolutions: string;      // 攻坚克难：碰到的核心卡点与技术解决思路
  quantifiableMetrics?: string;        // 可量化成果与数据 (如：QPS从1.2k提升至6.5k，首屏降低40%)
  technologiesUsed: string[];          // 使用的关键技术与框架
  evidences: EvidenceProof[];          // 证据链 (PR、指标报告、架构图链接)
  extractedToResume?: boolean;         // 是否已提炼并沉淀入简历
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedResumeBullet {
  id: string;
  targetSection: 'workExperience' | 'projects';
  companyOrProjectTarget: string;
  bulletText: string;                  // 符合 STAR 原则的简历语句 (动词+量化数据+技术选型)
  starBreakdown: {
    situation: string;                 // 背景/挑战
    task: string;                      // 目标
    action: string;                    // 技术攻坚行动
    result: string;                    // 可量化收益
  };
  evidenceSources: string[];           // 溯源自哪些日期的日报
  appliedToResume?: boolean;
}

export interface JournalExtractResponse {
  summary: string;
  suggestedBullets: GeneratedResumeBullet[];
  recommendedTechnologies: string[];
}
