import { BaseElementWithoutShadowDOM } from '@/base/BaseElement'
import '@/components/cart-note'
import '@/components/cart-remove-toggle'
import '@/components/quantity-input'
import firstFocusableElement from '@/lib/firstFocusableElement'
import HTMLUpdateUtility from '@/mixins/HTMLUpdateUtility'
import { WithShopifyCartClientMixin } from '@/mixins/WithShopifyCart'
import { html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'

@customElement('cart-sections')
export class CartSections extends WithShopifyCartClientMixin(
  BaseElementWithoutShadowDOM
) {
  static SECTIONS_CACHE: Record<string, string | null> = {}
  $htmlUpdateUtility: HTMLUpdateUtility = new HTMLUpdateUtility(this)

  @property({ type: String, attribute: 'section-id' })
  sectionId!: string

  @state()
  protected sectionHTML: string | null = null

  lastFocusedElementSelectorId: string | null | undefined

  connectedCallback() {
    super.connectedCallback()
    if (this.sectionHTML === null) {
      this.sectionHTML = this.innerHTML
      this.innerHTML = ''
    }

    this.$htmlUpdateUtility.addPostProcessCallback(() => {
      window?.Shopify?.PaymentButton?.init()

      if (this.lastFocusedElementSelectorId) {
        setTimeout(() => {
          const activeElement = document.querySelector(
            `#${this.lastFocusedElementSelectorId}`
          ) as HTMLElement
          if (activeElement) {
            activeElement?.focus()
          } else {
            firstFocusableElement(this)?.focus()
          }

          this.lastFocusedElementSelectorId = null
        }, 50)
      }
    })
  }

  protected updated(
    changedProperties: Map<string | number | symbol, unknown>
  ): void {
    if (changedProperties.has('sectionHTML')) {
      this.$htmlUpdateUtility.reRunScripts(this)
    }

    if (
      !!this.cartSections[this.sectionId] &&
      JSON.stringify(this.cartSections[this.sectionId]) !==
        CartSections.SECTIONS_CACHE[this.sectionId]
    ) {
      CartSections.SECTIONS_CACHE[this.sectionId] = JSON.stringify(
        this.cartSections[this.sectionId]
      )
      const html = this.$htmlUpdateUtility.parseSectionStringForSelector(
        this.cartSections[this.sectionId] as string,
        `[section-id="${this.sectionId}"]`
      )
      if (html) {
        this.$htmlUpdateUtility.wrapUpdateProcess(
          this,
          html,
          (newContent: Element) => {
            this.sectionHTML = newContent.innerHTML
          }
        )
      }
    }
  }

  render() {
    return html`${unsafeHTML(this.sectionHTML)}`
  }
}
