'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BubbleMenu } from '@tiptap/react/menus';
import { EditorContent, useEditor } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import { Link } from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Markdown } from '@tiptap/markdown';
import { StarterKit } from '@tiptap/starter-kit';
import { LoadingSkeletonBlock } from '@/shared/ui/LoadingSkeletonBlock';
import { runDay1BubbleMenuAction } from './day1MarkdownEditorActions';
import {
  applySlashCommand,
  DAY1_SLASH_COMMANDS,
  Day1SlashCommandMenu,
  detectSlashQuery,
} from './Day1SlashCommandMenu';

type Day1MarkdownEditorProps = {
  value: string;
  onChange: (markdown: string) => void;
  disabled: boolean;
  placeholder: string;
  onBlurDocument?: () => void;
  editorKey: string;
};

function coordsFromEditor(editor: Editor) {
  const { view } = editor;
  const coords = view.coordsAtPos(view.state.selection.from);
  const container = view.dom.getBoundingClientRect();
  return {
    top: coords.bottom - container.top + 8,
    left: coords.left - container.left,
  };
}

export function Day1MarkdownEditor({
  value,
  onChange,
  disabled,
  placeholder,
  onBlurDocument,
  editorKey,
}: Day1MarkdownEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [slashQuery, setSlashQuery] = useState<string | null>(null);
  const [slashIndex, setSlashIndex] = useState(0);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: false,
      }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder }),
      Markdown,
    ],
    [placeholder],
  );

  const syncSlashMenu = useCallback((editor: Editor) => {
    const detected = detectSlashQuery(editor);
    if (!detected) {
      setSlashQuery(null);
      return;
    }
    setSlashQuery(detected.query);
    setSlashIndex(0);
    setMenuPosition(coordsFromEditor(editor));
  }, []);

  const editor = useEditor({
    extensions,
    content: value,
    editable: !disabled,
    contentType: 'markdown',
    editorProps: {
      attributes: {
        'aria-label': 'Markdown editor',
        'aria-multiline': 'true',
        role: 'textbox',
        class:
          'max-w-none min-h-[480px] w-full px-3 py-4 text-base leading-[1.6] text-gray-950 focus:outline-none [&_p]:mb-3 [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-200 [&_blockquote]:pl-3 [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1',
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getMarkdown());
      syncSlashMenu(ed);
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor) return;
    const current = editor.getMarkdown();
    if (current === value) return;
    editor.commands.setContent(value || '', { contentType: 'markdown' });
  }, [editor, value, editorKey]);

  useEffect(() => {
    if (!onBlurDocument || !editor) return;
    const el = editor.view.dom;
    const onBlur = () => {
      window.setTimeout(() => {
        if (!editor.isFocused) onBlurDocument();
      }, 120);
    };
    el.addEventListener('blur', onBlur, true);
    return () => el.removeEventListener('blur', onBlur, true);
  }, [editor, onBlurDocument]);

  const handleSlashSelect = useCallback(
    (command: (typeof DAY1_SLASH_COMMANDS)[number]) => {
      if (!editor) return;
      applySlashCommand(editor, command);
      setSlashQuery(null);
    },
    [editor],
  );

  useEffect(() => {
    if (!editor || slashQuery === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const filtered = DAY1_SLASH_COMMANDS.filter((command) =>
        command.prefix.slice(1).startsWith(slashQuery.toLowerCase()),
      );
      if (!filtered.length) return;
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSlashIndex((index) => (index + 1) % filtered.length);
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSlashIndex(
          (index) => (index - 1 + filtered.length) % filtered.length,
        );
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        const command = filtered[slashIndex];
        if (command) handleSlashSelect(command);
      }
      if (event.key === 'Escape') {
        setSlashQuery(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editor, handleSlashSelect, slashIndex, slashQuery]);

  if (!editor) {
    return (
      <LoadingSkeletonBlock
        label="Preparing editor"
        className="min-h-[480px] rounded-md border border-gray-200 bg-white p-4"
        lines={5}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative rounded-md border border-gray-200 bg-white shadow-sm"
    >
      <BubbleMenu
        editor={editor}
        className="z-40 flex gap-1 rounded-md border border-gray-200 bg-white p-1 shadow-md"
      >
        <button
          type="button"
          className="rounded px-2 py-1 text-sm font-semibold hover:bg-gray-100"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => runDay1BubbleMenuAction(editor, 'bold', null)}
        >
          Bold
        </button>
        <button
          type="button"
          className="rounded px-2 py-1 text-sm font-semibold hover:bg-gray-100"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => runDay1BubbleMenuAction(editor, 'italic', null)}
        >
          Italic
        </button>
        <button
          type="button"
          className="rounded px-2 py-1 text-sm font-semibold hover:bg-gray-100"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => runDay1BubbleMenuAction(editor, 'code', null)}
        >
          Code
        </button>
        <button
          type="button"
          className="rounded px-2 py-1 text-sm font-semibold hover:bg-gray-100"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            const selection = {
              from: editor.state.selection.from,
              to: editor.state.selection.to,
            };
            const prev = window.prompt('Link URL');
            if (!prev) return;
            runDay1BubbleMenuAction(editor, 'link', selection, prev);
          }}
        >
          Link
        </button>
      </BubbleMenu>
      {slashQuery !== null ? (
        <Day1SlashCommandMenu
          query={slashQuery}
          position={menuPosition}
          selectedIndex={slashIndex}
          onSelect={handleSlashSelect}
        />
      ) : null}
      <EditorContent editor={editor} />
    </div>
  );
}
