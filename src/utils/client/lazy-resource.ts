type ResourceState = {
  observers: Map<string, IntersectionObserver>
  initialized: Set<string>
  requestCaches: Map<string, Map<string, Promise<unknown>>>
}

type LazyResourceOptions = {
  key: string
  selector: string
  stateKey?: string
  rootMargin?: string
  load: (element: HTMLElement) => Promise<void> | void
  onError?: (element: HTMLElement, error: unknown) => void
}

type FetchJsonOptions<T> = {
  cacheName: string
  cacheKey: string
  url: string
  timeoutMs?: number
  init?: RequestInit
  transform?: (json: unknown) => T
}

type StorageValue<T> = {
  data: T
  timestamp: number
}

declare global {
  interface Window {
    __lazyResourceState?: ResourceState
  }
}

function getResourceState(): ResourceState {
  window.__lazyResourceState ||= {
    observers: new Map(),
    initialized: new Set(),
    requestCaches: new Map()
  }

  return window.__lazyResourceState
}

function getRequestCache(cacheName: string): Map<string, Promise<unknown>> {
  const state = getResourceState()
  let cache = state.requestCaches.get(cacheName)

  if (!cache) {
    cache = new Map()
    state.requestCaches.set(cacheName, cache)
  }

  return cache
}

export function initOnPageLoad(key: string, setup: () => void): void {
  const state = getResourceState()

  setup()

  if (state.initialized.has(key)) {
    return
  }

  document.addEventListener('astro:page-load', setup)
  state.initialized.add(key)
}

export function setupLazyResources(options: LazyResourceOptions): void {
  const state = getResourceState()
  const rootMargin = options.rootMargin ?? '200px'
  const stateKey = options.stateKey ?? 'resourceState'
  const elements = Array.from(document.querySelectorAll<HTMLElement>(options.selector))

  state.observers.get(options.key)?.disconnect()
  state.observers.delete(options.key)

  if (elements.length === 0) {
    return
  }

  const loadElement = async (element: HTMLElement): Promise<void> => {
    if (element.dataset[stateKey]) {
      return
    }

    element.dataset[stateKey] = 'loading'

    try {
      await options.load(element)
      element.dataset[stateKey] = 'loaded'
    } catch (error) {
      options.onError?.(element, error)
      element.dataset[stateKey] = 'error'
    }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return
        }

        observer.unobserve(entry.target)
        void loadElement(entry.target as HTMLElement)
      })
    },
    { rootMargin }
  )

  state.observers.set(options.key, observer)

  elements.forEach((element) => {
    if (!element.dataset[stateKey]) {
      observer.observe(element)
    }
  })
}

export async function fetchJsonWithCache<T>(options: FetchJsonOptions<T>): Promise<T> {
  const cache = getRequestCache(options.cacheName)

  if (cache.has(options.cacheKey)) {
    return cache.get(options.cacheKey) as Promise<T>
  }

  const request = fetchJson(options)

  cache.set(options.cacheKey, request)
  request.catch(() => cache.delete(options.cacheKey))

  return request
}

async function fetchJson<T>(options: FetchJsonOptions<T>): Promise<T> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), options.timeoutMs ?? 8000)

  try {
    const response = await fetch(options.url, {
      ...options.init,
      signal: controller.signal
    })

    if (!response.ok) {
      throw new Error(`Response ${response.status}`)
    }

    const json = await response.json()
    return options.transform ? options.transform(json) : (json as T)
  } finally {
    window.clearTimeout(timeoutId)
  }
}

export function getStorageCache<T>(key: string, ttlMs: number): T | null {
  try {
    const cached = localStorage.getItem(key)

    if (!cached) {
      return null
    }

    const value = JSON.parse(cached) as StorageValue<T>

    if (Date.now() - value.timestamp > ttlMs) {
      localStorage.removeItem(key)
      return null
    }

    return value.data
  } catch {
    localStorage.removeItem(key)
    return null
  }
}

export function setStorageCache<T>(key: string, data: T): void {
  const value: StorageValue<T> = {
    data,
    timestamp: Date.now()
  }

  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    localStorage.removeItem(key)
  }
}
