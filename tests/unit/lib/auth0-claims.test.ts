import {
  extractPermissions,
  getUserEmail,
  hasPermission,
} from '@/lib/auth0-claims';

describe('auth0-claims helpers', () => {
  it('extracts permissions from user object', () => {
    const perms = extractPermissions(
      { permissions: ['candidate:access'] },
      null,
    );
    expect(perms).toContain('candidate:access');
    expect(hasPermission(perms, 'candidate:access')).toBe(true);
  });

  it('falls back to token permissions when user missing', () => {
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
      Buffer.from(
        JSON.stringify({
          permissions: ['recruiter:access'],
          'https://simuhire.com/permissions': ['candidate:access'],
        }),
      ).toString('base64') +
      '.sig';
    const perms = extractPermissions(null, token);
    expect(perms.sort()).toEqual(
      ['candidate:access', 'recruiter:access'].sort(),
    );
  });

  it('maps custom permissions claim on user', () => {
    const perms = extractPermissions(
      { 'https://simuhire.com/permissions': ['recruiter:access'] },
      null,
    );
    expect(perms).toEqual(['recruiter:access']);
  });

  it('supports permissions string claim', () => {
    const perms = extractPermissions(
      {
        'https://simuhire.com/permissions_str':
          'recruiter:access, candidate:access',
      },
      null,
    );
    expect(perms.sort()).toEqual(
      ['recruiter:access', 'candidate:access'].sort(),
    );
  });

  it('maps roles to permissions when permissions are missing', () => {
    const perms = extractPermissions(
      { 'https://simuhire.com/roles': ['RecruiterAdmin'] },
      null,
    );
    expect(perms).toContain('recruiter:access');
    expect(perms).not.toContain('candidate:access');
  });

  it('maps token roles to permissions when user missing', () => {
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
      Buffer.from(
        JSON.stringify({
          'https://simuhire.com/roles': ['CandidateUser'],
        }),
      ).toString('base64') +
      '.sig';
    const perms = extractPermissions(null, token);
    expect(perms).toEqual(['candidate:access']);
  });

  it('prefers custom email claim then email', () => {
    expect(
      getUserEmail({ 'https://simuhire.com/email': 'custom@example.com' }),
    ).toBe('custom@example.com');
    expect(getUserEmail({ email: 'user@example.com' })).toBe(
      'user@example.com',
    );
    expect(getUserEmail(null)).toBeNull();
  });
});
