export function cleanupFetchCache(expiryMs = 60 * 1000) {
  try {
    if (typeof localStorage === 'undefined') return

    const now = Date.now()
    const keysToDelete: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith('fetch-cache:')) continue

      try {
        const cached = localStorage.getItem(key)
        if (!cached) continue

        const { timestamp } = JSON.parse(cached)
        if (typeof timestamp !== 'number' || now - timestamp >= expiryMs) {
          keysToDelete.push(key)
        }
      } catch {
        // If JSON is invalid, remove it
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach((key) => localStorage.removeItem(key))
    // if (keysToDelete.length > 0) {
    //   console.debug(
    //     `CleanupFetchCache: removed ${keysToDelete.length} expired entries.`
    //   )
    // }
  } catch (error) {
    console.error('Error in cleanupFetchCache', error)
  }
}
