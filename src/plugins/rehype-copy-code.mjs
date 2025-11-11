import { visit } from 'unist-util-visit'

/**
 * Rehype plugin that adds copy button to code blocks for easy code copying functionality
 */
export default function rehypeCopyCode() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      // Only process pre elements
      if (node.tagName !== 'pre') {
        return
      }

      // Validate pre element has children
      if (!node.children?.length) {
        return
      }

      // Ensure code element exists
      const hasCodeElement = node.children.some((child) => child.tagName === 'code')
      if (!hasCodeElement) {
        return
      }

      // Mark the pre element with class for styling
      node.properties = node.properties || {}
      node.properties.className = node.properties.className || []
      if (!node.properties.className.includes('copy-code-block')) {
        node.properties.className.push('copy-code-block')
      }

      // Create copy button
      const copyButton = {
        type: 'element',
        tagName: 'button',
        properties: {
          className: ['copy-button'],
          type: 'button',
          'aria-label': 'Copy code to clipboard'
        },
        children: []
      }

      // Wrap pre and button in a container for better layout control
      const wrapper = {
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['copy-code-wrapper']
        },
        children: [copyButton, node]
      }

      // Replace the pre element with the wrapper
      if (parent && typeof index === 'number') {
        parent.children[index] = wrapper
      }
    })
  }
}
