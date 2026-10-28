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

const pf = page.frames().find((fr) => fr.url().includes('payments/payment'))
if (pf) {
	const structure = await pf.evaluate(() => {
		const clickables = [...document.querySelectorAll('button,[role="radio"],[role="tab"],[role="option"],label')]
			.map((el) => ({
				tag: el.tagName,
				role: el.getAttribute('role'),
				text: (el.textContent ?? '').trim().slice(0, 40),
				forId: el.getAttribute('for'),
			}))
			.filter((c) => c.text)
		return clickables.slice(0, 40)
	})
	console.log(JSON.stringify(structure, null, 1))
}
console.log('--- frames now ---')
for (const f of page.frames()) console.log('frame:', f.url().slice(0, 100))
await browser.close()
