import React, { FormEvent, useRef, useState } from 'react';
import { FirebaseError } from 'firebase/app';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { APP_COPYRIGHT, APP_VERSION } from '../../config/appMeta';
import { LegalConsent, LegalDocumentDialog, LegalLinks } from '../legal/LegalCenter';
import { LegalDocumentType } from '../../config/legal';

type AuthMode = 'signin' | 'register' | 'reset';

const App = React.lazy(() => import('../../App'));

function getAuthError(error: unknown): string {
  const code = error instanceof FirebaseError ? error.code : '';
  const messages: Record<string, string> = {
    'auth/invalid-credential': '无法完成登录，请检查信息或稍后重试。',
    'auth/user-not-found': '无法完成登录，请检查信息或稍后重试。',
    'auth/wrong-password': '无法完成登录，请检查信息或稍后重试。',
    'auth/email-already-in-use': '无法完成注册，请检查信息或稍后重试。',
    'auth/invalid-email': '请输入有效的邮箱地址。',
    'auth/weak-password': '密码强度不足，请使用至少 10 位并包含大小写字母和数字。',
    'auth/popup-closed-by-user': 'Google 登录窗口已关闭。',
    'auth/popup-blocked': '浏览器阻止了登录窗口，请允许弹窗后重试。',
    'auth/too-many-requests': '尝试次数过多，请稍后再试。',
    'auth/network-request-failed': '网络请求失败，请检查连接后重试。',
  };
  return messages[code] || (error instanceof Error ? error.message : '操作失败，请稍后重试。');
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-slate-950 flex items-center justify-center text-slate-600 dark:text-slate-300">
      <div className="flex items-center gap-3 rounded-2xl bg-white dark:bg-slate-900 px-5 py-4 shadow-sm border border-slate-200 dark:border-slate-800">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        <span className="text-sm font-semibold">正在确认登录状态…</span>
      </div>
    </div>
  );
}

function AuthDialog({ mode: initialMode, onClose }: { mode: AuthMode; onClose: () => void }) {
  const { registerWithEmail, sendPasswordReset, signInWithEmail, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(() => localStorage.getItem('resume-pilot-next-account') || '');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [legalDocument, setLegalDocument] = useState<LegalDocumentType | null>(null);
  const [website, setWebsite] = useState('');
  const [blockedUntil, setBlockedUntil] = useState(0);
  const failedAttempts = useRef(0);
  const openedAt = useRef(Date.now());

  const run = async (action: () => Promise<void>) => {
    if (Date.now() < blockedUntil) {
      setError('尝试过于频繁，请稍后再试。');
      return;
    }
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await action();
      failedAttempts.current = 0;
    } catch (err) {
      failedAttempts.current += 1;
      if (failedAttempts.current >= 5) setBlockedUntil(Date.now() + 30_000);
      setError(getAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (website || Date.now() - openedAt.current < 700) {
      setError('请求未通过安全检查，请稍后重试。');
      return;
    }
    if (mode === 'reset') {
      void run(async () => {
        await sendPasswordReset(email);
        setMessage('密码重置邮件已发送，请检查收件箱。');
      });
      return;
    }
    if (mode === 'register') {
      if (!legalAccepted) {
        setError('请先阅读并同意用户协议、隐私政策及个人信息收集清单。');
        return;
      }
      void run(() => registerWithEmail(name, email, password));
      return;
    }
    void run(() => signInWithEmail(email, password));
  };

  const changeMode = (next: AuthMode) => {
    setMode(next);
    setError('');
    setMessage('');
    setLegalAccepted(false);
    openedAt.current = Date.now();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/50 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Resume Pilot</p>
            <h2 className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">
              {mode === 'signin' ? '登录个人工作台' : mode === 'register' ? '创建你的账户' : '找回密码'}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white" aria-label="关闭">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {mode !== 'reset' && (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (!legalAccepted) {
                  setError('请先阅读并同意用户协议、隐私政策及个人信息收集清单。');
                  return;
                }
                void run(() => signInWithGoogle(true));
              }}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-base font-black text-blue-600 shadow-sm">G</span>
              使用 Google 账户继续
            </button>
          )}

          {mode !== 'reset' && (
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              或使用邮箱
              <span className="h-px flex-1 bg-slate-200" />
            </div>
          )}

          {mode === 'register' && (
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              昵称
              <input value={name} onChange={event => setName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3.5 py-2.5 font-normal outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950" placeholder="如何称呼你" autoComplete="name" />
            </label>
          )}

          {mode === 'register' && <input aria-hidden="true" tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)} className="pointer-events-none absolute h-px w-px opacity-0" name="website" />}

          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            邮箱
            <input required type="email" value={email} onChange={event => setEmail(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3.5 py-2.5 font-normal outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950" placeholder="name@example.com" autoComplete="email" />
          </label>

          {mode !== 'reset' && (
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              密码
              <input required minLength={mode === 'register' ? 10 : 6} type="password" value={password} onChange={event => setPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3.5 py-2.5 font-normal outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950" placeholder={mode === 'register' ? '至少 10 位，须包含大小写字母和数字' : '输入密码'} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />
            </label>
          )}

          {mode !== 'reset' && <LegalConsent checked={legalAccepted} onChange={setLegalAccepted} onOpen={setLegalDocument} googleOnly={mode === 'signin'} />}

          {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700">{error}</p>}
          {message && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-medium text-emerald-700">{message}</p>}

          <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === 'signin' ? '登录' : mode === 'register' ? '注册并发送验证邮件' : '发送重置邮件'}
          </button>

          <div className="flex items-center justify-between text-xs">
            {mode === 'signin' ? (
              <>
                <button type="button" onClick={() => changeMode('reset')} className="font-semibold text-slate-500 hover:text-blue-700">忘记密码？</button>
                <button type="button" onClick={() => changeMode('register')} className="font-bold text-blue-600 hover:text-blue-800">创建账户</button>
              </>
            ) : (
              <button type="button" onClick={() => changeMode('signin')} className="ml-auto font-bold text-blue-600 hover:text-blue-800">返回登录</button>
            )}
          </div>
        </form>
      </div>
      {legalDocument && <LegalDocumentDialog type={legalDocument} onClose={() => setLegalDocument(null)} />}
    </div>
  );
}

function GuestLanding() {
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const features = [
    { icon: FileText, title: '简历工坊', text: '多模板编辑、实时预览、导入与专业导出。' },
    { icon: BriefcaseBusiness, title: '求职管理', text: '统一跟踪投递、公司背调、面试日程与提醒。' },
    { icon: BarChart3, title: '面试诊断', text: '沉淀复盘记录，发现高频问题与持续薄弱点。' },
    { icon: BookOpen, title: '知识与素材', text: '把学习笔记与工作证据转化为可复用成果。' },
  ];

  return (
    <div className="min-h-screen overflow-x-clip bg-[#f5f5f7] dark:bg-slate-950 text-slate-950 dark:text-white transition-colors">
      <header className="relative z-50 overflow-visible border-b border-black/5 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white">AI</div>
            <div>
              <div className="text-sm font-extrabold tracking-tight">Resume Pilot</div>
              <div className="text-[10px] text-slate-400">智能简历与求职管理平台</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={() => setAuthMode('signin')} className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">登录</button>
            <button onClick={() => setAuthMode('register')} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700">免费开始</button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
              <Sparkles className="h-3.5 w-3.5" />
              从经历整理到 Offer 管理，一站完成
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.1] tracking-[-0.04em] sm:text-6xl">
              让每一段经历，变成更有说服力的职业故事。
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
              Resume Pilot 将简历、投递、面试复盘与知识沉淀连接起来，让你的求职准备始终有据可查、有路可走。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => setAuthMode('register')} className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700">
                创建个人工作台 <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => setAuthMode('signin')} className="rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:border-slate-400">已有账户，直接登录</button>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" />邮箱或 Google 登录</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" />个人数据隔离</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" />AI Key 不公开</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-12 -top-12 h-56 w-56 rounded-full bg-blue-300/30 blur-3xl" />
            <div className="absolute -bottom-10 -right-10 h-52 w-52 rounded-full bg-indigo-300/25 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/70 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 p-5 shadow-2xl shadow-slate-300/45 dark:shadow-black/30 backdrop-blur">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <p className="text-xs font-bold text-blue-600">个人工作台</p>
                  <p className="mt-1 text-lg font-extrabold">本周求职进度</p>
                </div>
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-600"><BarChart3 className="h-6 w-6" /></div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {['简历资料', '求职进度', '复盘知识'].map((label) => (
                  <div key={label} className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-4">
                    <CheckCircle2 className="h-5 w-5 text-blue-500" /><p className="mt-2 text-[11px] font-semibold text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-3">
                {['整理真实经历与成果', '跟踪自己的投递和面试', '沉淀个人笔记与闪卡'].map((item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 p-3.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${index === 0 ? 'bg-orange-400' : index === 1 ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                    <span className="flex-1 text-xs font-bold text-slate-700 dark:text-slate-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-black/5 dark:border-slate-800 bg-white dark:bg-slate-900 py-16">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">完整求职闭环</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">登录后，所有工作围绕你持续积累。</h2>
            </div>
            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ icon: Icon, title, text }) => (
                <article key={title} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="inline-flex rounded-2xl bg-blue-50 p-3 text-blue-600"><Icon className="h-5 w-5" /></div>
                  <h3 className="mt-4 text-sm font-extrabold">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-12 sm:px-8 md:flex-row md:items-center">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-6 w-6 text-emerald-600" />
            <div><h2 className="text-sm font-extrabold">游客与个人数据明确隔离</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">游客只能查看公开介绍。简历、投递、面试、知识库和 AI 请求必须登录后使用。</p></div>
          </div>
          <button onClick={() => setAuthMode('signin')} className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800"><LockKeyhole className="h-4 w-4" />进入安全工作台</button>
        </section>
      </main>

      <footer className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-slate-200 px-5 py-5 text-center text-[11px] text-slate-400 dark:border-slate-800"><span>{APP_COPYRIGHT} · Version {APP_VERSION}</span><LegalLinks className="inline-flex items-center gap-2" /></footer>

      {authMode && <AuthDialog mode={authMode} onClose={() => setAuthMode(null)} />}
    </div>
  );
}

function VerifyEmailScreen() {
  const { refreshUser, resendVerification, signOutUser, user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const run = async (action: () => Promise<void>, success: string) => {
    setBusy(true); setError(''); setMessage('');
    try { await action(); setMessage(success); } catch (err) { setError(getAuthError(err)); } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-slate-950 p-5 flex items-center justify-center text-slate-950 dark:text-white">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 text-center shadow-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Mail className="h-7 w-7" /></div>
        <h1 className="mt-5 text-2xl font-black">请验证你的邮箱</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">验证邮件已发送至 <strong className="text-slate-800">{user?.email}</strong>。完成验证后返回此页面刷新状态，即可进入个人工作台。</p>
        {message && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">{message}</p>}
        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</p>}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button disabled={busy} onClick={() => void run(refreshUser, '登录状态已刷新。')} className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"><RefreshCw className="h-4 w-4" />我已完成验证</button>
          <button disabled={busy} onClick={() => void run(resendVerification, '新的验证邮件已发送。')} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">重新发送邮件</button>
        </div>
        <button onClick={() => void signOutUser()} className="mt-5 text-xs font-bold text-slate-400 hover:text-slate-700">退出并更换账户</button>
      </div>
    </div>
  );
}

export function AuthGate() {
  const { loading, user } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <GuestLanding />;
  if (!user.emailVerified && user.providerData.some(provider => provider.providerId === 'password')) return <VerifyEmailScreen />;
  return <React.Suspense fallback={<LoadingScreen />}><App /></React.Suspense>;
}
