// Legacy utility functions - kept for backward compatibility
function formatMoney (number: string) {
    var numberFloat = parseFloat(number)
    return numberFloat.toLocaleString('en-US', {style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2})
}

// Re-export from new composables for enhanced functionality
export { formatMoney }
export { useFormatting } from './composables/useFormatting'
