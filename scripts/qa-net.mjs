import puppeteer from 'puppeteer-core'
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const browser = await puppeteer.launch({ executablePath: EDGE, headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage()
page.on('request', (r) => { if (r.method() === 'POST') console.log('[POST]', r.url().slice(0, 120)) })
page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 300)))
await page.setViewport({ width: 1440, height: 1100 })
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 120000 })
await new Promise((r) => setTimeout(r, 5000))
await page.evaluate(() => document.querySelector('#estimate')?.scrollIntoView())
await page.type('#name', 'Net Probe', { delay: 5 })
await page.type('#email', 'probe@example.com', { delay: 5 })
await page.type('#phone', '7205550134', { delay: 5 })
await page.type('#address', '1428 S Pearl St', { delay: 5 })
console.log('--- clicking submit ---')
await page.click('button[type="submit"]')
await new Promise((r) => setTimeout(r, 8000))
const state = await page.evaluate(() => ({
	btn: [...document.querySelectorAll('button')].find(b=>/send/i.test(b.textContent))?.textContent,
	err: document.querySelector('[role="alert"]')?.textContent ?? null,
	done: /Request received/.test(document.body.innerText),
}))
console.log('STATE', JSON.stringify(state))
await browser.close()
