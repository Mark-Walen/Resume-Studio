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
    const text = normalizeText(await page.locator('body').innerText({ timeout: 5_000 }));

    if (looksLikeChallenge(finalUrl, title, text) || text.length < 80) {
      throw new Error('招聘网站要求安全验证或登录，请在原网页验证后使用“浏览器辅助导入”。');
    }
    return { text, finalUrl, title };
  } finally {
    await browser.close();
  }
}

