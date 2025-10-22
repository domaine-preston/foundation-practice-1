import { BaseElementWithoutShadowDOM } from '@/base/BaseElement'
import { WithApiClientMixin } from '@/mixins/WithApiClient'
import { Task } from '@lit/task'
import { html, nothing } from 'lit'
import { customElement, property, queryAll } from 'lit/decorators.js'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'

// This is a custom element that will render a product card based on the provided variantId or product handle.
// <dynamic-product-card template='product-card-simple' variant-id='44867697705233'></dynamic-product-card>
// <dynamic-product-card variant-id='44867697705233'></dynamic-product-card>
// <dynamic-product-card handle='artichoke-lemon'></dynamic-product-card>
type StorefrontVariantQuery = {
  data: {
    node: {
      id: string
      product: {
        handle: string
      }
    }
  }
}

const GET_PRODUCT_VARIANTS_FROM_NODE = `#graphql
  query getProductVariantsFromNode($id: ID!) {
    node(id: $id) {
      id
      ... on ProductVariant {
        product {
          handle
        }
      }
    }
  }
`

const CACHE: Record<string, string> = {}
const VARIANT_HANDLE_CACHE: Record<string, string> = {}

@customElement('dynamic-product-card')
export class DynamicProductCard extends WithApiClientMixin(
  BaseElementWithoutShadowDOM
) {
  @property({ type: String, attribute: 'variant-id' })
  variantId: string | undefined

  @property({ type: String })
  handle: string | undefined

  @property({ type: String, attribute: 'image' })
  image: string | undefined

  @property({ type: String, attribute: 'title' })
  title: string = ''

  @property({ type: String })
  template: string = 'product-card'

  @property({ type: String, attribute: 'url-postfix' })
  urlPostfix: string = ''

  @property({
    type: Boolean,
    attribute: 'force-eager-image',
    converter: (value) => value === 'true',
  })
  forceEagerImage: boolean = false

  @property({
    type: Boolean,
    attribute: 'apply-unique-id',
    converter: (value) => value === 'true',
  })
  applyUniqueId: boolean = false

  @queryAll('[data-product-url]')
  productUrls!: NodeListOf<HTMLAnchorElement>

  uniqueId: string = Math.random().toString(36).substring(2, 9)

  createRenderRoot() {
    return this
  }

  get cacheKey() {
    return `${this.handle}-${this.variantId}-${this.template}`
  }

  checkIfResponseHasLayout = (response: string) => {
    return response.match(/<(html|body)/)
  }

  private _loadVariantByIdTask = new Task(this, {
    task: async ([variantId]: (string | undefined)[]) => {
      if (!variantId) {
        throw new Error('No variantId provided')
      }

      if (this.handle) {
        return this.handle
      }

      if (VARIANT_HANDLE_CACHE[variantId]) {
        return VARIANT_HANDLE_CACHE[variantId]
      }

      const request = await this.$api.client.storefront<StorefrontVariantQuery>(
        {
          body: {
            query: GET_PRODUCT_VARIANTS_FROM_NODE,
            variables: {
              id: `gid://shopify/ProductVariant/${variantId}`,
            },
          },
        }
      )

      if (!request.data?.node?.product?.handle) {
        throw new Error('No product handle found')
      }

      VARIANT_HANDLE_CACHE[variantId] = request.data?.node?.product?.handle
      return VARIANT_HANDLE_CACHE[variantId]
    },
    args: () => [this.variantId],
  })

  loadProductHandleView = new Task(this, {
    task: async ([handle]: (string | undefined)[]) => {
      if (!handle) {
        throw new Error('No handle provided')
      }

      if (CACHE[this.cacheKey]) {
        return CACHE[this.cacheKey]
      }

      const request = await this.$api.client.shopify<string>(
        `products/${handle}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'text/html',
          },
        },
        {
          params: {
            section_id: this.template,
            ...(this.variantId && {
              variant: this.variantId,
            }),
          },
          persistCache: true,
          persistCacheExpiryMs: 60 * 1000, // 1 minute
        }
      )
      if (this.checkIfResponseHasLayout(request)) {
        throw new Error('Invalid response')
      }

      if (request) {
        CACHE[this.cacheKey] = request
        return request
      }

      throw new Error('No product found')
    },
    args: () => [
      this.handle || this._loadVariantByIdTask.value,
      this.variantId,
    ],
  })

  _renderPostfix() {
    // Skip if Nosto is not enabled as we don't need it otherwise
    if (window.__VENDORS__ && !window.__VENDORS__.nosto.enabled) return
    if (!this.urlPostfix) return

    const productUrlEls = Array.from(this.productUrls)

    if (productUrlEls.length === 0) return

    for (const url of productUrlEls) {
      const link = url as HTMLAnchorElement

      if (link && (!!link.href || !!link.getAttribute('product-url'))) {
        const href = new URL(
          link.href || (link.getAttribute('product-url') as string)
        )
        const parts = this.urlPostfix.split('=')

        if (parts.length === 2) {
          href.searchParams.append(parts[0], parts[1])
        } else {
          console.error(
            'urlPostfix does not contain exactly one "=" character.'
          )
        }

        link.href
          ? (link.href = href.toString())
          : link.setAttribute('product-url', href.toString())
      }
    }
  }

  async updated() {
    this._renderPostfix()
  }

  render() {
    return html`
      ${this.loadProductHandleView.render({
        pending: () =>
          this.title
            ? html`<div class="aspect-square">
                <div
                  class="group/images bg-t-border-02 group relative block aspect-[3/3.7]"
                >
                  ${this.image
                    ? `<img
                class="absolute inset-0 h-full w-full object-cover"
                src="${this.image}&width=300"
                ${this.forceEagerImage ? 'loading="eager"' : 'loading="lazy"'}
                fetchpriority="${this.forceEagerImage ? 'high' : 'auto'}"
                alt="${this.title}"
              />`
                    : ''}
                </div>
                <div class="flex flex-1 flex-col space-y-2 p-4">
                  <h3 class="text-sm font-medium text-gray-900">
                    ${this.title}
                  </h3>
                  <div class="pb-sm"></div>
                </div>
              </div>`
            : nothing,
        complete: (data) => {
          if (!data) return
          if (this.applyUniqueId) {
            // Replace all intances of  ###uid### with the uniqueId
            data = data.replace(/###uid###/g, this.uniqueId)
          }

          // replace loading="eager" with loading="lazy" if forceLazyImage is true
          if (this.forceEagerImage) {
            data = data.replace(/loading="lazy"/g, 'loading="eager"')
            data = data.replace(/fetchpriority="auto"/g, 'fetchpriority="high"')
          }

          return html`${unsafeHTML(data)}`
        },
      })}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dynamic-product-card': DynamicProductCard
  }
}
