# Resume Pilot 工程文档

本目录汇总以下两段任务中的产品决策、已交付能力与后续约束：

- 当前 Resume Pilot 开发任务；
- `codex://threads/01a0ad2c-e942-7513-95cf-7a7e89ed046b`，包括工作证据提取、嵌入式简历、编辑/导出、AI 服务配置与早期站点迭代。

文档集：

1. [产品需求](./01-product-requirements.md)
2. [系统架构](./02-architecture.md)
3. [数据、同步与恢复](./03-data-sync-recovery.md)
4. [安全与隐私](./04-security-privacy.md)
5. [测试计划](./05-test-plan.md)
6. [需求追踪与路线图](./06-traceability-roadmap.md)

基线版本：`0.12.0`。生产环境使用 GCP Cloud Run、Identity Platform、Cloud SQL for PostgreSQL 与 Cloud Storage。
