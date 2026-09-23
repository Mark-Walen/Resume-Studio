import React, { useState, useEffect, useRef } from 'react';
import { Cpu, ChevronDown, Check, Settings, Sparkles, Zap } from 'lucide-react';
import { AiModelProfile, PROVIDER_CONFIGS } from '../../types/aiProvider';
import { loadAiModelProfiles, getActiveAiProfile, setActiveAiProfile } from '../../utils/db';

interface ModelQuickSwitcherProps {
  onOpenSettings?: () => void;
}

export const ModelQuickSwitcher: React.FC<ModelQuickSwitcherProps> = ({ onOpenSettings }) => {
  const [profiles, setProfiles] = useState<AiModelProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<AiModelProfile | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const refreshProfiles = () => {
    const loaded = loadAiModelProfiles();
    setProfiles(loaded);
    const active = getActiveAiProfile();
    setActiveProfile(active);
  };

  useEffect(() => {
    refreshProfiles();

    // Listen for storage or custom events when profiles change in ApiKeyModal
    const handleStorageChange = () => refreshProfiles();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('ai-profile-updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('ai-profile-updated', handleStorageChange);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectProfile = (id: string) => {
    setActiveAiProfile(id);
    refreshProfiles();
    setIsOpen(false);
    // Dispatch custom event so any active AI service picks it up
    window.dispatchEvent(new Event('ai-profile-updated'));
  };

  const currentLabel = activeProfile
    ? activeProfile.modelName || PROVIDER_CONFIGS[activeProfile.provider]?.label || '默认模型'
    : '选择模型方案';

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        id="btn-quick-model-switcher"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition-all shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer"
        title="快速切换 AI 模型方案"
      >
        <Zap className="w-3.5 h-3.5 text-[#0071e3] flex-shrink-0" />
        <span className="truncate max-w-[110px] sm:max-w-[150px] font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-100">
          {currentLabel}
        </span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              AI 模型方案切换
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              共 {profiles.length} 组方案
            </span>
          </div>

          <div className="py-1 max-h-56 overflow-y-auto">
            {profiles.map((p) => {
              const isSelected = activeProfile?.id === p.id;
              const providerConfig = PROVIDER_CONFIGS[p.provider];
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectProfile(p.id)}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 text-[#0071e3] font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate font-medium text-slate-900 dark:text-white">
                        {p.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {providerConfig?.label?.split(' ')[0] || p.provider}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                      {p.modelName}
                    </span>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-[#0071e3] flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-1.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenSettings?.();
              }}
              className="w-full text-center px-3 py-1.5 rounded-xl text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>配置多模型方案与 API 密钥...</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
