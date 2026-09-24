import { ResumeData } from '../types/resume';
import { JobApplication } from '../types/job';
import { InterviewRecord } from '../types/interview';
import { DEFAULT_RESUME, DEFAULT_TEST_AVATAR } from '../data/defaultResume';
import { INITIAL_JOB_APPLICATIONS, INITIAL_INTERVIEW_RECORDS } from '../data/mockInterviews';

import { CrossInterviewDiagnosticReport } from '../types/diagnostic';
import { KnowledgeItem, KnowledgeBook } from '../types/knowledge';
import { WorkDailyLog } from '../types/journal';
import { DEFAULT_LEETBOOKS } from '../data/defaultBooks';
import { INITIAL_WORK_DAILY_LOGS } from '../data/defaultJournals';
import { INITIAL_KNOWLEDGE_BASE } from '../data/knowledgeBaseData';
import { AiModelProfile, PROVIDER_CONFIGS } from '../types/aiProvider';
import { encryptApiKey, decryptApiKey } from './crypto';
import { auth } from '../services/firebase';

const RESUME_KEY = 'ai_resume_data_v2';
const JOBS_KEY = 'ai_jobs_data_v2';
const INTERVIEWS_KEY = 'ai_interviews_data_v2';
const DIAGNOSTIC_KEY = 'ai_diagnostic_report_v2';
const API_KEY_STORAGE = 'custom_gemini_api_key_v1';
const AI_PROFILES_KEY = 'ai_model_profiles_v1';
const KNOWLEDGE_KEY = 'ai_knowledge_items_v1';
const LEETBOOKS_KEY = 'ai_leetbooks_data_v1';
const WORK_JOURNAL_KEY = 'ai_work_daily_logs_v1';

export const WORKSPACE_DATA_CHANGED_EVENT = 'resume-pilot-workspace-data-changed';

export interface WorkspaceSnapshot {
  schemaVersion: 1;
  resume: ResumeData;
  jobs: JobApplication[];
  interviews: InterviewRecord[];
  diagnosticReport: CrossInterviewDiagnosticReport | null;
  knowledgeItems: KnowledgeItem[];
  books: KnowledgeBook[];
  workLogs: WorkDailyLog[];
  aiProfiles: AiModelProfile[];
}

const WORKSPACE_STORAGE_KEYS = [
  RESUME_KEY,
  JOBS_KEY,
  INTERVIEWS_KEY,
  DIAGNOSTIC_KEY,
  AI_PROFILES_KEY,
  KNOWLEDGE_KEY,
  LEETBOOKS_KEY,
  WORK_JOURNAL_KEY,
];

// --- IndexedDB for Media Blobs ---
const DB_NAME = 'ResumeInterviewMediaDB';
const DB_VERSION = 1;
const MEDIA_STORE = 'media_files';

function currentUserId(): string {
  return auth.currentUser?.uid || 'anonymous';
}

function scopedStorageKey(baseKey: string): string {
  return `${baseKey}:${currentUserId()}`;
}

function readScopedStorage(baseKey: string): string | null {
  const scopedKey = scopedStorageKey(baseKey);
  const scopedValue = localStorage.getItem(scopedKey);
  if (scopedValue !== null) return scopedValue;

  if (currentUserId() !== 'anonymous') {
    const legacyValue = localStorage.getItem(baseKey);
    if (legacyValue !== null) {
      localStorage.setItem(scopedKey, legacyValue);
      localStorage.removeItem(baseKey);
      return legacyValue;
    }
  }
  return null;
}

function writeScopedStorage(baseKey: string, value: string): void {
  localStorage.setItem(scopedStorageKey(baseKey), value);
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(WORKSPACE_DATA_CHANGED_EVENT));
}

function removeScopedStorage(baseKey: string): void {
  localStorage.removeItem(scopedStorageKey(baseKey));
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(WORKSPACE_DATA_CHANGED_EVENT));
}

function scopedRecordId(id: string): string {
  return `${currentUserId()}:${id}`;
}

function openMediaDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(MEDIA_STORE)) {
        db.createObjectStore(MEDIA_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveMediaBlob(id: string, blob: Blob): Promise<void> {
  try {
    const db = await openMediaDB();
    const tx = db.transaction(MEDIA_STORE, 'readwrite');
    const store = tx.objectStore(MEDIA_STORE);
    store.put({ id: scopedRecordId(id), blob, createdAt: Date.now() });
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to save media blob in IndexedDB:', err);
  }
}

export async function getMediaBlob(id: string): Promise<Blob | null> {
  try {
    const db = await openMediaDB();
    const tx = db.transaction(MEDIA_STORE, 'readonly');
    const store = tx.objectStore(MEDIA_STORE);
    const scopedId = scopedRecordId(id);
    const req = store.get(scopedId);
    return new Promise((resolve, reject) => {
      req.onsuccess = () => {
        if (req.result) {
          resolve(req.result.blob);
          return;
        }
        if (currentUserId() === 'anonymous') {
          resolve(null);
          return;
        }
        const legacyReq = store.get(id);
        legacyReq.onsuccess = () => {
          if (!legacyReq.result) {
            resolve(null);
            return;
          }
          const migrationTx = db.transaction(MEDIA_STORE, 'readwrite');
          migrationTx.objectStore(MEDIA_STORE).put({ ...legacyReq.result, id: scopedId });
          resolve(legacyReq.result.blob);
        };
        legacyReq.onerror = () => reject(legacyReq.error);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to get media blob from IndexedDB:', err);
    return null;
  }
}

// --- Local Storage Helpers ---
export function loadResumeData(fallback?: ResumeData): ResumeData {
  try {
    const raw = readScopedStorage(RESUME_KEY);
    if (raw) {
      const parsed: ResumeData = JSON.parse(raw);
      if (parsed.personalInfo && !parsed.personalInfo.avatarUrl) {
        parsed.personalInfo.avatarUrl = DEFAULT_TEST_AVATAR;
      }
      return parsed;
    }
  } catch {
    // fallback
  }
  return fallback || DEFAULT_RESUME;
}

export function saveResumeData(data: ResumeData): void {
  try {
    writeScopedStorage(RESUME_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('LocalStorage save failed for resume:', err);
  }
}

export function loadJobApplications(): JobApplication[] {
  try {
    const raw = readScopedStorage(JOBS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return INITIAL_JOB_APPLICATIONS;
}

export function saveJobApplications(jobs: JobApplication[]): void {
  try {
    writeScopedStorage(JOBS_KEY, JSON.stringify(jobs));
  } catch (err) {
    console.warn('LocalStorage save failed for jobs:', err);
  }
}

export function loadInterviewRecords(): InterviewRecord[] {
  try {
    const raw = readScopedStorage(INTERVIEWS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return INITIAL_INTERVIEW_RECORDS;
}

export function saveInterviewRecords(records: InterviewRecord[]): void {
  try {
    writeScopedStorage(INTERVIEWS_KEY, JSON.stringify(records));
  } catch (err) {
    console.warn('LocalStorage save failed for interviews:', err);
  }
}

export function getCustomApiKey(): string {
  try {
    // 1. First check active profile
    const active = getActiveAiProfile();
    if (active && active.encryptedApiKey) {
      return decryptApiKey(active.encryptedApiKey);
    }
    // 2. Fallback to legacy
    const raw = readScopedStorage(API_KEY_STORAGE);
    if (raw) {
      return decryptApiKey(raw);
    }
    return '';
  } catch {
    return '';
  }
}

export function setCustomApiKey(key: string): void {
  try {
    if (key.trim()) {
      const encrypted = encryptApiKey(key.trim());
      writeScopedStorage(API_KEY_STORAGE, encrypted);
    } else {
      removeScopedStorage(API_KEY_STORAGE);
    }
  } catch (err) {
    console.warn('Failed to save custom api key:', err);
  }
}

export const saveCustomApiKey = setCustomApiKey;

export function loadAiModelProfiles(): AiModelProfile[] {
  try {
    const raw = readScopedStorage(AI_PROFILES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((profile: AiModelProfile) => {
          const isLegacySystemDefault = profile.id === 'profile-gemini-default'
            && profile.provider === 'gemini'
            && ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'].includes(profile.modelName);
          const normalized = { ...profile, thinkingEffort: profile.thinkingEffort || 'default' } as AiModelProfile;
          return isLegacySystemDefault
            ? { ...normalized, modelName: PROVIDER_CONFIGS.gemini.defaultModel }
            : normalized;
        });
      }
    }
  } catch (err) {
    console.warn('Failed to load AI model profiles', err);
  }

  // Initial default profile
  const legacyKey = readScopedStorage(API_KEY_STORAGE) || '';
  const initial: AiModelProfile[] = [
    {
      id: 'profile-gemini-default',
      name: 'Google Gemini (默认配置)',
      provider: 'gemini',
      modelName: PROVIDER_CONFIGS.gemini.defaultModel,
      thinkingEffort: 'default',
      encryptedApiKey: legacyKey.startsWith('SECURE_VAULT_V2::') ? legacyKey : (legacyKey ? encryptApiKey(legacyKey) : ''),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  return initial;
}

export function saveAiModelProfiles(profiles: AiModelProfile[]): void {
  try {
    writeScopedStorage(AI_PROFILES_KEY, JSON.stringify(profiles));
    // Also sync active profile key to legacy storage for seamless backward compatibility
    const active = profiles.find(p => p.isActive);
    if (active && active.encryptedApiKey) {
      writeScopedStorage(API_KEY_STORAGE, active.encryptedApiKey);
    }
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('ai-profile-updated'));
  } catch (err) {
    console.warn('Failed to save AI model profiles', err);
  }
}

export function getActiveAiProfile(): AiModelProfile | null {
  const profiles = loadAiModelProfiles();
  return profiles.find(p => p.isActive) || profiles[0] || null;
}

export function setActiveAiProfile(id: string): void {
  const profiles = loadAiModelProfiles();
  const updated = profiles.map(p => ({
    ...p,
    isActive: p.id === id
  }));
  saveAiModelProfiles(updated);
}

export function loadDiagnosticReport(): CrossInterviewDiagnosticReport | null {
  try {
    const raw = readScopedStorage(DIAGNOSTIC_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return null;
}

export function saveDiagnosticReport(report: CrossInterviewDiagnosticReport): void {
  try {
    writeScopedStorage(DIAGNOSTIC_KEY, JSON.stringify(report));
  } catch (err) {
    console.warn('Failed to save diagnostic report:', err);
  }
}

export function loadKnowledgeItems(fallback: KnowledgeItem[]): KnowledgeItem[] {
  try {
    const raw = readScopedStorage(KNOWLEDGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return fallback;
}

export function saveKnowledgeItems(items: KnowledgeItem[]): void {
  try {
    writeScopedStorage(KNOWLEDGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Failed to save knowledge items:', err);
  }
}

export function loadLeetBooks(fallback: KnowledgeBook[] = DEFAULT_LEETBOOKS): KnowledgeBook[] {
  try {
    const raw = readScopedStorage(LEETBOOKS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return fallback;
}

export function saveLeetBooks(books: KnowledgeBook[]): void {
  try {
    writeScopedStorage(LEETBOOKS_KEY, JSON.stringify(books));
  } catch (err) {
    console.warn('Failed to save LeetBooks:', err);
  }
}

export function loadWorkDailyLogs(fallback: WorkDailyLog[] = INITIAL_WORK_DAILY_LOGS): WorkDailyLog[] {
  try {
    const raw = readScopedStorage(WORK_JOURNAL_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return fallback;
}

export function saveWorkDailyLogs(logs: WorkDailyLog[]): void {
  try {
    writeScopedStorage(WORK_JOURNAL_KEY, JSON.stringify(logs));
  } catch (err) {
    console.warn('Failed to save work daily logs:', err);
  }
}

export function hasLocalWorkspaceData(): boolean {
  return WORKSPACE_STORAGE_KEYS.some(key => (
    localStorage.getItem(scopedStorageKey(key)) !== null || localStorage.getItem(key) !== null
  ));
}

function withoutCloudApiKeys(profiles: AiModelProfile[]): AiModelProfile[] {
  return profiles.map(profile => ({ ...profile, encryptedApiKey: '' }));
}

export function createLocalWorkspaceSnapshot(): WorkspaceSnapshot {
  return {
    schemaVersion: 1,
    resume: loadResumeData(),
    jobs: loadJobApplications(),
    interviews: loadInterviewRecords(),
    diagnosticReport: loadDiagnosticReport(),
    knowledgeItems: loadKnowledgeItems(INITIAL_KNOWLEDGE_BASE),
    books: loadLeetBooks(),
    workLogs: loadWorkDailyLogs(),
    aiProfiles: withoutCloudApiKeys(loadAiModelProfiles()),
  };
}

export function applyCloudWorkspaceSnapshot(snapshot: Partial<WorkspaceSnapshot>): WorkspaceSnapshot {
  const currentProfiles = loadAiModelProfiles();
  const localKeys = new Map(currentProfiles.map(profile => [profile.id, profile.encryptedApiKey]));
  const mergedProfiles = (snapshot.aiProfiles?.length ? snapshot.aiProfiles : currentProfiles).map(profile => ({
    ...profile,
    encryptedApiKey: localKeys.get(profile.id) || '',
  }));
  const normalized: WorkspaceSnapshot = {
    schemaVersion: 1,
    resume: snapshot.resume || loadResumeData(),
    jobs: snapshot.jobs || loadJobApplications(),
    interviews: snapshot.interviews || loadInterviewRecords(),
    diagnosticReport: snapshot.diagnosticReport ?? null,
    knowledgeItems: snapshot.knowledgeItems || loadKnowledgeItems(INITIAL_KNOWLEDGE_BASE),
    books: snapshot.books || loadLeetBooks(),
    workLogs: snapshot.workLogs || loadWorkDailyLogs(),
    aiProfiles: mergedProfiles,
  };

  saveResumeData(normalized.resume);
  saveJobApplications(normalized.jobs);
  saveInterviewRecords(normalized.interviews);
  if (normalized.diagnosticReport) saveDiagnosticReport(normalized.diagnosticReport);
  else removeScopedStorage(DIAGNOSTIC_KEY);
  saveKnowledgeItems(normalized.knowledgeItems);
  saveLeetBooks(normalized.books);
  saveWorkDailyLogs(normalized.workLogs);
  saveAiModelProfiles(normalized.aiProfiles);
  return normalized;
}


