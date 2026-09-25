export type LegalDocumentType = 'terms' | 'privacy' | 'collection';

export const LEGAL_EFFECTIVE_DATE = '2026-09-25';
export const USER_AGREEMENT_VERSION = '2026.09';
export const PRIVACY_POLICY_VERSION = '2026.09';

export const LEGAL_DOCUMENTS: Record<LegalDocumentType, {
  title: string;
  version: string;
  summary: string;
  sections: Array<{ heading: string; paragraphs?: string[]; items?: string[] }>;
}> = {
  terms: {
    title: '用户协议',
    version: USER_AGREEMENT_VERSION,
    summary: '本协议约定你使用 Resume Pilot 简历、求职管理、知识库与 AI 辅助功能时的权利与责任。',
    sections: [
      { heading: '一、服务说明', paragraphs: ['Resume Pilot 提供简历编辑、求职流程管理、面试复盘、知识整理及 AI 辅助功能。AI 生成内容仅供参考，重要申请材料和职业决策应由你自行核验。'] },
      { heading: '二、账户与安全', items: ['请提供真实、有效的账户信息，并妥善保管登录凭证。', '不得批量注册、绕过安全验证、爬取他人数据、干扰服务或利用服务从事违法活动。', '发现异常登录或安全问题时，请及时修改密码并通过问题反馈联系我们。'] },
      { heading: '三、你的内容', paragraphs: ['你保留对自己上传或创建内容的权利，并授权平台仅在提供、同步、备份和改进你所请求服务所必需的范围内处理这些内容。公开发布或分享前，请确认内容不含无权披露的个人信息或商业秘密。'] },
      { heading: '四、第三方与 AI 服务', paragraphs: ['当你主动配置第三方 AI 服务时，相应请求内容会发送给你选择的服务商，并适用该服务商的条款与隐私规则。平台不会在云端保存你填写的第三方 API Key。'] },
      { heading: '五、服务变更与责任', paragraphs: ['我们会努力保障服务连续性与数据安全，但网络、云服务、第三方接口等因素可能造成暂时不可用。对重大变更，我们会通过页面提示或其他合理方式告知。'] },
    ],
  },
  privacy: {
    title: '隐私政策',
    version: PRIVACY_POLICY_VERSION,
    summary: '本政策说明 Resume Pilot 如何收集、使用、存储、共享和保护你的个人信息。',
    sections: [
      { heading: '一、我们如何收集和使用信息', items: ['账户信息用于注册、登录、身份验证和账户找回。', '简历、求职、面试、知识库及工作记录用于提供编辑、同步和恢复服务。', '设备与安全日志用于防机器人、防攻击、故障排查和保障账户安全。', '你主动提交的问题反馈用于定位问题和改进产品。'] },
      { heading: '二、存储与保留', paragraphs: ['账户认证由 Google Identity Platform 提供；业务数据存储在 Google Cloud。浏览器可能保存界面偏好、本地加密配置和待同步附件。我们仅在实现服务、履行法律义务或处理争议所需期间保留信息。你可通过账户功能修改信息，并可联系我们处理删除请求。'] },
      { heading: '三、共享与委托处理', paragraphs: ['我们不会出售个人信息。为提供服务，Google Cloud、Identity Platform、Cloud SQL、Cloud Storage 等基础设施可能作为受托处理方处理必要数据；你主动选择的 AI 服务商仅在你发起请求时接收相关内容。'] },
      { heading: '四、你的权利', items: ['访问、更正和更新账户资料。', '导出、删除你创建的业务数据，或申请注销账户。', '撤回非必要授权；撤回不会影响撤回前处理的合法性。', '对自动化生成结果提出异议并选择不采用。'] },
      { heading: '五、安全与未成年人', paragraphs: ['我们采取身份验证、访问隔离、传输加密和安全审计等措施。Resume Pilot 面向具备完全民事行为能力的求职者；未成年人应在监护人同意和指导下使用。'] },
      { heading: '六、联系我们', paragraphs: ['你可通过应用内“问题反馈”提交隐私、安全、数据访问或删除请求。我们会在核验身份后处理。'] },
    ],
  },
  collection: {
    title: '个人信息收集清单',
    version: PRIVACY_POLICY_VERSION,
    summary: '下面按使用场景列出处理的信息、目的、是否必要及保存位置。',
    sections: [
      { heading: '账户注册与登录（必要）', items: ['信息：邮箱、用户标识、昵称、头像、登录方式、邮箱验证状态。', '目的：创建账户、身份验证、找回密码和多账户切换。', '保存：Google Identity Platform；必要的用户标识同步至 Cloud SQL。'] },
      { heading: '简历与求职工作台（按功能必要）', items: ['信息：简历、联系方式、教育与工作经历、求职记录、面试记录、知识笔记和工作日志。', '目的：编辑、分析、跨设备同步、备份与恢复。', '保存：Cloud SQL；由你创建或导入，停止使用相应功能即可不提供。'] },
      { heading: '音视频及附件（可选）', items: ['信息：面试录音、视频和其他附件。', '目的：回放、复盘和跨设备同步。', '保存：Cloud Storage；上传前可能暂存在浏览器 IndexedDB。'] },
      { heading: 'AI 服务配置与请求（可选）', items: ['信息：服务商、模型名称、推理偏好及你主动提交给模型的内容。', '目的：完成生成、翻译、分析和优化。', '保存：配置元数据可随工作区同步；第三方 API Key 仅在本机加密保存，不上传平台数据库。请求内容会发送至你选择的 AI 服务商。'] },
      { heading: '反馈与安全日志（必要或你主动提供）', items: ['信息：反馈内容、联系邮箱、页面上下文；IP、时间、浏览器与安全验证结果等技术信息。', '目的：客户支持、防机器人、防欺诈、故障诊断与安全审计。', '保存：Cloud SQL 及 Google Cloud 安全日志；按安全和合规所需期限保留。'] },
      { heading: '本地存储', items: ['信息：主题、已知账户提示、同步状态、本地草稿、加密后的模型密钥及本地加密材料。', '目的：提供离线体验、界面偏好和本地密钥保护。', '控制：可通过浏览器站点数据设置清除；清除前请确认数据已同步。'] },
    ],
  },
};
