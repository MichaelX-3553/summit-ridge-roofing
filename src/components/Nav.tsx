import { site } from '#/site.config'
import { Container, btnPrimary } from './ui'

const links = [
	{ href: '#services', label: 'Services' },
	{ href: '#financing', label: 'Financing' },
	{ href: '#service-area', label: 'Service Area' },
	{ href: '#reviews', label: 'Reviews' },
]

export function Nav() {
	return (
		<header className="sticky top-0 z-40 border-b border-line/80 bg-paper/90 backdrop-blur-md">
			<Container className="flex h-16 items-center justify-between gap-6">
				<a href="#top" className="flex items-center gap-2.5 font-semibold tracking-tight">
					<img src="/images/logo.png" alt="" width={30} height={30} className="rounded-md" />
					<span>{site.company.name}</span>
				</a>
				<nav className="hidden items-center gap-7 text-[0.92rem] font-medium text-ink-soft lg:flex" aria-label="Primary">
					{links.map((l) => (
						<a key={l.href} href={l.href} className="transition-colors hover:text-ink">
							{l.label}
						</a>
					))}
				</nav>
				<div className="flex items-center gap-3">
					<a href={site.company.phoneHref} className="num hidden text-[0.9rem] font-semibold text-ink md:block">
						{site.company.phone}
					</a>
					<a href="#estimate" className={`${btnPrimary} !min-h-10 !px-5 !text-sm`}>
						Get an Estimate
					</a>
				</div>
			</Container>
		</header>
	)
}
