import { InterviewRecord } from '../types/interview';
import { JobApplication } from '../types/job';

export const INITIAL_JOB_APPLICATIONS: JobApplication[] = [
  {
    id: 'job-1',
    companyName: '字节跳动 (ByteDance)',
    position: '资深全栈工程师 / 架构师',
    salaryExpectation: '55k - 70k · 16薪 + 期权',
    location: '北京·中关村',
    status: 'interviewing',
    priority: 'high',
    source: '员工内推',
    recruiterContact: 'HR 微信: bytedance_talent_carol',
    jobDescription: '负责抖音电商创作者工作台架构演进，高并发低延迟复杂 Web 交互，以及大模型生成式 AI 工作流探索。',
    appliedDate: '2026-09-08',
    updatedAt: '2026-09-18',
    notes: '已顺利通过一面和二面，目前等待业务线技术总监三面。',
    scheduledInterviewDate: '2026-09-23T14:30',
    scheduledInterviewRound: '三面技术总监',
    scheduledInterviewFormat: '线上视频',
    scheduledInterviewMeetingUrl: 'https://meeting.feishu.cn/j/982341235',
    reminderEnabled: true,
    reminderMinutesBefore: 60,
    companyDossier: {
      hrIntro: '抖音电商核心业务线扩招HC，直接对齐2-2/3-1职级，年终3-6个月，期权分4年归属。部门直属电商技术中台。',
      compensationStructure: '基本薪资 58k * 15-18薪，另有每月房补1500，免费三餐+下午茶，期权首年归属15%。',
      teamAndTechStack: '团队约 35 人，主力栈 React 19 + TypeScript + Go (微服务) + Rust (底层打包工具) + 自研微前端引擎。',
      reputationAndWorkLife: '大小周已全面取消，日常 10-10-5，大促期间可能加班至深夜。代码评审与性能治理严苛，技术氛围浓厚。',
      keyInterviewStyle: '前两轮必撕 Hard 难度算法题（动态规划/图论），三面重复杂架构演进、故障排查与海量流量高并发防重。',
      reverseQuestions: [
        '请问目前团队在 AI 赋能创作者视频切片与低代码落地中，面临的最大技术瓶颈是什么？',
        '未来半年内，该架构组最核心要攻坚的 3 项业务指标或技术专项是什么？'
      ],
      riskAlerts: ['业务节奏极快，需求变更频繁，抗压能力要求较高。'],
      collectedLinks: [
        { id: 'dl-1', title: '字节电商中台技术架构演进复盘（技术博客）', url: 'https://juejin.cn/post/bytedance-arch', note: '涵盖其微前端与高并发链路' },
        { id: 'dl-2', title: '看准网与脉脉员工真实风评汇总', url: 'https://maimai.cn/company/bytedance', note: '主管评价正向，期权流动性好' }
      ]
    }
  },
  {
    id: 'job-2',
    companyName: '阿里巴巴 (Alibaba)',
    position: '前端技术专家 (P7+)',
    salaryExpectation: '50k - 65k · 16薪',
    location: '杭州·西溪园区',
    status: 'interviewing',
    priority: 'high',
    source: '猎聘猎头推荐',
    recruiterContact: '猎头手机: 139****1234',
    jobDescription: '阿里云核心管控台微前端体系架构，高可用稳定性保障与研发工程效能工具链。',
    appliedDate: '2026-09-05',
    updatedAt: '2026-09-19',
    notes: '已完成二面技术交叉，二面面试官对高并发分布式事务问得很深。',
    scheduledInterviewDate: '2026-09-24T10:00',
    scheduledInterviewRound: '三面交叉综合面',
    scheduledInterviewFormat: '线上视频',
    scheduledInterviewMeetingUrl: 'https://meeting.dingtalk.com/j/829103819',
    reminderEnabled: true,
    reminderMinutesBefore: 30,
    companyDossier: {
      hrIntro: '阿里云基础架构线，P7专家HC。负责百万级云资源控制台，属于集团核心战略级业务。',
      compensationStructure: '52k * 16薪，全额公积金12%，满两年可参与股票期权增发。',
      teamAndTechStack: '微前端架构 (qiankun/icestark) + Node.js BFF (Midway) + TypeScript + 云原生Kubernetes。',
      reputationAndWorkLife: '9.30-9-5，周三周五不加班日。强调业务闭环与技术深度，文档文化深厚。',
      keyInterviewStyle: '偏好系统设计大题、架构全生命周期思考与跨团队业务拿结果的能力。',
      reverseQuestions: [
        '阿里云管控台在面对全球化多机房部署与弱网环境时，核心的性能优化策略是什么？'
      ],
      collectedLinks: [
        { id: 'dl-3', title: '阿里云云原生控制台前端架构演进', url: 'https://developer.aliyun.com/article/109283' }
      ]
    }
  },
  {
    id: 'job-3',
    companyName: '腾讯 (Tencent)',
    position: '高级全栈研发工程师',
    salaryExpectation: '48k - 60k · 16薪',
    location: '深圳/北京',
    status: 'offer',
    priority: 'high',
    source: 'Boss直聘',
    recruiterContact: 'HR邮箱: hr_recruit@tencent.com',
    jobDescription: '腾讯云即时通信与实时协同服务研发，海量用户高并发架构。',
    appliedDate: '2026-08-25',
    updatedAt: '2026-09-15',
    notes: '收到口头 Offer，正在沟通职级与薪酬 package 细节。',
    scheduledInterviewDate: '2026-09-22T16:00',
    scheduledInterviewRound: 'HR谈薪与职级沟通',
    scheduledInterviewFormat: '电话面试',
    scheduledInterviewMeetingUrl: 'HR 专属电话: 0755-8601****',
    reminderEnabled: true,
    reminderMinutesBefore: 15,
    companyDossier: {
      hrIntro: 'CSIG云与智慧产业事业群，对标9-10级，已通过全部技术与GM终面。',
      compensationStructure: '底薪 50k + 2-4个月奖金 + 10万企鹅股票分3年兑现。',
      teamAndTechStack: 'WebSocket/WebRTC + C++核心引擎 + Node.js/Go网关 + React前端。',
      reputationAndWorkLife: '早10晚8.30，双休，班车食堂设施完善，技术稳定性极高。'
    }
  },
  {
    id: 'job-4',
    companyName: '美团 (Meituan)',
    position: '前端架构师',
    salaryExpectation: '50k - 62k',
    location: '北京·望京',
    status: 'screening',
    priority: 'medium',
    source: '内推',
    appliedDate: '2026-09-14',
    updatedAt: '2026-09-16',
    notes: 'HR 告知简历已初筛通过，正在安排业务一面时间。',
    scheduledInterviewDate: '2026-09-25T15:00',
    scheduledInterviewRound: '一面业务线架构技术面',
    scheduledInterviewFormat: '线上视频',
    scheduledInterviewMeetingUrl: 'https://meeting.meituan.com/j/57192834',
    reminderEnabled: true,
    reminderMinutesBefore: 60,
    companyDossier: {
      hrIntro: '到店综合业务研发部，重点负责B端商家经营后台与数字化基建。',
      teamAndTechStack: 'React + TypeScript + Taro跨端 + 自研商家组件库。',
      keyInterviewStyle: '特别考察工程化提效、跨端渲染架构与复杂表单动态流转引擎。'
    }
  },
  {
    id: 'job-5',
    companyName: '微软 (Microsoft)',
    position: 'Software Engineer II / Senior (Azure Cloud)',
    salaryExpectation: '55k - 70k (WLB良好)',
    location: '北京·中关村',
    status: 'wishlist',
    priority: 'high',
    source: '官网投递准备',
    wishlistTargetDate: '2026-09-25',
    updatedAt: '2026-09-18',
    notes: '预投递目标：需要进一步打磨纯英文简历与算法刷题，准备投递 Azure Core 组。'
  },
  {
    id: 'job-6',
    companyName: '小红书 (RED)',
    position: '资深全栈开发',
    salaryExpectation: '45k - 58k',
    location: '上海 / 北京',
    status: 'wishlist',
    priority: 'medium',
    source: '猎头接触中',
    wishlistTargetDate: '2026-09-28',
    updatedAt: '2026-09-17',
    notes: '预投递目标：关注内容社区创作工具链团队。'
  }
];

export const INITIAL_INTERVIEW_RECORDS: InterviewRecord[] = [
  {
    id: 'iv-001',
    companyId: 'job-1',
    companyName: '字节跳动 (ByteDance)',
    position: '资深全栈工程师 / 架构师',
    round: '一面技术',
    date: '2026-09-12 14:30',
    interviewer: '王工 (电商平台资深前端负责人)',
    interviewFormat: '线上视频',
    interviewNotes: '面试官人很随和但问得很细，开场先聊了 15 分钟项目背景和技术选型。重点考察了 React 19 新特性、Fiber 调度切片机制，以及在百万并发大促场景下前端异常监控与性能优化的具体落地方案。最后做了一道并发任务调度器的手写题。',
    media: {
      id: 'm-001',
      name: '字节跳动_一面技术录音复盘.mp3',
      type: 'audio',
      mimeType: 'audio/mp3',
      sizeBytes: 8420000,
      durationSec: 3600
    },
    questions: [
      {
        id: 'q-101',
        question: 'React 19 的 Actions、useTransition 与 React 18 Fiber 调度底层有什么演进？在处理网络并发状态时能带来什么收益？',
        category: 'React/前端原理',
        userAnswer: '回答了 Fiber 的双缓存结构、lane 优先级机制，提到了 React 19 actions 支持异步 action 自动处理 pending 状态，不用手动写 useState 状态位。但在 transition 发生错误时的 rollback 机制和 Server Actions 底层传输格式上没有答得太清晰。',
        struggleLevel: 'average',
        timestampSec: 620,
        solution: {
          coreConcept: 'React 19 异步 Action 与 Lane 模型协同、Transition 优先级抢占、异步上下文的自动状态解耦。',
          modelAnswer: '【标准高分回答结构】\n1. 核心变化：React 19 将异步函数直接整合进 startTransition 体系。过去异步处理会导致上下文撕裂，开发者需要手动管理 isPending、data 和 error；现在 useTransition 深度打通微任务生命周期，自动维护 pending 状态并在微任务 resolve 后原子更新 UI。\n2. 调度机制：在 React 18 的 Lane 优先级体系中，TransitionLane 是低优先级的可中断任务。React 19 增强了针对并发网络请求的乐观更新 (useOptimistic) 与回滚机制，发生网络 reject 时自动回滚乐观状态无需编写冗余 try-catch。\n3. 实战价值：彻底杜绝异步操作中的竞态竞争 (Race Conditions) 与内存泄露，大幅精简表单与交互胶水代码。',
          commonMistakes: ['只停留于语法糖层面，没说清与微任务、Lane 调度管线的联动', '漏掉了乐观更新回滚与错误边界的处理流程'],
          strategyNextTime: '先用一句话概括核心设计哲学（从命令式胶水代码转变为原生受控状态机），再分点阐述底层 Lane 优先级调度、乐观回滚与工程化价值。',
          keyTakeaway: 'React 19 Actions 本质是将异步状态提升至并发渲染管线，实现了乐观渲染与原子回滚的原生支持。'
        }
      },
      {
        id: 'q-102',
        question: '手写一个带并发限制和优先级重试的异步任务调度器 (Promise Pool Scheduler)',
        category: '算法与手写',
        userAnswer: '手写了基于队列和当前并发计数的 run 函数，基本功能跑通了，但是没有考虑当高优先级任务插入时的插队重试逻辑，面试官提醒后才补上。',
        struggleLevel: 'answered_well',
        timestampSec: 1800
      },
      {
        id: 'q-103',
        question: '高并发复杂 Canvas 渲染场景中，如何解决 10,000+ 节点同屏拖拽和重绘掉帧？具体用到了哪些浏览器底层优化机制？',
        category: '性能优化与底层',
        userAnswer: '提到了 OffscreenCanvas 和 Web Worker，但面试官追问“当多个 Worker 与主线程传输超大 ArrayBuffer 时的内存复制开销与零拷贝方案”，以及“视口裁剪 QuadTree（四叉树）空间索引算法”时，没能详细给出空间索引的数据结构实现细节，略显迟疑。',
        struggleLevel: 'struggled',
        timestampSec: 2540,
        solution: {
          coreConcept: 'OffscreenCanvas 离屏渲染、Transferable Objects 零拷贝技术、空间索引算法（四叉树 QuadTree/R-Tree）与视口可见性裁切 (Frustum Culling)。',
          modelAnswer: '【标准高分回答结构】\n1. 视口可见性裁切与空间索引：千万不要全局重绘 10,000+ 节点。使用空间四叉树 (QuadTree) 或 BVH 将二维空间划分为多层级包围盒，每次视角移动或拖拽时，以 O(log N) 复杂度快速检索当前可视视口 (Viewport) 范围内的交叠节点，仅渲染视口内可见元素。\n2. OffscreenCanvas + Web Worker 渲染卸载：将繁重的矩阵变换、碰撞检测与矢量计算放入独立 Worker 中执行，彻底解放主线程（避免长任务阻断用户输入）。\n3. 零拷贝内存传输：在主线程与 Worker 之间通信时，通过 `worker.postMessage(buffer, [buffer])` 移交 Transferable Objects 所有权，实现 0 内存拷贝耗时。\n4. 分层渲染 (Layering)：动静分离。背景网格和静态节点绘制到底层离屏 Canvas，选中的运动节点单独绘制在顶层高刷新 Canvas，最后在主画布通过 `drawImage` 快速合成。',
          commonMistakes: ['答成普通的防抖节流，未涉及四叉树空间划分算法', '忽略了 postMessage 默认深拷贝在大数据量时的主线程卡顿'],
          strategyNextTime: '从“数学/数据结构层（四叉树视口裁剪）”到“执行线程层（Worker + 零拷贝）”再到“GPU 合成层（动静分层）”三维立体推进回答。',
          keyTakeaway: '几何裁切 + 空间四叉树降低渲染数量基数，Worker 零拷贝解耦主线程，分层 Canvas 消除全量重绘。'
        }
      }
    ],
    aiSummary: {
      overview: '本场一面整体表现扎实，基础算法与前端工程化回答出色，面试官对项目主导经历十分认可。在浏览器深水区底层（零拷贝内存共享、空间索引算法）细节上仍有提升空间。',
      overallScore: 88,
      candidateStrengths: [
        'React 并发调度基础牢固，能准确描述 Lane 优先级体系',
        '项目经历量化数据充分，体现了架构师级别的系统思考',
        '编码逻辑清晰，测试用例考虑完备'
      ],
      areasToImprove: [
        '针对超大规模可视化场景，对四叉树空间索引算法与零拷贝传输的具体实现准备不足',
        '在探讨技术方案时，主动提及异常兜底与降级策略的意识有待增强'
      ],
      communicationFeedback: '表达条理分明，善于先结论后细节，技术互动氛围好。'
    },
    createdAt: '2026-09-12',
    updatedAt: '2026-09-12'
  },
  {
    id: 'iv-002',
    companyId: 'job-1',
    companyName: '字节跳动 (ByteDance)',
    position: '资深全栈工程师 / 架构师',
    round: '二面技术',
    date: '2026-09-16 16:00',
    interviewer: '陈总 (部门技术委员会专家)',
    interviewFormat: '线上视频',
    interviewNotes: '二面偏重全栈与系统架构设计。问了从浏览器输入 URL 到全链路各层熔断降级设计、微前端子应用隔离沙箱（JS 沙箱与 CSS 隔离）、Node.js 服务端 SSR 高并发容灾以及内存泄漏排查（Heapdump & Core Dump）。本场被追问了多次“当后端核心依赖故障时，你的架构如何优雅降级”。',
    media: {
      id: 'm-002',
      name: '字节二面技术全栈架构深挖录音.mp3',
      type: 'audio',
      mimeType: 'audio/mp3',
      sizeBytes: 11200000,
      durationSec: 4200
    },
    questions: [
      {
        id: 'q-201',
        question: '微前端中 JS 沙箱的实现原理是什么？Proxy 沙箱与快照沙箱的区别？多实例同时运行时如何做到互不污染？',
        category: '微前端/架构',
        userAnswer: '讲解了 Proxy 沙箱通过拦截 window 的 get/set，将变更记录在 fakeWindow 对象上。对于快照沙箱讲了遍历对比 window 属性。对于多实例运行讲了多 Proxy 对应各自 fakeWindow 的机制。回答比较完整。',
        struggleLevel: 'answered_well',
        timestampSec: 480
      },
      {
        id: 'q-202',
        question: '在大规模 Node.js BFF 或 SSR 服务中，如果遇到内存缓慢泄露（Memory Leak）直到 OOM 崩溃，你的生产排查排障标准 SOP 是什么？有哪些典型代码踩坑场景？',
        category: '服务端/稳定性',
        userAnswer: '提到了查看监控报警、抓取 heapdump 用 Chrome DevTools 的 Memory 面板对比两个快照的 Retainers。提到过全局变量和未解绑的事件监听器。但当面试官问到“线上服务正在承受高峰流量，直接抓取 Heapdump 导致进程完全卡死（STW）怎么办？如何使用旁路采样的 Core dump 或 v8-profiler 最小化影响”，没有给出安全落地方案。',
        struggleLevel: 'struggled',
        timestampSec: 1950,
        solution: {
          coreConcept: '生产环境 Node.js 内存泄漏排障标准流程 (SOP)、V8 堆内存分代模型、避免 Heapdump 触发全量垃圾回收导致的长时间 STW (Stop The World)。',
          modelAnswer: '【标准高分 SOP 回答框架】\n1. 应急熔断降级：首先必须保可用性！K8s 容器层设置内存阈值 (如 80%) 自动摘流与优雅轮转，防止节点直接 OOM 引发雪崩；前端接入层将部分请求平滑降级为纯静态 CSR。\n2. 生产安全采样（拒绝高危全量 Dump）：千万不能直接在承载流量的生产主进程调用 `heapdump`（会触发全量 GC 并冻结进程数十秒）。\n   - 正确做法：从负载均衡器 (SLB) 中临时剔除其中一台节点（隔离金丝雀实例），或者通过 `--heapsnapshot-signal` 发送信号，或借助 Linux 的 `gcore` 产生核心转储 (Core Dump) 再离线转为堆快照。\n3. 快照对比分析 (DevTools / llnode)：获取相隔 15 分钟的两个快照，按照 `Delta Allocations` 排序，重点观察 `Closure`（闭包隐式引用）、`EventTarget`（未注销的全局 EventBus）、`Object Cache`（无过期/无淘汰机制的纯内存 Map 缓存）。\n4. 防治基建：使用 WeakMap、引入严格代码静态审查、CI/CD 阶段接入自动化压力测试及常态化内存曲线基线比对。',
          commonMistakes: ['直接说在线上打 heapdump，忽略了生产冻结崩溃灾难', '只说出排查工具，没给出“先止损降级隔离、再采样分析”的架构工程思维'],
          strategyNextTime: '先亮出“稳定性第一”原则：1. 摘流与平滑降级 -> 2. 金丝雀隔离采样 -> 3. 离线 Delta 快照定位 -> 4. 根因修复与防御。',
          keyTakeaway: '生产排查先止损摘流，避免直接 dump 引发 STW，利用金丝雀或 Core Dump 进行离线增量比对。'
        }
      },
      {
        id: 'q-203',
        question: '当系统上游分布式缓存（如 Redis）发生大面积击穿或雪崩，并且后端 RPC 接口响应超过 5 秒时，你的全栈系统如何多层熔断降级？',
        category: '高可用/高并发',
        userAnswer: '回答了客户端提示网络拥堵，服务端设置超时时间。但是没有提及多级缓存（本地内存缓存如 Guava/Lru-cache + 互斥锁 Mutex + Redis 布隆过滤器）和 Sentinel/Resilience4j 熔断器状态机，以及前端 Stale-While-Revalidate (SWR) 降级兜底展示。',
        struggleLevel: 'unanswered',
        timestampSec: 3100,
        solution: {
          coreConcept: '全链路防雪崩与防击穿立体防御：多级缓存（L1 进程内 LRU + L2 分布式 Redis）、热点 Key 互斥锁、熔断状态机（断路器 Closed/Open/Half-Open）、SWR 兜底与降级静态页。',
          modelAnswer: '【标准高分全栈防御架构】\n1. 防击穿与雪崩前置治理：\n   - 缓存过期时间加随机抖动 (Jitter)，避免同时间大批失效。\n   - 引入布隆过滤器 (BloomFilter) 拦截不存在的恶意非法 Key。\n   - 热点 Key 保护：查询缓存未命中时，采用互斥分布式锁 (Mutex / SingleFlight) 保证同一时刻仅一个请求打到数据库，其他请求等待或复用结果。\n2. 多级缓存体系：Node BFF 启用本地进程内存缓存 (L1, TTL 5-30秒)，命中即返回，极大减轻底层压力。\n3. 熔断降级状态机 (Circuit Breaker)：当错误率超过 50% 或 P99 延迟超阈值时，断路器自动切为 Open 状态，直接触发降级 Fallback，不把请求向下透传；定期进入 Half-Open 状态进行小流量试探探测。\n4. 前端与 CDN 优雅兜底：前端应用 SWR 策略，优先展示用户本地 IndexedDB/localStorage 缓存的旧数据并提示“网络繁忙已为您加载缓存内容”；CDN 节点配置静态兜底页面，实现用户无感或降级有感可用。',
          commonMistakes: ['把击穿和雪崩混淆', '没有形成由边缘端、网关层、BFF层到存储层的全链路纵深防御视图'],
          strategyNextTime: '按“事前预防（布隆/随机TTL/SingleFlight）-> 事中拦截（L1缓存/熔断器）-> 事后降级（SWR旧数据兜底）”结构化输出。',
          keyTakeaway: '防穿透靠布隆，防击穿靠互斥单飞，防雪崩靠分散抖动；依赖断路器快速熔断，前端以 SWR 缓存优雅降级。'
        }
      }
    ],
    aiSummary: {
      overview: '二面面试官重点测试候选人在极端高并发与故障场景下的系统健壮性思考。候选人在微前端、工程设计方面表现优异，但在全链路分布式容灾降级、生产级 OOM 摘流 SOP 等场景上有明显答题盲区。',
      overallScore: 79,
      candidateStrengths: [
        '微前端沙箱原理与代码隔离方案解析透彻',
        '对 Node.js 异步 I/O 和事件循环理解深入',
        '具备扎实的工程基建视野'
      ],
      areasToImprove: [
        '高并发容灾缺乏完整的多级缓存与熔断状态机链路推演',
        'Node 生产 OOM 排障时未优先考虑生产稳定性与隔离摘流',
        '多次在系统设计题中缺少量化指标（如可用性 99.99%、熔断阈值计算）'
      ],
      communicationFeedback: '遇到盲区时有些许急躁，建议放平心态，先说明核心处理原则，再分层次拆解。'
    },
    createdAt: '2026-09-16',
    updatedAt: '2026-09-16'
  },
  {
    id: 'iv-003',
    companyId: 'job-2',
    companyName: '阿里巴巴 (Alibaba)',
    position: '前端技术专家 (P7+)',
    round: '三面交叉',
    date: '2026-09-18 19:00',
    interviewer: '大淘宝技术专家',
    interviewFormat: '线上视频',
    interviewNotes: '重点关注技术与商业价值结合、复杂跨端协同以及大模型在研发提效中的实际落地指标。面试官特别追问了“AI 知识库问答中，如果大模型发生幻觉导致重要业务操作误判，在架构层面如何设立确定性校验栅栏”。',
    media: {
      id: 'm-003',
      name: '阿里三面交叉架构实录.mp3',
      type: 'audio',
      mimeType: 'audio/mp3',
      sizeBytes: 9800000,
      durationSec: 3800
    },
    questions: [
      {
        id: 'q-301',
        question: '在生成式 AI 与 LLM 工作流落地中，如何解决模型幻觉（Hallucination）对核心业务准确性的冲击？有哪些架构护栏（Guardrails）机制？',
        category: 'AI 架构与落地',
        userAnswer: '答了在 prompt 里强调严格依据上下文回答，回答格式使用 JSON Schema。但是面试官进一步追问“如果输出是敏感操作（如退款、改价），如何引入确定性校验引擎（Deterministic Validation Engine）和语义检索召回可信度评估”，没有深入答出架构分层。',
        struggleLevel: 'struggled',
        timestampSec: 1200,
        solution: {
          coreConcept: 'LLM 确定性护栏 (Guardrails)、RAG 语义可信度评分 (Faithfulness & Relevance)、双轨制架构 (Dual-Track Architecture) 与人机闭环 (Human-in-the-Loop)。',
          modelAnswer: '【标准高分回答架构】\n1. 核心架构认知：永远不要让概率模型直接执行不可逆的高危业务动作。LLM 负责语义理解与意图提取，确定性业务系统负责最终规则裁决与执行（双轨制）。\n2. 召回层护栏 (Retrieval Guardrails)：采用混合检索 (Dense Vector + Sparse BM25) + Reranker 重排，计算 Context Relevance 分数；若可信度低于阈值（如 0.82），模型直接触发拒答或转人工，严禁脑补。\n3. 生成层防御：借助结构化输出约束（如 Gemini 的 Type.OBJECT 强制 JSON 校验），并在客户端或网关层配置敏感词过滤与正则语义栅栏。\n4. 意图验证与动作栅栏 (Action Guardrails)：大模型解析出的参数传入确定性代码校验器进行强类型断言与权限校验；对退款、降级等高风险操作强制要求“人机协同确认 (Human-in-the-Loop)”。\n5. 评估闭环：建立 Ragas / TruLens 评估基准，监控真实场景下的准确率并持续反哺微调或 Few-Shot。',
          commonMistakes: ['只指望 Prompt 提示词压制幻觉，没意识到大模型概率特性的本质', '没有将“意图抽取”与“确定性执行”解耦'],
          strategyNextTime: '提出“双轨架构”（概率意图抽取 + 确定性引擎校验），从检索可信度、输入输出护栏、事务执行栅栏三层递进。',
          keyTakeaway: '概率模型做感知，确定性代码做裁判；高危操作强隔离，人机协同防击穿。'
        }
      },
      {
        id: 'q-302',
        question: '当多个跨团队子系统依赖发生故障时，你如何带领 10+ 人的跨职能团队高效协同推进排障与架构重构？',
        category: '团队协同与领导力',
        userAnswer: '回答了开会同步进度、建立群通知。面试官认为过于偏事务性，未展现出 Tech Lead 在跨部门推挤阻力时的技术影响力、明确的 SLA 标准和复盘机制。',
        struggleLevel: 'average',
        timestampSec: 2800
      }
    ],
    aiSummary: {
      overview: '三面整体表现合格，展现了良好的架构视野。在面对前沿 AI 护栏系统设计与跨团队技术治理的深层追问时，回答偶显浮于表面，需要强化深层次落地的方法论与标准。',
      overallScore: 82,
      candidateStrengths: [
        'AI 与工程结合的业务敏感度高',
        '技术选型具有清晰的成本考量',
        '逻辑严谨，思考速度快'
      ],
      areasToImprove: [
        '对 LLM 确定性护栏与双轨校验体系认知不够全面',
        '领导力与跨部门技术推动方面的阐述略偏事务化，缺少体系化的技术契约和指标牵引'
      ],
      communicationFeedback: '具备良好的技术热情与谦逊态度，但对于未深思的问题容易急于做答，可以停顿 5 秒理清框架再回答。'
    },
    createdAt: '2026-09-18',
    updatedAt: '2026-09-18'
  }
];

export const mockInterviews = INITIAL_INTERVIEW_RECORDS;
