import { BaseElementWithoutShadowDOM } from '@/base/BaseElement'
import { customElement, property, query } from 'lit/decorators.js'

@customElement('custom-accordion')
export class CustomAccordion extends BaseElementWithoutShadowDOM {
  @query('[data-accordion-toggle]')
  toggleButton!: HTMLButtonElement

  @query('[data-accordion-content]')
  content!: HTMLDivElement

  @property({ type: Boolean, reflect: true })
  expanded = false

  private boundOnClick!: EventListener
  private boundHandleLinkedAccordions: EventListener

  constructor() {
    super()
    this.boundOnClick = this.onClick.bind(this)
    this.boundHandleLinkedAccordions = this.handleLinkedAccordions.bind(this)
  }

  connectedCallback(): void {
    super.connectedCallback()
    this.toggleButton.addEventListener('click', this.boundOnClick)

    if (this.hasAttribute('data-accordion-group')) {
      this.toggleButton.addEventListener(
        'click',
        this.boundHandleLinkedAccordions
      )
    }
  }

  disconnectedCallback(): void {
    this.toggleButton.removeEventListener('click', this.boundOnClick)

    if (this.boundHandleLinkedAccordions) {
      this.toggleButton.removeEventListener(
        'click',
        this.boundHandleLinkedAccordions
      )
    }

    super.disconnectedCallback()
  }
  onClick() {
    this.toggleExpand()
  }

  showContent() {
    this.content.setAttribute('data-open', 'true')
  }

  hideContent() {
    this.content.removeAttribute('data-open')
  }

  toggleExpand() {
    if (this.expanded) {
      this.expanded = false
      this.toggleButton.setAttribute('aria-expanded', 'false')
      this.hideContent()
    } else {
      this.expanded = true
      this.toggleButton.setAttribute('aria-expanded', 'true')
      this.showContent()
    }
  }

  handleLinkedAccordions() {
    const linkedAccordions = document.querySelectorAll(
      `[data-accordion-group="${this.getAttribute('data-accordion-group')}"]`
    )

    linkedAccordions.forEach((accordion) => {
      const customAccordion = accordion as CustomAccordion

      if (customAccordion !== this) {
        customAccordion.expanded = false
        customAccordion.toggleButton.setAttribute('aria-expanded', 'false')
        customAccordion.hideContent()
      }
    })
  }
}
