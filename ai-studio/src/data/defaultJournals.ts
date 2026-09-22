import { WorkDailyLog } from '../types/journal';

export const INITIAL_WORK_DAILY_LOGS: WorkDailyLog[] = [
  {
    id: 'log-ota',
    date: '2026-08-18',
    projectOrModuleName: 'MCUboot / MCUmgr 双槽升级链路',
    category: 'stability',
    tasksCompleted: '完成镜像签名、Serial Recovery、双槽升级、image test/confirm、reset 与应用确认流程验证。',
    challengesAndSolutions: '围绕 header 0x1000、slot 0x68000、Trailer flag 与串口传输边界进行联调；通过分阶段校验和应用确认避免未验证镜像被永久接受。',
    quantifiableMetrics: '完成 UART2 115200 串口恢复与双槽生命周期测试，覆盖升级、试运行、确认和回滚关键路径。',
    technologiesUsed: ['MCUboot', 'MCUmgr', 'imgtool', 'UART', 'NOR Flash', 'C'],
    evidences: [{ id: 'ev-ota', type: 'doc_link', title: 'MCUboot 双槽升级与 Trailer 状态验证记录' }],
    extractedToResume: true,
    createdAt: '2026-08-18T18:00:00Z',
    updatedAt: '2026-08-18T18:00:00Z'
  },
  {
    id: 'log-phy',
    date: '2026-06-11',
    projectOrModuleName: 'BLE Coded PHY S=2 链路测试',
    category: 'performance',
    tasksCompleted: '完成单信道与多信道室内/户外测试，覆盖 0.5–150 m，记录 RSSI、收发包数和丢包率。',
    challengesAndSolutions: '设计 START/DATA/END 状态机和 22→34→39→10 跳频序列，识别异常 RSSI 与缺失数据，并按距离和信道整理对比报告。',
    quantifiableMetrics: 'CH10 丢包率：0.5 m 0.08%、50 m 13.88%、100 m 约 45%、150 m 93%。',
    technologiesUsed: ['BLE Coded PHY', 'Telink LL', 'Timer0', 'FreeRTOS', 'RSSI / PER', 'Excel'],
    evidences: [{ id: 'ev-phy', type: 'performance_report', title: 'BLE Coded PHY 室内及户外链路测试报告.xlsx' }],
    extractedToResume: true,
    createdAt: '2026-06-11T18:00:00Z',
    updatedAt: '2026-06-11T18:00:00Z'
  },
  {
    id: 'log-sync',
    date: '2026-04-22',
    projectOrModuleName: '私有 Mesh 时间同步与 TDMA 调度',
    category: 'architecture',
    tasksCompleted: '实现 200 ms TDMA 超帧、同步帧采集、PLL/EWMA 校时、锁定/失锁检测与 slot 重对齐。',
    challengesAndSolutions: '样本数组在大规模节点下占用过高，改用 O(1) 在线统计；保留可配置采样缓冲用于调试，并通过 pcapng 与双设备日志还原超帧对齐。',
    quantifiableMetrics: '面向最多约 1000 个同步样本，将统计存储从线性数组降为常量空间。',
    technologiesUsed: ['C', 'TDMA', 'PLL', 'EWMA', 'FreeRTOS', 'pcapng'],
    evidences: [{ id: 'ev-sync', type: 'doc_link', title: 'Mesh Sync 状态机与双设备抓包分析' }],
    extractedToResume: true,
    createdAt: '2026-04-22T18:00:00Z',
    updatedAt: '2026-04-22T18:00:00Z'
  },
  {
    id: 'log-cli',
    date: '2026-05-28',
    projectOrModuleName: 'Lynx CLI 2.1 与嵌入式 SDK 工具链',
    category: 'engineering',
    tasksCompleted: '接入 CMake/Kconfig、Ninja/Make、Telink 下载工具和 MCUmgr，完成 resolver、backend、flash/device 命令与错误归一化。',
    challengesAndSolutions: '将板级硬件描述、项目依赖和工作区默认值分层，区分 raw 地址烧录与 image 生命周期更新，并把厂商差异封装在 FlashBackend。',
    quantifiableMetrics: 'Phase 2/2.1 共 53 项测试通过，覆盖核心命令、能力校验、进度输出和异常路径。',
    technologiesUsed: ['Python', 'CMake', 'Kconfig', 'Ninja', 'MCUmgr', 'Poetry'],
    evidences: [{ id: 'ev-cli', type: 'performance_report', title: 'Lynx CLI 2.1 测试结果（53 项）' }],
    extractedToResume: true,
    createdAt: '2026-05-28T18:00:00Z',
    updatedAt: '2026-05-28T18:00:00Z'
  }
];
