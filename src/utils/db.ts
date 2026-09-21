import { ResumeData } from '../types/resume';
import { JobApplication } from '../types/job';
import { InterviewRecord } from '../types/interview';
import { DEFAULT_RESUME } from '../data/defaultResume';
import { INITIAL_JOB_APPLICATIONS, INITIAL_INTERVIEW_RECORDS } from '../data/mockInterviews';

import { CrossInterviewDiagnosticReport } from '../types/diagnostic';
import { KnowledgeItem } from '../types/knowledge';

const RESUME_KEY = 'ai_resume_data_v2';
const JOBS_KEY = 'ai_jobs_data_v2';
const INTERVIEWS_KEY = 'ai_interviews_data_v2';
const DIAGNOSTIC_KEY = 'ai_diagnostic_report_v2';
const API_KEY_STORAGE = 'custom_gemini_api_key_v1';

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
  try {
    const raw = localStorage.getItem(RESUME_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return fallback || DEFAULT_RESUME;
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
  try {
    return localStorage.getItem(API_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function setCustomApiKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem(API_KEY_STORAGE, key.trim());
    } else {
      localStorage.removeItem(API_KEY_STORAGE);
    }
  } catch (err) {
    console.warn('Failed to save custom api key:', err);
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

const KNOWLEDGE_KEY = 'ai_knowledge_items_v1';

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


