/**
 * <printchecks-vendor-form> Web Component
 * Interactive form for creating/editing vendors
 */

import { PrintChecksComponent } from '../utils/component-base'
import type { Vendor, VendorData } from '@printchecks/core'
import baseStyles from '../styles/base.css?raw'

export class PrintChecksVendorForm extends PrintChecksComponent {
  private vendorId: string | null = null
  private currentVendor: Vendor | null = null
  private isLoading = false
  private errorMessage: string | null = null

  static get observedAttributes() {
    return ['vendor-id', 'readonly']
  }

  connectedCallback() {
    this.render()
    this.attachEventListeners()

    // Load vendor if vendor-id is provided
    const vendorId = this.getAttribute('vendor-id')
    if (vendorId) {
      this.loadVendor(vendorId)
    }
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      if (name === 'vendor-id' && newValue) {
        this.loadVendor(newValue)
      } else {
        this.render()
      }
    }
  }

  protected render(): void {
    const readonly = this.getBooleanAttribute('readonly')

    const html = `
      <style>${baseStyles}</style>
      <style>
        :host {
          display: block;
          max-width: 800px;
        }
        
        .vendor-form {
          padding: var(--pc-spacing-lg);
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--pc-spacing-md);
        }
        
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
        
        .form-actions {
          display: flex;
          gap: var(--pc-spacing-md);
          justify-content: flex-end;
          margin-top: var(--pc-spacing-lg);
        }
      </style>
      
      <div class="card vendor-form">
        <div class="card-header">
          <h3 class="mb-0">${this.currentVendor ? 'Edit Vendor' : 'New Vendor'}</h3>
        </div>
        
        <div class="card-body">
          ${this.errorMessage ? `<div class="error-message">${this.errorMessage}</div>` : ''}
          ${this.isLoading ? '<div class="text-center"><span class="spinner"></span> Loading...</div>' : ''}
          
          <form id="vendorForm" class="${this.isLoading ? 'd-none' : ''}">
            <div class="form-group">
              <label class="form-label" for="name">Vendor Name *</label>
              <input 
                type="text" 
                id="name" 
                name="name"
                class="form-control" 
                placeholder="ABC Company"
                ${readonly ? 'disabled' : ''}
                required
              />
            </div>
            
            <div class="form-group">
              <label class="form-label" for="displayName">Display Name</label>
              <input 
                type="text" 
                id="displayName" 
                name="displayName"
                class="form-control" 
                placeholder="Friendly display name"
                ${readonly ? 'disabled' : ''}
              />
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  class="form-control" 
                  placeholder="contact@vendor.com"
                  ${readonly ? 'disabled' : ''}
                />
              </div>
              
              <div class="form-group">
                <label class="form-label" for="phone">Phone</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone"
                  class="form-control" 
                  placeholder="(555) 123-4567"
                  ${readonly ? 'disabled' : ''}
                />
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="taxId">Tax ID / EIN</label>
              <input 
                type="text" 
                id="taxId" 
                name="taxId"
                class="form-control" 
                placeholder="XX-XXXXXXX"
                ${readonly ? 'disabled' : ''}
              />
            </div>
            
            <div class="form-group">
              <label class="form-label" for="address">Address</label>
              <input 
                type="text" 
                id="address" 
                name="address"
                class="form-control" 
                placeholder="123 Main St"
                ${readonly ? 'disabled' : ''}
              />
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="city">City</label>
                <input 
                  type="text" 
                  id="city" 
                  name="city"
                  class="form-control" 
                  placeholder="New York"
                  ${readonly ? 'disabled' : ''}
                />
              </div>
              
              <div class="form-group">
                <label class="form-label" for="state">State</label>
                <input 
                  type="text" 
                  id="state" 
                  name="state"
                  class="form-control" 
                  maxlength="2"
                  placeholder="NY"
                  ${readonly ? 'disabled' : ''}
                />
              </div>
              
              <div class="form-group">
                <label class="form-label" for="zip">ZIP Code</label>
                <input 
                  type="text" 
                  id="zip" 
                  name="zip"
                  class="form-control" 
                  pattern="[0-9]{5}"
                  maxlength="5"
                  placeholder="10001"
                  ${readonly ? 'disabled' : ''}
                />
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="notes">Notes</label>
              <textarea 
                id="notes" 
                name="notes"
                class="form-control" 
                rows="3"
                placeholder="Additional notes about this vendor..."
                ${readonly ? 'disabled' : ''}
              ></textarea>
            </div>
            
            ${
              !readonly
                ? `
              <div class="form-actions">
                <button type="button" class="btn btn-secondary" part="reset-button" id="resetBtn">
                  Reset
                </button>
                <button type="submit" class="btn btn-primary" part="submit-button" id="submitBtn">
                  ${this.currentVendor ? 'Update Vendor' : 'Create Vendor'}
                </button>
              </div>
            `
                : ''
            }
          </form>
        </div>
      </div>
    `

    this.setInnerHTML(html)

    // Populate form if we have a current vendor
    if (this.currentVendor) {
      this.populateForm(this.currentVendor)
    }
  }

  private attachEventListeners(): void {
    const form = this.querySelector<HTMLFormElement>('#vendorForm')
    const submitBtn = this.querySelector('#submitBtn')
    const resetBtn = this.querySelector('#resetBtn')

    if (form && submitBtn) {
      form.addEventListener('submit', (e) => this.handleSubmit(e))
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.handleReset())
    }
  }

  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault()

    const formData = this.getFormData()
    if (!formData) return

    try {
      this.errorMessage = null
      this.isLoading = true
      this.render()

      let vendor: Vendor
      if (this.currentVendor) {
        // Update existing vendor
        vendor = await this.core.vendors.updateVendor(this.currentVendor.id!, formData)
        this.emit('vendor-updated', { vendor })
      } else {
        // Create new vendor
        vendor = await this.core.vendors.createVendor(formData as VendorData)
        this.emit('vendor-created', { vendor })
      }

      this.currentVendor = vendor
      this.isLoading = false
      this.render()

      // Optionally reset form after creation
      if (!this.currentVendor.id) {
        setTimeout(() => this.handleReset(), 1000)
      }
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to save vendor'
      this.isLoading = false
      this.render()
      this.emit('error', { error: this.errorMessage })
    }
  }

  private handleReset(): void {
    const form = this.querySelector<HTMLFormElement>('#vendorForm')
    if (form) {
      form.reset()
    }
    this.currentVendor = null
    this.errorMessage = null
    this.render()
  }

  private getFormData(): Partial<VendorData> | null {
    const form = this.querySelector<HTMLFormElement>('#vendorForm')
    if (!form) return null

    const formData = new FormData(form)
    const data: Partial<VendorData> = {}

    // Required fields
    data.name = formData.get('name') as string
    data.address = formData.get('address') as string
    data.city = formData.get('city') as string
    data.state = formData.get('state') as string
    data.zip = formData.get('zip') as string

    // Optional fields
    const displayName = formData.get('displayName') as string
    if (displayName) data.displayName = displayName

    const email = formData.get('email') as string
    if (email) data.email = email

    const phone = formData.get('phone') as string
    if (phone) data.phone = phone

    const taxId = formData.get('taxId') as string
    if (taxId) data.taxId = taxId

    const address = formData.get('address') as string
    if (address) data.address = address

    const city = formData.get('city') as string
    if (city) data.city = city

    const state = formData.get('state') as string
    if (state) data.state = state

    const zip = formData.get('zip') as string
    if (zip) data.zip = zip

    const notes = formData.get('notes') as string
    if (notes) data.notes = notes

    return data
  }

  private populateForm(vendor: Vendor): void {
    const form = this.querySelector<HTMLFormElement>('#vendorForm')
    if (!form) return

    // Populate all fields
    this.setInputValue('name', vendor.name)
    this.setInputValue('displayName', vendor.displayName || '')
    this.setInputValue('email', vendor.email || '')
    this.setInputValue('phone', vendor.phone || '')
    this.setInputValue('taxId', vendor.taxId || '')
    this.setInputValue('address', vendor.address || '')
    this.setInputValue('city', vendor.city || '')
    this.setInputValue('state', vendor.state || '')
    this.setInputValue('zip', vendor.zip || '')
    this.setInputValue('notes', vendor.notes || '')
  }

  private setInputValue(id: string, value: string): void {
    const input = this.querySelector<HTMLInputElement | HTMLTextAreaElement>(`#${id}`)
    if (input) {
      input.value = value
    }
  }

  private async loadVendor(vendorId: string): Promise<void> {
    try {
      this.isLoading = true
      this.errorMessage = null
      this.render()

      const vendor = await this.core.vendors.getVendor(vendorId)
      if (vendor) {
        this.currentVendor = vendor
        this.vendorId = vendorId
      } else {
        this.errorMessage = 'Vendor not found'
      }

      this.isLoading = false
      this.render()
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to load vendor'
      this.isLoading = false
      this.render()
      this.emit('error', { error: this.errorMessage })
    }
  }

  // Public methods
  public async save(): Promise<Vendor | null> {
    const formData = this.getFormData()
    if (!formData) return null

    try {
      if (this.currentVendor) {
        return await this.core.vendors.updateVendor(this.currentVendor.id!, formData)
      } else {
        return await this.core.vendors.createVendor(formData as VendorData)
      }
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to save vendor'
      this.render()
      return null
    }
  }

  public reset(): void {
    this.handleReset()
  }

  public setVendor(vendor: Vendor): void {
    this.currentVendor = vendor
    this.render()
  }
}

// Register the custom element
customElements.define('printchecks-vendor-form', PrintChecksVendorForm)
