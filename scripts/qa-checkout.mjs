import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const BASE = process.env.QA_URL ?? 'https://summitridge-roofpros.whop.site/'
const OUT = new URL('../shots/', import.meta.url)
mkdirSync(OUT, { recursive: true })

const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a)

const browser = await puppeteer.launch({
	executablePath: EDGE,
	headless: false,
	defaultViewport: { width: 1440, height: 1100 },
	args: ['--no-sandbox', '--window-size=1460,1140', '--window-position=40,40'],
})
const page = await browser.newPage()
page.on('pageerror', (e) => log('[pageerror]', String(e).slice(0, 200)))
page.on('response', async (res) => {
	const url = res.url()
	if (/_server|api\.whop\.com\/api\/v1\/(payments|setup_intents|leads|users)/.test(url)) {
		let body = ''
		try {
			body = (await res.text()).slice(0, 260)
		} catch {}
		log('[net]', res.status(), url.slice(0, 95), body)
	}
})
await page.setViewport({ width: 1440, height: 1200 })
await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 120000 })
await new Promise((r) => setTimeout(r, 5000))

await page.evaluate(() => {
	const btn = [...document.querySelectorAll('button')].find((b) => /book the inspection/i.test(b.textContent ?? ''))
	btn?.click()
})
log('opened checkout card')

// email
let emailDone = false
for (let i = 0; i < 10 && !emailDone; i++) {
	const f = page.frames().find((fr) => fr.url().includes('payments/email'))
	if (f) {
		try {
			await f.waitForSelector('input', { timeout: 5000 })
			await f.type('input', 'qa.marcus.reyes@example.com', { delay: 15 })
			emailDone = true
			log('email filled')
		} catch {}
	}
	if (!emailDone) await new Promise((r) => setTimeout(r, 2000))
}

// select the Card payment method, then fill billing + card fields wherever they mount
const paymentFrame = () => page.frames().find((fr) => fr.url().includes('payments/payment'))

let cardFilled = false
for (let attempt = 0; attempt < 14 && !cardFilled; attempt++) {
	const pf = paymentFrame()
	if (pf) {
		try {
			if (attempt === 0) {
				await pf.evaluate(() => {
					const card = [...document.querySelectorAll('button,[role="radio"]')].find(
						(b) => (b.textContent ?? '').trim() === 'Card',
					)
					card?.click()
				})
				log('clicked Card method')
				await new Promise((r) => setTimeout(r, 4000))
			}
			// search all frames for card fields (they may mount in a nested Stripe iframe)
			for (const fr of page.frames()) {
				const inputs = await fr
					.evaluate(() =>
						[...document.querySelectorAll('input,select')]
							.map((i) => ({
								name: i.name,
								aria: i.getAttribute('aria-label'),
								ph: i.placeholder,
								ac: i.getAttribute('autocomplete'),
							}))
							.filter((x) => x.name || x.aria || x.ph),
					)
					.catch(() => [])
				const hasCard = inputs.some((i) => /card number|cardnumber/i.test(`${i.aria} ${i.ac} ${i.name}`))
				if (!hasCard) continue
				log(`attempt ${attempt}: card fields in ${fr.url().slice(0, 70)} (${inputs.length} inputs)`)
				const sel = (m) => {
					const t = inputs.find(m)
					return t ? (t.name ? `[name="${t.name}"]` : null) : null
				}
				async function put(match, value) {
					const s = sel(match)
					if (!s) {
						log('MISS', value)
						return
					}
					await fr.click(s)
					await fr.type(s, value, { delay: 10 })
					log('filled', value)
				}
				await put((i) => /card number|cardnumber/i.test(`${i.aria} ${i.ac} ${i.name}`), '4242 4242 4242 4242')
				await put((i) => /expir/i.test(`${i.aria} ${i.ac} ${i.name}`), '12 / 34')
				await put((i) => /cvc|security|cvv/i.test(`${i.aria} ${i.ac} ${i.name}`), '123')
				// billing fields may live in the payment iframe
				const billFrame = paymentFrame()
				if (billFrame && fr !== billFrame) {
					const bInputs = await billFrame.evaluate(() =>
						[...document.querySelectorAll('input,select')].map((i) => ({ name: i.name })),
					)
					const bsel = (m) => {
						const t = bInputs.find(m)
						return t ? `[name="${t.name}"]` : null
					}
					if (bsel((i) => i.name === 'name')) {
						await billFrame.click('[name="name"]')
						await billFrame.type('[name="name"]', 'Marcus Reyes', { delay: 8 })
					}
					if (bsel((i) => i.name === 'line1')) {
						await billFrame.click('[name="line1"]')
						await billFrame.type('[name="line1"]', '1428 S Pearl St', { delay: 8 })
					}
					if (bsel((i) => i.name === 'city')) {
						await billFrame.click('[name="city"]')
						await billFrame.type('[name="city"]', 'Denver', { delay: 8 })
					}
					if (bsel((i) => i.name === 'postal_code')) {
						await billFrame.click('[name="postal_code"]')
						await billFrame.type('[name="postal_code"]', '80211', { delay: 8 })
					}
					const countrySel = bsel((i) => i.name === 'country')
					if (countrySel) {
						await billFrame.select(countrySel, 'US')
					}
					log('billing filled')
				}
				cardFilled = true
				break
			}
			if (!cardFilled && attempt > 0) {
				// maybe billing-only frame visible; log status every few attempts
				if (attempt % 4 === 0) log(`attempt ${attempt}: no card fields yet`)
			}
		} catch (e) {
			log('attempt err', String(e).slice(0, 140))
		}
	}
	if (!cardFilled) await new Promise((r) => setTimeout(r, 2500))
}

await new Promise((r) => setTimeout(r, 1500))
await page.screenshot({ path: new URL('qa-card-filled.png', OUT).pathname.replace(/^\/(\w:)/, '$1') })

let payState = null
for (let i = 0; i < 10; i++) {
	payState = await page.evaluate(() => {
		const btn = [...document.querySelectorAll('button')].find((b) => /pay now/i.test(b.textContent ?? ''))
		return btn ? (btn.disabled ? 'disabled' : 'enabled') : 'missing'
	})
	log(`pay button: ${payState}`)
	if (payState === 'enabled') break
	await new Promise((r) => setTimeout(r, 2000))
}

if (payState === 'enabled') {
	await page.evaluate(() => {
		const btn = [...document.querySelectorAll('button')].find((b) => /pay now/i.test(b.textContent ?? ''))
		btn?.click()
	})
	log('PAY clicked')
	await new Promise((r) => setTimeout(r, 15000))
	await page.screenshot({ path: new URL('qa-after-pay.png', OUT).pathname.replace(/^\/(\w:)/, '$1') })
	const state = await page.evaluate(() => document.querySelector('#plans')?.innerText?.slice(0, 700) ?? '')
	log('AFTER PAY STATE:', state.replace(/\n+/g, ' | ').slice(0, 500))
} else {
	log('pay never enabled; capturing state anyway')
	await page.screenshot({ path: new URL('qa-after-pay.png', OUT).pathname.replace(/^\/(\w:)/, '$1') })
}
await browser.close()
log('done')
