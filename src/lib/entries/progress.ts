export function clampProgress(current: number, total: number | null): number {
	return Math.max(0, total === null ? current : Math.min(current, total));
}

export function parseProgress(raw: string, total: number | null): number | null {
	const trimmed = raw.trim();
	if (!/^\d+$/.test(trimmed)) return null;
	const value = Number(trimmed);
	return total !== null && value > total ? null : value;
}
