export function clampProgress(current: number, total: number | null): number {
	return Math.max(0, total === null ? current : Math.min(current, total));
}
