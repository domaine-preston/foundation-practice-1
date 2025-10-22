import SwiperElement from '@/base/SwiperElement'
import { customElement } from 'lit/decorators.js'

// Let's basic instance Swiper Extend Custom Plugins from Syrah
@customElement('basic-swiper')
export class BasicSwiper extends SwiperElement {
  swiperOptions = {}
}
