import { KnowledgeBook } from '../types/knowledge';

export const DEFAULT_LEETBOOKS: KnowledgeBook[] = [
  {
    id: 'book-rtos-drivers',
    title: '嵌入式 C 与 RTOS 驱动实战',
    subtitle: '中断、DMA、并发、内存与设备模型',
    category: 'backend',
    author: '个人嵌入式知识库',
    badge: '核心基础',
    coverGradient: 'from-slate-900 via-slate-800 to-slate-900',
    description: '围绕 C 语言底层、FreeRTOS、UART/DMA、ISR、ring buffer 与设备模型整理高频面试和真实问题定位方法。',
    difficulty: 'big_tech_must',
    createdAt: '2026-09-22', updatedAt: '2026-09-22',
    chapters: [
      {
        id: 'rtos-ch-1', title: '第 1 章 中断 DMA 与任务协作', order: 1,
        sections: [
          {
            id: 'rtos-sec-1', title: 'UART DMA 接收与零丢包解析', order: 1, estimatedMinutes: 10, isCompleted: true,
            tags: ['UART', 'DMA', 'ISR', 'Ring Buffer', 'FSM'],
            keyTakeaways: ['ISR 只做最短路径', '持续消费 DMA 块全部有效字节', '以 FSM 处理半包 粘包和混合流'],
            content: '### 设计目标\n\nUART DMA 接收链路要明确缓冲所有权、有效长度、生产者和消费者边界。ISR 负责确认 DMA 完成、切换缓冲并通知任务；任务把数据写入 ring buffer，再用状态机解析文本与二进制帧。\n\n### 典型故障\n\n识别到完整帧后直接 `return`，会丢弃当前 DMA 块尚未消费的剩余字节。正确做法是推进游标，直到有效区全部处理完毕，并为溢出、非法长度和 CRC 失败设计恢复点。'
          },
          {
            id: 'rtos-sec-2', title: 'FreeRTOS 同步原语与 ISR 安全 API', order: 2, estimatedMinutes: 9, isCompleted: false,
            tags: ['FreeRTOS', 'Task Notification', 'Queue', 'EventGroup'],
            content: '### 选型原则\n\nTask Notification 适合单任务轻量事件；Queue 适合结构化消息；MessageBuffer 适合字节流；EventGroup 适合多个状态位组合。ISR 中必须使用 `FromISR` 版本并根据唤醒结果请求上下文切换。避免在中断中做 Flash、日志格式化和复杂协议解析。'
          }
        ]
      }
    ]
  },
  {
    id: 'book-wireless-mesh',
    title: 'BLE 与私有 Mesh 协议栈',
    subtitle: 'Coded PHY、TDMA、时间同步与紧凑空口协议',
    category: 'system_design',
    author: '个人嵌入式知识库',
    badge: '无线通信',
    coverGradient: 'from-blue-800 via-blue-700 to-cyan-700',
    description: '梳理 BLE GATT/HCI/LL、Coded PHY、私有 Mesh 分层、200 ms TDMA 超帧、PLL/EWMA 校时和链路测试。',
    difficulty: 'architecture',
    createdAt: '2026-09-22', updatedAt: '2026-09-22',
    chapters: [
      {
        id: 'mesh-ch-1', title: '第 1 章 TDMA 与时间同步', order: 1,
        sections: [
          {
            id: 'mesh-sec-1', title: '200 ms 超帧与 PLL EWMA 校时', order: 1, estimatedMinutes: 12, isCompleted: true,
            tags: ['TDMA', 'PLL', 'EWMA', '同步'],
            keyTakeaways: ['以相位误差驱动平滑校正', '限制单次修正避免破坏当前 slot', '明确锁定 失锁和随机重同步'],
            content: '### 超帧结构\n\n业务系统采用 200 ms 超帧，并在 1 s 周期末尾保留同步收集窗口。节点用同步帧到达时间与本地期望边界计算相位误差，通过 EWMA 滤除瞬时抖动，再由简化 PLL 调整本地时间基。\n\n### 工程边界\n\n需要处理 32 位计时器回绕、样本空窗、异常值和失锁。面向大量样本时采用 O(1) 在线统计，同时保留采样缓冲用于调试。'
          }
        ]
      },
      {
        id: 'mesh-ch-2', title: '第 2 章 空口协议与链路验证', order: 2,
        sections: [
          {
            id: 'mesh-sec-2', title: '37 字节紧凑广播包与多跳转发', order: 1, estimatedMinutes: 10, isCompleted: false,
            tags: ['Bit Packing', 'SEQ', 'TTL', 'CRC16'],
            content: '### 报文设计\n\n在 MAC 6 B 与 AdvData 31 B 约束下，使用 bit writer 编码 NetKey、类型、src/dst、SEQ、双 TTL、转发概率、最长 20 B PDU 和 CRC16。接收侧使用 src+SEQ 滑动窗口去重，TTL 逐跳递减，并通过概率转发降低广播风暴。'
          }
        ]
      }
    ]
  },
  {
    id: 'book-boot-storage',
    title: 'Bootloader OTA 与嵌入式存储',
    subtitle: '双镜像、MCUboot、Flash Area、NVS 与掉电恢复',
    category: 'ai_fullstack',
    author: '个人嵌入式知识库',
    badge: '可靠性',
    coverGradient: 'from-emerald-800 via-teal-700 to-cyan-700',
    description: '从镜像分区和升级状态机延伸到 NOR Flash 写入约束、MCUboot/mcumgr、Retention 与 log-structured NVS。',
    difficulty: 'architecture',
    createdAt: '2026-09-22', updatedAt: '2026-09-22',
    chapters: [
      {
        id: 'boot-ch-1', title: '第 1 章 可回滚固件升级', order: 1,
        sections: [
          {
            id: 'boot-sec-1', title: '双槽状态机与应用确认', order: 1, estimatedMinutes: 12, isCompleted: true,
            tags: ['Bootloader', 'XIP', 'MCUboot', 'Trailer'],
            keyTakeaways: ['升级写入非活动槽', 'Bootloader 回滚 应用确认', '状态更新必须掉电可恢复'],
            content: '### 生命周期\n\n升级包写入 Secondary，校验完成后标记为待试运行。Bootloader 启动新镜像，应用完成自检后写确认标志；若超时或复位前未确认，则下次启动回滚旧镜像。\n\n### Flash 约束\n\n按 4 KB sector 擦除、跨 256 B page 分段写入。Trailer 状态采用单向清零，配合 CRC 或冗余字段，使任意掉电点都能恢复到可判定状态。'
          }
        ]
      },
      {
        id: 'boot-ch-2', title: '第 2 章 NVS 与 Retention', order: 2,
        sections: [
          {
            id: 'boot-sec-2', title: '资源受限设备的日志结构 KV', order: 1, estimatedMinutes: 10, isCompleted: false,
            tags: ['NVS', 'GC', 'Wear Leveling', 'CRC'],
            content: '### 核心设计\n\n使用追加写记录保存 KV，启动时扫描有效记录并重建索引。记录包含 key、长度、版本和 CRC；删除使用 tombstone。GC 时把最新有效记录搬迁到空 sector，再擦除旧 sector。需要限制 GC 预算，处理断电、bad sector 和高频 SEQ checkpoint 的磨损。'
          }
        ]
      }
    ]
  }
];
