import { FormElement } from '@/base/FormElement'
import { ON_CHANGE_DEBOUNCE_TIMER, debounce } from '@/lib/debounce'
import { LiveRegionUtility } from '@/mixins/LiveRegionUtility'
import { WithShopifyCartClientMixin } from '@/mixins/WithShopifyCart'
import { computePosition, flip, offset } from '@floating-ui/dom'
import { customElement, property } from 'lit/decorators.js'

@customElement('quantity-input')
export class QuantityInput extends WithShopifyCartClientMixin(FormElement) {
  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this
  }

  $liveRegionUtility: LiveRegionUtility = new LiveRegionUtility(this)

  changeEvent = new Event('change', { bubbles: true })

  @property({ type: Number })
  min: number = 0

  @property({ type: Number })
  max: number = Infinity

  @property({ type: Number })
  variantId!: number

  @property({ type: Number, attribute: 'cart-quantity' })
  quantityInCart!: number

  @property({ type: String, attribute: 'key' })
  lineItemKey?: string

  _input!: HTMLElement | null
  _buttonMinus!: HTMLButtonElement | null
  _buttonPlus!: HTMLButtonElement | null
  _tooltip!: HTMLElement | null
  _handleDebounceChange: EventListener

  constructor() {
    super()

    this._handleClick = this._handleClick.bind(this)
    this._handleChange = this._handleChange.bind(this)
    this._handleInput = this._handleInput.bind(this)
    this.showTooltip = this.showTooltip.bind(this)
    this.hideTooltip = this.hideTooltip.bind(this)
    this.updatePosition = this.updatePosition.bind(this)

    this._handleDebounceChange = debounce(
      this._handleChange,
      ON_CHANGE_DEBOUNCE_TIMER
    )
  }

  _cacheElementSelectors() {
    this._input = this.querySelector('input')
    this._buttonMinus = this.querySelector('[name="minus"]')
    this._buttonPlus = this.querySelector('[name="plus"]')
    this._tooltip = this.querySelector('[data-tooltip]')
  }

  get input() {
    return this._input as HTMLInputElement
  }

  get buttonMinus() {
    return this._buttonMinus as HTMLButtonElement
  }

  get buttonPlus() {
    return this._buttonPlus as HTMLButtonElement
  }

  get tooltip() {
    return this._tooltip as HTMLElement
  }

  private setMinimumQuantity() {
    if (this.inputValue < this.min) {
      this.inputValue = this.min === 0 ? 1 : this.min
    }
  }

  async _handleChange() {
    this.validateQtyRules()
    this.setMinimumQuantity()
    if (this.shopifyCartLoading) return

    this.value = this.inputValue

    if (this.lineItemKey) {
      try {
        await this.updateQuantityToCart({
          [this.lineItemKey]: this.inputValue,
        })
      } catch (error) {
        this.$liveRegionUtility.announce({
          message: `Failed to update quantity.`,
        })
        this.resetValue()
        this.inputValue = this.value
      }
    }
  }

  _handleInput() {
    this.validateQtyRules()
  }

  private validateQtyRules() {
    const value = this.inputValue

    if (typeof this.min === 'number') {
      this.buttonMinus?.toggleAttribute('disabled', value <= this.min)
    }

    if (this.max) {
      this.buttonPlus?.toggleAttribute('disabled', value >= this.max)
    }
  }

  connectedCallback() {
    super.connectedCallback()
    this._cacheElementSelectors()
    this.validateQtyRules()

    const eventListeners: [keyof HTMLElementEventMap, EventListener][] = [
      ['mouseenter', this.showTooltip],
      ['mouseleave', this.hideTooltip],
      ['focus', this.showTooltip],
      ['blur', this.hideTooltip],
    ]
    eventListeners.forEach(([event, listener]) => {
      this.buttonPlus.addEventListener(event, listener)
    })

    this.addEventListener('click', this._handleClick)
    this.addEventListener('input', this._handleInput)
    this.addEventListener('change', this._handleDebounceChange)
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this._handleClick)
    this.removeEventListener('input', this._handleInput)
    this.removeEventListener('change', this._handleDebounceChange)

    const eventListeners: [keyof HTMLElementEventMap, EventListener][] = [
      ['mouseenter', this.showTooltip],
      ['mouseleave', this.hideTooltip],
      ['focus', this.showTooltip],
      ['blur', this.hideTooltip],
    ]
    eventListeners.forEach(([event, listener]) => {
      this.buttonPlus.removeEventListener(event, listener)
    })
  }

  get inputValue() {
    return parseInt(this.input.value)
  }

  set inputValue(val) {
    this.input.value = String(val)
  }

  _handleClick(event: Event) {
    event.preventDefault()
    if (this.shopifyCartLoading) return
    const currentTarget = event.target as HTMLElement

    if (!currentTarget) return
    const target =
      currentTarget.tagName === 'BUTTON'
        ? currentTarget
        : currentTarget.closest('button')
    if (!target) return

    const previousValue = this.inputValue

    if (target === this.buttonPlus) {
      if (this.min > parseInt(this.input.step) && this.inputValue == 0) {
        this.inputValue = this.min
      } else {
        this.input.stepUp()
      }
    }

    if (target === this.buttonMinus) {
      if (this.inputValue < this.min) {
        this.inputValue = this.min
      } else {
        this.input.stepDown()
      }
    }

    if (previousValue !== this.inputValue)
      this.input.dispatchEvent(this.changeEvent)

    if (this.min === previousValue && event.target === this.buttonMinus) {
      this.inputValue = this.min
    }
  }

  updatePosition() {
    if (this.buttonPlus.disabled) {
      computePosition(this.buttonPlus, this.tooltip, {
        placement: 'bottom-start',
        strategy: 'absolute',
        middleware: [offset(5), flip()],
      }).then(({ x, y }) => {
        Object.assign(this.tooltip.style, {
          left: `${x}px`,
          top: `${y}px`,
        })
      })
    }
  }

  showTooltip() {
    if (this.buttonPlus.disabled) {
      this.tooltip.style.display = 'block'
      this.updatePosition()
    }
  }

  hideTooltip() {
    this.tooltip.style.display = ''
  }
}
