// toggle-proxy.ts
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Compatible with ES module __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const configPath = path.resolve(__dirname, '../src/config.ts')
const proxyPath = path.resolve(__dirname, '../src/pages/api/proxy.ts')
const backupPath = path.resolve(__dirname, '../src/pages/api/proxy.ts.bak')
const astroConfigPath = path.resolve(__dirname, '../astro.config.ts')

// Read config.ts content
const configContent = fs.readFileSync(configPath, 'utf-8')

// Use regex to extract linkCard config (assuming the format does not change)
const match = configContent.match(/linkCard:\s*(true|false)/)
if (!match) {
  console.error('linkCard config not found')
  process.exit(1)
}
const linkCardEnabled: boolean = match[1] === 'true'

// Helper to comment/uncomment adapter lines in astro.config.ts
function toggleAstroAdapter(comment: boolean) {
  const astroConfig = fs.readFileSync(astroConfigPath, 'utf-8').split('\n')

  // Find the import line for netlify adapter (including commented lines)
  const importIndex = astroConfig.findIndex((line) => line.trim().includes('import') && line.includes('netlify'))

  // Find the adapter line (including commented lines)
  const adapterIndex = astroConfig.findIndex((line) => line.trim().includes('adapter:') && line.includes('netlify'))

  if (importIndex === -1 || adapterIndex === -1) {
    console.error('Could not find netlify adapter import or configuration')
    return
  }

  if (comment) {
    // Comment out the import line if not already commented
    if (!astroConfig[importIndex].trim().startsWith('//')) {
      astroConfig[importIndex] = '// ' + astroConfig[importIndex]
    }
    // Comment out the adapter line if not already commented
    if (!astroConfig[adapterIndex].trim().startsWith('//')) {
      astroConfig[adapterIndex] = '// ' + astroConfig[adapterIndex]
    }
  } else {
    // Uncomment the import line if commented
    if (astroConfig[importIndex].trim().startsWith('//')) {
      astroConfig[importIndex] = astroConfig[importIndex].replace(/^\/\/\s?/, '')
    }
    // Uncomment the adapter line if commented
    if (astroConfig[adapterIndex].trim().startsWith('//')) {
      astroConfig[adapterIndex] = astroConfig[adapterIndex].replace(/^\/\/\s?/, '')
    }
  }

  fs.writeFileSync(astroConfigPath, astroConfig.join('\n'), 'utf-8')
}

if (!linkCardEnabled) {
  // If linkCard is disabled, rename proxy.ts and comment adapter
  if (fs.existsSync(proxyPath)) {
    fs.renameSync(proxyPath, backupPath)
    console.log('🟡 proxy.ts disabled')
  }
  toggleAstroAdapter(true)
  console.log('🟡 adapter config disabled')
} else {
  // If linkCard is enabled, restore proxy.ts and uncomment adapter
  if (fs.existsSync(backupPath)) {
    fs.renameSync(backupPath, proxyPath)
    console.log('🟢 proxy.ts enabled')
  }
  toggleAstroAdapter(false)
  console.log('🟢 adapter config enabled')
}
