import puppeteer from 'puppeteer-core'
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const browser = await puppeteer.launch({ executablePath: EDGE, headless: false, args: ['--no-sandbox'] })
const page = await browser.newPage()
page.on('console', (m) => console.log('[console]', m.type(), m.text().slice(0, 200)))
await page.setViewport({ width: 1440, height: 900 })
await page.goto('https://summitridge-roofpros.whop.site/', { waitUntil: 'networkidle2', timeout: 120000 })
await new Promise((r) => setTimeout(r, 6000))
const probe = await page.evaluate(() => {
	const hasPixel = typeof window.whop?.track === 'function'
	window.whop?.track('estimate_requested', { value: 149, currency: 'USD', event_id: 'manual-probe-3' })
	window.whop?.track('deposit_started', { value: 500, currency: 'USD', event_id: 'manual-probe-3' })
	return { hasPixel, scope: window.whop?.debug ?? null }
})
console.log('PROBE', JSON.stringify(probe))
await new Promise((r) => setTimeout(r, 5000))
await browser.close()
