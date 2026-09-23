export interface TargetCompanyJdInput {
  id: string;
  companyName: string;
  position: string;
  jobDescription: string;
  isHighPriority?: boolean;
}

export interface CompanySpecificOptimization {
  companyName: string;
  position: string;
  matchScore: number;
  matchGrade: string; // S / A / B / C
  keyTechFlavors: string[]; // 针对该公司的核心技术倾向 (e.g. 字节重视手撕算法与微前端，阿里重视高并发分布式事务，美团重视履约高可用)
  
  // 工作经历精细化优化 (根据该公司 JD 重点微调)
  workExperienceSuggestions: Array<{
    experienceId?: string;
    companyOrRole: string;
    originalFocus: string;
    recommendedRewrite: string; // 针对该公司的改写版本 (突出针对性关键词和业务价值)
    reason: string;
  }>;

  // 求学经历与学术背景精细化包装 (论文/专业课程/竞赛/GPA与该岗位的契合点)
  educationFramingAdvice?: {
    schoolAndDegree: string;
    framingStrategy: string; // 如何在面试和简历中阐述求学背景与研究方向
    recommendedCourseHighlights: string[];
    academicStorytelling: string; // 求学到工程实践的叙事线
  };
  educationHighlightPackaging?: string; // 兼容包装总结

  // 必须补充或突出的技术关键词
  essentialKeywords: string[];

  // 投递该公司的专属自荐语 / 打招呼亮点
  tailoredElevatorPitch: string;
}

export interface MultiCompanyComparisonResult {
  generatedAt: string;
  overallCrossComparison: string; // 2-3 家公司侧重点横向差异对比概述
  companies: CompanySpecificOptimization[];
  generalAdvice: string;
}
