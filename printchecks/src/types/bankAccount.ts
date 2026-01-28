import type { BaseEntity } from './common'

export interface BankAccount extends BaseEntity {
    accountHolderName: string
    accountHolderAddress: string
    accountHolderCity: string
    accountHolderState: string
    accountHolderZip: string
    name: string
    accountNumber: string
    routingNumber: string
    accountType: string
    startingCheckNumber: number
    signature: string
    address?: string
    isDefault?: boolean
    templateId?: string
}
