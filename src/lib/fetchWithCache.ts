// Utility: fetchWithCache
// Caches fetch responses in localStorage by URL+query, with expiry (default 1min)
export async function fetchWithCache(
  url: string,
  options: RequestInit = {},
  paramsToIgnore: string[] = [],
  expiryMs = 1 * 60 * 1000
): Promise<Response> {
  try {
    const cacheKey = createCacheKey(url, paramsToIgnore)
    const now = Date.now()
    if ((options.method ?? 'GET').toUpperCase() === 'GET') {
      try {
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
          const { timestamp, body, headers } = JSON.parse(cached)

          if (now - timestamp < expiryMs) {
            // Recreate a Response object
            return new Response(body, { headers })
          } else {
            localStorage.removeItem(cacheKey)
          }
        }
      } catch (error) {
        console.warn('Error reading from fetch cache', error)
        // ignore cache parse errors
      }
    }

    // Perform network request
    const res = await fetch(url, options)

    // Clone so we can read body without consuming caller’s response
    const resClone = res.clone()

    try {
      const bodyText = await resClone.text()
      const headersObj: Record<string, string> = {}
      resClone.headers.forEach((value, key) => {
        headersObj[key] = value
      })
      localStorage.setItem(
        cacheKey,
        JSON.stringify({ timestamp: now, body: bodyText, headers: headersObj })
      )
    } catch {
      // ignore storage errors (quota, etc.)
    }

    return res
  } catch (error) {
    console.error('Error in fetchWithCache', error)
    return fetch(url, options) // fallback to normal fetch on error
  }
}

// Helper: short hash (SHA-1-ish, 8 chars)
function shortHash(str: string): string {
  let hash = 0,
    i,
    chr
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

const createCacheKey = (url: string, paramsToIgnore: string[] = []) => {
  const base =
    typeof window !== 'undefined' && (window as any).location?.origin
      ? (window as any).location.origin
      : 'http://localhost'

  const urlObj = new URL(url, base)
  urlObj.hash = ''

  paramsToIgnore.forEach((param) => urlObj.searchParams.delete(param))

  const pathAndQuery = urlObj.pathname + (urlObj.search ? urlObj.search : '')
  const hash = shortHash(pathAndQuery)
  return `fetch-cache:${hash}`
}
