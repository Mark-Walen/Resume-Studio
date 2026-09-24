import { auth } from './firebase';
import { WorkspaceSnapshot } from '../utils/db';

export type WorkspaceSyncSource = 'cloud' | 'migrated' | 'initialized';

interface WorkspaceDocumentResponse {
  success: boolean;
  document?: {
    payload: WorkspaceSnapshot;
    updatedAt: string;
    source?: WorkspaceSyncSource;
  } | null;
  error?: string;
}

async function workspaceRequest(path: string, init: RequestInit): Promise<WorkspaceDocumentResponse> {
  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) throw new Error('请先登录。');
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
      ...(init.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({})) as WorkspaceDocumentResponse;
  if (!response.ok || !payload.success) throw new Error(payload.error || '云端工作区请求失败。');
  return payload;
}

export async function migrateOrLoadCloudWorkspace(
  localPayload: WorkspaceSnapshot,
  hasLocalData: boolean,
): Promise<{ payload: WorkspaceSnapshot; updatedAt: string; source: WorkspaceSyncSource }> {
  const response = await workspaceRequest('/api/workspace/sync', {
    method: 'POST',
    body: JSON.stringify({ payload: localPayload, hasLocalData }),
  });
  if (!response.document) throw new Error('云端工作区返回为空。');
  return {
    payload: response.document.payload,
    updatedAt: response.document.updatedAt,
    source: response.document.source || 'cloud',
  };
}

export async function saveCloudWorkspace(payload: WorkspaceSnapshot): Promise<string> {
  const response = await workspaceRequest('/api/workspace', {
    method: 'PUT',
    body: JSON.stringify({ payload }),
  });
  if (!response.document) throw new Error('云端工作区保存结果为空。');
  return response.document.updatedAt;
}

