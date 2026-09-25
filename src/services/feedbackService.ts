import { auth } from './firebase';

export async function submitUserFeedback(input: {
  category: string;
  subject: string;
  message: string;
  pageContext?: string;
}): Promise<{ id: string; createdAt: string }> {
  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) throw new Error('请先登录后再提交反馈。');
  const response = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify(input),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.success) throw new Error(payload.error || '反馈提交失败。');
  return payload.data;
}
