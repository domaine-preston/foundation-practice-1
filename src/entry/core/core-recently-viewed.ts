import { BaseElementWithoutShadowDOM } from '@/base/BaseElement'
import recentlyViewedStorage from '@/lib/recentlyViewedStorage'
import { customElement, property, query } from 'lit/decorators.js'

@customElement('recently-viewed')
export class RecentlyViewed extends BaseElementWithoutShadowDOM {
  productHandles: string[] = []

  @property({ type: String, attribute: 'exclude-product-handle' })
  excludeProductHandle = ''

  @property({ type: Object, attribute: 'carousel-props' })
  carouselProps = {
    itemsToScroll: 2,
    itemsToShow: 4,
    itemsToShowMobile: 2.5,
    slidesGap: 8,
    slidesGapToken: 'gap-sm',
  }

  @query('[data-recently-viewed]')
  recentlyViewedContainer!: HTMLElement

  connectedCallback() {
    super.connectedCallback()
    this.productHandles = recentlyViewedStorage
      .list()
      .filter((handle) => handle !== this.excludeProductHandle)

    if (this.productHandles.length === 0) {
      return this.remove()
    }

    this._initialize()
    this.classList.remove('hidden')
  }

  renderProduct(handle: string) {
    return `
      <dynamic-product-card data-carousel-slide class='core-carousel-slide overflow-hidden' handle='${handle}'></dynamic-product-card>
    `
  }

  _initialize() {
    if (!this.recentlyViewedContainer || !this.carouselProps) return
    const productCards = this.productHandles.map(this.renderProduct).join('')

    this.recentlyViewedContainer.innerHTML = `
      <core-carousel
        data-items-to-scroll='${this.carouselProps.itemsToScroll}'
        data-items-to-show='${this.carouselProps.itemsToShow}'
        data-items-to-show-mobile='${this.carouselProps.itemsToShowMobile}'
        data-slides-gap='${this.carouselProps.slidesGap}'
        data-multi-scroll
      >
        <div class='container px-pagemargin inset-0 flex justify-between items-center h-full w-full absolute'>
          <button
            class='core-carousel-button core-carousel-button-prev bg-accent-01 text-foreground-inverse'
            data-carousel-prev
            disabled
          >
            <svg-icon src='icon-arrow' class="rotate-180" width="16px"></svg-icon>
          </button>
          <button
            class='core-carousel-button core-carousel-button-next bg-accent-01 text-foreground-inverse'
            data-carousel-next
          >
            <svg-icon src='icon-arrow' width="16px"></svg-icon>
          </button>
        </div>
        <div 
          class='core-carousel-slides ${this.carouselProps.slidesGapToken}'
          aria-atomic='false'
          aria-live='off'
          data-carousel-slides
        >
          ${productCards}
        </div>
      </core-carousel>
    `
  }
}
