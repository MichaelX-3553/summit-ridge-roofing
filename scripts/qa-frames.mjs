import puppeteer from 'puppeteer-core'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const BASE = process.env.QA_URL ?? 'https://summitridge-roofpros.whop.site/'

const browser = await puppeteer.launch({ executablePath: EDGE, headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 1200 })
await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 120000 })
await new Promise((r) => setTimeout(r, 5000))

await page.evaluate(() => {
	const btn = [...document.querySelectorAll('button')].find((b) => /book the inspection/i.test(b.textContent ?? ''))
	btn?.click()
})
await new Promise((r) => setTimeout(r, 9000))

for (const f of page.frames()) {
	try {
		const info = await f.evaluate(() => ({
			inputs: [...document.querySelectorAll('input,select,textarea')].map((i) => ({
				name: i.name || null,
				id: i.id || null,
				aria: i.getAttribute('aria-label'),
				ph: i.placeholder || null,
				ac: i.getAttribute('autocomplete'),
			})),
		}))
		if (info.inputs.length > 0) {
			console.log('FRAME', f.url().slice(0, 90))
			for (const i of info.inputs) console.log('   ', JSON.stringify(i))
		}
	} catch {
		// cross-origin frames without inputs
	}
}
await browser.close()
console.log('scan done')
