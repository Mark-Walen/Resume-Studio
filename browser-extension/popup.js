const status = document.querySelector('#status');

function setStatus(message, error = false) {
  status.textContent = message;
  status.classList.toggle('error', error);
}

document.querySelector('#capture').addEventListener('click', async () => {
  setStatus('正在读取当前页面…');
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !/^https?:/i.test(tab.url || '')) throw new Error('请先打开一个招聘职位页。');
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => ({
        title: document.title,
        url: location.href,
        text: (document.querySelector('main')?.innerText || document.body?.innerText || '')
          .replace(/[\t ]+/g, ' ')
          .replace(/\n\s*\n+/g, '\n')
          .trim()
          .slice(0, 50_000),
      }),
    });
    const page = result?.result;
    if (!page?.text || page.text.length < 50) throw new Error('页面中没有读取到足够的可见文字。');
    await navigator.clipboard.writeText(`【页面标题】${page.title}\n【来源网址】${page.url}\n\n${page.text}`);
    setStatus('已复制！返回 Resume Pilot 点击“读取剪贴板”。');
  } catch (error) {
    setStatus(error instanceof Error ? error.message : '读取页面失败。', true);
  }
});

document.querySelector('#open').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://resume-pilot-565432383818.asia-east1.run.app/' });
});
