import { describe, expect, it } from 'vitest';

import { resolveDocumentIdentityCandidate } from './document-identity.js';

describe('resolveDocumentIdentityCandidate', () => {
  const samePhysicalPath = (left: string, right: string) => left === right;
  const candidates = [
    {
      uri: 'file:///tmp/project/a.ts',
      canonicalPath: '/private/tmp/project/a.ts',
      value: 'tmp',
    },
    {
      uri: 'file:///private/tmp/project/a.ts',
      canonicalPath: '/private/tmp/project/a.ts',
      value: 'private',
    },
  ];

  it('selects the sole open document for a physical file regardless of URI spelling', () => {
    const result = resolveDocumentIdentityCandidate({
      candidates: [candidates[0]!],
      targetCanonicalPath: '/private/tmp/project/a.ts',
      requestedUri: 'file:///tmp/project/a.ts',
      samePhysicalPath,
    });
    expect(result).toEqual({ kind: 'selected', candidate: candidates[0] });
  });

  it('uses the exact requested URI when multiple open documents share one physical file', () => {
    const result = resolveDocumentIdentityCandidate({
      candidates,
      targetCanonicalPath: '/private/tmp/project/a.ts',
      requestedUri: 'file:///private/tmp/project/a.ts',
      samePhysicalPath,
    });
    expect(result).toEqual({ kind: 'selected', candidate: candidates[1] });
  });

  it('reports ambiguity instead of silently selecting the first matching Buffer', () => {
    const result = resolveDocumentIdentityCandidate({
      candidates,
      targetCanonicalPath: '/private/tmp/project/a.ts',
      samePhysicalPath,
    });
    expect(result).toEqual({ kind: 'ambiguous', candidates });
  });

  it('reports ambiguity when an exact URI is itself represented more than once', () => {
    const result = resolveDocumentIdentityCandidate({
      candidates: [candidates[0]!, candidates[0]!],
      targetCanonicalPath: '/private/tmp/project/a.ts',
      requestedUri: 'file:///tmp/project/a.ts',
      samePhysicalPath,
    });
    expect(result.kind).toBe('ambiguous');
  });

  it('returns none when no open document represents the target physical file', () => {
    const result = resolveDocumentIdentityCandidate({
      candidates,
      targetCanonicalPath: '/private/tmp/project/missing.ts',
      samePhysicalPath,
    });
    expect(result).toEqual({ kind: 'none' });
  });
});
