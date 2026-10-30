export interface DocumentIdentityCandidate<T> {
  readonly uri: string;
  readonly canonicalPath: string;
  readonly value: T;
}

export type DocumentIdentityResolution<T> =
  | { readonly kind: 'none' }
  | {
      readonly kind: 'selected';
      readonly candidate: DocumentIdentityCandidate<T>;
    }
  | {
      readonly kind: 'ambiguous';
      readonly candidates: readonly DocumentIdentityCandidate<T>[];
    };

export function resolveDocumentIdentityCandidate<T>(options: {
  readonly candidates: readonly DocumentIdentityCandidate<T>[];
  readonly targetCanonicalPath: string;
  readonly requestedUri?: string;
  readonly samePhysicalPath: (left: string, right: string) => boolean;
}): DocumentIdentityResolution<T> {
  const matches = options.candidates.filter((candidate) =>
    options.samePhysicalPath(candidate.canonicalPath, options.targetCanonicalPath),
  );
  if (matches.length === 0) return { kind: 'none' };

  if (options.requestedUri !== undefined) {
    const exact = matches.filter((candidate) => candidate.uri === options.requestedUri);
    if (exact.length === 1) return { kind: 'selected', candidate: exact[0]! };
    if (exact.length > 1) return { kind: 'ambiguous', candidates: exact };
  }

  if (matches.length === 1) return { kind: 'selected', candidate: matches[0]! };
  return { kind: 'ambiguous', candidates: matches };
}
