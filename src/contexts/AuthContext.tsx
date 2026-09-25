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
} from 'firebase/auth';
import { auth } from '../services/firebase';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserProfile: (displayName: string, photoURL: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRevision, setUserRevision] = useState(0);

  useEffect(() => onAuthStateChanged(auth, currentUser => {
    setUser(currentUser);
    setLoading(false);
  }), []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    signInWithEmail: async (email, password) => {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    },
    registerWithEmail: async (name, email, password) => {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (name.trim()) await updateProfile(credential.user, { displayName: name.trim() });
      await sendEmailVerification(credential.user, { url: window.location.origin });
      await credential.user.reload();
      setUser(auth.currentUser);
    },
    signInWithGoogle: async () => {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
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
  }), [loading, user, userRevision]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider.');
  return value;
}
