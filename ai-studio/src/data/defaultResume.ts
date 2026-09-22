import { ResumeData } from '../types/resume';

export const DEFAULT_RESUME: ResumeData = {
  id: 'resume-embedded-2026',
  title: '嵌入式软件开发工程师',
  lastModified: '2026-09-22',
  personalInfo: {
    fullName: 'BLUE',
    jobTitle: '嵌入式软件开发工程师',
    email: 'mark_walen@qq.com',
    phone: '+110 xx11703136',
    location: '深圳 / 上海',
    expectedSalary: '18–20K',
  },
  summary: '4.4 年嵌入式软件开发经验，主要使用 C/C++ 与 Python，熟悉 RISC-V/TL321x、STM32、FreeRTOS、BLE/Coded PHY、私有 Mesh、Bootloader/OTA 与嵌入式存储。能够从底层驱动、无线协议栈和时序调度延伸到 CMake/Kconfig 构建系统、CLI 与 PC 测试工具，并通过链路测试、压力测试和抓包分析推动问题闭环。',
  skills: [
    { id: 'skill-embedded', category: '嵌入式与 RTOS', skills: ['C/C++', 'RISC-V / TL321x', 'STM32', 'FreeRTOS', 'ISR / DMA / PLIC', 'Linker Script', '低功耗与电机控制'] },
    { id: 'skill-wireless', category: '无线通信与协议', skills: ['BLE GATT / HCI / LL', 'Coded PHY S=2', '私有 Mesh / TDMA', 'LoRa', 'AT 通信', 'Proxy / Provisioning', 'AES-128'] },
    { id: 'skill-platform', category: '升级 存储与工程化', skills: ['Bootloader / 双镜像 OTA', 'MCUboot / MCUmgr', 'NOR Flash / NVS / Retention', 'CMake / Kconfig', 'GCC / Ninja', 'Python / Qt / CLI', 'Unity Test / pcapng'] },
    { id: 'skill-vision', category: '视觉与系统能力', skills: ['Linux / 树莓派', 'OpenCV / ORB-SLAM', 'YOLOv5', 'TOF / RGB / 多目相机', 'PyTorch', '原理图与 PCB Layout', '英文技术文档'] }
  ],
  workExperience: [
    {
      id: 'exp-yinfeng', company: '隐峰智创（深圳）科技有限公司', position: '嵌入式软件工程师', department: '研发部', location: '深圳', startDate: '2025-11', endDate: '2026-08', current: false,
      highlights: [
        '参与面向 TL321x RISC-V 无线 SoC 的 Lynx SDK、私有 BLE Mesh 与固件升级链路开发，覆盖底层驱动、协议栈、Bootloader、PC 工具与自动化测试。',
        '打通 BLE GATT→UART DMA→MCU Flash OTA 链路，设计 START/PKT/END/STATE 协议、CRC16、超时看门狗与会话所有权，并完成双槽 XIP、Flash Area 及 MCUboot/mcumgr 串口恢复验证。',
        '实现 200 ms TDMA 超帧、Mesh 同步与紧凑空口报文；使用 PLL/EWMA 与 O(1) 在线统计支持大规模节点校时，并完成 0.5–150 m Coded PHY 链路测试。',
        '建设 UART DMA 多实例驱动、设备模型、Initcall、AT Parser 及 CMake/Kconfig 模块系统；迭代 Lynx CLI 2.1，以 53 项测试覆盖核心命令和异常路径。'
      ],
      technologies: ['C/C++', 'TL321x', 'RISC-V', 'FreeRTOS', 'BLE Coded PHY', 'Mesh / TDMA', 'MCUboot', 'Python', 'CMake / Kconfig']
    },
    {
      id: 'exp-sihoo', company: '深圳西昊智能家居股份有限公司', position: '嵌入式软件工程师', location: '深圳', startDate: '2024-02', endDate: '2025-08', current: false,
      highlights: [
        '负责智能家具嵌入式方案开发，覆盖 STM32 电机控制、蓝牙音频、电疗按摩、热敷控制以及软硬件联调。',
        '基于树莓派 4B、YOLOv5 与双目 ORB-SLAM 完成相机标定、3D 定位、路径规划和机械臂厘米级抓取验证。',
        '独立完成智能头枕方案选型、BOM 优化、原理图与 PCB Layout，并基于杰理蓝牙芯片优化连接稳定性和功耗。'
      ],
      technologies: ['STM32F407', 'FreeRTOS', '杰理 MCU', 'Bluetooth Audio', 'OpenCV', 'ORB-SLAM', 'YOLOv5', 'uni-app']
    },
    {
      id: 'exp-lemu', company: '乐牧科技（深圳）有限公司', position: '嵌入式软件工程师', department: '研发部', location: '深圳', startDate: '2022-04', endDate: '2023-11', current: false,
      highlights: [
        '开发奶牛发情监测终端及 LoRa 中继设备，完成 BLE/LoRa 多平台协议栈迁移、低功耗优化、远距离数据上报和生产跟线。',
        '自研 LoRa 点对点及中继协议，在 STM32 + FreeRTOS 上实现任务调度、网络覆盖扩展和现场调试。',
        '交付公司首个独立 4G 网关项目，完成 LoRa Python 库迁移、4G 模组 AT/PPPoE/NAT 调试、Ubuntu 镜像定制及外部看门狗设计。'
      ],
      technologies: ['STM32', 'TI-RTOS', 'FreeRTOS', 'BLE', 'LoRa', '4G / AT', 'Linux', 'Python']
    }
  ],
  projects: [
    {
      id: 'proj-lynx', name: 'Lynx 无线通信 SDK 与私有 Mesh', role: '嵌入式软件开发', startDate: '2025-11', endDate: '2026-08',
      description: '面向 TL321x RISC-V 无线 SoC 的嵌入式平台，覆盖设备驱动、私有 BLE Mesh、固件升级、构建系统和测试工具。',
      highlights: [
        '设计 BLE/UART OTA、双镜像 XIP Bootloader 与 MCUboot/mcumgr 升级链路，完成镜像签名、test/confirm、失败回滚和应用确认流程验证。',
        '实现 RF/LL、Bearer、TDMA Scheduler、Network、Proxy 与 Provisioning 核心路径，以及 TTL/SEQ 去重、防环和紧凑位级封包。',
        '完成 BLE Coded PHY S=2 单/多信道测试；覆盖 0.5–150 m，CH10 丢包率在 0.5 m 为 0.08%、50 m 为 13.88%。'
      ],
      techStack: ['C', 'TL321x', 'RISC-V', 'FreeRTOS', 'BLE Coded PHY', 'TDMA', 'MCUboot', 'CMake', 'Python']
    },
    {
      id: 'proj-stereo-arm', name: '双目摄像头 3D 定位与机械臂控制', role: '嵌入式与视觉算法开发', startDate: '2024-09', endDate: '2025-04',
      description: '为电动桌面机械臂与人体工学椅扶手开发厘米级 3D 定位、路径规划和自适应抓取能力。',
      highlights: ['使用 STM32F407 完成电机控制，树莓派 4B 运行 YOLOv5 与双目 ORB-SLAM，完成标定、畸变校正及像素坐标到世界坐标映射。', '基于逆运动学和空间避障规划抓取与复位路径，实现目标物体实时 3D 定位和厘米级精度抓取。'],
      techStack: ['STM32F407', 'Raspberry Pi 4B', 'OpenCV', 'YOLOv5', 'ORB-SLAM', 'C++', 'Python']
    },
    {
      id: 'proj-headrest', name: '低功耗智能头枕', role: '软硬件方案与固件开发', startDate: '2024-02', endDate: '2024-09',
      description: '集成蓝牙音频、电疗按摩与热敷功能的智能头枕产品。',
      highlights: ['独立完成方案选型、BOM 优化、原理图及 PCB Layout，并协调电极片、热敷片、功放和喇叭供应商。', '基于杰理蓝牙芯片完成协议栈配置、连接稳定性与功耗优化，并以 uni-app 开发 App/微信小程序控制端。'],
      techStack: ['杰理蓝牙 MCU', 'C', 'Bluetooth Audio', 'PCB', '低功耗', 'uni-app']
    },
    {
      id: 'proj-gateway', name: 'LoRa 与 4G 独立网关', role: '嵌入式软件开发', startDate: '2022-06', endDate: '2023-11',
      description: '面向养殖场远程数据采集的低成本蓝牙/LoRa 网关与 4G 模组组合方案。',
      highlights: ['完成 LoRa Python 库迁移与私有点对点协议，调试 4G 模组 AT、PPPoE、NAT，并定制和备份 Ubuntu Linux 镜像。', '使用 STM32 周期检测网关心跳，以中断唤醒和 FreeRTOS 低功耗任务实现外部看门狗，提高无人值守运行的自动恢复能力。'],
      techStack: ['STM32', 'FreeRTOS', 'LoRa', '4G', 'AT', 'PPPoE / NAT', 'Ubuntu', 'Python']
    }
  ],
  education: [
    { id: 'edu-hncu', school: '湖南城市学院', degree: '本科', major: '计算机科学与技术', startDate: '2018-09', endDate: '2022-06', gpa: '3.7 / 4.0，专业排名 5 / 40', honors: ['校 ACM 队员（2019.03–2021.03）', '湖南省数学竞赛三等奖（2021.11）', '湖南城市学院数学竞赛一等奖（2021.06）'] }
  ],
  certificates: [
    { id: 'cert-cet4', name: 'CET-4', issuer: '全国大学英语四、六级考试委员会', date: '' },
    { id: 'award-math-2019', name: '湖南城市学院数学竞赛三等奖', issuer: '湖南城市学院', date: '2019-03' }
  ],
  customSections: [],
  sectionOrder: ['summary', 'skills', 'workExperience', 'projects', 'education', 'certificates']
};

export const defaultResume = DEFAULT_RESUME;
