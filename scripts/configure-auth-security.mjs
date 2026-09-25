import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'resume-pilot-509509';
const requestedMode = String(process.argv[2] || 'audit').toLowerCase();
if (!['audit', 'enforce'].includes(requestedMode)) {
  throw new Error('Usage: node scripts/configure-auth-security.mjs [audit|enforce]');
}

const app = getApps()[0] || initializeApp({ credential: applicationDefault(), projectId });
const enforcementState = requestedMode === 'enforce' ? 'ENFORCE' : 'AUDIT';
const updated = await getAuth(app).projectConfigManager().updateProjectConfig({
  recaptchaConfig: {
    emailPasswordEnforcementState: enforcementState,
    managedRules: [{ endScore: 0.5, action: 'BLOCK' }],
    useAccountDefender: true,
  },
  emailPrivacyConfig: { enableImprovedEmailPrivacy: true },
  passwordPolicyConfig: {
    enforcementState: 'ENFORCE',
    forceUpgradeOnSignin: false,
    constraints: {
      minLength: 10,
      requireUppercase: true,
      requireLowercase: true,
      requireNumeric: true,
    },
  },
});

console.log(JSON.stringify({
  projectId,
  recaptchaMode: updated.recaptchaConfig?.emailPasswordEnforcementState,
  emailPrivacy: updated.emailPrivacyConfig?.enableImprovedEmailPrivacy,
  passwordPolicy: updated.passwordPolicyConfig,
}, null, 2));
