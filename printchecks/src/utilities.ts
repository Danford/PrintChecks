// Legacy utility functions - kept for backward compatibility
function formatMoney(number: string | number) {
  const num = typeof number === 'string' ? parseFloat(number) : number
  return num.toLocaleString('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// Re-export from new composables for enhanced functionality
export { formatMoney }
export { useFormatting } from './composables/useFormatting'
