import { InterviewRecord } from '../types/interview';
import { getMediaBlob, saveMediaBlob } from '../utils/db';
import { auth } from './firebase';

async function authenticatedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) throw new Error('请先登录后再同步附件。');
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${idToken}`);
  return fetch(path, { ...init, headers });
}

export async function uploadMediaAttachment(mediaId: string, blob: Blob, originalName: string): Promise<{ cloudObjectPath: string; cloudSyncedAt: string }> {
  const extension = originalName.split('.').pop()?.toLowerCase();
  const inferredMimeType = extension === 'mp3' ? 'audio/mpeg'
    : extension === 'wav' ? 'audio/wav'
      : extension === 'm4a' ? 'audio/mp4'
        : extension === 'aac' ? 'audio/aac'
          : extension === 'ogg' ? 'audio/ogg'
            : extension === 'webm' ? 'video/webm'
              : extension === 'mov' ? 'video/quicktime'
                : 'video/mp4';
  const mimeType = blob.type || inferredMimeType;
  const sessionResponse = await authenticatedFetch('/api/media/upload-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mediaId,
      mimeType,
      sizeBytes: blob.size,
      originalName,
    }),
  });
  const session = await sessionResponse.json().catch(() => ({}));
  if (!sessionResponse.ok || !session.success || !session.uploadUrl) {
    throw new Error(session.error || '无法创建 Cloud Storage 上传会话。');
  }

  const uploadResponse = await fetch(session.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': mimeType,
      'Content-Range': `bytes 0-${blob.size - 1}/${blob.size}`,
    },
    body: blob,
  });
  if (!uploadResponse.ok) throw new Error(`Cloud Storage 上传失败（${uploadResponse.status}）。`);

  return { cloudObjectPath: session.objectPath, cloudSyncedAt: new Date().toISOString() };
}

export async function downloadMediaAttachment(mediaId: string): Promise<Blob> {
  const response = await authenticatedFetch(`/api/media/${encodeURIComponent(mediaId)}`);
  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || `云端附件读取失败（${response.status}）。`);
  }
  const blob = await response.blob();
  await saveMediaBlob(mediaId, blob);
  return blob;
}

export async function migrateLocalMediaToCloud(records: InterviewRecord[]): Promise<{ records: InterviewRecord[]; migrated: number; failed: number }> {
  let migrated = 0;
  let failed = 0;
  const next: InterviewRecord[] = [];

  for (const record of records) {
    let changed = false;
    const attachments = [];
    for (const attachment of record.mediaAttachments || []) {
      if (attachment.cloudObjectPath) {
        attachments.push(attachment);
        continue;
      }
      const mediaId = attachment.blobId || attachment.id;
      const blob = await getMediaBlob(mediaId);
      if (!blob) {
        attachments.push(attachment);
        continue;
      }
      try {
        const cloud = await uploadMediaAttachment(attachment.id, blob, attachment.name);
        attachments.push({ ...attachment, ...cloud });
        changed = true;
        migrated += 1;
      } catch (error) {
        console.warn('Media migration failed:', attachment.name, error);
        attachments.push(attachment);
        failed += 1;
      }
    }
    next.push(changed ? { ...record, mediaAttachments: attachments, updatedAt: new Date().toISOString() } : record);
  }

  return { records: next, migrated, failed };
}
