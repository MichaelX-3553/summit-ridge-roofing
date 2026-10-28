import { createFileRoute } from '@tanstack/react-router'
import { Nav } from '#/components/Nav'
import { Hero } from '#/components/Hero'
import { Services } from '#/components/Services'
import { Process } from '#/components/Process'
import { Financing } from '#/components/Financing'
import { ServiceArea } from '#/components/ServiceArea'
import { Reviews } from '#/components/Reviews'
import { Faq } from '#/components/Faq'
import { PlanCards } from '#/components/PlanCards'
import { EstimateForm } from '#/components/EstimateForm'
import { Footer } from '#/components/Footer'

export const Route = createFileRoute('/')({ component: Page })

function Page() {
	return (
		<>
			<Nav />
			<main>
				<Hero />
				<Services />
				<Process />
				<Financing />
				<ServiceArea />
				<Reviews />
				<Faq />
				<PlanCards />
				<EstimateForm />
			</main>
			<Footer />
		</>
	)
}
