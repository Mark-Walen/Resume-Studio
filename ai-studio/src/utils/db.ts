import { ResumeData } from '../types/resume';
import { JobApplication } from '../types/job';
import { InterviewRecord } from '../types/interview';
import { DEFAULT_RESUME } from '../data/defaultResume';
import { INITIAL_JOB_APPLICATIONS, INITIAL_INTERVIEW_RECORDS } from '../data/mockInterviews';

import { CrossInterviewDiagnosticReport } from '../types/diagnostic';
import { KnowledgeItem, KnowledgeBook } from '../types/knowledge';
import { WorkDailyLog } from '../types/journal';
import { DEFAULT_LEETBOOKS } from '../data/defaultBooks';
import { INITIAL_WORK_DAILY_LOGS } from '../data/defaultJournals';

const RESUME_KEY = 'ai_resume_data_v3_embedded';
const JOBS_KEY = 'ai_jobs_data_v3_embedded';
const INTERVIEWS_KEY = 'ai_interviews_data_v3_embedded';
const DIAGNOSTIC_KEY = 'ai_diagnostic_report_v3_embedded';
const API_KEY_STORAGE = 'custom_ai_api_key_v2';
const LEGACY_API_KEY_STORAGE = 'custom_gemini_api_key_v1';
const AI_SERVICE_SETTINGS_STORAGE = 'ai_service_settings_v1';
const KNOWLEDGE_KEY = 'ai_knowledge_items_v2_embedded';
const LEETBOOKS_KEY = 'ai_leetbooks_data_v2_embedded';
const WORK_JOURNAL_KEY = 'ai_work_daily_logs_v2_embedded';

// --- IndexedDB for Media Blobs ---
const DB_NAME = 'ResumeInterviewMediaDB';
const DB_VERSION = 1;
const MEDIA_STORE = 'media_files';

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
    store.put({ id, blob, createdAt: Date.now() });
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
    const req = store.get(id);
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result ? req.result.blob : null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to get media blob from IndexedDB:', err);
    return null;
  }
}

// --- Local Storage Helpers ---
export function loadResumeData(fallback?: ResumeData): ResumeData {
  const defaults = fallback || DEFAULT_RESUME;
  try {
    const raw = localStorage.getItem(RESUME_KEY);
    if (raw) {
      const stored = JSON.parse(raw) as ResumeData;
      const customSections = stored.customSections || [];
      const baseOrder = [...(stored.sectionOrder || defaults.sectionOrder || ['jobIntent', 'skills', 'workExperience', 'projects', 'education', 'certificates'])].filter((key) => key !== 'summary');
      if (!baseOrder.includes('jobIntent')) {
        baseOrder.unshift('jobIntent');
      }
      const validCustomKeys = customSections.map((section) => `custom:${section.id}`);
      const sectionOrder = [...baseOrder.filter((key) => !key.startsWith('custom:') || validCustomKeys.includes(key)), ...validCustomKeys.filter((key) => !baseOrder.includes(key))];
      return {
        ...defaults,
        ...stored,
        personalInfo: { ...defaults.personalInfo, ...stored.personalInfo },
        customSections,
        sectionOrder,
        hiddenSections: (stored.hiddenSections || []).filter((key) => key !== 'summary' && key !== 'basicInfo'),
      };
    }
  } catch {
    // fallback
  }
  return defaults;
}

export function saveResumeData(data: ResumeData): void {
  try {
    localStorage.setItem(RESUME_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('LocalStorage save failed for resume:', err);
  }
}

export function loadJobApplications(): JobApplication[] {
  try {
    const raw = localStorage.getItem(JOBS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return INITIAL_JOB_APPLICATIONS;
}

export function saveJobApplications(jobs: JobApplication[]): void {
  try {
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
  } catch (err) {
    console.warn('LocalStorage save failed for jobs:', err);
  }
}

export function loadInterviewRecords(): InterviewRecord[] {
  try {
    const raw = localStorage.getItem(INTERVIEWS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return INITIAL_INTERVIEW_RECORDS;
}

export function saveInterviewRecords(records: InterviewRecord[]): void {
  try {
    localStorage.setItem(INTERVIEWS_KEY, JSON.stringify(records));
  } catch (err) {
    console.warn('LocalStorage save failed for interviews:', err);
  }
}

export function getCustomApiKey(): string {
  return getAiServiceSettings().apiKey;
}

export type AiProviderId = 'anthropic' | 'openai' | 'xai' | 'google' | 'deepseek' | 'zai' | 'custom';

export interface AiServiceSettings {
  provider: AiProviderId;
  model: string;
  apiKey: string;
  baseUrl?: string;
  compatibility?: 'openai' | 'anthropic';
}

const DEFAULT_AI_SETTINGS: AiServiceSettings = {
  provider: 'google',
  model: 'gemini-3.8-flash',
  apiKey: '',
  compatibility: 'openai',
};

export function getAiServiceSettings(): AiServiceSettings {
  try {
    const raw = localStorage.getItem(AI_SERVICE_SETTINGS_STORAGE);
    if (raw) return { ...DEFAULT_AI_SETTINGS, ...JSON.parse(raw) };
    return {
      ...DEFAULT_AI_SETTINGS,
      apiKey: localStorage.getItem(API_KEY_STORAGE) || localStorage.getItem(LEGACY_API_KEY_STORAGE) || '',
    };
  } catch {
    return DEFAULT_AI_SETTINGS;
  }
}

export function setCustomApiKey(key: string): void {
  saveAiServiceSettings({ ...getAiServiceSettings(), apiKey: key.trim() });
}

export function saveAiServiceSettings(settings: AiServiceSettings): void {
  try {
    const normalized = { ...settings, apiKey: settings.apiKey.trim(), model: settings.model.trim(), baseUrl: settings.baseUrl?.trim() };
    localStorage.setItem(AI_SERVICE_SETTINGS_STORAGE, JSON.stringify(normalized));
    if (normalized.apiKey) localStorage.setItem(API_KEY_STORAGE, normalized.apiKey); else localStorage.removeItem(API_KEY_STORAGE);
    localStorage.removeItem(LEGACY_API_KEY_STORAGE);
  } catch (err) {
    console.warn('Failed to save AI service settings:', err);
  }
}

export const saveCustomApiKey = setCustomApiKey;

export function loadDiagnosticReport(): CrossInterviewDiagnosticReport | null {
  try {
    const raw = localStorage.getItem(DIAGNOSTIC_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return null;
}

export function saveDiagnosticReport(report: CrossInterviewDiagnosticReport): void {
  try {
    localStorage.setItem(DIAGNOSTIC_KEY, JSON.stringify(report));
  } catch (err) {
    console.warn('Failed to save diagnostic report:', err);
  }
}

export function loadKnowledgeItems(fallback: KnowledgeItem[]): KnowledgeItem[] {
  try {
    const raw = localStorage.getItem(KNOWLEDGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return fallback;
}

export function saveKnowledgeItems(items: KnowledgeItem[]): void {
  try {
    localStorage.setItem(KNOWLEDGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Failed to save knowledge items:', err);
  }
}

export function loadLeetBooks(fallback: KnowledgeBook[] = DEFAULT_LEETBOOKS): KnowledgeBook[] {
  try {
    const raw = localStorage.getItem(LEETBOOKS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return fallback;
}

export function saveLeetBooks(books: KnowledgeBook[]): void {
  try {
    localStorage.setItem(LEETBOOKS_KEY, JSON.stringify(books));
  } catch (err) {
    console.warn('Failed to save LeetBooks:', err);
  }
}

export function loadWorkDailyLogs(fallback: WorkDailyLog[] = INITIAL_WORK_DAILY_LOGS): WorkDailyLog[] {
  try {
    const raw = localStorage.getItem(WORK_JOURNAL_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return fallback;
}

export function saveWorkDailyLogs(logs: WorkDailyLog[]): void {
  try {
    localStorage.setItem(WORK_JOURNAL_KEY, JSON.stringify(logs));
  } catch (err) {
    console.warn('Failed to save work daily logs:', err);
  }
}
