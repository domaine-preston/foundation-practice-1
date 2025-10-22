import 'construct-style-sheets-polyfill'
import 'element-internals-polyfill'
import 'vite/modulepreload-polyfill'

import('@/lib/cleanupFetchCache').then(({ cleanupFetchCache }) => {
  // Clean up fetch cache entries older than 3 minutes
  cleanupFetchCache(3 * 60 * 1000)
})
