// SPDX-License-Identifier: AGPL-3.0-only
//
// Runs inside the Playwright image (see ../compat-wikijs.sh): sets up a fresh Wiki.js with
// invented folders, installs the built bundle through the theme's code injection and checks
// what a signed-in reader sees. Exits non-zero on the first failed expectation.
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'

const BASE = process.env.WIKI
const EMAIL = 'compat@example.com'
const PASS = 'Compat-Only-Pw-123!'
const bundle = readFileSync('dist/wikijs-tweaks.js', 'utf8')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const NAMES = ['01-Test', '3Towers', '4Winds', 'Alder', 'Amaranth', 'Ambrosia', 'Aster', 'Azalea', 'Bamboo', 'Basil', 'Begonia', 'Birch',
  'Camellia', 'Cedar', 'Clover', 'Dahlia', 'Elm', 'Fennel', 'Fern', 'Gardenia', 'Hazel', 'Iris', 'Gorse', 'Lavender',
  'Linden', 'Lotus', 'Magnolia', 'Maple', 'Mint', 'Myrtle', 'Nettle', 'Oak', 'Olive', 'Orchid', 'Peony', 'Pine', 'Poppy', 'Quince',
  'Rosemary', 'Sage', 'Sorrel', 'Thyme', 'Tulip', 'Umbrella-Tree', 'Violet', 'Vervain', 'Zedoary', 'Zinnia']

async function gql(query, variables, token) {
  const r = await fetch(`${BASE}/graphql`, { method: 'POST', headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ query, variables }) })
  return r.json()
}

async function setUp() {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(BASE)).ok) break } catch { /* not up yet */ }
    await sleep(3000)
  }
  await fetch(`${BASE}/finalize`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ adminEmail: EMAIL, adminPassword: PASS, adminPasswordConfirm: PASS, siteUrl: 'http://localhost', telemetry: false }) })
  let token
  for (let i = 0; i < 60 && !token; i++) {
    await sleep(3000)
    try {
      const d = await gql('mutation($u:String!,$p:String!){authentication{login(username:$u,password:$p,strategy:"local"){jwt}}}', { u: EMAIL, p: PASS })
      token = d?.data?.authentication?.login?.jwt
    } catch { /* restarting after setup */ }
  }
  if (!token) throw new Error('could not sign in to the new Wiki.js')
  const create = async (path, title) => {
    const d = await gql('mutation($p:String!,$t:String!){pages{create(content:"x",description:"",editor:"markdown",isPublished:true,isPrivate:false,locale:"en",path:$p,tags:[],title:$t){responseResult{succeeded message}}}}', { p: path, t: title }, token)
    if (!d?.data?.pages?.create?.responseResult?.succeeded) throw new Error(`could not create ${path}: ${JSON.stringify(d).slice(0, 200)}`)
  }
  await create('customers/home', 'Customers')
  for (const name of NAMES) await create(`customers/${name}/home`, name)
  for (const [p, t] of [['development/alpha', 'Alpha'], ['development/beta', 'Beta'], ['procedures/vlan', 'Configure VLAN'], ['procedures/vm', 'Configure a VM'], ['home', 'Documentation']]) await create(p, t)
  const nav = await gql('mutation{navigation{updateConfig(mode:TREE){responseResult{succeeded}}}}', {}, token)
  if (!nav?.data?.navigation?.updateConfig?.responseResult?.succeeded) throw new Error('could not set the navigation mode')
  return token
}

async function inject(token, config) {
  const body = `<script>window.WikiJsTweaks=${JSON.stringify(config)}</script><script>${bundle}</script>`
  const r = await gql('mutation($b:String){theming{setConfig(theme:"default",iconset:"mdi",darkMode:true,injectCSS:"",injectHead:"",injectBody:$b){responseResult{succeeded message}}}}', { b: body }, token)
  if (!r?.data?.theming?.setConfig?.responseResult?.succeeded) throw new Error(`could not inject the bundle: ${JSON.stringify(r).slice(0, 200)}`)
}

let failures = 0
function expect(name, ok, detail = '') {
  console.log(`${ok ? '  ✔' : '  ✘'} ${name}${ok ? '' : ` ${detail}`}`)
  if (!ok) failures++
}

const token = await setUp()
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
page.on('pageerror', (e) => expect('no JavaScript error on the page', false, String(e).slice(0, 200)))
await page.goto(`${BASE}/login`)
await page.locator('input').nth(0).fill(EMAIL)
await page.locator('input[type="password"]').fill(PASS)
await page.keyboard.press('Enter')
await page.waitForTimeout(4000)

const strip = () => page.evaluate(() => !!document.getElementById('wjs-folder-index'))
const shot = async (name, clip) => { if (process.env.SHOTS) await page.screenshot({ path: `/out/${name}.png`, clip }) }

// 1 ── enabled
await inject(token, { folderIndex: { enabled: true } })
await page.goto(`${BASE}/en/customers/home`)
await page.waitForSelector('#wjs-folder-index', { timeout: 20000 }).catch(() => {})
expect('the strip appears in a folder with many subfolders', await strip())
const letters = await page.$$eval('#wjs-folder-index button', (b) => b.map((x) => x.textContent + (x.disabled ? '-' : '')).join(''))
expect('it lists # and A to Z', letters.replace(/-/g, '') === '#ABCDEFGHIJKLMNOPQRSTUVWXYZ', letters)
expect('letters without folders are disabled (J, K, W, X, Y)', /J-K-/.test(letters) && /W-X-Y-/.test(letters), letters)
expect('status() reports the feature as active', (await page.evaluate(() => window.WikiJsTweaks.status().folderIndex.state)) === 'active')
await page.waitForTimeout(500)
await shot('folder-index-1-start', { x: 0, y: 0, width: 520, height: 900 })

// 2 ── jump to a letter
await page.click('#wjs-folder-index button:text-is("M")')
await page.waitForTimeout(450)
await shot('folder-index-2-jump', { x: 0, y: 0, width: 520, height: 900 })
const jumped = await page.evaluate(() => {
  const drawer = document.querySelector('.v-navigation-drawer').getBoundingClientRect()
  const el = [...document.querySelectorAll('.v-navigation-drawer .v-list-item')].find((e) => e.querySelector('.v-list-item__title')?.textContent === 'Magnolia')
  const r = el.getBoundingClientRect()
  return { visible: r.top >= drawer.top && r.bottom <= drawer.bottom, marked: el.classList.contains('wjs-folder-index-hit') }
})
expect('clicking M brings the first M folder into view', jumped.visible)
expect('and highlights it', jumped.marked)

// 3 ── single-page navigation (no reload)
await page.evaluate(() => { window.__kept = true })
await page.click('.v-navigation-drawer .v-list-item:has(.v-list-item__title:text-is("Cedar"))')
await page.waitForTimeout(2500)
expect('a folder with no subfolders has no strip', !(await strip()))
await page.click('.v-navigation-drawer .v-list-item:has(.v-list-item__title:text-is("customers"))')
await page.waitForTimeout(2500)
expect('going back to the big folder brings it back', await strip())
expect('without reloading the page', await page.evaluate(() => window.__kept === true))

// 4 ── small folder
await page.goto(`${BASE}/en/procedures/vlan`)
await page.waitForTimeout(3500)
expect('a folder with few subfolders has no strip', !(await strip()))

// 5 ── disabled
await inject(token, { folderIndex: { enabled: false } })
await page.goto(`${BASE}/en/customers/home`)
await page.waitForTimeout(4000)
expect('nothing happens when the feature is not enabled', !(await strip()))
expect('status() says so', (await page.evaluate(() => window.WikiJsTweaks.status().folderIndex.state)) === 'disabled')

await browser.close()
if (failures) { console.log(`\n${failures} check(s) failed`); process.exit(1) }
console.log('\nall checks passed')
