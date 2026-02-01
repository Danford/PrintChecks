# Utilities

Utility functions for formatting, validation, and encryption.

## Formatting

### amountToWords()

Convert numeric amount to words for check writing.

```typescript
import { amountToWords } from '@printchecks/core/utils'

const words = amountToWords(1250.50, 'USD')
// "One Thousand Two Hundred Fifty and 50/100 Dollars"
```

### formatCurrency()

Format amount as currency string.

```typescript
import { formatCurrency } from '@printchecks/core/utils'

const formatted = formatCurrency(1250.50, 'USD')
// "$1,250.50"
```

## Validation

### validateRoutingNumber()

Validate bank routing number format.

```typescript
import { validateRoutingNumber } from '@printchecks/core/utils'

const isValid = validateRoutingNumber('123456789')
// true
```

### validateCheckNumber()

Validate check number format.

```typescript
import { validateCheckNumber } from '@printchecks/core/utils'

const isValid = validateCheckNumber('1001')
// true
```

### validateAmount()

Validate amount is valid number.

```typescript
import { validateAmount } from '@printchecks/core/utils'

const isValid = validateAmount(1250.50)
// true
```

## Encryption

### encrypt()

Encrypt data using AES-256-GCM.

```typescript
import { encrypt } from '@printchecks/core/utils'

const encrypted = await encrypt('sensitive data', 'password')
```

### decrypt()

Decrypt data.

```typescript
import { decrypt } from '@printchecks/core/utils'

const decrypted = await decrypt(encrypted, 'password')
```

### generateKey()

Generate encryption key from password.

```typescript
import { generateKey } from '@printchecks/core/utils'

const key = await generateKey('password')
```

## See Also

- [PrintChecksCore](/api/core/printchecks-core)
- [User Guide](/guide/basic-usage)
