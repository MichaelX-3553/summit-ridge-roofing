import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const BASE = process.env.SHOT_URL ?? 'http://localhost:3000/'
const OUT = new URL('../shots/', import.meta.url)
mkdirSync(OUT, { recursive: true })

const browser = await puppeteer.launch({
	executablePath: EDGE,
	headless: true,
	args: ['--no-sandbox', '--disable-gpu'],
})

async function capture(name, width, height) {
	const page = await browser.newPage()
	page.on('pageerror', (err) => console.log('[pageerror]', String(err).slice(0, 400)))
	await page.setViewport({ width, height, deviceScaleFactor: 1 })
	await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 120000 })
	await page.waitForSelector('h1', { timeout: 60000 })
	// give hydration and lazy chunks time to finish in dev
	await new Promise((r) => setTimeout(r, 9000))
	// walk the page so whileInView reveals fire before the full-page capture
	await page.evaluate(async () => {
		const step = window.innerHeight * 0.7
		for (let y = 0; y <= document.body.scrollHeight; y += step) {
			window.scrollTo(0, y)
			await new Promise((r) => setTimeout(r, 350))
		}
		window.scrollTo(0, 0)
	})
	await new Promise((r) => setTimeout(r, 1200))
	await page.screenshot({ path: new URL(`${name}.png`, OUT).pathname.replace(/^\/(\w:)/, '$1'), fullPage: true })
	console.log('saved', name)
	await page.close()
}

await capture('home-desktop', 1440, 900)
await capture('home-mobile', 390, 844)
await browser.close()
