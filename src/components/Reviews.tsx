'use client'

import { Star } from '@phosphor-icons/react'
import { site } from '#/site.config'
import { Reveal } from './Reveal'
import { SectionHead } from './ui'

export function Reviews() {
	return (
		<section id="reviews" className="border-t border-line bg-card py-20 md:py-28">
			<div className="mx-auto w-full max-w-[1200px] px-5 md:px-8">
				<SectionHead
					title="Neighbors who already made the call"
					lede="Unedited quotes from the last two seasons. Full reviews live on our Whop page and Google."
				/>
				<Reveal className="mt-12">
					<div className="grid grid-flow-dense grid-cols-1 gap-5 md:grid-cols-3">
						{site.reviews.map((r) => (
							<figure key={r.name} className="flex h-full flex-col rounded-2xl border border-line bg-paper p-7">
								<div className="flex gap-1 text-clay-deep" aria-label="Five star review">
									{[0, 1, 2, 3, 4].map((i) => (
										<Star key={i} weight="fill" className="size-4" />
									))}
								</div>
								<blockquote className="mt-4 flex-1 text-[0.98rem] leading-relaxed text-ink">
									"{r.quote}"
								</blockquote>
								<figcaption className="mt-6 border-t border-line pt-4">
									<p className="font-semibold">{r.name}</p>
									<p className="text-sm text-ink-faint">{r.detail}</p>
								</figcaption>
							</figure>
						))}
					</div>
				</Reveal>
				<Reveal delay={0.1} className="mt-14">
					<dl className="grid grid-cols-2 gap-x-6 gap-y-8 border-t border-line pt-10 lg:grid-cols-4">
						{site.stats.map((s) => (
							<div key={s.label}>
								<dt className="order-2 mt-1.5 text-sm leading-snug text-ink-soft">{s.label}</dt>
								<dd className="num order-1 text-3xl font-bold md:text-4xl">{s.value}</dd>
							</div>
						))}
					</dl>
				</Reveal>
			</div>
		</section>
	)
}
