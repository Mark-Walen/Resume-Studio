import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'resume-pilot-509509';
const requestedMode = String(process.argv[2] || 'audit').toLowerCase();
if (!['audit', 'enforce'].includes(requestedMode)) {
  throw new Error('Usage: node scripts/configure-auth-security.mjs [audit|enforce]');
}

const enforcementState = requestedMode === 'enforce' ? 'ENFORCE' : 'AUDIT';
const clientConfig = {
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
};

const cliAccessToken = process.env.GOOGLE_OAUTH_ACCESS_TOKEN;
let updated;
if (cliAccessToken) {
  const serverConfig = {
    recaptchaConfig: clientConfig.recaptchaConfig,
    emailPrivacyConfig: clientConfig.emailPrivacyConfig,
    passwordPolicyConfig: {
      passwordPolicyEnforcementState: 'ENFORCE',
      forceUpgradeOnSignin: false,
      passwordPolicyVersions: [{
        customStrengthOptions: {
          containsUppercaseCharacter: true,
          containsLowercaseCharacter: true,
          containsNonAlphanumericCharacter: false,
          containsNumericCharacter: true,
          minPasswordLength: 10,
          maxPasswordLength: 4096,
        },
      }],
    },
  };
  const updateMask = [
    'recaptchaConfig.emailPasswordEnforcementState',
    'recaptchaConfig.managedRules',
    'recaptchaConfig.useAccountDefender',
    'passwordPolicyConfig.passwordPolicyEnforcementState',
    'passwordPolicyConfig.forceUpgradeOnSignin',
    'passwordPolicyConfig.passwordPolicyVersions',
    'emailPrivacyConfig.enableImprovedEmailPrivacy',
  ].join(',');
  const response = await fetch(`https://identitytoolkit.googleapis.com/v2/projects/${projectId}/config?updateMask=${encodeURIComponent(updateMask)}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${cliAccessToken}`,
      'Content-Type': 'application/json',
      'X-Goog-User-Project': projectId,
    },
    body: JSON.stringify(serverConfig),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(`Identity Platform update failed (${response.status}): ${payload?.error?.message || 'unknown error'}`);
  updated = {
    recaptchaConfig: payload.recaptchaConfig,
    emailPrivacyConfig: payload.emailPrivacyConfig,
    passwordPolicyConfig: payload.passwordPolicyConfig,
  };
} else {
  const app = getApps()[0] || initializeApp({ credential: applicationDefault(), projectId });
  updated = await getAuth(app).projectConfigManager().updateProjectConfig(clientConfig);
}

console.log(JSON.stringify({
  projectId,
  recaptchaMode: updated.recaptchaConfig?.emailPasswordEnforcementState,
  emailPrivacy: updated.emailPrivacyConfig?.enableImprovedEmailPrivacy,
  passwordPolicy: updated.passwordPolicyConfig,
}, null, 2));
