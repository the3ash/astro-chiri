import type { APIContext, ImageMetadata } from 'astro'
import { getImage } from 'astro:assets'
import { getCollection, type CollectionEntry } from 'astro:content'
import { Feed } from 'feed'
import MarkdownIt from 'markdown-it'
import { parse as htmlParser } from 'node-html-parser'
import sanitizeHtml from 'sanitize-html'
import { themeConfig } from '@/config'
import path from 'node:path'

const markdownParser = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

const imagesGlob = import.meta.glob<{ default: ImageMetadata }>(
  '/src/content/posts/_assets/**/*.{jpeg,jpg,png,gif,webp}'
)

/**
 * Fix relative image paths in HTML content and convert them to absolute URLs
 * @param htmlContent - HTML string converted from Markdown
 * @param baseUrl - Base URL of the website
 * @param postPath - Current post path (e.g., 'some-post.md' or 'tech/another-post.md')
 * @returns - HTML string with processed image paths
 */
async function fixRelativeImagePaths(
  htmlContent: string,
  baseUrl: string,
  postPath: string
): Promise<string> {
  const root = htmlParser(htmlContent)
  const imageTags = root.querySelectorAll('img')
  const postDir = path.dirname(postPath)

  for (const img of imageTags) {
    const src = img.getAttribute('src')
    if (!src) continue

    if (/^(https?:\/\/|\/\/)/.test(src)) {
      continue
    }

    if (src.startsWith('./') || src.startsWith('../')) {
      // Build path relative to /src/content/posts
      let resolvedPath: string
      if (src.startsWith('./')) {
        // ./xxx -> postDir/xxx
        resolvedPath = path.posix.join('/src/content/posts', postDir, src.slice(2))
      } else {
        // ../xxx -> Resolve to parent directory
        resolvedPath = path.posix.resolve('/src/content/posts', postDir, src)
      }

      // Check if corresponding image module exists
      if (imagesGlob[resolvedPath]) {
        try {
          const imageModule = await imagesGlob[resolvedPath]()
          const metadata = imageModule.default

          // In development environment, don't process images, use original paths to ensure cross-platform compatibility
          if (import.meta.env.DEV) {
            // Development environment: use relative paths
            const relativePath = resolvedPath.replace('/src/content/posts/', '/')
            const imageUrl = new URL(relativePath, baseUrl).toString()
            img.setAttribute('src', imageUrl)
          } else {
            // Production environment: use getImage optimization
            const processedImage = await getImage({
              src: metadata,
              format: 'webp',
              width: 800
            })

            // Always use the optimized image path in production
            img.setAttribute('src', new URL(processedImage.src, baseUrl).toString())
          }
        } catch (error) {
          console.error(`[Feed] Image processing failed: ${src} -> ${resolvedPath}`, error)
          // Use original path as fallback when error occurs
          const relativePath = resolvedPath.replace('/src/content/posts/', '/')
          const imageUrl = new URL(relativePath, baseUrl).toString()
          img.setAttribute('src', imageUrl)
        }
      } else {
        console.warn(`[Feed] Image module not found: ${resolvedPath}`)
        console.warn(`[Feed] Available image modules:`, Object.keys(imagesGlob))
      }
    } else if (src.startsWith('/')) {
      img.setAttribute('src', new URL(src, baseUrl).toString())
    }
  }

  return root.toString()
}

/**
 * Generate a generic Feed instance
 */
async function generateFeedInstance(context: APIContext) {
  const siteUrl = (context.site?.toString() || themeConfig.site.website).replace(/\/$/, '')
  const { title = '', description = '', author = '', language = 'en-US' } = themeConfig.site

  const feed = new Feed({
    title: title,
    description: description,
    id: siteUrl,
    link: siteUrl,
    language: language,
    copyright: `Copyright © ${new Date().getFullYear()} ${author}`,
    updated: new Date(),
    generator: 'Astro Chiri Feed Generator',
    feedLinks: {
      rss: `${siteUrl}/rss.xml`,
      atom: `${siteUrl}/atom.xml`
    },
    author: {
      name: author,
      link: siteUrl
    }
  })

  const posts = await getCollection(
    'posts',
    ({ id }: CollectionEntry<'posts'>) => !id.startsWith('_')
  )
  const sortedPosts = posts.sort(
    (a: CollectionEntry<'posts'>, b: CollectionEntry<'posts'>) =>
      b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  )

  for (const post of sortedPosts) {
    const postSlug = post.id.replace(/\.[^/.]+$/, '')
    const postUrl = new URL(postSlug, siteUrl).toString()
    const rawHtml = markdownParser.render(post.body || '')
    const processedHtml = await fixRelativeImagePaths(rawHtml, siteUrl, post.id)
    const cleanHtml = sanitizeHtml(processedHtml, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'div', 'span']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        '*': ['class', 'id'],
        a: ['href', 'title', 'target', 'rel'],
        img: ['src', 'alt', 'title', 'width', 'height']
      }
    })

    // Generate plain text summary for description
    const plainText = sanitizeHtml(cleanHtml, { allowedTags: [], allowedAttributes: {} })
      .replace(/\s+/g, ' ')
      .trim()
    const description = plainText.length > 200 ? plainText.slice(0, 200) + '...' : plainText

    feed.addItem({
      title: post.data.title,
      id: postUrl,
      link: postUrl,
      description: description,
      content: cleanHtml,
      date: post.data.pubDate,
      published: post.data.pubDate
    })
  }

  return feed
}

/**
 * Generate RSS 2.0 feed
 */
export async function generateRSS(context: APIContext) {
  const feed = await generateFeedInstance(context)
  const rssXml = feed
    .rss2()
    .replace(
      '<?xml version="1.0" encoding="utf-8"?>',
      '<?xml version="1.0" encoding="utf-8"?>\n<?xml-stylesheet type="text/xsl" href="/feeds/rss-style.xsl"?>'
    )
  return new Response(rssXml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' }
  })
}

/**
 * Generate Atom 1.0 feed
 */
export async function generateAtom(context: APIContext) {
  const feed = await generateFeedInstance(context)
  const atomXml = feed
    .atom1()
    .replace(
      '<?xml version="1.0" encoding="utf-8"?>',
      '<?xml version="1.0" encoding="utf-8"?>\n<?xml-stylesheet type="text/xsl" href="/feeds/atom-style.xsl"?>'
    )
  return new Response(atomXml, {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' }
  })
}
