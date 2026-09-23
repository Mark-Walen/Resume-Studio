import React, { useRef, useState, useEffect } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  CheckSquare,
  Sparkles,
  Eye,
  Edit3,
  Info,
  Highlighter,
  Check
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  label?: string;
  helperText?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = '输入内容，支持 Markdown、Notion 快捷排版或输入 / 唤起快捷指令...',
  minHeight = 'min-h-[140px]',
  label,
  helperText
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');

  const applyFormat = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const selectedText = text.substring(start, end) || defaultText;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newText = text.substring(0, start) + replacement + text.substring(end);
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 0);
  };

  const insertLinePrefix = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const text = textarea.value;

    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    const newText = text.substring(0, lineStart) + prefix + text.substring(lineStart);
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 0);
  };

  const insertBlock = (blockText: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const text = textarea.value;

    // Check if previous char is '/'
    let insertStart = start;
    if (start > 0 && text[start - 1] === '/') {
      insertStart = start - 1;
    }

    const newText = text.substring(0, insertStart) + blockText + text.substring(start);
    onChange(newText);
    setShowSlashMenu(false);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(insertStart + blockText.length, insertStart + blockText.length);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'b' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      applyFormat('**', '**', '重点内容');
    } else if (e.key === 'i' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      applyFormat('*', '*', '斜体强调');
    } else if (e.key === '/' && !showSlashMenu) {
      setShowSlashMenu(true);
    } else if (e.key === 'Escape') {
      setShowSlashMenu(false);
    }
  };

  // Convert markdown and notion callouts into clean HTML preview
  const renderMarkdownPreview = (content: string) => {
    if (!content.trim()) {
      return <p className="text-slate-400 dark:text-slate-500 italic text-xs">暂无内容，请切换到编辑模式输入...</p>;
    }

    const lines = content.split('\n');
    return (
      <div className="space-y-2 text-slate-800 dark:text-slate-200 text-xs leading-relaxed font-sans">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return <h4 key={idx} className="text-xs font-bold text-slate-900 dark:text-white mt-2 mb-1">{line.replace('### ', '')}</h4>;
          }
          if (line.startsWith('## ')) {
            return <h3 key={idx} className="text-sm font-bold text-slate-900 dark:text-white mt-3 mb-1">{line.replace('## ', '')}</h3>;
          }
          if (line.startsWith('> [!TIP]') || line.startsWith('> [!NOTE]')) {
            return (
              <div key={idx} className="border-l-3 border-[#0071e3] bg-blue-50/60 dark:bg-blue-950/30 p-2.5 rounded-r-xl my-1 text-slate-700 dark:text-slate-300 flex items-start gap-2">
                <Info className="w-4 h-4 text-[#0071e3] flex-shrink-0 mt-0.5" />
                <span className="text-xs">{line.replace(/> \[!(TIP|NOTE)\]\s*/, '')}</span>
              </div>
            );
          }
          if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) {
            const checked = line.startsWith('- [x] ');
            return (
              <div key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 pl-1">
                <input type="checkbox" readOnly checked={checked} className="rounded text-[#0071e3] border-slate-300 dark:border-slate-700 pointer-events-none" />
                <span className={checked ? 'line-through text-slate-400' : ''}>{line.replace(/- \[[ x]\] /, '')}</span>
              </div>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-[#0071e3] mt-1">•</span>
                <span>{line.replace(/^[-*] /, '')}</span>
              </div>
            );
          }
          if (/^\d+\. /.test(line)) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-slate-400 font-mono text-[11px] mt-0.5">{line.match(/^\d+\./)?.[0]}</span>
                <span>{line.replace(/^\d+\. /, '')}</span>
              </div>
            );
          }
          if (line.startsWith('> ')) {
            return (
              <blockquote key={idx} className="border-l-3 border-slate-300 dark:border-slate-700 pl-3 py-1 my-1 text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40 rounded-r text-xs">
                {line.replace('> ', '')}
              </blockquote>
            );
          }
          if (line.startsWith('---') || line.startsWith('***')) {
            return <hr key={idx} className="my-2 border-slate-200 dark:border-slate-800" />;
          }
          if (!line.trim()) {
            return <div key={idx} className="h-2" />;
          }
          return <p key={idx}>{line}</p>;
        })}
      </div>
    );
  };

  const slashCommands = [
    { title: '二级标题 (H2)', desc: '大块主题与章节划分', icon: Heading2, action: () => insertBlock('## ') },
    { title: '三级标题 (H3)', desc: '子主题与小节', icon: Heading3, action: () => insertBlock('### ') },
    { title: '无序列表 (Bullet)', desc: '要点与条目', icon: List, action: () => insertBlock('- ') },
    { title: '有序序号列表', desc: '步骤流程', icon: ListOrdered, action: () => insertBlock('1. ') },
    { title: '待办任务项 (Todo)', desc: '带复选框的任务清单', icon: CheckSquare, action: () => insertBlock('- [ ] ') },
    { title: '高亮提示框 (Callout)', desc: '语雀/Notion 风格重点高亮框', icon: Info, action: () => insertBlock('> [!NOTE] 核心亮点：\n') },
    { title: '引用段落 (Quote)', desc: '背书评价或关键名言', icon: Quote, action: () => insertBlock('> ') },
    { title: '代码片段 (Code)', desc: '算法或技术栈实现', icon: Code, action: () => insertBlock('```\n\n```') },
    { title: '分割线 (Divider)', desc: '水平内容分隔', icon: Minus, action: () => insertBlock('\n---\n') }
  ];

  return (
    <div className="space-y-1.5 font-sans relative">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">{label}</label>
          {helperText && <span className="text-[11px] text-slate-400 dark:text-slate-500">{helperText}</span>}
        </div>
      )}

      <div className="border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs focus-within:border-[#0071e3] transition-colors">
        {/* Notion / Yuque style Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-1 p-1.5 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/90 dark:border-slate-800 text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-0.5 flex-wrap">
            <button
              type="button"
              onClick={() => applyFormat('**', '**', '重点内容')}
              title="加粗 (Ctrl+B)"
              className="p-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-700 hover:text-[#0071e3] rounded-lg text-xs transition-colors cursor-pointer"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('*', '*', '斜体文本')}
              title="斜体"
              className="p-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-700 hover:text-[#0071e3] rounded-lg text-xs transition-colors cursor-pointer"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('~~', '~~', '删除线')}
              title="删除线"
              className="p-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-700 hover:text-[#0071e3] rounded-lg text-xs transition-colors cursor-pointer"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('==', '==', '高亮内容')}
              title="荧光笔高亮"
              className="p-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-700 hover:text-[#0071e3] rounded-lg text-xs transition-colors cursor-pointer"
            >
              <Highlighter className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

            <button
              type="button"
              onClick={() => insertLinePrefix('## ')}
              title="二级标题"
              className="p-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-700 hover:text-[#0071e3] rounded-lg text-xs transition-colors cursor-pointer"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertLinePrefix('### ')}
              title="三级标题"
              className="p-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-700 hover:text-[#0071e3] rounded-lg text-xs transition-colors cursor-pointer"
            >
              <Heading3 className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

            <button
              type="button"
              onClick={() => insertLinePrefix('- ')}
              title="无序列表"
              className="p-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-700 hover:text-[#0071e3] rounded-lg text-xs transition-colors cursor-pointer"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertLinePrefix('1. ')}
              title="有序列表"
              className="p-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-700 hover:text-[#0071e3] rounded-lg text-xs transition-colors cursor-pointer"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertLinePrefix('- [ ] ')}
              title="待办任务清单"
              className="p-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-700 hover:text-[#0071e3] rounded-lg text-xs transition-colors cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

            <button
              type="button"
              onClick={() => insertLinePrefix('> [!NOTE] ')}
              title="语雀高亮卡片"
              className="p-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-700 hover:text-[#0071e3] rounded-lg text-xs transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertLinePrefix('> ')}
              title="引用块"
              className="p-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-700 hover:text-[#0071e3] rounded-lg text-xs transition-colors cursor-pointer"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('`', '`', 'code')}
              title="行内代码"
              className="p-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-700 hover:text-[#0071e3] rounded-lg text-xs transition-colors cursor-pointer"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                isPreview
                  ? 'bg-[#0071e3] text-white'
                  : 'bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              {isPreview ? (
                <>
                  <Edit3 className="w-3 h-3" />
                  <span>编辑</span>
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3" />
                  <span>渲染预览</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Text Area or Preview */}
        <div className="p-3 bg-white dark:bg-slate-900 transition-colors">
          {isPreview ? (
            <div className={`${minHeight} p-2.5 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl overflow-y-auto`}>
              {renderMarkdownPreview(value)}
            </div>
          ) : (
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={e => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={`w-full ${minHeight} resize-y text-xs text-slate-800 dark:text-slate-100 leading-relaxed font-sans placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none bg-transparent`}
              />

              {/* Slash Command Palette */}
              {showSlashMenu && (
                <div className="absolute left-2 top-8 z-30 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200/90 dark:border-slate-700 py-1.5 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    基础排版块 (Notion / 语雀指令)
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {slashCommands.map((cmd, i) => {
                      const Icon = cmd.icon;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={cmd.action}
                          className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-left transition-colors cursor-pointer"
                        >
                          <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-white text-xs">{cmd.title}</div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-400">{cmd.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
