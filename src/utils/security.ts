/**
 * Security & Anti-Virus File Inspection Engine
 * 防止注入病毒、脚本后门以及入侵后台
 */

export interface SecurityScanResult {
  isSafe: boolean;
  threatLevel: 'clean' | 'suspicious' | 'blocked';
  fileName: string;
  fileSize: number;
  mimeType: string;
  detectedThreats: string[];
  scanDetails: {
    extensionCheck: boolean;
    headerSignatureCheck: boolean;
    pathTraversalCheck: boolean;
    scriptInjectionCheck: boolean;
    promptInjectionCheck: boolean;
  };
  sanitizedContent?: string;
  scanTimestamp: string;
}

const CONTROL_CHARS = /[\u0000-\u001F\u007F]/;

export function sanitizeExternalUrl(value?: string): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed || CONTROL_CHARS.test(trimmed)) return undefined;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.toString() : undefined;
  } catch {
    return undefined;
  }
}

export function sanitizeImageUrl(value?: string): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (/^data:image\/(?:png|jpe?g|gif|webp);base64,[a-z0-9+/=\s]+$/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('blob:')) return trimmed;
  return sanitizeExternalUrl(trimmed);
}

export function sanitizeMarkdownUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || CONTROL_CHARS.test(trimmed)) return '';
  if (trimmed.startsWith('#') || trimmed.startsWith('/')) return trimmed;
  if (/^mailto:/i.test(trimmed)) return trimmed.replace(/[\r\n]/g, '');
  return sanitizeExternalUrl(trimmed) || '';
}

// 严禁上传的可执行脚本与危险二进制后缀黑名单
const BLOCKED_EXTENSIONS = new Set([
  'exe', 'dll', 'so', 'dylib', 'bat', 'cmd', 'sh', 'bash', 'zsh', 'ps1',
  'vbs', 'vbe', 'js', 'mjs', 'jsx', 'ts', 'tsx', 'php', 'py', 'rb', 'pl',
  'jar', 'war', 'apk', 'bin', 'msi', 'scr', 'com', 'pif', 'hta', 'cpl',
  'reg', 'wsf', 'scf', 'lnk', 'inf', 'sys', 'drv', 'app', 'elf'
]);

// 仅允许安全的辅助文档与媒体格式
const ALLOWED_EXTENSIONS = new Set([
  'txt', 'md', 'markdown', 'pdf', 'doc', 'docx', 'json', 'csv',
  'jpg', 'jpeg', 'png', 'webp', 'mp3', 'wav', 'm4a', 'aac', 'ogg',
  'mp4', 'webm', 'mov'
]);

// 潜在恶意脚本与注入特征库
const SCRIPT_INJECTION_PATTERNS = [
  /<script\b[^>]*>([\s\S]*?)<\/script>/gi,
  /javascript\s*:/gi,
  /vbscript\s*:/gi,
  /data\s*:\s*text\/html/gi,
  /<iframe\b[^>]*>/gi,
  /<embed\b[^>]*>/gi,
  /<object\b[^>]*>/gi,
  /onload\s*=/gi,
  /onerror\s*=/gi,
  /onclick\s*=/gi,
  /\b(eval|exec|Function|system|passthru|shell_exec|popen)\s*\(/gi,
  /__proto__|prototype\[/gi,
];

// 大模型恶意提示词劫持（Prompt Injection / Jailbreak）特征检测
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/gi,
  /output\s+(all\s+)?system\s+prompts/gi,
  /print\s+process\.env/gi,
  /expose\s+api\s*key/gi,
  /cat\s+\/etc\/passwd/gi,
  /rm\s+-rf/gi,
  /DROP\s+TABLE/gi
];

/**
 * 清洗并过滤文件名，防止路径穿越 (Path Traversal) 与空字节截断
 */
export function sanitizeFileName(rawName: string): string {
  let clean = rawName.replace(/[\/\\]/g, '_');
  clean = clean.replace(/\.\./g, '_');
  clean = clean.replace(/\0/g, '');
  // 去除不可见控制字符
  clean = clean.replace(/[\x00-\x1f\x7f-\x9f]/g, '');
  if (clean.length > 80) {
    const ext = clean.split('.').pop() || '';
    clean = clean.substring(0, 70) + '.' + ext;
  }
  return clean || 'sanitized_document.txt';
}

/**
 * 针对二进制文件的 Header 签名 (Magic Number) 深度核验
 */
async function checkBinarySignatures(file: File): Promise<{ passed: boolean; reason?: string }> {
  try {
    const slice = file.slice(0, 16);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // 1. 检查 Windows PE 可执行文件 (MZ: 0x4D, 0x5A)
    if (bytes[0] === 0x4D && bytes[1] === 0x5A) {
      return { passed: false, reason: '检测到伪装的 Windows PE 可执行文件头签名 (MZ header / Trojan payload)' };
    }

    // 2. 检查 Linux ELF 二进制签名 (0x7F, 'E', 'L', 'F')
    if (bytes[0] === 0x7F && bytes[1] === 0x45 && bytes[2] === 0x4C && bytes[3] === 0x46) {
      return { passed: false, reason: '检测到 Linux ELF 二进制可执行文件签名' };
    }

    // 3. 检查常见脚本标识符 (如 #!/bin/sh)
    if (bytes[0] === 0x23 && bytes[1] === 0x21) {
      return { passed: false, reason: '检测到 Unix Shell Script 引导头 (Shebang #!)' };
    }

    return { passed: true };
  } catch {
    return { passed: true };
  }
}

/**
 * 全面执行文件安全与防病毒多维扫描
 */
export async function scanUploadedFile(file: File): Promise<SecurityScanResult> {
  const threats: string[] = [];
  const fileName = sanitizeFileName(file.name);
  const ext = (fileName.split('.').pop() || '').toLowerCase();

  const details = {
    extensionCheck: true,
    headerSignatureCheck: true,
    pathTraversalCheck: true,
    scriptInjectionCheck: true,
    promptInjectionCheck: true,
  };

  // 1. 检查后缀名黑名单
  if (BLOCKED_EXTENSIONS.has(ext)) {
    threats.push(`高危拦截：文件后缀 [.${ext}] 属于可执行程序或潜在脚本木马，已完全阻断`);
    details.extensionCheck = false;
  }

  // 2. 检查后缀名白名单
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    threats.push(`格式受限：文件格式 [.${ext}] 不在受信任的辅助简历材料白名单中`);
    details.extensionCheck = false;
  }

  // 3. 检查路径穿越
  if (file.name.includes('../') || file.name.includes('..\\') || file.name.includes('\0')) {
    threats.push('安全警告：文件名包含目录穿越符号或空字节注入攻击尝试');
    details.pathTraversalCheck = false;
  }

  // 4. 二进制签名检查
  const binaryCheck = await checkBinarySignatures(file);
  if (!binaryCheck.passed) {
    threats.push(`病毒特征库匹配：${binaryCheck.reason}`);
    details.headerSignatureCheck = false;
  }

  // 5. 针对文本/文档内容进行深层脚本注入与提示词攻击扫描
  let sanitizedText = '';
  const isTextLike = ['txt', 'md', 'markdown', 'json', 'csv'].includes(ext);

  if (isTextLike && threats.length === 0) {
    try {
      const rawText = await file.text();
      let textToClean = rawText;

      // 检查 HTML / JS 脚本攻击
      for (const pattern of SCRIPT_INJECTION_PATTERNS) {
        if (pattern.test(rawText)) {
          threats.push('代码注入拦截：检测到嵌入的 HTML 脚本、eval 函数或跨站脚本 (XSS) 标记');
          details.scriptInjectionCheck = false;
          textToClean = textToClean.replace(pattern, '[BLOCKED_MALICIOUS_CODE]');
        }
      }

      // 检查 Prompt 劫持 / 逃逸
      for (const pattern of PROMPT_INJECTION_PATTERNS) {
        if (pattern.test(rawText)) {
          threats.push('AI 护栏触发：检测到疑似 Prompt 逃逸与系统指令覆盖语句');
          details.promptInjectionCheck = false;
          textToClean = textToClean.replace(pattern, '[BLOCKED_PROMPT_HIJACK]');
        }
      }

      sanitizedText = textToClean.slice(0, 30000); // 限制最大 30k 字符安全上限
    } catch {
      // 非纯文本异常
    }
  }

  const isSafe = threats.length === 0;
  const threatLevel: 'clean' | 'suspicious' | 'blocked' = isSafe
    ? 'clean'
    : threats.some(t => t.includes('高危') || t.includes('病毒') || t.includes('木马'))
    ? 'blocked'
    : 'suspicious';

  return {
    isSafe,
    threatLevel,
    fileName,
    fileSize: file.size,
    mimeType: file.type || 'application/octet-stream',
    detectedThreats: threats,
    scanDetails: details,
    sanitizedContent: sanitizedText,
    scanTimestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false })
  };
}
