import React, { useEffect, useState } from 'react';
import { Cloud, History, Loader2, RotateCcw, Save, X } from 'lucide-react';
import { createWorkspaceRestorePoint, listWorkspaceRestorePoints, WorkspaceRestorePoint } from '../../services/workspaceSyncService';
import { showAppConfirm, showAppMessage } from '../common/AppFeedback';

interface WorkspaceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIncrementalSave: () => Promise<void>;
  onFullSave: () => Promise<void>;
  onRestore: (id: string) => Promise<void>;
}

export const WorkspaceSyncModal: React.FC<WorkspaceSyncModalProps> = ({ isOpen, onClose, onIncrementalSave, onFullSave, onRestore }) => {
  const [points, setPoints] = useState<WorkspaceRestorePoint[]>([]);
  const [busy, setBusy] = useState('');
  const load = async () => setPoints(await listWorkspaceRestorePoints());
  useEffect(() => { if (isOpen) void load().catch(() => setPoints([])); }, [isOpen]);
  if (!isOpen) return null;

  const run = async (key: string, action: () => Promise<void>, success: string) => {
    setBusy(key);
    try { await action(); showAppMessage(success, 'success'); await load(); }
    catch (error) { showAppMessage(error instanceof Error ? error.message : '操作失败。', 'error'); }
    finally { setBusy(''); }
  };

  return <div className="fixed inset-0 z-[145] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-2"><Cloud className="h-5 w-5 text-blue-600"/><h2 className="font-black">云端同步与还原</h2></div><button onClick={onClose} aria-label="关闭" className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4"/></button></div>
      <div className="space-y-6 p-5">
        <section><h3 className="text-sm font-bold">保存策略</h3><p className="mt-1 text-xs leading-5 text-slate-400">自动保存仅上传发生变化的顶层数据；全量更新会重新写入完整工作区。</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><button disabled={!!busy} onClick={() => void run('incremental', onIncrementalSave, '增量更新完成。')} className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-left dark:border-blue-900 dark:bg-blue-950/30">{busy === 'incremental' ? <Loader2 className="h-5 w-5 animate-spin"/> : <Save className="h-5 w-5 text-blue-600"/>}<span><b className="block text-sm">增量更新</b><small className="text-slate-500">只上传有变化的数据域</small></span></button><button disabled={!!busy} onClick={() => void run('full', onFullSave, '全量更新完成。')} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-left dark:border-slate-700">{busy === 'full' ? <Loader2 className="h-5 w-5 animate-spin"/> : <Cloud className="h-5 w-5 text-blue-600"/>}<span><b className="block text-sm">全量更新</b><small className="text-slate-500">覆盖云端完整工作区</small></span></button></div></section>
        <section className="border-t border-slate-200 pt-5 dark:border-slate-800"><div className="flex items-center justify-between gap-3"><div><h3 className="flex items-center gap-2 text-sm font-bold"><History className="h-4 w-4 text-blue-600"/>还原点</h3><p className="mt-1 text-xs text-slate-400">手动保留当前云端快照，之后可整体回滚。</p></div><button disabled={!!busy} onClick={() => void run('point', () => createWorkspaceRestorePoint(`手动还原点 ${new Date().toLocaleString()}`).then(() => undefined), '还原点已创建。')} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white">创建还原点</button></div><div className="mt-3 space-y-2">{points.length === 0 ? <p className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-400 dark:bg-slate-950">暂无还原点</p> : points.map(point => <div key={point.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700"><div><div className="text-xs font-bold">{point.label || '未命名还原点'}</div><div className="mt-1 text-[11px] text-slate-400">{new Date(point.createdAt).toLocaleString()}</div></div><button disabled={!!busy} onClick={async () => { if (await showAppConfirm('回滚会用该还原点覆盖当前工作区，是否继续？', { title: '回滚工作区', confirmLabel: '确认回滚', danger: true })) void run(`restore-${point.id}`, () => onRestore(point.id), '工作区已回滚。'); }} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300"><RotateCcw className="h-3.5 w-3.5"/>回滚</button></div>)}</div></section>
      </div>
    </div>
  </div>;
};
