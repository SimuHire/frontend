/**
 * @jest-environment node
 */

import loader from '@monaco-editor/loader';
import {
  __ensureMonacoConfiguredForTest,
  __resetMonacoConfiguredForTest,
} from '@/components/ui/CodeEditor';

jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (importer: () => Promise<unknown>) => {
    importer();
    return () => null;
  },
}));

jest.mock('@monaco-editor/loader', () => {
  const config = jest.fn();
  return { __esModule: true, default: { config }, config };
});

describe('CodeEditor in node environment', () => {
  const mockedLoader = loader as unknown as { config: jest.Mock };

  beforeEach(() => {
    __resetMonacoConfiguredForTest();
    mockedLoader.config.mockClear();
  });

  it('skips configuration when window is missing', () => {
    const globalWithWindow = globalThis as typeof globalThis & {
      window?: unknown;
    };
    expect(typeof globalWithWindow.window).toBe('undefined');

    __ensureMonacoConfiguredForTest();

    expect(mockedLoader.config).not.toHaveBeenCalled();
  });
});
