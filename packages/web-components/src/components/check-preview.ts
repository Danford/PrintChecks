/**
 * <printchecks-check-preview> Web Component
 * Displays a check in print-ready format
 */

import { PrintChecksComponent } from '../utils/component-base'
import type { Check } from '@printchecks/core'
import baseStyles from '../styles/base.css?raw'

export class PrintChecksCheckPreview extends PrintChecksComponent {
  private checkId: string | null = null
  private currentCheck: Check | null = null
  private isLoading = false
  private errorMessage: string | null = null

  static get observedAttributes() {
    return ['check-id', 'scale']
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

  protected render(): void {
    const scale = this.getAttribute('scale') || '1'

    const html = `
      <style>${baseStyles}</style>
      <style>
        :host {
          display: block;
          max-width: 100%;
        }
        
        .check-preview-container {
          padding: var(--pc-spacing-lg);
        }
        
        .check-preview {
          width: 8in;
          height: 3.5in;
          border: 2px solid var(--pc-border-color);
          background: white;
          position: relative;
          font-family: 'Courier New', monospace;
          transform: scale(${scale});
          transform-origin: top left;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        @media print {
          .check-preview {
            border: none;
            box-shadow: none;
            transform: none;
          }
          
          .check-preview-container {
            padding: 0;
          }
        }
        
        /* Check layout */
        .check-header {
          display: flex;
          justify-content: space-between;
          padding: 0.5in 0.5in 0.25in 0.5in;
          border-bottom: 1px solid var(--pc-border-color);
        }
        
        .account-info {
          flex: 1;
        }
        
        .account-name {
          font-size: 14pt;
          font-weight: bold;
          margin-bottom: 4px;
        }
        
        .bank-name {
          font-size: 10pt;
          color: #666;
          margin-bottom: 2px;
        }
        
        .account-address {
          font-size: 9pt;
          color: #666;
        }
        
        .check-number-date {
          text-align: right;
        }
        
        .check-number {
          font-size: 16pt;
          font-weight: bold;
          color: var(--pc-primary-color);
          margin-bottom: 8px;
        }
        
        .check-date {
          font-size: 10pt;
        }
        
        /* Check body */
        .check-body {
          padding: 0.25in 0.5in;
        }
        
        .pay-to-line {
          display: flex;
          align-items: baseline;
          margin-bottom: 0.15in;
        }
        
        .pay-to-label {
          font-size: 10pt;
          margin-right: 8px;
        }
        
        .pay-to-value {
          flex: 1;
          border-bottom: 1px solid #333;
          font-size: 11pt;
          padding: 2px 4px;
        }
        
        .amount-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.15in;
        }
        
        .amount-words {
          flex: 1;
          border-bottom: 1px solid #333;
          font-size: 10pt;
          padding: 2px 4px;
          margin-right: 12px;
        }
        
        .amount-numeric {
          border: 2px solid #333;
          padding: 4px 12px;
          font-size: 14pt;
          font-weight: bold;
          min-width: 120px;
          text-align: right;
        }
        
        .memo-line {
          display: flex;
          align-items: baseline;
          margin-bottom: 0.15in;
        }
        
        .memo-label {
          font-size: 9pt;
          margin-right: 8px;
        }
        
        .memo-value {
          flex: 1;
          border-bottom: 1px solid #333;
          font-size: 10pt;
          padding: 2px 4px;
          max-width: 300px;
        }
        
        .signature-line {
          display: flex;
          justify-content: flex-end;
          margin-top: 0.2in;
        }
        
        .signature-container {
          width: 250px;
        }
        
        .signature-value {
          border-bottom: 1px solid #333;
          font-size: 18pt;
          font-family: 'Brush Script MT', cursive;
          text-align: center;
          padding: 2px 4px;
          min-height: 30px;
        }
        
        .signature-label {
          font-size: 8pt;
          text-align: center;
          margin-top: 2px;
        }
        
        /* MICR line */
        .micr-line {
          position: absolute;
          bottom: 0.25in;
          left: 0.5in;
          right: 0.5in;
          font-family: 'MICR Encoding', monospace;
          font-size: 12pt;
          letter-spacing: 2px;
          color: #000;
        }
        
        /* Watermark */
        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 48pt;
          color: rgba(0, 0, 0, 0.05);
          font-weight: bold;
          pointer-events: none;
        }
        
        .actions {
          margin-top: var(--pc-spacing-md);
          display: flex;
          gap: var(--pc-spacing-md);
        }
        
        @media print {
          .actions {
            display: none;
          }
        }
      </style>
      
      <div class="check-preview-container">
        ${this.errorMessage ? `<div class="error-message">${this.errorMessage}</div>` : ''}
        ${this.isLoading ? '<div class="text-center"><span class="spinner"></span> Loading...</div>' : ''}
        
        ${this.currentCheck ? this.renderCheck() : '<div class="text-muted">No check to preview</div>'}
        
        ${this.currentCheck
        ? `
          <div class="actions">
            <button type="button" class="btn btn-primary" id="printBtn">
              Print Check
            </button>
            <button type="button" class="btn btn-secondary" id="downloadBtn">
              Download PDF
            </button>
          </div>
        `
        : ''
      }
      </div>
    `

    this.setInnerHTML(html)
    this.attachEventListeners()
  }

  private renderCheck(): string {
    if (!this.currentCheck) return ''

    const check = this.currentCheck
    const amountWords = this.numberToWords(parseFloat(check.amount.toString()))

    return `
      <div class="check-preview">
        <div class="watermark">VOID</div>
        
        <div class="check-header">
          <div class="account-info">
            <div class="account-name">${this.escapeHtml(check.accountHolderName)}</div>
            <div class="bank-name">${this.escapeHtml(check.bankName)}</div>
            <div class="account-address">
              ${this.escapeHtml(check.accountHolderAddress)}<br>
              ${this.escapeHtml(check.accountHolderCity)}, ${this.escapeHtml(check.accountHolderState)} ${this.escapeHtml(check.accountHolderZip)}
            </div>
          </div>
          
          <div class="check-number-date">
            <div class="check-number">${this.escapeHtml(check.checkNumber)}</div>
            <div class="check-date">${this.formatDate(check.date)}</div>
          </div>
        </div>
        
        <div class="check-body">
          <div class="pay-to-line">
            <span class="pay-to-label">Pay to the order of:</span>
            <span class="pay-to-value">${this.escapeHtml(check.payTo)}</span>
          </div>
          
          <div class="amount-line">
            <span class="amount-words">${amountWords} DOLLARS</span>
            <span class="amount-numeric">$${parseFloat(check.amount.toString()).toFixed(2)}</span>
          </div>
          
          <div class="memo-line">
            <span class="memo-label">Memo:</span>
            <span class="memo-value">${this.escapeHtml(check.memo || '')}</span>
          </div>
          
          <div class="signature-line">
            <div class="signature-container">
              <div class="signature-value">${this.escapeHtml(check.signature || '')}</div>
              <div class="signature-label">Authorized Signature</div>
            </div>
          </div>
        </div>
        
        <div class="micr-line">
          ⑆${check.routingNumber}⑆ ${check.bankAccountNumber}⑈ ${check.checkNumber}
        </div>
      </div>
    `
  }

  private attachEventListeners(): void {
    const printBtn = this.querySelector('#printBtn')
    const downloadBtn = this.querySelector('#downloadBtn')

    if (printBtn) {
      printBtn.addEventListener('click', () => this.handlePrint())
    }

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => this.handleDownload())
    }
  }

  private handlePrint(): void {
    window.print()
    this.emit('check-printed', { check: this.currentCheck })
  }

  private async handleDownload(): Promise<void> {
    if (!this.currentCheck) return

    try {
      // In a real implementation, you'd use a library like jsPDF
      // For now, we'll emit an event that can be handled by the parent app
      this.emit('download-requested', { check: this.currentCheck })

      // Alternative: open print dialog and let user "print to PDF"
      this.handlePrint()
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to download'
      this.render()
      this.emit('error', { error: this.errorMessage })
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


  private numberToWords(num: number): string {
    if (num === 0) return 'Zero'

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
    const teens = [
      'Ten',
      'Eleven',
      'Twelve',
      'Thirteen',
      'Fourteen',
      'Fifteen',
      'Sixteen',
      'Seventeen',
      'Eighteen',
      'Nineteen',
    ]
    const tens = [
      '',
      '',
      'Twenty',
      'Thirty',
      'Forty',
      'Fifty',
      'Sixty',
      'Seventy',
      'Eighty',
      'Ninety',
    ]

    const convert = (n: number): string => {
      if (n < 10) return ones[n]
      if (n < 20) return teens[n - 10]
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '')
      if (n < 1000)
        return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '')
      if (n < 1000000)
        return (
          convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '')
        )
      return (
        convert(Math.floor(n / 1000000)) +
        ' Million' +
        (n % 1000000 ? ' ' + convert(n % 1000000) : '')
      )
    }

    const dollars = Math.floor(num)
    const cents = Math.round((num - dollars) * 100)

    let result = convert(dollars)
    if (cents > 0) {
      result += ` and ${cents}/100`
    }

    return result
  }

  // Public methods
  public setCheck(check: Check): void {
    this.currentCheck = check
    this.render()
  }

  public print(): void {
    this.handlePrint()
  }
}

// Register the custom element
customElements.define('printchecks-check-preview', PrintChecksCheckPreview)
