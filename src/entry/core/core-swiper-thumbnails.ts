import SwiperElement from '@/base/SwiperElement'
import { customElement } from 'lit/decorators.js'
import type { SwiperOptions } from 'swiper/types'

@customElement('swiper-thumbnails')
export class SwiperThumbnails extends SwiperElement {
  swiperOptions = {
    slidesPerView: 1,
    direction: 'horizontal',
    breakpoints: {
      1024: {
        direction: 'vertical',
      },
    },
  } as SwiperOptions
}
