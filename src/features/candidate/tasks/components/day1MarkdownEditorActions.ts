import type { Editor } from '@tiptap/react';

export type Day1BubbleMenuAction = 'bold' | 'italic' | 'code' | 'link';

export function runDay1BubbleMenuAction(
  editor: Editor,
  action: Day1BubbleMenuAction,
  selection: { from: number; to: number } | null,
  linkHref?: string | null,
) {
  const chain = editor.chain().focus();
  if (action === 'bold') {
    chain.toggleBold().run();
    return;
  }
  if (action === 'italic') {
    chain.toggleItalic().run();
    return;
  }
  if (action === 'code') {
    chain.toggleCode().run();
    return;
  }
  if (!linkHref) return;
  const withSelection =
    selection !== null
      ? chain.setTextSelection(selection).extendMarkRange('link')
      : chain.extendMarkRange('link');
  withSelection.setLink({ href: linkHref }).run();
}
