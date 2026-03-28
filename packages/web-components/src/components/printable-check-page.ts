/**
 * <printchecks-printable-page> Web Component
 *
 * Standardized printable check page that combines:
 * - Check display (top third)
 * - Line items table (middle third)
 * - Analytics summary (bottom third)
 *
 * This component ensures consistent check printing across all deployments.
 *
 * @example
 * <printchecks-printable-page check-id="123"></printchecks-printable-page>
 *
 * @fires check-loaded - When check data is loaded
 * @fires print-initiated - When print is triggered
 */

import { PrintChecksComponent } from '../utils/component-base'
import type { Check } from '@printchecks/core'
import baseStyles from '../styles/base.css?raw'

interface LineItem {
  id?: string
  description: string
  quantity: number
  unitPrice: number
}

interface PaymentStats {
  thisMonth: number
  lastMonth: number
  thisYear: number
  lastYear: number
  thisQuarter: number
  averagePayment: number
  monthlyAverage: number
  largestPayment: number
  smallestPayment: number
  totalCount: number
  allTimeTotal: number
}

export class PrintChecksCheckPrintablePage extends PrintChecksComponent {
  private checkId: string | null = null
  private currentCheck: Check | null = null
  private lineItems: LineItem[] = []
  private paymentStats: PaymentStats | null = null
  private isLoading = false
  private errorMessage: string | null = null
  private printBlockedErrors: string[] | null = null

  static get observedAttributes() {
    return ['check-id', 'show-analytics', 'show-line-items']
  }

  connectedCallback() {
    this.render()

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

  /**
   * Set check data directly (alternative to using check-id attribute)
   */
  setCheckData(check: Check, lineItems: LineItem[] = [], stats: PaymentStats | null = null) {
    this.currentCheck = check
    this.lineItems = lineItems
    this.paymentStats = stats
    this.render()
  }

  /**
   * Trigger print dialog — validates check data first and blocks print if invalid
   */
  print() {
    if (!this.currentCheck) return

    const validation = this.currentCheck.validate()
    if (!validation.isValid) {
      this.dispatchEvent(new CustomEvent('print-blocked', {
        detail: { errors: validation.errors },
        bubbles: true
      }))
      this.printBlockedErrors = validation.errors
      this.render()
      return
    }

    this.printBlockedErrors = null
    this.render()
    this.dispatchEvent(new CustomEvent('print-initiated', {
      detail: { checkId: this.checkId },
      bubbles: true
    }))
    window.print()
  }

  private async loadCheck(checkId: string) {
    this.checkId = checkId
    this.isLoading = true
    this.errorMessage = null
    this.render()

    try {
      if (!this.core) {
        throw new Error('PrintChecksCore not available')
      }

      // Load check
      const checks = await this.core.getChecks()
      const check = checks.find((c) => c.id === checkId)

      if (!check) {
        throw new Error(`Check with ID ${checkId} not found`)
      }

      this.currentCheck = check

      // Extract line items from check if available
      // Note: Line items are stored in the check's lineItems property
      this.lineItems = (check as any).lineItems || []

      // Load payment statistics
      const allChecks = await this.core.getChecks()
      this.paymentStats = this.calculatePaymentStats(allChecks)

      this.isLoading = false
      this.render()

      this.dispatchEvent(new CustomEvent('check-loaded', {
        detail: { check, lineItems: this.lineItems, stats: this.paymentStats },
        bubbles: true
      }))
    } catch (error: any) {
      this.errorMessage = error.message
      this.isLoading = false
      this.render()
    }
  }

  private calculatePaymentStats(checks: Check[]): PaymentStats {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const currentQuarter = Math.floor(currentMonth / 3)

    const amounts = checks.map(c => Number(c.amount))
    const total = amounts.reduce((sum, amt) => sum + amt, 0)

    // Filter by time periods
    const thisMonth = checks.filter(c => {
      const d = new Date(c.date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    }).reduce((sum, c) => sum + Number(c.amount), 0)

    const lastMonth = checks.filter(c => {
      const d = new Date(c.date)
      const lastMonthDate = new Date(currentYear, currentMonth - 1, 1)
      return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear()
    }).reduce((sum, c) => sum + Number(c.amount), 0)

    const thisYear = checks.filter(c => {
      const d = new Date(c.date)
      return d.getFullYear() === currentYear
    }).reduce((sum, c) => sum + Number(c.amount), 0)

    const lastYear = checks.filter(c => {
      const d = new Date(c.date)
      return d.getFullYear() === currentYear - 1
    }).reduce((sum, c) => sum + Number(c.amount), 0)

    const thisQuarter = checks.filter(c => {
      const d = new Date(c.date)
      const checkQuarter = Math.floor(d.getMonth() / 3)
      return checkQuarter === currentQuarter && d.getFullYear() === currentYear
    }).reduce((sum, c) => sum + Number(c.amount), 0)

    return {
      thisMonth,
      lastMonth,
      thisYear,
      lastYear,
      thisQuarter,
      averagePayment: amounts.length > 0 ? total / amounts.length : 0,
      monthlyAverage: thisMonth, // Simplified - could calculate across all months
      largestPayment: amounts.length > 0 ? Math.max(...amounts) : 0,
      smallestPayment: amounts.length > 0 ? Math.min(...amounts) : 0,
      totalCount: checks.length,
      allTimeTotal: total
    }
  }

  private amountToWords(num: number): string {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']

    if (num === 0) return 'Zero'

    let dollars = Math.floor(num)
    const cents = Math.round((num - dollars) * 100)
    let result = ''

    if (dollars >= 1000000) {
      const millions = Math.floor(dollars / 1000000)
      result += this.amountToWords(millions) + ' Million '
      dollars %= 1000000
    }

    if (dollars >= 1000) {
      const thousands = Math.floor(dollars / 1000)
      result += this.amountToWords(thousands) + ' Thousand '
      dollars %= 1000
    }

    if (dollars >= 100) {
      result += ones[Math.floor(dollars / 100)] + ' Hundred '
      dollars %= 100
    }

    if (dollars >= 20) {
      result += tens[Math.floor(dollars / 10)] + ' '
      dollars %= 10
    } else if (dollars >= 10) {
      result += teens[dollars - 10] + ' '
      dollars = 0
    }

    if (dollars > 0) {
      result += ones[dollars] + ' '
    }

    result = result.trim() + ' Dollars'

    if (cents > 0) {
      result += ' and ' + cents + '/100'
    }

    return result
  }

  protected render(): void {
    const showAnalytics = this.getAttribute('show-analytics') !== 'false'
    const showLineItems = this.getAttribute('show-line-items') !== 'false'

    const html = `
      <style>${baseStyles}</style>
      <style>
        :host {
          display: block;
        }

        /* Container for the entire printable page */
        .printable-page-container {
          background: white;
          max-width: 8.5in;
          margin: 0 auto;
        }

        /* Print styles */
        @media print {
          @page {
            margin: 0.5in;
            size: letter portrait;
          }

          .printable-page-container {
            max-width: 100%;
            margin: 0;
            padding: 0;
          }

          .print-button {
            display: none !important;
          }

          /* Ensure colors print */
          * {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }

        /* Section 1: Check (Top Third) */
        .check-section {
          min-height: 3.5in;
          page-break-after: avoid;
          margin-bottom: 0.25in;
        }

        .check-display {
          width: 100%;
          height: 3.5in;
          border: 2px solid #333;
          background: white;
          position: relative;
          font-family: 'Courier New', monospace;
          padding: 0.5in;
        }

        .check-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.3in;
          padding-bottom: 0.1in;
          border-bottom: 1px solid #ccc;
        }

        .account-info h3 {
          margin: 0 0 5px 0;
          font-size: 14pt;
          color: #1a1a1a;
        }

        .account-info p {
          margin: 0;
          font-size: 9pt;
          color: #444;
          line-height: 1.3;
        }

        .check-number {
          text-align: right;
        }

        .check-number-label {
          font-size: 9pt;
          color: #555;
        }

        .check-number-value {
          font-size: 18pt;
          font-weight: bold;
          color: #000;
        }

        .check-date {
          text-align: right;
          margin-bottom: 0.15in;
        }

        .date-label {
          font-size: 9pt;
          color: #555;
        }

        .date-value {
          font-size: 11pt;
          color: #000;
          border-bottom: 1px solid #000;
          display: inline-block;
          min-width: 2in;
          padding: 2px 8px;
        }

        .pay-to-line {
          margin-bottom: 0.15in;
        }

        .pay-to-label {
          font-size: 9pt;
          color: #555;
        }

        .pay-to-value {
          font-size: 12pt;
          color: #000;
          border-bottom: 1px solid #000;
          padding: 2px 8px;
          display: inline-block;
          min-width: 5in;
        }

        .amount-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.15in;
        }

        .amount-words {
          flex: 1;
          margin-right: 0.2in;
        }

        .amount-words-label {
          font-size: 8pt;
          color: #555;
        }

        .amount-words-value {
          font-size: 10pt;
          color: #000;
          border-bottom: 1px solid #000;
          padding: 2px 4px;
        }

        .amount-box {
          border: 2px solid #000;
          padding: 8px 12px;
          min-width: 1.5in;
          text-align: center;
        }

        .amount-box-label {
          font-size: 8pt;
          color: #555;
        }

        .amount-box-value {
          font-size: 14pt;
          font-weight: bold;
          color: #000;
        }

        .memo-line {
          margin-bottom: 0.1in;
        }

        .memo-label {
          font-size: 9pt;
          color: #555;
        }

        .memo-value {
          font-size: 10pt;
          color: #000;
          border-bottom: 1px solid #000;
          padding: 2px 8px;
          display: inline-block;
          min-width: 3in;
        }

        .signature-line {
          text-align: right;
          margin-top: 0.1in;
        }

        .signature-label {
          font-size: 8pt;
          color: #555;
        }

        .signature-value {
          font-size: 11pt;
          color: #000;
          border-bottom: 1px solid #000;
          padding: 2px 8px;
          display: inline-block;
          min-width: 2.5in;
        }

        .micr-line {
          margin-top: 0.15in;
          padding-top: 0.1in;
          border-top: 1px solid #ccc;
          font-family: 'MICR', 'Courier New', monospace;
          font-size: 10pt;
          color: #444;
          letter-spacing: 2px;
        }

        /* Section 2: Line Items (Middle Third) */
        .line-items-section {
          min-height: 3.5in;
          page-break-after: avoid;
          margin-bottom: 0.25in;
          padding: 20px;
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 8px;
        }

        .line-items-section h3 {
          text-align: center;
          margin: 0 0 20px 0;
          color: #333;
          font-size: 18pt;
        }

        .line-items-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
        }

        .line-items-table thead tr {
          border-bottom: 2px solid #333;
          background: white;
        }

        .line-items-table th {
          padding: 12px;
          text-align: left;
          font-weight: bold;
          background: white;
        }

        .line-items-table th.text-center {
          text-align: center;
        }

        .line-items-table th.text-right {
          text-align: right;
        }

        .line-items-table tbody tr {
          border-bottom: 1px solid #eee;
          background: white;
        }

        .line-items-table td {
          padding: 10px 12px;
          background: white;
        }

        .line-items-table td.text-center {
          text-align: center;
        }

        .line-items-table td.text-right {
          text-align: right;
        }

        .line-items-table tfoot tr {
          border-top: 2px solid #333;
          font-weight: bold;
          font-size: 16pt;
          background: #f0f0f0;
        }

        .line-items-table tfoot td {
          padding: 15px 12px;
        }

        .no-items {
          text-align: center;
          padding: 40px;
          color: #6c757d;
          font-style: italic;
        }

        /* Section 3: Analytics (Bottom Third) */
        .analytics-section {
          min-height: 3.5in;
          padding: 20px;
          border-top: 2px solid #ddd;
        }

        .analytics-section h3 {
          text-align: center;
          margin: 0 0 20px 0;
          font-size: 20pt;
          font-weight: 600;
          color: #333;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 15px;
        }

        .analytics-card {
          padding: 18px;
          border-radius: 10px;
        }

        .analytics-card.totals {
          background: #e8f5e8;
          border-left: 6px solid #4caf50;
        }

        .analytics-card.stats {
          background: #fff3e0;
          border-left: 6px solid #ff9800;
        }

        .analytics-card h5 {
          margin: 0 0 12px 0;
          font-size: 14pt;
        }

        .analytics-card.totals h5 {
          color: #388e3c;
        }

        .analytics-card.stats h5 {
          color: #f57c00;
        }

        .analytics-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          padding: 6px 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          font-size: 12pt;
        }

        .analytics-row span {
          font-weight: 500;
        }

        .analytics-row strong {
          font-size: 13pt;
        }

        .analytics-card.totals .analytics-row strong {
          color: #2e7d32;
        }

        .analytics-card.stats .analytics-row strong {
          color: #e65100;
        }

        .all-time-total {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 15px;
          border-radius: 10px;
          text-align: center;
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .all-time-total div:first-child {
          font-size: 12pt;
          opacity: 0.95;
          margin-bottom: 5px;
        }

        .all-time-total div:last-child {
          font-size: 24pt;
          font-weight: bold;
        }

        /* Print button */
        .print-button {
          display: block;
          margin: 20px auto;
          padding: 12px 24px;
          background: #2196F3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14pt;
          font-weight: 600;
        }

        .print-button:hover {
          background: #1976D2;
        }

        /* Loading and error states */
        .loading-state,
        .error-state {
          text-align: center;
          padding: 40px;
          font-size: 14pt;
        }

        .error-state {
          color: #d32f2f;
        }

        @media print {
          .check-section,
          .line-items-section,
          .analytics-section {
            page-break-inside: avoid;
          }

          .line-items-section,
          .analytics-section {
            background: white !important;
            border: none !important;
          }
        }
      </style>

      <div class="printable-page-container">
        ${this.isLoading ? '<div class="loading-state">Loading check data...</div>' : ''}
        ${this.errorMessage ? `<div class="error-state">Error: ${this.escapeHtml(this.errorMessage)}</div>` : ''}
        ${this.printBlockedErrors ? `<div class="error-state print-validation-errors"><strong>Cannot print — check has validation errors:</strong><ul>${this.printBlockedErrors.map(e => `<li>${this.escapeHtml(e)}</li>`).join('')}</ul></div>` : ''}
        ${!this.isLoading && !this.errorMessage && this.currentCheck ? this.renderCheckPage(showLineItems, showAnalytics) : ''}
        ${!this.isLoading && !this.errorMessage && this.currentCheck ? '<button class="print-button" id="print-btn">🖨️ Print Check</button>' : ''}
      </div>
    `

    this.shadowRoot!.innerHTML = html

    // Add print button event listener
    const printBtn = this.shadowRoot!.getElementById('print-btn')
    if (printBtn) {
      printBtn.addEventListener('click', () => this.print())
    }
  }

  private renderCheckPage(showLineItems: boolean, showAnalytics: boolean): string {
    if (!this.currentCheck) return ''

    const check = this.currentCheck
    const amountWords = this.amountToWords(Number(check.amount))

    return `
      <!-- Section 1: Check Display -->
      <div class="check-section">
        <div class="check-display">
          <div class="check-header">
            <div class="account-info">
              <h3>${this.escapeHtml(check.accountHolderName || 'Account Holder')}</h3>
              <p>${this.escapeHtml(check.accountHolderAddress || '')}</p>
              <p>${this.escapeHtml(check.accountHolderCity || '')}, ${this.escapeHtml(check.accountHolderState || '')} ${this.escapeHtml(check.accountHolderZip || '')}</p>
            </div>
            <div class="check-number">
              <div class="check-number-label">Check No.</div>
              <div class="check-number-value">${this.escapeHtml(check.checkNumber)}</div>
            </div>
          </div>

          <div class="check-date">
            <span class="date-label">Date:</span>
            <span class="date-value">${this.escapeHtml(check.date)}</span>
          </div>

          <div class="pay-to-line">
            <div>
              <span class="pay-to-label">Pay to the Order of:</span>
              <span class="pay-to-value">${this.escapeHtml(check.payTo)}</span>
            </div>
          </div>

          <div class="amount-section">
            <div class="amount-words">
              <div class="amount-words-label">DOLLARS</div>
              <div class="amount-words-value">${this.escapeHtml(amountWords)}</div>
            </div>
            <div class="amount-box">
              <div class="amount-box-label">$</div>
              <div class="amount-box-value">${Number(check.amount).toFixed(2)}</div>
            </div>
          </div>

          <div class="memo-line">
            <span class="memo-label">Memo:</span>
            <span class="memo-value">${this.escapeHtml(check.memo || '')}</span>
          </div>

          <div class="signature-line">
            <div>
              <span class="signature-label">Authorized Signature:</span>
              <span class="signature-value">${this.escapeHtml(check.signature || '')}</span>
            </div>
          </div>

          <div class="micr-line">
            ⑆${this.escapeHtml(check.routingNumber || '000000000')}⑆ ${this.escapeHtml(check.bankAccountNumber || '0000000000')}⑈ ${this.escapeHtml(check.checkNumber)}
          </div>
        </div>
      </div>

      <!-- Section 2: Line Items -->
      ${showLineItems ? this.renderLineItems() : ''}

      <!-- Section 3: Analytics -->
      ${showAnalytics ? this.renderAnalytics() : ''}
    `
  }

  private renderLineItems(): string {
    const total = this.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)

    return `
      <div class="line-items-section">
        <h3>📋 Payment Details</h3>
        <table class="line-items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-center">Qty</th>
              <th class="text-right">Rate</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${this.lineItems.length > 0
              ? this.lineItems.map(item => `
                  <tr>
                    <td>${this.escapeHtml(item.description)}</td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-right">$${item.unitPrice.toFixed(2)}</td>
                    <td class="text-right">$${(item.quantity * item.unitPrice).toFixed(2)}</td>
                  </tr>
                `).join('')
              : '<tr><td colspan="4" class="no-items">No line items added</td></tr>'
            }
          </tbody>
          ${this.lineItems.length > 0 ? `
            <tfoot>
              <tr>
                <td colspan="3" class="text-right">Total:</td>
                <td class="text-right">$${total.toFixed(2)}</td>
              </tr>
            </tfoot>
          ` : ''}
        </table>
      </div>
    `
  }

  private renderAnalytics(): string {
    if (!this.paymentStats) return ''

    const stats = this.paymentStats

    return `
      <div class="analytics-section">
        <h3>📊 Historical Payment Summary</h3>

        <div class="analytics-grid">
          <div class="analytics-card totals">
            <h5>💰 Payment Totals</h5>
            <div class="analytics-row">
              <span>This Month:</span>
              <strong>$${stats.thisMonth.toFixed(2)}</strong>
            </div>
            <div class="analytics-row">
              <span>Last Month:</span>
              <strong>$${stats.lastMonth.toFixed(2)}</strong>
            </div>
            <div class="analytics-row">
              <span>This Year:</span>
              <strong>$${stats.thisYear.toFixed(2)}</strong>
            </div>
            <div class="analytics-row">
              <span>This Quarter:</span>
              <strong>$${stats.thisQuarter.toFixed(2)}</strong>
            </div>
            <div class="analytics-row">
              <span>Last Year:</span>
              <strong>$${stats.lastYear.toFixed(2)}</strong>
            </div>
          </div>

          <div class="analytics-card stats">
            <h5>📈 Payment Statistics</h5>
            <div class="analytics-row">
              <span>Average Payment:</span>
              <strong>$${stats.averagePayment.toFixed(2)}</strong>
            </div>
            <div class="analytics-row">
              <span>Monthly Average:</span>
              <strong>$${stats.monthlyAverage.toFixed(2)}</strong>
            </div>
            <div class="analytics-row">
              <span>Largest Payment:</span>
              <strong>$${stats.largestPayment.toFixed(2)}</strong>
            </div>
            <div class="analytics-row">
              <span>Smallest Payment:</span>
              <strong>$${stats.smallestPayment.toFixed(2)}</strong>
            </div>
            <div class="analytics-row">
              <span>Total Payments:</span>
              <strong>${stats.totalCount}</strong>
            </div>
          </div>
        </div>

        <div class="all-time-total">
          <div>All Time Total</div>
          <div>$${stats.allTimeTotal.toFixed(2)}</div>
        </div>
      </div>
    `
  }
}

// Register the custom element
if (!customElements.get('printchecks-printable-page')) {
  customElements.define('printchecks-printable-page', PrintChecksCheckPrintablePage)
}
