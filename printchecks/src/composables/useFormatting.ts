// No imports needed

export function useFormatting() {
  function formatMoney(amount: string | number): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(num)) return '0.00'

    return num.toLocaleString('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  function formatCurrency(amount: string | number, currency = 'USD'): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(num)) return '$0.00'

    return num.toLocaleString('en-US', {
      style: 'currency',
      currency: currency
    })
  }

  function formatDate(date: string | Date, format = 'short'): string {
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return ''

    switch (format) {
      case 'short':
        return d.toLocaleDateString('en-US')
      case 'long':
        return d.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      case 'iso':
        return d.toISOString().split('T')[0]
      default:
        return d.toLocaleDateString('en-US')
    }
  }

  function formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  function formatRoutingNumber(routing: string): string {
    const cleaned = routing.replace(/\D/g, '')
    if (cleaned.length === 9) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return routing
  }

  function formatAccountNumber(account: string): string {
    if (account.length > 4) {
      const masked = '*'.repeat(account.length - 4)
      return masked + account.slice(-4)
    }
    return account
  }

  function formatCheckNumber(checkNum: string | number): string {
    const num = typeof checkNum === 'number' ? checkNum.toString() : checkNum
    return num.padStart(4, '0')
  }

  function formatPercentage(value: number, decimals = 1): string {
    return `${(value * 100).toFixed(decimals)}%`
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength - 3) + '...'
  }

  function capitalizeFirst(text: string): string {
    if (!text) return ''
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  }

  function capitalizeWords(text: string): string {
    if (!text) return ''
    return text
      .split(' ')
      .map((word) => capitalizeFirst(word))
      .join(' ')
  }

  function parseAmount(input: string): number {
    // Remove currency symbols and commas
    const cleaned = input.replace(/[$,]/g, '')
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }

  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  function validatePhone(phone: string): boolean {
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
    return phoneRegex.test(phone)
  }

  function validateZip(zip: string): boolean {
    const zipRegex = /^\d{5}(-\d{4})?$/
    return zipRegex.test(zip)
  }

  return {
    formatMoney,
    formatCurrency,
    formatDate,
    formatPhoneNumber,
    formatRoutingNumber,
    formatAccountNumber,
    formatCheckNumber,
    formatPercentage,
    formatFileSize,
    truncateText,
    capitalizeFirst,
    capitalizeWords,
    parseAmount,
    validateEmail,
    validatePhone,
    validateZip
  }
}
