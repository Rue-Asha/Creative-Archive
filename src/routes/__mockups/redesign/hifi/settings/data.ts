import type { MockData, PhotoWorld } from '../../fixtures.ts';
import { DOMAIN_LABEL } from '../shell/data.ts';

export type SlotState = 'idle' | 'pending';
export type Slot = { world: PhotoWorld; label: string; photo: boolean; state: SlotState; error: string };

export const ORDER: PhotoWorld[] = ['home', 'music', 'animanga', 'books', 'fashion'];

export const MESSAGES = { type: 'Unsupported image type', size: 'Image is larger than 16 MB' };

export const COPY = 'Each world can have one photo, shown behind its title. Without one, the page shows a soft colour field. JPEG, PNG, WebP, GIF or AVIF, up to 16 MB.';

export function slots(heroes: MockData['heroes'], override: Partial<Record<PhotoWorld, Partial<Slot>>> = {}): Slot[] {
	return ORDER.map((world) => ({ world, label: DOMAIN_LABEL[world], photo: heroes[world] !== null, state: 'idle', error: '', ...override[world] }));
}
