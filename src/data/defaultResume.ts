import { ResumeData } from '../types/resume';

export const DEFAULT_TEST_AVATAR = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=533&q=80';

export const DEFAULT_RESUME: ResumeData = {
  id: 'resume-default-001',
  title: '资深全栈研发工程师 & 架构师',
  lastModified: '2026-09-20',
  personalInfo: {
    fullName: '张伟 (Vincent Zhang)',
    jobTitle: '资深全栈架构师 / Tech Lead',
    email: 'vincent.zhang.tech@example.com',
    phone: '+86 138-0013-8000',
    location: '北京 / 杭州 (接受远程/混合)',
    website: 'https://vincentzhang.dev',
    github: 'https://github.com/vincent-zhang-tech',
    linkedin: 'https://linkedin.com/in/vincent-zhang',
    avatarUrl: DEFAULT_TEST_AVATAR,
  },
  jobIntent: {
    desiredPosition: '资深前端架构师 / 全栈技术专家 / Tech Lead',
    desiredSalary: '35k - 50k · 16薪 (可面议)',
    desiredCity: '北京 / 杭州 / 远程',
    jobStatus: '在职 · 考虑新机会 (1个月内到岗)',
    workType: '全职 (支持混合办公)'
  },
  summary: '10 年现代 Web、高并发服务端与分布式架构研发经验，负责过多款千万级 DAU 核心业务与 AI 智能系统从 0 到 1 架构落地。深耕 React 19、TypeScript、Node.js/Next.js 以及云原生微服务体系，具备全链路系统性能调优、工程化基建及跨职能团队带领经验。倡导数据驱动与工程卓越，热衷开源与前沿 AI 交互落地。',
  skills: [
    {
      id: 'skill-1',
      category: '前端工程与框架',
      skills: ['React 19 / 18', 'TypeScript', 'Next.js (App Router)', 'Vite / Turbopack', 'Tailwind CSS', 'Web Workers / WASM', 'State Machines / Zustand']
    },
    {
      id: 'skill-2',
      category: '后端与云原生架构',
      skills: ['Node.js / Express / NestJS', 'Go (Golang)', 'PostgreSQL / MySQL', 'Redis 缓存集群', 'Kafka / RabbitMQ', 'Docker / Kubernetes', 'gRPC / GraphQL']
    },
    {
      id: 'skill-3',
      category: 'AI 赋能与现代工程化',
      skills: ['Gemini API / LLM 编排', 'RAG 向量检索架构', 'CI/CD (GitHub Actions)', '自动化测试 (Vitest/Playwright)', 'APM 全链路监控 (OpenTelemetry)', '微前端架构']
    }
  ],
  workExperience: [
    {
      id: 'exp-1',
      company: '未来脉动科技有限公司',
      position: '资深技术专家 (Tech Lead)',
      department: '基础平台与前沿架构部',
      location: '北京',
      startDate: '2023-03',
      endDate: '至今',
      current: true,
      highlights: [
        '主导千万级企业服务平台前端微模块架构演进，首屏加载 FCP 从 2.4s 优化至 0.65s，Lighthouse 性能得分提升至 96分。',
        '设计并落地全自动 AI 知识资产生成管线，基于 Gemini 与向量库实现企业文档自动语义提取与智能问答，日均调用量超 800 万次，Token 消耗成本降低 42%。',
        '带领 14 人跨端工程团队，搭建标准化 Monorepo 与自动化 CI/CD 流程，发布周期由周级别缩减至小时级持续交付。'
      ],
      technologies: ['React 19', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Docker', 'Gemini SDK']
    },
    {
      id: 'exp-2',
      company: '极智互联网络传媒集团',
      position: '高级全栈研发工程师',
      department: '核心电商业务线',
      location: '杭州',
      startDate: '2020-07',
      endDate: '2023-02',
      current: false,
      highlights: [
        '重构核心大促结算与购物车中台，采用分布式多级缓存与异步削峰设计，在 QPS 峰值 35,000+ 场景下实现 0 宕机、0 资损与 P99 响应延迟低于 45ms。',
        '独立攻坚高并发复杂可视化画布系统，运用 Canvas 与 Web Worker 进行计算卸载，解决了 10,000+ 节点同屏交互卡顿问题，帧率稳定在 58-60 FPS。',
        '建立团队前端异常监控与性能埋点 SDK，日均收集错误日志超百万条，线上故障排查平均耗时 (MTTR) 从 40 分钟降至 8 分钟。'
      ],
      technologies: ['React', 'Next.js', 'Go', 'Kafka', 'Redis', 'MySQL', 'Prometheus']
    },
    {
      id: 'exp-3',
      company: '智云软件技术有限公司',
      position: '全栈开发工程师',
      department: '企业数字化解决方案',
      location: '北京',
      startDate: '2016-08',
      endDate: '2020-06',
      current: false,
      highlights: [
        '参与企业级协作 SaaS 平台从 0 到 1 开发，独立负责即时通讯模块及富文本协作编辑器的封装。',
        '优化服务端数据库查询效率，通过复合索引规划与慢查询排查，数据库整体 CPU 使用率降低 35%。'
      ],
      technologies: ['JavaScript', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'WebSocket']
    }
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'OmniFlow - 新一代企业级实时协作与 AI 智能体编排工作台',
      role: '主架构师 & 核心开发者',
      startDate: '2023-08',
      endDate: '2024-05',
      description: '面向多角色协同的企业级智能画布与自动化工作流平台，支持拖拽式节点连接、实时音视频旁路协同与大模型自动化任务执行。',
      highlights: [
        '基于 CRDT 算法与 WebSocket 实现了毫秒级多人协同冲突解决，支持 50+ 人同时在同一画布平滑编辑。',
        '集成 Gemini 多模态模型流式解析能力，实现用户语音/草图实时转换为可运行工作流，转化准确率达 91.5%。'
      ],
      techStack: ['React 19', 'TypeScript', 'WebSockets', 'CRDT (Yjs)', 'Node.js', 'Tailwind CSS'],
      link: 'https://github.com/vincent-zhang-tech/omniflow'
    },
    {
      id: 'proj-2',
      name: 'PulseKit - 现代化轻量级前端 APM 异常与性能监控基建',
      role: '开源发起人 & 维护者',
      startDate: '2022-01',
      endDate: '2023-01',
      description: '零依赖、轻量无侵入的 Web 性能与异常监控 SDK，GitHub 累计获得 1.2k+ Star。',
      highlights: [
        'SDK 体积仅 6.2KB (Gzipped)，自动捕获未捕获 Promise、脚本错误、资源加载失败及 Web Vitals 核心指标。',
        '支持批量采样与 Beacon API 后台安全上传，保障宿主应用零卡顿。'
      ],
      techStack: ['TypeScript', 'Rollup', 'Web Vitals', 'Node.js', 'ClickHouse'],
      link: 'https://github.com/vincent-zhang-tech/pulsekit'
    }
  ],
  education: [
    {
      id: 'edu-1',
      school: '北京航空航天大学 (BUAA)',
      degree: '工学学士',
      major: '计算机科学与技术',
      startDate: '2012-09',
      endDate: '2016-06',
      gpa: '3.82 / 4.0 (前 5%)',
      honors: ['国家奖学金', 'ACM-ICPC 区域赛二等奖', '北京市优秀毕业生']
    }
  ],
  certificates: [
    {
      id: 'cert-1',
      name: 'AWS Certified Solutions Architect – Professional',
      issuer: 'Amazon Web Services',
      date: '2023-05'
    },
    {
      id: 'cert-2',
      name: 'CKA (Certified Kubernetes Administrator)',
      issuer: 'Linux Foundation / CNCF',
      date: '2022-11'
    }
  ],
  customSections: [
    {
      id: 'custom-open-source',
      title: '开源贡献与社区影响力',
      content: '主导开源监控库 PulseKit (1.2k+ Stars)，核心参与 React 生态 RFC 讨论。在掘金、知乎技术专栏发表多篇深度架构长文，累计阅读量超 20 万次。'
    }
  ],
  sectionOrder: ['workExperience', 'projects', 'skills', 'education', 'certificates', 'custom-open-source'],
  sectionVisibility: {
    workExperience: true,
    projects: true,
    skills: true,
    education: true,
    certificates: true,
    'custom-open-source': true
  }
};

export const defaultResume = DEFAULT_RESUME;
