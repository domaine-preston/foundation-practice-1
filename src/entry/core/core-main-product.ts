import { BaseElementWithoutShadowDOM } from '@/base/BaseElement'
import '@/components/product-form'
import '@/components/quantity-input'
import '@/components/variant-picker'
import {
  VARIANT_PICKER_CHANGE_EVENT,
  type VariantPickerChangeEvent,
} from '@/components/variant-picker'
import HTMLUpdateUtility from '@/mixins/HTMLUpdateUtility'
import { customElement, property } from 'lit/decorators.js'

@customElement('main-product')
export class MainProduct extends BaseElementWithoutShadowDOM {
  $htmlUpdateUtility: HTMLUpdateUtility = new HTMLUpdateUtility(this)

  @property({ type: String, attribute: 'section-id' })
  sectionId!: string

  @property({ type: String, attribute: 'product-url' })
  productUrl!: string

  @property({ type: String, attribute: 'view' })
  view!: string

  @property({
    type: String,
    attribute: 'update-url',
    converter: (value) => value === 'true',
  })
  shouldUpdateUrl!: boolean

  @property({
    type: Boolean,
    attribute: 'reactive-to-cart',
    converter: (value) => value === 'true',
  })
  reactiveToCart: boolean = false

  @property({ type: String, attribute: 'replace-uid' })
  replaceUid: string | undefined

  private _cacheKey: string | undefined

  connectedCallback(): void {
    super.connectedCallback()
    this.handleVariantPickerChange = this.handleVariantPickerChange.bind(this)
    this.handleCartUpdated = this.handleCartUpdated.bind(this)
    this.addEventListener(
      VARIANT_PICKER_CHANGE_EVENT,
      this.handleVariantPickerChange as EventListener
    )

    this.$htmlUpdateUtility.addPostProcessCallback(() => {
      window?.Shopify?.PaymentButton?.init()
    })

    if (this.reactiveToCart) {
      document.addEventListener('cart:updated', this.handleCartUpdated)
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback()
    this.removeEventListener(
      VARIANT_PICKER_CHANGE_EVENT,
      this.handleVariantPickerChange as EventListener
    )

    if (this.reactiveToCart) {
      document.removeEventListener('cart:updated', this.handleCartUpdated)
    }
  }

  private updateURL(url: string, variantId: string, sellingPlan?: string) {
    if (!this.shouldUpdateUrl) return
    const currentUrlParams = new URLSearchParams(window.location.search)
    currentUrlParams.set('variant', variantId)

    if (sellingPlan && sellingPlan !== '') {
      currentUrlParams.set('selling_plan', sellingPlan)
    }

    window.history.replaceState(
      {},
      '',
      `${url}${variantId ? `?${currentUrlParams.toString()}` : ''}`
    )
  }

  protected handleVariantPickerChange(event: VariantPickerChangeEvent) {
    const newProductUrl = event.detail.productUrl
    const targetVariantId = event.detail.variantId
    const sellingPlan = event.detail.sellingPlan

    if (!targetVariantId || targetVariantId.trim() === '') return
    this.updateURL(newProductUrl ?? '', targetVariantId, sellingPlan)

    if (
      newProductUrl &&
      newProductUrl !== '' &&
      newProductUrl !== this.productUrl
    ) {
      this.productUrl = newProductUrl
    }

    this.updateSection(
      true,
      newProductUrl ? newProductUrl : this.productUrl,
      targetVariantId,
      sellingPlan
    )
  }

  protected updateSection(
    withCache: boolean = true,
    productUrl: string,
    targetVariantId?: string,
    sellingPlan?: string
  ) {
    return this.$htmlUpdateUtility
      .fetchAndReplaceSectionId({
        renderRoot: this,
        sectionId: this.sectionId,
        baseUrl: productUrl,
        params: {
          ...(targetVariantId && targetVariantId !== ''
            ? { variant: targetVariantId }
            : {}),
          ...(sellingPlan && sellingPlan !== ''
            ? { selling_plan: sellingPlan }
            : {}),
          ...(this.view ? { view: this.view } : {}),
          ...(this._cacheKey ? { _cache: this._cacheKey } : {}),
        },
        withCache,
        filterHTML: (response) => {
          if (this.replaceUid) {
            return response.replace(/###uid###/g, this.replaceUid)
          }
          return response
        },
      })
      .catch((error) => {
        if (error instanceof Error) {
          throw error
        } else {
          console.warn(error)
        }
      })
  }

  protected handleCartUpdated() {
    this.$htmlUpdateUtility.flushCache()
    // Force Shopify GET cache busting by updating the cache key
    this._cacheKey = new Date().getTime().toString()
    this.updateSection(false, this.productUrl)
  }
}
