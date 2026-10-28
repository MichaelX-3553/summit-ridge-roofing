'use client'

import { useState } from 'react'
import { loadWhop } from '@whop/elements'
import {
	BrandingElement,
	Checkout,
	CheckoutElement,
	EmailElement,
	ExpressCheckoutElement,
	PaymentElement,
	Payments,
	WhopElements,
	usePayments,
	useWhop,
} from '@whop/elements-react'
import { site } from '#/site.config'
import { createPayment, createSetupIntent } from '#/lib/server/whop-api'
import { track, trackOnce } from '#/lib/track'

const RETURN_PATH = typeof window === 'undefined' ? '/' : `${window.location.pathname}`
const RETURN_URL = typeof window === 'undefined' ? undefined : `${window.location.origin}${window.location.pathname}`

type ChargeState = 'form' | 'processing' | 'requires_action' | 'succeeded' | 'failed'

function errorMessage(err: unknown): string {
	if (err && typeof err === 'object' && 'message' in err) return String((err as { message: unknown }).message)
	return 'Something went wrong. Try again or call the office.'
}

function CardChargeForm({ planId, onSucceeded }: { planId: string; onSucceeded: () => void }) {
	const payments = usePayments()
	const whop = useWhop()
	const [ready, setReady] = useState(false)
	const [state, setState] = useState<ChargeState>('form')
	const [error, setError] = useState<string | null>(null)

	async function pay() {
		if (!payments || !whop || state === 'processing') return
		setError(null)
		setState('processing')
		try {
			const { confirmationToken } = await payments.createConfirmationToken({})
			const result = await createPayment({ data: { planId, confirmationToken } })
			if (result.error) {
				setError(result.error)
				setState('failed')
				return
			}
			if (result.status === 'succeeded') {
				setState('succeeded')
				onSucceeded()
				return
			}
			if (result.status === 'requires_action' && result.client_secret) {
				setState('requires_action')
				const action = await whop.payments.handleNextAction({ clientSecret: result.client_secret })
				if (action.redirected) return
				if (action.status === 'succeeded') {
					setState('succeeded')
					onSucceeded()
					return
				}
				setError(action.lastPaymentError?.message ?? 'The payment could not be completed.')
				setState('failed')
				return
			}
			if (result.status === 'processing') {
				setState('succeeded')
				onSucceeded()
				return
			}
			setError('The payment could not be completed. Try a different method.')
			setState('failed')
		} catch (err) {
			setError(errorMessage(err))
			setState('failed')
		}
	}

	return (
		<div className="space-y-4">
			<EmailElement />
			<PaymentElement onChange={(event) => setReady(event.complete === true)} />
			<BrandingElement />
			<button
				type="button"
				onClick={pay}
				disabled={!ready || state === 'processing' || state === 'requires_action'}
				className="inline-flex h-12 w-full items-center justify-center rounded-full bg-clay-deep text-[0.95rem] font-semibold text-white transition-transform hover:bg-clay active:translate-y-px disabled:pointer-events-none disabled:opacity-50"
			>
				{state === 'processing' ? 'Processing…' : 'Pay now'}
			</button>
			{error ? (
				<p role="alert" className="text-sm font-medium text-clay-deep">
					{error}
				</p>
			) : null}
		</div>
	)
}

function SaveCardStep({ onSucceeded }: { onSucceeded: () => void }) {
	const payments = usePayments()
	const whop = useWhop()
	const [ready, setReady] = useState(false)
	const [busy, setBusy] = useState(false)
	const [error, setError] = useState<string | null>(null)

	async function save() {
		if (!payments || !whop || busy) return
		setError(null)
		setBusy(true)
		try {
			const { confirmationToken } = await payments.createConfirmationToken({})
			const intent = await createSetupIntent({ data: { confirmationToken } })
			if ('error' in intent) {
				setError(intent.error)
				setBusy(false)
				return
			}
			if (intent.status === 'succeeded') {
				onSucceeded()
				return
			}
			if (intent.status === 'requires_action' && intent.client_secret) {
				const action = await whop.payments.handleNextAction({ clientSecret: intent.client_secret })
				if (action.redirected) return
				if (action.status === 'succeeded') {
					onSucceeded()
					return
				}
				setError('The card could not be verified. Try a different one.')
				setBusy(false)
				return
			}
			if (intent.status === 'processing') {
				onSucceeded()
				return
			}
			setError('The card could not be saved. Try a different one.')
			setBusy(false)
		} catch (err) {
			setError(errorMessage(err))
			setBusy(false)
		}
	}

	return (
		<div className="space-y-4">
			<p className="text-sm leading-relaxed text-band-soft">
				One more step: save a card for the final balance. Nothing is charged now. After the build, your crew lead
				reviews the work with you and the remaining balance is billed to this card, or by a payment link if you
				prefer.
			</p>
			<EmailElement />
			<PaymentElement onChange={(event) => setReady(event.complete === true)} />
			<BrandingElement />
			<button
				type="button"
				onClick={save}
				disabled={!ready || busy}
				className="inline-flex h-12 w-full items-center justify-center rounded-full bg-white text-[0.95rem] font-semibold text-ink transition-transform active:translate-y-px disabled:pointer-events-none disabled:opacity-50"
			>
				{busy ? 'Saving…' : 'Save card for final balance'}
			</button>
			<button
				type="button"
				onClick={onSucceeded}
				className="w-full text-center text-sm font-medium text-white/60 underline underline-offset-4 hover:text-white/80"
			>
				Skip for now
			</button>
			{error ? (
				<p role="alert" className="text-sm font-medium text-white">
					{error}
				</p>
			) : null}
		</div>
	)
}

function WalletButtons({ planId, onSucceeded }: { planId: string; onSucceeded: () => void }) {
	return (
		<Checkout
			plan={planId}
			returnUrl={`${typeof window === 'undefined' ? '' : window.location.origin}${RETURN_PATH}`}
			onComplete={(completion) => {
				if (completion.result === 'payment' || completion.result === 'setup') onSucceeded()
			}}
		>
			<ExpressCheckoutElement layout="horizontal" />
		</Checkout>
	)
}

export function PlanCheckout({
	planId,
	kind,
}: {
	planId: string
	kind: 'charge' | 'deposit'
}) {
	const [chargeDone, setChargeDone] = useState(false)
	const [cardSaved, setCardSaved] = useState(false)

	return (
		<WhopElements elements={loadWhop()}>
			{!chargeDone ? (
				<div className="space-y-5">
					<WalletButtons planId={planId} onSucceeded={() => setChargeDone(true)} />
					<div className="flex items-center gap-4">
						<span className="h-px flex-1 bg-band-line" />
						<span className="text-xs font-medium uppercase tracking-wide text-white/50">or pay by card</span>
						<span className="h-px flex-1 bg-band-line" />
					</div>
					<Payments accountId={site.whop.accountId} plan={planId} returnUrl={RETURN_URL}>
						<CardChargeForm planId={planId} onSucceeded={() => setChargeDone(true)} />
					</Payments>
				</div>
			) : kind === 'deposit' && !cardSaved ? (
				<Payments accountId={site.whop.accountId} mode="setup" currency="usd" returnUrl={RETURN_URL}>
					<SaveCardStep onSucceeded={() => setCardSaved(true)} />
				</Payments>
			) : (
				<div className="rounded-xl border border-white/15 bg-white/5 p-5 text-center">
					<p className="font-semibold text-white">You're all set.</p>
					<p className="mt-1.5 text-sm text-white/70">
						{kind === 'deposit'
							? cardSaved
								? 'Deposit received and card saved. We will call you within one business day to schedule your build window.'
								: 'Deposit received. We will call you within one business day to schedule your build window.'
							: 'Receipt sent. We will call you within one business day to schedule.'}
					</p>
				</div>
			)}
		</WhopElements>
	)
}

export function HostedCheckout({
	configId,
	planId,
	promoCode,
}: {
	configId?: string
	planId?: string
	promoCode?: string
}) {
	const [done, setDone] = useState(false)
	const sessionProps = configId
		? { checkoutConfiguration: configId }
		: { plan: planId as string, ...(promoCode ? { promoCode } : {}) }
	return (
		<WhopElements elements={loadWhop()}>
			{!done ? (
				<Checkout
					{...sessionProps}
					returnUrl={`${typeof window === 'undefined' ? '' : window.location.origin}${RETURN_PATH}`}
					onComplete={(completion) => {
						if (completion.result === 'payment' || completion.result === 'setup') setDone(true)
					}}
				>
					<CheckoutElement />
				</Checkout>
			) : (
				<div className="rounded-xl border border-white/15 bg-white/5 p-5 text-center">
					<p className="font-semibold text-white">Checkout complete.</p>
					<p className="mt-1.5 text-sm text-white/70">The purchase went through.</p>
				</div>
			)}
		</WhopElements>
	)
}

export function openDepositTracking() {
	trackOnce('deposit_started:session', 'deposit_started', { value: site.plans.deposit.price, currency: 'USD' })
	track('view_content', { value: site.plans.deposit.price, currency: 'USD' })
}
