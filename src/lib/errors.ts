import type { Id } from './types.ts';

export class ValidationError extends Error {
	constructor(public fields: Record<string, string>) {
		super(Object.values(fields).join(', '));
		this.name = 'ValidationError';
	}
}

export class ImageError extends Error {
	constructor(public code: 'not-image' | 'too-large' | 'download') {
		super(code);
		this.name = 'ImageError';
	}
}

export class FetchError extends Error {
	constructor(
		public code:
			| 'invalid-url'
			| 'scheme'
			| 'private-address'
			| 'timeout'
			| 'too-large'
			| 'status'
			| 'network'
			| 'redirects'
	) {
		super(code);
		this.name = 'FetchError';
	}
}

export class ProviderError extends Error {
	constructor(public code: 'timeout' | 'failed') {
		super(code);
		this.name = 'ProviderError';
	}
}

export class DuplicateError extends Error {
	constructor(public existingId: Id) {
		super(`duplicate of ${existingId}`);
		this.name = 'DuplicateError';
	}
}
