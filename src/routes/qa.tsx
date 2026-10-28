'use client'

import { useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { site } from '#/site.config'
import { HostedCheckout, PlanCheckout, openDepositTracking } from '#/components/Plans'

export const Route = createFileRoute('/qa')({ component: QaPage })

function QaPage() {
	useEffect(() => {
		openDepositTracking()
	}, [])

	return (
		<main className="mx-auto min-h-dvh max-w-md bg-band px-5 py-16 text-white">
			<h1 className="text-xl font-semibold">Checkout verification</h1>
			<p className="mt-2 text-sm text-white/60">
				Internal: one-dollar run of the full deposit flow. The embedded checkout below is Whop's complete
				checkout element; apply the promo code <span className="num font-semibold">{site.plans.qaDeposit.promoCode}</span> inside
				it to zero the total. If it still asks for a card, use the card form further down.
			</p>
			<div className="mt-6 rounded-2xl border border-band-line bg-band-soft p-6">
				<p className="text-sm font-medium text-white/70">{site.plans.qaDeposit.label}</p>
				<p className="num mt-1 text-3xl font-bold">
					$1.00 <span className="text-sm font-medium text-white/50">(promo code zeroes this)</span>
				</p>
				<div className="mt-5">
					<HostedCheckout configId={site.plans.qaDeposit.checkoutConfigId} />
				</div>
			</div>
			<div className="mt-6 rounded-2xl border border-band-line bg-band-soft p-6">
				<p className="text-sm font-medium text-white/70">Card form flow (pay + save card)</p>
				<div className="mt-4">
					<PlanCheckout planId={site.plans.qaDeposit.planId} kind="deposit" />
				</div>
			</div>
			<p className="mt-6 text-sm text-white/50">
				After paying, open <span className="num">/billing?office=…</span> to invoice the final balance against
				the saved card.
			</p>
		</main>
	)
}
