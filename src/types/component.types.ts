import type { TOCItem, ReadingTime, ContentFeatures } from './content.types'

// TOC component props interface
export interface TOCProps {
  toc?: TOCItem[]
}

// Post layout props interface (generic, not tied to specific data source)
export interface PostLayoutProps {
  title: string
  pubDate: Date
  image?: string
  readingTime?: ReadingTime
  toc?: TOCItem[]
  contentFeatures?: ContentFeatures
}

// Transition props interface
export interface TransitionProps {
  type: 'post' | 'page'
  class?: string
}

// Layout props interface
export interface LayoutProps extends TransitionProps {
  title?: string
  description?: string
}

// BaseHead component props interface
export interface BaseHeadProps {
  title: string
  description: string
  ogImage?: string
}

// ImageOptimizer component props interface
export interface ImageOptimizerProps {
  src: string | ImageMetadata
  alt: string
  width?: number
  height?: number
  quality?: number
  format?: 'avif' | 'webp' | 'jpeg' | 'png'
  loading?: 'lazy' | 'eager'
  decoding?: 'async' | 'sync' | 'auto'
  class?: string
  caption?: string
  priority?: boolean
}

// FormattedDate component props interface
export interface FormattedDateProps {
  date: Date
  format?: string
  context?: 'list' | 'post' | 'default'
}

// GitHub repository data interface
export interface GitHubRepoData {
  owner?: {
    avatar_url: string
  }
  description?: string
  stargazers_count?: number
  forks_count?: number
  license?: {
    spdx_id: string
  }
}

// Cached repository data interface
export interface CachedRepoData {
  data: GitHubRepoData
  timestamp: number
}

// GitHub card UI elements interface
export interface CardElements {
  avatar: HTMLElement | null
  desc: HTMLElement | null
  stars: HTMLElement | null
  forks: HTMLElement | null
  license: HTMLElement | null
}

// LinkCard metadata interface (fetched from URL)
export interface LinkCardMetadata {
  title: string
  description: string
  image: string
  imageAlt: string
}
