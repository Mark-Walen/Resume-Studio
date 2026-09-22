import { InterviewRecord } from '../types/interview';
import { JobApplication } from '../types/job';

export const INITIAL_JOB_APPLICATIONS: JobApplication[] = [
  {
    id: 'job-embedded-1',
    companyName: '大疆创新（DJI）',
    position: '嵌入式软件工程师（无线通信方向）',
    salaryExpectation: '18k–20k',
    location: '深圳',
    status: 'wishlist',
    priority: 'high',
    source: '目标公司清单',
    jobDescription: '负责 MCU/RTOS 平台、无线通信协议、驱动与系统稳定性开发，关注 C/C++、FreeRTOS、BLE 与调试能力。',
    wishlistTargetDate: '2026-10-01',
    updatedAt: '2026-09-22',
    notes: '重点匹配私有 Mesh、TDMA、Coded PHY、Bootloader/OTA 与底层驱动经历。',
    companyDossier: {
      teamAndTechStack: '岗位可能涉及 C/C++、ARM/RISC-V、RTOS、BLE/Wi-Fi、通信协议与硬件联调，具体以正式 JD 和面试沟通为准。',
      keyInterviewStyle: '重点准备 C 语言底层、RTOS 调度与同步、DMA/中断、通信协议、系统调试和项目复盘。',
      reverseQuestions: ['团队当前主要 MCU/RTOS 平台与无线协议是什么？', '该岗位在驱动、协议栈和系统应用之间的职责比例如何？'],
      riskAlerts: ['薪资、团队与岗位细节需要通过正式渠道确认。']
    }
  },
  {
    id: 'job-embedded-2',
    companyName: '乐鑫科技（Espressif）',
    position: 'IoT 嵌入式软件工程师',
    salaryExpectation: '18k–20k',
    location: '上海',
    status: 'wishlist',
    priority: 'high',
    source: '目标公司清单',
    jobDescription: '面向 IoT 芯片与 SDK 的驱动、网络连接、低功耗、系统组件和开发工具建设。',
    wishlistTargetDate: '2026-10-03',
    updatedAt: '2026-09-22',
    notes: '突出 Lynx SDK、CMake/Kconfig、UART DMA、设备模型、NVS/Retention 与 CLI 工具链经验。'
  },
  {
    id: 'job-embedded-3',
    companyName: 'Nordic Semiconductor',
    position: 'Embedded Software Engineer',
    salaryExpectation: '面议',
    location: '深圳 / 上海',
    status: 'wishlist',
    priority: 'high',
    source: '目标公司清单',
    jobDescription: '低功耗无线 SoC、BLE 协议栈、RTOS、驱动、Bootloader 与开发者工具相关岗位。',
    wishlistTargetDate: '2026-10-06',
    updatedAt: '2026-09-22',
    notes: '英文简历重点突出 BLE GATT/HCI/LL、Coded PHY S=2、0.5–150 m 链路测试与 MCUboot/mcumgr。'
  },
  {
    id: 'job-embedded-4',
    companyName: '华为终端',
    position: '嵌入式软件开发工程师',
    salaryExpectation: '18k–20k',
    location: '深圳',
    status: 'wishlist',
    priority: 'medium',
    source: '目标公司清单',
    jobDescription: '终端设备驱动、RTOS、通信协议、可靠性与性能优化。',
    wishlistTargetDate: '2026-10-08',
    updatedAt: '2026-09-22',
    notes: '准备 C/C++、操作系统、数据结构、硬件接口与问题定位案例。'
  },
  {
    id: 'job-embedded-5',
    companyName: '涂鸦智能',
    position: 'IoT 固件工程师',
    salaryExpectation: '18k–20k',
    location: '深圳 / 上海',
    status: 'wishlist',
    priority: 'medium',
    source: '目标公司清单',
    jobDescription: 'IoT 设备固件、无线连接、OTA、低功耗、量产测试与平台适配。',
    wishlistTargetDate: '2026-10-10',
    updatedAt: '2026-09-22',
    notes: '突出 OTA、BLE/LoRa、低功耗产品、生产跟线与多平台迁移经验。'
  }
];

export const INITIAL_INTERVIEW_RECORDS: InterviewRecord[] = [
  {
    id: 'iv-embedded-mock-1',
    companyName: '嵌入式岗位模拟面试',
    position: '嵌入式软件开发工程师',
    round: '技术模拟面试',
    date: '2026-09-22 20:00',
    interviewer: 'AI 嵌入式面试官',
    interviewFormat: '模拟面试',
    interviewNotes: '围绕 OTA/Bootloader、FreeRTOS、UART DMA 和私有 Mesh 项目进行简历深挖，重点检查项目边界、状态机设计与异常恢复表达。',
    questions: [
      {
        id: 'q-embedded-1',
        question: '双镜像 Bootloader 如何设计状态转换、应用确认和失败回滚？为什么状态位适合采用单向清零？',
        category: 'Bootloader / OTA',
        userAnswer: '能够说明 Primary/Secondary、TRYING/CONFIRMED/INVALID 状态和应用确认，但需要进一步解释断电窗口、Trailer 原子性与 NOR Flash 擦写约束。',
        struggleLevel: 'average',
        solution: {
          coreConcept: '镜像状态机、掉电安全、NOR Flash 1→0 写入约束与回滚闭环。',
          modelAnswer: '先说明升级写入非活动槽并完成哈希/签名校验；Bootloader 将新镜像标记为待试运行并切换启动槽。应用完成自检后写入确认标志，否则看门狗复位后由 Bootloader 回滚。Trailer 状态采用单向清零，可在不擦除整个 sector 的情况下完成幂等状态推进，降低掉电导致状态不一致的风险；同时需要冗余字段、CRC 或可恢复写入顺序保护关键窗口。',
          commonMistakes: ['把 pending 与 corrupt 复用为同一状态', '由 Bootloader 替应用确认成功', '忽略跨 page 写入和掉电恢复'],
          strategyNextTime: '按写入、校验、试运行、应用确认、失败回滚五个阶段回答，再补充每个阶段的掉电恢复策略。',
          keyTakeaway: 'Bootloader 负责选择与回滚，应用负责确认；状态更新必须满足掉电可恢复和 Flash 写入约束。'
        }
      },
      {
        id: 'q-embedded-2',
        question: '为什么 UART DMA 接收中不应在 ISR 内完成完整帧解析？如何避免混合文本和二进制流丢字节？',
        category: '驱动 / DMA / 并发',
        userAnswer: '说明了 ISR 只搬运数据并通知任务，主循环或任务使用 ring buffer 与 FSM 解析；能够结合 DMA 缓冲剩余字节被提前 return 丢弃的问题。',
        struggleLevel: 'answered_well'
      },
      {
        id: 'q-embedded-3',
        question: '200 ms TDMA 超帧中如何完成节点同步、漂移校正和失锁重同步？',
        category: '无线 Mesh / TDMA',
        userAnswer: '能够描述同步帧采集、PLL/EWMA、slot 重对齐和超时重同步，但对收敛时间、抖动上界和时钟漂移量化说明仍可加强。',
        struggleLevel: 'struggled',
        solution: {
          coreConcept: '相位误差估计、低通滤波、锁定判据、超时与随机退避重同步。',
          modelAnswer: '接收节点以同步帧到达时间与本地期望 slot 边界计算相位误差，使用 EWMA 抑制瞬时抖动，再由简化 PLL 逐步修正本地时间基，避免一次性跳变破坏当前收发窗口。连续若干样本误差落入阈值后进入 LOCKED；长时间无样本或误差持续越界则进入失锁，并随机退避重新扫描同步信道。面试中应同时给出超帧长度、采样窗口、锁定阈值和最大校正步长。',
          commonMistakes: ['收到一帧就直接硬校时', '只讲平均值而不讲异常值与失锁检测', '忽略 32 位计时器回绕'],
          strategyNextTime: '先画时间轴，再按采样、估计、滤波、校正、锁定、失锁六步回答，并给出项目中的 200 ms 超帧参数。',
          keyTakeaway: '同步算法要在收敛速度与时序稳定性之间权衡，并明确失锁后的恢复路径。'
        }
      }
    ],
    aiSummary: {
      overview: '项目经历与岗位匹配度较高，OTA、无线协议和工程化链路完整；需要继续加强关键参数、边界条件与异常恢复的量化表达。',
      overallScore: 84,
      candidateStrengths: ['能够从驱动层讲到协议与工具链', '真实问题定位案例充分', '无线测试数据和 OTA 状态机具有辨识度'],
      areasToImprove: ['回答同步算法时补充误差阈值与收敛指标', '区分已完成、已验证和设计中的模块', '对中断、并发与内存所有权使用更标准的术语'],
      communicationFeedback: '建议先给结论和架构图，再展开状态、数据流与异常路径，减少按开发时间线叙述。'
    },
    createdAt: '2026-09-22',
    updatedAt: '2026-09-22'
  }
];

export const mockInterviews = INITIAL_INTERVIEW_RECORDS;
