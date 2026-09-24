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
  AlertCircle,
  Trash2,
  Save,
  Bot,
  Globe2,
  UserRound,
  LockKeyhole
} from 'lucide-react';
import { KnowledgeBook, BookChapter, BookSection } from '../types/knowledge';
import ReactMarkdown from 'react-markdown';
import { sanitizeMarkdownUrl } from '../utils/security';
import { showAppConfirm, showAppMessage } from './common/AppFeedback';

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
  const [libraryScope, setLibraryScope] = useState<'community' | 'mine'>('community');
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [editorTitle, setEditorTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [editorTags, setEditorTags] = useState('');
  const [editorChapterId, setEditorChapterId] = useState('');

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

  const getOwnership = (book: KnowledgeBook) => book.ownership || (book.isCustom || book.badge === '自主撰写' ? 'personal' : 'community');
  const canEditBook = (book: KnowledgeBook | null) => !!book && getOwnership(book) === 'personal';

  const filteredBooks = books.filter((b) => {
    const ownership = getOwnership(b);
    if (libraryScope === 'community' && ownership !== 'community') return false;
    if (libraryScope === 'mine' && ownership !== 'personal' && ownership !== 'subscribed' && !b.isSubscribed) return false;
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
    setIsInlineEditing(false);
    setIsCreatingSection(false);
  };

  const openSectionEditor = (createNew = false) => {
    if (!canEditBook(selectedBook)) return;
    setIsCreatingSection(createNew);
    setIsInlineEditing(true);
    setEditorChapterId(selectedBook?.chapters[0]?.id || '');
    setEditorTitle(createNew ? '' : currentSection?.title || '');
    setEditorContent(createNew ? '' : currentSection?.content || '');
    setEditorTags(createNew ? '' : (currentSection?.tags || []).join(', '));
  };

  const saveInlineSection = () => {
    if (!selectedBook || !editorTitle.trim() || !editorContent.trim()) {
      showAppMessage('请填写小节标题和正文。', 'warning');
      return;
    }
    const tags = editorTags.split(/[,，]/).map(item => item.trim()).filter(Boolean);
    const now = new Date().toISOString();
    let savedSectionId = currentSection?.id || '';
    const updated = books.map(book => {
      if (book.id !== selectedBook.id) return book;
      if (isCreatingSection) {
        savedSectionId = `sec-${Date.now()}`;
        return {
          ...book,
          updatedAt: now,
          chapters: book.chapters.map(chapter => chapter.id === editorChapterId ? {
            ...chapter,
            sections: [...chapter.sections, {
              id: savedSectionId,
              title: editorTitle.trim(),
              content: editorContent.trim(),
              tags: tags.length ? tags : ['个人创作'],
              estimatedMinutes: Math.max(3, Math.round(editorContent.length / 500)),
              isCompleted: false,
            }],
          } : chapter),
        };
      }
      return {
        ...book,
        updatedAt: now,
        chapters: book.chapters.map(chapter => ({
          ...chapter,
          sections: chapter.sections.map(section => section.id === currentSection?.id ? {
            ...section,
            title: editorTitle.trim(),
            content: editorContent.trim(),
            tags,
          } : section),
        })),
      };
    });
    onSaveBooks(updated);
    setActiveSectionId(savedSectionId);
    setIsInlineEditing(false);
    setIsCreatingSection(false);
    showAppMessage('知识小节已保存，并将随工作区同步。', 'success');
  };

  const deleteCurrentSection = async () => {
    if (!selectedBook || !currentSection || !canEditBook(selectedBook)) return;
    const confirmed = await showAppConfirm(`确定删除“${currentSection.title}”吗？`, { title: '删除知识小节', confirmLabel: '删除', danger: true });
    if (!confirmed) return;
    const updated = books.map(book => book.id !== selectedBook.id ? book : ({
      ...book,
      updatedAt: new Date().toISOString(),
      chapters: book.chapters.map(chapter => ({ ...chapter, sections: chapter.sections.filter(section => section.id !== currentSection.id) })),
    }));
    onSaveBooks(updated);
    setActiveSectionId(null);
    setIsInlineEditing(false);
    showAppMessage('知识小节已删除。', 'success');
  };

  const deleteBook = async (book: KnowledgeBook) => {
    if (!canEditBook(book)) return;
    const confirmed = await showAppConfirm(`确定删除个人专栏“${book.title}”吗？`, { title: '删除个人专栏', confirmLabel: '删除', danger: true });
    if (!confirmed) return;
    onSaveBooks(books.filter(item => item.id !== book.id));
    if (selectedBookId === book.id) setSelectedBookId(null);
    showAppMessage('个人专栏已删除。', 'success');
  };

  const subscribeToBook = (book: KnowledgeBook, event: React.MouseEvent) => {
    event.stopPropagation();
    if (book.accessModel === 'paid' || book.accessModel === 'points') {
      showAppMessage('该专栏已支持试读标识和结算数据结构；正式支付/积分扣减需接入订单服务后开放。', 'info', 5200);
      return;
    }
    onSaveBooks(books.map(item => item.id === book.id ? { ...item, isSubscribed: true } : item));
    showAppMessage('已加入“我的知识库”。', 'success');
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
            return {
              ...sec,
              isCompleted: !sec.isCompleted,
            };
          }),
        })),
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
      subtitle: newBookSubtitle.trim() || '专栏进阶实战精读',
      category: newBookCategory,
      badge: '自主撰写',
      author: '我',
      isCustom: true,
      ownership: 'personal',
      accessModel: 'free',
      coverGradient: 'from-blue-600 to-indigo-600',
      difficulty: 'advanced',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedHours: 6,
      description: newBookDesc.trim() || '根据工作与面试沉淀自主创作的专属知识专栏书。',
      chapters: [
        {
          id: `ch-${Date.now()}-1`,
          title: '第一章：核心架构与考点脉络',
          order: 1,
          description: '系统化梳理核心机制与架构考查全景',
          sections: [
            {
              id: `sec-${Date.now()}-1`,
              title: '1.1 核心机制与架构图解',
              estimatedMinutes: 8,
              isCompleted: false,
              tags: ['自建考点', '核心必读'],
              content: `# ${newBookTitle}\n\n## 1.1 核心机制与架构图解\n\n在此开始撰写该考点的技术深度剖析、大厂面试官高频设问点以及工业级落地最佳实践。`,
              keyTakeaways: ['掌握本节底层原理并能用 STAR 框架表述', '警惕高并发下的边界情况与数据一致性陷阱'],
            },
          ],
        },
      ],
    };

    onSaveBooks([newBook, ...books]);
    setShowCreateBookModal(false);
    setNewBookTitle('');
    setNewBookSubtitle('');
    setNewBookDesc('');
    setSelectedBookId(newBook.id);
  };

  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook || !newSectionTitle.trim() || !newSectionChapterId) return;

    const tagsArr = newSectionTags
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const newSec: BookSection = {
      id: `sec-${Date.now()}`,
      title: newSectionTitle.trim(),
      estimatedMinutes: Number(newSectionMinutes) || 8,
      isCompleted: false,
      tags: tagsArr.length > 0 ? tagsArr : ['原创实战'],
      content: newSectionContent.trim() || `## ${newSectionTitle}\n\n内容持续沉淀中...`,
      keyTakeaways: ['标准回答提炼', '线上落地注意事项'],
    };

    const updated = books.map((b) => {
      if (b.id !== selectedBook.id) return b;
      return {
        ...b,
        chapters: b.chapters.map((ch) => {
          if (ch.id !== newSectionChapterId) return ch;
          return {
            ...ch,
            sections: [...ch.sections, newSec],
          };
        }),
      };
    });

    onSaveBooks(updated);
    setShowAddSectionModal(false);
    setNewSectionTitle('');
    setNewSectionContent('');
    setNewSectionTags('');
    setActiveSectionId(newSec.id);
  };

  // Upload file parser (Markdown, text, etc.)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setUploadFileContent(content || '');
    };
    reader.readAsText(file);
  };

  const handleConfirmImportFile = () => {
    if (!uploadBookId || !uploadFileContent.trim()) return;

    const targetBook = books.find((b) => b.id === uploadBookId);
    if (!targetBook) return;

    // Split markdown headers # or ## or ### into sections
    const rawLines = uploadFileContent.split('\n');
    const sections: BookSection[] = [];
    let currentTitle = '第一节：文档概要';
    let currentBuffer: string[] = [];

    rawLines.forEach((line) => {
      if (line.startsWith('# ') || line.startsWith('## ') || line.startsWith('### ')) {
        if (currentBuffer.length > 0) {
          sections.push({
            id: `sec-imp-${Date.now()}-${sections.length}`,
            title: currentTitle,
            estimatedMinutes: Math.max(3, Math.round(currentBuffer.join('\n').length / 400)),
            isCompleted: false,
            tags: ['导入文档', '自主学习'],
            content: currentBuffer.join('\n')
          });
          currentBuffer = [];
        }
        currentTitle = line.replace(/^#+\s*/, '').trim();
      } else {
        currentBuffer.push(line);
      }
    });

    if (currentBuffer.length > 0) {
      sections.push({
        id: `sec-imp-${Date.now()}-${sections.length}`,
        title: currentTitle,
        estimatedMinutes: Math.max(3, Math.round(currentBuffer.join('\n').length / 400)),
        isCompleted: false,
        tags: ['导入文档'],
        content: currentBuffer.join('\n')
      });
    }

    if (sections.length === 0) {
      sections.push({
        id: `sec-imp-${Date.now()}`,
        title: uploadFileName.replace(/\.[^/.]+$/, ''),
        estimatedMinutes: 10,
        isCompleted: false,
        tags: ['上传资料'],
        content: uploadFileContent
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
        chapters: [...b.chapters, newChapter]
      };
    });

    onSaveBooks(updated);
    if (selectedBookId === uploadBookId && sections.length > 0) {
      setActiveSectionId(sections[0].id);
    }
    setShowUploadModal(false);
    setUploadFileContent('');
    setUploadFileName('');
  };

  // If a book is selected, show the LeetBook reader view
  if (selectedBook) {
    return (
      <div id="leetbook-reader-container" className="flex flex-col h-[820px] bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden font-sans">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
          <div className="flex items-center space-x-3">
            <button
              id="btn-back-to-library"
              onClick={() => setSelectedBookId(null)}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>返回书库</span>
            </button>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {selectedBook.badge || '深度专栏'}
                </span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-md">{selectedBook.title}</h2>
                {!canEditBook(selectedBook) && <span className="inline-flex items-center gap-1 text-[10px] text-slate-400"><LockKeyhole className="h-3 w-3" />社区只读</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenJdRecommender && (
              <button
                id="btn-jd-recommender-from-reader"
                onClick={() => onOpenJdRecommender(currentSection?.title)}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#0071e3]" />
                <span>基于面试公司推荐考点</span>
              </button>
            )}

            {canEditBook(selectedBook) && (
              <button id="btn-add-section" onClick={() => openSectionEditor(true)} className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] rounded-xl transition-colors shadow-xs cursor-pointer">
                <Edit3 className="w-3.5 h-3.5" /><span>新建小节</span>
              </button>
            )}
          </div>
        </div>

        {/* Reader Layout: Left Table of Contents, Right Reading pane */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left TOC Drawer */}
          <aside className="w-76 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex flex-col flex-shrink-0">
            <div className="p-3.5 border-b border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-800 dark:text-slate-200 font-bold mb-0.5">目录索引</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>
                  共 {selectedBook.chapters.length} 章 · {allSections.length} 节
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                  {allSections.filter((s) => s.section.isCompleted).length}/{allSections.length} 已学完
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {selectedBook.chapters.map((ch) => (
                <div key={ch.id} className="space-y-1">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 px-2 py-1 flex items-center justify-between rounded">
                    <span className="truncate">{ch.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono font-normal">
                      {ch.sections.length} 节
                    </span>
                  </div>
                  <div className="space-y-0.5 pl-1">
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
                          className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-start space-x-2 transition-all cursor-pointer select-none ${
                            isActive
                              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold border border-slate-200 dark:border-slate-700 shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleComplete(selectedBook.id, sec.id);
                            }}
                            className="mt-0.5 text-slate-400 hover:text-emerald-600 focus:outline-none cursor-pointer"
                            title={sec.isCompleted ? '已掌握' : '标记为已掌握'}
                          >
                            <CheckCircle2
                              className={`w-3.5 h-3.5 ${
                                sec.isCompleted ? 'text-emerald-600 fill-emerald-100 dark:fill-emerald-950' : 'text-slate-300 dark:text-slate-600'
                              }`}
                            />
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="truncate leading-relaxed">{sec.title}</div>
                            <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5 font-mono">
                              <span className="flex items-center space-x-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                <span>{sec.estimatedMinutes || 8} min</span>
                              </span>
                              {sec.tags && sec.tags.length > 0 && (
                                <span className="truncate text-slate-500 dark:text-slate-400">#{sec.tags[0]}</span>
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
          <main className="min-w-0 flex-1 overflow-y-auto bg-white px-5 py-5 dark:bg-slate-900 sm:px-8 sm:py-8">
            {isInlineEditing ? (
              <div className="mx-auto flex min-h-full max-w-6xl flex-col">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
                  <div><div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white"><Bot className="h-4 w-4 text-[#0071e3]" />{isCreatingSection ? '新建 Agent 友好知识小节' : '编辑知识小节'}</div><p className="mt-1 text-[11px] text-slate-400">使用 Markdown 标题、列表、代码块和明确上下文，便于人阅读，也便于 Agent 检索和引用。</p></div>
                  <div className="flex gap-2"><button type="button" onClick={() => { setIsInlineEditing(false); setIsCreatingSection(false); }} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">取消</button><button type="button" onClick={saveInlineSection} className="inline-flex items-center gap-1.5 rounded-xl bg-[#0071e3] px-4 py-2 text-xs font-bold text-white"><Save className="h-3.5 w-3.5" />保存</button></div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_240px]">
                  <input value={editorTitle} onChange={event => setEditorTitle(event.target.value)} placeholder="小节标题" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold outline-none focus:border-[#0071e3] dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                  {isCreatingSection ? <select value={editorChapterId} onChange={event => setEditorChapterId(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white">{selectedBook.chapters.map(chapter => <option key={chapter.id} value={chapter.id}>{chapter.title}</option>)}</select> : <input value={editorTags} onChange={event => setEditorTags(event.target.value)} placeholder="标签，以逗号分隔" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-[#0071e3] dark:border-slate-700 dark:bg-slate-950 dark:text-white" />}
                </div>
                {isCreatingSection && <input value={editorTags} onChange={event => setEditorTags(event.target.value)} placeholder="标签，以逗号分隔" className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-[#0071e3] dark:border-slate-700 dark:bg-slate-950 dark:text-white" />}
                <div className="mt-4 grid min-h-[520px] flex-1 grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 xl:grid-cols-2">
                  <div className="flex min-h-[520px] flex-col border-b border-slate-200 dark:border-slate-700 xl:border-b-0 xl:border-r">
                    <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:bg-slate-950">Markdown 编辑</div>
                    <textarea value={editorContent} onChange={event => setEditorContent(event.target.value)} placeholder={'# 背景\n\n## 核心原理\n\n## 实践步骤\n\n## Agent 使用说明'} className="min-h-0 flex-1 resize-none bg-white p-4 font-mono text-xs leading-6 text-slate-800 outline-none dark:bg-slate-900 dark:text-slate-100" />
                  </div>
                  <div className="hidden min-h-[520px] overflow-y-auto xl:block"><div className="sticky top-0 border-b border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:bg-slate-950">实时预览</div><div className="space-y-4 p-5 text-sm leading-7 text-slate-800 dark:text-slate-200"><ReactMarkdown urlTransform={sanitizeMarkdownUrl}>{editorContent || '*开始输入后，这里会显示实时预览。*'}</ReactMarkdown></div></div>
                </div>
              </div>
            ) : currentSection ? (
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Section header */}
                <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">
                        ~{currentSection.estimatedMinutes || 8} 分钟精读
                      </span>
                      {currentSection.tags?.map((t) => (
                        <span
                          key={t}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-mono"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                    {canEditBook(selectedBook) && <><button type="button" onClick={() => openSectionEditor(false)} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-[#0071e3] dark:border-slate-700 dark:text-slate-300"><Edit3 className="h-3.5 w-3.5" />编辑</button><button type="button" onClick={deleteCurrentSection} className="rounded-xl border border-slate-200 p-1.5 text-slate-400 hover:border-red-200 hover:text-red-600 dark:border-slate-700" title="删除本节"><Trash2 className="h-3.5 w-3.5" /></button></>}
                    <button
                      id="btn-toggle-section-complete"
                      onClick={() => handleToggleComplete(selectedBook.id, currentSection.id)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        currentSection.isCompleted
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{currentSection.isCompleted ? '已掌握此考点' : '标记已掌握'}</span>
                    </button>
                    </div>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{currentSection.title}</h1>
                </div>

                {/* Key Takeaways Card */}
                {currentSection.keyTakeaways && currentSection.keyTakeaways.length > 0 && (
                  <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 text-amber-900 dark:text-amber-300">
                    <div className="flex items-center space-x-2 text-xs font-bold text-amber-800 dark:text-amber-300 mb-2">
                      <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>技术面试官高频关注点 (Key Takeaways)</span>
                    </div>
                    <ul className="space-y-1 text-xs text-amber-800 dark:text-amber-300 pl-4 list-disc">
                      {currentSection.keyTakeaways.map((point, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Markdown body */}
                <div className="text-slate-800 dark:text-slate-200 leading-relaxed text-sm space-y-4">
                  <ReactMarkdown urlTransform={sanitizeMarkdownUrl}>{currentSection.content}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs">
                请从左侧目录选择小节开始研读
              </div>
            )}
          </main>
        </div>

        {/* Modal: Add Section */}
        {showAddSectionModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center space-x-2">
                  <Edit3 className="w-4 h-4 text-[#0071e3]" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">在线撰写考点知识小节</h3>
                </div>
                <button
                  onClick={() => setShowAddSectionModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddSection} className="p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">归属章节</label>
                  <select
                    value={newSectionChapterId}
                    onChange={(e) => setNewSectionChapterId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                  >
                    {selectedBook.chapters.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        {ch.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">考点标题</label>
                  <input
                    type="text"
                    required
                    placeholder="如：2.2 Seata AT模式底层全局锁与两阶段回滚实战"
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0071e3]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">预计精读时间 (分钟)</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={newSectionMinutes}
                      onChange={(e) => setNewSectionMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">技术标签 (逗号分隔)</label>
                    <input
                      type="text"
                      placeholder="Seata, 分布式事务, UndoLog"
                      value={newSectionTags}
                      onChange={(e) => setNewSectionTags(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0071e3]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">考点正文 (支持 Markdown & 代码高亮)</label>
                  <textarea
                    rows={8}
                    required
                    placeholder="撰写技术机制推演、工业案例与面试破局话术..."
                    value={newSectionContent}
                    onChange={(e) => setNewSectionContent(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0071e3] font-mono leading-relaxed"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddSectionModal(false)}
                    className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 font-medium cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                  >
                    保存新节
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Book Library Gallery View (Apple HIG Style)
  return (
    <div id="leetbook-library-view" className="space-y-6 font-sans">
      {/* Header with Search & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <BookMarked className="w-5 h-5 text-[#0071e3]" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">深度知识书库</h2>
            <span className="px-2.5 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
              共 {books.length} 本专栏
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            社区专栏由官方与创作者公开发布；我的知识库汇总个人创作和已订阅内容。个人内容支持 Agent 友好的 Markdown 编辑与云端同步。
          </p>
        </div>

        {libraryScope === 'mine' && <div className="flex items-center space-x-2 flex-wrap">
          <button
            id="btn-open-upload-modal"
            onClick={() => {
              const firstPersonal = books.find(book => getOwnership(book) === 'personal');
              if (firstPersonal) setUploadBookId(firstPersonal.id);
              setShowUploadModal(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#0071e3]" />
            <span>导入 Markdown / 文本</span>
          </button>

          <button
            id="btn-open-create-book-modal"
            onClick={() => setShowCreateBookModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>创建新专栏书</span>
          </button>
        </div>}
      </div>

      <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <button type="button" onClick={() => setLibraryScope('community')} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold ${libraryScope === 'community' ? 'bg-[#0071e3] text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}><Globe2 className="h-4 w-4" />社区知识专栏</button>
        <button type="button" onClick={() => setLibraryScope('mine')} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold ${libraryScope === 'mine' ? 'bg-[#0071e3] text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}><UserRound className="h-4 w-4" />我的知识库</button>
        <span className="ml-auto hidden pr-3 text-[11px] text-slate-400 sm:inline">{libraryScope === 'community' ? '公开阅读 · 官方内容不可修改' : '个人创作 · 已订阅专栏'}</span>
      </div>

      {/* Categories and Search bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {[
            { id: 'all', label: '全部专栏' },
            { id: 'backend', label: '后端并发与架构' },
            { id: 'frontend', label: '前端性能与大前端' },
            { id: 'algorithm', label: '高频算法精研' },
            { id: 'system_design', label: '大厂系统设计' },
            { id: 'ai_fullstack', label: '大模型与AI全栈' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#0071e3] text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="搜索专栏与高频考点..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0071e3]"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBooks.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
            <BookOpen className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">{libraryScope === 'mine' ? '还没有个人或已订阅专栏' : '没有找到匹配的社区专栏'}</p>
            <p className="mt-1 text-xs text-slate-400">{libraryScope === 'mine' ? '创建专栏后，可在全屏 Markdown 编辑器中持续沉淀并提供给 Agent 使用。' : '尝试调整分类或搜索关键词。'}</p>
          </div>
        )}
        {filteredBooks.map((book) => {
          let completedCount = 0;
          let totalCount = 0;
          book.chapters.forEach((ch) => {
            ch.sections.forEach((sec) => {
              totalCount++;
              if (sec.isCompleted) completedCount++;
            });
          });
          const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          return (
            <div
              key={book.id}
              onClick={() => handleSelectBook(book)}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-[#0071e3] dark:hover:border-[#0071e3] transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5"><span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{book.badge || '深度专栏'}</span><span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">{getOwnership(book) === 'community' ? (book.isOfficial ? '官方' : '社区') : getOwnership(book) === 'subscribed' ? '已订阅' : '个人'}</span></div>
                  <div className="flex items-center gap-1.5">
                    {book.accessModel === 'paid' && <span className="text-[10px] font-bold text-amber-600">¥{book.priceCny || 0} · 可试读</span>}
                    {book.accessModel === 'points' && <span className="text-[10px] font-bold text-violet-600">{book.pointsRequired || 0} 积分兑换</span>}
                    {book.accessModel !== 'paid' && book.accessModel !== 'points' && <span className="text-[10px] font-bold text-emerald-600">免费</span>}
                    {canEditBook(book) && <button type="button" onClick={event => { event.stopPropagation(); void deleteBook(book); }} className="rounded-lg p-1 text-slate-400 opacity-0 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-950/50" title="删除个人专栏"><Trash2 className="h-3.5 w-3.5" /></button>}
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#0071e3] transition-colors line-clamp-1">
                  {book.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {book.description}
                </p>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-500 dark:text-slate-400">
                    {book.chapters.length} 章 · {totalCount} 考点
                  </span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    已掌握 {percent}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0071e3] transition-all duration-300 rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                {getOwnership(book) === 'community' && (
                  <button type="button" onClick={event => subscribeToBook(book, event)} disabled={book.isSubscribed} className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:border-[#0071e3] hover:text-[#0071e3] disabled:cursor-default disabled:border-emerald-200 disabled:bg-emerald-50 disabled:text-emerald-700 dark:border-slate-700 dark:text-slate-300 dark:disabled:border-emerald-900 dark:disabled:bg-emerald-950/30 dark:disabled:text-emerald-300">
                    {book.isSubscribed ? '已加入我的知识库' : book.accessModel === 'paid' ? '试读 · 查看订阅方案' : book.accessModel === 'points' ? '试读 · 查看积分兑换' : '免费加入我的知识库'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Book */}
      {showCreateBookModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-[#0071e3]" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">创建新知识专栏书</h3>
              </div>
              <button
                onClick={() => setShowCreateBookModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBook} className="p-5 space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">专栏书名 *</label>
                <input
                  type="text"
                  required
                  placeholder="如：微前端架构实战与沙箱隔离精研"
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0071e3]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">所属分类</label>
                <select
                  value={newBookCategory}
                  onChange={(e) => setNewBookCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                >
                  <option value="backend">后端架构与并发</option>
                  <option value="frontend">前端工程与Web突破</option>
                  <option value="algorithm">算法与数据结构精研</option>
                  <option value="system_design">大厂系统设计</option>
                  <option value="ai_fullstack">大模型与AI全栈</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">简要描述</label>
                <textarea
                  rows={3}
                  placeholder="概述本书专栏的攻坚方向与核心技术沉淀..."
                  value={newBookDesc}
                  onChange={(e) => setNewBookDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0071e3] resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateBookModal(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 font-medium cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                >
                  立即创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Upload Document */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4 text-[#0071e3]" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">导入文档至专栏书库</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">导入目标专栏书</label>
                <select
                  value={uploadBookId}
                  onChange={(e) => setUploadBookId(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                >
                  {books.filter(book => getOwnership(book) === 'personal').map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">新建章节名称</label>
                <input
                  type="text"
                  value={uploadChapterTitle}
                  onChange={(e) => setUploadChapterTitle(e.target.value)}
                  placeholder="如：实战专栏扩展篇"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0071e3]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">选择文件 (Markdown / 文本)</label>
                <input
                  type="file"
                  accept=".md,.txt,.markdown"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:bg-slate-100 dark:file:bg-slate-700 file:text-slate-700 dark:file:text-slate-300 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>

              {uploadFileName && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300">
                  已选择文件：<span className="font-semibold text-slate-900 dark:text-white">{uploadFileName}</span>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 font-medium cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImportFile}
                  disabled={!uploadFileContent.trim()}
                  className="px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-40 text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                >
                  解析并导入章节
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
