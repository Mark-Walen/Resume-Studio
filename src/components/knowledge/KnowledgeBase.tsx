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
  foundation: { label: '基础通用', color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700' },
  advanced: { label: '进阶实战', color: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 font-medium' },
  big_tech_must: { label: '大厂必考', color: 'bg-[#0071e3] text-white border-[#0071e3] font-semibold' },
  architecture: { label: '架构深度', color: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 font-bold' },
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

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateItems(
      items.map((item) => (item.id === id ? { ...item, isBookmarked: !item.isBookmarked } : item))
    );
  };

  const toggleMastered = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateItems(
      items.map((item) => (item.id === id ? { ...item, isMastered: !item.isMastered } : item))
    );
  };

  const handleCopyAnswer = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = items.filter((item) => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (activeDifficulty !== 'all' && item.difficulty !== activeDifficulty) return false;
    if (onlyBookmarked && !item.isBookmarked) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSummary = item.summary.toLowerCase().includes(q);
      const matchPrinciples = Array.isArray(item.underlyingPrinciples)
        ? item.underlyingPrinciples.join(' ').toLowerCase().includes(q)
        : item.underlyingPrinciples?.toLowerCase().includes(q);
      const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchSummary || matchPrinciples || matchTags;
    }
    return true;
  });

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSummary.trim()) {
      alert('请填写标题和考点提要');
      return;
    }

    const tagsArray = newTags
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const newItem: KnowledgeItem = {
      id: 'k-custom-' + Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      difficulty: newDifficulty,
      tags: tagsArray.length > 0 ? tagsArray : ['自建考点'],
      summary: newSummary.trim(),
      underlyingPrinciples: newPrinciples.trim(),
      modelAnswer: newModelAnswer.trim(),
      isBookmarked: true,
      isMastered: false,
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
    <div className="space-y-4 font-sans">
      {/* Top Banner (Apple HIG Clean Theme) */}
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#0071e3] border border-blue-100 dark:border-blue-900/50">
              <Library className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">深度知识书库</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
              大厂高频技术要点
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            结构化技术专栏研读、分类考点闪卡速记、PDF/Word 上传解析与在线撰写，支持基于目标公司智能对齐推荐必考要点。
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenJdRecommender && (
            <button
              id="btn-open-jd-recommend-kb"
              onClick={() => onOpenJdRecommender()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-colors flex-shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0071e3]" />
              <span>根据目标公司推荐考点</span>
            </button>
          )}

          {viewMode === 'flashcards' && (
            <button
              id="btn-add-knowledge"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-xs font-semibold transition-colors flex-shrink-0 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>新增考点</span>
            </button>
          )}
        </div>
      </div>

      {/* Mode Switcher (Clean Apple HIG segmented control) */}
      <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            id="tab-mode-leetbook"
            onClick={() => setViewMode('leetbook')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'leetbook'
                ? 'bg-[#0071e3] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Library className="w-4 h-4" />
            <span>深度知识书库</span>
          </button>

          <button
            id="tab-mode-flashcards"
            onClick={() => setViewMode('flashcards')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'flashcards'
                ? 'bg-[#0071e3] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookMarked className="w-4 h-4" />
            <span>考点速记与闪卡</span>
          </button>
        </div>

        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono hidden sm:inline-block pr-3">
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
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search box */}
              <div className="relative w-full sm:w-80">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="搜索知识点、考查原理、技术标签..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0071e3]"
                />
              </div>

              {/* Bookmark filter toggle */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => setOnlyBookmarked(!onlyBookmarked)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border cursor-pointer ${
                    onlyBookmarked
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${onlyBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                  <span>收藏夹 ({items.filter((i) => i.isBookmarked).length})</span>
                </button>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeCategory === 'all'
                    ? 'bg-[#0071e3] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                全部技术方向 ({items.length})
              </button>
              {(Object.keys(CATEGORY_NAMES) as KnowledgeCategory[]).map((cat) => {
                const count = items.filter((i) => i.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-[#0071e3] text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {CATEGORY_NAMES[cat]} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Flashcards List */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-400 dark:text-slate-500 text-xs">
                没有找到符合条件的考点，请尝试调整搜索关键词或重置筛选
              </div>
            ) : (
              filtered.map((item) => {
                const isExpanded = expandedId === item.id;
                const diffBadge = DIFFICULTY_CONFIG[item.difficulty];

                return (
                  <div
                    key={item.id}
                    id={`knowledge-item-${item.id}`}
                    className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                      isExpanded
                        ? 'border-slate-300 dark:border-slate-700 ring-1 ring-slate-200 dark:ring-slate-700'
                        : 'border-slate-200 dark:border-slate-800 hover:border-[#0071e3] dark:hover:border-[#0071e3]'
                    }`}
                  >
                    {/* Header Row */}
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-start sm:items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => toggleBookmark(item.id, e)}
                          className="p-1 rounded-lg text-slate-400 hover:text-amber-500 transition-colors flex-shrink-0 cursor-pointer"
                          title={item.isBookmarked ? '取消收藏' : '收藏考点'}
                        >
                          <Bookmark
                            className={`w-4 h-4 ${
                              item.isBookmarked ? 'fill-amber-400 text-amber-500' : 'text-slate-300 dark:text-slate-600'
                            }`}
                          />
                        </button>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
                              {CATEGORY_NAMES[item.category]}
                            </span>
                            <span className={`text-[11px] px-2 py-0.5 rounded-full border ${diffBadge.color}`}>
                              {diffBadge.label}
                            </span>
                            {item.isMastered && (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold">
                                已完全掌握
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate tracking-tight">
                            {item.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <button
                          type="button"
                          onClick={(e) => toggleMastered(item.id, e)}
                          className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-xl font-medium transition-colors border cursor-pointer ${
                            item.isMastered
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{item.isMastered ? '已掌握' : '标记掌握'}</span>
                        </button>

                        <div className="p-1 text-slate-400 dark:text-slate-500">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Detail Body */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-4 text-xs bg-slate-50/40 dark:bg-slate-950/40">
                        {/* Summary & Core Concept */}
                        <div className="p-4 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            考点核心提要
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{item.summary}</p>
                        </div>

                        {/* Underlying Principles */}
                        <div className="p-4 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            底层机制与设计推演
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                            {item.underlyingPrinciples}
                          </p>
                        </div>

                        {/* Model Answer for Interviews */}
                        <div className="p-4 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-bold text-slate-900 dark:text-white">
                              高分标准话术范本 (STAR / 结构化回答)
                            </div>
                            <button
                              type="button"
                              onClick={(e) => handleCopyAnswer(item.id, item.modelAnswer, e)}
                              className="inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                            >
                              {copiedId === item.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                  <span className="text-emerald-700 dark:text-emerald-300 font-medium">已复制</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>复制话术</span>
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                            {item.modelAnswer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Add Custom Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-[#0071e3]" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">新增考点闪卡</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">考点标题 *</label>
                <input
                  type="text"
                  required
                  placeholder="如：React 19 编译器 (Compiler) 与 Actions 架构演进"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0071e3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">所属方向</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                  >
                    {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
                      <option key={key} value={key}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">考查难度</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                  >
                    <option value="foundation">基础通用</option>
                    <option value="advanced">进阶实战</option>
                    <option value="big_tech_must">大厂必考</option>
                    <option value="architecture">架构深度</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">技术标签 (逗号分隔)</label>
                <input
                  type="text"
                  placeholder="React, Compiler, Memoization"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0071e3]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">考点提要 *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="概括该考点的核心概念与工业应用背景..."
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0071e3] resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">底层机制与原理解析</label>
                <textarea
                  rows={3}
                  placeholder="推演底层设计原理、边界条件与关键实现机制..."
                  value={newPrinciples}
                  onChange={(e) => setNewPrinciples(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0071e3] resize-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">面试标准回答话术范本</label>
                <textarea
                  rows={3}
                  placeholder="在面试现场面对提问时的标准结构化高分回答..."
                  value={newModelAnswer}
                  onChange={(e) => setNewModelAnswer(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0071e3] resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 font-medium cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                >
                  保存考点
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
