import React, { useEffect, useRef } from 'react';
import { Bold, Italic, Underline, Strikethrough, Heading2, List, ListOrdered, Quote, Link2, RemoveFormatting } from 'lucide-react';
import { sanitizeRichText, toRichHtml } from '../../utils/richText';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const tools = [
  { command: 'bold', label: '加粗', Icon: Bold },
  { command: 'italic', label: '斜体', Icon: Italic },
  { command: 'underline', label: '下划线', Icon: Underline },
  { command: 'strikeThrough', label: '删除线', Icon: Strikethrough },
  { command: 'formatBlock', value: 'h3', label: '标题', Icon: Heading2 },
  { command: 'insertUnorderedList', label: '无序列表', Icon: List },
  { command: 'insertOrderedList', label: '有序列表', Icon: ListOrdered },
  { command: 'formatBlock', value: 'blockquote', label: '引用', Icon: Quote },
  { command: 'removeFormat', label: '清除格式', Icon: RemoveFormatting },
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder = '输入内容，选中文字后可设置格式…', minHeight = '120px' }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || document.activeElement === editor) return;
    const next = toRichHtml(value);
    if (editor.innerHTML !== next) editor.innerHTML = next;
  }, [value]);

  const emit = () => {
    const editor = editorRef.current;
    if (editor) onChange(sanitizeRichText(editor.innerHTML));
  };

  const run = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emit();
  };

  const addLink = () => {
    const url = window.prompt('输入链接（https:// 或 mailto:）');
    if (url && /^(https?:|mailto:)/i.test(url)) run('createLink', url);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
        {tools.map(({ command, value: toolValue, label, Icon }) => (
          <button key={`${command}-${toolValue || ''}`} type="button" title={label} onMouseDown={(event) => event.preventDefault()} onClick={() => run(command, toolValue)} className="p-1.5 rounded-md text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm">
            <Icon className="w-3.5 h-3.5" />
          </button>
        ))}
        <span className="w-px h-5 bg-slate-200 mx-0.5" />
        <button type="button" title="添加链接" onMouseDown={(event) => event.preventDefault()} onClick={addLink} className="p-1.5 rounded-md text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm">
          <Link2 className="w-3.5 h-3.5" />
        </button>
        <span className="ml-auto text-[10px] text-slate-400">支持标题、列表、引用与链接</span>
      </div>
      <div ref={editorRef} contentEditable suppressContentEditableWarning data-placeholder={placeholder} onInput={emit} onBlur={emit} className="rich-text-editor px-3 py-2 text-xs leading-6 text-slate-700 outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400" style={{ minHeight }} />
    </div>
  );
};
