import {
  ctaLabel,
  fallbackMessage,
  statusLabel,
} from '@/features/candidate/tasks/hooks/useRunTestsCopy';

describe('useRunTestsCopy helpers', () => {
  it('uses succeeded as the terminal success state copy', () => {
    expect(statusLabel.succeeded).toBe('Succeeded');
    expect(ctaLabel('starting')).toBe('Spinning up runner...');
    expect(ctaLabel('running')).toBe('Running...');
    expect(ctaLabel('succeeded')).toBe('Run again');
    expect(ctaLabel('failed')).toBe('Re-run');
    expect(fallbackMessage('succeeded')).toBe(
      'Tests passed. You can submit your work.',
    );
  });
});
