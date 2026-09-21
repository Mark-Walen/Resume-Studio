export interface FrequentQuestionItem {
  id: string;
  question: string;
  category: string;
  frequency: number;
  companies: string[];
  lastAskedDate: string;
  avgMastery: 'high' | 'medium' | 'low';
  keyKnowledgePoints: string[];
  recommendedPreparation: string;
}

export interface WeaknessAlertItem {
  id: string;
  severity: 'critical' | 'warning' | 'notice';
  title: string;
  description: string;
  occurrenceCount: number;
  observedInterviews: string[]; // e.g. ["字节跳动-一面技术", "美团-二面交叉"]
  behavioralOrTechnical: 'behavioral' | 'technical' | 'communication';
  consequence: string;           // 带来的负面影响（如：导致面试官质疑系统稳定性把控）
  correctionAdvice: string;      // 针对性整改与纠偏行动
}

export interface CrossInterviewDiagnosticReport {
  totalInterviewsAnalyzed: number;
  totalQuestionsCounted: number;
  frequentQuestions: FrequentQuestionItem[];
  repeatedWeaknessAlerts: WeaknessAlertItem[];
  overlookedKeyPoints: string[]; // 多次未主动提及或未深入关注的关键点
  overallImprovementTrajectory: string; // 综合改进路径
  generatedAt: string;
}
