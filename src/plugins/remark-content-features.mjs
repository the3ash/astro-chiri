import { visit } from 'unist-util-visit'
import { markContentFeature } from './utils/content-features.mjs'

export default function remarkContentFeatures() {
  return (tree, file) => {
    visit(tree, 'image', () => {
      markContentFeature(file, 'hasContentImage')
    })
  }
}
