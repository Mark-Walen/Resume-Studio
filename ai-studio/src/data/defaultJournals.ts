import { WorkDailyLog } from '../types/journal';

export const INITIAL_WORK_DAILY_LOGS: WorkDailyLog[] = [
  {
    id: 'log-1',
    date: '2026-09-18',
    projectOrModuleName: '核心电商大促交易链路',
    category: 'performance',
    tasksCompleted: '排查并优化大促秒杀订单防超卖与下单接口超时问题，落地分布式限流与动静分离。',
    challengesAndSolutions: '突发瞬时 QPS 从 1,500 激增至 12,000，MySQL 行级排他锁导致死锁暴增并拖垮连接池。方案：引入 Redis + Lua 脚本在内存中原子扣减预热库存，配合本地双缓存 Guava 拦截非白名单请求；通过 RocketMQ 异步批量落库。',
    quantifiableMetrics: '秒杀接口 P99 响应延时从 820ms 降至 38ms（降低95%），系统峰值吞吐承载力提升 8 倍，零超卖事故发生。',
    technologiesUsed: ['Redis', 'Lua', 'RocketMQ', 'Guava Cache', 'MySQL'],
    evidences: [
      {
        id: 'ev-1',
        type: 'performance_report',
        title: 'JMeter压测对比报告-秒杀链路优化前后.pdf',
        summary: '压测数据：12,000 QPS 稳态运行，CPU 负载在 65% 以下'
      }
    ],
    extractedToResume: false,
    createdAt: '2026-09-18T18:30:00Z',
    updatedAt: '2026-09-18T18:30:00Z',
  },
  {
    id: 'log-2',
    date: '2026-09-15',
    projectOrModuleName: '企业级低代码与微前端架构基建',
    category: 'architecture',
    tasksCompleted: '完成主应用与 8 个业务子应用的微前端沙箱迁移改造，解决全局变量污染与CSS样式穿透。',
    challengesAndSolutions: '多业务团队各自引入不同版本 React (v16 vs v18) 与 Echarts，导致全局 window 冲突及偶发性白屏。方案：基于 Proxy 代理 window 隔离子应用全局运行时，并在打包工具中实现动态命名空间样式隔离与 Module Federation 模块按需共享。',
    quantifiableMetrics: '子应用独立部署构建耗时由 4.5 分钟缩减至 42 秒，发布回滚耗时缩减 80%，跨团队依赖冲突清零。',
    technologiesUsed: ['Vite', 'Module Federation', 'ES6 Proxy', 'TypeScript', 'TailwindCSS'],
    evidences: [
      {
        id: 'ev-2',
        type: 'pr_link',
        title: 'PR #1208: 架构升级-基于Proxy的微前端多实例沙箱支持',
        urlOrRef: 'https://github.com/internal-corp/platform/pull/1208'
      }
    ],
    extractedToResume: true,
    createdAt: '2026-09-15T19:10:00Z',
    updatedAt: '2026-09-15T19:10:00Z',
  },
  {
    id: 'log-3',
    date: '2026-09-10',
    projectOrModuleName: 'AI 智能体工作流与文档知识库',
    category: 'ai_infra',
    tasksCompleted: '研发企业级 RAG 混合检索与 Function Calling 自动化编排工作流。',
    challengesAndSolutions: '传统稠密向量在长尾专有名词与编号查询时准确率仅为 54%。方案：搭建 BM25 稀疏检索 + BGE Embedding 双路召回通道，并引入 BGE-Reranker 交叉编码器对候选切片打分重排序。',
    quantifiableMetrics: '知识库问答检索准确率 Top-3 命中率从 61% 跃升至 92.4%，大模型回答幻觉率降低 47%。',
    technologiesUsed: ['LLM API', 'VectorDB', 'BM25', 'Reranker', 'Node.js'],
    evidences: [
      {
        id: 'ev-3',
        type: 'doc_link',
        title: '企业级RAG检索增强与Agent编排架构白皮书',
        urlOrRef: 'https://wiki.corp.com/pages/ai-rag-arch'
      }
    ],
    extractedToResume: false,
    createdAt: '2026-09-10T20:00:00Z',
    updatedAt: '2026-09-10T20:00:00Z',
  }
];
