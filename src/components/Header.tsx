import React, { useEffect, useRef, useState } from 'react';
import {
  FileText,
  Briefcase,
  Video,
  Library,
  PenTool,
  FileInput,
  FileOutput,
  Calendar,
  LogOut,
  Cloud,
  CloudOff,
  CloudCheck,
  LoaderCircle,
  ChevronDown,
  MessageSquareText,
  UserRound,
  Settings,
  DatabaseBackup,
  Users,
} from 'lucide-react';
import { ThemeToggle } from './common/ThemeToggle';
import { ModelQuickSwitcher } from './common/ModelQuickSwitcher';
import { sanitizeImageUrl } from '../utils/security';

export type MainTab =
  | 'resume'
  | 'interview_management'
  | 'interviews'
  | 'knowledge'
  | 'daily_log';

interface HeaderProps {
  currentTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  onOpenExport: () => void;
  onOpenApiKey: () => void;
  onOpenImportResume?: () => void;
  onSaveWorkspace: () => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  userName: string;
  userPhotoURL?: string;
  onSignOut: () => void;
  onOpenFeedback: () => void;
  onOpenAccountSettings: () => void;
  onOpenSyncCenter: () => void;
  syncError?: string;
  knownAccounts: Array<{ uid: string; email: string; displayName: string }>;
  currentUserId?: string;
  onSwitchAccount: (email?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenExport,
  onOpenApiKey,
  onOpenImportResume,
  onSaveWorkspace,
  saveStatus,
  userName,
  userPhotoURL,
  onSignOut,
  onOpenFeedback,
  onOpenAccountSettings,
  onOpenSyncCenter,
  syncError,
  knownAccounts,
  currentUserId,
  onSwitchAccount,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) setIsUserMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full min-w-0 overflow-visible bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 font-sans transition-colors">
      <div className="max-w-[1720px] w-full min-w-0 mx-auto px-3 sm:px-5 lg:px-8 h-16 flex items-center justify-between gap-2 xl:gap-4">
        {/* Logo & Brand */}
        <div className="flex min-w-0 items-center gap-3 flex-shrink-0 cursor-pointer" onClick={() => onSelectTab('resume')}>
          <div className="w-9 h-9 rounded-xl bg-[#0071e3] text-white flex items-center justify-center font-black shadow-xs tracking-wider text-sm flex-shrink-0">
            AI
          </div>
          <div className="hidden min-w-0 flex-col md:flex">
            <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight flex items-center gap-1.5 whitespace-nowrap">
              智能简历与求职工作台
              <span className="hidden sm:inline-block px-1.5 py-0.2 bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] border border-blue-100 dark:border-blue-900/60 text-[10px] font-semibold rounded-full">
                Pro
              </span>
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden 2xl:block -mt-0.5 whitespace-nowrap">
              全流程简历精修 · 投递看板与背调 · 模拟复盘 · 深度书库
            </span>
          </div>
        </div>

        {/* Center Tabs Navigation */}
        <nav className="hidden 2xl:flex items-center gap-0.5 xl:gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold flex-shrink-0">
          <button
            id="tab-resume"
            onClick={() => onSelectTab('resume')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              currentTab === 'resume'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#0071e3]" />
            <span>简历工坊</span>
          </button>

          <button
            id="tab-interview-management"
            onClick={() => onSelectTab('interview_management')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              currentTab === 'interview_management'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-[#0071e3]" />
            <span>求职与面试管理</span>
          </button>

          <button
            id="tab-interviews"
            onClick={() => onSelectTab('interviews')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              currentTab === 'interviews'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-[#0071e3]" />
            <span>模拟实战与复盘</span>
          </button>

          <button
            id="tab-knowledge"
            onClick={() => onSelectTab('knowledge')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              currentTab === 'knowledge'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Library className="w-3.5 h-3.5 text-[#0071e3]" />
            <span>深度知识书库</span>
          </button>

          <button
            id="tab-daily-log"
            onClick={() => onSelectTab('daily_log')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              currentTab === 'daily_log'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PenTool className="w-3.5 h-3.5 text-[#0071e3]" />
            <span>求职手记</span>
          </button>
        </nav>

        {/* Right action buttons */}
        <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-2 flex-shrink-0">
          {currentTab === 'resume' && onOpenImportResume && (
            <button
              onClick={onOpenImportResume}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-colors flex-shrink-0 whitespace-nowrap cursor-pointer"
              title="导入已有简历文件或文本"
            >
              <FileInput className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden xl:inline">导入简历</span>
            </button>
          )}

          <button
            onClick={onOpenExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex-shrink-0 whitespace-nowrap"
            title="导出高保真 PDF、Word 或发送求职信"
          >
            <FileOutput className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden xl:inline">导出与发送</span>
          </button>

          {/* Quick AI Model Switcher (Trae / Workbuddy style) */}
          <ModelQuickSwitcher onOpenSettings={onOpenApiKey} />

          <button
            onClick={onSaveWorkspace}
            disabled={saveStatus === 'saving'}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-slate-600 dark:text-slate-300 hover:text-[#0071e3] dark:hover:text-[#0071e3] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800 flex-shrink-0 cursor-pointer disabled:cursor-wait"
            title={saveStatus === 'error' ? '上次云端保存失败，点击重试' : '立即保存简历与工作区到云端'}
          >
            {saveStatus === 'saving' ? <LoaderCircle className="w-4 h-4 animate-spin" /> : syncError || saveStatus === 'error' ? <CloudOff className="w-4 h-4 text-amber-600" /> : saveStatus === 'saved' ? <CloudCheck className="w-4 h-4 text-emerald-600" /> : <Cloud className="w-4 h-4" />}
            <span className="hidden 2xl:inline text-xs font-semibold">
              {saveStatus === 'saving' ? '保存中' : syncError || saveStatus === 'error' ? '同步异常' : saveStatus === 'saved' ? '已保存' : '云端保存'}
            </span>
          </button>

          {/* Theme Toggle Button */}
          <ThemeToggle />

          <div ref={userMenuRef} className="relative flex-shrink-0">
            <button
              id="btn-user-menu"
              type="button"
              onClick={() => setIsUserMenuOpen(value => !value)}
              className="flex max-w-44 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-slate-600 transition-colors hover:border-blue-200 hover:text-[#0071e3] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              aria-expanded={isUserMenuOpen}
              title={userName}
            >
              {sanitizeImageUrl(userPhotoURL) ? <img src={sanitizeImageUrl(userPhotoURL)} alt="账户头像" className="h-6 w-6 flex-shrink-0 rounded-lg object-cover" /> : <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-[10px] font-black uppercase text-blue-700 dark:bg-blue-950 dark:text-blue-300">{userName.slice(0, 1)}</span>}
              <span className="hidden max-w-24 truncate text-[11px] font-bold 2xl:inline">{userName}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full z-[90] mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center gap-2.5 border-b border-slate-100 px-2.5 py-2.5 dark:border-slate-800">
                  <UserRound className="h-4 w-4 text-[#0071e3]" />
                  <div className="min-w-0"><div className="text-[10px] text-slate-400">当前账户</div><div className="truncate text-xs font-bold text-slate-700 dark:text-slate-200">{userName}</div></div>
                </div>
                <button type="button" onClick={() => { setIsUserMenuOpen(false); onOpenFeedback(); }} className="mt-1 flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                  <MessageSquareText className="h-4 w-4 text-[#0071e3]" />问题反馈
                </button>
                <button type="button" onClick={() => { setIsUserMenuOpen(false); onOpenAccountSettings(); }} className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                  <Settings className="h-4 w-4 text-[#0071e3]" />账户设置
                </button>
                <button type="button" onClick={() => { setIsUserMenuOpen(false); onOpenSyncCenter(); }} className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                  <DatabaseBackup className="h-4 w-4 text-[#0071e3]" />云端同步与还原
                </button>
                {knownAccounts.filter(account => account.uid !== currentUserId).map(account => <button key={account.uid} type="button" onClick={() => onSwitchAccount(account.email)} className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"><Users className="h-4 w-4"/><span className="min-w-0"><b className="block truncate text-slate-700 dark:text-slate-200">{account.displayName}</b><span className="block truncate text-[10px]">{account.email}</span></span></button>)}
                <button type="button" onClick={() => onSwitchAccount()} className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><Users className="h-4 w-4 text-[#0071e3]"/>登录其他账户</button>
                <button type="button" onClick={onSignOut} className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-950/40">
                  <LogOut className="h-4 w-4" />退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation */}
      <div className="2xl:hidden flex overflow-x-auto px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-medium gap-1 scrollbar-none">
        <button
          onClick={() => onSelectTab('resume')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap ${
            currentTab === 'resume' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          简历工坊
        </button>
        <button
          onClick={() => onSelectTab('interview_management')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap ${
            currentTab === 'interview_management' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          求职与面试管理
        </button>
        <button
          onClick={() => onSelectTab('interviews')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap ${
            currentTab === 'interviews' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          模拟实战与复盘
        </button>
        <button
          onClick={() => onSelectTab('knowledge')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap ${
            currentTab === 'knowledge' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          深度知识书库
        </button>
        <button
          onClick={() => onSelectTab('daily_log')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap ${
            currentTab === 'daily_log' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          求职手记
        </button>
      </div>
    </header>
  );
};
