'use client'

import { motion, useReducedMotion } from 'motion/react'
import { site } from '#/site.config'
import { Container, SectionHead } from './ui'

export function Process() {
	const reduce = useReducedMotion()
	return (
		<section className="border-t border-line py-20 md:py-28">
			<Container>
				<SectionHead
					title="What working with us looks like"
					lede="Four steps, no surprises. You always know which step you are on and what happens next."
				/>
				<div className="mt-12 grid grid-flow-dense grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
					{site.process.map((step, i) => (
						<motion.div
							key={step.title}
							initial={reduce ? false : { opacity: 0, y: 24 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 0.3 }}
							transition={{ duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
							className="rounded-2xl border border-line bg-card p-7"
						>
							<p className="num text-[0.8rem] font-bold text-clay-deep">{String(i + 1).padStart(2, '0')}</p>
							<h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
							<p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">{step.body}</p>
						</motion.div>
					))}
				</div>
			</Container>
		</section>
	)
}
