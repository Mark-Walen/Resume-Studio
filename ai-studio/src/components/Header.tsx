import React from 'react';
import {
  FileText,
  Briefcase,
  BookOpen,
  Download,
  Upload,
  Globe,
  Key,
  SlidersHorizontal
} from 'lucide-react';

export type MainTab = 'resume' | 'career' | 'knowledge';

interface HeaderProps {
  currentTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  onOpenExport: () => void;
  onOpenApiKey: () => void;
  onOpenAiGenerator: () => void;
  onOpenImportResume?: () => void;
  onOpenJobProxy?: () => void;
  onOpenMultiOptimize?: () => void;
}


export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenExport,
  onOpenApiKey,
  onOpenAiGenerator,
  onOpenImportResume,
  onOpenJobProxy,
  onOpenMultiOptimize,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/82 backdrop-blur-xl border-b border-black/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-[10px] bg-blue-600 text-white flex items-center justify-center font-bold tracking-wide text-sm">
            AI
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight flex items-center gap-1.5">
              智能简历与求职管理平台
              <span className="hidden sm:inline-block px-2 py-0.2 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold rounded-full">
                Pro
              </span>
            </span>
            <span className="text-[10px] text-slate-400 block -mt-0.5">
              简历生成 · 求职进程 · 面试复盘 · 知识沉淀
            </span>
          </div>
        </div>

        {/* Center Tabs Navigation */}
        <nav className="hidden xl:flex items-center gap-1 bg-[#f5f5f7] p-1 rounded-[10px] text-xs font-semibold">
          <button
            id="tab-resume"
            onClick={() => onSelectTab('resume')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              currentTab === 'resume'
                ? 'bg-white text-blue-600 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            简历工坊
          </button>
          <button
            id="tab-career"
            onClick={() => onSelectTab('career')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              currentTab === 'career'
                ? 'bg-white text-blue-600 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            求职管理
          </button>
          <button
            id="tab-knowledge"
            onClick={() => onSelectTab('knowledge')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              currentTab === 'knowledge'
                ? 'bg-white text-blue-600 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            知识与素材
          </button>
        </nav>

        {/* Right action buttons */}
        <div className="flex items-center gap-2">
          {currentTab === 'resume' && (
            <>
              <button
                onClick={onOpenMultiOptimize}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:from-blue-700 hover:to-indigo-700 transition-all"
                title="针对最多3家意向公司的JD做针对性精修"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>3家公司JD精修</span>
              </button>
              {onOpenImportResume && (
                <button
                  onClick={onOpenImportResume}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold transition-colors"
                  title="导入已有简历文件或文本"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">导入简历</span>
                </button>
              )}
              <button
                onClick={onOpenExport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">导出与发送</span>
              </button>
            </>
          )}

          {currentTab === 'career' && (
            <>
              {onOpenJobProxy && (
                <button
                  onClick={onOpenJobProxy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold transition-colors"
                  title="网站代理抓取 JD 与一键投递"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">代理获取JD</span>
                </button>
              )}
            </>
          )}

          <button
            onClick={onOpenApiKey}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
            title="AI 服务与隐私设置"
          >
            <Key className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation */}
      <div className="xl:hidden flex overflow-x-auto px-4 py-2 border-t border-slate-100 bg-slate-50 text-xs font-medium gap-1 scrollbar-none">
        <button
          onClick={() => onSelectTab('resume')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap ${
            currentTab === 'resume' ? 'bg-white text-blue-600 font-bold shadow-xs' : 'text-slate-600'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          简历工坊
        </button>
        <button
          onClick={() => onSelectTab('career')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap ${
            currentTab === 'career' ? 'bg-white text-blue-600 font-bold shadow-xs' : 'text-slate-600'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          求职管理
        </button>
        <button
          onClick={() => onSelectTab('knowledge')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap ${
            currentTab === 'knowledge' ? 'bg-white text-blue-600 font-bold shadow-xs' : 'text-slate-600'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          知识与素材
        </button>
      </div>
    </header>
  );
};
