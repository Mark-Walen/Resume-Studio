import { KnowledgeBook } from '../types/knowledge';
import { auth } from './firebase';

async function request(path: string, init: RequestInit = {}) {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('请先登录。');
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.success) throw new Error(payload.error || '专栏服务请求失败。');
  return payload;
}

export async function listPublishedBooks(): Promise<KnowledgeBook[]> {
  const payload = await request('/api/knowledge-books/public', { method: 'GET' });
  return Array.isArray(payload.books) ? payload.books : [];
}

export async function publishBook(book: KnowledgeBook): Promise<void> {
  if (!book.shareId) throw new Error('专栏缺少分享标识。');
  const publicBook: KnowledgeBook = {
    ...book,
    ownership: 'community',
    author: auth.currentUser?.displayName || '社区创作者',
    isCustom: false,
    isSubscribed: false,
    chapters: book.chapters.map(chapter => ({
      ...chapter,
      sections: chapter.sections.map(({ readingHighlights: _highlights, readingNotes: _notes, isCompleted: _completed, ...section }) => ({
        ...section,
        isCompleted: false,
      })),
    })),
  };
  await request('/api/knowledge-books/publish', {
    method: 'POST',
    body: JSON.stringify({
      shareId: book.shareId,
      book: publicBook,
    }),
  });
}

export async function unpublishBook(shareId: string): Promise<void> {
  await request('/api/knowledge-books/publish', {
    method: 'DELETE',
    body: JSON.stringify({ shareId }),
  });
}
