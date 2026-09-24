import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Block, PartialBlock } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';

interface KnowledgeBlockEditorProps {
  initialMarkdown: string;
  initialDocument?: unknown[];
  editable?: boolean;
  onChange?: (document: unknown[], markdown: string) => void;
  className?: string;
}

const isStoredBlockDocument = (value: unknown): value is PartialBlock[] =>
  Array.isArray(value) && value.length > 0 && value.every(block => !!block && typeof block === 'object' && 'type' in block);

export const KnowledgeBlockEditor: React.FC<KnowledgeBlockEditorProps> = ({
  initialMarkdown,
  initialDocument,
  editable = true,
  onChange,
  className = '',
}) => {
  const storedDocument = useMemo(
    () => (isStoredBlockDocument(initialDocument) ? initialDocument : undefined),
    [initialDocument],
  );
  const hydrated = useRef(false);
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

  const emitChange = () => {
    if (!onChange) return;
    const documentSnapshot = JSON.parse(JSON.stringify(editor.document)) as Block[];
    onChange(documentSnapshot, editor.blocksToMarkdownLossy(editor.document));
  };

  return (
    <div className={`knowledge-block-editor ${editable ? 'is-editable' : 'is-readonly'} ${className}`}>
      <BlockNoteView
        editor={editor}
        editable={editable}
        theme={theme}
        onChange={editable ? emitChange : undefined}
      />
    </div>
  );
};
