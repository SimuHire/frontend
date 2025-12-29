import loader from '@monaco-editor/loader';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import CodeEditor, {
  __ensureMonacoConfiguredForTest,
  __resetMonacoConfiguredForTest,
} from '@/components/ui/CodeEditor';

type StubProps = Record<string, unknown> & {
  onChange?: (value?: string) => void;
  loading?: React.ReactNode;
};

const monacoInstances: StubProps[] = [];

jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (importer: () => Promise<unknown>) => {
    importer();
    function MonacoStub(props: StubProps) {
      monacoInstances.push(props);
      return (
        <div
          data-testid="monaco-stub"
          onClick={() => props.onChange?.(undefined)}
        >
          {props.loading}
        </div>
      );
    }
    return MonacoStub;
  },
}));

jest.mock('@monaco-editor/loader', () => {
  const config = jest.fn();
  return { __esModule: true, default: { config }, config };
});

describe('CodeEditor monaco wiring', () => {
  const mockedLoader = loader as unknown as { config: jest.Mock };

  beforeEach(() => {
    __resetMonacoConfiguredForTest();
    mockedLoader.config.mockClear();
    monacoInstances.length = 0;
  });

  it('configures monaco once when window is available', () => {
    __ensureMonacoConfiguredForTest();
    expect(mockedLoader.config).toHaveBeenCalledWith({
      paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' },
    });

    __ensureMonacoConfiguredForTest();
    expect(mockedLoader.config).toHaveBeenCalledTimes(1);
  });

  it('renders the editor stub and forwards props', () => {
    const onChange = jest.fn();
    render(
      <CodeEditor
        value="text"
        onChange={onChange}
        language="javascript"
        height={200}
      />,
    );

    const stub = screen.getByTestId('monaco-stub');
    fireEvent.click(stub);

    const props = monacoInstances.pop() as StubProps;
    expect(props.language).toBe('javascript');
    expect(props.value).toBe('text');
    expect(props.height).toBe('200px');
    expect(props.options).toMatchObject({
      minimap: { enabled: false },
      automaticLayout: true,
    });
    expect(onChange).toHaveBeenCalledWith('');
  });
});
