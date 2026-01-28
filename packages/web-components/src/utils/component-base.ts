/**
 * Base class for all PrintChecks Web Components
 * Provides common functionality and utilities
 */

import { PrintChecksCore, type PrintChecksCoreConfig } from '@printchecks/core'

// Global store for shared PrintChecksCore instance
let globalCore: PrintChecksCore | null = null

export abstract class PrintChecksComponent extends HTMLElement {
  protected shadow: ShadowRoot
  protected core: PrintChecksCore

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    this.core = this.getOrCreateCoreInstance()
  }

  /**
   * Get or create the global PrintChecksCore instance
   */
  protected getOrCreateCoreInstance(): PrintChecksCore {
    if (!globalCore) {
      globalCore = new PrintChecksCore({
        autoIncrementCheckNumber: true,
        autoIncrementReceiptNumber: true,
        defaultCurrency: 'USD',
      })
    }
    return globalCore
  }

  /**
   * Emit a custom event
   */
  protected emit(eventName: string, detail: unknown = {}): void {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail,
        bubbles: true,
        composed: true,
      })
    )
  }

  /**
   * Apply styles to shadow DOM
   */
  protected applyStyles(styles: string): void {
    const styleSheet = new CSSStyleSheet()
    styleSheet.replaceSync(styles)
    this.shadow.adoptedStyleSheets = [styleSheet]
  }

  /**
   * Render the component (to be implemented by subclasses)
   */
  protected abstract render(): void

  /**
   * Get an attribute as boolean
   */
  protected getBooleanAttribute(name: string): boolean {
    return this.hasAttribute(name) && this.getAttribute(name) !== 'false'
  }

  /**
   * Set inner HTML safely
   */
  protected setInnerHTML(html: string): void {
    this.shadow.innerHTML = html
  }

  /**
   * Query element in shadow DOM
   */
  public querySelector<T extends Element>(selector: string): T | null {
    return this.shadow.querySelector<T>(selector)
  }

  /**
   * Query all elements in shadow DOM
   */
  public querySelectorAll<T extends Element>(selector: string): NodeListOf<T> {
    return this.shadow.querySelectorAll<T>(selector)
  }

  /**
   * Add event listener to shadow DOM element
   */
  protected addListener(
    selector: string,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): void {
    const element = this.querySelector(selector)
    if (element) {
      element.addEventListener(event, handler, options)
    }
  }

  /**
   * Format currency for display
   */
  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  /**
   * Format date for display
   */
  protected formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  /**
   * Escape HTML to prevent XSS
   */
  protected escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }
    return text.replace(/[&<>"']/g, (m) => map[m])
  }
}

/**
 * Global configuration for PrintChecks components
 */
export class PrintChecksConfig {
  static configure(config: unknown): void {
    globalCore = new PrintChecksCore(config as PrintChecksCoreConfig)
  }

  static getCore(): PrintChecksCore | null {
    return globalCore
  }
}
