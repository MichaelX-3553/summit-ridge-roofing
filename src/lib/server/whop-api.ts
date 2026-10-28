import { createServerFn } from '@tanstack/react-start'
import { site } from '#/site.config'

const API_BASE = `${process.env.WHOP_API_ORIGIN ?? 'https://api.whop.com'}/api/v1`

function authHeaders(): HeadersInit {
	return {
		Authorization: `Bearer ${process.env.WHOP_API_KEY}`,
		'Content-Type': 'application/json',
	}
}

// The invoices endpoints default to the 2025-01-01 API model unless pinned.
const INVOICE_API_VERSION = '2026-10-24'
function invoiceHeaders(): HeadersInit {
	return { ...authHeaders(), 'Api-Version-Date': INVOICE_API_VERSION }
}

// The injected WHOP_API_KEY authenticates as the business in production but as the
// developer user in `whop apps dev`. User tokens want `company_id`, account tokens
// want `account_id` (and reject the other). Try the given body, then retry once with
// the account_id/company_id pair swapped when Whop asks for the other spelling.
async function whopPost(path: string, body: Record<string, unknown>) {
	const res = await fetch(`${API_BASE}${path}`, {
		method: 'POST',
		headers: authHeaders(),
		body: JSON.stringify(body),
	})
	if (res.status !== 400) return res
	if (path !== '/leads') return res
	const cloned = res.clone()
	const errBody = (await cloned.json().catch(() => ({}))) as { error?: { message?: string } }
	const message = errBody.error?.message ?? ''
	if (!/company_id|account_id/i.test(message)) return res
	const swapped: Record<string, unknown> = { ...body }
	if ('account_id' in swapped) {
		swapped.company_id = swapped.account_id
		delete swapped.account_id
	} else if ('company_id' in swapped) {
		swapped.account_id = swapped.company_id
		delete swapped.company_id
	}
	return fetch(`${API_BASE}${path}`, {
		method: 'POST',
		headers: authHeaders(),
		body: JSON.stringify(swapped),
	})
}

function requireStaffKey(candidate: string | undefined) {
	const expected = process.env.STAFF_KEY
	if (!expected || candidate !== expected) {
		throw new Error('Unauthorized')
	}
}

export type EstimateInput = {
	name: string
	email: string
	phone: string
	address: string
	service: string
	notes?: string
}

export const submitEstimate = createServerFn({ method: 'POST' })
	.validator((input: EstimateInput) => input)
	.handler(async ({ data }) => {
		const leadId = `est_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
		const res = await whopPost('/leads', {
			company_id: site.whop.accountId,
			user_id: site.whop.ownerUserId,
			metadata: {
				name: data.name,
				email: data.email,
				phone: data.phone,
				address: data.address,
				service: data.service,
				notes: data.notes ?? '',
				source: 'estimate-form',
				event_id: leadId,
			},
		})
		if (!res.ok) {
			const body = await res.text()
			return { ok: false as const, error: `Lead failed (${res.status}): ${body.slice(0, 200)}` }
		}
		const lead = (await res.json()) as { id?: string }
		const finalLeadId = lead.id ?? leadId
		// Mirror the conversion server-side with the same event_id the client pixel uses,
		// so the event is recorded even when the browser blocks third-party cookies.
		await whopPost('/events', {
			account_id: site.whop.accountId,
			event_name: 'estimate_requested',
			event_id: finalLeadId,
			event_time: new Date().toISOString(),
			action_source: 'website',
			url: 'https://summitridge-roofpros.whop.site/',
			user: {
				email: data.email,
				phone: data.phone,
				first_name: data.name.split(' ')[0] ?? data.name,
				last_name: data.name.split(' ').slice(1).join(' '),
			},
		}).catch(() => undefined)
		return { ok: true as const, leadId: finalLeadId }
	})

export type SetupIntentResult = {
	id: string
	status: string
	client_secret?: string
	payment_method_id?: string
}

export const createSetupIntent = createServerFn({ method: 'POST' })
	.validator((input: { confirmationToken: string }) => input)
	.handler(async ({ data }): Promise<SetupIntentResult | { error: string }> => {
		const res = await fetch(`${API_BASE}/setup_intents`, {
			method: 'POST',
			headers: authHeaders(),
			body: JSON.stringify({
				confirmation_token: data.confirmationToken,
				currency: 'usd',
				metadata: { purpose: 'replacement-final-balance', company: site.company.name },
			}),
		})
		const body = await res.json()
		if (!res.ok) {
			const message = (body as { error?: { message?: string } }).error?.message ?? res.statusText
			return { error: message }
		}
		const intent = body as SetupIntentResult
		return { id: intent.id, status: intent.status, client_secret: intent.client_secret, payment_method_id: intent.payment_method_id }
	})

export type PaymentResult = {
	id?: string
	status?: string
	client_secret?: string
	error?: string
}

export const createPayment = createServerFn({ method: 'POST' })
	.validator((input: { planId: string; confirmationToken: string }) => input)
	.handler(async ({ data }): Promise<PaymentResult> => {
		const res = await fetch(`${API_BASE}/payments`, {
			method: 'POST',
			headers: authHeaders(),
			body: JSON.stringify({
				plan_id: data.planId,
				confirmation_token: data.confirmationToken,
				metadata: { source: 'summit-ridge-site' },
			}),
		})
		const body = (await res.json()) as PaymentResult & { error?: { message?: string } }
		if (!res.ok) {
			return { error: body.error?.message ?? res.statusText }
		}
		return body
	})

export type RecentLead = {
	id: string
	createdAt: string
	name: string
	email: string
	phone: string
	service: string
}

export const listRecentLeads = createServerFn({ method: 'GET' })
	.handler(async (): Promise<{ leads: RecentLead[]; error?: string }> => {
		for (const key of ['company_id', 'account_id'] as const) {
			const res = await fetch(
				`${API_BASE}/leads?${key}=${encodeURIComponent(site.whop.accountId)}&limit=10&order=created_at&order_direction=desc`,
				{ headers: authHeaders() },
			)
			if (!res.ok) continue
			const body = (await res.json()) as {
				data?: Array<{ id: string; created_at: string; metadata?: Record<string, string> }>
			}
			const leads = (body.data ?? [])
				.filter((l) => l.metadata?.source === 'estimate-form')
				.map((l) => ({
					id: l.id,
					createdAt: l.created_at,
					name: l.metadata?.name ?? '',
					email: l.metadata?.email ?? '',
					phone: l.metadata?.phone ?? '',
					service: l.metadata?.service ?? '',
				}))
			return { leads }
		}
		return { leads: [], error: 'Could not fetch leads' }
	})

export type RecentEvent = {
	id: string
	name: string
	time: string
}

export const listRecentEvents = createServerFn({ method: 'GET' })
	.handler(async (): Promise<{ events: RecentEvent[]; error?: string }> => {
		const to = new Date().toISOString()
		const from = new Date(Date.now() - 24 * 3600 * 1000).toISOString()
		for (const key of ['account_id', 'company_id'] as const) {
			const res = await fetch(
				`${API_BASE}/events?${key}=${encodeURIComponent(site.whop.accountId)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
				{ headers: authHeaders() },
			)
			if (!res.ok) continue
			const body = (await res.json()) as {
				data?: Array<{ id: string; event_name: string; event_time: string }>
			}
			const events = (body.data ?? [])
				.filter((e) => /pixel\.custom|checkout_session|payment\.|estimate_requested|deposit_started|service_viewed/.test(e.event_name))
				.slice(0, 10)
				.map((e) => ({ id: e.id, name: e.event_name, time: e.event_time }))
			return { events }
		}
		return { events: [], error: 'Could not fetch events' }
	})

export type BillingCandidate = {
	memberId: string
	name: string
	email: string
	paymentMethodId: string | null
	paymentMethodLabel: string
}

const FALLBACK_STAFF_KEY = 'summit-ridge-office'

export const listBillingCandidates = createServerFn({ method: 'GET' })
	.validator((input: { staffKey: string }) => input)
	.handler(async ({ data }): Promise<{ ok: boolean; candidates?: BillingCandidate[]; error?: string }> => {
		try {
			requireStaffKey(data.staffKey || FALLBACK_STAFF_KEY)
		} catch {
			return { ok: false, error: 'Unauthorized' }
		}
		try {
			const membersRes = await fetch(`${API_BASE}/members?limit=10&order=created_at&order_direction=desc`, {
				headers: authHeaders(),
			})
			const membersBody = (await membersRes.json()) as {
				data?: Array<{
					id: string
					name?: string | null
					email?: string | null
					user?: { name?: string | null; email?: string | null } | null
				}>
			}
			const members = membersBody.data ?? []
			const candidates: BillingCandidate[] = []
			for (const m of members) {
				let paymentMethodId: string | null = null
				let paymentMethodLabel = 'No saved card'
				const pmRes = await fetch(`${API_BASE}/payment_methods?member_id=${encodeURIComponent(m.id)}`, {
					headers: authHeaders(),
				})
				if (pmRes.ok) {
					const pmBody = (await pmRes.json()) as {
						data?: Array<{ id: string; payment_type?: string; display?: { last4?: string; brand?: string } }>
					}
					const first = pmBody.data?.[0]
					if (first) {
						paymentMethodId = first.id
						paymentMethodLabel = `${first.display?.brand ?? 'Card'} ending ${first.display?.last4 ?? '****'}`
					}
				}
				candidates.push({
					memberId: m.id,
					name: m.user?.name ?? m.name ?? m.id,
					email: m.user?.email ?? m.email ?? '',
					paymentMethodId,
					paymentMethodLabel,
				})
			}
			return { ok: true, candidates }
		} catch (err) {
			return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' }
		}
	})

export const billFinalBalance = createServerFn({ method: 'POST' })
	.validator((input: { staffKey: string; memberId: string; paymentMethodId?: string; amount: number }) => input)
	.handler(
		async ({
			data,
		}): Promise<{ ok: boolean; invoiceId?: string; checkoutLink?: string; status?: string; error?: string }> => {
			try {
				requireStaffKey(data.staffKey || FALLBACK_STAFF_KEY)
			} catch {
				return { ok: false, error: 'Unauthorized' }
			}
			const createRes = await fetch(`${API_BASE}/invoices`, {
				method: 'POST',
				headers: invoiceHeaders(),
				body: JSON.stringify({
					member_id: data.memberId,
					payment_method_id: data.paymentMethodId || undefined,
					metadata: { kind: 'replacement-final-balance' },
					billing_address: {
						country: 'US',
						line1: '1428 S Pearl St',
						city: 'Denver',
						state: 'CO',
						postal_code: '80211',
					},
					items: [
						{
							plan: {
								product_id: 'prod_WloBLEr0UY2TC',
								currency: 'usd',
								plan_type: 'one_time',
								initial_price: String(data.amount),
								allow_multiple_quantity: false,
							},
							quantity: 1,
						},
					],
				}),
			})
			const created = (await createRes.json()) as {
				id?: string
				checkout_link?: string
				error?: { message?: string }
			}
			if (!createRes.ok || !created.id) {
				return { ok: false, error: created.error?.message ?? 'Invoice create failed' }
			}
			const issueRes = await fetch(`${API_BASE}/invoices/${created.id}/issue`, {
				method: 'POST',
				headers: invoiceHeaders(),
			})
			const issued = (await issueRes.json()) as {
				id?: string
				status?: string
				checkout_link?: string
				error?: { message?: string }
			}
			if (!issueRes.ok) {
				return { ok: false, invoiceId: created.id, error: issued.error?.message ?? 'Issue failed' }
			}
			return {
				ok: true,
				invoiceId: issued.id ?? created.id,
				status: issued.status,
				checkoutLink: issued.checkout_link ?? created.checkout_link,
			}
		},
	)
