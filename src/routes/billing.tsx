'use client'

import { useCallback, useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { billFinalBalance, listBillingCandidates, listRecentEvents, listRecentLeads } from '#/lib/server/whop-api'
import type { BillingCandidate, RecentEvent, RecentLead } from '#/lib/server/whop-api'

export const Route = createFileRoute('/billing')({ component: BillingPage })

function BillingPage() {
	const [staffKey, setStaffKey] = useState('')
	const [candidates, setCandidates] = useState<BillingCandidate[] | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [busyId, setBusyId] = useState<string | null>(null)
	const [result, setResult] = useState<string | null>(null)
	const [amount, setAmount] = useState('4200')
	const [leads, setLeads] = useState<RecentLead[] | null>(null)
	const [events, setEvents] = useState<RecentEvent[] | null>(null)

	useEffect(() => {
		const params = new URLSearchParams(window.location.search)
		const key = params.get('office') ?? ''
		setStaffKey(key)
		if (!key) return
		listRecentLeads().then((r) => setLeads(r.error ? [] : r.leads))
		listRecentEvents().then((r) => setEvents(r.error ? [] : r.events))
	}, [])

	const load = useCallback(async () => {
		setError(null)
		const res = await listBillingCandidates({ data: { staffKey } })
		if (!res.ok) {
			setError(res.error ?? 'Failed to load')
			setCandidates(null)
			return
		}
		setCandidates(res.candidates ?? [])
	}, [staffKey])

	async function bill(memberId: string, paymentMethodId: string | null) {
		setBusyId(memberId)
		setResult(null)
		const res = await billFinalBalance({
			data: { staffKey, memberId, paymentMethodId: paymentMethodId ?? undefined, amount: Number(amount) || 0 },
		})
		setBusyId(null)
		if (!res.ok) {
			setResult(`Failed: ${res.error}`)
			return
		}
		setResult(
			`Invoice ${res.invoiceId} issued (status: ${res.status}). ${res.checkoutLink ? `Manual pay link: ${res.checkoutLink}` : 'Charged to the saved card.'}`,
		)
	}

	return (
		<main className="mx-auto min-h-dvh max-w-3xl px-5 py-12">
			<h1 className="text-2xl font-semibold">Office: final balance billing</h1>
			<p className="mt-2 text-sm text-ink-soft">
				Internal demo page. Creates a Whop invoice for a replacement's remaining balance and issues it against
				the card saved at deposit, or produces a manual payment link.
			</p>
			<div className="mt-8 flex flex-wrap items-end gap-4">
				<div>
					<label htmlFor="amount" className="mb-1.5 block text-sm font-semibold">
						Final balance amount (USD)
					</label>
					<input
						id="amount"
						value={amount}
						onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
						className="num h-11 w-36 rounded-[10px] border border-line bg-white px-3"
					/>
				</div>
				<button
					type="button"
					onClick={load}
					className="h-11 rounded-full bg-ink px-6 text-sm font-semibold text-white"
				>
					Load recent customers
				</button>
			</div>
			{error ? <p className="mt-6 text-sm font-semibold text-clay-deep">{error}</p> : null}
			{result ? (
				<p className="mt-6 rounded-xl border border-line bg-white p-4 text-sm">{result}</p>
			) : null}
			<div className="mt-8 space-y-3">
				{(candidates ?? []).map((c) => (
					<div key={c.memberId} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white p-4">
						<div>
							<p className="font-semibold">{c.name}</p>
							<p className="text-sm text-ink-soft">
								{c.email} · {c.paymentMethodLabel}
							</p>
							<p className="num mt-0.5 text-xs text-ink-faint">{c.memberId}</p>
						</div>
						<button
							type="button"
							disabled={busyId === c.memberId}
							onClick={() => bill(c.memberId, c.paymentMethodId)}
							className="h-10 rounded-full bg-clay-deep px-5 text-sm font-semibold text-white disabled:opacity-50"
						>
							{busyId === c.memberId ? 'Billing…' : 'Bill final balance'}
						</button>
					</div>
				))}
				{candidates && candidates.length === 0 ? (
					<p className="text-sm text-ink-soft">No members yet. Complete a deposit checkout first.</p>
				) : null}
			</div>
			<section className="mt-12 grid gap-6 md:grid-cols-2">
				<div className="rounded-xl border border-line bg-white p-5">
					<h2 className="text-sm font-semibold uppercase tracking-wide text-ink-faint">
						Recent leads (Whop Leads API)
					</h2>
					<ul className="mt-4 space-y-3">
						{(leads ?? []).map((l) => (
							<li key={l.id} className="border-b border-line pb-3 text-sm last:border-0 last:pb-0">
								<p className="font-semibold">
									{l.name} <span className="font-normal text-ink-soft">wants {l.service}</span>
								</p>
								<p className="text-ink-soft">
									{l.email} {l.phone ? `· ${l.phone}` : ''}
								</p>
								<p className="num mt-0.5 text-xs text-ink-faint">
									{l.id} · {new Date(l.createdAt).toLocaleString()}
								</p>
							</li>
						))}
						{leads && leads.length === 0 ? (
							<li className="text-sm text-ink-soft">No leads in the last 24h.</li>
						) : null}
					</ul>
				</div>
				<div className="rounded-xl border border-line bg-white p-5">
					<h2 className="text-sm font-semibold uppercase tracking-wide text-ink-faint">
						Recent checkout + pixel events
					</h2>
					<ul className="mt-4 space-y-2.5">
						{(events ?? []).map((e, i) => (
							<li key={`${e.id}-${i}`} className="flex items-baseline justify-between gap-3 text-sm">
								<span className="num font-medium">{e.name}</span>
								<span className="text-xs text-ink-faint">{new Date(e.time).toLocaleTimeString()}</span>
							</li>
						))}
						{events && events.length === 0 ? (
							<li className="text-sm text-ink-soft">No tracked events in the last 24h.</li>
						) : null}
					</ul>
				</div>
			</section>
		</main>
	)
}
