import React, { useState, useEffect } from 'react';
import { getCustomApiKey, saveCustomApiKey } from '../utils/db';
import { checkApiHealth } from '../services/geminiService';
import { KeyRound, ShieldCheck, Check, X } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [hasEnvKey, setHasEnvKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = getCustomApiKey();
      if (stored) setApiKey(stored);

      checkApiHealth().then(res => {
        setHasEnvKey(res.hasEnvKey);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveCustomApiKey(apiKey.trim());
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  const handleClear = () => {
    saveCustomApiKey('');
    setApiKey('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">AI 服务与隐私设置</h2>
          </div>
          <button onClick={onClose} aria-label="关闭" className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Status banner */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800">服务端 AI 凭据：</span>
              <span className={hasEnvKey ? 'text-emerald-600 font-bold' : 'text-slate-500 font-medium'}>
                {hasEnvKey ? '已安全配置' : '未配置'}
              </span>
            </div>
            {hasEnvKey && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">个人 AI 服务 API Key</label>
            <input
              type="password"
              placeholder="输入所选 AI 服务提供的 API Key"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              密钥仅保存在当前浏览器，用于简历生成、面试复盘和知识整理。平台文案不绑定特定模型品牌。
            </p>
          </div>

          {/* Security details */}
          <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-200 text-[11px] text-blue-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-blue-950">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              文件防病毒与入侵防御机制已生效:
            </div>
            <ul className="space-y-0.5 text-blue-800 pl-4 list-disc">
              <li>上传文件严格基于后缀白名单校验，拒绝一切二进制脚本与危险宏</li>
              <li>检查文件前导 Magic Number 二进制特征头，严防假冒伪装木马</li>
              <li>深度过滤包含恶意命令、注入提权及 Prompt Jailbreak 绕过字符</li>
              <li>音视频采用本地 IndexedDB 浏览器沙盒持久化隔离，不上传未知公网</li>
            </ul>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={handleClear}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
          >
            清空已存密钥
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              {isSaved ? <Check className="w-3.5 h-3.5" /> : null}
              {isSaved ? '已保存' : '保存设置'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
