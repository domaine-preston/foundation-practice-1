import type BaseElement from '@/base/BaseElement'
import { fetchWithCache } from '@/lib/fetchWithCache'
import DeferredPromise from 'defer-promise'
import { ReactiveController, ReactiveControllerHost } from 'lit'

export declare class WithApiClientInterface {
  $api: APIClientController
}

export type APIClientSDK = {
  storefront: <T>(init: RequestInitWithBody) => Promise<T>
  shopify: apiClientFetch
  fetchClient: apiClientFetch
}

type RequestInitWithBody = Omit<RequestInit, 'body'> & {
  body?: Record<string, unknown> | RequestInit['body']
}

type createApiClientConfig = {
  baseUrl: string
  headers?: Record<string, string>
  defaultMethod?: RequestInitWithBody['method']
  onRequestStart?: () => void
  onRequestEnd?: () => void
  signal?: AbortSignal
  withQueue?: boolean
  queueKey?: string
}

type QueueCollectionItem = {
  requestArguments: {
    endpoint: string
    init?: RequestInitWithBody
    options?: RequestOption
  }
  deferred: ReturnType<typeof DeferredPromise>
}

type QueueCollection = Record<string, QueueCollectionItem[]>

const QUEUE_COLLECTION: QueueCollection = {}
const QUEUE_LOADING_STATES: Record<string, boolean> = {}

type RequestOption = {
  params?: Record<string, string | string[]>
  rawBody?: boolean
  removeContentType?: boolean
  withCache?: boolean
  forceJSON?: boolean
  persistCache?: boolean
  persistCacheExpiryMs?: number
  persistCacheParamsToIgnore?: string[]
}

export type apiClientFetch = <T>(
  endpoint: string,
  init?: RequestInitWithBody,
  options?: RequestOption
) => Promise<T>

const formattedResponse = async (
  response: Response,
  options?: RequestOption
) => {
  try {
    const contentType = response.headers.get('content-type')

    if (
      (contentType &&
        (contentType.includes('application/json') ||
          contentType.includes('json') ||
          contentType.includes('application/graphql') ||
          contentType.includes('text/javascript'))) ||
      options?.forceJSON
    ) {
      return await response.json()
    }
    return await response.text()
  } catch (error) {
    console.error('Error in formattedResponse', error)
    return await response.text()
  }
}

export const createURLSearchParams = (
  params: Record<string, string | string[]>
) => {
  const searchParams = new URLSearchParams()
  for (const key in params) {
    const currentValue = params[key]
    if (Array.isArray(currentValue)) {
      for (const value of currentValue) {
        searchParams.append(key, value)
      }
    } else {
      searchParams.set(key, currentValue as string)
    }
  }
  return searchParams
}

export const fromURLSearchParams = (searchParams: URLSearchParams) => {
  const params: Record<string, string | string[]> = {}
  // @ts-ignore
  for (const [key, value] of searchParams) {
    if (params[key]) {
      if (Array.isArray(params[key])) {
        ;(params[key] as string[]).push(value)
      } else {
        params[key] = [params[key] as string, value]
      }
    } else {
      params[key] = value
    }
  }
  return params
}

const processRequest = async <T>(
  config: createApiClientConfig,
  cache: APIClientCache,
  endpoint: string,
  init?: RequestInitWithBody,
  options?: RequestOption
): Promise<T> => {
  try {
    const headers = {
      ...config.headers,
      ...(init?.headers || {}),
    }
    const params = options?.params
      ? createURLSearchParams(options.params)
      : null
    config?.onRequestStart?.()
    const finalHeaders = {
      ...headers,
      ...(init?.headers || {}),
    }

    if (options?.removeContentType) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete finalHeaders['Content-Type']
    }
    const method = init?.method || config.defaultMethod || 'GET'
    const withCache = options?.withCache && method === 'GET'
    const persistCache = options?.persistCache && method === 'GET'
    const fetchMethod = persistCache
      ? (url: string, req: RequestInit) =>
          fetchWithCache(
            url,
            req,
            options?.persistCacheParamsToIgnore,
            options?.persistCacheExpiryMs
          )
      : fetch
    const finalUrl = `${config.baseUrl}${endpoint}${params ? '?' + params.toString() : ''}`
    if (withCache) {
      const cachedResponse = cache.get(finalUrl)
      if (cachedResponse) {
        return cachedResponse
      }
    }

    const response = await fetchMethod(finalUrl, {
      signal: config.signal,
      method,
      ...(init as RequestInit),
      headers: finalHeaders,
      ...(init?.body &&
        options?.rawBody && { body: init.body as RequestInit['body'] }),
      ...(init?.body &&
        !options?.rawBody && { body: JSON.stringify(init.body) }),
    })

    if (!response.ok || response.status >= 400) {
      throw await formattedResponse(response, options)
    }

    if (
      (init?.headers as Record<string, string>)?.['Content-Type']?.includes(
        'text/'
      )
    ) {
      const responseText = await response.text()
      if (withCache) {
        cache.set(finalUrl, responseText)
      }

      return responseText as T
    }

    const responseJson = await formattedResponse(response, options)
    if (withCache) {
      cache.set(finalUrl, responseJson)
    }
    return responseJson
  } catch (error) {
    console.error('Error in createApiClient', error)
    throw error
  } finally {
    config?.onRequestEnd?.()
  }
}

export const processQueueWithKey = async (
  config: createApiClientConfig,
  cache: APIClientCache,
  queueKey: string
) => {
  if (QUEUE_LOADING_STATES[queueKey]) {
    return
  }

  QUEUE_LOADING_STATES[queueKey] = true
  const queue = QUEUE_COLLECTION[queueKey]
  while (queue.length > 0) {
    const { requestArguments, deferred } = queue.shift() as QueueCollectionItem

    try {
      const response = await processRequest(
        config,
        cache,
        requestArguments.endpoint,
        requestArguments.init,
        requestArguments.options
      )
      deferred.resolve(response)
    } catch (error) {
      deferred.reject(error)
    }
  }

  QUEUE_LOADING_STATES[queueKey] = false
}

/*
 *  createApiClient is a function that returns a function that can be used to make API requests.
 *  It accepts a configuration object with the following properties:
 * - baseUrl: The base URL for the API requests.
 * - headers: An object containing the headers to be sent with the requests.
 * - defaultMethod: The default HTTP method to be used for the requests.
 * - onRequestStart: A function to be called before each request is sent.
 * - onRequestEnd: A function to be called after each request is completed.
 * - signal: An AbortSignal object to be used for aborting the requests.
 * - withQueue: A boolean flag indicating whether to use a queue for the requests.
 * - queueKey: A string key to identify the queue.
 *
 * The function returned by createApiClient accepts the following arguments:
 * - endpoint: The endpoint for the API request.
 * - init: An object containing the request options.
 * - options: An object containing additional options for the request.
 *
 * The function returns a Promise that resolves to the response data.
 * The function also handles queuing of requests if the withQueue option is set to true.
 * The queueKey option is used to identify the queue for queuing the requests.
 * The processQueueWithKey function is used to process the queued requests.
 *
 * The APIClientCache class is used to cache the responses of the requests.
 *  if the withCache option is set to true on the request options.
 */

export const createApiClient = (
  config: createApiClientConfig,
  cacheKey?: string
) => {
  const cache = new APIClientCache(cacheKey)
  if (config.withQueue && config.queueKey) {
    if (!QUEUE_COLLECTION[config.queueKey]) {
      QUEUE_COLLECTION[config.queueKey] = []
    }
  }

  return <T>(
    endpoint: string,
    init?: RequestInitWithBody,
    options?: RequestOption
  ): Promise<T> => {
    if (endpoint === 'FLUSH_CACHE') {
      cache.clear()
      return Promise.resolve({} as T)
    }
    if (config.withQueue && config.queueKey) {
      const deferred = DeferredPromise<T>()
      QUEUE_COLLECTION[config.queueKey].push({
        requestArguments: { endpoint, init, options },
        deferred,
      })
      processQueueWithKey(config, cache, config.queueKey)
      return deferred.promise
    }

    return processRequest<T>(config, cache, endpoint, init, options)
  }
}

export const WithApiClientMixin = <T extends AbstractConstructor<BaseElement>>(
  superClass: T
) => {
  abstract class WithApiClientClass extends superClass {
    $api = new APIClientController(this)
  }
  // Cast return type to your mixin's interface intersected with the superClass type
  return WithApiClientClass as AbstractConstructor<WithApiClientInterface> & T
}

export class APIClientController implements ReactiveController {
  host: ReactiveControllerHost
  abortController: AbortController = new AbortController()

  constructor(host: ReactiveControllerHost) {
    ;(this.host = host).addController(this)
  }

  hostDisconnected() {
    this.abortController.abort()
  }

  fetchClient = createApiClient({
    baseUrl: '',
    signal: this.abortController.signal,
  })

  storefrontClient = createApiClient({
    baseUrl: `${window.Shopify.routes.root === '/' ? '' : window.Shopify.routes.root}/api/2024-07/graphql.json`,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': `${window.__STOREFRONT_ACCESS_TOKEN__}`,
    },
    defaultMethod: 'POST',
    signal: this.abortController.signal,
  })

  shopifyClient = createApiClient({
    baseUrl: `${window.Shopify.routes.root}`,
    headers: {
      'Content-Type': 'application/json',
    },
    signal: this.abortController.signal,
  })

  get client() {
    return {
      fetchClient: this.fetchClient,
      storefront: <T>(_: RequestInitWithBody) =>
        this.storefrontClient<T>('', _),
      shopify: this.shopifyClient,
    } satisfies APIClientSDK
  }
}

const CacheClassesMap = new Map<string, APIClientCache>()

class APIClientCache {
  private cache = new Map<string, any>()
  private cacheKey?: string

  get = (key: string) => this.cache.get(key)
  set = (key: string, value: any) => this.cache.set(key, value)
  clear = () => this.cache.clear()

  constructor(cacheKey?: string) {
    this.cacheKey = cacheKey
    if (this.cacheKey) {
      if (!CacheClassesMap.has(this.cacheKey)) {
        CacheClassesMap.set(this.cacheKey, this)
      }
    }

    if (this.cacheKey && CacheClassesMap.has(this.cacheKey)) {
      const cache = CacheClassesMap.get(this.cacheKey)
      if (cache) {
        this.cache = cache.cache
      }
    }
  }
}
