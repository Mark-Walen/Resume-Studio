export type KnowledgeCategory =
  | 'frontend'       // 前端核心与现代Web
  | 'backend'        // 后端架构与高并发
  | 'algorithm'      // 算法与高频数据结构
  | 'system_design'  // 大厂系统设计
  | 'ai_fullstack'   // 大模型与AI全栈
  | 'behavioral';    // 软技能、STAR与薪资谈判

export type KnowledgeDifficulty = 'foundation' | 'advanced' | 'big_tech_must' | 'architecture' | string;

export interface KnowledgeItem {
  id: string;
  title: string;
  category: KnowledgeCategory;
  difficulty: KnowledgeDifficulty;
  tags: string[];
  summary: string;
  corePrinciples?: string[] | string;           // 核心原理解析
  underlyingPrinciples?: string[] | string;     // 兼容别名
  interviewerQuestions?: string[];              // 面试官连环追问
  modelAnswer: string;                          // 高分答题模板 (逻辑闭环)
  commonPitfalls?: string[];                    // 常见翻车与误区
  relatedCompanies?: string[];                  // 常考大厂 (如 字节、阿里、腾讯、美团)
  frequentCompanies?: string[];                 // 兼容别名
  keyPoints?: string[];                         // 重点速记
  isBookmarked?: boolean;
  isMastered?: boolean;                         // 已攻克/掌握标记
  userNotes?: string;
  customAdded?: boolean;
}

// ================= LeetBook 知识书库体系 =================
export interface BookSection {
  id: string;
  title: string;
  order?: number;
  content: string; // Markdown / Rich content
  summary?: string;
  estimatedMinutes?: number;
  isCompleted?: boolean;
  tags?: string[];
  keyTakeaways?: string[];
  sourceFileName?: string; // If imported from PDF/Word/MD
}

export interface BookChapter {
  id: string;
  title: string;
  order: number;
  description?: string;
  sections: BookSection[];
}

export interface KnowledgeBook {
  id: string;
  title: string;
  subtitle: string;
  category: KnowledgeCategory;
  author: string;
  badge: string; // e.g. "大厂架构必读", "LeetBook", "自研专栏"
  coverGradient: string; // e.g. "from-indigo-600 to-blue-700"
  description: string;
  difficulty: KnowledgeDifficulty;
  estimatedHours?: number;
  chapters: BookChapter[];
  totalSectionsCount?: number;
  completedSectionsCount?: number;
  createdAt: string;
  updatedAt: string;
  isCustom?: boolean;
}

// ================= 根据简历与目标公司JD智能推荐知识点 =================
export interface RecommendedKnowledgePoint {
  id: string;
  title: string;
  category: KnowledgeCategory;
  urgency: 'critical' | 'high' | 'bonus'; // '必考高危' | '核心重点' | '加分亮点'
  matchReason: string; // 为什么针对该公司的该岗位需要重点突击这个点
  companySpecificFlavor: string; // 该大厂针对此考点的特有考察侧重点 (如：美团重外卖高并发状态机，字节重底层微前端隔离与跨端)
  relatedBookChapter?: string; // 推荐阅读的 LeetBook 章节
  linkedKnowledgeItemId?: string; // 关联的基础知识库条目ID (如有)
  interviewTrapWarning: string; // 翻车高频陷阱提示
  keyPreparationAction: string; // 面试前30分钟速记要点
}

export interface CompanyJdRecommendationResult {
  companyName: string;
  position: string;
  companyTechProfile: string; // 该企业技术风格画像
  coreRequirementsSummary: string;
  overallMatchScore: number;
  recommendations: RecommendedKnowledgePoint[];
  generatedAt: string;
}
