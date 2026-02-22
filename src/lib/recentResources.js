const STORAGE_KEY = "recent_resources";
const MAX_RECENT = 10;

export function addRecentResource(resource) {
	if (!resource?.id || !resource?.name) return;

	const existing = getRecentResources();

	// Remove if already exists (to move it to top)
	const filtered = existing.filter((r) => r.id !== resource.id);

	const updated = [
		{
			id: resource.id,
			name: resource.name,
			visitedAt: Date.now(),
		},
		...filtered,
	].slice(0, MAX_RECENT);

	localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function getRecentResources() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed;
	} catch {
		return [];
	}
}
