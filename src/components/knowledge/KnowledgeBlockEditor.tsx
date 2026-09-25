import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Block, PartialBlock } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import { showAppMessage } from '../common/AppFeedback';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';

interface KnowledgeBlockEditorProps {
  initialMarkdown: string;
  initialDocument?: unknown[];
  editable?: boolean;
  onChange?: (document: unknown[], markdown: string) => void;
  highlightedTexts?: string[];
  onTextSelected?: (text: string) => void;
  className?: string;
}

const isStoredBlockDocument = (value: unknown): value is PartialBlock[] =>
  Array.isArray(value) && value.length > 0 && value.every(block => !!block && typeof block === 'object' && 'type' in block);

const normalizePastedMarkdown = (source: string) => {
  const decoder = document.createElement('textarea');
  decoder.innerHTML = source;
  return decoder.value
    .replace(/\u00a0/g, ' ')
    .replace(/\\\s*\r?\n/g, '\n')
    .replace(/\\([`*_[\]#>+.!~-])/g, '$1')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const looksLikeMarkdown = (text: string) => {
  const blockSyntax = [
    /(^|\n)\s{0,3}#{1,6}\s+\S/m,
    /(^|\n)\s{0,3}(?:[-+*]|\d+[.)])\s+\S/m,
    /(^|\n)\s{0,3}>\s+\S/m,
    /(^|\n)\s*```[\s\S]*```\s*$/m,
    /(^|\n)\s*\|?.+\|.+\n\s*\|?\s*:?-{3,}/m,
    /(^|\n)\s*---\s*(\n|$)/m,
  ];
  if (blockSyntax.some(pattern => pattern.test(text))) return true;

  const inlineSyntaxMatches = [
    /\*\*[^*\n]+\*\*/,
    /~~[^~\n]+~~/,
    /`[^`\n]+`/,
    /\[[^\]\n]+\]\([^)\n]+\)/,
    /!\[[^\]\n]*\]\([^)\n]+\)/,
  ].filter(pattern => pattern.test(text)).length;
  return inlineSyntaxMatches >= 2;
};

export const KnowledgeBlockEditor: React.FC<KnowledgeBlockEditorProps> = ({
  initialMarkdown,
  initialDocument,
  editable = true,
  onChange,
  highlightedTexts = [],
  onTextSelected,
  className = '',
}) => {
  const storedDocument = useMemo(
    () => (isStoredBlockDocument(initialDocument) ? initialDocument : undefined),
    [initialDocument],
  );
  const hydrated = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  );
  const editor = useCreateBlockNote({ initialContent: storedDocument });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    if (!storedDocument && initialMarkdown.trim()) {
      const parsedBlocks = editor.tryParseMarkdownToBlocks(initialMarkdown);
      editor.replaceBlocks(editor.document, parsedBlocks);
    }
    if (onChange) {
      const documentSnapshot = JSON.parse(JSON.stringify(editor.document)) as Block[];
      onChange(documentSnapshot, editor.blocksToMarkdownLossy(editor.document));
    }
  }, [editor, initialMarkdown, onChange, storedDocument]);

  useEffect(() => {
    if (editable || !rootRef.current) return;
    const normalized = highlightedTexts.map(text => text.trim()).filter(Boolean);
    rootRef.current.querySelectorAll<HTMLElement>('.bn-block-content').forEach(block => {
      const blockText = (block.textContent || '').trim();
      block.classList.toggle('reading-highlighted-block', normalized.some(text => blockText.includes(text) || text.includes(blockText)));
    });
  }, [editable, highlightedTexts]);

  const emitChange = () => {
    if (!onChange) return;
    const documentSnapshot = JSON.parse(JSON.stringify(editor.document)) as Block[];
    onChange(documentSnapshot, editor.blocksToMarkdownLossy(editor.document));
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    if (!editable) return;
    const markdown = normalizePastedMarkdown(event.clipboardData.getData('text/plain'));
    if (!markdown || !looksLikeMarkdown(markdown)) return;

    const parsedBlocks = editor.tryParseMarkdownToBlocks(markdown);
    if (!parsedBlocks.length) return;

    event.preventDefault();
    event.stopPropagation();

    const selection = editor.getSelection();
    const cursorBlock = editor.getTextCursorPosition().block;
    const currentBlockIsEmpty = !editor.blocksToMarkdownLossy([cursorBlock]).trim();
    let insertedBlocks;

    if (selection && editor.getSelectedText()) {
      insertedBlocks = editor.insertBlocks(parsedBlocks, selection.blocks.at(-1) || cursorBlock, 'after');
    } else if (currentBlockIsEmpty) {
      insertedBlocks = editor.replaceBlocks([cursorBlock], parsedBlocks).insertedBlocks;
    } else {
      insertedBlocks = editor.insertBlocks(parsedBlocks, cursorBlock, 'after');
    }

    const lastInsertedBlock = insertedBlocks.at(-1);
    if (lastInsertedBlock) editor.setTextCursorPosition(lastInsertedBlock, 'end');
    emitChange();
    showAppMessage(`已将 Markdown 转换为 ${insertedBlocks.length} 个内容块。`, 'success');
  };

  const handleMouseUp = () => {
    if (editable || !onTextSelected || !rootRef.current) return;
    const selection = window.getSelection();
    const text = selection?.toString().trim() || '';
    if (!text || text.length > 4000 || !selection?.anchorNode || !rootRef.current.contains(selection.anchorNode)) return;
    onTextSelected(text);
  };

  return (
    <div
      className={`knowledge-block-editor ${editable ? 'is-editable' : 'is-readonly'} ${className}`}
      ref={rootRef}
      onPasteCapture={handlePaste}
      onMouseUp={handleMouseUp}
    >
      <BlockNoteView
        editor={editor}
        editable={editable}
        theme={theme}
        onChange={editable ? emitChange : undefined}
      />
    </div>
  );
};
