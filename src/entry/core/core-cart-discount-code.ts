import { BaseElementWithoutShadowDOM } from '@/base/BaseElement'
import { WithShopifyCartClientMixin } from '@/mixins/WithShopifyCart'
import { PropertyValues } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'

@customElement('cart-discount-code')
export class CustomAccordion extends WithShopifyCartClientMixin(
  BaseElementWithoutShadowDOM
) {
  @query('form')
  form!: HTMLFormElement

  @query('input[name="discount"]')
  discountInput!: HTMLInputElement

  @query('button[type="submit"]')
  submitButton!: HTMLButtonElement

  @property({ type: String, attribute: 'generic-error-message' })
  genericErrorMessage!: string

  constructor() {
    super()
    this.onSubmit = this.onSubmit.bind(this)
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties)
    this.form.addEventListener('submit', this.onSubmit.bind(this))
    this._checkForDiscountCodeErrors()
  }

  protected async onSubmit(event: SubmitEvent) {
    event.preventDefault()
    const formData = new FormData(this.form)
    const discountCode = formData.get('discount') as string
    try {
      this.discountInput?.setAttribute('disabled', 'true')
      this.submitButton?.setAttribute('disabled', 'true')
      await this.updateCartNoteAndAttributes(
        { discount: discountCode },
        { sections: true }
      )
    } catch (error) {
      console.error('Error applying discount code:', error)
    } finally {
      this.discountInput.value = ''
      this.discountInput?.removeAttribute('disabled')
      this.submitButton?.removeAttribute('disabled')
    }
  }

  async _checkForDiscountCodeErrors() {
    const cart = this.cart
    const inApplicableDiscounCodes = cart.discount_codes?.filter(
      (code) => !code.applicable
    )

    if (inApplicableDiscounCodes && inApplicableDiscounCodes.length > 0) {
      this.appendErrorMessage()
    } else {
      this.removeErrorMessage()
    }
  }

  appendErrorMessage() {
    if (!this.querySelector('.error-message')) {
      const errorMessage = document.createElement('div')
      errorMessage.className = 'caption text-u-error'
      errorMessage.textContent = this.genericErrorMessage
      this.appendChild(errorMessage)
    }
  }

  removeErrorMessage() {
    const errorMessage = this.querySelector('.error-message')
    if (errorMessage) {
      this.removeChild(errorMessage)
    }
  }
}
