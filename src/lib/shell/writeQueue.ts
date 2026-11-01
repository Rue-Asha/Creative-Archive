import { COPY } from '#lib/copy.ts';
import { toast } from './toast.ts';

// Optimistic controls answer from local state while their writes run one after another. A write that throws raises
// the toast and must not reject the chain, or every write queued behind it would be skipped; `onIdle` fires once the
// last write settled so the control falls back to the server's value.
export function createWriteQueue(onIdle: () => void) {
	let pending = 0;
	let queue = Promise.resolve();
	return (write: () => Promise<void>) => {
		pending++;
		queue = queue.then(async () => {
			try {
				await write();
			} catch {
				toast(COPY.saveFailed);
			} finally {
				if (--pending === 0) onIdle();
			}
		});
	};
}
