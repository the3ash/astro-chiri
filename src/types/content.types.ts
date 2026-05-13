import type { CollectionEntry } from 'astro:content'

// Reading time interface
export interface ReadingTime {
  text: string
  minutes: number
  time: number
  words: number
}

// TOC item interface
export interface TOCItem {
  level: number
  text: string
  id: string
  index: number
}

export interface ContentFeatures {
  hasCodeBlock?: boolean
  hasContentImage?: boolean
  hasFootnotes?: boolean
  hasGithubCard?: boolean
  hasLinkCard?: boolean
  hasNeoDBCard?: boolean
  hasXPost?: boolean
}

// PostList component props interface
export interface PostListProps {
  posts: CollectionEntry<'posts'>[]
}
