import type { BaseEntity } from './common'

export interface Vendor extends BaseEntity {
    name: string
    email: string
    phone: string
    address: string
}
