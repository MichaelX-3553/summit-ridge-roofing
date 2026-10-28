'use client'

import { useEffect, useRef } from 'react'
import { site } from '#/site.config'
import { trackOnce } from '#/lib/track'
import { Reveal } from './Reveal'
import { SectionHead } from './ui'

export function Services() {
	const sectionRef = useRef<HTMLElement>(null)

	useEffect(() => {
		const root = sectionRef.current
		if (!root) return
		const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-service]'))
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						const slug = (entry.target as HTMLElement).dataset.service
						if (slug) trackOnce(`service_viewed:${slug}`, 'service_viewed', { value: undefined })
						observer.unobserve(entry.target)
					}
				}
			},
			{ threshold: 0.4 },
		)
		for (const card of cards) observer.observe(card)
		return () => observer.disconnect()
	}, [])

	const [replacement, repair, inspection] = site.services

	return (
		<section ref={sectionRef} id="services" className="border-t border-line bg-card py-20 md:py-28">
			<div className="mx-auto w-full max-w-[1200px] px-5 md:px-8">
				<SectionHead
					title="Three ways we put hands on your roof"
					lede="Every visit ends with photos and a written summary. If a repair will genuinely outlast a replacement, we say so."
				/>
				<div className="mt-12 grid grid-flow-dense grid-cols-1 gap-5 md:grid-cols-3">
					<Reveal className="md:col-span-2 md:row-span-2">
						<article
							data-service={replacement.slug}
							className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-paper"
						>
							<div className="overflow-hidden">
								<img
									src={replacement.image}
									alt={replacement.alt}
									className="aspect-[16/9] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
									loading="lazy"
								/>
							</div>
							<div className="flex flex-1 flex-col p-7 md:p-9">
								<h3 className="text-2xl font-semibold">{replacement.name}</h3>
								<p className="mt-3 max-w-[58ch] leading-relaxed text-ink-soft">{replacement.summary}</p>
								<div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-7">
									<div>
										<p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Projects from</p>
										<p className="num mt-1 text-3xl font-bold">
											${replacement.startingAt.toLocaleString('en-US')}
										</p>
										<p className="mt-1 text-sm text-clay-deep">{replacement.financing}</p>
									</div>
									<a href="#estimate" className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold transition-colors hover:border-ink-faint">
										Get an Estimate
									</a>
								</div>
							</div>
						</article>
					</Reveal>
					<Reveal delay={0.08}>
						<article
							data-service={repair.slug}
							className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-paper"
						>
							<div className="overflow-hidden">
								<img
									src={repair.image}
									alt={repair.alt}
									className="aspect-[16/7] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
									loading="lazy"
								/>
							</div>
							<div className="flex flex-1 flex-col p-7">
								<h3 className="text-xl font-semibold">{repair.name}</h3>
								<p className="mt-2.5 text-[0.95rem] leading-relaxed text-ink-soft">{repair.summary}</p>
								<div className="mt-auto flex items-end justify-between gap-3 pt-5">
									<p className="num text-2xl font-bold">
										from ${repair.startingAt.toLocaleString('en-US')}
									</p>
									<a href="#estimate" className="text-sm font-semibold text-clay-deep hover:underline">
										Get an Estimate
									</a>
								</div>
							</div>
						</article>
					</Reveal>
					<Reveal delay={0.16}>
						<article
							data-service={inspection.slug}
							className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-paper"
						>
							<div className="overflow-hidden">
								<img
									src={inspection.image}
									alt={inspection.alt}
									className="aspect-[16/7] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
									loading="lazy"
								/>
							</div>
							<div className="flex flex-1 flex-col p-7">
								<h3 className="text-xl font-semibold">{inspection.name}</h3>
								<p className="mt-2.5 text-[0.95rem] leading-relaxed text-ink-soft">{inspection.summary}</p>
								<div className="mt-auto flex items-end justify-between gap-3 pt-5">
									<p className="num text-2xl font-bold">
										${inspection.startingAt.toLocaleString('en-US')} flat
									</p>
									<a href="#plans" className="text-sm font-semibold text-clay-deep hover:underline">
										Book the inspection
									</a>
								</div>
							</div>
						</article>
					</Reveal>
				</div>
			</div>
		</section>
	)
}
