'use client'

import { CheckCircle } from '@phosphor-icons/react'
import { site } from '#/site.config'
import { Reveal } from './Reveal'
import { btnPrimary } from './ui'

export function Financing() {
	return (
		<section id="financing" className="border-t border-line bg-card py-20 md:py-28">
			<div className="mx-auto grid w-full max-w-[1200px] items-center gap-12 px-5 md:grid-cols-2 md:px-8">
				<Reveal>
					<h2 className="text-3xl font-semibold tracking-tight md:text-[2.6rem] md:leading-[1.08]">
						{site.financing.headline}
					</h2>
					<p className="mt-5 max-w-[56ch] text-[1.05rem] leading-relaxed text-ink-soft">{site.financing.body}</p>
					<div className="mt-8 flex flex-wrap items-center gap-4">
						<a href="#plans" className={btnPrimary}>
							See payment options
						</a>
						<p className="text-sm text-ink-faint">Monthly plans appear at checkout when approved.</p>
					</div>
				</Reveal>
				<Reveal delay={0.1}>
					<div className="rounded-2xl border border-line bg-paper p-7 md:p-9">
						<ul className="space-y-6">
							{site.financing.points.map((p) => (
								<li key={p.title} className="flex gap-4">
									<CheckCircle weight="fill" className="mt-0.5 size-6 shrink-0 text-clay-deep" />
									<div>
										<h3 className="font-semibold">{p.title}</h3>
										<p className="mt-1 text-[0.95rem] leading-relaxed text-ink-soft">{p.body}</p>
									</div>
								</li>
							))}
						</ul>
						<p className="mt-8 border-t border-line pt-6 text-sm leading-relaxed text-ink-faint">
							Financing is offered through Whop's checkout by third-party providers and depends on approval.
							Subject to eligibility; terms shown before you pay.
						</p>
					</div>
				</Reveal>
			</div>
		</section>
	)
}
