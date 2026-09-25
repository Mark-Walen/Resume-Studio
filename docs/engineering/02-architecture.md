# 系统架构

## 1. 组件

- Web：React、TypeScript、Vite、Tailwind CSS。
- 身份：Google Identity Platform / Firebase Auth。
- 应用服务：Cloud Run 上的 Vite 中间件 API。
- 数据库：Cloud SQL for PostgreSQL，通过 IAM 数据库身份和 Cloud SQL Connector 连接。
- 附件：Google Cloud Storage，使用短时上传会话。
- AI：Provider 适配层，支持 Google、OpenAI、Anthropic、xAI、DeepSeek、Z.ai 和兼容端点。

## 2. 前端分层

- `AuthGate`：游客/登录用户边界。
- `App`：工作区状态、导航、同步协调和全局弹窗。
- 领域组件：简历、投递、面试、知识、手记。
- 服务层：身份、AI、工作区同步、附件、反馈和专栏发布。
- 本地持久化：按用户 UID 隔离的 localStorage；二进制临时缓存使用 IndexedDB。

重型模块采用动态导入：App、简历编辑/预览、导出、面试看板、知识阅读器、块编辑器及全局弹窗均在需要时加载。

## 3. 服务端边界

- `/api/workspace`：GET、PATCH 增量更新、PUT 全量更新。
- `/api/workspace/sync`：首次登录迁移或读取云端工作区。
- `/api/workspace/restore-points`：列出/创建还原点。
- `/api/workspace/restore`：回滚指定还原点。
- `/api/media/*`：附件上传与读取。
- `/api/knowledge-books/*`：个人专栏发布、撤回与社区读取。
- `/api/translate-resume`：忠实翻译或面向目标地区的简历本地化。
- `/api/models` 与 AI 业务端点：统一 Provider 适配。

## 4. 关键设计决策

- 翻译永远生成新简历，不覆盖源简历。
- 社区发布副本移除个人阅读高亮、笔记和学习进度。
- AI Key 不进入 Cloud SQL；云端只同步不含密钥的模型配置元数据。
- 浏览器辅助抓取与服务端代理是两层方案：受登录/验证保护的站点优先使用用户浏览器正文，公开页面可用受限服务端浏览器。
- 当前专栏分享链接要求登录，符合“游客仅公开首页”的产品边界。
