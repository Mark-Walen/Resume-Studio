import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  GoogleAuthProvider,
  EmailAuthProvider,
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
  initializeRecaptchaConfig,
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { clearPendingLegalConsent, queueCurrentLegalConsent, recordCurrentLegalConsent } from '../services/consentService';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: (recordConsent?: boolean) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserProfile: (displayName: string, photoURL: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  knownAccounts: KnownAccount[];
  switchAccount: (email?: string) => Promise<void>;
}

export interface KnownAccount { uid: string; email: string; displayName: string; photoURL?: string; }
const KNOWN_ACCOUNTS_KEY = 'resume-pilot-known-accounts';
const NEXT_ACCOUNT_KEY = 'resume-pilot-next-account';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRevision, setUserRevision] = useState(0);
  const [knownAccounts, setKnownAccounts] = useState<KnownAccount[]>(() => {
    try { return JSON.parse(localStorage.getItem(KNOWN_ACCOUNTS_KEY) || '[]'); } catch { return []; }
  });

  useEffect(() => onAuthStateChanged(auth, currentUser => {
    setUser(currentUser);
    setLoading(false);
    if (currentUser) void recordCurrentLegalConsent().catch(error => console.warn('Pending legal consent sync failed:', error instanceof Error ? error.message : error));
    if (currentUser?.email) setKnownAccounts(previous => {
      const next = [{ uid: currentUser.uid, email: currentUser.email!, displayName: currentUser.displayName || currentUser.email!, photoURL: currentUser.photoURL || undefined }, ...previous.filter(item => item.uid !== currentUser.uid)].slice(0, 8);
      localStorage.setItem(KNOWN_ACCOUNTS_KEY, JSON.stringify(next));
      return next;
    });
  }), []);

  useEffect(() => {
    initializeRecaptchaConfig(auth).catch(error => {
      console.warn('Identity Platform reCAPTCHA configuration is not available yet:', error instanceof Error ? error.message : error);
    });
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    signInWithEmail: async (email, password) => {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    },
    registerWithEmail: async (name, email, password) => {
      queueCurrentLegalConsent('email_registration');
      try {
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (name.trim()) await updateProfile(credential.user, { displayName: name.trim() });
        await recordCurrentLegalConsent('email_registration');
        await sendEmailVerification(credential.user, { url: window.location.origin });
        await credential.user.reload();
        setUser(auth.currentUser);
      } catch (error) {
        if (!auth.currentUser) clearPendingLegalConsent();
        throw error;
      }
    },
    signInWithGoogle: async (recordConsent = false) => {
      if (recordConsent) queueCurrentLegalConsent('google_registration');
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      try {
        await signInWithPopup(auth, provider);
        if (recordConsent) await recordCurrentLegalConsent('google_registration');
      } catch (error) {
        if (!auth.currentUser) clearPendingLegalConsent();
        throw error;
      }
    },
    sendPasswordReset: async email => {
      await sendPasswordResetEmail(auth, email.trim(), { url: window.location.origin });
    },
    resendVerification: async () => {
      if (!auth.currentUser) throw new Error('当前没有已登录用户。');
      await sendEmailVerification(auth.currentUser, { url: window.location.origin });
    },
    refreshUser: async () => {
      if (!auth.currentUser) return;
      await auth.currentUser.reload();
      setUser(auth.currentUser);
      setUserRevision(value => value + 1);
    },
    updateUserProfile: async (displayName, photoURL) => {
      if (!auth.currentUser) throw new Error('当前没有已登录用户。');
      await updateProfile(auth.currentUser, {
        displayName: displayName.trim() || null,
        photoURL: photoURL.trim() || null,
      });
      await auth.currentUser.reload();
      setUser(auth.currentUser);
      setUserRevision(value => value + 1);
    },
    changePassword: async (currentPassword, newPassword) => {
      const currentUser = auth.currentUser;
      if (!currentUser?.email) throw new Error('当前账户没有可用于验证的邮箱。');
      const supportsPassword = currentUser.providerData.some(provider => provider.providerId === 'password');
      if (!supportsPassword) throw new Error('Google 登录账户请在 Google 账户中心管理密码。');
      await reauthenticateWithCredential(currentUser, EmailAuthProvider.credential(currentUser.email, currentPassword));
      await updatePassword(currentUser, newPassword);
    },
    signOutUser: () => signOut(auth),
    knownAccounts,
    switchAccount: async email => {
      if (email) localStorage.setItem(NEXT_ACCOUNT_KEY, email);
      else localStorage.removeItem(NEXT_ACCOUNT_KEY);
      await signOut(auth);
    },
  }), [knownAccounts, loading, user, userRevision]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider.');
  return value;
}
