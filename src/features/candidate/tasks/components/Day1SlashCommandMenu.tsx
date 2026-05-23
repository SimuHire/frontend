'use client';

import type { Editor } from '@tiptap/react';

export type SlashCommandId =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'quote'
  | 'code'
  | 'ul'
  | 'ol';

type SlashCommand = {
  id: SlashCommandId;
  label: string;
  prefix: string;
};

export const DAY1_SLASH_COMMANDS: SlashCommand[] = [
  { id: 'h1', label: 'Heading 1', prefix: '/h1' },
  { id: 'h2', label: 'Heading 2', prefix: '/h2' },
  { id: 'h3', label: 'Heading 3', prefix: '/h3' },
  { id: 'quote', label: 'Quote', prefix: '/quote' },
  { id: 'code', label: 'Code block', prefix: '/code' },
  { id: 'ul', label: 'Bullet list', prefix: '/ul' },
  { id: 'ol', label: 'Numbered list', prefix: '/ol' },
];

type Props = {
  query: string;
  position: { top: number; left: number };
  selectedIndex: number;
  onSelect: (command: SlashCommand) => void;
};

export function Day1SlashCommandMenu({
  query,
  position,
  selectedIndex,
  onSelect,
}: Props) {
  const filtered = DAY1_SLASH_COMMANDS.filter((command) =>
    command.prefix.slice(1).startsWith(query.toLowerCase()),
  );
  if (!filtered.length) return null;

  return (
    <div
      className="absolute z-40 min-w-[12rem] rounded-md border border-gray-200 bg-white py-1 shadow-lg"
      style={{ top: position.top, left: position.left }}
      role="listbox"
      aria-label="Slash commands"
    >
      {filtered.map((command, index) => (
        <button
          key={command.id}
          type="button"
          role="option"
          aria-selected={index === selectedIndex}
          className={`block w-full px-3 py-2 text-left text-sm ${
            index === selectedIndex
              ? 'bg-wheat-50 text-wheat-950'
              : 'text-gray-900 hover:bg-gray-50'
          }`}
          onMouseDown={(event) => {
            event.preventDefault();
            onSelect(command);
          }}
        >
          <span className="font-medium">{command.prefix}</span>
          <span className="ml-2 text-gray-600">{command.label}</span>
        </button>
      ))}
    </div>
  );
}

export function applySlashCommand(editor: Editor, command: SlashCommand) {
  const { state } = editor;
  const { $from } = state.selection;
  const blockStart = $from.start();
  const textBefore = state.doc.textBetween(blockStart, $from.pos, '\n', '\n');
  const match = textBefore.match(/(?:^|\s)(\/\w*)$/);
  if (!match) return;
  const slashText = match[1];
  const deleteFrom = $from.pos - slashText.length;
  const chain = editor
    .chain()
    .focus()
    .deleteRange({ from: deleteFrom, to: $from.pos });
  switch (command.id) {
    case 'h1':
      chain.setHeading({ level: 1 }).run();
      return;
    case 'h2':
      chain.setHeading({ level: 2 }).run();
      return;
    case 'h3':
      chain.setHeading({ level: 3 }).run();
      return;
    case 'quote':
      chain.setBlockquote().run();
      return;
    case 'code':
      chain.setCodeBlock().run();
      return;
    case 'ul':
      chain.toggleBulletList().run();
      return;
    case 'ol':
      chain.toggleOrderedList().run();
      return;
    default:
      return;
  }
}

export function detectSlashQuery(editor: Editor): {
  query: string;
  rangeFrom: number;
} | null {
  const { state } = editor;
  const { $from } = state.selection;
  if (!$from.parent.isTextblock) return null;
  const blockStart = $from.start();
  const textBefore = state.doc.textBetween(blockStart, $from.pos, '\n', '\n');
  const match = textBefore.match(/(?:^|\s)(\/\w*)$/);
  if (!match) return null;
  const slashText = match[1];
  return {
    query: slashText.slice(1),
    rangeFrom: $from.pos - slashText.length,
  };
}
