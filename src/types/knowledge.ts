export type KnowledgeCategory =
  | 'frontend'       // 前端核心与现代Web
  | 'backend'        // 后端架构与高并发
  | 'algorithm'      // 算法与高频数据结构
  | 'system_design'  // 大厂系统设计
  | 'ai_fullstack'   // 大模型与AI全栈
  | 'behavioral';    // 软技能、STAR与薪资谈判

export type KnowledgeDifficulty = 'foundation' | 'advanced' | 'big_tech_must' | 'architecture';

export interface KnowledgeItem {
  id: string;
  title: string;
  category: KnowledgeCategory;
  difficulty: KnowledgeDifficulty;
  tags: string[];
  summary: string;
  corePrinciples: string[];           // 核心原理解析
  interviewerQuestions: string[];     // 面试官连环追问
  modelAnswer: string;                // 高分答题模板 (逻辑闭环)
  commonPitfalls: string[];          // 常见翻车与误区
  relatedCompanies?: string[];       // 常考大厂 (如 字节、阿里、腾讯、美团)
  isBookmarked?: boolean;
  userNotes?: string;
  customAdded?: boolean;
}
