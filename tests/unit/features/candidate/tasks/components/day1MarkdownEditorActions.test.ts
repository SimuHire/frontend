import { runDay1BubbleMenuAction } from '@/features/candidate/tasks/components/day1MarkdownEditorActions';

type MockChain = {
  focus: jest.Mock<MockChain, []>;
  toggleBold: jest.Mock<MockChain, []>;
  toggleItalic: jest.Mock<MockChain, []>;
  toggleCode: jest.Mock<MockChain, []>;
  setTextSelection: jest.Mock<MockChain, [{ from: number; to: number }]>;
  extendMarkRange: jest.Mock<MockChain, [string]>;
  setLink: jest.Mock<MockChain, [{ href: string }]>;
  run: jest.Mock<void, []>;
};

function makeEditor() {
  const chain = {} as MockChain;
  chain.focus = jest.fn(() => chain);
  chain.toggleBold = jest.fn(() => chain);
  chain.toggleItalic = jest.fn(() => chain);
  chain.toggleCode = jest.fn(() => chain);
  chain.setTextSelection = jest.fn(() => chain);
  chain.extendMarkRange = jest.fn(() => chain);
  chain.setLink = jest.fn(() => chain);
  chain.run = jest.fn();
  const editor = {
    chain: jest.fn(() => chain),
  } as { chain: jest.Mock<MockChain, []> };
  return { chain, editor };
}

describe('runDay1BubbleMenuAction', () => {
  it('applies bold, italic, and code through a focused chain', () => {
    const { chain, editor } = makeEditor();

    runDay1BubbleMenuAction(editor, 'bold', null);
    runDay1BubbleMenuAction(editor, 'italic', null);
    runDay1BubbleMenuAction(editor, 'code', null);

    expect(editor.chain).toHaveBeenCalledTimes(3);
    expect(chain.focus).toHaveBeenCalledTimes(3);
    expect(chain.toggleBold).toHaveBeenCalledTimes(1);
    expect(chain.toggleItalic).toHaveBeenCalledTimes(1);
    expect(chain.toggleCode).toHaveBeenCalledTimes(1);
    expect(chain.run).toHaveBeenCalledTimes(3);
  });

  it('restores the selection before applying a link', () => {
    const { chain, editor } = makeEditor();

    runDay1BubbleMenuAction(
      editor,
      'link',
      { from: 4, to: 10 },
      'https://example.com',
    );

    expect(chain.focus).toHaveBeenCalled();
    expect(chain.setTextSelection).toHaveBeenCalledWith({ from: 4, to: 10 });
    expect(chain.extendMarkRange).toHaveBeenCalledWith('link');
    expect(chain.setLink).toHaveBeenCalledWith({ href: 'https://example.com' });
    expect(chain.run).toHaveBeenCalled();
  });
});
