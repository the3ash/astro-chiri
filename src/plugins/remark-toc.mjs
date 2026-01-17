import { visit } from 'unist-util-visit'

export default function remarkTOC() {
  return function (tree, file) {
    const headings = []
    let headingIndex = 0
    const usedSlugs = new Set()

    // Extract headings from AST
    visit(tree, 'heading', (node) => {
      const level = node.depth

      // Only process h1, h2, h3
      if (level > 3) return

      // Skip the first h1
      if (level === 1 && headingIndex === 0) {
        headingIndex++
        return
      }

      const text = extractTextContent(node)
      if (!text) return

      // Generate unique slug from text
      const slug = generateUniqueSlug(text, usedSlugs)
      const id = slug

      if (!node.data) node.data = {}
      if (!node.data.hProperties) node.data.hProperties = {}
      node.data.hProperties.id = id

      headings.push({
        level,
        text,
        id,
        index: headingIndex
      })

      headingIndex++
    })

    // Store TOC data in file.data.astro.frontmatter
    if (!file.data.astro) file.data.astro = {}
    if (!file.data.astro.frontmatter) file.data.astro.frontmatter = {}
    file.data.astro.frontmatter.toc = headings
  }
}

function extractTextContent(node) {
  let text = ''

  visit(node, 'text', (textNode) => {
    text += textNode.value
  })

  return text.trim()
}

// Generate a slug from text
function generateSlug(text) {
  return (
    text
      .toLowerCase()
      // Keep Chinese characters, English letters, numbers, spaces and hyphens
      .replace(/[^\u4e00-\u9fa5a-z0-9\s-]/g, '')
      // Replace spaces with hyphens
      .replace(/\s+/g, '-')
      // Replace multiple hyphens with single hyphen
      .replace(/-+/g, '-')
      // Remove leading and trailing hyphens
      .replace(/^-|-$/g, '')
  )
}

// Generate a unique slug from text
function generateUniqueSlug(text, usedSlugs) {
  let slug = generateSlug(text)
  let counter = 1
  let uniqueSlug = slug

  while (usedSlugs.has(uniqueSlug)) {
    uniqueSlug = `${slug}-${counter}`
    counter++
  }

  usedSlugs.add(uniqueSlug)
  return uniqueSlug
}
