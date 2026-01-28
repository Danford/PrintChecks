/**
 * <printchecks-bank-account-form> Web Component
 * Interactive form for creating/editing bank accounts
 */

import { PrintChecksComponent } from '../utils/component-base'
import type { BankAccount, BankAccountData } from '@printchecks/core'
import baseStyles from '../styles/base.css?raw'

export class PrintChecksBankAccountForm extends PrintChecksComponent {
  private accountId: string | null = null
  private currentAccount: BankAccount | null = null
  private isLoading = false
  private errorMessage: string | null = null

  static get observedAttributes() {
    return ['account-id', 'readonly']
  }

  connectedCallback() {
    this.render()
    this.attachEventListeners()

    // Load account if account-id is provided
    const accountId = this.getAttribute('account-id')
    if (accountId) {
      this.loadAccount(accountId)
    }
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      if (name === 'account-id' && newValue) {
        this.loadAccount(newValue)
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
        
        .account-form {
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
        
        .info-box {
          background: var(--pc-primary-light);
          border-left: 4px solid var(--pc-primary-color);
          padding: var(--pc-spacing-md);
          margin-bottom: var(--pc-spacing-md);
          font-size: 14px;
        }
      </style>
      
      <div class="card account-form">
        <div class="card-header">
          <h3 class="mb-0">${this.currentAccount ? 'Edit Bank Account' : 'New Bank Account'}</h3>
        </div>
        
        <div class="card-body">
          ${this.errorMessage ? `<div class="error-message">${this.errorMessage}</div>` : ''}
          ${this.isLoading ? '<div class="text-center"><span class="spinner"></span> Loading...</div>' : ''}
          
          <div class="info-box">
            🔒 Your banking information is stored securely and never shared.
          </div>
          
          <form id="accountForm" class="${this.isLoading ? 'd-none' : ''}">
            <div class="form-group">
              <label class="form-label" for="accountHolderName">Account Holder Name *</label>
              <input 
                type="text" 
                id="accountHolderName" 
                name="accountHolderName"
                class="form-control" 
                placeholder="John Doe"
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
                placeholder="First National Bank"
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
                  placeholder="123456789"
                  ${readonly ? 'disabled' : ''}
                  required
                />
                <small class="form-text">9 digits</small>
              </div>
              
              <div class="form-group">
                <label class="form-label" for="accountNumber">Account Number *</label>
                <input 
                  type="text" 
                  id="accountNumber" 
                  name="accountNumber"
                  class="form-control" 
                  placeholder="1234567890"
                  ${readonly ? 'disabled' : ''}
                  required
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="accountType">Account Type *</label>
                <select 
                  id="accountType" 
                  name="accountType"
                  class="form-control" 
                  ${readonly ? 'disabled' : ''}
                  required
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                  <option value="business">Business</option>
                </select>
              </div>
              
              <div class="form-group">
                <input 
                  type="number" 
                  class="form-control" 
                  placeholder="0.00"
                  step="0.01"
                  ${readonly ? 'disabled' : ''}
                />
              </div>
            </div>
            
            <h4 style="margin-top: var(--pc-spacing-lg); margin-bottom: var(--pc-spacing-md);">Account Holder Address</h4>
            
            <div class="form-group">
              <label class="form-label" for="address">Street Address *</label>
              <input 
                type="text" 
                id="address" 
                name="address"
                class="form-control" 
                placeholder="123 Main St"
                ${readonly ? 'disabled' : ''}
                required
              />
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="city">City *</label>
                <input 
                  type="text" 
                  id="city" 
                  name="city"
                  class="form-control" 
                  placeholder="New York"
                  ${readonly ? 'disabled' : ''}
                  required
                />
              </div>
              
              <div class="form-group">
                <label class="form-label" for="state">State *</label>
                <input 
                  type="text" 
                  id="state" 
                  name="state"
                  class="form-control" 
                  maxlength="2"
                  placeholder="NY"
                  ${readonly ? 'disabled' : ''}
                  required
                />
              </div>
              
              <div class="form-group">
                <label class="form-label" for="zip">ZIP Code *</label>
                <input 
                  type="text" 
                  id="zip" 
                  name="zip"
                  class="form-control" 
                  pattern="[0-9]{5}"
                  maxlength="5"
                  placeholder="10001"
                  ${readonly ? 'disabled' : ''}
                  required
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
                placeholder="Additional notes about this account..."
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
                  ${this.currentAccount ? 'Update Account' : 'Create Account'}
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

    // Populate form if we have a current account
    if (this.currentAccount) {
      this.populateForm(this.currentAccount)
    }
  }

  private attachEventListeners(): void {
    const form = this.querySelector<HTMLFormElement>('#accountForm')
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

      let account: BankAccount
      if (this.currentAccount) {
        // Update existing account
        account = await this.core.bankAccounts.updateBankAccount(this.currentAccount.id!, formData)
        this.emit('account-updated', { account })
      } else {
        // Create new account
        account = await this.core.bankAccounts.createBankAccount(formData as BankAccountData)
        this.emit('account-created', { account })
      }

      this.currentAccount = account
      this.isLoading = false
      this.render()

      // Optionally reset form after creation
      if (!this.currentAccount.id) {
        setTimeout(() => this.handleReset(), 1000)
      }
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to save account'
      this.isLoading = false
      this.render()
      this.emit('error', { error: this.errorMessage })
    }
  }

  private handleReset(): void {
    const form = this.querySelector<HTMLFormElement>('#accountForm')
    if (form) {
      form.reset()
    }
    this.currentAccount = null
    this.errorMessage = null
    this.render()
  }

  private getFormData(): Partial<BankAccountData> | null {
    const form = this.querySelector<HTMLFormElement>('#accountForm')
    if (!form) return null

    const formData = new FormData(form)
    const data: Partial<BankAccountData> = {}

    // Required fields
    data.accountHolderName = formData.get('accountHolderName') as string
    data.bankName = formData.get('bankName') as string
    data.routingNumber = formData.get('routingNumber') as string
    data.accountNumber = formData.get('accountNumber') as string
    data.accountType = formData.get('accountType') as 'checking' | 'savings' | 'business'
    data.accountHolderAddress = formData.get('address') as string
    data.accountHolderCity = formData.get('city') as string
    data.accountHolderState = formData.get('state') as string
    data.accountHolderZip = formData.get('zip') as string

    // Optional fields
    const notes = formData.get('notes') as string
    if (notes) data.notes = notes

    return data
  }

  private populateForm(account: BankAccount): void {
    const form = this.querySelector<HTMLFormElement>('#accountForm')
    if (!form) return

    // Populate all fields
    this.setInputValue('accountHolderName', account.accountHolderName)
    this.setInputValue('bankName', account.bankName)
    this.setInputValue('routingNumber', account.routingNumber)
    this.setInputValue('accountNumber', account.accountNumber)
    this.setInputValue('accountType', account.accountType || 'checking')
    this.setInputValue('address', account.accountHolderAddress)
    this.setInputValue('city', account.accountHolderCity)
    this.setInputValue('state', account.accountHolderState)
    this.setInputValue('zip', account.accountHolderZip)
    this.setInputValue('notes', account.notes || '')
  }

  private setInputValue(id: string, value: string): void {
    const input = this.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      `#${id}`
    )
    if (input) {
      input.value = value
    }
  }

  private async loadAccount(accountId: string): Promise<void> {
    try {
      this.isLoading = true
      this.errorMessage = null
      this.render()

      const account = await this.core.bankAccounts.getBankAccount(accountId)
      if (account) {
        this.currentAccount = account
        this.accountId = accountId
      } else {
        this.errorMessage = 'Account not found'
      }

      this.isLoading = false
      this.render()
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to load account'
      this.isLoading = false
      this.render()
      this.emit('error', { error: this.errorMessage })
    }
  }

  // Public methods
  public async save(): Promise<BankAccount | null> {
    const formData = this.getFormData()
    if (!formData) return null

    try {
      if (this.currentAccount) {
        return await this.core.bankAccounts.updateBankAccount(this.currentAccount.id!, formData)
      } else {
        return await this.core.bankAccounts.createBankAccount(formData as BankAccountData)
      }
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to save account'
      this.render()
      return null
    }
  }

  public reset(): void {
    this.handleReset()
  }

  public setAccount(account: BankAccount): void {
    this.currentAccount = account
    this.render()
  }
}

// Register the custom element
customElements.define('printchecks-bank-account-form', PrintChecksBankAccountForm)
