import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import appCss from '../styles.css?url'
import { site } from '#/site.config'

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: 'utf-8' },
			{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
			{ title: `${site.company.name} | ${site.company.tagline}` },
			{
				name: 'description',
				content:
					'Repair, replacement, and 26-point inspections for Denver homes. Written photo reports, flat-rate tune-ups, financing at checkout, and a 10-year workmanship warranty.',
			},
		],
		links: [{ rel: 'stylesheet', href: appCss }, { rel: 'icon', href: '/images/logo.png' }],
	}),
	shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	)
}
