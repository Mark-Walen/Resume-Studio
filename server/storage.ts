import { Storage } from '@google-cloud/storage';

const storage = new Storage();
const MAX_MEDIA_BYTES = 1024 * 1024 * 1024;

function mediaBucketName(): string {
  const bucket = process.env.MEDIA_BUCKET?.trim();
  if (!bucket) throw new Error('服务端尚未配置 Cloud Storage 媒体存储桶。');
  return bucket;
}

function safeMediaId(id: string): string {
  if (!/^[A-Za-z0-9._-]{1,160}$/.test(id)) throw new Error('附件标识无效。');
  return id;
}

function safeMimeType(mimeType: string): string {
  const value = mimeType.toLowerCase().trim();
  if (!value.startsWith('audio/') && !value.startsWith('video/')) {
    throw new Error('仅支持上传音频或视频附件。');
  }
  return value;
}

export function mediaObjectPath(uid: string, mediaId: string): string {
  return `users/${uid}/interview-media/${safeMediaId(mediaId)}`;
}

export async function createMediaUploadSession(params: {
  uid: string;
  mediaId: string;
  mimeType: string;
  sizeBytes: number;
  originalName?: string;
  origin?: string;
}): Promise<{ uploadUrl: string; objectPath: string }> {
  const mimeType = safeMimeType(params.mimeType);
  if (!Number.isFinite(params.sizeBytes) || params.sizeBytes <= 0 || params.sizeBytes > MAX_MEDIA_BYTES) {
    throw new Error('附件大小必须在 1GB 以内。');
  }
  const objectPath = mediaObjectPath(params.uid, params.mediaId);
  const file = storage.bucket(mediaBucketName()).file(objectPath);
  const [uploadUrl] = await file.createResumableUpload({
    origin: params.origin,
    metadata: {
      contentType: mimeType,
      cacheControl: 'private, max-age=3600',
      metadata: {
        ownerUid: params.uid,
        originalName: (params.originalName || '').slice(0, 240),
      },
    },
  });
  return { uploadUrl, objectPath };
}

export async function getMediaFile(uid: string, mediaId: string) {
  const file = storage.bucket(mediaBucketName()).file(mediaObjectPath(uid, mediaId));
  const [exists] = await file.exists();
  if (!exists) return null;
  const [metadata] = await file.getMetadata();
  return { file, metadata };
}
