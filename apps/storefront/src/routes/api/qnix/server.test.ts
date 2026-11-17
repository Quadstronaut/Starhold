import { describe, it, expect } from 'vitest';
import { POST as oldPost } from './+server';
import { POST as newPost } from '../dysonsphere/+server';

describe('/api/qnix alias (QNIX-45)', () => {
	it('is the same handler as /api/dysonsphere', () => {
		expect(oldPost).toBe(newPost);
	});
});
