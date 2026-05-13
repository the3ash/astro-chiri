export function markContentFeature(file, key) {
  if (!key) return
  if (!file.data.astro) file.data.astro = {}
  if (!file.data.astro.frontmatter) file.data.astro.frontmatter = {}
  file.data.astro.frontmatter.contentFeatures = {
    ...(file.data.astro.frontmatter.contentFeatures || {}),
    [key]: true
  }
}
