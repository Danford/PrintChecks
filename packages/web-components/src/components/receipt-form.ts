/**
 * <printchecks-receipt-form> Web Component
 * Interactive form for creating/editing receipts with line items
 */

import { PrintChecksComponent } from '../utils/component-base'
import type { Receipt, ReceiptData, LineItemData } from '@printchecks/core'
import baseStyles from '../styles/base.css?raw'

export class PrintChecksReceiptForm extends PrintChecksComponent {
  private receiptId: string | null = null
  private currentReceipt: Receipt | null = null
  private isLoading = false
  private errorMessage: string | null = null
  private lineItems: Partial<LineItemData>[] = []

  static get observedAttributes() {
    return ['receipt-id', 'readonly']
  }

  connectedCallback() {
    // Load receipt if receipt-id is provided
    const receiptId = this.getAttribute('receipt-id')
    if (receiptId) {
      this.render()
      this.attachEventListeners()
      this.loadReceipt(receiptId)
    } else {
      // Initialize with one empty line item before first render
      this.lineItems = [
        {
          description: '',
          quantity: 1,
          unitPrice: 0,
          totalPrice: 0,
          taxable: false,
          taxRate: 0,
          taxAmount: 0,
          discountAmount: 0,
        },
      ]
      this.render()
      this.attachEventListeners()
    }
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      if (name === 'receipt-id' && newValue) {
        this.loadReceipt(newValue)
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
          max-width: 900px;
        }

        .receipt-form {
          padding: var(--pc-spacing-lg);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--pc-spacing-md);
        }

        .form-row-3 {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: var(--pc-spacing-md);
        }

        @media (max-width: 768px) {
          .form-row, .form-row-3 {
            grid-template-columns: 1fr;
          }
        }

        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--pc-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: var(--pc-spacing-lg) 0 var(--pc-spacing-sm);
          padding-bottom: var(--pc-spacing-xs);
          border-bottom: 1px solid var(--pc-border-color);
        }

        .line-items-section {
          margin: var(--pc-spacing-lg) 0;
          padding: var(--pc-spacing-md);
          border: 1px solid var(--pc-border-color);
          border-radius: var(--pc-border-radius);
          background: var(--pc-background-light);
        }

        .line-items-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--pc-spacing-md);
        }

        .line-item {
          display: grid;
          grid-template-columns: 3fr 1fr 1fr 1fr auto;
          gap: var(--pc-spacing-sm);
          margin-bottom: var(--pc-spacing-sm);
          align-items: end;
        }

        @media (max-width: 768px) {
          .line-item {
            grid-template-columns: 1fr;
          }
        }

        .line-item-total {
          padding: var(--pc-spacing-sm);
          background: white;
          border: 1px solid var(--pc-border-color);
          border-radius: var(--pc-border-radius);
          text-align: right;
          font-weight: 600;
        }

        .totals-section {
          margin-top: var(--pc-spacing-lg);
          padding: var(--pc-spacing-md);
          border: 1px solid var(--pc-border-color);
          border-radius: var(--pc-border-radius);
          background: var(--pc-primary-light);
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--pc-spacing-sm);
          font-size: 14px;
        }

        .total-row.grand-total {
          font-size: 18px;
          font-weight: 700;
          color: var(--pc-primary-color);
          padding-top: var(--pc-spacing-sm);
          border-top: 2px solid var(--pc-primary-color);
          margin-top: var(--pc-spacing-sm);
        }

        .form-actions {
          display: flex;
          gap: var(--pc-spacing-md);
          justify-content: flex-end;
          margin-top: var(--pc-spacing-lg);
        }

        .btn-remove {
          background: var(--pc-danger-color);
          color: white;
          border: none;
          padding: var(--pc-spacing-xs) var(--pc-spacing-sm);
          border-radius: var(--pc-border-radius);
          cursor: pointer;
          font-size: 14px;
        }

        .btn-remove:hover {
          opacity: 0.8;
        }
      </style>

      <div class="card receipt-form">
        <div class="card-header">
          <h3 class="mb-0">${this.currentReceipt ? 'Edit Receipt' : 'New Receipt'}</h3>
        </div>

        <div class="card-body">
          ${this.errorMessage ? `<div class="error-message">${this.errorMessage}</div>` : ''}
          ${this.isLoading ? '<div class="text-center"><span class="spinner"></span> Loading...</div>' : ''}

          <form id="receiptForm" class="${this.isLoading ? 'd-none' : ''}">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="receiptNumber">Receipt Number *</label>
                <input
                  type="text"
                  id="receiptNumber"
                  name="receiptNumber"
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

            <div class="section-title">Bill To</div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="billToName">Name *</label>
                <input
                  type="text"
                  id="billToName"
                  name="billToName"
                  class="form-control"
                  placeholder="John Doe"
                  ${readonly ? 'disabled' : ''}
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="billToEmail">Email</label>
                <input
                  type="email"
                  id="billToEmail"
                  name="billToEmail"
                  class="form-control"
                  placeholder="customer@email.com"
                  ${readonly ? 'disabled' : ''}
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="billToAddress">Address *</label>
              <input
                type="text"
                id="billToAddress"
                name="billToAddress"
                class="form-control"
                placeholder="123 Main St"
                ${readonly ? 'disabled' : ''}
                required
              />
            </div>

            <div class="form-row-3">
              <div class="form-group">
                <label class="form-label" for="billToCity">City *</label>
                <input
                  type="text"
                  id="billToCity"
                  name="billToCity"
                  class="form-control"
                  placeholder="Springfield"
                  ${readonly ? 'disabled' : ''}
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="billToState">State *</label>
                <input
                  type="text"
                  id="billToState"
                  name="billToState"
                  class="form-control"
                  placeholder="IL"
                  ${readonly ? 'disabled' : ''}
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="billToZip">ZIP *</label>
                <input
                  type="text"
                  id="billToZip"
                  name="billToZip"
                  class="form-control"
                  placeholder="62701"
                  ${readonly ? 'disabled' : ''}
                  required
                />
              </div>
            </div>

            <div class="section-title">Payment</div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="paymentMethod">Payment Method *</label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  class="form-control"
                  ${readonly ? 'disabled' : ''}
                  required
                >
                  <option value="check">Check</option>
                  <option value="cash">Cash</option>
                  <option value="credit">Credit Card</option>
                  <option value="debit">Debit Card</option>
                  <option value="transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="paymentCheckNumber">Check Number</label>
                <input
                  type="text"
                  id="paymentCheckNumber"
                  name="paymentCheckNumber"
                  class="form-control"
                  placeholder="Optional"
                  ${readonly ? 'disabled' : ''}
                />
              </div>
            </div>

            <div class="section-title">Line Items</div>

            <div class="line-items-section">
              <div class="line-items-header">
                <h4 class="mb-0">Items</h4>
                ${
                  !readonly
                    ? `
                  <button type="button" class="btn btn-sm btn-primary" id="addLineItemBtn">
                    Add Item
                  </button>
                `
                    : ''
                }
              </div>

              <div id="lineItemsContainer">
                ${this.renderLineItems(readonly)}
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="taxRate">Tax Rate (%)</label>
                <input
                  type="number"
                  id="taxRate"
                  name="taxRate"
                  class="form-control"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  max="100"
                  value="0"
                  ${readonly ? 'disabled' : ''}
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="discount">Discount Amount</label>
                <input
                  type="number"
                  id="discount"
                  name="discount"
                  class="form-control"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value="0"
                  ${readonly ? 'disabled' : ''}
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="shippingAmount">Shipping Amount</label>
                <input
                  type="number"
                  id="shippingAmount"
                  name="shippingAmount"
                  class="form-control"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value="0"
                  ${readonly ? 'disabled' : ''}
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="handlingAmount">Handling Amount</label>
                <input
                  type="number"
                  id="handlingAmount"
                  name="handlingAmount"
                  class="form-control"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value="0"
                  ${readonly ? 'disabled' : ''}
                />
              </div>
            </div>

            ${this.renderTotals()}

            <div class="form-group">
              <label class="form-label" for="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                class="form-control"
                rows="3"
                placeholder="Additional notes..."
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
                <button type="button" class="btn btn-secondary" part="calculate-button" id="calculateBtn">
                  Calculate Totals
                </button>
                <button type="submit" class="btn btn-primary" part="submit-button" id="submitBtn">
                  ${this.currentReceipt ? 'Update Receipt' : 'Create Receipt'}
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

    // Populate form if we have a current receipt
    if (this.currentReceipt) {
      this.populateForm(this.currentReceipt)
    } else {
      // Set default date to today
      const dateInput = this.querySelector<HTMLInputElement>('#date')
      if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0]
      }
    }
  }

  private renderLineItems(readonly: boolean): string {
    if (this.lineItems.length === 0) {
      return '<div class="text-muted">No line items yet</div>'
    }

    return this.lineItems
      .map((item, index) => {
        const total = (item.quantity || 0) * (item.unitPrice || 0)
        return `
        <div class="line-item" data-index="${index}">
          <div class="form-group mb-0">
            ${index === 0 ? '<label class="form-label">Description *</label>' : ''}
            <input
              type="text"
              class="form-control line-item-description"
              placeholder="Item description"
              value="${this.escapeAttr(item.description || '')}"
              data-index="${index}"
              ${readonly ? 'disabled' : ''}
              required
            />
          </div>

          <div class="form-group mb-0">
            ${index === 0 ? '<label class="form-label">Quantity *</label>' : ''}
            <input
              type="number"
              class="form-control line-item-quantity"
              placeholder="1"
              value="${item.quantity || 1}"
              min="0.01"
              step="0.01"
              data-index="${index}"
              ${readonly ? 'disabled' : ''}
              required
            />
          </div>

          <div class="form-group mb-0">
            ${index === 0 ? '<label class="form-label">Unit Price *</label>' : ''}
            <input
              type="number"
              class="form-control line-item-price"
              placeholder="0.00"
              value="${item.unitPrice || 0}"
              min="0"
              step="0.01"
              data-index="${index}"
              ${readonly ? 'disabled' : ''}
              required
            />
          </div>

          <div class="line-item-total">
            ${index === 0 ? '<div style="margin-bottom: 8px; font-weight: normal;">Total</div>' : ''}
            $${total.toFixed(2)}
          </div>

          ${
            !readonly && this.lineItems.length > 1
              ? `
            <button
              type="button"
              class="btn-remove remove-line-item"
              data-index="${index}"
            >
              ✕
            </button>
          `
              : '<div></div>'
          }
        </div>
      `
      })
      .join('')
  }

  private renderTotals(): string {
    const subtotal = this.calculateSubtotal()
    const taxRate = parseFloat(this.querySelector<HTMLInputElement>('#taxRate')?.value || '0')
    const discount = parseFloat(this.querySelector<HTMLInputElement>('#discount')?.value || '0')
    const shipping = parseFloat(this.querySelector<HTMLInputElement>('#shippingAmount')?.value || '0')
    const handling = parseFloat(this.querySelector<HTMLInputElement>('#handlingAmount')?.value || '0')
    const tax = (subtotal - discount) * (taxRate / 100)
    const total = subtotal - discount + tax + shipping + handling

    return `
      <div class="totals-section">
        <div class="total-row">
          <span>Subtotal:</span>
          <span id="subtotalDisplay">$${subtotal.toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span>Discount:</span>
          <span id="discountDisplay">-$${discount.toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span>Tax (${taxRate.toFixed(2)}%):</span>
          <span id="taxDisplay">$${tax.toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span>Shipping:</span>
          <span id="shippingDisplay">$${shipping.toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span>Handling:</span>
          <span id="handlingDisplay">$${handling.toFixed(2)}</span>
        </div>
        <div class="total-row grand-total">
          <span>Total:</span>
          <span id="totalDisplay">$${total.toFixed(2)}</span>
        </div>
      </div>
    `
  }

  private calculateSubtotal(): number {
    return this.lineItems.reduce((sum, item) => {
      return sum + (item.quantity || 0) * (item.unitPrice || 0)
    }, 0)
  }

  private attachEventListeners(): void {
    const form = this.querySelector<HTMLFormElement>('#receiptForm')
    const submitBtn = this.querySelector('#submitBtn')
    const resetBtn = this.querySelector('#resetBtn')
    const calculateBtn = this.querySelector('#calculateBtn')
    const addLineItemBtn = this.querySelector('#addLineItemBtn')

    if (form && submitBtn) {
      form.addEventListener('submit', (e) => this.handleSubmit(e))
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.handleReset())
    }

    if (calculateBtn) {
      calculateBtn.addEventListener('click', () => this.handleCalculate())
    }

    if (addLineItemBtn) {
      addLineItemBtn.addEventListener('click', () => this.addLineItem())
    }

    // Line item event listeners
    this.attachLineItemListeners()

    // Tax rate, discount, shipping, handling listeners
    const taxRate = this.querySelector<HTMLInputElement>('#taxRate')
    const discount = this.querySelector<HTMLInputElement>('#discount')
    const shippingAmount = this.querySelector<HTMLInputElement>('#shippingAmount')
    const handlingAmount = this.querySelector<HTMLInputElement>('#handlingAmount')

    if (taxRate) {
      taxRate.addEventListener('input', () => this.updateTotals())
    }

    if (discount) {
      discount.addEventListener('input', () => this.updateTotals())
    }

    if (shippingAmount) {
      shippingAmount.addEventListener('input', () => this.updateTotals())
    }

    if (handlingAmount) {
      handlingAmount.addEventListener('input', () => this.updateTotals())
    }
  }

  private attachLineItemListeners(): void {
    // Description inputs
    this.querySelectorAll('.line-item-description').forEach((input) => {
      input.addEventListener('input', (e) => {
        const index = parseInt((e.target as HTMLElement).getAttribute('data-index') || '0')
        this.lineItems[index].description = (e.target as HTMLInputElement).value
      })
    })

    // Quantity inputs
    this.querySelectorAll('.line-item-quantity').forEach((input) => {
      input.addEventListener('input', (e) => {
        const index = parseInt((e.target as HTMLElement).getAttribute('data-index') || '0')
        this.lineItems[index].quantity = parseFloat((e.target as HTMLInputElement).value) || 0
        this.updateTotals()
      })
    })

    // Price inputs
    this.querySelectorAll('.line-item-price').forEach((input) => {
      input.addEventListener('input', (e) => {
        const index = parseInt((e.target as HTMLElement).getAttribute('data-index') || '0')
        this.lineItems[index].unitPrice = parseFloat((e.target as HTMLInputElement).value) || 0
        this.updateTotals()
      })
    })

    // Remove buttons
    this.querySelectorAll('.remove-line-item').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const index = parseInt((e.target as HTMLElement).getAttribute('data-index') || '0')
        this.removeLineItem(index)
      })
    })
  }

  private addLineItem(): void {
    this.lineItems.push({
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      taxable: false,
      taxRate: 0,
      taxAmount: 0,
      discountAmount: 0,
    })
    this.render()
    this.attachEventListeners()
  }

  private removeLineItem(index: number): void {
    this.lineItems.splice(index, 1)
    this.render()
    this.attachEventListeners()
  }

  private updateTotals(): void {
    const totalsSection = this.querySelector('.totals-section')
    if (totalsSection) {
      totalsSection.outerHTML = this.renderTotals()
    }

    // Update line item totals
    this.lineItems.forEach((item, index) => {
      const total = (item.quantity || 0) * (item.unitPrice || 0)
      const totalElement = this.querySelector(`.line-item[data-index="${index}"] .line-item-total`)
      if (totalElement) {
        const lines = totalElement.innerHTML.split('\n')
        if (lines.length > 1) {
          totalElement.innerHTML = lines[0] + '\n            $' + total.toFixed(2) + '\n          '
        } else {
          totalElement.innerHTML = '$' + total.toFixed(2)
        }
      }
    })
  }

  private handleCalculate(): void {
    this.updateTotals()
  }

  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault()

    const formData = this.getFormData()
    if (!formData) return

    try {
      this.errorMessage = null
      this.isLoading = true
      this.render()
      this.attachEventListeners()

      let receipt: Receipt
      if (this.currentReceipt) {
        // Update existing receipt
        receipt = await this.core.receipts.updateReceipt(this.currentReceipt.id!, formData)
        this.emit('receipt-updated', { receipt })
      } else {
        // Create new receipt
        receipt = await this.core.receipts.createReceipt(formData as ReceiptData)
        this.emit('receipt-created', { receipt })
      }

      this.currentReceipt = receipt
      this.isLoading = false
      this.render()
      this.attachEventListeners()

      // Optionally reset form after creation
      if (!this.currentReceipt.id) {
        setTimeout(() => this.handleReset(), 1000)
      }
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to save receipt'
      this.isLoading = false
      this.render()
      this.attachEventListeners()
      this.emit('error', { error: this.errorMessage })
    }
  }

  private handleReset(): void {
    this.currentReceipt = null
    this.errorMessage = null
    this.lineItems = [
      {
        description: '',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        taxable: false,
        taxRate: 0,
        taxAmount: 0,
        discountAmount: 0,
      },
    ]
    this.render()
    this.attachEventListeners()
    // Reset date to today after re-render
    const dateInput = this.querySelector<HTMLInputElement>('#date')
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0]
    }
  }

  private getFormData(): Partial<ReceiptData> | null {
    const form = this.querySelector<HTMLFormElement>('#receiptForm')
    if (!form) return null

    const formData = new FormData(form)
    const data: Partial<ReceiptData> = {}

    // Required fields
    data.receiptNumber = formData.get('receiptNumber') as string
    data.date = formData.get('date') as string

    // Bill To Info
    data.billTo = {
      name: formData.get('billToName') as string,
      address: formData.get('billToAddress') as string,
      city: formData.get('billToCity') as string,
      state: formData.get('billToState') as string,
      zip: formData.get('billToZip') as string,
      email: (formData.get('billToEmail') as string) || undefined,
    }

    const notes = formData.get('notes') as string
    if (notes) data.notes = notes

    // Line items
    data.lineItems = this.lineItems as LineItemData[]

    // Totals
    const taxRate = parseFloat(formData.get('taxRate') as string) || 0
    const discount = parseFloat(formData.get('discount') as string) || 0
    const shippingAmount = parseFloat(formData.get('shippingAmount') as string) || 0
    const handlingAmount = parseFloat(formData.get('handlingAmount') as string) || 0

    const subtotal = this.calculateSubtotal()
    const tax = (subtotal - discount) * (taxRate / 100)
    const grandTotal = subtotal - discount + tax + shippingAmount + handlingAmount

    data.totals = {
      subtotal,
      totalTax: tax,
      totalDiscount: discount,
      shippingAmount,
      handlingAmount,
      grandTotal,
    }

    // Payment Info
    const method = (formData.get('paymentMethod') as string) || 'other'
    const checkNumber = (formData.get('paymentCheckNumber') as string) || undefined
    data.paymentInfo = {
      method: method as 'check' | 'cash' | 'credit' | 'debit' | 'transfer' | 'other',
      checkNumber,
      amount: grandTotal,
      currency: 'USD',
    }

    return data
  }

  private populateForm(receipt: Receipt): void {
    const form = this.querySelector<HTMLFormElement>('#receiptForm')
    if (!form) return

    // Populate receipt fields
    this.setInputValue('receiptNumber', receipt.receiptNumber || '')
    this.setInputValue('date', receipt.date || '')
    this.setInputValue('notes', receipt.notes || '')

    // Populate BillToInfo fields
    if (receipt.billTo) {
      this.setInputValue('billToName', receipt.billTo.name)
      this.setInputValue('billToAddress', receipt.billTo.address)
      this.setInputValue('billToCity', receipt.billTo.city)
      this.setInputValue('billToState', receipt.billTo.state)
      this.setInputValue('billToZip', receipt.billTo.zip)
      this.setInputValue('billToEmail', receipt.billTo.email || '')
    }

    // Populate PaymentInfo fields
    if (receipt.paymentInfo) {
      const methodSelect = this.querySelector<HTMLSelectElement>('#paymentMethod')
      if (methodSelect) {
        methodSelect.value = receipt.paymentInfo.method
      }
      this.setInputValue('paymentCheckNumber', receipt.paymentInfo.checkNumber || '')
    }

    // Populate totals
    if (receipt.totals) {
      this.setInputValue('discount', receipt.totals.totalDiscount?.toString() || '0')
      this.setInputValue('shippingAmount', receipt.totals.shippingAmount?.toString() || '0')
      this.setInputValue('handlingAmount', receipt.totals.handlingAmount?.toString() || '0')
      // Calculate tax rate from totals
      const subtotal = receipt.totals.subtotal || 0
      const tax = receipt.totals.totalTax || 0
      const discount = receipt.totals.totalDiscount || 0
      const taxRate = subtotal - discount > 0 ? (tax / (subtotal - discount)) * 100 : 0
      this.setInputValue('taxRate', taxRate.toFixed(2))
    }
  }

  private setInputValue(id: string, value: string): void {
    const input = this.querySelector<HTMLInputElement | HTMLTextAreaElement>(`#${id}`)
    if (input) {
      input.value = value
    }
  }

  private async loadReceipt(receiptId: string): Promise<void> {
    try {
      this.isLoading = true
      this.errorMessage = null
      this.render()
      this.attachEventListeners()

      const receipt = await this.core.receipts.getReceipt(receiptId)
      if (receipt) {
        this.currentReceipt = receipt
        this.lineItems = receipt.lineItems || []
        this.receiptId = receiptId
      } else {
        this.errorMessage = 'Receipt not found'
      }

      this.isLoading = false
      this.render()
      this.attachEventListeners()
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to load receipt'
      this.isLoading = false
      this.render()
      this.attachEventListeners()
      this.emit('error', { error: this.errorMessage })
    }
  }

  private escapeAttr(text: string): string {
    return text.replace(/"/g, '&quot;').replace(/'/g, '&#39;')
  }

  // Public methods
  public async save(): Promise<Receipt | null> {
    const formData = this.getFormData()
    if (!formData) return null

    try {
      if (this.currentReceipt) {
        return await this.core.receipts.updateReceipt(this.currentReceipt.id!, formData)
      } else {
        return await this.core.receipts.createReceipt(formData as ReceiptData)
      }
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to save receipt'
      this.render()
      return null
    }
  }

  public reset(): void {
    this.handleReset()
  }
}

// Register the custom element
customElements.define('printchecks-receipt-form', PrintChecksReceiptForm)
