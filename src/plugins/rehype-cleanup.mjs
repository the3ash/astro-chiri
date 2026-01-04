import { visit } from 'unist-util-visit'

/**
 * Rehype plugin to cleanup and extract raw figure elements from paragraph nodes
 */
export default function rehypeCleanup() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      // 1. Task List Item Fix: Remove leading space after checkbox
      if (node.tagName === 'li' && node.properties?.className?.includes('task-list-item')) {
        const children = node.children
        let inputIndex = -1

        // Find the checkbox input
        for (let i = 0; i < children.length; i++) {
          const child = children[i]
          if (
            child.type === 'element' &&
            child.tagName === 'input' &&
            child.properties?.type === 'checkbox'
          ) {
            inputIndex = i
            break
          }
        }

        if (inputIndex !== -1) {
          // Check key siblings after the checkbox for the text node
          for (let i = inputIndex + 1; i < children.length; i++) {
            const child = children[i]
            if (child.type === 'comment') continue
            if (child.type === 'text') {
              if (child.value.startsWith(' ')) {
                child.value = child.value.replace(/^\s+/, '')
              }
              break
            } else {
              break
            }
          }
        }
      }

      // 2. Figure Cleanup (Original Logic)
      if (node.tagName !== 'p') {
        return
      }
      if (!node.children?.length) {
        return
      }
      if (!parent) {
        return
      }

      const rawFigureNodes = []

      for (const child of node.children) {
        if (child.type === 'raw' && child.value && child.value.trim().startsWith('<figure')) {
          rawFigureNodes.push(child)
        } else if (child.type !== 'text' || child.value.trim() !== '') {
          return
        }
      }

      if (rawFigureNodes.length > 0) {
        parent.children.splice(index, 1, ...rawFigureNodes)
        return index
      }
    })
  }
  }
