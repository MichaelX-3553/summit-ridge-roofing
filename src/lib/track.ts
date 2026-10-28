export type WhopTrackData = {
	value?: number
	currency?: string
	event_id?: string
	email?: string
	name?: string
	phone?: string
}

declare global {
	interface Window {
		whop?: { track: (name: string, data?: WhopTrackData) => void }
	}
}

export function track(name: string, data?: WhopTrackData) {
	if (typeof window === 'undefined') return
	try {
		window.whop?.track(name, data)
	} catch {
		// pixel is best-effort; never block the UI on it
	}
}

const seen = new Set<string>()

export function trackOnce(key: string, name: string, data?: WhopTrackData) {
	if (seen.has(key)) return
	seen.add(key)
	track(name, { event_id: key, ...data })
}
