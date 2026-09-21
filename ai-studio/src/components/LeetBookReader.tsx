import React, { useState } from 'react';
import {
  BookOpen,
  ChevronRight,
  Bookmark,
  CheckCircle2,
  Clock,
  Search,
  Upload,
  Plus,
  ArrowLeft,
  FileText,
  Sparkles,
  Layers,
  Code2,
  Edit3,
  X,
  BookMarked,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { KnowledgeBook, BookChapter, BookSection } from '../types/knowledge';
import ReactMarkdown from 'react-markdown';

interface LeetBookReaderProps {
  books: KnowledgeBook[];
  onSaveBooks: (books: KnowledgeBook[]) => void;
  onOpenJdRecommender?: (bookSectionTitle?: string) => void;
}

export const LeetBookReader: React.FC<LeetBookReaderProps> = ({
  books,
  onSaveBooks,
  onOpenJdRecommender,
}) => {
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showCreateBookModal, setShowCreateBookModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // New Book form
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookSubtitle, setNewBookSubtitle] = useState('');
  const [newBookCategory, setNewBookCategory] = useState<'backend' | 'frontend' | 'algorithm' | 'system_design' | 'ai_fullstack'>('backend');
  const [newBookDesc, setNewBookDesc] = useState('');

  // New Section form
  const [newSectionChapterId, setNewSectionChapterId] = useState('');
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionContent, setNewSectionContent] = useState('');
  const [newSectionMinutes, setNewSectionMinutes] = useState(8);
  const [newSectionTags, setNewSectionTags] = useState('');

  // File upload state
  const [uploadBookId, setUploadBookId] = useState<string>('');
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [uploadFileContent, setUploadFileContent] = useState<string>('');
  const [uploadChapterTitle, setUploadChapterTitle] = useState('导入章节');

  const selectedBook = books.find((b) => b.id === selectedBookId) || null;

  // Flatten sections to find active section
  const allSections: { section: BookSection; chapter: BookChapter }[] = [];
  if (selectedBook) {
    selectedBook.chapters.forEach((ch) => {
      ch.sections.forEach((sec) => {
        allSections.push({ section: sec, chapter: ch });
      });
    });
  }

  const currentSection = allSections.find((item) => item.section.id === activeSectionId)?.section ||
    (allSections.length > 0 ? allSections[0].section : null);

  const filteredBooks = books.filter((b) => {
    const matchesCategory = activeCategory === 'all' || b.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelectBook = (book: KnowledgeBook) => {
    setSelectedBookId(book.id);
    if (book.chapters.length > 0 && book.chapters[0].sections.length > 0) {
      setActiveSectionId(book.chapters[0].sections[0].id);
    } else {
      setActiveSectionId(null);
    }
  };

  const handleToggleComplete = (bookId: string, sectionId: string) => {
    const updated = books.map((b) => {
      if (b.id !== bookId) return b;
      return {
        ...b,
        chapters: b.chapters.map((ch) => ({
          ...ch,
          sections: ch.sections.map((sec) => {
            if (sec.id !== sectionId) return sec;
            return { ...sec, isCompleted: !sec.isCompleted };
          })
        }))
      };
    });
    onSaveBooks(updated);
  };

  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookTitle.trim()) return;

    const newBook: KnowledgeBook = {
      id: `book-${Date.now()}`,
      title: newBookTitle.trim(),
      subtitle: newBookSubtitle.trim() || '大厂高频技术攻坚与系统设计全解',
      category: newBookCategory,
      author: '我的个人智库',
      badge: '自研智库',
      coverGradient: 'from-slate-900 via-slate-800 to-slate-900',
      description: newBookDesc.trim() || '整理并精通该领域的底层原理、大厂源码剖析与高频面试实战。',
      difficulty: 'advanced',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      chapters: [
        {
          id: `ch-${Date.now()}-1`,
          title: '第 1 章：核心概念与大厂考察基准',
          order: 1,
          sections: []
        }
      ]
    };

    onSaveBooks([newBook, ...books]);
    setSelectedBookId(newBook.id);
    setShowCreateBookModal(false);
    setNewBookTitle('');
    setNewBookSubtitle('');
    setNewBookDesc('');
  };

  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook || !newSectionTitle.trim()) return;

    const targetChapterId = newSectionChapterId || selectedBook.chapters[0]?.id;
    if (!targetChapterId) return;

    const newSec: BookSection = {
      id: `sec-${Date.now()}`,
      title: newSectionTitle.trim(),
      order: 99,
      estimatedMinutes: Number(newSectionMinutes) || 8,
      isCompleted: false,
      tags: newSectionTags ? newSectionTags.split(/[,，\s]+/).filter(Boolean) : [],
      content: newSectionContent.trim() || '### 核心要点解析\n\n在此记录该知识点的底层机制与实战代码推演...'
    };

    const updated = books.map((b) => {
      if (b.id !== selectedBook.id) return b;
      return {
        ...b,
        updatedAt: new Date().toISOString().split('T')[0],
        chapters: b.chapters.map((ch) => {
          if (ch.id !== targetChapterId) return ch;
          return {
            ...ch,
            sections: [...ch.sections, newSec]
          };
        })
      };
    });

    onSaveBooks(updated);
    setActiveSectionId(newSec.id);
    setShowAddSectionModal(false);
    setNewSectionTitle('');
    setNewSectionContent('');
    setNewSectionTags('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setUploadFileContent(text);
        if (!uploadChapterTitle || uploadChapterTitle === '导入章节') {
          setUploadChapterTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      }
    };

    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!uploadFileContent.trim() || !uploadBookId) return;

    const targetBook = books.find((b) => b.id === uploadBookId);
    if (!targetBook) return;

    // Simple parser: split by H2 or H3 if present, or create single section
    const rawLines = uploadFileContent.split('\n');
    const sections: BookSection[] = [];
    let currentTitle = uploadFileName.replace(/\.[^/.]+$/, '');
    let currentBody: string[] = [];

    rawLines.forEach((line) => {
      if (line.startsWith('## ') || line.startsWith('### ')) {
        if (currentBody.length > 0) {
          sections.push({
            id: `sec-imp-${Date.now()}-${sections.length}`,
            title: currentTitle,
            order: sections.length + 1,
            estimatedMinutes: Math.max(5, Math.ceil(currentBody.join('\n').length / 300)),
            isCompleted: false,
            content: currentBody.join('\n')
          });
          currentBody = [];
        }
        currentTitle = line.replace(/^#{2,3}\s+/, '').trim();
      } else {
        currentBody.push(line);
      }
    });

    if (currentBody.length > 0 || sections.length === 0) {
      sections.push({
        id: `sec-imp-${Date.now()}-${sections.length}`,
        title: currentTitle,
        order: sections.length + 1,
        estimatedMinutes: Math.max(5, Math.ceil(currentBody.join('\n').length / 300)),
        isCompleted: false,
        content: currentBody.join('\n')
      });
    }

    const newChapter: BookChapter = {
      id: `ch-imp-${Date.now()}`,
      title: uploadChapterTitle.trim() || '导入文档与专栏解析',
      order: targetBook.chapters.length + 1,
      description: `从文件「${uploadFileName}」自动解析导入`,
      sections
    };

    const updated = books.map((b) => {
      if (b.id !== uploadBookId) return b;
      return {
        ...b,
        updatedAt: new Date().toISOString().split('T')[0],
        chapters: [...b.chapters, newChapter]
      };
    });

    onSaveBooks(updated);
    setSelectedBookId(uploadBookId);
    if (sections.length > 0) {
      setActiveSectionId(sections[0].id);
    }
    setShowUploadModal(false);
    setUploadFileContent('');
    setUploadFileName('');
  };

  // If a book is selected, show the LeetBook reader view
  if (selectedBook) {
    return (
      <div id="leetbook-reader-container" className="flex flex-col h-full bg-[#1d1d1f] text-slate-100">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[#38383a] bg-[#111113]/80 backdrop-blur z-10">
          <div className="flex items-center space-x-3">
            <button
              id="btn-back-to-library"
              onClick={() => setSelectedBookId(null)}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-[#2c2c2e]/80 hover:bg-[#2c2c2e] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>返回书库</span>
            </button>
            <div className="h-4 w-px bg-slate-700" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2 py-0.5 rounded font-mono font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {selectedBook.badge || 'LeetBook'}
                </span>
                <h2 className="text-sm font-semibold text-white truncate max-w-md">{selectedBook.title}</h2>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            {onOpenJdRecommender && (
              <button
                id="btn-jd-recommender-from-reader"
                onClick={() => onOpenJdRecommender(currentSection?.title)}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#2c2c2e] hover:bg-slate-700 border border-[#48484a] rounded-lg transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>基于即将面试公司推荐考点</span>
              </button>
            )}

            <button
              id="btn-add-section"
              onClick={() => {
                setNewSectionChapterId(selectedBook.chapters[0]?.id || '');
                setShowAddSectionModal(true);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>在线撰写新节</span>
            </button>
          </div>
        </div>

        {/* Reader Layout: Left Table of Contents, Right Reading pane */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left TOC Drawer */}
          <aside className="w-80 border-r border-[#38383a] bg-[#111113]/50 flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-[#38383a]/80">
              <div className="text-xs text-slate-400 font-medium mb-1">目录索引</div>
              <div className="text-xs text-slate-500 flex items-center justify-between">
                <span>
                  共 {selectedBook.chapters.length} 章 · {allSections.length} 节
                </span>
                <span className="text-blue-400 font-mono">
                  {allSections.filter((s) => s.section.isCompleted).length}/{allSections.length} 已学完
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {selectedBook.chapters.map((ch) => (
                <div key={ch.id} className="space-y-1">
                  <div className="text-xs font-semibold text-slate-300 px-2.5 py-1.5 flex items-center justify-between rounded bg-[#1d1d1f]/60">
                    <span className="truncate">{ch.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono font-normal">
                      {ch.sections.length} 节
                    </span>
                  </div>
                  <div className="space-y-0.5 pl-1.5">
                    {ch.sections.map((sec) => {
                      const isActive = sec.id === currentSection?.id;
                      return (
                        <div
                          key={sec.id}
                          id={`toc-sec-${sec.id}`}
                          role="button"
                          tabIndex={0}
                          onClick={() => setActiveSectionId(sec.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setActiveSectionId(sec.id);
                            }
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-start space-x-2 transition-all cursor-pointer select-none ${
                            isActive
                              ? 'bg-blue-600/20 text-blue-200 font-medium border border-blue-500/40 shadow-sm'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1d1d1f]/80'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleComplete(selectedBook.id, sec.id);
                            }}
                            className="mt-0.5 text-slate-500 hover:text-blue-400 focus:outline-none"
                            title={sec.isCompleted ? '已掌握' : '标记为已掌握'}
                          >
                            <CheckCircle2
                              className={`w-3.5 h-3.5 ${
                                sec.isCompleted ? 'text-blue-400 fill-blue-400/20' : 'text-slate-600'
                              }`}
                            />
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="truncate leading-relaxed">{sec.title}</div>
                            <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-0.5 font-mono">
                              <span className="flex items-center space-x-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                <span>{sec.estimatedMinutes || 8} min</span>
                              </span>
                              {sec.tags && sec.tags.length > 0 && (
                                <span className="truncate text-slate-400">#{sec.tags[0]}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Right Reading Content Pane */}
          <main className="flex-1 overflow-y-auto bg-[#1d1d1f] px-8 py-8">
            {currentSection ? (
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Section header */}
                <div className="border-b border-[#38383a] pb-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                        ~{currentSection.estimatedMinutes || 8} 分钟精读
                      </span>
                      {currentSection.tags?.map((t) => (
                        <span
                          key={t}
                          className="text-[11px] px-2 py-0.5 rounded bg-[#2c2c2e] text-slate-400 border border-[#48484a] font-mono"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    <button
                      id="btn-toggle-section-complete"
                      onClick={() => handleToggleComplete(selectedBook.id, currentSection.id)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        currentSection.isCompleted
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : 'bg-[#2c2c2e] text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{currentSection.isCompleted ? '已掌握此考点' : '标记已掌握'}</span>
                    </button>
                  </div>

                  <h1 className="text-2xl font-bold text-white tracking-tight">{currentSection.title}</h1>
                </div>

                {/* Key Takeaways Card */}
                {currentSection.keyTakeaways && currentSection.keyTakeaways.length > 0 && (
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-200">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-blue-300 mb-2">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <span>大厂技术面试官高频关注点 (Key Takeaways)</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-blue-200/90 pl-5 list-disc">
                      {currentSection.keyTakeaways.map((point, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Markdown body */}
                <div className="prose prose-invert prose-blue max-w-none text-slate-200 leading-relaxed text-sm space-y-4">
                  <ReactMarkdown>{currentSection.content}</ReactMarkdown>
                </div>

                {/* Bottom Navigation */}
                <div className="pt-8 border-t border-[#38383a] flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    当前属于专栏：<span className="text-slate-200 font-medium">{selectedBook.title}</span>
                  </div>
                  <button
                    onClick={() => {
                      const currentIndex = allSections.findIndex((s) => s.section.id === currentSection.id);
                      if (currentIndex < allSections.length - 1) {
                        setActiveSectionId(allSections[currentIndex + 1].section.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    disabled={allSections.findIndex((s) => s.section.id === currentSection.id) === allSections.length - 1}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    <span>下一节</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center text-slate-400 space-y-3">
                <BookOpen className="w-10 h-10 text-slate-600" />
                <p className="text-sm">暂无章节内容，点击上方「在线撰写新节」开始创作或导入！</p>
              </div>
            )}
          </main>
        </div>

        {/* Modal: Add Section */}
        {showAddSectionModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#1d1d1f] border border-[#48484a] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#38383a]">
                <div className="flex items-center space-x-2">
                  <Edit3 className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-semibold text-white">撰写新章节考点</h3>
                </div>
                <button
                  onClick={() => setShowAddSectionModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#2c2c2e]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSection} className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">归属章节</label>
                  <select
                    value={newSectionChapterId}
                    onChange={(e) => setNewSectionChapterId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#2c2c2e] border border-[#48484a] rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {selectedBook.chapters.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        {ch.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">考点标题</label>
                  <input
                    type="text"
                    required
                    placeholder="如：2.2 Seata AT模式底层全局锁与两阶段回滚实战"
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#2c2c2e] border border-[#48484a] rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">预计精读时间 (分钟)</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={newSectionMinutes}
                      onChange={(e) => setNewSectionMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#2c2c2e] border border-[#48484a] rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">技术标签 (逗号分隔)</label>
                    <input
                      type="text"
                      placeholder="Seata, 分布式事务, UndoLog"
                      value={newSectionTags}
                      onChange={(e) => setNewSectionTags(e.target.value)}
                      className="w-full px-3 py-2 bg-[#2c2c2e] border border-[#48484a] rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">考点正文 (支持 Markdown & 代码高亮)</label>
                  <textarea
                    rows={10}
                    placeholder="### 一、核心架构机制\n\n在此书写深度考点推演与大厂真实追问..."
                    value={newSectionContent}
                    onChange={(e) => setNewSectionContent(e.target.value)}
                    className="w-full px-3 py-2 bg-[#2c2c2e] border border-[#48484a] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddSectionModal(false)}
                    className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-[#2c2c2e] hover:bg-slate-700 rounded-lg"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm"
                  >
                    保存并立即阅读
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Book Library Gallery View
  return (
    <div id="leetbook-library-view" className="space-y-6">
      {/* Header with Search & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1d1d1f] p-5 rounded-2xl border border-[#38383a]">
        <div>
          <div className="flex items-center space-x-2">
            <BookMarked className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">知识书库 (LeetBook)</h2>
            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
              沉浸式系统书册
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            告别碎片化繁杂考题。按大厂架构体系系统化研读分布式、前端性能突破与大模型全栈等工业级经典，支持上传 PDF/Word 及在线书写专属知识书。
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            id="btn-open-upload-modal"
            onClick={() => {
              if (books.length > 0) setUploadBookId(books[0].id);
              setShowUploadModal(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 bg-[#2c2c2e] hover:bg-slate-700 border border-[#48484a] rounded-xl transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-slate-300" />
            <span>上传 PDF / Word / 文档</span>
          </button>

          <button
            id="btn-open-create-book-modal"
            onClick={() => setShowCreateBookModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>创建新知识书</span>
          </button>
        </div>
      </div>

      {/* Categories and Search bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1">
          {[
            { key: 'all', label: '全部书库' },
            { key: 'backend', label: '后端高并发与架构' },
            { key: 'frontend', label: '前端性能与工程化' },
            { key: 'ai_fullstack', label: '大模型与Agent' },
            { key: 'algorithm', label: '算法破局' }
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3.5 py-1.5 text-xs rounded-xl font-medium transition-colors whitespace-nowrap ${
                activeCategory === cat.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-[#2c2c2e]/80 text-slate-400 hover:text-slate-200 hover:bg-[#2c2c2e]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜索书名、考点内容..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#2c2c2e]/80 border border-[#48484a]/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map((book) => {
          const totalSec = book.chapters.reduce((sum, ch) => sum + ch.sections.length, 0);
          const compSec = book.chapters.reduce(
            (sum, ch) => sum + ch.sections.filter((s) => s.isCompleted).length,
            0
          );
          const progressPercent = totalSec > 0 ? Math.round((compSec / totalSec) * 100) : 0;

          return (
            <div
              key={book.id}
              id={`card-leetbook-${book.id}`}
              onClick={() => handleSelectBook(book)}
              className="group cursor-pointer rounded-2xl bg-[#1d1d1f] border border-[#38383a] hover:border-blue-500/50 transition-all duration-200 overflow-hidden flex flex-col shadow-sm hover:shadow-xl hover:shadow-blue-500/5"
            >
              {/* Card Cover Header */}
              <div
                className={`h-28 bg-gradient-to-r ${book.coverGradient} p-5 flex flex-col justify-between relative overflow-hidden`}
              >
                <div className="flex items-center justify-between z-10">
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-black/30 backdrop-blur text-white border border-white/10">
                    {book.badge || 'LeetBook 专栏'}
                  </span>
                  <span className="text-[11px] text-white/80 font-mono">
                    {totalSec} 核心考节
                  </span>
                </div>
                <h3 className="text-base font-bold text-white tracking-tight line-clamp-1 z-10">
                  {book.title}
                </h3>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <p className="text-xs text-blue-400 font-medium line-clamp-1">
                    {book.subtitle}
                  </p>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {book.description}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-2 border-t border-[#38383a]/80">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>研习进度</span>
                    <span className="text-[#ffa116] font-semibold">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#2c2c2e] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#ffa116] rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Action footer */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-slate-500 text-[11px]">作者：{book.author}</span>
                  <span className="text-blue-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center space-x-1">
                    <span>开始研读</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Book */}
      {showCreateBookModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1d1d1f] border border-[#48484a] rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#38383a] pb-3">
              <h3 className="text-base font-bold text-white">创建新知识书册 (LeetBook)</h3>
              <button
                onClick={() => setShowCreateBookModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBook} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">书册名称</label>
                <input
                  type="text"
                  required
                  placeholder="如：《微服务中台与高可用架构核心实践》"
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2c2c2e] border border-[#48484a] rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">副标题</label>
                <input
                  type="text"
                  placeholder="如：击穿服务治理、熔断限流与分库分表"
                  value={newBookSubtitle}
                  onChange={(e) => setNewBookSubtitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2c2c2e] border border-[#48484a] rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">知识分类</label>
                <select
                  value={newBookCategory}
                  onChange={(e: any) => setNewBookCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2c2c2e] border border-[#48484a] rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="backend">后端高并发与架构</option>
                  <option value="frontend">前端性能与工程化</option>
                  <option value="ai_fullstack">大模型与AI Agent全栈</option>
                  <option value="algorithm">算法与数据结构</option>
                  <option value="system_design">高频系统设计</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">简要描述</label>
                <textarea
                  rows={3}
                  placeholder="概括该专栏的研习目标与大厂对标岗位..."
                  value={newBookDesc}
                  onChange={(e) => setNewBookDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2c2c2e] border border-[#48484a] rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateBookModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-[#2c2c2e] rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg"
                >
                  确认创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Upload PDF / Word / Document */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1d1d1f] border border-[#48484a] rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#38383a] pb-3">
              <div className="flex items-center space-x-2">
                <Upload className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">导入 PDF / Word / Markdown 文档</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">导入至目标书册</label>
                <select
                  value={uploadBookId}
                  onChange={(e) => setUploadBookId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2c2c2e] border border-[#48484a] rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">导入后章节标题</label>
                <input
                  type="text"
                  placeholder="如：大促高可用保障经验总结"
                  value={uploadChapterTitle}
                  onChange={(e) => setUploadChapterTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2c2c2e] border border-[#48484a] rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Drag and Drop Box */}
              <div className="border-2 border-dashed border-[#48484a] hover:border-blue-500/80 rounded-xl p-6 text-center space-y-2 bg-[#2c2c2e]/40 transition-colors">
                <FileText className="w-8 h-8 text-slate-500 mx-auto" />
                <div className="text-xs text-slate-300 font-medium">
                  {uploadFileName ? (
                    <span className="text-blue-400 font-semibold">{uploadFileName} (已就绪)</span>
                  ) : (
                    '点击选择或将 PDF / Word / Markdown / TXT 文档拖拽至此'
                  )}
                </div>
                <p className="text-[11px] text-slate-500">系统将自动分词解析其中的二级/三级标题并切分为小节</p>
                <input
                  type="file"
                  accept=".md,.txt,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload-input"
                />
                <label
                  htmlFor="file-upload-input"
                  className="inline-block mt-2 px-3 py-1.5 bg-[#2c2c2e] hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg cursor-pointer transition-colors"
                >
                  选择文件
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-[#2c2c2e] rounded-lg"
                >
                  取消
                </button>
                <button
                  type="button"
                  disabled={!uploadFileContent}
                  onClick={handleConfirmImport}
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-lg shadow-sm"
                >
                  确认导入书库
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


