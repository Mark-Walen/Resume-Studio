import React from 'react';
import {
  FileText,
  Briefcase,
  Video,
  Library,
  PenTool,
  Download,
  Upload,
  Key,
  Calendar,
  LogOut
} from 'lucide-react';
import { ThemeToggle } from './common/ThemeToggle';
import { ModelQuickSwitcher } from './common/ModelQuickSwitcher';

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
  userName: string;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenExport,
  onOpenApiKey,
  onOpenImportResume,
  userName,
  onSignOut,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 font-sans transition-colors">
      <div className="max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 xl:gap-6">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 flex-shrink-0 cursor-pointer" onClick={() => onSelectTab('resume')}>
          <div className="w-9 h-9 rounded-xl bg-[#0071e3] text-white flex items-center justify-center font-black shadow-xs tracking-wider text-sm flex-shrink-0">
            AI
          </div>
          <div className="flex flex-col">
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
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold flex-shrink-0">
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
        <div className="flex items-center gap-2 flex-shrink-0">
          {currentTab === 'resume' && onOpenImportResume && (
            <button
              onClick={onOpenImportResume}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-colors flex-shrink-0 whitespace-nowrap cursor-pointer"
              title="导入已有简历文件或文本"
            >
              <Upload className="w-3.5 h-3.5 flex-shrink-0" />
              <span>导入简历</span>
            </button>
          )}

          <button
            onClick={onOpenExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex-shrink-0 whitespace-nowrap"
            title="导出高保真 PDF、Word 或发送求职信"
          >
            <Download className="w-3.5 h-3.5 flex-shrink-0" />
            <span>导出与发送</span>
          </button>

          {/* Quick AI Model Switcher (Trae / Workbuddy style) */}
          <ModelQuickSwitcher onOpenSettings={onOpenApiKey} />

          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* API Key Modal Button */}
          <button
            onClick={onOpenApiKey}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-[#0071e3] dark:hover:text-[#0071e3] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800 flex-shrink-0 cursor-pointer"
            title="AI 模型与通用 API 设置"
          >
            <Key className="w-4 h-4" />
          </button>

          <div className="hidden sm:flex max-w-36 items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5" title={userName}>
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950 text-[10px] font-black uppercase text-blue-700 dark:text-blue-300">
              {userName.slice(0, 1)}
            </span>
            <span className="truncate text-[11px] font-bold text-slate-600 dark:text-slate-300">{userName}</span>
          </div>
          <button
            onClick={onSignOut}
            className="p-2 text-slate-500 hover:text-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors border border-slate-200 dark:border-slate-800"
            title="退出登录"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation */}
      <div className="lg:hidden flex overflow-x-auto px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-medium gap-1 scrollbar-none">
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
