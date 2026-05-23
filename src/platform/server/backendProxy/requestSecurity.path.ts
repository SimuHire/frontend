import {
  MUTATION_HINT_SEGMENTS,
  PUBLIC_BACKEND_PROXY_PATTERNS,
} from './requestSecurity.constants';

export function normalizePath(pathSegments: string[]) {
  return pathSegments
    .map((segment) => {
      try {
        return decodeURIComponent(segment).toLowerCase();
      } catch {
        return segment.toLowerCase();
      }
    })
    .join('/');
}

export function isLikelyMutationGet(path: string): boolean {
  return path
    .split('/')
    .some((segment) => MUTATION_HINT_SEGMENTS.has(segment.toLowerCase()));
}

export function isPublicBackendProxyPath(pathSegments: string[]): boolean {
  const path = normalizePath(pathSegments);
  return PUBLIC_BACKEND_PROXY_PATTERNS.some((pattern) => pattern.test(path));
}
