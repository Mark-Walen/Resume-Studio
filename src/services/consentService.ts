import { auth } from './firebase';
import { PRIVACY_POLICY_VERSION, USER_AGREEMENT_VERSION } from '../config/legal';

const PENDING_CONSENT_KEY = 'resume-pilot-pending-legal-consent';
type ConsentSource = 'email_registration' | 'google_registration';

export function queueCurrentLegalConsent(source: ConsentSource): void {
  localStorage.setItem(PENDING_CONSENT_KEY, JSON.stringify({
    userAgreementVersion: USER_AGREEMENT_VERSION,
    privacyPolicyVersion: PRIVACY_POLICY_VERSION,
    source,
    acceptedAt: new Date().toISOString(),
  }));
}

export function clearPendingLegalConsent(): void {
  localStorage.removeItem(PENDING_CONSENT_KEY);
}

export async function recordCurrentLegalConsent(source?: ConsentSource): Promise<void> {
  let pending: Record<string, string> | null = null;
  try { pending = JSON.parse(localStorage.getItem(PENDING_CONSENT_KEY) || 'null'); } catch { pending = null; }
  const consentSource = source || pending?.source as ConsentSource | undefined;
  if (!consentSource) return;
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('无法记录协议同意状态，请重新登录。');
  const response = await fetch('/api/legal-consent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      userAgreementVersion: pending?.userAgreementVersion || USER_AGREEMENT_VERSION,
      privacyPolicyVersion: pending?.privacyPolicyVersion || PRIVACY_POLICY_VERSION,
      source: consentSource,
    }),
  });
  if (!response.ok) throw new Error('账户已创建，但协议记录暂未同步，请稍后重新登录。');
  clearPendingLegalConsent();
}
