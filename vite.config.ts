/// <reference types="vitest" />
import shopify from 'vite-plugin-shopify'
import VitePluginSvgSpritemap from '@spiriit/vite-plugin-svg-spritemap'
import { defineConfig, defaultAllowedOrigins } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import cleanup from '@by-association-only/vite-plugin-shopify-clean'

export default defineConfig({
  test: {
    passWithNoTests: true,
    environment: 'jsdom',
    include: [
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'src/**/*.test.js',
      'src/**/*.test.jsx',
    ],
    coverage: {
      include: ['src/**/*'],
    },
  },
  plugins: [
    tailwindcss(),
    cleanup(),
    shopify({
      sourceCodeDir: 'src',
      entrypointsDir: 'src/entry',
      additionalEntrypoints: ['src/styles/*'],
    }),
    VitePluginSvgSpritemap('./src/icons/*.svg', {
      prefix: false,
      injectSvgOnDev: true,
      output: {
        filename: 'icons.svg',
        use: false,
        view: false,
      },
    }),
  ],
  server: {
    // We recommend always using an explicit allowed origins list
    // https://vite.dev/config/server-options.html#server-cors
    // Projects that are configured with custom domains will need to add trusted origins here to avoid CORS problems. Example:
    // cors: {
    //   origin: [defaultAllowedOrigins, /\.myshopify\.com$/, 'https://custom-store-domain.com'],
    // },
    cors: {
      origin: [defaultAllowedOrigins, /\.myshopify\.com$/],
    },
  },
  build: {
    emptyOutDir: false,
    rollupOptions: {
      output: {
        entryFileNames: '[name].[hash].min.js',
        chunkFileNames: '[name].[hash].min.js',
        assetFileNames: '[name].[hash].min[extname]',
      },
    },
  },
})
