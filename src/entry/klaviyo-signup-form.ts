import { BaseElementWithoutShadowDOM } from '@/base/BaseElement'
import { createApiClient } from '@/mixins/WithApiClient'
import { customElement, query } from 'lit/decorators.js'

enum KlaviyoFormState {
  Success = 'success',
  ErrorValidation = 'error-validation',
  ErrorApi = 'error-api',
}

@customElement('klaviyo-signup-form')
export class KlaviyoSignupForm extends BaseElementWithoutShadowDOM {
  @query('form')
  form!: HTMLFormElement

  @query('.js-signup-form-submit')
  submitButton!: HTMLButtonElement

  get locale() {
    return this.getAttribute('locale') || 'en'
  }

  get market() {
    return this.getAttribute('market') || 'CA'
  }

  get country() {
    return this.getAttribute('country') || 'Canada'
  }

  get listId() {
    return this.getAttribute('list-id')
  }

  $klaviyoApi = createApiClient({
    baseUrl: 'https://a.klaviyo.com/client',
    headers: {
      revision: '2024-07-15',
      'Content-Type': 'application/json',
    },
  })

  connectedCallback() {
    super.connectedCallback()

    this.handleFormSubmit = this.handleFormSubmit.bind(this)
    this.form.addEventListener('submit', this.handleFormSubmit)
  }

  disconnectedCallback() {
    this.form.removeEventListener('submit', this.handleFormSubmit)
  }

  get companyIdFromScript(): string | null {
    const klaviyoScript = Array.from(document.scripts).find((script) =>
      script.src.includes('static.klaviyo.com/onsite/js')
    )

    if (klaviyoScript) {
      const url = new URL(klaviyoScript.src)
      const companyId =
        url.searchParams.get('company_id') || url.pathname.split('/')[4]
      return companyId || null
    }
    return null
  }

  async handleFormSubmit(e: SubmitEvent) {
    e.preventDefault()
    const companyId = this.companyIdFromScript
    if (!companyId || !this.listId) {
      // return
    }

    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get('email')
    if (!email) {
      this.showValidationErrorMessage()
      return
    }

    try {
      this.submitButton.disabled = true
      this.resetMessage()

      const options = {
        method: 'POST',
        body: {
          data: {
            type: 'subscription',
            attributes: {
              profile: {
                data: {
                  type: 'profile',
                  attributes: {
                    email: email,
                    locale: this.locale,
                    location: {
                      country: this.country,
                    },
                    properties: {
                      locale: this.locale,
                      locale_iso_code: `${this.locale}-${this.market}`,
                      market: this.market,
                      country: this.country,
                    },
                  },
                },
              },
            },
            relationships: {
              list: { data: { type: 'list', id: this.listId } },
            },
          },
        },
      }

      try {
        await this.$klaviyoApi(
          `/subscriptions/?company_id=${companyId}`,
          options
        )
      } catch (error: any) {
        const hasErrors = error?.errors && error.errors.length > 0
        if (hasErrors) {
          const errorMessage = error.errors[0].detail || 'An error occurred'
          console.error('API Error:', errorMessage)
          this.showApiErrorMessage()
          return
        }
        this.showSuccessMessage()
        setTimeout(() => {
          this.form.reset()
          this.resetMessage()
        }, 6000)
      }
    } catch (e) {
      console.error(e)
      this.showApiErrorMessage()
    } finally {
      this.submitButton.disabled = false
    }
  }

  resetMessage() {
    this.dataset.state = ''
  }

  showSuccessMessage() {
    this.dataset.state = KlaviyoFormState.Success
  }

  showValidationErrorMessage() {
    this.dataset.state = KlaviyoFormState.ErrorValidation
  }

  showApiErrorMessage() {
    this.dataset.state = KlaviyoFormState.ErrorApi
  }
}
