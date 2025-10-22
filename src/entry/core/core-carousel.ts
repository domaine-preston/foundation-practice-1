/**
 * Sources:
 * https://medium.com/web-dev-survey-from-kyoto/vanilla-js-carousel-that-is-accessible-swipeable-infinite-scrolling-and-autoplaying-5de5f281ef13
 * https://www.w3.org/WAI/ARIA/apg/patterns/carousel/examples/carousel-1-prev-next/
 */
import { BaseElementWithoutShadowDOM } from '@/base/BaseElement'
import { throttle } from '@/lib/throttle'
import { PropertyValueMap } from 'lit'
import { property, query, queryAll, state } from 'lit/decorators.js'

/**
 *
 * To be passed in as attributes:
 * @param slideInterval: time in ms to wait before scrolling to the next slide
 * @param loop: if true, the carousel will loop infinitely. Assumed that if autoplay is enabled, it will loop
 * @param itemsToShow: number of items to show at once on desktop
 * @param itemsToShowMobile: number of items to show at once on mobile, defaults to 1
 * @param isMobileOnly: if true, the carousel will only be shown on mobile devices
 * @param isDesktopOnly: if true, the carousel will only be shown on desktop devices
 * @param itemsToScroll: number of items to scroll at once. Be sure to adjust the scroll snapping on core-carousel-slide in index.css as necessary. Is always 1 on mobile.
 * @param isMultiScroll: *not used in the typescript; used in CSS to manage item to scroll*
 * Calculated properties:
 * @param n_slides: number of actual slides in the carousel
 * @param n_slidesCloned: number of slides cloned for looping divided by 2
 * @param slideWidth: width of each slide
 * @param n_pages: number of pages in the carousel, calculated based on the number of slides and items to show/scroll
 * @param pageWidth: width of each page, calculated based on the number of items to show and the slide width
 */

export class CoreCarousel extends BaseElementWithoutShadowDOM {
  @query('[data-carousel-slides]')
  slidesWrapper!: HTMLDivElement

  @queryAll('[data-carousel-slide]')
  slides!: HTMLDivElement[]

  @query('[data-nav-dots-wrapper]')
  navDotsWrapper!: HTMLDivElement

  @queryAll('[data-nav-dot]')
  navDots!: HTMLDivElement[]

  @query('[data-carousel-prev]')
  prevBtn!: HTMLButtonElement
  @query('[data-carousel-next]')
  nextBtn!: HTMLButtonElement

  @query('[data-page-counter]')
  pageCounter!: HTMLDivElement

  @query('[data-progress]')
  progressBar!: HTMLDivElement

  n_slides: number = 0
  n_slidesCloned: number = 0
  n_pages: number = 0
  slideWidth: number = 0
  pageWidth: number = 0
  spaceBtwSlides: number = 0
  resizeObserver: ResizeObserver | null = null
  isDesktop: boolean = false
  itemsToShow: number = 1

  @property({
    type: Number,
    attribute: 'data-slide-interval',
    converter: {
      fromAttribute: (value: string) => {
        return value ? parseInt(value, 10) : 0
      },
    },
  })
  slideInterval: number = parseInt(this.dataset.slideInterval || '0', 10)

  @property({
    type: Boolean,
    attribute: 'data-is-mobile-only',
    converter: (value) => value === 'true',
  })
  isMobileOnly: boolean = this.dataset.isMobileOnly === 'true'

  @property({
    type: Boolean,
    attribute: 'data-is-desktop-only',
    converter: (value) => value === 'true',
  })
  isDesktopOnly: boolean = this.dataset.isDesktopOnly === 'true'

  @property({
    type: Number,
    attribute: 'data-items-to-scroll',
    converter: {
      fromAttribute: (value: string) => {
        return value ? parseInt(value, 10) : 1
      },
    },
  })
  itemsToScroll: number = parseInt(this.dataset.itemsToScroll || '1', 10)

  @property({
    type: Boolean,
    attribute: 'data-loop',
    converter(value) {
      return value === 'true'
    },
  })
  loop!: boolean // if true, the carousel will loop infinitely. Assumed that if autoplay is enabled, it will loop

  @property({ type: Boolean, reflect: true })
  isPlaying: boolean = false

  @property({
    type: String,
    attribute: 'connected-carousels',
    converter: (value) => value?.split(','),
  })
  connectedCarousels: string[] | null = null

  @state()
  currentSlide = 0

  scrollTimer: number | null = null
  intervalId: number | null = null

  eventListenersHaveBeenAdded = false
  _slidesMutationWatcher: MutationObserver | null = null
  _isCloningSlides: boolean = false

  throttledPrevClick: () => void
  throttledNextClick: () => void

  constructor() {
    super()

    this.isDesktop = window.matchMedia('(min-width: 768px)').matches

    this.play = this.play.bind(this)
    this.stop = this.stop.bind(this)
    this.goto = this.goto.bind(this)
    this.resetScroll = this.resetScroll.bind(this)
    this.markNavdot = this.markNavdot.bind(this)
    this.updateNavdot = this.updateNavdot.bind(this)
    this.setUpIntersectionObserver = this.setUpIntersectionObserver.bind(this)

    this.throttledPrevClick = throttle(this.handlePrevClick, 400)
    this.throttledNextClick = throttle(this.handleNextClick, 400)
  }

  connectedCallback(): void {
    super.connectedCallback()

    if (this.slides.length === 0) {
      console.warn('No slides found in the carousel')
      return
    }

    this.init()
    this._setupSlidesMutationObserver()
  }

  _setupSlidesMutationObserver() {
    if (this._slidesMutationWatcher || this.loop) return
    this._slidesMutationWatcher = new MutationObserver(() => {
      if (this._isCloningSlides) return
      this.init()
    })

    this._slidesMutationWatcher.observe(this.slidesWrapper, {
      childList: true,
    })
  }

  private init() {
    this.initializeCarousel()
    this.addEventListeners()

    if (this.slideInterval > 0) {
      this.setupAutoplay()
    }

    if (this.navDotsWrapper) {
      this.setupNavDots()
    }

    if (this.loop) {
      this.setupLoop()
    }

    if (this.pageCounter) {
      this.setupPageCounter()
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback()

    this.slidesWrapper.removeEventListener('scroll', this.handleScroll)
    this.removeEventListener('pointerenter', this.stop)
    this.removeEventListener('pointerleave', this.play)
    this.removeEventListener('focus', this.stop, true)
    this.removeEventListener('blur', this.play, true)
    this.removeEventListener('touchstart', this.stop)
    this.resizeObserver?.disconnect()
    if (this.prevBtn) {
      this.prevBtn.removeEventListener('click', this.throttledPrevClick)
    }
    if (this.nextBtn) {
      this.nextBtn.removeEventListener('click', this.throttledNextClick)
    }
    if (this.scrollTimer) clearTimeout(this.scrollTimer)
  }

  protected updated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    super.updated(_changedProperties)

    // if the carousel is mobile only and you're on a desktop, or vice versa, we don't need to do anything
    if (
      (this.isDesktop && this.isMobileOnly) ||
      (!this.isDesktop && this.isDesktopOnly)
    ) {
      return
    }

    if (_changedProperties.has('currentSlide')) {
      if ((this.prevBtn || this.nextBtn) && !this.loop) {
        this.handlePrevNextBtn()
      }

      if (this.navDotsWrapper) {
        this.navDots.forEach((navdot) => {
          navdot.setAttribute('aria-disabled', 'false')
        })

        this.updateNavdot()
      }

      if (this.connectedCarousels) {
        this._syncConnectedCarousels()
      }
    }

    if (_changedProperties.has('isPlaying')) {
      this.isPlaying ? this.play() : this.stop()
    }
  }

  /**
   * @description Initializes the carousel by setting the number of slides, slide width, and space between slides.
   * Used no matter what the carousel is doing (looping, autoplay, etc.)
   */
  initializeCarousel() {
    this.itemsToShow = this.isDesktop
      ? parseInt(this.dataset.itemsToShow || '1', 10)
      : parseInt(this.dataset.itemsToShowMobile || '1', 10)

    this.itemsToScroll = this.isDesktop
      ? parseInt(this.dataset.itemsToScroll || '1', 10)
      : 1

    this.n_slides = Array.from(this.slides).filter(
      (el) => !el.hasAttribute('aria-hidden')
    ).length
    this.n_slidesCloned = this.dataset.loop === 'true' ? 1 : 0
    this.slideWidth = this.slides[0].offsetWidth
    this.spaceBtwSlides = this.getSpaceBetweenSlides()
    this.slidesWrapper.style.scrollBehavior = 'smooth'

    this.n_pages =
      this.itemsToShow === 1
        ? this.n_slides
        : Math.ceil((this.n_slides - this.itemsToShow) / this.itemsToScroll + 1)
    this.pageWidth =
      this.itemsToShow === 1
        ? this.slideWidth
        : this.slideWidth * this.itemsToShow +
          this.spaceBtwSlides * (this.itemsToShow - 1)
  }

  private setupPageCounter() {
    if (this.pageCounter) {
      this.pageCounter.innerHTML = `${this.currentSlide + 1} / ${this.n_pages}`
      this.pageCounter.setAttribute(
        'aria-label',
        `Page ${this.currentSlide + 1} of ${this.n_pages}`
      )
    }
  }

  private generateNavDots() {
    if (this.navDotsWrapper) {
      this.navDotsWrapper.innerHTML = ''
      this.navDotsWrapper.innerHTML = Array.from(
        { length: this.n_pages },
        (_, i) =>
          `<button data-nav-dot="${i}" type="button" aria-label="${i + 1} of ${this.n_pages}" aria-disabled="${i === 0 ? 'true' : 'false'}"></button>`
      ).join('')
    } else {
      console.warn('No nav dots wrapper found in the carousel')
    }
  }

  /**
   * @description Adds event listeners to the carousel for scrolling and resizing.
   * Used no matter what the carousel is doing (looping, autoplay, etc.)
   */
  private addEventListeners() {
    this.eventListenersHaveBeenAdded = true
    this.setUpResizeObserver()
    this.slidesWrapper.addEventListener('scroll', this.handleScroll, {
      passive: true,
    })
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', this.handlePrevClick)
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', this.handleNextClick)
    }
  }

  /**
   * @description Sets up the autoplay feature for the carousel.
   * If the user hovers over the carousel, the autoplay will stop.
   * If the user leaves the carousel, the autoplay will start again.
   */
  private setupAutoplay() {
    this.setUpIntersectionObserver()
    this.addEventListener('pointerenter', () => {
      this.isPlaying = false
    })
    this.addEventListener('pointerleave', () => {
      this.isPlaying = true
    })
    this.addEventListener(
      'focus',
      () => {
        this.isPlaying = false
      },
      true
    )
    this.addEventListener(
      'blur',
      () => {
        if (!this.matches(':hover')) this.isPlaying = true
      },
      true
    )
    this.addEventListener('touchstart', () => {
      this.isPlaying = false
    })
  }

  handlePrevClick = () => {
    const index = this.index_slideCurrent
    index >= 0 ? this.goto(index - 1) : this.resetScroll(false)
  }

  handleNextClick = () => {
    const index = this.index_slideCurrent
    index <= this.n_slides ? this.goto(index + 1) : this.resetScroll(true)
  }

  /**
   * @description Sets up the navigation dots for the carousel.
   * Each dot will navigate to the corresponding slide when clicked.
   * Adding the event listener to the nav dots wrapper and checking if the target is a nav dot
   * is more efficient than adding an event listener to each nav dot and allows for more flexibility
   */
  private setupNavDots() {
    this.generateNavDots()
    this.navDotsWrapper.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      const index = target.dataset.navDot ? parseInt(target.dataset.navDot) : -1
      if (index >= 0) {
        this.goto(index)
        this.markNavdot(index)
      }
    })
  }

  /**
   * @description Sets up the looping feature for the carousel.
   * Clones the first and last slides and adds them to the beginning and end of the carousel.
   * This allows for infinite scrolling of the carousel.
   * The cloned slides are hidden from screen readers and are not focusable.
   */
  private setupLoop() {
    if (this.slides.length === 0) return
    this._isCloningSlides = true
    this.cloneSlide(this.slides[0], 'end')
    this.cloneSlide(this.slides[this.n_slides - 1], 'start')
    this.handleAriaHiddenSlides()
    this._isCloningSlides = false

    requestAnimationFrame(() => {
      const amountToScroll =
        this.itemsToScroll === 1
          ? this.slideWidth + this.spaceBtwSlides
          : this.pageWidth

      this.slidesWrapper.style.scrollBehavior = 'auto'
      this.slidesWrapper.scrollTo(amountToScroll * this.n_slidesCloned, 0)
      this.slidesWrapper.style.scrollBehavior = 'smooth'
    })
  }

  /**
   * @description Clones a slide and adds it to the beginning or end of the carousel.
   * @param slide - The slide to clone
   * @param position - The position to add the cloned slide ('start' or 'end')
   */
  private cloneSlide(slide: HTMLElement, position: 'start' | 'end') {
    const clone = slide.cloneNode(true) as HTMLElement
    clone.setAttribute('aria-hidden', 'true')
    clone.removeAttribute('tabindex')
    position === 'start'
      ? this.slidesWrapper.prepend(clone)
      : this.slidesWrapper.append(clone)
  }

  private getSpaceBetweenSlides(): number {
    return (
      Number(
        window
          .getComputedStyle(this.slidesWrapper)
          .getPropertyValue('grid-column-gap')
          .slice(0, -2)
      ) || 0
    )
  }

  /**
   * @description Returns the index of the current slide.
   * The index is calculated by dividing the scrollLeft position of the slides wrapper by the slide width
   * and subtracting the number of cloned slides.
   * @returns The index of the current slide
   */
  get index_slideCurrent() {
    const amountToScroll =
      this.itemsToScroll === 1
        ? this.slideWidth + this.spaceBtwSlides
        : this.pageWidth

    const index =
      Math.round(this.slidesWrapper.scrollLeft / amountToScroll) -
      this.n_slidesCloned

    this.currentSlide = index
    return index
  }

  /**
   * @description Sets up an Intersection Observer to detect when the carousel is in view.
   * If the carousel is in view, the autoplay will start.
   * If the carousel is not in view, the autoplay will stop.
   */
  setUpIntersectionObserver() {
    const callback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.isPlaying = true
        } else {
          this.isPlaying = false
        }
      })
    }
    const observer = new IntersectionObserver(callback, { threshold: 0.99 })
    // pause the autoplay when the carousel is not in the viewport
    observer.observe(this)
  }

  /**
   * @description Hides the cloned slides, and their children, from screen readers and makes them not focusable.
   * (there is no need to tab to Cloned Slide 1 when you can tab to Slide 1)
   */
  private handleAriaHiddenSlides() {
    this.slidesWrapper.querySelectorAll('[aria-hidden]').forEach((slide) => {
      slide.querySelectorAll('[tabindex], button, a').forEach((el) => {
        el.setAttribute('tabindex', '-1')
      })
    })
  }

  private _syncConnectedCarousels() {
    try {
      if (!this.connectedCarousels) return
      this.connectedCarousels.forEach((carouselId) => {
        const carousel = document.getElementById(carouselId)
        if (carousel && carousel !== this) {
          ;(carousel as CoreCarousel).goto(this.currentSlide)
        }
      })
    } catch (error) {
      console.error('Error syncing connected carousels:', error)
    }
  }

  /**
   *
   * @param forward - If true, scroll to the last slide ("rewind"). If false, scroll to the first slide.
   * @description Resets the scroll position of the carousel to the first or last slide.
   * This is used when the carousel is looping and the user scrolls to the cloned slides.
   * The smooth scrolling is temporarily disabled to allow for instant scrolling to the correct slide.
   * @returns void
   */
  resetScroll(forward: boolean) {
    this.slidesWrapper.style.scrollBehavior = 'auto'

    requestAnimationFrame(() => {
      this.slidesWrapper.scrollTo(
        this.pageWidth * (forward ? this.n_pages : this.n_slidesCloned),
        0
      )
      this.slidesWrapper.style.scrollBehavior = 'smooth'
    })
  }

  goto(index: number) {
    if (this.prevBtn) {
      this.prevBtn.disabled = true
    }
    if (this.nextBtn) {
      this.nextBtn.disabled = true
    }
    this.currentSlide = index

    const amountToScroll =
      this.itemsToScroll === 1
        ? this.slideWidth + this.spaceBtwSlides
        : this.pageWidth

    this.slidesWrapper.scrollTo(
      amountToScroll * (index + this.n_slidesCloned),
      0
    )
  }

  play() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }
    this.intervalId && window.clearInterval(this.intervalId)
    this.slidesWrapper.setAttribute('aria-live', 'off')
    this.intervalId = window.setInterval(
      this.handleNextClick,
      this.slideInterval
    )
  }

  stop() {
    this.intervalId && clearInterval(this.intervalId)
    this.slidesWrapper.setAttribute('aria-live', 'polite')
  }

  /**
   * @description Handles the scroll event for the carousel.
   * This function will update the navigation dots, reset the scroll position if looping,
   * and update the progress bar if it exists.
   * It will also disable the previous and next buttons if the carousel is not looping
   * and the user is at the first or last slide.
   */
  handleScroll = () => {
    requestAnimationFrame(() => {
      this.currentSlide = this.index_slideCurrent

      if (this.scrollTimer) clearTimeout(this.scrollTimer) // to cancel if scroll continues

      this._updateScrollProgress()

      this.scrollTimer = window.setTimeout(() => {
        if (this.prevBtn) {
          this.prevBtn.disabled = false
        }
        if (this.nextBtn) {
          this.nextBtn.disabled = false
        }

        if (this.pageCounter) {
          this.setupPageCounter()
        }
        // when the carousel is scrolled backward to reveal about half of the cloned last slide, the forward() gets executed.
        if (
          this.loop &&
          this.slidesWrapper.scrollLeft <
            this.pageWidth * (this.n_slidesCloned - 1 / 2)
        ) {
          this.resetScroll(true)
        }
        if (
          this.loop &&
          this.slidesWrapper.scrollLeft >
            this.pageWidth * (this.n_slides - 1 + this.n_slidesCloned + 1 / 2)
        ) {
          this.resetScroll(false)
        }
      }, 200)
    })
  }

  private _updateScrollProgress() {
    const progressBar = this.progressBar
    if (!progressBar) return
    const scrollContainer = this.slidesWrapper

    // Account for visible width, so progress is 100% when scrolled to the end
    const maxScroll = scrollContainer.scrollWidth - scrollContainer.offsetWidth
    const scrollXProgress =
      maxScroll > 0 ? (scrollContainer.scrollLeft / maxScroll) * 100 : 0

    progressBar.style.setProperty('--scroll', `${Math.ceil(scrollXProgress)}%`)
  }

  /**
   * @description Function to handle window resize events.
   * This function will recalculate the slide width and space between slides
   * and reset the scroll position of the carousel.
   */
  handleResize = () => {
    requestAnimationFrame(() => {
      this.isDesktop = window.matchMedia('(min-width: 768px)').matches

      if (
        (this.isDesktop && this.isMobileOnly) ||
        (!this.isDesktop && this.isDesktopOnly)
      ) {
        return
      }

      this.initializeCarousel()
      this.isPlaying = false

      if (this.slideInterval > 0) {
        this.isPlaying = true
      }

      if (
        ((this.isDesktop && this.isMobileOnly) ||
          (!this.isDesktop && this.isDesktopOnly)) &&
        !this.eventListenersHaveBeenAdded
      ) {
        this.addEventListeners()
      }

      if (this.navDotsWrapper) {
        this.setupNavDots()
      }

      if (this.loop) {
        this.setupLoop()
      }

      if (this.pageCounter) {
        this.setupPageCounter()
      }
    })
  }

  setUpResizeObserver() {
    this.resizeObserver = new ResizeObserver(this.handleResize)
    this.resizeObserver.observe(this.slidesWrapper)
  }

  markNavdot(index: number) {
    if (index < 0 || index >= this.navDots.length || !this.navDots[index])
      return
    this.navDots[index].setAttribute('aria-disabled', 'true')
  }

  updateNavdot() {
    const c = this.index_slideCurrent
    if (c < 0 || c >= this.n_pages) return
    this.markNavdot(c)
  }

  // disabled class is used for styling, since we use the disabled attribute for functionality (ie, to temporarily disable the button while scrolling)
  handlePrevNextBtn() {
    if (this.currentSlide <= 0 && this.prevBtn) {
      this.prevBtn.classList.add('disabled')
      this.prevBtn.disabled = true
    } else if (this.prevBtn) {
      this.prevBtn.classList.remove('disabled')
      this.prevBtn.disabled = false
    }
    if (this.currentSlide >= this.n_pages - 1 && this.nextBtn) {
      this.nextBtn.classList.add('disabled')
      this.nextBtn.disabled = true
    } else if (this.nextBtn) {
      this.nextBtn.classList.remove('disabled')
      this.nextBtn.disabled = false
    }
  }
}

if (!customElements.get('core-carousel')) {
  customElements.define('core-carousel', CoreCarousel)
}
