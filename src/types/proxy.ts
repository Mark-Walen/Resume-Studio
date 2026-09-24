export interface ParsedJdInfo {
  companyName: string;
  position: string;
  salaryRange?: string;
  location?: string;
  experienceYears?: string;
  education?: string;
  jobDescription: string;
  requiredSkills: string[];
  bonusSkills?: string[];
  responsibilities: string[];
  sourceUrl?: string;
}

export interface JdMatchAnalysis {
  matchScore: number;                 // 0 - 100
  matchGrade: 'S (极高契合)' | 'A (高契合)' | 'B (基本匹配)' | 'C (跨度较大)';
  matchSummary: string;
  matchingStrengths: string[];        // 候选人核心优势契合点
  potentialGaps: string[];            // 技能缺口与风险提示
  targetedResumeAdvice: string[];     // 针对该岗位的一对一简历修改建议
  customizedCoverLetter: string;      // 一键自荐信/求职开场白
  recommendedInterviewPrep: string[]; // 面试前须重点突击的针对性考点
}

export interface JdProxyResponse {
  success: boolean;
  rawTextLength?: number;
  extractionMethod?: 'pasted-text' | 'http' | 'browser';
  sourceTitle?: string;
  parsedJd: ParsedJdInfo;
  matchAnalysis: JdMatchAnalysis;
  error?: string;
}
