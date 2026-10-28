import { site } from '#/site.config'
import { Container } from './ui'

export function Footer() {
	return (
		<footer className="border-t border-line bg-card py-14">
			<Container className="grid gap-10 md:grid-cols-4">
				<div className="md:col-span-2">
					<div className="flex items-center gap-2.5 font-semibold">
						<img src="/images/logo.png" alt="" width={28} height={28} className="rounded-md" />
						{site.company.name}
					</div>
					<p className="mt-4 max-w-[42ch] text-sm leading-relaxed text-ink-soft">
						{site.company.tagline}. Serving the Denver metro since {site.company.founded}.
					</p>
					<p className="mt-4 text-sm text-ink-faint">{site.company.license}</p>
				</div>
				<div>
					<h3 className="text-sm font-semibold uppercase tracking-wide text-ink-faint">Contact</h3>
					<ul className="mt-4 space-y-2.5 text-[0.95rem]">
						<li>
							<a href={site.company.phoneHref} className="num hover:underline">
								{site.company.phone}
							</a>
						</li>
						<li>
							<a href={`mailto:${site.company.email}`} className="hover:underline">
								{site.company.email}
							</a>
						</li>
						<li className="text-ink-soft">{site.company.address}</li>
						<li className="text-ink-soft">{site.company.hours}</li>
					</ul>
				</div>
				<div>
					<h3 className="text-sm font-semibold uppercase tracking-wide text-ink-faint">Services</h3>
					<ul className="mt-4 space-y-2.5 text-[0.95rem]">
						{site.services.map((s) => (
							<li key={s.slug}>
								<a href="#services" className="hover:underline">
									{s.name}
								</a>
							</li>
						))}
						<li>
							<a href="#plans" className="hover:underline">
								Pricing
							</a>
						</li>
					</ul>
				</div>
			</Container>
			<Container>
				<p className="mt-10 border-t border-line pt-6 text-xs text-ink-faint">
					© {new Date().getFullYear()} {site.company.name}. Demo site: reviews, stats, and license are
					illustrative content for this template.
				</p>
			</Container>
		</footer>
	)
}
