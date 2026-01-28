/**
 * <printchecks-check-form> Web Component
 * Interactive form for creating/editing checks
 */

import { PrintChecksComponent } from '../utils/component-base'
import type { Check, CheckData } from '@printchecks/core'
import baseStyles from '../styles/base.css?raw'

export class PrintChecksCheckForm extends PrintChecksComponent {
  private checkId: string | null = null
  private currentCheck: Check | null = null
  private isLoading = false
  private errorMessage: string | null = null

  static get observedAttributes() {
    return ['check-id', 'bank-account-id', 'vendor-id', 'readonly']
  }

  connectedCallback() {
    this.render()
    this.attachEventListeners()

    // Load check if check-id is provided
    const checkId = this.getAttribute('check-id')
    if (checkId) {
      this.loadCheck(checkId)
    }
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      if (name === 'check-id' && newValue) {
        this.loadCheck(newValue)
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
        
        .check-form {
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
      
      <div class="card check-form">
        <div class="card-header">
          <h3 class="mb-0">${this.currentCheck ? 'Edit Check' : 'New Check'}</h3>
        </div>
        
        <div class="card-body">
          ${this.errorMessage ? `<div class="error-message">${this.errorMessage}</div>` : ''}
          ${this.isLoading ? '<div class="text-center"><span class="spinner"></span> Loading...</div>' : ''}
          
          <form id="checkForm" class="${this.isLoading ? 'd-none' : ''}">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="checkNumber">Check Number *</label>
                <input 
                  type="text" 
                  id="checkNumber" 
                  name="checkNumber"
                  class="form-control" 
                  ${readonly ? 'disabled' : ''}
                  required
                />
              </div>
              
              <div class="form-group">
                <label class="form-label" for="date">Date *</label>
                <input 
                  type="date" 
                  id="date" 
                  name="date"
                  class="form-control" 
                  ${readonly ? 'disabled' : ''}
                  required
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="payTo">Pay To *</label>
                <input 
                  type="text" 
                  id="payTo" 
                  name="payTo"
                  class="form-control" 
                  placeholder="Payee name"
                  ${readonly ? 'disabled' : ''}
                  required
                />
              </div>
              
              <div class="form-group">
                <label class="form-label" for="amount">Amount *</label>
                <input 
                  type="number" 
                  id="amount" 
                  name="amount"
                  class="form-control" 
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  ${readonly ? 'disabled' : ''}
                  required
                />
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="memo">Memo</label>
              <input 
                type="text" 
                id="memo" 
                name="memo"
                class="form-control" 
                placeholder="Optional memo"
                ${readonly ? 'disabled' : ''}
              />
            </div>
            
            <details>
              <summary style="cursor: pointer; margin-bottom: var(--pc-spacing-md);">Bank Account Information</summary>
              
              <div class="form-group">
                <label class="form-label" for="accountHolderName">Account Holder Name *</label>
                <input 
                  type="text" 
                  id="accountHolderName" 
                  name="accountHolderName"
                  class="form-control" 
                  ${readonly ? 'disabled' : ''}
                  required
                />
              </div>
              
              <div class="form-group">
                <label class="form-label" for="bankName">Bank Name *</label>
                <input 
                  type="text" 
                  id="bankName" 
                  name="bankName"
                  class="form-control" 
                  ${readonly ? 'disabled' : ''}
                  required
                />
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="routingNumber">Routing Number *</label>
                  <input 
                    type="text" 
                    id="routingNumber" 
                    name="routingNumber"
                    class="form-control" 
                    pattern="[0-9]{9}"
                    maxlength="9"
                    placeholder="9 digits"
                    ${readonly ? 'disabled' : ''}
                    required
                  />
                </div>
                
                <div class="form-group">
                  <label class="form-label" for="bankAccountNumber">Account Number *</label>
                  <input 
                    type="text" 
                    id="bankAccountNumber" 
                    name="bankAccountNumber"
                    class="form-control" 
                    ${readonly ? 'disabled' : ''}
                    required
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label class="form-label" for="accountHolderAddress">Address *</label>
                <input 
                  type="text" 
                  id="accountHolderAddress" 
                  name="accountHolderAddress"
                  class="form-control" 
                  ${readonly ? 'disabled' : ''}
                  required
                />
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="accountHolderCity">City *</label>
                  <input 
                    type="text" 
                    id="accountHolderCity" 
                    name="accountHolderCity"
                    class="form-control" 
                    ${readonly ? 'disabled' : ''}
                    required
                  />
                </div>
                
                <div class="form-group">
                  <label class="form-label" for="accountHolderState">State *</label>
                  <input 
                    type="text" 
                    id="accountHolderState" 
                    name="accountHolderState"
                    class="form-control" 
                    maxlength="2"
                    placeholder="XX"
                    ${readonly ? 'disabled' : ''}
                    required
                  />
                </div>
                
                <div class="form-group">
                  <label class="form-label" for="accountHolderZip">ZIP Code *</label>
                  <input 
                    type="text" 
                    id="accountHolderZip" 
                    name="accountHolderZip"
                    class="form-control" 
                    pattern="[0-9]{5}"
                    maxlength="5"
                    ${readonly ? 'disabled' : ''}
                    required
                  />
                </div>
              </div>
            </details>
            
            <div class="form-group">
              <label class="form-label" for="signature">Signature</label>
              <input 
                type="text" 
                id="signature" 
                name="signature"
                class="form-control" 
                placeholder="Your signature"
                ${readonly ? 'disabled' : ''}
              />
            </div>
            
            ${
              !readonly
                ? `
              <div class="form-actions">
                <button type="button" class="btn btn-secondary" part="reset-button" id="resetBtn">
                  Reset
                </button>
                <button type="button" class="btn btn-secondary" part="validate-button" id="validateBtn">
                  Validate
                </button>
                <button type="submit" class="btn btn-primary" part="submit-button" id="submitBtn">
                  ${this.currentCheck ? 'Update Check' : 'Create Check'}
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

    // Populate form if we have a current check
    if (this.currentCheck) {
      this.populateForm(this.currentCheck)
    } else {
      // Set default date to today
      const dateInput = this.querySelector<HTMLInputElement>('#date')
      if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0]
      }
    }
  }

  private attachEventListeners(): void {
    const form = this.querySelector<HTMLFormElement>('#checkForm')
    const submitBtn = this.querySelector('#submitBtn')
    const resetBtn = this.querySelector('#resetBtn')
    const validateBtn = this.querySelector('#validateBtn')

    if (form && submitBtn) {
      form.addEventListener('submit', (e) => this.handleSubmit(e))
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.handleReset())
    }

    if (validateBtn) {
      validateBtn.addEventListener('click', () => this.handleValidate())
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

      let check: Check
      if (this.currentCheck) {
        // Update existing check
        check = await this.core.checks.updateCheck(this.currentCheck.id!, formData)
        this.emit('check-updated', { check })
      } else {
        // Create new check
        check = await this.core.checks.createCheck(formData as CheckData)
        this.emit('check-created', { check })
      }

      this.currentCheck = check
      this.isLoading = false
      this.render()

      // Optionally reset form after creation
      if (!this.currentCheck.id) {
        setTimeout(() => this.handleReset(), 1000)
      }
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to save check'
      this.isLoading = false
      this.render()
      this.emit('error', { error: this.errorMessage })
    }
  }

  private handleReset(): void {
    const form = this.querySelector<HTMLFormElement>('#checkForm')
    if (form) {
      form.reset()
      // Reset date to today
      const dateInput = this.querySelector<HTMLInputElement>('#date')
      if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0]
      }
    }
    this.currentCheck = null
    this.errorMessage = null
    this.render()
  }

  private async handleValidate(): Promise<void> {
    const formData = this.getFormData()
    if (!formData) return

    try {
      // Create a temporary check for validation
      const tempCheck = await this.core.checks.createCheck(formData as CheckData)
      const validation = tempCheck.validate()

      if (validation.isValid) {
        this.errorMessage = null
        this.emit('check-validated', { check: tempCheck, validation })
        alert('Check is valid!')
      } else {
        this.errorMessage = 'Validation errors:\n' + validation.errors.join('\n')
        this.emit('check-validated', { check: tempCheck, validation })
      }
      this.render()
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Validation failed'
      this.render()
      this.emit('error', { error: this.errorMessage })
    }
  }

  private getFormData(): Partial<CheckData> | null {
    const form = this.querySelector<HTMLFormElement>('#checkForm')
    if (!form) return null

    const formData = new FormData(form)
    const data: Partial<CheckData> = {}

    // Required fields
    data.checkNumber = formData.get('checkNumber') as string
    data.date = formData.get('date') as string
    data.payTo = formData.get('payTo') as string
    data.amount = formData.get('amount') as string
    data.memo = (formData.get('memo') as string) || ''
    data.signature = (formData.get('signature') as string) || ''

    // Bank account information
    data.accountHolderName = formData.get('accountHolderName') as string
    data.bankName = formData.get('bankName') as string
    data.routingNumber = formData.get('routingNumber') as string
    data.bankAccountNumber = formData.get('bankAccountNumber') as string
    data.accountHolderAddress = formData.get('accountHolderAddress') as string
    data.accountHolderCity = formData.get('accountHolderCity') as string
    data.accountHolderState = formData.get('accountHolderState') as string
    data.accountHolderZip = formData.get('accountHolderZip') as string

    return data
  }

  private populateForm(check: Check): void {
    const form = this.querySelector<HTMLFormElement>('#checkForm')
    if (!form) return

    // Populate all fields
    this.setInputValue('checkNumber', check.checkNumber)
    this.setInputValue('date', check.date)
    this.setInputValue('payTo', check.payTo)
    this.setInputValue('amount', check.amount.toString())
    this.setInputValue('memo', check.memo || '')
    this.setInputValue('signature', check.signature || '')
    this.setInputValue('accountHolderName', check.accountHolderName)
    this.setInputValue('bankName', check.bankName)
    this.setInputValue('routingNumber', check.routingNumber)
    this.setInputValue('bankAccountNumber', check.bankAccountNumber)
    this.setInputValue('accountHolderAddress', check.accountHolderAddress)
    this.setInputValue('accountHolderCity', check.accountHolderCity)
    this.setInputValue('accountHolderState', check.accountHolderState)
    this.setInputValue('accountHolderZip', check.accountHolderZip)
  }

  private setInputValue(id: string, value: string): void {
    const input = this.querySelector<HTMLInputElement>(`#${id}`)
    if (input) {
      input.value = value
    }
  }

  private async loadCheck(checkId: string): Promise<void> {
    try {
      this.isLoading = true
      this.errorMessage = null
      this.render()

      const check = await this.core.checks.getCheck(checkId)
      if (check) {
        this.currentCheck = check
        this.checkId = checkId
      } else {
        this.errorMessage = 'Check not found'
      }

      this.isLoading = false
      this.render()
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to load check'
      this.isLoading = false
      this.render()
      this.emit('error', { error: this.errorMessage })
    }
  }

  // Public methods
  public async validate(): Promise<any> {
    await this.handleValidate()
  }

  public async save(): Promise<Check | null> {
    const formData = this.getFormData()
    if (!formData) return null

    try {
      if (this.currentCheck) {
        return await this.core.checks.updateCheck(this.currentCheck.id!, formData)
      } else {
        return await this.core.checks.createCheck(formData as CheckData)
      }
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to save check'
      this.render()
      return null
    }
  }

  public reset(): void {
    this.handleReset()
  }
}

// Register the custom element
customElements.define('printchecks-check-form', PrintChecksCheckForm)
