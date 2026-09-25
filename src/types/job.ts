export type ApplicationStatus = 
  | 'wishlist'     // 预投递 (Target / To Apply)
  | 'applied'      // 已投递 (Applied)
  | 'screening'    // 简历筛选通过 (Screening passed)
  | 'interviewing' // 面试中 (Interviewing)
  | 'offer'        // 已拿 Offer (Offer received)
  | 'rejected'     // 未通过/归档 (Archived / Rejected);

export interface DossierLink {
  id: string;
  title: string;
  url: string;
  note?: string;
}

export interface CompanyDossier {
  // HR 提供的官方信息与招聘背景
  hrIntro?: string;                      // HR介绍、HC产生原因 (业务扩张/离职重构)、职级对标
  compensationStructure?: string;       // 薪资结构：基本薪资、年终奖基准、期权股票、调薪频率
  teamAndTechStack?: string;            // 业务线现状、团队规模、主力开发语言与架构
  // 自己搜集的第三方背景调查与员工口碑
  reputationAndWorkLife?: string;       // 加班强度、大小周、试用期淘汰率、脉脉/看准真实风评
  keyInterviewStyle?: string;           // 面试风格画像 (重手撕算法/重底层源码/重业务系统设计)
  reverseQuestions?: string[];          // 反问环节专备高情商问题 (向主管/架构师提问)
  riskAlerts?: string[];                // 潜在风险与避坑预警 (如：频繁换领导、边缘业务)
  collectedLinks?: DossierLink[];       // 搜集的调研网址链接 (财报、脉脉爆料、技术专栏)
  updatedAt?: string;
}

export interface JobCommunicationFollowUp {
  question: string;
  answerHint: string;
}

export interface JobCommunicationAdvice {
  interviewerIntent: string;
  answerFramework: string[];
  suggestedAnswer: string;
  followUpQuestions: JobCommunicationFollowUp[];
  cautions: string[];
}

export interface JobCommunicationRecord extends JobCommunicationAdvice {
  id: string;
  question: string;
  aiSuggestedAnswer?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  companyName: string;
  position: string;
  salaryExpectation?: string;
  salary?: string; // convenient alias
  location?: string;
  status: ApplicationStatus;
  priority: 'high' | 'medium' | 'low';
  source?: string; // e.g. Boss直聘, 猎聘, 员工内推, 官网投递
  recruiterContact?: string;
  jobDescription?: string;
  appliedDate?: string;
  wishlistTargetDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt: string;

  // 公司背调与 HR 资料合集 (Company Dossier)
  companyDossier?: CompanyDossier;

  // 与招聘方沟通、面试问答准备（随岗位同步到云端工作区）
  communicationRecords?: JobCommunicationRecord[];

  // 面试排程与提醒信息
  scheduledInterviewDate?: string;      // e.g. "2026-09-23T14:30"
  scheduledInterviewRound?: string;     // e.g. "一面技术", "HR综合面"
  scheduledInterviewFormat?: '线上视频' | '电话面试' | '现场面试' | string;
  scheduledInterviewMeetingUrl?: string;// 会议链接 (飞书/腾讯会议/Zoom/地点)
  reminderEnabled?: boolean;
  reminderMinutesBefore?: number;       // 提前多少分钟提醒 (15, 30, 60, 1440)
  scheduledInterviewReminderMinutes?: number; // alias
}
