'use client'

import { useState } from 'react'
import { site } from '#/site.config'
import { HostedCheckout, PlanCheckout, openDepositTracking } from './Plans'
import { Reveal } from './Reveal'

const cardBase = 'rounded-2xl border bg-band-soft p-7 md:p-8'

const details: Record<'inspection' | 'tuneUp' | 'deposit', string[]> = {
	inspection: [
		'26-point roof and attic walk',
		'Written photo report within 24 hours',
		'Fee credited toward any repair or replacement',
	],
	tuneUp: [
		'Reseal lifted shingles and flashing',
		'Valley and gutter clear-out',
		'One-year workmanship warranty',
	],
	deposit: [
		'Reserves your build window',
		'Refundable before materials are ordered',
		'Final balance billed only after your walkthrough',
	],
}

function PlanCard({
	kind,
	planId,
	price,
	name,
	cta,
	featured = false,
}: {
	kind: 'inspection' | 'tuneUp' | 'deposit'
	planId: string
	price: number
	name: string
	cta: string
	featured?: boolean
}) {
	const [open, setOpen] = useState(false)

	function start() {
		if (kind === 'deposit') openDepositTracking()
		setOpen(true)
	}

	return (
		<div className={`${cardBase} ${featured ? 'border-clay/60' : 'border-band-line'} flex flex-col`}>
			<div className="flex items-start justify-between gap-4">
				<h3 className="text-xl font-semibold text-white">{name}</h3>
				{featured ? (
					<span className="rounded-full bg-clay-deep px-3 py-1 text-xs font-semibold text-white">
						Most projects
					</span>
				) : null}
			</div>
			<p className="num mt-4 text-4xl font-bold text-white">
				${price.toLocaleString('en-US')}
				<span className="ml-1.5 text-sm font-medium text-white/50">one-time</span>
			</p>
			<ul className="mt-6 flex-1 space-y-2.5 text-[0.95rem] leading-relaxed text-white/70">
				{details[kind].map((d) => (
					<li key={d} className="flex gap-2.5">
						<span aria-hidden className="mt-[0.55rem] size-1.5 shrink-0 rounded-full bg-clay" />
						{d}
					</li>
				))}
			</ul>
			<div className="mt-7">
				{!open ? (
					<button
						type="button"
						onClick={start}
						className={`inline-flex h-12 w-full items-center justify-center rounded-full text-[0.95rem] font-semibold transition-transform active:translate-y-px ${
							featured
								? 'bg-clay-deep text-white hover:bg-clay'
								: 'border border-band-line bg-transparent text-white hover:border-white/40'
						}`}
					>
						{cta}
					</button>
				) : (
					<div className="rounded-xl border border-band-line bg-band/80 p-5">
						{kind === 'deposit' ? (
							<HostedCheckout planId={planId} promoCode={site.plans.deposit.promoCode} />
						) : (
							<PlanCheckout planId={planId} kind="charge" />
						)}
					</div>
				)}
			</div>
		</div>
	)
}

export function PlanCards() {
	return (
		<section id="plans" className="bg-band py-20 text-white md:py-28">
			<div className="mx-auto w-full max-w-[1200px] px-5 md:px-8">
				<Reveal>
					<h2 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-[2.6rem] md:leading-[1.08]">
						Straight prices. Pay on your terms.
					</h2>
					<p className="mt-4 max-w-[60ch] text-[1.05rem] leading-relaxed text-white/65">
						Book the inspection or a flat-rate tune-up today, or lock in a replacement build window with the
						deposit. Monthly financing shows up at checkout when approved.
					</p>
				</Reveal>
				<div className="mt-12 grid grid-flow-dense grid-cols-1 gap-5 lg:grid-cols-3">
					<Reveal>
						<PlanCard
							kind="inspection"
							planId={site.plans.inspection.planId}
							price={site.plans.inspection.price}
							name="Roof Inspection"
							cta="Book the inspection"
						/>
					</Reveal>
					<Reveal delay={0.08}>
						<PlanCard
							kind="deposit"
							planId={site.plans.deposit.planId}
							price={site.plans.deposit.price}
							name="Replacement Deposit"
							cta="Start my replacement"
							featured
						/>
					</Reveal>
					<Reveal delay={0.16}>
						<PlanCard
							kind="tuneUp"
							planId={site.plans.tuneUp.planId}
							price={site.plans.tuneUp.price}
							name="Roof Tune-Up"
							cta="Book the tune-up"
						/>
					</Reveal>
				</div>
				<Reveal delay={0.2}>
					<p className="mt-8 text-sm text-white/45">
						Checkout is processed entirely by Whop. Card details never touch our servers, and Apple Pay and
						Google Pay appear automatically on supported devices.
					</p>
				</Reveal>
			</div>
		</section>
	)
}
