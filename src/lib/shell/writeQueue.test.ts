import { beforeEach, describe, expect, it, vi } from 'vitest';

const toast = vi.fn();
vi.mock('./toast.ts', () => ({ toast }));

const { createWriteQueue } = await import('./writeQueue.ts');

describe('createWriteQueue', () => {
	beforeEach(() => toast.mockClear());

	it('runs a write after a failed one, toasts once and goes idle at the end', async () => {
		const onIdle = vi.fn();
		const ran: string[] = [];
		const enqueue = createWriteQueue(onIdle);
		enqueue(async () => {
			throw new Error('network');
		});
		enqueue(async () => void ran.push('second'));
		await new Promise((r) => setTimeout(r));

		expect(ran).toEqual(['second']);
		expect(toast).toHaveBeenCalledTimes(1);
		expect(toast).toHaveBeenCalledWith("Couldn't save — try again");
		expect(onIdle).toHaveBeenCalledTimes(1);
	});
});
