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
const AI_SERVICE_PROFILES_STORAGE = 'ai_service_profiles_v2';
const AI_VAULT_DB_NAME = 'ResumeAiCredentialVault';
const AI_VAULT_DB_VERSION = 1;
const AI_VAULT_KEY_STORE = 'crypto_keys';
const AI_VAULT_SECRET_STORE = 'encrypted_secrets';
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

export type AiProviderId = 'anthropic' | 'openai' | 'xai' | 'google' | 'deepseek' | 'zai' | 'custom';

export interface AiServiceSettings {
  provider: AiProviderId;
  model: string;
  apiKey: string;
  baseUrl?: string;
  compatibility?: 'openai' | 'anthropic';
}

export interface AiServiceProfile extends AiServiceSettings {
  id: string;
  name: string;
}

export interface AiServiceProfileStore {
  activeProfileId: string;
  profiles: AiServiceProfile[];
}

const DEFAULT_AI_SETTINGS: AiServiceSettings = {
  provider: 'google',
  model: 'gemini-3.8-flash',
  apiKey: '',
  compatibility: 'openai',
};

const DEFAULT_AI_PROFILE: AiServiceProfile = {
  ...DEFAULT_AI_SETTINGS,
  id: 'default',
  name: '默认 AI 服务',
};

function normalizeAiProfile(profile: AiServiceProfile): AiServiceProfile {
  return {
    ...DEFAULT_AI_PROFILE,
    ...profile,
    id: profile.id || `profile-${Date.now()}`,
    name: profile.name?.trim() || '未命名配置',
    apiKey: profile.apiKey?.trim() || '',
    model: profile.model?.trim() || '',
    baseUrl: profile.baseUrl?.trim(),
  };
}

interface EncryptedApiKeyRecord {
  id: string;
  iv: number[];
  ciphertext: number[];
}

function openAiVaultDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(AI_VAULT_DB_NAME, AI_VAULT_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(AI_VAULT_KEY_STORE)) db.createObjectStore(AI_VAULT_KEY_STORE, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(AI_VAULT_SECRET_STORE)) db.createObjectStore(AI_VAULT_SECRET_STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

let aiVaultKeyPromise: Promise<CryptoKey> | null = null;

async function createOrLoadAiVaultKey(): Promise<CryptoKey> {
  if (!window.crypto?.subtle) throw new Error('当前浏览器不支持安全凭据存储。');
  const db = await openAiVaultDb();
  const existing = await requestResult<any>(db.transaction(AI_VAULT_KEY_STORE, 'readonly').objectStore(AI_VAULT_KEY_STORE).get('primary'));
  if (existing?.key) return existing.key as CryptoKey;
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  await requestResult(db.transaction(AI_VAULT_KEY_STORE, 'readwrite').objectStore(AI_VAULT_KEY_STORE).put({ id: 'primary', key }));
  return key;
}

function getAiVaultKey(): Promise<CryptoKey> {
  if (!aiVaultKeyPromise) aiVaultKeyPromise = createOrLoadAiVaultKey().catch(error => { aiVaultKeyPromise = null; throw error; });
  return aiVaultKeyPromise;
}

async function saveEncryptedApiKey(profileId: string, apiKey: string): Promise<void> {
  const db = await openAiVaultDb();
  if (!apiKey) {
    await requestResult(db.transaction(AI_VAULT_SECRET_STORE, 'readwrite').objectStore(AI_VAULT_SECRET_STORE).delete(profileId));
    return;
  }
  const key = await getAiVaultKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const additionalData = new TextEncoder().encode(profileId);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData }, key, new TextEncoder().encode(apiKey));
  const record: EncryptedApiKeyRecord = { id: profileId, iv: Array.from(iv), ciphertext: Array.from(new Uint8Array(encrypted)) };
  await requestResult(db.transaction(AI_VAULT_SECRET_STORE, 'readwrite').objectStore(AI_VAULT_SECRET_STORE).put(record));
}

async function loadEncryptedApiKey(profileId: string): Promise<string> {
  const db = await openAiVaultDb();
  const record = await requestResult<EncryptedApiKeyRecord | undefined>(db.transaction(AI_VAULT_SECRET_STORE, 'readonly').objectStore(AI_VAULT_SECRET_STORE).get(profileId));
  if (!record) return '';
  const key = await getAiVaultKey();
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(record.iv), additionalData: new TextEncoder().encode(profileId) }, key, new Uint8Array(record.ciphertext));
  return new TextDecoder().decode(decrypted);
}

function getAiServiceProfileMetadataStore(): AiServiceProfileStore {
  try {
    const rawProfiles = localStorage.getItem(AI_SERVICE_PROFILES_STORAGE);
    if (rawProfiles) {
      const parsed = JSON.parse(rawProfiles) as AiServiceProfileStore;
      const profiles = (parsed.profiles || []).map(normalizeAiProfile);
      if (profiles.length) {
        const activeProfileId = profiles.some(profile => profile.id === parsed.activeProfileId) ? parsed.activeProfileId : profiles[0].id;
        return { activeProfileId, profiles };
      }
    }

    const rawLegacy = localStorage.getItem(AI_SERVICE_SETTINGS_STORAGE);
    const legacySettings = rawLegacy ? { ...DEFAULT_AI_SETTINGS, ...JSON.parse(rawLegacy) } : {
      ...DEFAULT_AI_SETTINGS,
      apiKey: localStorage.getItem(API_KEY_STORAGE) || localStorage.getItem(LEGACY_API_KEY_STORAGE) || '',
    };
    return { activeProfileId: DEFAULT_AI_PROFILE.id, profiles: [normalizeAiProfile({ ...DEFAULT_AI_PROFILE, ...legacySettings })] };
  } catch {
    return { activeProfileId: DEFAULT_AI_PROFILE.id, profiles: [DEFAULT_AI_PROFILE] };
  }
}

function persistAiServiceMetadata(store: AiServiceProfileStore): void {
  const profiles = store.profiles.map(profile => ({ ...normalizeAiProfile(profile), apiKey: '' }));
  const activeProfileId = profiles.some(profile => profile.id === store.activeProfileId) ? store.activeProfileId : profiles[0]?.id;
  if (!profiles.length || !activeProfileId) return;
  const normalized = { activeProfileId, profiles };
  localStorage.setItem(AI_SERVICE_PROFILES_STORAGE, JSON.stringify(normalized));
  const active = profiles.find(profile => profile.id === activeProfileId)!;
  localStorage.setItem(AI_SERVICE_SETTINGS_STORAGE, JSON.stringify(active));
  localStorage.removeItem(API_KEY_STORAGE);
  localStorage.removeItem(LEGACY_API_KEY_STORAGE);
}

export async function getAiServiceProfileStore(): Promise<AiServiceProfileStore> {
  const metadata = getAiServiceProfileMetadataStore();
  let migratedPlaintext = false;
  const profiles = await Promise.all(metadata.profiles.map(async profile => {
    if (profile.apiKey) {
      await saveEncryptedApiKey(profile.id, profile.apiKey);
      migratedPlaintext = true;
      return profile;
    }
    try {
      return { ...profile, apiKey: await loadEncryptedApiKey(profile.id) };
    } catch (err) {
      console.warn('Failed to decrypt an AI API key:', err);
      return { ...profile, apiKey: '' };
    }
  }));
  if (migratedPlaintext) persistAiServiceMetadata({ ...metadata, profiles });
  return { ...metadata, profiles };
}

export async function saveAiServiceProfileStore(store: AiServiceProfileStore): Promise<void> {
  const previous = getAiServiceProfileMetadataStore().profiles;
  const profiles = store.profiles.map(normalizeAiProfile);
  await Promise.all(profiles.map(profile => saveEncryptedApiKey(profile.id, profile.apiKey)));
  persistAiServiceMetadata({ ...store, profiles });
  const persistedIds = new Set(profiles.map(profile => profile.id));
  await Promise.all(previous.filter(profile => !persistedIds.has(profile.id)).map(profile => saveEncryptedApiKey(profile.id, '')));
}

export async function getAiServiceSettings(): Promise<AiServiceSettings> {
  const store = await getAiServiceProfileStore();
  return store.profiles.find(profile => profile.id === store.activeProfileId) || store.profiles[0] || DEFAULT_AI_SETTINGS;
}

export async function setCustomApiKey(key: string): Promise<void> {
  await saveAiServiceSettings({ ...await getAiServiceSettings(), apiKey: key.trim() });
}

export async function saveAiServiceSettings(settings: AiServiceSettings): Promise<void> {
  const store = await getAiServiceProfileStore();
  const activeIndex = store.profiles.findIndex(profile => profile.id === store.activeProfileId);
  const current = store.profiles[activeIndex] || DEFAULT_AI_PROFILE;
  const updated = normalizeAiProfile({ ...current, ...settings });
  if (activeIndex >= 0) store.profiles[activeIndex] = updated; else store.profiles.push(updated);
  await saveAiServiceProfileStore(store);
}

export async function getCustomApiKey(): Promise<string> {
  return (await getAiServiceSettings()).apiKey;
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
