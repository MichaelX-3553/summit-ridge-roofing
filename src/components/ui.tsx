import type { ReactNode } from 'react'

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
	return <div className={`mx-auto w-full max-w-[1200px] px-5 md:px-8 ${className}`}>{children}</div>
}

export function SectionHead({
	title,
	lede,
	align = 'left',
}: {
	title: string
	lede?: string
	align?: 'left' | 'center'
}) {
	return (
		<div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
			<h2 className="text-3xl font-semibold tracking-tight md:text-[2.6rem] md:leading-[1.08]">{title}</h2>
			{lede ? <p className="mt-4 max-w-[62ch] text-[1.05rem] leading-relaxed text-ink-soft">{lede}</p> : null}
		</div>
	)
}

export const btnPrimary =
	'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-clay-deep px-7 text-[0.95rem] font-semibold text-white transition-transform duration-150 ease-out hover:bg-clay active:translate-y-px disabled:pointer-events-none disabled:opacity-50'

export const btnGhost =
	'inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-line bg-white px-6 text-[0.95rem] font-semibold text-ink transition-colors duration-150 hover:border-ink-faint active:translate-y-px'
