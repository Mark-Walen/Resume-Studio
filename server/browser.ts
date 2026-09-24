import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { chromium } from 'playwright-core';

const BROWSER_HOST_ALLOWLIST = [
  'zhipin.com',
  'lagou.com',
  'liepin.com',
  'linkedin.com',
  'jobs.51job.com',
];

const BLOCKED_HOSTS = new Set([
  'localhost',
  'metadata.google.internal',
  'metadata',
  'kubernetes.default.svc',
]);

function isPrivateAddress(address: string): boolean {
  const normalized = address.toLowerCase().replace(/^::ffff:/, '');
  if (normalized === '::1' || normalized === '::' || normalized.startsWith('fe80:') || normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(normalized)) return false;
  const [a, b] = normalized.split('.').map(Number);
  return a === 0
    || a === 10
    || a === 127
    || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168)
    || (a === 100 && b >= 64 && b <= 127)
    || a >= 224;
}

function hasAllowedBrowserHost(hostname: string): boolean {
  return BROWSER_HOST_ALLOWLIST.some(host => hostname === host || hostname.endsWith(`.${host}`));
}

export async function validatePublicJobUrl(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('招聘网址格式无效。');
  }
  if (parsed.protocol !== 'https:') throw new Error('网页代理仅允许 HTTPS 地址。');
  const hostname = parsed.hostname.toLowerCase();
  if (BLOCKED_HOSTS.has(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    throw new Error('不允许访问本机、内网或云平台元数据地址。');
  }
  if (isIP(hostname) && isPrivateAddress(hostname)) {
    throw new Error('不允许访问内网 IP 地址。');
  }
  const addresses = await lookup(hostname, { all: true });
  if (!addresses.length || addresses.some(item => isPrivateAddress(item.address))) {
    throw new Error('目标域名解析到了不可访问的网络地址。');
  }
  return parsed;
}

function normalizeText(value: string): string {
  return value.replace(/\u00a0/g, ' ').replace(/[\t ]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim().slice(0, 50_000);
}

const JOB_CONTENT_START_MARKERS = ['职位描述', '岗位职责', '工作职责', '职位详情'];
const JOB_CONTENT_END_MARKERS = [
  'BOSS 安全提示', '竞争力分析', '公司介绍', '工商信息', '更多职位', '看过该职位的人还看了',
  '精选职位', '工作地址', '企业服务热线', 'Copyright ©', '首页深圳招聘',
];

function findFirstMarker(text: string, markers: string[], from = 0): number {
  return markers.reduce((best, marker) => {
    const index = text.indexOf(marker, from);
    return index >= 0 && (best < 0 || index < best) ? index : best;
  }, -1);
}

export function cleanJobPageText(rawText: string, sourceUrl = '', sourceTitle = ''): string {
  const normalized = normalizeText(rawText);
  if (!normalized) return '';
  const isBoss = /zhipin\.com/i.test(sourceUrl) || /BOSS直聘/i.test(normalized);
  if (!isBoss) return normalized;

  const start = findFirstMarker(normalized, JOB_CONTENT_START_MARKERS);
  if (start < 0) return normalized.slice(0, 20_000);
  const end = findFirstMarker(normalized, JOB_CONTENT_END_MARKERS, start + 4);
  const jobBody = normalized.slice(start, end > start ? end : Math.min(normalized.length, start + 16_000));
  const companyStart = normalized.indexOf('公司介绍', Math.max(start, end));
  const companyEnd = companyStart >= 0
    ? findFirstMarker(normalized, ['公司福利', '工商信息', '工作地址', '更多职位'], companyStart + 4)
    : -1;
  const companyEvidence = companyStart >= 0
    ? normalized.slice(companyStart, companyEnd > companyStart ? companyEnd : Math.min(normalized.length, companyStart + 2500))
    : '';
  const prefix = normalized.slice(0, start);
  const lines = prefix.split('\n').map(line => line.trim()).filter(Boolean);
  const usefulHeaderLines = lines.filter(line => {
    if (line.length > 160) return false;
    return /\d+[-–—]\d+K|\d+薪|\d+[-–—]\d+年|本科|大专|硕士|博士|招聘中|软件|工程师|开发|架构|产品|算法|测试|深圳|上海|北京|广州|杭州|成都|武汉|南京|苏州/i.test(line);
  }).slice(-10);
  const deduped = Array.from(new Set(usefulHeaderLines));
  return normalizeText([
    sourceTitle ? `【页面标题】${sourceTitle}` : '',
    sourceUrl ? `【来源网址】${sourceUrl}` : '',
    ...deduped,
    jobBody,
    companyEvidence ? `【公司介绍（仅供背调，不属于 JD）】\n${companyEvidence}` : '',
  ].filter(Boolean).join('\n'));
}

function looksLikeChallenge(url: string, title: string, text: string): boolean {
  const sample = `${url}\n${title}\n${text.slice(0, 2_000)}`.toLowerCase();
  return /security\.html|captcha|验证码|安全验证|请稍候|正在加载中/.test(sample);
}

export async function extractJobPageWithBrowser(rawUrl: string): Promise<{ text: string; finalUrl: string; title: string }> {
  const target = await validatePublicJobUrl(rawUrl);
  if (!hasAllowedBrowserHost(target.hostname.toLowerCase())) {
    throw new Error('该网站暂未在云端浏览器允许列表中，请使用“浏览器辅助导入”。');
  }

  const executablePath = process.env.CHROMIUM_PATH;
  if (!executablePath) throw new Error('云端 Chromium 尚未配置。');

  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-background-networking'],
  });

  try {
    const context = await browser.newContext({
      locale: 'zh-CN',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      viewport: { width: 1365, height: 900 },
    });
    const page = await context.newPage();
    await page.route('**/*', async route => {
      const request = route.request();
      const resourceType = request.resourceType();
      if (['image', 'media', 'font'].includes(resourceType)) return route.abort();
      try {
        const requestUrl = new URL(request.url());
        const host = requestUrl.hostname.toLowerCase();
        if (!['http:', 'https:'].includes(requestUrl.protocol)
          || BLOCKED_HOSTS.has(host)
          || host.endsWith('.local')
          || host.endsWith('.internal')
          || (isIP(host) && isPrivateAddress(host))) {
          return route.abort();
        }
      } catch {
        return route.abort();
      }
      return route.continue();
    });

    await page.goto(target.toString(), { waitUntil: 'domcontentloaded', timeout: 20_000 });
    await page.waitForTimeout(5_000);
    const finalUrl = page.url();
    const title = await page.title();
    const selectors = target.hostname.toLowerCase().includes('zhipin.com')
      ? ['.job-primary', '.job-detail', '.job-detail-section', '.job-sec-text', '.job-banner', '.company-info', '.company-intro']
      : ['main', '[class*="job-detail"]', '[class*="job-description"]'];
    const focusedParts: string[] = [];
    for (const selector of selectors) {
      const locator = page.locator(selector);
      const count = await locator.count();
      for (let index = 0; index < Math.min(count, 5); index += 1) {
        const part = await locator.nth(index).innerText({ timeout: 2_000 }).catch(() => '');
        if (part.trim().length > 20) focusedParts.push(part);
      }
    }
    const bodyText = await page.locator('body').innerText({ timeout: 5_000 });
    const text = cleanJobPageText(focusedParts.join('\n').length > 160 ? focusedParts.join('\n') : bodyText, finalUrl, title);

    if (looksLikeChallenge(finalUrl, title, text) || text.length < 80) {
      throw new Error('招聘网站要求安全验证或登录，请在原网页验证后使用“浏览器辅助导入”。');
    }
    return { text, finalUrl, title };
  } finally {
    await browser.close();
  }
}
