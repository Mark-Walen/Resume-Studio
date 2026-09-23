export interface FrequentQuestionItem {
  id: string;
  question: string;
  questionSnippet?: string; // alias
  category: string;
  frequency: number;
  askedCount?: number; // alias
  companies: string[];
  lastAskedDate: string;
  avgMastery: 'high' | 'medium' | 'low';
  keyKnowledgePoints: string[];
  recommendedPreparation: string;
  recommendedStrategy?: string; // alias
}

export interface WeaknessAlertItem {
  id: string;
  severity: 'critical' | 'warning' | 'notice';
  title: string;
  topic?: string; // alias
  description: string;
  warningDetail?: string; // alias
  occurrenceCount: number;
  frequency?: number; // alias
  observedInterviews: string[]; // e.g. ["字节跳动-一面技术", "美团-二面交叉"]
  occurredInCompanies?: string[]; // alias
  behavioralOrTechnical: 'behavioral' | 'technical' | 'communication';
  consequence: string;           // 带来的负面影响（如：导致面试官质疑系统稳定性把控）
  correctionAdvice: string;      // 针对性整改与纠偏行动
  actionableAdvice?: string;     // alias
}

export interface DiagnosticKnowledgeGap {
  id: string;
  topic: string;
  lastFailedCompany?: string;
  suggestedStudyPlan: string;
}

export interface CrossInterviewDiagnosticReport {
  totalInterviewsAnalyzed: number;
  totalQuestionsCounted: number;
  frequentQuestions: FrequentQuestionItem[];
  repeatedWeaknessAlerts: WeaknessAlertItem[];
  overlookedKeyPoints: string[]; // 多次未主动提及或未深入关注的关键点
  knowledgeGaps?: DiagnosticKnowledgeGap[]; // 盲区考点建议
  overallImprovementTrajectory: string; // 综合改进路径
  generatedAt: string;
}
