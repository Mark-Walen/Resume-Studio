import React from 'react';
import { Copy, FilePlus2, Files, Pencil, Trash2 } from 'lucide-react';
import { ResumeData } from '../../types/resume';

interface ResumeLibraryControlsProps {
  resumes: ResumeData[];
  activeResumeId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDuplicate: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export const ResumeLibraryControls: React.FC<ResumeLibraryControlsProps> = ({
  resumes,
  activeResumeId,
  onSelect,
  onCreate,
  onDuplicate,
  onRename,
  onDelete,
}) => (
  <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <div className="flex min-w-0 items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#0071e3] flex items-center justify-center flex-shrink-0">
        <Files className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">我的简历库 · {resumes.length} 份</div>
        <select
          value={activeResumeId}
          onChange={event => onSelect(event.target.value)}
          className="mt-0.5 max-w-full min-w-56 bg-transparent text-sm font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
          aria-label="选择简历"
        >
          {resumes.map(item => (
            <option key={item.id} value={item.id}>{item.title || item.personalInfo.fullName || '未命名简历'}</option>
          ))}
        </select>
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-1.5">
      <button type="button" onClick={onCreate} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold cursor-pointer">
        <FilePlus2 className="w-3.5 h-3.5" />新建
      </button>
      <button type="button" onClick={onDuplicate} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer">
        <Copy className="w-3.5 h-3.5" />复制
      </button>
      <button type="button" onClick={onRename} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer">
        <Pencil className="w-3.5 h-3.5" />重命名
      </button>
      <button type="button" onClick={onDelete} disabled={resumes.length <= 1} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
        <Trash2 className="w-3.5 h-3.5" />删除
      </button>
    </div>
  </div>
);
