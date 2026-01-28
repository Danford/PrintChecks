/**
 * <printchecks-bank-account-list> Web Component
 * Displays a list of bank accounts with search and filter capabilities
 */

import { PrintChecksComponent } from '../utils/component-base'
import type { BankAccount } from '@printchecks/core'
import baseStyles from '../styles/base.css?raw'

export class PrintChecksBankAccountList extends PrintChecksComponent {
  private accounts: BankAccount[] = []
  private filteredAccounts: BankAccount[] = []
  private isLoading = false
  private errorMessage: string | null = null
  private searchTerm = ''

  static get observedAttributes() {
    return ['show-actions']
  }

  connectedCallback() {
    this.render()
    this.loadAccounts()
  }

  protected render(): void {
    const showActions = this.getBooleanAttribute('show-actions')

    const html = `
      <style>${baseStyles}</style>
      <style>
        :host {
          display: block;
        }
        
        .account-list-container {
          padding: var(--pc-spacing-lg);
        }
        
        .search-bar {
          margin-bottom: var(--pc-spacing-md);
          display: flex;
          gap: var(--pc-spacing-md);
          align-items: center;
        }
        
        .search-input {
          flex: 1;
        }
        
        .account-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: var(--pc-spacing-md);
        }
        
        .account-card {
          border: 1px solid var(--pc-border-color);
          border-radius: var(--pc-border-radius);
          padding: var(--pc-spacing-md);
          background: white;
          transition: all 0.2s;
          cursor: pointer;
        }
        
        .account-card:hover {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
        
        .account-card.active {
          border-color: var(--pc-primary-color);
          background: var(--pc-primary-light);
        }
        
        .account-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: var(--pc-spacing-sm);
        }
        
        .account-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--pc-text-color);
        }
        
        .account-type {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 12px;
          background: var(--pc-primary-color);
          color: white;
          text-transform: uppercase;
        }
        
        .account-bank {
          font-size: 14px;
          color: var(--pc-text-muted);
          margin-bottom: var(--pc-spacing-xs);
        }
        
        .account-numbers {
          font-size: 13px;
          color: var(--pc-text-muted);
          font-family: 'Courier New', monospace;
          margin-bottom: var(--pc-spacing-sm);
        }
        
        .account-routing {
          margin-bottom: 4px;
        }
        
        .account-number {
          margin-bottom: 4px;
        }
        
        .masked {
          letter-spacing: 2px;
        }
        
        .account-balance {
          font-size: 20px;
          font-weight: 600;
          color: var(--pc-primary-color);
          margin-top: var(--pc-spacing-sm);
          padding-top: var(--pc-spacing-sm);
          border-top: 1px solid var(--pc-border-color);
        }
        
        .account-actions {
          display: flex;
          gap: var(--pc-spacing-sm);
          margin-top: var(--pc-spacing-md);
        }
        
        .account-actions button {
          flex: 1;
          padding: var(--pc-spacing-xs) var(--pc-spacing-sm);
          font-size: 12px;
        }
        
        .empty-state {
          text-align: center;
          padding: var(--pc-spacing-xl);
          color: var(--pc-text-muted);
        }
        
        .empty-state-icon {
          font-size: 48px;
          margin-bottom: var(--pc-spacing-md);
        }
      </style>
      
      <div class="account-list-container">
        ${this.errorMessage ? `<div class="error-message">${this.errorMessage}</div>` : ''}
        
        <div class="search-bar">
          <input 
            type="text" 
            class="form-control search-input" 
            placeholder="Search accounts..."
            id="searchInput"
            value="${this.searchTerm}"
          />
          ${showActions
        ? `
            <button type="button" class="btn btn-primary" id="addAccountBtn">
              Add Account
            </button>
          `
        : ''
      }
        </div>
        
        ${this.isLoading
        ? `
          <div class="text-center">
            <span class="spinner"></span> Loading accounts...
          </div>
        `
        : this.renderAccountGrid()
      }
      </div>
    `

    this.setInnerHTML(html)
    this.attachEventListeners()
  }

  private renderAccountGrid(): string {
    if (this.filteredAccounts.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">🏦</div>
          <div>
            ${this.searchTerm
          ? `No accounts found matching "${this.searchTerm}"`
          : 'No bank accounts yet. Add your first account to get started.'
        }
          </div>
        </div>
      `
    }

    const showActions = this.getBooleanAttribute('show-actions')

    return `
      <div class="account-grid">
        ${this.filteredAccounts
        .map(
          (account) => `
          <div class="account-card" data-account-id="${account.id}">
            <div class="account-header">
              <div class="account-name">${this.escapeHtml(account.accountHolderName)}</div>
              <div class="account-type">${this.escapeHtml(account.accountType || 'checking')}</div>
            </div>
            
            <div class="account-bank">${this.escapeHtml(account.bankName)}</div>
            
            <div class="account-numbers">
              <div class="account-routing">
                Routing: <span class="masked">${this.maskNumber(account.routingNumber, 4)}</span>
              </div>
              <div class="account-number">
                Account: <span class="masked">${this.maskNumber(account.accountNumber, 4)}</span>
              </div>
            </div>
            
            ${showActions
              ? `
              <div class="account-actions">
                <button 
                  type="button" 
                  class="btn btn-sm btn-secondary edit-account-btn"
                  data-account-id="${account.id}"
                >
                  Edit
                </button>
                <button 
                  type="button" 
                  class="btn btn-sm btn-danger delete-account-btn"
                  data-account-id="${account.id}"
                >
                  Delete
                </button>
              </div>
            `
              : ''
            }
          </div>
        `
        )
        .join('')}
      </div>
    `
  }

  private attachEventListeners(): void {
    const searchInput = this.querySelector<HTMLInputElement>('#searchInput')
    const addAccountBtn = this.querySelector('#addAccountBtn')
    const accountCards = this.querySelectorAll('.account-card')
    const editBtns = this.querySelectorAll('.edit-account-btn')
    const deleteBtns = this.querySelectorAll('.delete-account-btn')

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = (e.target as HTMLInputElement).value
        this.filterAccounts()
      })
    }

    if (addAccountBtn) {
      addAccountBtn.addEventListener('click', () => {
        this.emit('add-account-clicked')
      })
    }

    accountCards.forEach((card) => {
      card.addEventListener('click', (e) => {
        // Don't trigger if clicking action buttons
        if ((e.target as HTMLElement).closest('.account-actions')) return

        const accountId = card.getAttribute('data-account-id')
        const account = this.accounts.find((a) => a.id === accountId)
        if (account) {
          this.selectAccount(account)
        }
      })
    })

    editBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        const accountId = btn.getAttribute('data-account-id')
        const account = this.accounts.find((a) => a.id === accountId)
        if (account) {
          this.emit('edit-account', { account })
        }
      })
    })

    deleteBtns.forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation()
        const accountId = btn.getAttribute('data-account-id')
        const account = this.accounts.find((a) => a.id === accountId)
        if (
          account &&
          confirm(`Are you sure you want to delete ${account.accountHolderName}'s account?`)
        ) {
          await this.deleteAccount(account.id!)
        }
      })
    })
  }

  private async loadAccounts(): Promise<void> {
    try {
      this.isLoading = true
      this.errorMessage = null
      this.render()

      this.accounts = await this.core.bankAccounts.getBankAccounts()
      this.filteredAccounts = [...this.accounts]

      this.isLoading = false
      this.render()
      this.emit('accounts-loaded', { accounts: this.accounts })
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to load accounts'
      this.isLoading = false
      this.render()
      this.emit('error', { error: this.errorMessage })
    }
  }

  private filterAccounts(): void {
    const term = this.searchTerm.toLowerCase()
    this.filteredAccounts = this.accounts.filter(
      (account) =>
        account.accountHolderName.toLowerCase().includes(term) ||
        account.bankName.toLowerCase().includes(term) ||
        account.routingNumber.includes(term) ||
        account.accountNumber.includes(term)
    )
    this.render()
  }

  private selectAccount(account: BankAccount): void {
    // Remove active class from all cards
    this.querySelectorAll('.account-card').forEach((card) => {
      card.classList.remove('active')
    })

    // Add active class to selected card
    const selectedCard = this.querySelector(`.account-card[data-account-id="${account.id}"]`)
    if (selectedCard) {
      selectedCard.classList.add('active')
    }

    this.emit('account-selected', { account })
  }

  private async deleteAccount(accountId: string): Promise<void> {
    try {
      await this.core.bankAccounts.deleteBankAccount(accountId)
      this.emit('account-deleted', { accountId })
      await this.loadAccounts()
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to delete account'
      this.render()
      this.emit('error', { error: this.errorMessage })
    }
  }

  private maskNumber(number: string, visibleDigits: number = 4): string {
    if (number.length <= visibleDigits) return number
    const masked = '•'.repeat(number.length - visibleDigits)
    const visible = number.slice(-visibleDigits)
    return masked + visible
  }

  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }
    return text.replace(/[&<>"']/g, (m) => map[m])
  }

  // Public methods
  public refresh(): void {
    this.loadAccounts()
  }

  public search(term: string): void {
    this.searchTerm = term
    this.filterAccounts()
  }
}

// Register the custom element
customElements.define('printchecks-bank-account-list', PrintChecksBankAccountList)
