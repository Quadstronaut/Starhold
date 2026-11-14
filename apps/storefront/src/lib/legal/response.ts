import { legalText } from './text';
import type { LegalKey } from './index';

/** text/plain, UTF-8, no per-request content. The gate hashes the body. */
export function legalTextResponse(key: LegalKey): Response {
	return new Response(legalText(key), {
		headers: {
			'content-type': 'text/plain; charset=utf-8',
			'cache-control': 'public, max-age=300',
			'x-robots-tag': 'noindex'
		}
	});
}