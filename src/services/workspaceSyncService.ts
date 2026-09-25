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
  restorePoints?: WorkspaceRestorePoint[];
  restorePoint?: WorkspaceRestorePoint;
}

export interface WorkspaceRestorePoint {
  id: string;
  label: string;
  createdAt: string;
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

export function createWorkspacePatch(previous: WorkspaceSnapshot | null, next: WorkspaceSnapshot): Partial<WorkspaceSnapshot> {
  if (!previous) return next;
  return Object.fromEntries(Object.entries(next).filter(([key, value]) => (
    JSON.stringify(previous[key as keyof WorkspaceSnapshot]) !== JSON.stringify(value)
  ))) as Partial<WorkspaceSnapshot>;
}

export async function saveCloudWorkspaceIncremental(patch: Partial<WorkspaceSnapshot>): Promise<{ updatedAt: string; payload: WorkspaceSnapshot }> {
  const response = await workspaceRequest('/api/workspace', {
    method: 'PATCH',
    body: JSON.stringify({ patch }),
  });
  if (!response.document) throw new Error('云端增量保存结果为空。');
  return { updatedAt: response.document.updatedAt, payload: response.document.payload };
}

export async function listWorkspaceRestorePoints(): Promise<WorkspaceRestorePoint[]> {
  const response = await workspaceRequest('/api/workspace/restore-points', { method: 'GET' });
  return response.restorePoints || [];
}

export async function createWorkspaceRestorePoint(label: string): Promise<WorkspaceRestorePoint> {
  const response = await workspaceRequest('/api/workspace/restore-points', { method: 'POST', body: JSON.stringify({ label }) });
  if (!response.restorePoint) throw new Error('创建还原点失败。');
  return response.restorePoint;
}

export async function restoreWorkspace(restorePointId: string): Promise<{ payload: WorkspaceSnapshot; updatedAt: string }> {
  const response = await workspaceRequest('/api/workspace/restore', { method: 'POST', body: JSON.stringify({ restorePointId }) });
  if (!response.document) throw new Error('回滚工作区失败。');
  return { payload: response.document.payload, updatedAt: response.document.updatedAt };
}
