import puppeteer from 'puppeteer-core'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const BASE = process.env.QA_URL ?? 'https://summitridge-roofpros.whop.site/'

const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a)

const browser = await puppeteer.launch({ executablePath: EDGE, headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage()
page.on('console', (m) => console.log('[console]', m.type(), m.text().slice(0, 250)))
page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 400)))
page.on('requestfailed', (r) => {
	if (!/Tracking|stripe/.test(r.url())) console.log('[reqfail]', r.url().slice(0, 90), r.failure()?.errorText)
})
page.on('response', async (res) => {
	const url = res.url()
	if (/_server|api\.whop\.com\/api\/v1\/leads/.test(url)) {
		let body = ''
		try {
			body = (await res.text()).slice(0, 300)
		} catch {}
		log('[net]', res.status(), url.slice(0, 90), body)
	}
})
await page.setViewport({ width: 1440, height: 1100 })
await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 120000 })
await new Promise((r) => setTimeout(r, 5000))

// visit a service card first so service_viewed fires
await page.evaluate(() => document.querySelector('#services')?.scrollIntoView())
await new Promise((r) => setTimeout(r, 2500))

// fill the estimate form
await page.evaluate(() => document.querySelector('#estimate')?.scrollIntoView())
await new Promise((r) => setTimeout(r, 1500))
await page.type('#name', 'Marcus Reyes', { delay: 8 })
await page.type('#email', 'qa.marcus.reyes@example.com', { delay: 8 })
await page.type('#phone', '(720) 555-0134', { delay: 8 })
await page.type('#address', '1428 S Pearl St, Denver, CO 80211', { delay: 8 })
await page.select('#service', 'Roof Repair')
await page.type('#notes', 'QA test submission: water stain after last storm.', { delay: 4 })
log('form filled')
await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /send request/i.test(x.textContent ?? '')); b?.click() })
log('submitted; waiting for server fn response')
await new Promise((r) => setTimeout(r, 12000))
const after = await page.evaluate(() => document.querySelector('#estimate')?.innerText?.slice(0, 300) ?? '')
log('FORM STATE:', after.replace(/\n+/g, ' | '))
await browser.close()
log('done')
