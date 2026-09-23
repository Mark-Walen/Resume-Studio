import { KnowledgeBook } from '../types/knowledge';

export const DEFAULT_LEETBOOKS: KnowledgeBook[] = [
  {
    id: 'book-concurrency-arch',
    title: '大厂高并发与分布式架构核心指南',
    subtitle: '击穿分布式缓存、事务一致性与高并发流量削峰核心考点',
    category: 'backend',
    author: '大厂架构委员会',
    badge: 'LeetBook 专栏',
    coverGradient: 'from-slate-900 via-slate-800 to-slate-900',
    description: '深入剖析一线互联网大厂（阿里、字节、美团）在亿级流量场景下的分布式高可用架构方案与高频架构面试追问。',
    difficulty: 'architecture',
    createdAt: '2026-09-21',
    updatedAt: '2026-09-21',
    chapters: [
      {
        id: 'ch-1',
        title: '第 1 章：分布式高并发缓存与数据一致性',
        order: 1,
        description: 'Redis 进阶原理、热点 Key 探测、缓存雪崩击穿穿透与双写一致性',
        sections: [
          {
            id: 'sec-1-1',
            title: '1.1 Redis与数据库双写强一致性终极解法',
            order: 1,
            estimatedMinutes: 8,
            isCompleted: true,
            tags: ['Redis', 'MySQL', 'Canal', '双写一致性'],
            keyTakeaways: [
              '先更数据库再删缓存（Cache-Aside模式）配合延迟双删是低成本通用解',
              '高并发严苛一致性场景推荐 Canal 监听 Binlog 投递 MQ 异步重试保证最终一致',
              '避免强依赖分布式锁同步阻塞，牺牲可用性得不偿失'
            ],
            content: `### 一、背景与经典冲突场景
在读多写少的现代高并发系统中，数据通常存在 **MySQL** 等关系型数据库中，并通过 **Redis** 作为二级热点缓存。当业务发起写操作时，如何保证缓存与数据库的一致性？

常见错误解法：
1. **先更缓存，再更数据库**：若数据库更新失败，导致缓存变为脏数据。
2. **先更数据库，再更缓存**：两个并发写请求，A先写库B后写库，但由于网络抖动B先写缓存A后写缓存，导致缓存长期存储A的旧值。

### 二、标准工业级方案（Cache-Aside Pattern）
**正确做法**：写操作时，**先更新数据库，再删除缓存**。

#### 为什么是删除缓存而不是更新缓存？
- **懒加载原则**：写入时不立刻计算缓存，只有在下一次读取时才重新回源计算，避免高频写入时频繁触发昂贵的缓存重算。
- **并发写乱序概率极低**：由于写数据库通常比写内存缓存耗时得多，读线程抢先查库再写缓存导致旧数据覆盖新数据的窗口极小。

### 三、延迟双删与 Canal Binlog 异步消费方案
1. **延迟双删**：
   \`\`\`java
   redis.del(key);
   db.update(data);
   Thread.sleep(500); // 等待主从同步与在途读取完成
   redis.del(key);
   \`\`\`
2. **Canal + RocketMQ 架构（大厂标准方案）**：
   - 应用只负责专注更新 MySQL 业务库。
   - 部署 Canal 伪装成 MySQL 从节点，实时监听 MySQL Row 模式的 Binlog 变更。
   - Canal 解析出受影响的 Key，投递至高吞吐消息队列 RocketMQ。
   - 专用缓存淘汰 Worker 消费 MQ 消息执行 \`redis.del(key)\`，消费失败自动走重试队列甚至死信报警。彻底将业务系统与缓存刷新解耦！`
          },
          {
            id: 'sec-1-2',
            title: '1.2 Redisson 分布式锁底层架构与看门狗自动续期剖析',
            order: 2,
            estimatedMinutes: 10,
            isCompleted: false,
            tags: ['Redisson', '分布式锁', 'Lua脚本', 'Watchdog'],
            keyTakeaways: [
              '加锁必须使用 Lua 脚本保证原子性判断与写入',
              'Redisson Watchdog 默认每隔 lockWatchdogTimeout/3 自动发送续期心跳',
              '锁释放需先校验客户端持有者唯一标识 clientId:threadId，杜绝误释放'
            ],
            content: `### 一、手写 Redis 分布式锁的经典踩坑点
传统手写 \`SET resource_name my_random_value NX PX 30000\` 存在三个严重缺陷：
1. **锁提前超时**：业务未执行完毕但锁因超时释放，下一个并发线程趁虚而入，引发数据脏写。
2. **锁被误删**：A线程执行慢于过期时间，B线程获得锁，此时A执行完毕执行 DEL，直接把B持有的锁误删。
3. **不可重入**：同线程在调用链下游需要再次获取同一把锁时会造成自死锁。

### 二、Redisson 底层 Lua 脚本深度拆解
Redisson 底层通过 Lua 脚本在 Redis 服务端以**原子单线程**执行，利用 Hash 结构存储锁：
- Key: 锁名称
- Hash Key: \`UUID:threadId\`（客户端节点标识+线程号）
- Hash Value: 重入计数器 (Integer)

\`\`\`lua
if (redis.call('exists', KEYS[1]) == 0) then
    redis.call('hset', KEYS[1], ARGV[2], 1);
    redis.call('pexpire', KEYS[1], ARGV[1]);
    return nil;
end;
if (redis.call('hexists', KEYS[1], ARGV[2]) == 1) then
    redis.call('hincrby', KEYS[1], ARGV[2], 1);
    redis.call('pexpire', KEYS[1], ARGV[1]);
    return nil;
end;
return redis.call('pttl', KEYS[1]);
\`\`\`

### 三、看门狗（Watchdog）自动续期机制
当客户端未显式指定 \`leaseTime\` 时，Redisson 启动 Watchdog 守护线程：
- 默认超时时间 30000ms (30秒)。
- 内部启动定时任务，每隔 \`30000 / 3 = 10000ms\` (10秒) 向 Redis 刷新过期时间回 30 秒。
- 只有当业务正常结束调用 \`unlock()\` 或 JVM 进程突发宕机崩溃时，定时任务停止，Redis 达到 30s 自动过期释放锁，杜绝永久死锁！`
          }
        ]
      },
      {
        id: 'ch-2',
        title: '第 2 章：分布式事务与数据强最终一致性',
        order: 2,
        description: '2PC、3PC、TCC、本地消息表与 Seata AT 模式全场景落地',
        sections: [
          {
            id: 'sec-2-1',
            title: '2.1 本地消息表与可靠事件投递模式设计',
            order: 1,
            estimatedMinutes: 9,
            isCompleted: false,
            tags: ['分布式事务', '本地消息表', '幂等性', '最终一致性'],
            content: `### 一、为什么本地消息表是金融与电商系统最稳妥的方案？
在微服务拆分后，订单服务和库存服务位于不同数据库中。强一致性的 2PC (XA) 协议因协调者单点故障和资源长期加锁，在互联网大促高并发下吞吐量极差。

**本地消息表的核心思想**：
利用单机关系型数据库内置的 **ACID 事务特性**，将“业务数据写操作”与“向消息表插入待发送记录”包裹在同一个本地数据库事务中！

### 二、架构执行时序
1. **业务服务（订单）**：
   - 开启单机本地事务。
   - 写入 \`order_info\` 表。
   - 写入 \`local_message\` 表（状态为 PENDING）。
   - 提交事务。如果任何一步失败，全部回滚，保证 100% 同生共死。
2. **后台轮询扫表/投递组件**：
   - 读取 PENDING 状态的消息，投递至 MQ。
   - MQ 投递成功后更新消息状态为 SUCCESS。
3. **下游服务（库存）**：
   - 监听 MQ 消息，更新库存。
   - **必须做好幂等性检查**（借助唯一业务流水号 \`order_id\` 唯一索引或 Redis 防重表）。`
          }
        ]
      }
    ]
  },
  {
    id: 'book-frontend-perf',
    title: '现代前端工程化与性能架构深度突破',
    subtitle: '10万行级大型Web应用构建优化、虚拟列表、微前端沙箱与RSC流式渲染',
    category: 'frontend',
    author: '前端架构资深专家团',
    badge: 'LeetBook 专栏',
    coverGradient: 'from-slate-900 via-slate-800 to-slate-900',
    description: '从浏览器底层事件循环、帧率管线、V8隐藏类到 Webpack/Vite 插件自研与海量数据极致渲染实战。',
    difficulty: 'big_tech_must',
    createdAt: '2026-09-21',
    updatedAt: '2026-09-21',
    chapters: [
      {
        id: 'fe-ch-1',
        title: '第 1 章：浏览器底层渲染管线与 60FPS 帧率工程',
        order: 1,
        sections: [
          {
            id: 'fe-sec-1-1',
            title: '1.1 10万条高频动态数据虚拟滚动（Virtual List）架构推演',
            order: 1,
            estimatedMinutes: 7,
            isCompleted: true,
            tags: ['虚拟列表', 'DOM性能', '动态高度', '二分查找'],
            content: `### 一、为什么不能直接渲染 10 万个 DOM 节点？
1. **DOM 节点内存膨胀**：每个标准 HTML 元素包含数百个原型链属性与事件监听器，10万个节点直接耗尽浏览器几百兆内存。
2. **回流重绘灾难**：任何样式重排将触发全量树遍历，CPU占用 100%，帧率骤降至个位数，页面完全冻结卡死。

### 二、虚拟列表核心几何原理
**只渲染可视区域视口（Viewport）内的真实 DOM 节点**，上下补充占位高度（或通过 \`transform: translateY\` 驱动偏移）。

#### 核心公式：
- 视口高度：\`viewportHeight\`
- 单行固定高度：\`itemHeight\`
- 滚动条位移：\`scrollTop\`
- 可视起始索引：\`startIndex = Math.floor(scrollTop / itemHeight)\`
- 可视结束索引：\`endIndex = startIndex + Math.ceil(viewportHeight / itemHeight) + bufferCount\`
- 滚动容器总高度撑开：\`totalHeight = list.length * itemHeight\`
- 渲染列表偏移：\`transform: translateY(startIndex * itemHeight)\``
          },
          {
            id: 'fe-sec-1-2',
            title: '1.2 微前端（Micro Frontends）JS 沙箱隔离三大流派源码级解析',
            order: 2,
            estimatedMinutes: 10,
            isCompleted: false,
            tags: ['微前端', 'Proxy沙箱', '快照沙箱', 'qiankun'],
            content: `### 一、微前端沙箱的核心使命
多个独立部署的子应用运行在同一个主应用宿主 Window 环境下，必须防止：
1. 子应用 A 污染或重写全局变量（如 \`window.token\`、\`window.Vue\`、\`window.setTimeout\`）。
2. 子应用 B 卸载时未能清理全局事件监听与全局样式，导致内存泄漏与样式穿透。

### 二、三大主流沙箱实现原理
1. **快照沙箱（Snapshot Sandbox）**：
   - 适用于不支持 ES6 Proxy 的低版本浏览器。
   - 激活时遍历 \`window\` 生成深拷贝快照；卸载时对比当前 \`window\` 与快照的差异，记录变更并恢复快照。
2. **单实例 Proxy 沙箱（Legacy Sandbox）**：
   - 利用 ES6 Proxy 代理 \`window\` 对象，记录新增、修改和初始值，销毁时逆向还原。
3. **多实例 Proxy 沙箱（Proxy Sandbox - qiankun 核心）**：
   - 为每个子应用创建独立的 \`fakeWindow = {}\`。
   - 读取时优先从 \`fakeWindow\` 获取，未命中则回源读取宿主真实 \`window\`。
   - 写入和删除操作严格限定在 \`fakeWindow\` 内部，彻底实现多子应用同时共存运行而互不干扰！`
          }
        ]
      }
    ]
  },
  {
    id: 'book-ai-agent-fullstack',
    title: '大模型与 AI Agent 全栈工程化落地指南',
    subtitle: 'Function Calling、RAG 向量混合检索、Multi-Agent 协同与上下文工程实战',
    category: 'ai_fullstack',
    author: 'AI 架构与创新实验室',
    badge: 'LeetBook 专栏',
    coverGradient: 'from-slate-900 via-slate-800 to-slate-900',
    description: '专为求职大模型全栈、AI应用架构师打造的实战知识书库，涵盖当前最前沿的工业级 Agent 与 RAG 体系。',
    difficulty: 'advanced',
    createdAt: '2026-09-21',
    updatedAt: '2026-09-21',
    chapters: [
      {
        id: 'ai-ch-1',
        title: '第 1 章：企业级 RAG 检索增强架构',
        order: 1,
        sections: [
          {
            id: 'ai-sec-1-1',
            title: '1.1 混合检索（Dense + Sparse Hybrid Search）与重排序 Rerank 体系',
            order: 1,
            estimatedMinutes: 9,
            isCompleted: false,
            tags: ['RAG', 'VectorDB', 'BM25', 'Reranker'],
            content: `### 一、传统单一向量检索（Dense Retrieval）的致命缺陷
仅依赖 Embedding 余弦相似度检索时，经常在**精确匹配**场景翻车：
- 例如用户查询 “错误代码 ERR_40912” 或 “产品型号 ZX-99”，语义向量相似度完全无法准确召回，反而被其他高频词向量淹没。

### 二、混合检索（Hybrid Search）金标准
**Dense Embedding + Sparse Keyword (BM25) 双路召回**：
1. **稀疏关键词检索（BM25）**：利用倒排索引精准捕获专有名词、错误码与精确字符串。
2. **密集语义检索（Vector Embedding）**：通过大模型 Embedding 捕获近义词、同义改写与深层语义意图。
3. **RRF（Reciprocal Rank Fusion 倒数排序融合）**：
   \`\`\`
   RRF_Score(d) = \\sum \\frac{1}{k + rank_i(d)}
   \`\`\`
4. **Cross-Encoder Reranker（重排序模型）**：
   将召回的前 50 篇候选文档与用户 Prompt 输入到专门精调的重排模型（如 BGE-Reranker），对语义相关性重新打分，截取 Top 5 注入上下文，极大降低幻觉率！`
          }
        ]
      }
    ]
  }
];
