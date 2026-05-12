import fs from 'node:fs/promises'
import path from 'node:path'
import { parse } from 'node-html-parser'
import { themeConfig } from '../src/config'

type LinkCardMetadata = {
  title?: string
  description?: string
  image?: string
  imageAlt?: string
  siteName?: string
  updatedAt: string
}

const postsDir = path.resolve('src/content/posts')
const metadataPath = path.resolve('src/data/link-card-metadata.json')
const force = process.argv.includes('--force')
const astroCachePaths = [path.resolve('.astro/data-store.json'), path.resolve('node_modules/.astro/data-store.json')]

async function clearAstroCache() {
  for (const cachePath of astroCachePaths) {
    await fs.rm(cachePath, { force: true })
  }
}

if (!themeConfig.post.linkCard) {
  let hadMetadata = false
  try {
    await fs.access(metadataPath)
    hadMetadata = true
  } catch {
    // metadata file absent — nothing to clean up
  }

  if (hadMetadata) {
    await fs.rm(metadataPath, { force: true })
    await clearAstroCache()
    console.log('Link card disabled — removed stale metadata and cleared content cache.')
  } else {
    console.log('Link card is disabled in src/config.ts, skipping metadata fetch.')
  }
  process.exit(0)
}

async function listContentFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) return listContentFiles(fullPath)
      if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) return [fullPath]
      return []
    })
  )

  return files.flat()
}

function normalizeHttpUrl(value: string) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.toString()
  } catch {
    return null
  }
}

function extractLinkCardUrls(content: string) {
  const urls = new Set<string>()
  const directivePattern = /:{2,3}\s*link\s*\{[^}]*url=(["'])(.*?)\1[^}]*\}/g
  const withoutCodeBlocks = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/~~~[\s\S]*?~~~/g, '')
    .replace(/`[^`\n]*`/g, '')

  for (const match of withoutCodeBlocks.matchAll(directivePattern)) {
    const url = normalizeHttpUrl(match[2])
    if (url) urls.add(url)
  }

  return urls
}

async function loadMetadata() {
  try {
    return JSON.parse(await fs.readFile(metadataPath, 'utf-8')) as Record<string, LinkCardMetadata>
  } catch {
    return {}
  }
}

function getMeta(root: ReturnType<typeof parse>, selector: string) {
  return root.querySelector(selector)?.getAttribute('content')?.trim() || ''
}

function resolveUrl(value: string, baseUrl: string) {
  if (!value) return ''

  try {
    return new URL(value, baseUrl).toString()
  } catch {
    return ''
  }
}

async function fetchMetadata(url: string): Promise<LinkCardMetadata> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Astro Chiri LinkCard Metadata)'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    const root = parse(html)
    const title =
      getMeta(root, 'meta[property="og:title"]') ||
      getMeta(root, 'meta[name="twitter:title"]') ||
      root.querySelector('title')?.text.trim() ||
      ''
    const description =
      getMeta(root, 'meta[property="og:description"]') ||
      getMeta(root, 'meta[name="twitter:description"]') ||
      getMeta(root, 'meta[name="description"]') ||
      ''
    const image = getMeta(root, 'meta[property="og:image"]') || getMeta(root, 'meta[name="twitter:image"]') || ''

    return {
      title,
      description,
      image: resolveUrl(image, url),
      imageAlt: getMeta(root, 'meta[property="og:image:alt"]') || title,
      siteName: getMeta(root, 'meta[property="og:site_name"]') || new URL(url).hostname.replace(/^www\./, ''),
      updatedAt: new Date().toISOString()
    }
  } finally {
    clearTimeout(timeout)
  }
}

const files = await listContentFiles(postsDir)
const urls = new Set<string>()

for (const file of files) {
  const content = await fs.readFile(file, 'utf-8')
  for (const url of extractLinkCardUrls(content)) {
    urls.add(url)
  }
}

const metadata = await loadMetadata()
let mutated = false

for (const url of Object.keys(metadata)) {
  if (!urls.has(url)) {
    delete metadata[url]
    mutated = true
    console.log(`Pruned ${url}`)
  }
}

const newUrls = [...urls].sort().filter((url) => force || !metadata[url])

const results = await Promise.allSettled(newUrls.map((url) => fetchMetadata(url)))

results.forEach((result, i) => {
  const url = newUrls[i]
  if (result.status === 'fulfilled') {
    metadata[url] = result.value
    mutated = true
    console.log(`Updated ${url}`)
  } else {
    const reason = result.reason instanceof Error ? result.reason.message : String(result.reason)
    console.warn(`Skipped ${url}: ${reason}`)
  }
})

if (mutated) {
  const sortedMetadata = Object.fromEntries(Object.entries(metadata).sort(([a], [b]) => a.localeCompare(b)))
  await fs.mkdir(path.dirname(metadataPath), { recursive: true })
  await fs.writeFile(metadataPath, `${JSON.stringify(sortedMetadata, null, 2)}\n`)

  await clearAstroCache()
  console.log('Cleared Astro content cache to pick up new link metadata.')
}
