export const site = {
	company: {
		name: 'Summit Ridge Roofing',
		shortName: 'Summit Ridge',
		tagline: 'Denver roofing done right the first time',
		phone: '(720) 555-0182',
		phoneHref: 'tel:+17205550182',
		email: 'estimates@summitridgeroofing.com',
		address: '4110 Lipan St, Denver, CO 80211',
		hours: 'Mon to Sat, 7am to 6pm',
		license: 'CO Roofing License #R-88412 (demo)',
		founded: 2011,
	},
	whop: {
		accountId: 'biz_2D2RasZvbT06P2',
		ownerUserId: 'user_0b2SNYETRYGJl',
	},
	plans: {
		inspection: { planId: 'plan_K6Nkg4sL1m3uJ', price: 149, label: '26-point inspection' },
		deposit: { planId: 'plan_OzCEmc2watLfF', price: 500, label: 'Replacement deposit', promoCode: 'SUMMITDEMO' },
		tuneUp: { planId: 'plan_KKBcyLAWY529Y', price: 349, label: 'Flat-rate tune-up' },
		qaDeposit: {
			planId: 'plan_Lt4QAyQ7rdeDM',
			price: 1,
			label: 'QA verification',
			checkoutConfigId: 'ch_XTOQfGp9TDvrkkQ',
			promoCode: 'SUMMITQA',
		},
	},
	services: [
		{
			slug: 'replacement',
			name: 'Roof Replacement',
			summary:
				'A full tear-off and rebuild with architectural shingles, new underlayment, and upgraded flashing. Most homes are done in two days.',
			image: '/images/svc-replacement.png',
			alt: 'Crew installing architectural shingles on a steep residential roof',
			startingAt: 11500,
			financing: 'as low as $129/mo',
		},
		{
			slug: 'repair',
			name: 'Roof Repair',
			summary:
				'Leaks, lifted shingles, damaged flashing, storm damage. We find the actual cause, fix it, and photograph the repair.',
			image: '/images/svc-repair.png',
			alt: 'Roofer sealing lifted shingles and flashing around a pipe boot',
			startingAt: 385,
			financing: null,
		},
		{
			slug: 'inspection',
			name: 'Roof Inspection',
			summary:
				'A 26-point walk of roof and attic with a written photo report inside 24 hours. The report is what insurance adjusters actually want to see.',
			image: '/images/svc-inspection.png',
			alt: 'Inspector examining chimney flashing on an asphalt shingle roof',
			startingAt: 149,
			financing: null,
		},
	],
	serviceArea: {
		homeCity: 'Denver',
		zips: [
			'80202', '80203', '80204', '80205', '80206', '80207', '80209', '80210', '80211', '80212',
			'80214', '80215', '80219', '80220', '80222', '80223', '80226', '80227', '80228', '80230',
			'80232', '80236', '80239', '80246', '80247', '80249', '80014', '80022', '80033', '80110',
			'80123', '80260',
		],
		cities: [
			'Denver', 'Aurora', 'Lakewood', 'Arvada', 'Westminster', 'Wheat Ridge', 'Englewood',
			'Littleton', 'Commerce City', 'Thornton',
		],
	},
	financing: {
		headline: 'Replace the roof now. Spread out the cost.',
		body: 'Approved customers can split a replacement into monthly payments at checkout through Whop, with plans from providers like Klarna and Afterpay. You see the exact monthly number before you commit to anything.',
		points: [
			{ title: 'Soft credit check', body: 'Pre-qualification does not affect your credit score.' },
			{ title: '$0 down options', body: 'The $500 deposit can be financed with the project.' },
			{ title: 'Terms up to 36 months', body: 'Pick the monthly number that fits your budget.' },
		],
	},
	reviews: [
		{
			quote:
				'Hail took out our roof in June. They had the insurance report done in two days and the new roof on in one.',
			name: 'Marcus Reyes',
			detail: 'Replacement, Wash Park',
		},
		{
			quote:
				'Three other companies told me I needed a full replacement. Their inspection found one bad flashing boot. Repair was under $500 and the leak is gone.',
			name: 'Dana Whitfield',
			detail: 'Repair, Highlands',
		},
		{
			quote:
				'The written report with photos is what sold me. I handed it straight to my adjuster and the claim covered almost everything.',
			name: 'Priya Natarajan',
			detail: 'Inspection, Aurora',
		},
	],
	stats: [
		{ value: '2,300+', label: 'roofs completed since 2011' },
		{ value: '4.9', label: 'average rating across 612 reviews' },
		{ value: '10 yr', label: 'workmanship warranty on replacements' },
		{ value: '48 hr', label: 'typical written estimate turnaround' },
	],
	process: [
		{
			title: 'Inspect',
			body: 'A 26-point walk of roof and attic, on your schedule. Photos of everything we find.',
		},
		{
			title: 'Quote',
			body: 'A written, line-item estimate within 48 hours. No pressure, no expiry games.',
		},
		{
			title: 'Build',
			body: 'A two-day install in most cases, with a dedicated crew lead and daily photo updates.',
		},
		{
			title: 'Stand behind it',
			body: '10-year workmanship warranty on replacements. If something is wrong, we come back.',
		},
	],
	faq: [
		{
			q: 'How do I know if I need a repair or a replacement?',
			a: 'The honest answer comes from the inspection. Age, curling shingles, granule loss in the gutters, and repeated leaks in the same spot all push toward replacement. Everything else is usually a repair, and we will tell you which one it is in writing.',
		},
		{
			q: 'Do you work with insurance claims?',
			a: 'Yes. Storm and hail damage is most of our spring and summer work. We document the damage the way adjusters expect to see it and meet them on site when needed.',
		},
		{
			q: 'How does the deposit work?',
			a: 'Replacements are scheduled with a $500 refundable deposit, charged when you book your build window. We order materials with it. The remaining balance is invoiced only after you walk the finished roof with your crew lead.',
		},
		{
			q: 'What if it rains during the job?',
			a: 'We never leave an open roof. If weather moves in, the site is tarped and watertight the same day, and the schedule shifts with your approval.',
		},
	],
} as const

export type Site = typeof site
