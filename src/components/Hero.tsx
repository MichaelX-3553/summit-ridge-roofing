'use client'

import { motion, useReducedMotion } from 'motion/react'
import { site } from '#/site.config'
import { Container, btnGhost, btnPrimary } from './ui'

const ease = [0.16, 1, 0.3, 1] as const

export function Hero() {
	const reduce = useReducedMotion()
	const up = (delay: number) => ({
		initial: reduce ? false : ({ opacity: 0, y: 28 } as const),
		animate: { opacity: 1, y: 0 },
		transition: { duration: 0.7, delay, ease },
	})

	return (
		<section id="top" className="relative overflow-hidden">
			<Container className="grid items-center gap-10 pb-16 pt-14 md:grid-cols-12 md:gap-8 md:pb-24 md:pt-20">
				<div className="md:col-span-7">
					<motion.p
						{...up(0)}
						className="num text-[0.8rem] font-medium uppercase tracking-[0.14em] text-clay-deep"
					>
						Denver, Colorado
					</motion.p>
					<motion.h1
						{...up(0.08)}
						className="mt-4 max-w-5xl text-[clamp(2.6rem,4.6vw,4.25rem)] font-semibold leading-[1.05]"
					>
						Your roof, done right the first time.
					</motion.h1>
					<motion.p {...up(0.16)} className="mt-6 max-w-[52ch] text-lg leading-relaxed text-ink-soft">
						Repair, replacement, and honest 26-point inspections from a crew that photographs everything and
						writes it down.
					</motion.p>
					<motion.div {...up(0.24)} className="mt-8 flex flex-wrap items-center gap-4">
						<a href="#estimate" className={btnPrimary}>
							Get an Estimate
						</a>
						<a href={site.company.phoneHref} className={btnGhost}>
							Call {site.company.phone}
						</a>
					</motion.div>
				</div>
				<motion.div
					initial={reduce ? false : { opacity: 0, scale: 0.97 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.9, delay: 0.15, ease }}
					className="md:col-span-5"
				>
					<img
						src="/images/hero-home.png"
						alt="Craftsman home with a new architectural shingle roof at golden hour"
						className="aspect-[4/3] w-full rounded-2xl object-cover shadow-[0_24px_60px_-24px_rgba(22,25,30,0.35)]"
						fetchPriority="high"
					/>
				</motion.div>
			</Container>
		</section>
	)
}
