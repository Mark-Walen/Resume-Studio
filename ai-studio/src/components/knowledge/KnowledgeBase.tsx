import React, { useState } from 'react';
import { KnowledgeItem, KnowledgeCategory, KnowledgeDifficulty, KnowledgeBook } from '../../types/knowledge';
import { LeetBookReader } from '../LeetBookReader';
import {
  BookOpen,
  Search,
  Bookmark,
  BookmarkCheck,
  Star,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Plus,
  Tag,
  Building2,
  AlertTriangle,
  HelpCircle,
  Award,
  Layers,
  Edit3,
  Library,
  BookMarked,
  X
} from 'lucide-react';

interface KnowledgeBaseProps {
  items: KnowledgeItem[];
  onUpdateItems: (items: KnowledgeItem[]) => void;
  books?: KnowledgeBook[];
  onSaveBooks?: (books: KnowledgeBook[]) => void;
  onOpenJdRecommender?: (sectionTitle?: string) => void;
}

const CATEGORY_NAMES: Record<KnowledgeCategory, string> = {
  frontend: '前端工程与Web',
  backend: '后端架构与并发',
  algorithm: '高频算法与数据结构',
  system_design: '大厂系统设计',
  ai_fullstack: '大模型与AI全栈',
  behavioral: '软技能与STAR薪资',
};

const DIFFICULTY_CONFIG: Record<KnowledgeDifficulty, { label: string; color: string }> = {
  foundation: { label: '基础通用', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  advanced: { label: '进阶实战', color: 'bg-slate-100 text-slate-800 border-slate-300 font-medium' },
  big_tech_must: { label: '大厂必考', color: 'bg-blue-50 text-blue-700 border-blue-200 font-semibold' },
  architecture: { label: '架构深度', color: 'bg-[#1d1d1f] text-slate-100 border-[#38383a] font-semibold' },
};

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({
  items,
  onUpdateItems,
  books = [],
  onSaveBooks = () => {},
  onOpenJdRecommender,
}) => {
  const [viewMode, setViewMode] = useState<'leetbook' | 'flashcards'>('leetbook');
  const [activeCategory, setActiveCategory] = useState<KnowledgeCategory | 'all'>('all');
  const [activeDifficulty, setActiveDifficulty] = useState<KnowledgeDifficulty | 'all'>('all');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(items[0]?.id || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add Custom Item Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<KnowledgeCategory>('frontend');
  const [newDifficulty, setNewDifficulty] = useState<KnowledgeDifficulty>('big_tech_must');
  const [newTags, setNewTags] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newPrinciples, setNewPrinciples] = useState('');
  const [newModelAnswer, setNewModelAnswer] = useState('');

  // Filter items
  const filtered = items.filter(item => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (activeDifficulty !== 'all' && item.difficulty !== activeDifficulty) return false;
    if (onlyBookmarked && !item.isBookmarked) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSummary = item.summary.toLowerCase().includes(q);
      const matchTags = item.tags.some(t => t.toLowerCase().includes(q));
      const matchAnswer = item.modelAnswer.toLowerCase().includes(q);
      return matchTitle || matchSummary || matchTags || matchAnswer;
    }

    return true;
  });

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateItems(
      items.map(it => it.id === id ? { ...it, isBookmarked: !it.isBookmarked } : it)
    );
  };

  const handleCopyAnswer = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSummary.trim()) {
      alert('请填写知识点标题和摘要概述');
      return;
    }

    const newItem: KnowledgeItem = {
      id: 'kb-custom-' + Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      difficulty: newDifficulty,
      tags: newTags.split(/[,， ]+/).filter(Boolean),
      summary: newSummary.trim(),
      corePrinciples: newPrinciples.split('\n').map(s => s.trim()).filter(Boolean),
      interviewerQuestions: ['请结合实际场景阐述该原理的落地点与踩坑经验？'],
      modelAnswer: newModelAnswer.trim() || newSummary.trim(),
      commonPitfalls: ['缺乏量化指标佐证', '未考虑极端异常与降级兜底'],
      customAdded: true,
      isBookmarked: true
    };

    onUpdateItems([newItem, ...items]);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewTags('');
    setNewSummary('');
    setNewPrinciples('');
    setNewModelAnswer('');
    setExpandedId(newItem.id);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-[#1d1d1f] text-white p-5 sm:p-6 rounded-2xl border border-[#38383a] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase bg-[#2c2c2e] text-slate-300 border border-[#48484a]">
              Tech Knowledge Base
            </span>
            <span className="text-xs text-slate-400">大厂高频考点 · LeetBook体系专栏 · 针对性攻坚</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">程序员技术面试基础知识库 & LeetBook</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            结构化 LeetBook 专栏研读、分类考点闪卡速记、PDF/Word 上传解析与在线撰写，支持基于目标公司智能对齐推荐必考要点。
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenJdRecommender && (
            <button
              id="btn-open-jd-recommend-kb"
              onClick={() => onOpenJdRecommender()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#2c2c2e] hover:bg-slate-700 text-slate-200 border border-[#48484a] rounded-xl text-xs font-medium transition-colors flex-shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>根据目标公司推荐考点</span>
            </button>
          )}

          {viewMode === 'flashcards' && (
            <button
              id="btn-add-knowledge"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              新增攻关知识点
            </button>
          )}
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            id="tab-mode-leetbook"
            onClick={() => setViewMode('leetbook')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'leetbook'
                ? 'bg-[#1d1d1f] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Library className="w-4 h-4" />
            <span>LeetBook 深度知识书库（推荐 · 树状章节 / PDF / Word / 在线撰写）</span>
          </button>

          <button
            id="tab-mode-flashcards"
            onClick={() => setViewMode('flashcards')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'flashcards'
                ? 'bg-[#1d1d1f] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookMarked className="w-4 h-4" />
            <span>分类闪卡与考点清单</span>
          </button>
        </div>

        <span className="text-xs text-slate-400 font-mono hidden sm:inline-block pr-2">
          {viewMode === 'leetbook' ? `共 ${books.length} 本专栏书籍` : `共 ${filtered.length} 条闪卡`}
        </span>
      </div>

      {/* View Content */}
      {viewMode === 'leetbook' ? (
        <LeetBookReader
          books={books}
          onSaveBooks={onSaveBooks}
          onOpenJdRecommender={onOpenJdRecommender}
        />
      ) : (
        <>
          {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative w-full sm:w-96">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索知识点、考题、框架、大厂、答题模板..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => setOnlyBookmarked(!onlyBookmarked)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                onlyBookmarked
                  ? 'bg-blue-50 border-blue-300 text-blue-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${onlyBookmarked ? 'fill-blue-500 text-blue-500' : ''}`} />
              仅看重点收藏 ({items.filter(i => i.isBookmarked).length})
            </button>
            <span className="text-xs text-slate-400 font-medium">
              共 {filtered.length} 个条目
            </span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs font-medium">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeCategory === 'all'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            全部分类
          </button>
          {(Object.keys(CATEGORY_NAMES) as KnowledgeCategory[]).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {CATEGORY_NAMES[cat]}
            </button>
          ))}
        </div>

        {/* Difficulty Filter */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px] font-medium mr-1">深度层级:</span>
          <button
            onClick={() => setActiveDifficulty('all')}
            className={`px-2.5 py-0.5 rounded-md text-[11px] border ${
              activeDifficulty === 'all' ? 'bg-[#2c2c2e] text-white border-[#38383a]' : 'bg-white text-slate-500 border-slate-200'
            }`}
          >
            全部层级
          </button>
          {(Object.keys(DIFFICULTY_CONFIG) as KnowledgeDifficulty[]).map(diff => (
            <button
              key={diff}
              onClick={() => setActiveDifficulty(diff)}
              className={`px-2.5 py-0.5 rounded-md text-[11px] border ${
                activeDifficulty === diff
                  ? `${DIFFICULTY_CONFIG[diff].color} font-bold shadow-xs`
                  : 'bg-white text-slate-500 border-slate-200'
              }`}
            >
              {DIFFICULTY_CONFIG[diff].label}
            </button>
          ))}
        </div>
      </div>

      {/* Knowledge Items List */}
      <div className="space-y-3">
        {filtered.map(item => {
          const isExpanded = expandedId === item.id;
          const diffCfg = DIFFICULTY_CONFIG[item.difficulty] || DIFFICULTY_CONFIG.foundation;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border transition-all shadow-xs overflow-hidden ${
                isExpanded ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Header summary row */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${diffCfg.color}`}>
                      {diffCfg.label}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {CATEGORY_NAMES[item.category]}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {item.tags.map((t, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-600 px-2 py-0.2 rounded text-[10px] flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5 text-slate-400" />
                        {t}
                      </span>
                    ))}
                    {item.relatedCompanies && item.relatedCompanies.length > 0 && (
                      <span className="text-[10px] text-blue-600 font-medium bg-blue-50/70 px-2 py-0.2 rounded flex items-center gap-1">
                        <Building2 className="w-2.5 h-2.5" />
                        {item.relatedCompanies.join('、')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => toggleBookmark(item.id, e)}
                    className="p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 transition-colors"
                    title={item.isBookmarked ? '取消收藏' : '重点攻关收藏'}
                  >
                    <Bookmark className={`w-4 h-4 ${item.isBookmarked ? 'fill-blue-500 text-blue-500' : ''}`} />
                  </button>
                  <div className="p-2 text-slate-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              {isExpanded && (
                <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-slate-100 space-y-4 text-xs animate-in fade-in duration-200">
                  {/* Core Principles */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-blue-600" />
                      核心底层逻辑与设计原理：
                    </div>
                    <ul className="space-y-1.5 text-slate-700 pl-4 list-disc">
                      {item.corePrinciples.map((cp, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {cp}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Interviewer Questions */}
                  {item.interviewerQuestions && item.interviewerQuestions.length > 0 && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-slate-500" />
                        面试官高频连环追问点：
                      </div>
                      <div className="space-y-1.5">
                        {item.interviewerQuestions.map((iq, idx) => (
                          <div key={idx} className="p-2 bg-white rounded-lg border border-slate-200 font-medium text-slate-700">
                            Q{idx + 1}: {iq}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Model Answer (STAR) */}
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-blue-950 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-blue-600" />
                        标准大厂高分回答示范 (STAR / 逻辑闭环)：
                      </div>
                      <button
                        onClick={(e) => handleCopyAnswer(item.modelAnswer, item.id, e)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-semibold transition-colors"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedId === item.id ? '已复制示范' : '复制回答框架'}
                      </button>
                    </div>
                    <div className="p-3.5 bg-white rounded-lg border border-blue-100 text-slate-800 leading-relaxed whitespace-pre-line font-mono text-[11.5px]">
                      {item.modelAnswer}
                    </div>
                  </div>

                  {/* Common Pitfalls */}
                  {item.commonPitfalls && item.commonPitfalls.length > 0 && (
                    <div className="bg-red-50/50 p-4 rounded-xl border border-red-200 space-y-1.5">
                      <div className="font-bold text-red-950 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        常见面试翻车误区与红线：
                      </div>
                      <ul className="space-y-1 text-red-900 pl-4 list-disc">
                        {item.commonPitfalls.map((pf, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {pf}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center space-y-3">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-700">未找到相关知识点</div>
            <p className="text-xs text-slate-400">
              您可以切换上方筛选条件，或点击“新增攻关知识点”沉淀您自己的高频考点备忘录。
            </p>
          </div>
        )}
      </div>

      {/* Add Custom Knowledge Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1d1d1f]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">新增自定义攻关知识点</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} aria-label="关闭" className="text-slate-400 hover:text-slate-600 text-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomItem} className="p-5 space-y-3.5 text-xs max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">知识点 / 考题标题 *</label>
                <input
                  type="text"
                  required
                  placeholder="如：浏览器渲染管线与合成线程 (Compositor Thread)"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">所属分类</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as KnowledgeCategory)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    {(Object.keys(CATEGORY_NAMES) as KnowledgeCategory[]).map(cat => (
                      <option key={cat} value={cat}>{CATEGORY_NAMES[cat]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">难度等级</label>
                  <select
                    value={newDifficulty}
                    onChange={e => setNewDifficulty(e.target.value as KnowledgeDifficulty)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    {(Object.keys(DIFFICULTY_CONFIG) as KnowledgeDifficulty[]).map(diff => (
                      <option key={diff} value={diff}>{DIFFICULTY_CONFIG[diff].label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">标签 (空格或逗号分隔)</label>
                <input
                  type="text"
                  placeholder="如：渲染性能, 重绘重排, 硬件加速"
                  value={newTags}
                  onChange={e => setNewTags(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">精炼概述 / 考点背景 *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="简述该考点的应用场景与为什么重要..."
                  value={newSummary}
                  onChange={e => setNewSummary(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">核心原理条目 (每行一条)</label>
                <textarea
                  rows={3}
                  placeholder="1. DOM与CSSOM结合生成Render Tree&#10;2. Layout 计算几何位置&#10;3. Paint 绘制图层并提交给合成线程 GPU 栅格化"
                  value={newPrinciples}
                  onChange={e => setNewPrinciples(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">推荐高分示范回答</label>
                <textarea
                  rows={4}
                  placeholder="提供有条理的回答逻辑闭环与实战亮点..."
                  value={newModelAnswer}
                  onChange={e => setNewModelAnswer(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  保存知识点
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};


