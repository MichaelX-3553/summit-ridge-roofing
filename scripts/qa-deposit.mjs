import puppeteer from 'puppeteer-core'
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const browser = await puppeteer.launch({ executablePath: EDGE, headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage()
page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 200)))
await page.setViewport({ width: 1440, height: 1300 })
await page.goto('https://summitridge-roofpros.whop.site/', { waitUntil: 'networkidle2', timeout: 120000 })
await new Promise((r) => setTimeout(r, 5000))
await page.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find((x) => /start my replacement/i.test(x.textContent ?? ''))
  b?.click()
})
await new Promise((r) => setTimeout(r, 12000))
const info = await page.evaluate(() => ({
  iframes: [...document.querySelectorAll('iframe')].map((f) => f.src.slice(0, 80)).filter((s) => s.includes('whop')),
  cardText: document.querySelector('#plans')?.innerText?.slice(0, 400) ?? '',
}))
console.log('whop iframes:', info.iframes.length)
console.log(info.iframes.slice(0, 6).join('\n'))
console.log('CARD TEXT:', info.cardText.replace(/\n+/g, ' | ').slice(0, 350))
await page.screenshot({ path: new URL('../shots/qa-deposit.png', import.meta.url).pathname.replace(/^\/(\w:)/, '$1') })
await browser.close()
