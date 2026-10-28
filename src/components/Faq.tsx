import { site } from '#/site.config'
import { Reveal } from './Reveal'
import { SectionHead } from './ui'

export function Faq() {
	return (
		<section className="border-t border-line py-20 md:py-28">
			<div className="mx-auto w-full max-w-[1200px] px-5 md:px-8">
				<SectionHead title="Questions we get every week" />
				<Reveal className="mt-10 max-w-3xl">
					<div className="divide-y divide-line rounded-2xl border border-line bg-card">
						{site.faq.map((item) => (
							<details key={item.q} className="group px-6 py-5 md:px-7">
								<summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
									{item.q}
									<span
										aria-hidden
										className="shrink-0 text-xl leading-none text-clay-deep transition-transform duration-200 group-open:rotate-45"
									>
										+
									</span>
								</summary>
								<p className="mt-3 max-w-[68ch] leading-relaxed text-ink-soft">{item.a}</p>
							</details>
						))}
					</div>
				</Reveal>
			</div>
		</section>
	)
}
