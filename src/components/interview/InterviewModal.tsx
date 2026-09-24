import React, { useState, useRef } from 'react';
import { InterviewRecord, InterviewQuestionItem, MediaAttachment } from '../../types/interview';
import { saveMediaBlob } from '../../utils/db';
import { scanUploadedFile } from '../../utils/security';
import { uploadMediaAttachment } from '../../services/mediaStorageService';
import { showAppMessage } from '../common/AppFeedback';
import { X, Plus, Trash2, Video, Music, Upload, ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react';

interface InterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: InterviewRecord) => void;
  editingRecord?: InterviewRecord | null;
  initialCompanyName?: string;
}

export const InterviewModal: React.FC<InterviewModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingRecord,
  initialCompanyName,
}) => {
  const [companyName, setCompanyName] = useState(editingRecord?.companyName || initialCompanyName || '');
  const [round, setRound] = useState(editingRecord?.round || '二面技术');
  const [position, setPosition] = useState(editingRecord?.position || '资深全栈研发专家');
  const [date, setDate] = useState(editingRecord?.date || new Date().toISOString().split('T')[0]);
  const [durationMinutes, setDurationMinutes] = useState(editingRecord?.durationMinutes || 60);
  const [interviewers, setInterviewers] = useState(editingRecord?.interviewers || '');
  const [notes, setNotes] = useState(editingRecord?.notes || '');

  // Media attachments
  const [mediaAttachments, setMediaAttachments] = useState<MediaAttachment[]>(editingRecord?.mediaAttachments || []);
  const [mediaUploading, setMediaUploading] = useState(false);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  // Questions
  const [questions, setQuestions] = useState<InterviewQuestionItem[]>(
    editingRecord?.questions || [
      {
        id: 'q-1',
        question: '谈谈在大型 React 应用中，如何处理多层嵌套与超大列表的渲染卡顿优化？',
        category: '前端性能优化',
        struggleLevel: 'struggled',
        userNotes: '答了虚拟列表和 useMemo，但面试官深入追问了 Offscreen 离屏渲染与分片调度，没能讲深。'
      },
      {
        id: 'q-2',
        question: '遇到 Node.js 内存泄漏时，线上生产环境如何不影响用户的前提下排查和取证？',
        category: '后端稳定性与排障',
        struggleLevel: 'unanswered',
        userNotes: '现场卡壳，直接说了 dump heap，被面试官指出线上百万并发全量 dump 会造成 STW 导致雪崩。'
      }
    ]
  );

  if (!isOpen) return null;

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMediaUploading(true);

    // 1. Security scan
    const scan = await scanUploadedFile(file);
    if (!scan.isSafe) {
      showAppMessage(`文件未通过安全查杀：${scan.detectedThreats.join(';')}`, 'error');
      setMediaUploading(false);
      return;
    }

    // 2. Persist media blob to IndexedDB
    const mediaId = 'media-' + Date.now();
    try {
      await saveMediaBlob(mediaId, file);
      const isVideo = file.type.startsWith('video') || file.name.endsWith('.mp4') || file.name.endsWith('.webm');

      const attachment: MediaAttachment = {
        id: mediaId,
        name: file.name,
        type: isVideo ? 'video' : 'audio',
        size: file.size,
        blobId: mediaId,
        mimeType: file.type
      };

      setMediaAttachments(prev => [...prev, attachment]);
      try {
        const cloud = await uploadMediaAttachment(mediaId, file, file.name);
        setMediaAttachments(prev => prev.map(item => item.id === mediaId ? { ...item, ...cloud } : item));
      } catch (cloudError) {
        console.warn('Cloud media upload failed; local cache retained:', cloudError);
        showAppMessage('附件已保存在本机，但云端上传失败。系统会在下次登录时自动重试。', 'warning', 5200);
      }
    } catch (err) {
      console.error('Failed to store media blob:', err);
      showAppMessage('保存媒体文件失败，请重试。', 'error');
    } finally {
      setMediaUploading(false);
      if (mediaInputRef.current) mediaInputRef.current.value = '';
    }
  };

  const addQuestion = () => {
    const newQ: InterviewQuestionItem = {
      id: 'q-' + Date.now(),
      question: '',
      category: '通用考题',
      struggleLevel: 'struggled',
      userNotes: ''
    };
    setQuestions([...questions, newQ]);
  };

  const updateQuestion = (id: string, field: keyof InterviewQuestionItem, val: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: val } : q));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !round.trim()) {
      showAppMessage('请填写公司名称与面试轮次。', 'warning');
      return;
    }

    const record: InterviewRecord = {
      id: editingRecord?.id || 'iv-' + Date.now(),
      companyName: companyName.trim(),
      round: round.trim(),
      position: position.trim(),
      date,
      durationMinutes,
      interviewers: interviewers.trim(),
      notes: notes.trim(),
      mediaAttachments,
      questions,
      aiFeedback: editingRecord?.aiFeedback,
      createdAt: editingRecord?.createdAt || new Date().toISOString()
    };

    onSave(record);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-[#0071e3]" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {editingRecord ? '编辑面试复盘记录' : '新增面试面经与录音录像'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">面试公司 *</label>
              <input
                type="text"
                required
                placeholder="如: 字节跳动、腾讯"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0071e3]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">面试轮次 *</label>
              <input
                type="text"
                required
                placeholder="如: 一面技术 / 二面架构 / HR面"
                value={round}
                onChange={e => setRound(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0071e3]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">应聘岗位</label>
              <input
                type="text"
                value={position}
                onChange={e => setPosition(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">面试日期</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">面试时长 (分钟)</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">面试官/组别</label>
              <input
                type="text"
                placeholder="如: 架构委员会 / 直属 Leader"
                value={interviewers}
                onChange={e => setInterviewers(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0071e3]"
              />
            </div>
          </div>

          {/* Media attachments */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-[#0071e3]" />
                  面试过程音视频附件 (支持在线播放)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">自动安全查杀，Cloud Storage 跨设备同步，IndexedDB 作为离线缓存</span>
              </div>
              <button
                type="button"
                disabled={mediaUploading}
                onClick={() => mediaInputRef.current?.click()}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                {mediaUploading ? '校验与存储中...' : '上传音视频'}
              </button>
              <input
                ref={mediaInputRef}
                type="file"
                accept="video/*,audio/*,.mp4,.webm,.ogg,.mp3,.wav,.m4a"
                onChange={handleMediaUpload}
                className="hidden"
              />
            </div>

            {mediaAttachments.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {mediaAttachments.map(m => (
                  <div key={m.id} className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                    <div className="flex items-center gap-2">
                      {m.type === 'video' ? <Video className="w-4 h-4 text-[#0071e3]" /> : <Music className="w-4 h-4 text-emerald-500" />}
                      <span className="font-medium text-slate-800 dark:text-slate-200">{m.name}</span>
                      <span className="text-[10px] text-slate-400">
                        ({(((m.size ?? m.sizeBytes) || 0) / (1024 * 1024)).toFixed(1)} MB)
                      </span>
                      <span className={`text-[10px] font-semibold ${m.cloudObjectPath ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {m.cloudObjectPath ? '已上云' : '等待云端同步'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMediaAttachments(mediaAttachments.filter(x => x.id !== m.id))}
                      className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">现场面经与个人感受笔记</label>
            <textarea
              rows={3}
              placeholder="记录本次面试的整体节奏、面试官提问风格、对自己的态度，以及答辩中的心理感受..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0071e3] leading-relaxed"
            />
          </div>

          {/* Questions */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 dark:text-white">核心提问与作答掌握度</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">标记未答上或勉强答出的题目，AI 将精准提供下次遇题高分应对方案！</p>
              </div>
              <button
                type="button"
                onClick={addQuestion}
                className="inline-flex items-center gap-1 text-[#0071e3] hover:underline font-bold text-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                添加考题
              </button>
            </div>

            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div key={q.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-400 w-5">#{idx + 1}</span>
                    <input
                      type="text"
                      placeholder="面试问题 (如: 为什么 Vite 冷启动比 Webpack 快？)"
                      value={q.question}
                      onChange={e => updateQuestion(q.id, 'question', e.target.value)}
                      className="flex-1 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#0071e3]"
                    />
                    <select
                      value={q.struggleLevel}
                      onChange={e => updateQuestion(q.id, 'struggleLevel', e.target.value as any)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        q.struggleLevel === 'unanswered'
                          ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900'
                          : q.struggleLevel === 'struggled'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                      }`}
                    >
                      <option value="unanswered">❌ 未答上 / 卡壳</option>
                      <option value="struggled">⚠️ 勉强 / 答得一般</option>
                      <option value="mastered">✅ 流利掌握 / 亮点</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeQuestion(q.id)}
                      className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="现场作答情况与遗漏细节备忘..."
                    value={q.userNotes || ''}
                    onChange={e => updateQuestion(q.id, 'userNotes', e.target.value)}
                    className="w-full px-2.5 py-1 text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 focus:outline-none focus:border-[#0071e3]"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#0071e3] hover:bg-[#0077ed] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              保存面试记录
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
