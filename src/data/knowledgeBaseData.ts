import { KnowledgeItem } from '../types/knowledge';

export const INITIAL_KNOWLEDGE_BASE: KnowledgeItem[] = [
  // --- 前端核心与现代 Web ---
  {
    id: 'kb-fe-01',
    title: 'React 19 / 18 并发机制与 Fiber 树调度全流程',
    category: 'frontend',
    difficulty: 'big_tech_must',
    tags: ['React 19', 'Fiber', 'Concurrent Mode', 'Scheduler', '双缓存'],
    summary: '深入解析 Fiber 节点链表结构、时间切片 (Time Slicing)、可中断渲染以及 commitRoot 双缓存切换机制。',
    corePrinciples: [
      'Fiber 架构通过将递归遍历的虚拟 DOM 改为基于 child/sibling/return 单链表的 Fiber 树，使渲染工作拆分为一个个单元微任务。',
      '借助 MessageChannel 配合 Scheduler 实现 5ms 级时间切片，保证高优先级交互（如键盘敲击、拖拽）不被重计算阻塞。',
      'workInProgress 树与 current 树通过 alternate 指针构建双缓存，render 阶段只在内存中构建，commit 阶段一次性同步更新真实 DOM。'
    ],
    interviewerQuestions: [
      '为什么 React 不使用 requestIdleCallback 实现调度？',
      'useTransition 和 useDeferredValue 底层是如何标记低优先级并触发中断重试的？',
      'React 19 的 Action 和 useActionState 对表单与异步提交机制有什么颠覆性改进？'
    ],
    modelAnswer: `回答应分四步层层递进：
1. 【历史痛点】：React 15 堆栈重调（Stack Reconciler）同步递归遍历深层树，JS 主线程被长期独占导致掉帧卡死；
2. 【核心架构】：Fiber 将渲染工作拆为链表结构，配合 Scheduler 基于 MessageChannel 宏任务模拟时间切片，赋予渲染「可中断、可恢复、带优先级」的能力；
3. 【双缓冲机制】：在内存中生成 workInProgress 树，通过 Lane 模型判定任务优先级，优先级打断时丢弃或重用中间态，在 commit 阶段无缝置换 current 指针；
4. 【React 19 演进】：React 19 进一步弱化手动 memo 依赖（React Compiler），并将并发机制下沉到 Actions 异步原语中，使状态并发流转更加透明。`,
    commonPitfalls: [
      '误以为 commit 阶段也是异步可中断的（实际上 commitMutation / commitLayout 必须同步一次性刷入 DOM，否则屏幕会出现局部裂屏）。',
      '混淆 requestAnimationFrame 与 MessageChannel 的调度时机。'
    ],
    relatedCompanies: ['字节跳动', '阿里巴巴', '腾讯', '美团']
  },
  {
    id: 'kb-fe-02',
    title: '现代 Web 性能调优与 Core Web Vitals (LCP / INP / CLS) 生产级实战',
    category: 'frontend',
    difficulty: 'architecture',
    tags: ['性能优化', 'INP', 'LCP', 'CLS', 'Web Vitals', 'SSR/SSG'],
    summary: '从网络传输、关键渲染路径到主线程交互卡顿，全方位攻克 INP、LCP 达标与大厂秒开基建。',
    corePrinciples: [
      'LCP (Largest Contentful Paint < 2.5s)：受服务端响应时间 (TTFB)、资源加载延迟、渲染阻塞及客户端水合消耗共同决定。',
      'INP (Interaction to Next Paint < 200ms)：替代旧 FID 指标，考查全生命周期内用户所有点击/键入/长按事件从触发到下一帧绘制的总延迟，关键在于避免长任务 (Long Task > 50ms)。',
      'CLS (Cumulative Layout Shift < 0.1)：由动态无宽高占位元素、动态字体加载 (FOUT/FOIT) 或异步注入 DOM 导致。'
    ],
    interviewerQuestions: [
      '在线上真实用户监控 (RUM) 中，如何量化捕获长任务并将其归因到具体函数？',
      '高并发活动大促页面如何将首屏时间压进 500ms 内？',
      '虚拟列表在处理 10 万行复杂树形数据时的动态高度估算与二次回弹如何化解？'
    ],
    modelAnswer: `建议采用「指标分解 + 链路监控 + 架构改造」闭环：
1. 【网络与资源层】：HTTP/3 + CDN 边缘节点、路由级按需分包 (Dynamic Import)、图片 AVIF/WebP 现代压缩并预留宽高属性规避 CLS；
2. 【关键路径层】：关键 CSS 骨架内联，大组件采用 Islands 架构或渐进式水合，将非关键脚本打上 defer/async；
3. 【主线程卸载】：将繁重的数据解析与模糊搜索计算交给 Web Worker，采用 PerformanceObserver 监听 longtask 与 layout-shift 并通过 navigator.sendBeacon 无感上报。`,
    commonPitfalls: [
      '盲目做代码压缩与 SSR，却因第三方埋点脚本/SDK 阻塞主线程导致 INP 严重劣化。',
      '使用没有固定宽高的动态图片或广告横幅，引起页面剧烈跳动导致 CLS 超标。'
    ],
    relatedCompanies: ['字节跳动', '小红书', '拼多多', 'Shopee']
  },

  // --- 后端架构与高并发 ---
  {
    id: 'kb-be-01',
    title: '高并发高可用缓存架构：穿透、击穿、雪崩与 Redis 多级缓存一致性',
    category: 'backend',
    difficulty: 'big_tech_must',
    tags: ['Redis', '缓存击穿', '布隆过滤器', '双写一致性', 'Canal'],
    summary: '针对读写高并发场景下缓存体系的经典故障形态与终极兜底设计，掌握 Cache Aside 模式及 binlog 异步同步。',
    corePrinciples: [
      '缓存穿透（查不存在的数据）：使用布隆过滤器 (Bloom Filter) 在接入层快速拦截，或对空值进行短期缓存 (TTL 30-60s)。',
      '缓存击穿（热点 Key 突然失效）：互斥分布式锁 (Redisson Lock) 只允许一个线程回源 DB，或热点数据永不过期 + 后台异步定时刷新。',
      '缓存雪崩（大批量 Key 同一时间过期）：在失效时间上增加随机抖动偏移量 (random jitter 1~5min)，配合多级缓存（本地内存 Caffeine + 分布式 Redis）多层隔离。',
      '双写一致性：采用 Cache-Aside 模式（先更新数据库，再删除缓存），高可靠场景结合 Canal 监听 MySQL binlog 进行异步补偿删除与延迟双删。'
    ],
    interviewerQuestions: [
      '先更新 DB 再删缓存，为什么极端情况下依然会有脏数据？概率多大？',
      '为什么不推荐「先删缓存再改 DB」？如何通过延迟双删缓解？',
      'Redis 主从哨兵发生脑裂时，如何从架构上防止数据丢失？'
    ],
    modelAnswer: `回答架构必须条理清晰：
1. 【选型原则】：强一致性依赖分布式事务（但牺牲吞吐量），互联网核心业务普遍追求「最终一致性」；
2. 【核心模式】：选择「先改 DB，后删 Cache」。因为写 DB 耗时远大于读写内存，读请求读旧值并回填脏数据的窗口极小；
3. 【可靠兜底】：为防止删除缓存由于网络闪断失败，引入 Canal 消费 MySQL binlog + 消息队列重试机制，或者配合业务 Redis TTL 兜底保底；
4. 【多级防护】：网关层限流 (Token Bucket) -> 本地缓存 Caffeine -> 分布式 Redis 集群 -> 数据库读写分离。`,
    commonPitfalls: [
      '脱口而出说分布式事务 2PC 适合高并发 Web，忽略其全流程资源加锁导致的性能崩溃。',
      '忽略布隆过滤器的误判率（False Positive）以及无法直接物理删除 Key 的局限。'
    ],
    relatedCompanies: ['阿里巴巴', '美团', '京东', '快手']
  },
  {
    id: 'kb-be-02',
    title: 'Kafka 高吞吐削峰架构、消息丢失与重复消费（幂等性）终极解决方案',
    category: 'backend',
    difficulty: 'advanced',
    tags: ['Kafka', '消息队列', '幂等性', '零拷贝', '顺序消费'],
    summary: '解析 Kafka 零拷贝 (Sendfile)、磁盘顺序写、ISR 副本复制机制，以及生产与消费端零丢失落地方案。',
    corePrinciples: [
      '高吞吐奥秘：页缓存 (Page Cache) 写入、磁盘顺序追加写 (Append Only)、以及网卡零拷贝 (Zero-Copy) 跳过用户态拷贝。',
      '防丢失三板斧：生产端 acks=all (或 -1) + min.insync.replicas >= 2，Broker 端禁用 unclean.leader.election，消费端手动提交 offset (enable.auto.commit=false)。',
      '消费幂等性保障：上游生成唯一业务流水号 (BizID/UUID)，下游消费者结合 Redis SETNX 分布式锁或数据库唯一索引 (UNIQUE KEY) 做防重。'
    ],
    interviewerQuestions: [
      'Kafka 如何保证单个分区内的消息严格顺序消费？如果并发多线程处理怎么保证顺序？',
      '消费发生堆积时，如何在线平滑扩容而不丢数据？',
      'Kafka 与 RabbitMQ、RocketMQ 在架构选型上最大的适用边界是什么？'
    ],
    modelAnswer: `采用由端到端的可靠性链路梳理：
1. 【生产端防丢】：开启幂等生产者 (enable.idempotence=true) 消除网络重试导致的重复，设置 acks=all，只有在所有 ISR 副本同步完成后才返回 ACK；
2. 【Broker 持久化】：分区副本因子 replication.factor >= 3，设定合理的主题日志刷盘与保留策略；
3. 【消费端精细化】：单条/小批处理完成后才手动同步 commitOffset，业务逻辑严格设计唯一流水号判重表或分布式防重缓存；
4. 【顺序消费处理】：在同一 Partition 内消息是有序的，若消费内部需要并发线程池，需按业务 Key 做一致性 Hash 路由到固定的子 Worker 线程。`,
    commonPitfalls: [
      '只谈业务逻辑，不知道底层操作系统 PageCache 和 mmap/sendfile 的原理。',
      '开启了自动提交 offset，导致代码抛出异常后消息已被标记为已消费产生消息丢失。'
    ],
    relatedCompanies: ['字节跳动', '腾讯', '蚂蚁金服', '快手']
  },

  // --- 算法与高频数据结构 ---
  {
    id: 'kb-algo-01',
    title: '大厂高频算法核心脉络：双指针、滑动窗口与单调栈模型归纳',
    category: 'algorithm',
    difficulty: 'big_tech_must',
    tags: ['算法', '双指针', '滑动窗口', '单调栈', '高频Top100'],
    summary: '打通 LeetCode 热题精髓，提炼滑动窗口无重复子串、接雨水、柱状图中最大矩形的核心模式匹配解法。',
    corePrinciples: [
      '滑动窗口标准模板：维护 left 与 right 两个指针，right 持续扩张直到窗口满足边界条件，随后 left 逐步收缩寻找局部最优。',
      '单调栈特征识别：凡是需要寻找「下一个更大元素 (Next Greater Element)」或「两边第一座矮山/高山」的问题，必用单调栈（O(N) 复杂度）。',
      '快慢双指针与对撞双指针：快慢用于判断环形链表/寻找中点，对撞指针用于有序数组二分查找或盛水容器最大容积收敛。'
    ],
    interviewerQuestions: [
      '接雨水 (Trapping Rain Water) 的双指针解法相比单调栈和动态规划解法，空间复杂度是如何从 O(N) 优化到 O(1) 的？',
      '如何证明滑动窗口算法在全流程中的时间复杂度恒为 O(N) 而非 O(N^2)？'
    ],
    modelAnswer: `算法面试答题关键是：清晰的复杂度分析 + 标准模版写出零 Bug 代码：
1. 【滑动窗口复杂度证明】：尽管有内外两层 while 循环，但每个元素最多被 right 访问一次，被 left 移出一次，元素入窗出窗各一次，总操作次数 <= 2N，因此严格为 O(N)；
2. 【单调栈精髓】：保持栈内元素严格单调递增或递减。当新元素破坏单调性时，弹出栈顶元素，此时当前元素与新栈顶即为该弹出元素的左右最近边界；
3. 【代码风格】：先明确异常边界（如 null、length < 2），变量命名清晰，一次性跑通样例测试。`,
    commonPitfalls: [
      '窗口收缩边界处理不当，出现死循环或数组越界。',
      '死记硬背代码而未理解单调栈入栈、出栈时刻所代表的几何/数值物理意义。'
    ],
    relatedCompanies: ['字节跳动', '微软', 'Google', 'Meta']
  },
  {
    id: 'kb-algo-02',
    title: '动态规划 (DP) 状态转移方程与背包/区间模型攻坚',
    category: 'algorithm',
    difficulty: 'advanced',
    tags: ['动态规划', '状态转移', '背包问题', '最优子结构', '滚动数组'],
    summary: '掌握 DP 思考范式：定义状态 -> 寻找转移方程 -> 确定 Base Case -> 空间复杂度滚动数组降维。',
    corePrinciples: [
      '无后效性与最优子结构：过去的选择只能通过当前状态对未来产生影响，当前状态的最优解由历史子状态的最优解推演而来。',
      '背包分类：0-1 背包（容量从大到小逆序倒推防重复选取）、完全背包（容量从小到大正序推导允许多次选取）。',
      '空间压缩技巧：若状态转移仅依赖前一轮或前两个变量（如斐波那契/最长公共子序列），通过一维数组或滚动变量将 O(N*M) 优化为 O(M) 或 O(1)。'
    ],
    interviewerQuestions: [
      '零钱兑换 (Coin Change) 是求组合数还是排列数？遍历 coins 和 amount 的先后循环顺序有什么区别？',
      '最长递增子序列 (LIS) 如何通过贪心 + 二分查找将 O(N^2) 复杂度压至 O(N log N)？'
    ],
    modelAnswer: `回答遵循「DP 五步法」：
1. 明确 dp[i][j] 的实际物理含义；
2. 依据最后一步决策，推导状态转移方程；
3. 谨慎赋初值（Base Cases），处理非法状态（如赋正无穷防止被 Math.min 干扰）；
4. 明确遍历顺序（拓扑序/自底向上）；
5. 举出小规模数据手工模拟验证，并使用滚动数组压缩空间维度。`,
    commonPitfalls: [
      '未初始化 Base Case，或者初值赋为 0 导致取 min 时全被置零。',
      '背包问题内层循环方向写反，导致 0-1 背包被误算成了完全背包。'
    ],
    relatedCompanies: ['字节跳动', '阿里巴巴', '华为', '腾讯']
  },

  // --- 大厂系统设计与海量高并发 ---
  {
    id: 'kb-sys-01',
    title: '秒杀与突发高并发架构设计（百万级 QPS 流量削峰与防超卖）',
    category: 'system_design',
    difficulty: 'architecture',
    tags: ['系统设计', '秒杀', '防超卖', 'Redis Lua', '分层过滤'],
    summary: '全链路分层递进过滤设计：动静分离 CDN、网关限流、Redis Lua 原子扣减库存、异步 RocketMQ 排队落库。',
    corePrinciples: [
      '分层过滤核心思想：让 99% 的无效流量在前置网络层和缓存层过滤，严禁将未拦截流量直接冲击底层 MySQL。',
      '动静分离：秒杀详情页使用静态资源放入 CDN 边缘节点，客户端轮询或 WebSocket 获取秒杀开启令牌。',
      '防超卖与原子扣减：使用 Redis Lua 脚本原子执行 `if redis.call("get", key) >= n then decrby end`，库存扣减成功即代表获得资格。',
      '异步削峰落库：扣减成功的用户生成唯一订单号发送到消息队列，由消费者平滑入库并开启有效支付倒计时。'
    ],
    interviewerQuestions: [
      '如果有黑客通过多账号爬虫批量抢购，如何从安全网关层识别与拦截？',
      '如果用户抢到秒杀资格却在 15 分钟内未支付，库存如何平滑回补？',
      'Redis 扣减库存成功，但往 MQ 发消息失败怎么办？如何保证分布式事务一致性？'
    ],
    modelAnswer: `呈现架构师视角的全景解决方案：
1. 【安全与网关层】：秒杀 URL 动态混淆加盐（秒杀开始前不可见）、设备指纹与风控验证码拦截黑产、网关层使用令牌桶算法 (Token Bucket) 进行粗粒度限流；
2. 【业务缓存层】：Redis 预热商品库存，基于 Lua 脚本原子核销库存并记录已买用户 Set，彻底杜绝单人刷单与库存超卖；
3. 【异步消息解耦】：库存核销成功即向客户端返回「排队中」，后端发送可靠消息队列平滑驱动订单服务创建落库；
4. 【兜底与事务】：采用事务消息 (如 RocketMQ Transaction Message) 确保 Redis 预扣与消息投递的原子性，配合定时延迟消息进行未付款自动释放库存回补。`,
    commonPitfalls: [
      '依赖数据库行级锁 `for update` 做并发控制，导致数据库连接池秒级打满引发雪崩。',
      '未考虑 Redis 与 DB 库存不一致时的对账与补单机制。'
    ],
    relatedCompanies: ['阿里巴巴', '美团', '拼多多', '京东']
  },
  {
    id: 'kb-sys-02',
    title: '协同文档与实时多端画布：CRDT 与 OT 冲突解决架构',
    category: 'system_design',
    difficulty: 'architecture',
    tags: ['CRDT', 'OT', 'WebSocket', '实时协同', 'Yjs', 'Figma'],
    summary: '对比 Operation Transformation (OT) 与 Conflict-free Replicated Data Types (CRDT)，解析千万级协作画布的核心基建。',
    corePrinciples: [
      'OT（操作转换）：强依赖中心化服务器进行操作转换定序（如 Google Docs），客户端发送操作并根据服务端历史操作进行变换。',
      'CRDT（无冲突复制数据类型）：去中心化数学结构，任何节点在离线或乱序合并状态后，最终必然收敛到同一一致状态（满足交换律、结合律、幂等性）。',
      '状态型 (State-based) 与操作型 (Operation-based) CRDT：工业界（如 Yjs、Automerge）普遍采用针对字符数组或树形结构的紧凑压缩数据结构。'
    ],
    interviewerQuestions: [
      '多人频繁输入文字时，CRDT 产生的元数据（Lamport 时间戳、客户端 ID）会导致内存膨胀，现代库如何做 GC 和压缩？',
      '网络断开重连后，离线积累的大量操作如何做到毫秒级同步而不引起客户端界面卡顿？'
    ],
    modelAnswer: `结构化阐述工程落地难点与权衡：
1. 【选型对比】：OT 历史悠久但在弱网 P2P 或分支版本合并时极其脆弱，CRDT 具备天然去中心化收敛数学特性，更适合复杂图形画布与多分支协作；
2. 【网络同步架构】：客户端采用 WebSocket 与协同服务长连接维持心跳，底层采用二进制编码（如 lib0 / Protobuf）广播增量 Update 包；
3. 【内存与性能优化】：将连续按键合并为单个连续 Chunk，并在服务端设置快照机制，将历史全量操作日志定期压实（Snapshotting & Compaction）为单一快照；
4. 【渲染性能】：协同数据变更通过 State Hook 触发局部差异化计算，使用 Canvas/WebGL 进行批处理渲染，避免频繁触发整树 React 重渲染。`,
    commonPitfalls: [
      '只谈数学定义，不知道 Yjs 或 Automerge 底层双向链表以及 Item 分裂合并的具体细节。'
    ],
    relatedCompanies: ['飞书 (Lark)', '腾讯文档', 'Figma', '金山办公']
  },

  // --- 大模型与 AI 全栈 ---
  {
    id: 'kb-ai-01',
    title: '生产级 LLM 应用架构：Prompt Engineering、确定性 Guardrails 与双轨校验',
    category: 'ai_fullstack',
    difficulty: 'big_tech_must',
    tags: ['Gemini API', 'Guardrails', 'JSON Schema', 'Prompt工程', '幻觉抑制'],
    summary: '掌握企业级大模型应用如何摆脱「玩具级提示词」，落地 100% 确定性输出结构、安全围栏与流式交互。',
    corePrinciples: [
      '结构化输出保证：通过 Gemini API `responseMimeType: "application/json"` 结合 `responseSchema` 强制模型在生成阶段遵循严格的 JSON 语法树。',
      '防御注入与越狱：通过系统指令 (System Instructions) 确立不可逾越的角色边界，将用户未信任输入放置在特定分隔符内（如 `<user_context>`），防止提示词注入。',
      '双轨容错机制：当大模型输出偏离业务预期或发生网络异常时，系统必须具备确定性代码降级逻辑（Rule-based Fallback），保障主链路不中断。'
    ],
    interviewerQuestions: [
      '大模型在流式输出 (Streaming) 时，前端如何在尚未生成完毕的情况下渲染 Markdown 或结构化卡片？',
      '如何评估并抑制大模型在垂直业务场景中的幻觉 (Hallucination)？'
    ],
    modelAnswer: `展现前沿工程化实践：
1. 【规范约束】：拒绝靠自然语言祈使句约束格式，统一采用 SDK 原生强 Schema 约束 (responseSchema)，并在客户端辅以 Zod / TypeScript 类型双重校验；
2. 【安全护栏】：构建前置安全扫描（过滤恶意代码与注入字符）+ 中置角色隔离（System Instructions）+ 后置合规审计的全流程 Guardrails；
3. 【流式交互优化】：服务端采用 Server-Sent Events (SSE) 推流，前端使用支持容错的流式解析器（如 partial-json-parser），实现随打随显的高性能交互；
4. 【工程降级兜底】：当遇到模型限流 (429) 或服务降级时，利用本地缓存或预置高质量专家规则平滑兜底，确保核心功能 100% 可用。`,
    commonPitfalls: [
      '将关键 API Key 暴露在客户端浏览器中直接调用大模型，造成严重安全漏洞。',
      '完全信任大模型返回的文本，直接进行危险的 `eval()` 或 `innerHTML` 插入导致 XSS 攻击。'
    ],
    relatedCompanies: ['Google', 'OpenAI', '字节跳动', '百度', '阿里通义']
  },

  // --- 软技能、STAR 与薪资谈判 ---
  {
    id: 'kb-hr-01',
    title: '行为面试高分心法：STAR 原则实战化包装与领导力表达',
    category: 'behavioral',
    difficulty: 'foundation',
    tags: ['STAR原则', '行为面试', '领导力', '冲突管理', 'HR面'],
    summary: '运用 Situation (情境)、Task (任务)、Action (行动)、Result (结果) 深度提炼项目经历，将平淡故事讲成大厂认可的硬核落地案例。',
    corePrinciples: [
      'Situation（情境 15%）：简短阐明业务背景与核心痛点（时间紧、资源缺、架构老旧、并发爆涨）。',
      'Task（任务 15%）：明确你在其中承担的决定性角色，明确量化目标（如从 0 到 1 架构设计、性能提升 50%）。',
      'Action（行动 50% - 核心）：重点突出你的深度思考、技术选型权衡依据、攻坚挫折及团队协作机制，切忌通篇说“我们”，要讲清楚“我”做了什么。',
      'Result（结果 20%）：使用具体数据成果闭环（延迟降低 xx%、业务营收增加 xx、沉淀标准组件库被 xx 个团队复用）。'
    ],
    interviewerQuestions: [
      '请举一个你主导过的最具有挑战性的技术项目，遇到了什么挫折，最后如何破局？',
      '当产品经理提出的紧急需求与当前技术架构的稳定性产生严重冲突时，你如何处理？',
      '如果你跳槽进入新团队，发现现有代码极其混乱且缺乏测试，你会怎么开展工作？'
    ],
    modelAnswer: `标准回答示范（以性能攻坚为例）：
1. 【S - 背景】：在某电商核心大促前两个月，移动端首屏加载高达 3.8 秒，慢请求占比 18%，严重影响订单转化率；
2. 【T - 任务】：我作为性能调优专题负责人，目标是在大促前将首屏时间压降到 1 秒内，且 P99 响应延迟低于 80ms；
3. 【A - 行动】：
   - 我首先引入全链路 RUM 埋点，将白屏拆分为网络排队、水合阻塞和长任务三大维度进行精准归因；
   - 针对资源冗余，主导了路由级 Tree-shaking 并将首屏关键样式内联；
   - 针对主线程卡顿，运用 Web Worker 异步卸载复杂计算，并与后端协同建立 GraphQL 聚合接口；
4. 【R - 结果】：大促当天承受了历史最高 3.5 万 QPS 峰值，首屏 FCP 稳定在 0.65 秒，订单下单转化率提升 4.2%，该套调优 SDK 随后被推广到全集团 12 个核心业务线。`,
    commonPitfalls: [
      '通篇使用模糊形容词（如“效果很好”、“大大改善”），缺少基准对比与量化数据。',
      '将团队的功劳全部揽给自己，或者过度谦虚只讲团队导致面试官无法评估个人能力边界。'
    ],
    relatedCompanies: ['所有互联网大厂通用', '外企 (微软/亚马逊/Google)']
  },
  {
    id: 'kb-hr-02',
    title: '大厂薪酬谈判话术与多 Offer 博弈策略',
    category: 'behavioral',
    difficulty: 'foundation',
    tags: ['薪资谈判', 'Offer博弈', 'HR话术', '职级对应'],
    summary: '把握薪资沟通的黄金心理节奏，不露底牌、有理有据争取 Total Compensation (TC) 最大化。',
    corePrinciples: [
      '避免过早暴露具体数字底线：在未拿到正式评级前，先了解对方的薪酬宽带与职级职能对应范围。',
      '看重总包价值 (Total Compensation)：基本底薪 (Base) + 绩效奖金 + 签约金 (Sign-on Bonus) + 股票期权 (RSU) + 福利补贴。',
      '有效运用 Competing Offers：用其他大厂意向书作为强有力筹码，但始终表现出对当前公司业务与发展平台的真诚意愿。'
    ],
    interviewerQuestions: [
      '你期望的薪资是多少？如果达不到你的期望你还会考虑吗？',
      '你现在手头上还有哪些公司的 Offer？分别给了多少 package？',
      '你目前上一家公司的薪资流水是多少？'
    ],
    modelAnswer: `经典高情商沟通模式：
1. 【锚定价值而非流水】：委婉表达“上一家公司的薪资是两年前定的，这两年我承担了更多的架构与业务攻坚职责，我更关注当前岗位的市场价值与我的能力契合度”；
2. 【给出合理区间】：给出基于市场中上位的期望区间（如 30%-40% 上浮），留出协商余量；
3. 【联动谈判】：若 Base 现金受限于公司职级天花板，可主动争取签约奖金 (Sign-on Bonus) 或更多股票期权补偿；
4. 【多 Offer 礼貌博弈】：“我确实已经收到了 A 公司的意向 package，但综合考虑业务发展空间、技术团队深度以及产品前景，贵司一直是我最心仪的第一选择，如果薪资整体差距能缩小，我非常希望能尽快加入贵司贡献力量。”`,
    commonPitfalls: [
      '情绪化硬顶，或者用虚假的 Offer 撒谎被背调直接拉黑。',
      '过分在乎表面月薪，而忽略了年终奖比例虚高或股票归属期 (Vesting Schedule) 的陷阱。'
    ],
    relatedCompanies: ['腾讯', '阿里', '字节', '美团', '微软']
  }
];
