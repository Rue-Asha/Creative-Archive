export function fold(s: string): string {
	return s.normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase();
}
