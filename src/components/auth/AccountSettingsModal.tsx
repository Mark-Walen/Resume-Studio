import React, { useEffect, useState } from 'react';
import { KeyRound, Loader2, Save, UserRound, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { showAppMessage } from '../common/AppFeedback';
import { sanitizeExternalUrl, sanitizeImageUrl } from '../../utils/security';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUserProfile, changePassword, sendPasswordReset } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState<'profile' | 'password' | 'reset' | null>(null);
  const supportsPassword = !!user?.providerData.some(provider => provider.providerId === 'password');

  useEffect(() => {
    if (!isOpen) return;
    setDisplayName(user?.displayName || '');
    setPhotoURL(sanitizeExternalUrl(user?.photoURL || undefined) || '');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }, [isOpen, user?.displayName, user?.photoURL]);

  if (!isOpen) return null;

  const saveProfile = async () => {
    if (photoURL.trim() && !sanitizeExternalUrl(photoURL)) {
      showAppMessage('头像地址必须是有效的 HTTP 或 HTTPS 图片地址。', 'warning');
      return;
    }
    setBusy('profile');
    try {
      await updateUserProfile(displayName, photoURL);
      showAppMessage('账户资料已更新。', 'success');
    } catch (error) {
      showAppMessage(error instanceof Error ? error.message : '账户资料更新失败。', 'error');
    } finally {
      setBusy(null);
    }
  };

  const savePassword = async () => {
    if (newPassword.length < 8) return showAppMessage('新密码至少需要 8 位。', 'warning');
    if (newPassword !== confirmPassword) return showAppMessage('两次输入的新密码不一致。', 'warning');
    setBusy('password');
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showAppMessage('密码已修改。', 'success');
    } catch (error) {
      showAppMessage(error instanceof Error ? error.message : '密码修改失败，请确认当前密码。', 'error');
    } finally {
      setBusy(null);
    }
  };

  const resetPassword = async () => {
    if (!user?.email) return;
    setBusy('reset');
    try {
      await sendPasswordReset(user.email);
      showAppMessage('密码重置邮件已发送。', 'success');
    } catch (error) {
      showAppMessage(error instanceof Error ? error.message : '重置邮件发送失败。', 'error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2"><UserRound className="h-5 w-5 text-[#0071e3]" /><h2 className="text-base font-black">账户设置</h2></div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="关闭"><X className="h-4 w-4" /></button>
        </div>

        <div className="space-y-6 p-5">
          <section className="space-y-3">
            <div><h3 className="text-sm font-bold">个人资料</h3><p className="mt-1 text-xs text-slate-400">用户名和头像会显示在工作台账户入口。</p></div>
            <div className="flex items-center gap-4">
              {sanitizeImageUrl(photoURL) ? <img src={sanitizeImageUrl(photoURL)} alt="账户头像" className="h-14 w-14 rounded-2xl border border-slate-200 object-cover dark:border-slate-700" /> : <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950"><UserRound className="h-6 w-6" /></div>}
              <div className="min-w-0 flex-1 text-xs text-slate-500"><div className="truncate font-semibold text-slate-700 dark:text-slate-200">{user?.email}</div><div className="mt-1">支持 HTTPS 图片地址；留空则使用姓名首字母。</div></div>
            </div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">用户名<input value={displayName} onChange={event => setDisplayName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950" /></label>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">头像地址<input type="url" value={photoURL} onChange={event => setPhotoURL(event.target.value)} placeholder="https://…" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950" /></label>
            <button type="button" disabled={!!busy} onClick={() => void saveProfile()} className="inline-flex items-center gap-2 rounded-xl bg-[#0071e3] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{busy === 'profile' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}保存资料</button>
          </section>

          <section className="space-y-3 border-t border-slate-200 pt-5 dark:border-slate-800">
            <div><h3 className="flex items-center gap-2 text-sm font-bold"><KeyRound className="h-4 w-4 text-[#0071e3]" />登录密码</h3><p className="mt-1 text-xs text-slate-400">{supportsPassword ? '修改密码前需要验证当前密码。' : '当前使用第三方账户登录，请在对应账户中心管理密码。'}</p></div>
            {supportsPassword && <>
              <input type="password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} placeholder="当前密码" autoComplete="current-password" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950" />
              <div className="grid gap-3 sm:grid-cols-2"><input type="password" value={newPassword} onChange={event => setNewPassword(event.target.value)} placeholder="新密码" autoComplete="new-password" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950" /><input type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} placeholder="再次输入新密码" autoComplete="new-password" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950" /></div>
              <button type="button" disabled={!!busy} onClick={() => void savePassword()} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:border-blue-300 hover:text-blue-600 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300">修改密码</button>
            </>}
            <button type="button" disabled={!!busy || !user?.email} onClick={() => void resetPassword()} className="ml-2 text-xs font-bold text-[#0071e3] hover:underline disabled:opacity-50">忘记密码？发送重置邮件</button>
          </section>
        </div>
      </div>
    </div>
  );
};
