import { BaseElementWithoutShadowDOM } from '@/base/BaseElement'
import { createApiClient, fromURLSearchParams } from '@/mixins/WithApiClient'
import type { PropertyValueMap } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('hydrate-sections-cache')
export class HydrateSectionsCache extends BaseElementWithoutShadowDOM {
  @property({ type: String, attribute: 'base-url' })
  baseUrl: string = ''

  @property({ type: String })
  sections = ''

  @property({ type: Boolean, attribute: 'when-in-view' })
  whenInView: boolean = false

  $api = createApiClient(
    {
      baseUrl: ``,
    },
    'html-update-utility'
  )

  observeElementInView(): Promise<void> {
    return new Promise((resolve) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              observer.disconnect()
              resolve()
            }
          })
        },
        { threshold: 0.1 }
      )
      observer.observe(this)
    })
  }

  protected async firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): Promise<void> {
    super.firstUpdated(_changedProperties)
    if (this.whenInView) {
      await this.observeElementInView()
    }
    const existingParams = fromURLSearchParams(
      new URLSearchParams(this.baseUrl.split('?')[1])
    )
    const urlWithoutParams = this.baseUrl.split('?')[0]
    setTimeout(() => {
      this.$api<Record<string, string>>(
        `${urlWithoutParams ?? window.location.pathname}`,
        {
          method: 'GET',
        },
        {
          params: {
            ...existingParams,
            sections: this.sections,
          },
          withCache: true,
          forceJSON: true,
        }
      )
    }, 0)
  }
}
