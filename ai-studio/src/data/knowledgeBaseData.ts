import { KnowledgeItem } from '../types/knowledge';

export const INITIAL_KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    id: 'kb-embedded-c-memory',
    title: 'C 语言内存模型 volatile 与并发可见性',
    category: 'frontend', difficulty: 'big_tech_must',
    tags: ['C', 'volatile', '内存屏障', 'ISR', '原子操作'],
    summary: '区分编译器优化、CPU 可见性与原子性，正确处理 ISR 和任务之间的共享状态。',
    corePrinciples: ['volatile 只约束编译器访问，不能保证复合操作原子性。', 'ISR 与任务共享数据需要结合临界区、原子操作或消息队列。', 'DMA 缓冲还需考虑 cache 一致性、所有权和内存屏障。'],
    interviewerQuestions: ['volatile 能否解决多线程竞态？', 'ISR 更新 32 位变量时何时需要临界区？', 'DMA 完成后 CPU 为什么可能仍读到旧数据？'],
    modelAnswer: '先明确 volatile 的作用是阻止编译器省略或合并访问，它不等价于锁，也不保证 read-modify-write 的原子性。对于 ISR 与任务共享状态，应根据数据宽度和平台原子能力选择短临界区、原子指令、队列或事件；涉及 DMA 时还要明确缓冲所有权，并在非一致性缓存平台执行 clean/invalidate 和必要的内存屏障。',
    commonPitfalls: ['把 volatile 当作线程安全工具', '在 ISR 中执行阻塞 API', '忽略 DMA 与 cache 一致性'],
    isBookmarked: true
  },
  {
    id: 'kb-embedded-rtos',
    title: 'FreeRTOS 中断到任务的数据通路设计',
    category: 'backend', difficulty: 'big_tech_must',
    tags: ['FreeRTOS', 'ISR', 'Queue', 'Task Notification', 'DMA'],
    summary: 'ISR 只完成最短路径的数据搬运和通知，把协议解析、Flash 写入等重操作放到任务上下文。',
    corePrinciples: ['使用 FromISR API，并在唤醒高优先级任务后请求上下文切换。', 'Task Notification 适合轻量事件，Queue/MessageBuffer 适合携带数据或流。', 'ring buffer 必须定义单生产者/单消费者约束、溢出策略和帧边界。'],
    interviewerQuestions: ['为何不能在 UART ISR 中直接解析 AT 命令并写 Flash？', 'Task Notification 与 Queue 如何选型？', '如何避免 DMA ping-pong 缓冲丢尾部字节？'],
    modelAnswer: 'UART/DMA ISR 中只读取完成标志、记录本次有效长度、切换缓冲并通过通知唤醒任务。任务消费 ring buffer，用 FSM 在连续字节流上识别文本和二进制帧。解析器不能在识别到一帧后直接 return 丢弃当前 DMA 块剩余字节；应持续推进游标，直到块被完整消费，并对溢出、半包和粘包定义恢复策略。',
    commonPitfalls: ['ISR 中做日志格式化或 Flash 操作', '混用普通 API 与 FromISR API', '提前 return 丢弃缓冲剩余数据'],
    isBookmarked: true
  },
  {
    id: 'kb-embedded-boot',
    title: '双镜像 Bootloader 与掉电安全 OTA',
    category: 'ai_fullstack', difficulty: 'architecture',
    tags: ['Bootloader', 'OTA', 'MCUboot', 'NOR Flash', '回滚'],
    summary: '从分区、镜像校验、Trailer 状态到应用确认，构建可恢复的升级生命周期。',
    corePrinciples: ['升级包写入非活动槽并完成完整性与签名校验。', 'Bootloader 负责试运行和回滚，应用在自检通过后确认镜像。', '状态推进遵循 NOR Flash 1→0 写入约束，并为掉电窗口设计幂等恢复。'],
    interviewerQuestions: ['什么时候擦除 sector，如何处理跨 page 写入？', '为什么 pending 和 corrupt 不能共用状态？', '升级后应用未确认会发生什么？'],
    modelAnswer: '将 Bootloader、Primary、Secondary 和共享数据划分为独立 Flash Area。写入前按 4KB sector 按需擦除，跨 256B page 分段写；完成后校验镜像哈希或签名。新镜像进入 TRYING，应用自检成功后写 CONFIRMED；若复位前未确认，Bootloader 将其判为失败并回滚。Trailer 使用可单向推进且可校验的状态字段，避免一次掉电造成不可判定状态。',
    commonPitfalls: ['应用未确认就永久切换', '只校验 CRC 而忽略签名和版本策略', '升级结束未清理镜像尾部'],
    relatedCompanies: ['IoT 芯片与终端厂商']
  },
  {
    id: 'kb-embedded-mesh',
    title: '私有 Mesh 的 TDMA 同步 去重与转发',
    category: 'system_design', difficulty: 'architecture',
    tags: ['Mesh', 'TDMA', 'PLL', 'EWMA', 'TTL', 'SEQ'],
    summary: '在受限广播包和不稳定无线链路下实现确定性调度、时间同步、去重、防环与概率转发。',
    corePrinciples: ['以超帧和 slot 划分 RF 收发窗口，回调只入队，协议处理在调度上下文执行。', '用相位误差、EWMA 与简化 PLL 平滑校时，配合锁定/失锁状态机。', '使用 SEQ 滑动窗口、TTL 和源地址去重抑制环路与广播风暴。'],
    interviewerQuestions: ['节点时钟漂移如何估计和校正？', '32 位时间回绕如何安全比较？', '为什么同步消息需要独立高优先级路径？'],
    modelAnswer: '以 200 ms 超帧划分业务和同步窗口。节点接收同步帧后计算期望 slot 边界与实际到达时间的相位误差，使用 EWMA 滤除瞬时抖动，再限制单次校正步长逐步对齐。连续样本进入阈值后锁定，超时或持续越界则失锁并随机退避重同步。数据转发使用 src+SEQ 去重、TTL 递减和概率转发，并将同步帧放在独立高优先级队列避免被业务数据饿死。',
    commonPitfalls: ['收到一帧就硬校时', '直接用有符号减法比较回绕计时器', '在 RF 回调中做完整协议解析'],
    isBookmarked: true
  },
  {
    id: 'kb-embedded-ble',
    title: 'BLE Coded PHY 与连接参数调优',
    category: 'system_design', difficulty: 'advanced',
    tags: ['BLE', 'Coded PHY', 'S=2', 'RSSI', 'PER', 'Connection Update'],
    summary: '理解编码增益、吞吐与时延权衡，并用实测数据定位共存、连接超时和信道差异。',
    corePrinciples: ['Coded PHY 以更低有效吞吐换取接收灵敏度和覆盖距离。', '连接 interval、latency 与 supervision timeout 必须满足规范约束。', '链路测试要记录距离、信道、包长、天线、发射功率、RSSI 和 PER。'],
    interviewerQuestions: ['S=2 与 S=8 的编码和吞吐差异是什么？', 'supervision timeout 配置错误会产生什么现象？', '如何设计可复现的多信道链路测试？'],
    modelAnswer: '先说明 Coded PHY 通过 FEC 和符号映射提升接收能力，同时降低有效吞吐。连接参数需要在功耗、时延与稳定性之间权衡，并保证 supervision timeout 大于连接事件允许的最大间隔。测试时固定硬件、功率和 payload，分距离与信道重复采样，分别统计接收包、丢包率和 RSSI，并保留原始数据以识别异常值。',
    commonPitfalls: ['只比较 RSSI 不统计丢包率', '没有固定发射功率和天线条件', '把 timeout 单位换算错误']
  },
  {
    id: 'kb-embedded-star',
    title: '嵌入式项目的 STAR 表达与证据边界',
    category: 'behavioral', difficulty: 'foundation',
    tags: ['STAR', '项目复盘', '量化', '背调'],
    summary: '用真实指标解释技术难点、个人行动和结果，同时区分完成、验证、推进与设计。',
    corePrinciples: ['背景聚焦产品约束和故障现象，行动突出个人负责的模块与取舍。', '结果使用测试项、距离、丢包率、测试数等可核验指标。', '未最终发布或未验收的工作使用“设计、推进、参与”，避免过度表述。'],
    interviewerQuestions: ['你解决过最难定位的嵌入式问题是什么？', '某个方案为什么这样选，替代方案是什么？', '如何证明结果由你的改动带来？'],
    modelAnswer: '示例：在 BLE→UART OTA 混合文本和二进制流中出现随机丢包。我通过 DMA 缓冲日志和解析游标复现问题，定位到解析器识别完整帧后提前 return，导致当前 DMA 块剩余字节被丢弃。随后将解析改为持续消费的 FSM，并把完整协议处理移出 ISR。回归覆盖半包、粘包和连续帧，升级链路恢复稳定。',
    commonPitfalls: ['只讲团队成果不说明个人负责边界', '使用无法核验的商业指标', '把正在设计的模块写成已量产']
  }
];
