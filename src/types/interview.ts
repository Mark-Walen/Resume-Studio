export type InterviewRound = '一面技术' | '二面技术' | '三面交叉' | '四面总监/架构' | 'HR综合面' | '高管终面' | string;

export type StruggleLevel = 'answered_well' | 'average' | 'struggled' | 'unanswered' | 'mastered';

export interface UnansweredSolution {
  coreConcept: string;           // 核心考点剖析
  modelAnswer: string;           // 标准高分回答 (STAR法则/逻辑框架)
  commonMistakes: string[];      // 常见误区与避坑点
  strategyNextTime: string;      // 下次遇到类似问题的应对策略
  keyTakeaway: string;          // 一句话核心总结
}

export interface InterviewQuestionItem {
  id: string;
  question: string;
  category?: string;             // e.g. React/前端工程化, 分布式/网络, 系统设计, 算法, 软技能
  userAnswer?: string;
  userNotes?: string;            // 候选人现场作答笔记
  struggleLevel: StruggleLevel;  // 用户回答掌握程度
  timestampSec?: number;         // 关联音视频时间戳 (秒)
  solution?: UnansweredSolution; // AI 对未答上/掌握不佳点的专属解法
  unansweredSolution?: UnansweredSolution;
}

export interface MediaAttachment {
  id: string;
  name: string;
  type: 'audio' | 'video';
  mimeType: string;
  sizeBytes?: number;
  size?: number;
  blobId?: string;
  cloudObjectPath?: string;
  cloudSyncedAt?: string;
  dataUrl?: string;              // Base64 or Blob URL for playback
  durationSec?: number;
}

export interface AiInterviewFeedback {
  generatedAt?: string;
  overview?: string;            // 整体面试回顾
  summary?: string;
  overallScore: number;        // 满分100
  candidateStrengths?: string[];// 亮点与肯定
  strengths?: string[];
  areasToImprove: string[];    // 待提升项
  communicationFeedback?: string; // 沟通与表达反馈
}

export interface InterviewRecord {
  id: string;
  companyId?: string;
  companyName: string;
  position: string;
  round: InterviewRound;
  date: string;
  durationMinutes?: number;
  interviewer?: string;
  interviewers?: string;
  interviewFormat?: '线上视频' | '电话面试' | '现场面试' | string;
  media?: MediaAttachment;
  mediaAttachments?: MediaAttachment[];
  interviewNotes?: string;        // 面经与现场记录
  notes?: string;
  questions: InterviewQuestionItem[];
  aiSummary?: {
    overview: string;
    overallScore: number;
    candidateStrengths: string[];
    areasToImprove: string[];
    communicationFeedback: string;
  };
  aiFeedback?: {
    generatedAt: string;
    overallScore: number;
    summary: string;
    strengths: string[];
    areasToImprove: string[];
    communicationFeedback?: string;
  };
  createdAt: string;
  updatedAt?: string;
}
