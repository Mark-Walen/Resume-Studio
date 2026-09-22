const ALLOWED_TAGS = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'S', 'H2', 'H3', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'A']);

export function sanitizeRichText(input: string): string {
  if (!input) return '';
  if (typeof document === 'undefined') return input.replace(/<script[\s\S]*?<\/script>/gi, '');

  const template = document.createElement('template');
  template.innerHTML = input;

  const clean = (node: Node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.COMMENT_NODE) {
        child.remove();
        return;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) return;
      const element = child as HTMLElement;
      if (!ALLOWED_TAGS.has(element.tagName)) {
        clean(element);
        element.replaceWith(...Array.from(element.childNodes));
        return;
      }
      Array.from(element.attributes).forEach((attribute) => {
        const keepHref = element.tagName === 'A' && attribute.name === 'href';
        if (!keepHref) element.removeAttribute(attribute.name);
      });
      if (element.tagName === 'A') {
        const href = element.getAttribute('href') || '';
        if (!/^(https?:|mailto:)/i.test(href)) element.removeAttribute('href');
        else {
          element.setAttribute('target', '_blank');
          element.setAttribute('rel', 'noreferrer noopener');
        }
      }
      clean(element);
    });
  };

  clean(template.content);
  return template.innerHTML;
}

export function toRichHtml(value: string): string {
  if (!value) return '';
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeRichText(value);
  return value.split(/\n+/).filter(Boolean).map((line) => `<p>${escapeHtml(line)}</p>`).join('');
}

export function richTextToPlain(value: string): string {
  if (!value) return '';
  if (typeof document === 'undefined') return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const template = document.createElement('template');
  template.innerHTML = sanitizeRichText(value);
  return (template.content.textContent || '').replace(/\s+/g, ' ').trim();
}

export function richTextToMarkdown(value: string): string {
  return sanitizeRichText(toRichHtml(value))
    .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n')
    .replace(/<h3>(.*?)<\/h3>/gi, '### $1\n')
    .replace(/<(strong|b)>(.*?)<\/\1>/gi, '**$2**')
    .replace(/<(em|i)>(.*?)<\/\1>/gi, '*$2*')
    .replace(/<u>(.*?)<\/u>/gi, '$1')
    .replace(/<s>(.*?)<\/s>/gi, '~~$1~~')
    .replace(/<blockquote>(.*?)<\/blockquote>/gi, '> $1\n')
    .replace(/<li>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char] || char);
}
