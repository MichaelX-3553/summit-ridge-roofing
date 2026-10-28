'use client'

import { useState } from 'react'
import { MapPin, SealCheck, WarningCircle } from '@phosphor-icons/react'
import { site } from '#/site.config'
import { Reveal } from './Reveal'

type Verdict = 'idle' | 'yes' | 'no'

export function ServiceArea() {
	const [zip, setZip] = useState('')
	const [verdict, setVerdict] = useState<Verdict>('idle')

	function check(value: string) {
		const clean = value.replace(/\D/g, '').slice(0, 5)
		setZip(clean)
		if (clean.length < 5) {
			setVerdict('idle')
			return
		}
		setVerdict((site.serviceArea.zips as readonly string[]).includes(clean) ? 'yes' : 'no')
	}

	return (
		<section id="service-area" className="border-t border-line py-20 md:py-28">
			<div className="mx-auto grid w-full max-w-[1200px] items-center gap-12 px-5 md:grid-cols-2 md:px-8">
				<Reveal className="order-2 md:order-1">
					<img
						src="/images/crew.png"
						alt="Summit Ridge crew in front of their truck and a finished roof"
						className="aspect-[4/3] w-full rounded-2xl border border-line object-cover"
						loading="lazy"
					/>
				</Reveal>
				<Reveal delay={0.08} className="order-1 md:order-2">
					<h2 className="text-3xl font-semibold tracking-tight md:text-[2.6rem] md:leading-[1.08]">
						Are we on your street already?
					</h2>
					<p className="mt-4 max-w-[52ch] leading-relaxed text-ink-soft">
						We run crews across the Denver metro every day. Drop in your zip code for a straight answer.
					</p>
					<form
						className="mt-7 flex max-w-md flex-wrap items-center gap-3"
						onSubmit={(e) => {
							e.preventDefault()
							check(zip)
						}}
					>
						<label htmlFor="zip" className="sr-only">
							ZIP code
						</label>
						<input
							id="zip"
							inputMode="numeric"
							autoComplete="postal-code"
							placeholder="80211"
							value={zip}
							onChange={(e) => check(e.target.value)}
							className="num h-12 w-40 rounded-[10px] border border-line bg-card px-4 text-base tracking-[0.08em] placeholder:text-ink-faint"
						/>
						<button
							type="submit"
							className="h-12 rounded-full bg-ink px-6 text-[0.95rem] font-semibold text-white transition-transform active:translate-y-px"
						>
							Check my area
						</button>
					</form>
					<div aria-live="polite" className="mt-4 min-h-14">
						{verdict === 'yes' ? (
							<p className="flex items-center gap-2.5 font-semibold text-clay-deep">
								<SealCheck weight="fill" className="size-6" />
								Yes. {zip} is in our daily service area.
							</p>
						) : null}
						{verdict === 'no' ? (
							<p className="flex items-start gap-2.5 font-medium text-ink-soft">
								<WarningCircle weight="fill" className="mt-0.5 size-6 shrink-0 text-ink-faint" />
								We don't run regular crews to {zip} yet. Call the office; large projects can still be scheduled.
							</p>
						) : null}
					</div>
					<div className="mt-6 flex flex-wrap gap-2">
						{site.serviceArea.cities.map((c) => (
							<span
								key={c}
								className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3.5 py-1.5 text-sm text-ink-soft"
							>
								<MapPin className="size-3.5" />
								{c}
							</span>
						))}
					</div>
				</Reveal>
			</div>
		</section>
	)
}
