/**
 * <printchecks-vendor-list> Web Component
 * Displays a list of vendors with search and filter capabilities
 */

import { PrintChecksComponent } from '../utils/component-base'
import type { Vendor } from '@printchecks/core'
import baseStyles from '../styles/base.css?raw'

export class PrintChecksVendorList extends PrintChecksComponent {
  private vendors: Vendor[] = []
  private filteredVendors: Vendor[] = []
  private isLoading = false
  private errorMessage: string | null = null
  private searchTerm = ''

  static get observedAttributes() {
    return ['show-actions']
  }

  connectedCallback() {
    this.render()
    this.loadVendors()
  }

  protected render(): void {
    const showActions = this.getBooleanAttribute('show-actions')

    const html = `
      <style>${baseStyles}</style>
      <style>
        :host {
          display: block;
        }
        
        .vendor-list-container {
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
        
        .vendor-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--pc-spacing-md);
        }
        
        .vendor-card {
          border: 1px solid var(--pc-border-color);
          border-radius: var(--pc-border-radius);
          padding: var(--pc-spacing-md);
          background: white;
          transition: all 0.2s;
          cursor: pointer;
        }
        
        .vendor-card:hover {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
        
        .vendor-card.active {
          border-color: var(--pc-primary-color);
          background: var(--pc-primary-light);
        }
        
        .vendor-name {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: var(--pc-spacing-sm);
          color: var(--pc-text-color);
        }
        
        .vendor-contact {
          font-size: 14px;
          color: var(--pc-text-muted);
          margin-bottom: var(--pc-spacing-xs);
        }
        
        .vendor-email {
          font-size: 13px;
          color: var(--pc-primary-color);
          margin-bottom: var(--pc-spacing-xs);
        }
        
        .vendor-phone {
          font-size: 13px;
          color: var(--pc-text-muted);
          margin-bottom: var(--pc-spacing-sm);
        }
        
        .vendor-address {
          font-size: 12px;
          color: var(--pc-text-muted);
          border-top: 1px solid var(--pc-border-color);
          padding-top: var(--pc-spacing-sm);
          margin-top: var(--pc-spacing-sm);
        }
        
        .vendor-actions {
          display: flex;
          gap: var(--pc-spacing-sm);
          margin-top: var(--pc-spacing-md);
        }
        
        .vendor-actions button {
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
      
      <div class="vendor-list-container">
        ${this.errorMessage ? `<div class="error-message">${this.errorMessage}</div>` : ''}
        
        <div class="search-bar">
          <input 
            type="text" 
            class="form-control search-input" 
            placeholder="Search vendors..."
            id="searchInput"
            value="${this.searchTerm}"
          />
          ${
            showActions
              ? `
            <button type="button" class="btn btn-primary" id="addVendorBtn">
              Add Vendor
            </button>
          `
              : ''
          }
        </div>
        
        ${
          this.isLoading
            ? `
          <div class="text-center">
            <span class="spinner"></span> Loading vendors...
          </div>
        `
            : this.renderVendorGrid()
        }
      </div>
    `

    this.setInnerHTML(html)
    this.attachEventListeners()
  }

  private renderVendorGrid(): string {
    if (this.filteredVendors.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <div>
            ${
              this.searchTerm
                ? `No vendors found matching "${this.searchTerm}"`
                : 'No vendors yet. Add your first vendor to get started.'
            }
          </div>
        </div>
      `
    }

    const showActions = this.getBooleanAttribute('show-actions')

    return `
      <div class="vendor-grid">
        ${this.filteredVendors
          .map(
            (vendor) => `
          <div class="vendor-card" data-vendor-id="${vendor.id}">
            <div class="vendor-name">${this.escapeHtml(vendor.name)}</div>
            
            ${
              vendor.displayName
                ? `
              <div class="vendor-contact">${this.escapeHtml(vendor.displayName)}</div>
            `
                : ''
            }
            
            ${
              vendor.email
                ? `
              <div class="vendor-email">${this.escapeHtml(vendor.email)}</div>
            `
                : ''
            }
            
            ${
              vendor.phone
                ? `
              <div class="vendor-phone">${this.escapeHtml(vendor.phone)}</div>
            `
                : ''
            }
            
            ${
              vendor.address
                ? `
              <div class="vendor-address">
                ${this.escapeHtml(vendor.address)}
                ${vendor.city || vendor.state || vendor.zip ? `<br>` : ''}
                ${vendor.city ? this.escapeHtml(vendor.city) : ''}${vendor.state ? `, ${this.escapeHtml(vendor.state)}` : ''} ${vendor.zip ? this.escapeHtml(vendor.zip) : ''}
              </div>
            `
                : ''
            }
            
            ${
              showActions
                ? `
              <div class="vendor-actions">
                <button 
                  type="button" 
                  class="btn btn-sm btn-secondary edit-vendor-btn"
                  data-vendor-id="${vendor.id}"
                >
                  Edit
                </button>
                <button 
                  type="button" 
                  class="btn btn-sm btn-danger delete-vendor-btn"
                  data-vendor-id="${vendor.id}"
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
    const addVendorBtn = this.querySelector('#addVendorBtn')
    const vendorCards = this.querySelectorAll('.vendor-card')
    const editBtns = this.querySelectorAll('.edit-vendor-btn')
    const deleteBtns = this.querySelectorAll('.delete-vendor-btn')

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = (e.target as HTMLInputElement).value
        this.filterVendors()
      })
    }

    if (addVendorBtn) {
      addVendorBtn.addEventListener('click', () => {
        this.emit('add-vendor-clicked')
      })
    }

    vendorCards.forEach((card) => {
      card.addEventListener('click', (e) => {
        // Don't trigger if clicking action buttons
        if ((e.target as HTMLElement).closest('.vendor-actions')) return

        const vendorId = card.getAttribute('data-vendor-id')
        const vendor = this.vendors.find((v) => v.id === vendorId)
        if (vendor) {
          this.selectVendor(vendor)
        }
      })
    })

    editBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        const vendorId = btn.getAttribute('data-vendor-id')
        const vendor = this.vendors.find((v) => v.id === vendorId)
        if (vendor) {
          this.emit('edit-vendor', { vendor })
        }
      })
    })

    deleteBtns.forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation()
        const vendorId = btn.getAttribute('data-vendor-id')
        const vendor = this.vendors.find((v) => v.id === vendorId)
        if (vendor && confirm(`Are you sure you want to delete ${vendor.name}?`)) {
          await this.deleteVendor(vendor.id!)
        }
      })
    })
  }

  private async loadVendors(): Promise<void> {
    try {
      this.isLoading = true
      this.errorMessage = null
      this.render()

      this.vendors = await this.core.vendors.getVendors()
      this.filteredVendors = [...this.vendors]

      this.isLoading = false
      this.render()
      this.emit('vendors-loaded', { vendors: this.vendors })
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to load vendors'
      this.isLoading = false
      this.render()
      this.emit('error', { error: this.errorMessage })
    }
  }

  private filterVendors(): void {
    const term = this.searchTerm.toLowerCase()
    this.filteredVendors = this.vendors.filter(
      (vendor) =>
        vendor.name.toLowerCase().includes(term) ||
        vendor.displayName?.toLowerCase().includes(term) ||
        vendor.email?.toLowerCase().includes(term) ||
        vendor.phone?.toLowerCase().includes(term)
    )
    this.render()
  }

  private selectVendor(vendor: Vendor): void {
    // Remove active class from all cards
    this.querySelectorAll('.vendor-card').forEach((card) => {
      card.classList.remove('active')
    })

    // Add active class to selected card
    const selectedCard = this.querySelector(`.vendor-card[data-vendor-id="${vendor.id}"]`)
    if (selectedCard) {
      selectedCard.classList.add('active')
    }

    this.emit('vendor-selected', { vendor })
  }

  private async deleteVendor(vendorId: string): Promise<void> {
    try {
      await this.core.vendors.deleteVendor(vendorId)
      this.emit('vendor-deleted', { vendorId })
      await this.loadVendors()
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to delete vendor'
      this.render()
      this.emit('error', { error: this.errorMessage })
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  // Public methods
  public refresh(): void {
    this.loadVendors()
  }

  public search(term: string): void {
    this.searchTerm = term
    this.filterVendors()
  }
}

// Register the custom element
customElements.define('printchecks-vendor-list', PrintChecksVendorList)
