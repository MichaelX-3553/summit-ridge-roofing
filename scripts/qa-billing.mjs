import puppeteer from 'puppeteer-core'
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const browser = await puppeteer.launch({ executablePath: EDGE, headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage()
page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 200)))
await page.goto('https://summitridge-roofpros.whop.site/billing?office=srr-office-2026-demo', { waitUntil: 'networkidle2', timeout: 120000 })
await new Promise((r) => setTimeout(r, 5000))
await page.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find((x) => /load recent customers/i.test(x.textContent ?? ''))
  b?.click()
})
await new Promise((r) => setTimeout(r, 6000))
const clicked = await page.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find((x) => /bill final balance/i.test(x.textContent ?? ''))
  b?.click()
  return !!b
})
console.log('bill clicked:', clicked)
await new Promise((r) => setTimeout(r, 14000))
const result = await page.evaluate(() => {
  const ps = [...document.querySelectorAll('p, div')].map((x) => x.textContent ?? '')
  return ps.find((t) => /(Invoice pay_|Failed:)/.test(t))?.slice(0, 400) ?? 'no result found'
})
console.log('RESULT:', result)
await browser.close()
