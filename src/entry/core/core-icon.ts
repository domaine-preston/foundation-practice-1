import BaseElement from '@/base/BaseElement'
// @ts-ignore
import styles from '@/styles/component-icon.css?inline'
import { Task } from '@lit/task'
// @ts-ignore
import defer from 'defer-promise'
import { html, nothing, unsafeCSS } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'

declare global {
  interface Window {
    __VITE_DEV_MODE__?: boolean
  }
}

const SPRITE_CONTAINER_ID = 'vite-plugin-svg-spritemap'
// Usage
// Control the icon size by supplying relevant font-size class to HOST element
// <svg-icon
//     src='icon-close'
//     width='24px'
//     viewBox='0 0 24 24'
//   ></svg-icon>
@customElement('svg-icon')
export class SvgIcon extends BaseElement {
  static loadingCartPromise: DeferPromise.Deferred<void> | null = null
  static svgSpriteCache: string | null = null
  static styles = [unsafeCSS(styles)]
  static metaPathSel: string = `meta[data-svg-sprite-path]`

  private loadSpriteTask = new Task(this, {
    task: async () => {
      if (SvgIcon.svgSpriteCache) {
        return SvgIcon.svgSpriteCache
      }

      if (SvgIcon.loadingCartPromise) {
        return await SvgIcon.loadingCartPromise.promise
      }
      SvgIcon.loadingCartPromise = defer()

      try {
        if (window.__VITE_DEV_MODE__) {
          // Wait for the sprite container to be injected by the Vite plugin
          await new Promise<void>((resolve) => {
            const container = document.getElementById(SPRITE_CONTAINER_ID)
            if (container?.querySelector('svg')) {
              resolve()
              return
            }

            const observer = new MutationObserver((mutations, obs) => {
              for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                  const container = document.getElementById(SPRITE_CONTAINER_ID)
                  if (container?.querySelector('svg')) {
                    obs.disconnect()
                    resolve()
                    return
                  }
                }
              }
            })

            observer.observe(document.body, {
              childList: true,
              subtree: true,
            })

            // Timeout after 5 seconds to prevent infinite waiting
            setTimeout(() => {
              observer.disconnect()
              resolve()
            }, 5000)
          })

          const container = document.getElementById(SPRITE_CONTAINER_ID)
          const svg = container?.querySelector('svg')
          if (svg instanceof SVGElement) {
            SvgIcon.svgSpriteCache = this.hideAndGetSvgHtml(svg)

            if (SvgIcon.loadingCartPromise) {
              SvgIcon.loadingCartPromise.resolve()
              SvgIcon.loadingCartPromise = null
            }

            return SvgIcon.svgSpriteCache
          }
        } else if (window.Shopify?.designMode) {
          // In design mode, fetch and inject the sprite for preview
          const spritePath = this.svgSpritePath
          if (!spritePath) {
            return nothing
          }

          const response = await fetch(spritePath)
          if (!response.ok) {
            throw new Error('Network response was not ok')
          }
          const svgText = await response.text()
          // Clean up the fetched SVG text if necessary
          const parser = new DOMParser()
          const doc = parser.parseFromString(svgText, 'image/svg+xml')
          const svg = doc.documentElement
          if (svg instanceof SVGElement) {
            SvgIcon.svgSpriteCache = this.hideAndGetSvgHtml(svg)

            if (SvgIcon.loadingCartPromise) {
              SvgIcon.loadingCartPromise.resolve()
              SvgIcon.loadingCartPromise = null
            }

            return SvgIcon.svgSpriteCache
          }
        }

        // In production mode, don't fetch or inject the sprite
        if (SvgIcon.loadingCartPromise) {
          SvgIcon.loadingCartPromise.resolve()
          SvgIcon.loadingCartPromise = null
        }

        return nothing
      } catch (error) {
        if (SvgIcon.loadingCartPromise) {
          SvgIcon.loadingCartPromise.reject()
          SvgIcon.loadingCartPromise = null
        }
        console.error('Error loading SVG sprite:', error)
        return error
      }
    },
  })

  private hideAndGetSvgHtml(element: SVGElement): string {
    // Hide the sprite
    element.style.display = 'none'
    return element.outerHTML
  }

  constructor() {
    super()
    this.metaEl = document.head.querySelector(
      SvgIcon.metaPathSel
    ) as HTMLElement
  }

  connectedCallback(): void {
    super.connectedCallback()

    if (window.__VITE_DEV_MODE__ || window.Shopify?.designMode) {
      this.loadSpriteTask.run()
    }
  }

  @property({ type: String })
  src: string | undefined | null

  private metaEl: HTMLElement | undefined | null

  get svgSpritePath() {
    return this.metaEl?.dataset.svgSpritePath
  }

  get useHref() {
    if (window.__VITE_DEV_MODE__ || window.Shopify?.designMode) {
      return `#${this.src}`
    }
    return `${this.svgSpritePath}#${this.src}`
  }

  generateSVGMarkup(icon: string) {
    return html`
      <svg
        class="block h-full w-full"
        aria-label=${this.ariaLabel || `Icon for ${this.src}`}
      >
        <use crossorigin="anonymous" href=${icon}></use>
      </svg>
    `
  }

  render() {
    if (this.src === undefined || this.src === null || this.src === '') {
      return html`${nothing}`
    }

    if (window.__VITE_DEV_MODE__ || window.Shopify?.designMode) {
      return html`
        ${this.loadSpriteTask.render({
          complete: () => {
            if (
              !SvgIcon.svgSpriteCache ||
              typeof SvgIcon.svgSpriteCache !== 'string'
            ) {
              return nothing
            }

            return html`
              ${unsafeHTML(SvgIcon.svgSpriteCache)}
              ${this.src && this.generateSVGMarkup(`#${this.src}`)}
            `
          },
        })}
      `
    }

    return this.generateSVGMarkup(this.useHref)
  }
}
