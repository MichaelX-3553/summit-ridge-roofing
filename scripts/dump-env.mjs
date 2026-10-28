import { writeFileSync } from 'node:fs'

const interesting = Object.fromEntries(
  Object.entries(process.env).filter(
    ([k]) => k.startsWith('WHOP') || k === 'APP_ID' || k.startsWith('CLOUDFLARE_'),
  ),
)
writeFileSync(new URL('../.whop-env.json', import.meta.url), JSON.stringify(interesting, null, 1))
