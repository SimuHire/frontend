const CANDIDATE_PREFIXES = ['/candidate-sessions', '/candidate'];
const RECRUITER_PREFIXES = ['/dashboard'];

export function requiresCandidateAccess(pathname: string): boolean {
  return CANDIDATE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function requiresRecruiterAccess(pathname: string): boolean {
  return RECRUITER_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function loginModeForPath(pathname: string): 'candidate' | 'recruiter' {
  return requiresCandidateAccess(pathname) ? 'candidate' : 'recruiter';
}

export { CANDIDATE_PREFIXES, RECRUITER_PREFIXES };
