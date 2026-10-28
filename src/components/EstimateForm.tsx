'use client'

import { useState } from 'react'
import { site } from '#/site.config'
import { submitEstimate } from '#/lib/server/whop-api'
import { track } from '#/lib/track'
import { Reveal } from './Reveal'

const services = [...site.services.map((s) => s.name), 'Something else / not sure']

type FormState = 'idle' | 'sending' | 'done' | 'error'

export function EstimateForm() {
	const [state, setState] = useState<FormState>('idle')
	const [errorMsg, setErrorMsg] = useState<string | null>(null)

	async function onSubmit(formData: FormData) {
		if (String(formData.get('company') || '').length > 0) {
			setState('done')
			return
		}
		setState('sending')
		setErrorMsg(null)
		const result = await submitEstimate({
			data: {
				name: String(formData.get('name') || ''),
				email: String(formData.get('email') || ''),
				phone: String(formData.get('phone') || ''),
				address: String(formData.get('address') || ''),
				service: String(formData.get('service') || ''),
				notes: String(formData.get('notes') || ''),
			},
		})
		if (result.ok) {
			track('estimate_requested', {
				value: site.plans.inspection.price,
				currency: 'USD',
				event_id: result.leadId,
				name: String(formData.get('name') || ''),
				email: String(formData.get('email') || ''),
			})
			setState('done')
		} else {
			setErrorMsg(result.error ?? 'Could not send. Please call the office.')
			setState('error')
		}
	}

	const inputClass =
		'h-12 w-full rounded-[10px] border border-line bg-card px-4 text-base placeholder:text-ink-faint'
	const labelClass = 'mb-2 block text-sm font-semibold'

	if (state === 'done') {
		return (
			<section id="estimate" className="border-t border-line py-20 md:py-28">
				<div className="mx-auto w-full max-w-[1200px] px-5 md:px-8">
					<div className="mx-auto max-w-xl rounded-2xl border border-line bg-card p-9 text-center">
						<h2 className="text-2xl font-semibold">Request received.</h2>
						<p className="mt-3 leading-relaxed text-ink-soft">
							Your details landed with the office. Expect a call or email within one business day, and a
							written estimate within 48 hours of the inspection visit.
						</p>
						<p className="mt-5 text-sm text-ink-faint">
							Urgent leak? Call {site.company.phone} and we will triage today.
						</p>
					</div>
				</div>
			</section>
		)
	}

	return (
		<section id="estimate" className="border-t border-line py-20 md:py-28">
			<div className="mx-auto grid w-full max-w-[1200px] gap-12 px-5 md:grid-cols-12 md:px-8">
				<Reveal className="md:col-span-5">
					<h2 className="text-3xl font-semibold tracking-tight md:text-[2.6rem] md:leading-[1.08]">
						Request an estimate
					</h2>
					<p className="mt-4 max-w-[46ch] leading-relaxed text-ink-soft">
						Tell us what's going on with the roof. A real person from the office follows up within one
						business day.
					</p>
					<dl className="mt-8 space-y-4 text-[0.95rem]">
						<div className="flex gap-3">
							<dt className="w-20 shrink-0 font-semibold">Call</dt>
							<dd>
								<a href={site.company.phoneHref} className="num font-medium hover:underline">
									{site.company.phone}
								</a>
							</dd>
						</div>
						<div className="flex gap-3">
							<dt className="w-20 shrink-0 font-semibold">Email</dt>
							<dd>
								<a href={`mailto:${site.company.email}`} className="font-medium hover:underline">
									{site.company.email}
								</a>
							</dd>
						</div>
						<div className="flex gap-3">
							<dt className="w-20 shrink-0 font-semibold">Office</dt>
							<dd className="text-ink-soft">
								{site.company.address}
								<br />
								{site.company.hours}
							</dd>
						</div>
					</dl>
				</Reveal>
				<Reveal delay={0.1} className="md:col-span-7">
					<form
						action={onSubmit}
						className="rounded-2xl border border-line bg-card p-7 md:p-9"
						noValidate={false}
					>
						<div className="grid gap-5 sm:grid-cols-2">
							<div>
								<label htmlFor="name" className={labelClass}>
									Full name
								</label>
								<input id="name" name="name" required autoComplete="name" placeholder="Jordan Alvarez" className={inputClass} />
							</div>
							<div>
								<label htmlFor="email" className={labelClass}>
									Email
								</label>
								<input id="email" name="email" type="email" required autoComplete="email" placeholder="jordan@example.com" className={inputClass} />
							</div>
							<div>
								<label htmlFor="phone" className={labelClass}>
									Phone
								</label>
								<input id="phone" name="phone" type="tel" required autoComplete="tel" placeholder="(720) 555-0134" className={inputClass} />
							</div>
							<div>
								<label htmlFor="address" className={labelClass}>
									Property address
								</label>
								<input id="address" name="address" required autoComplete="street-address" placeholder="1428 S Pearl St, Denver" className={inputClass} />
							</div>
							<div className="sm:col-span-2">
								<label htmlFor="service" className={labelClass}>
									What do you need?
								</label>
								<select id="service" name="service" defaultValue={services[0]} className={inputClass}>
									{services.map((s) => (
										<option key={s} value={s}>
											{s}
										</option>
									))}
								</select>
							</div>
							<div className="sm:col-span-2">
								<label htmlFor="notes" className={labelClass}>
									Anything we should know? <span className="font-normal text-ink-faint">(optional)</span>
								</label>
								<textarea
									id="notes"
									name="notes"
									rows={4}
									placeholder="Water stain on the ceiling after the last storm. Roof is about 18 years old."
									className="w-full rounded-[10px] border border-line bg-card px-4 py-3 text-base placeholder:text-ink-faint"
								/>
							</div>
						</div>
						<input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
						{state === 'error' && errorMsg ? (
							<p role="alert" className="mt-5 text-sm font-medium text-clay-deep">
								{errorMsg}
							</p>
						) : null}
						<button
							type="submit"
							disabled={state === 'sending'}
							className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-full bg-clay-deep text-[0.95rem] font-semibold text-white transition-transform hover:bg-clay active:translate-y-px disabled:pointer-events-none disabled:opacity-60 sm:w-auto sm:px-10"
						>
							{state === 'sending' ? 'Sending…' : 'Send request'}
						</button>
						<p className="mt-4 text-sm text-ink-faint">
							Your request lands directly in our Whop inbox. No spam, no resale, ever.
						</p>
					</form>
				</Reveal>
			</div>
		</section>
	)
}
