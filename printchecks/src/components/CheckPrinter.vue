<template>
    <!-- FORM SECTION - Now at the top -->
    <div class="form-container">
        <!-- QUICK CHECK CREATION (only show when no check data exists) -->
        <div v-if="!(check.payTo && check.amount > 0)" class="enhanced-check-creation" style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h5 style="margin-bottom: 15px; color: #495057;">✏️ Quick Check Creation</h5>
            <div class="alert alert-warning" role="alert" style="margin-bottom: 15px;">
                <strong>⚠️ Important:</strong> Once a check is written and printed, it cannot be deleted. Checks can only be voided in the history.
            </div>
            <div class="row g-3 mb-4">
                <div class="col-md-6">
                    <label for="bankSelect" class="form-label">Select Bank Account</label>
                    <select class="form-control" id="bankSelect" v-model="selectedBankId" @change="loadBankAccount">
                        <option value="">Choose Bank Account...</option>
                        <option v-for="bank in bankAccounts" :key="bank.id" :value="bank.id">
                            {{ bank.name }} (****{{ bank.accountNumber.slice(-4) }})
                        </option>
                    </select>
                    <small class="text-muted">
                        <a href="#" @click.prevent="openNewBankAccountModal" style="text-decoration: none;">➕ Add New Bank Account</a>
                    </small>
                </div>
                <div class="col-md-6">
                    <label for="vendorSelect" class="form-label">Select Vendor</label>
                    <select class="form-control" id="vendorSelect" v-model="selectedVendorId" @change="loadVendor">
                        <option value="">Choose Vendor...</option>
                        <option v-for="vendor in vendors" :key="vendor.id" :value="vendor.id">
                            {{ vendor.name }}
                        </option>
                    </select>
                    <small class="text-muted">
                        <a href="#" @click.prevent="openNewVendorModal" style="text-decoration: none;">➕ Add New Vendor</a>
                    </small>
                </div>
            </div>

            <!-- LINE ITEMS SECTION (nested inside) -->
            <div class="line-items-section" style="background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #dee2e6;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h5 style="margin: 0; color: #495057;">📋 Service Line Items</h5>
                    <button type="button" class="btn btn-sm btn-outline-primary" @click="showLineItemForm = !showLineItemForm" :disabled="check.isSaved">
                        {{ showLineItemForm ? '➖ Hide Form' : '➕ Add Line Item' }}
                    </button>
                </div>
                <div v-if="check.isSaved" class="alert alert-info mb-3" style="font-size: 0.9rem;">
                    <strong>🔒 Read-Only:</strong> This check has been saved and line items cannot be modified.
                </div>
                
                <!-- Add Line Item Form -->
                <div v-if="showLineItemForm" class="line-item-form" style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
                    <div class="row g-3">
                        <div class="col-md-5">
                            <label class="form-label">Service Description</label>
                            <input type="text" class="form-control" v-model="newLineItem.description" placeholder="e.g., Consulting Services">
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">Quantity</label>
                            <input type="number" class="form-control" v-model.number="newLineItem.quantity" min="0" step="0.01">
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">Rate ($)</label>
                            <input type="number" class="form-control" v-model.number="newLineItem.rate" min="0" step="0.01">
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">Amount</label>
                            <input type="text" class="form-control" :value="'$' + (newLineItem.quantity * newLineItem.rate).toFixed(2)" readonly style="background: #e9ecef;">
                        </div>
                        <div class="col-md-1 d-flex align-items-end">
                            <button type="button" class="btn btn-primary w-100" @click="addLineItem" :disabled="!newLineItem.description || newLineItem.quantity <= 0 || newLineItem.rate <= 0">
                                ✓
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Line Items Table -->
                <div v-if="currentLineItems.length > 0" class="line-items-table-editor">
                    <table class="table table-sm table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>Description</th>
                                <th class="text-center">Qty</th>
                                <th class="text-end">Rate</th>
                                <th class="text-end">Amount</th>
                                <th class="text-center" style="width: 80px;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in currentLineItems" :key="item.id">
                                <td>{{ item.description }}</td>
                                <td class="text-center">{{ item.quantity }}</td>
                                <td class="text-end">${{ item.rate.toFixed(2) }}</td>
                                <td class="text-end">${{ (item.quantity * item.rate).toFixed(2) }}</td>
                                <td class="text-center">
                                    <button type="button" class="btn btn-sm btn-outline-danger" @click="removeLineItem(index)" title="Remove" :disabled="check.isSaved">
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                        <tfoot class="table-light">
                            <tr>
                                <td colspan="3" class="text-end"><strong>Total:</strong></td>
                                <td class="text-end"><strong>${{ lineItemsTotal.toFixed(2) }}</strong></td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <!-- Empty State -->
                <div v-else class="alert alert-info mb-0">
                    <strong>ℹ️ No line items added yet.</strong> Click "Add Line Item" to add service details.
                </div>
            </div>

            <!-- Write New Check Button -->
            <div class="text-center">
                <button type="button" class="btn btn-success btn-lg" @click="openQuickCheckModal" :disabled="!selectedBankId || check.isSaved" style="padding: 15px 40px;">
                    ➕ Write New Check
                </button>
                <div v-if="check.isSaved" class="text-muted mt-2">
                    Check is saved and locked
                </div>
            </div>
        </div>

        <!-- QUICK CHECK MODAL -->
        <div v-if="showQuickCheckModal" class="modal-overlay">
            <div class="modal-content">
                <h5>💰 Write New Check</h5>
                <div class="alert alert-warning mb-3" role="alert" style="font-size: 0.9rem;">
                    <strong>⚠️ Warning:</strong> Once created and printed, checks cannot be deleted or edited. They can only be voided.
                </div>
                <div class="mb-3">
                    <strong>Bank:</strong> {{ selectedBank?.name }}<br>
                    <strong>Vendor:</strong> {{ selectedVendor?.name || 'Custom Payee' }}<br>
                    <strong>Check #:</strong> {{ nextCheckNumber }}
                </div>
                <form @submit.prevent="createQuickCheck">
                    <div class="mb-3">
                        <label class="form-label">Pay To</label>
                        <input type="text" class="form-control" v-model="quickCheckForm.payTo" readonly style="background-color: #e9ecef; cursor: not-allowed;" required>
                        <small class="text-muted">🔒 Auto-populated from selected vendor</small>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Amount ($)</label>
                        <input 
                            type="number" 
                            step="0.01" 
                            class="form-control" 
                            v-model="quickCheckForm.amount" 
                            :readonly="currentLineItems.length > 0"
                            :style="currentLineItems.length > 0 ? 'background-color: #e9ecef; cursor: not-allowed;' : ''"
                            required>
                        <small v-if="currentLineItems.length > 0" class="text-muted">
                            💡 Amount is locked to line items total (${{ lineItemsTotal.toFixed(2) }})
                        </small>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Memo</label>
                        <input type="text" class="form-control" v-model="quickCheckForm.memo">
                    </div>
                    <div class="btn-group w-100">
                        <button type="submit" class="btn btn-primary">Create Check</button>
                        <button type="button" class="btn btn-secondary" @click="closeQuickCheckModal">Cancel</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="check-data">
            <!-- Show Save/Print Buttons when check is ready -->
            <div v-if="check.payTo && check.amount > 0" class="text-center" style="padding: 30px;">
                <!-- Saved Check Message -->
                <div v-if="check.isSaved" class="alert alert-info mb-4" role="alert">
                    <strong>💾 Check Saved!</strong> This check has been saved to history and is now read-only. You can reprint it below.
                </div>
                <!-- Unsaved Check Message -->
                <div v-else class="alert alert-success mb-4" role="alert">
                    <strong>✅ Check Ready!</strong> Review the check preview below, then save or print.
                </div>
                
                <!-- Buttons -->
                <div class="d-flex gap-3 justify-content-center">
                    <!-- Save button - only show if not saved -->
                    <button v-if="!check.isSaved" type="button" class="btn btn-success btn-lg" @click="saveToHistory" style="padding: 15px 40px; font-size: 18px;">
                        💾 Save Check
                    </button>
                    <!-- Print button - always show when check has data -->
                    <button type="button" class="btn btn-primary btn-lg" @click="printCheck" style="padding: 15px 40px; font-size: 18px;">
                        🖨️ {{ check.isSaved ? 'Reprint Check (Ctrl + P)' : 'Print Check (Ctrl + P)' }}
                    </button>
                </div>
                <div class="mt-3">
                    <small class="text-muted">{{ check.isSaved ? 'Check is locked and cannot be modified, but you can reprint it' : 'Save to history or print (saves automatically)' }}</small>
                </div>
            </div>
            
        </div>
    </div>
    
    <!-- CHECK PREVIEW - Shown when check is created (outside form-container for printing) -->
    <div v-if="check.payTo && check.amount > 0">
        <!-- MAIN PRINT CONTAINER - All 3 sections in one div -->
        <div class="print-container" id="print-container">
                    <!-- SECTION 1: Check (Top Third) -->
                    <div class="check-section">
                        <div class="check-box" id="check-box">
                        <div style="position: relative;" id="check-box-print">
                            <div class="account-holder-name" :style="{ ...checkStyles.accountHolderName, position: 'absolute', ...dynamicTextPositions.accountHolderName }">{{check.accountHolderName}}</div>
                            <div class="account-holder-address" :style="{ ...checkStyles.accountHolderName, position: 'absolute', ...dynamicTextPositions.accountHolderAddress }">
                                {{check.accountHolderAddress}}<br>
                                {{check.accountHolderCity}}, {{check.accountHolderState}} {{check.accountHolderZip}}
                            </div>
                            <div class="check-number-human" :style="{ ...checkStyles.checkNumber, position: 'absolute', ...dynamicTextPositions.checkNumber }">{{check.checkNumber}}</div>
                            <div class="bank-name-top" :style="{ ...checkStyles.bankName, position: 'absolute', top: '50px', left: '0px', width: '100%', textAlign: 'center' }">{{check.bankName}}</div>
                            <div class="bank-address-top" :style="{ ...checkStyles.bankName, position: 'absolute', top: '70px', left: '0px', width: '100%', textAlign: 'center' }">
                                {{check.bankAddress || ''}}
                            </div>
                            <div class="date-data" :style="{ ...checkStyles.date, position: 'absolute', ...dynamicTextPositions.date }">{{check.date}}</div>
                            <div class="date" :style="{ ...checkStyles.fieldLabels, position: 'absolute', top: '90px', left: '780px' }">Date: _____________________ </div>
                            <div class="amount-box-border" style="position: absolute; top: 195px; left: 950px; width: 225px; height: 40px; border: 1px solid #c7c7c7; background-color: white;">
                            </div>
                            <div class="amount-dollar-sign" :style="{ ...checkStyles.fieldLabels, position: 'absolute', top: '201px', left: '935px' }">$</div>
                            <div class="amount-data" :style="{ ...checkStyles.amount, position: 'absolute', ...dynamicTextPositions.amount }">{{formatMoney(check.amount)}}</div>
                            <div class="pay-to-data" :style="{ ...checkStyles.payTo, position: 'absolute', ...dynamicTextPositions.payTo }">{{check.payTo}}</div>
                            <div class="pay-to" :style="{ ...checkStyles.fieldLabels, position: 'absolute', top: '170px', left: '60px' }">
                                Pay to the <br>Order of: <span class="payto-line"></span>
                            </div>
                            <div class="amount-line-data" ref="line" :style="{ ...checkStyles.amountWords, position: 'absolute', ...dynamicTextPositions.amountWords }">
                                ***
                                <span v-html="toWords(check.amount)"></span>
                                ***
                            </div>
                            <div class="amount-line" :style="{ ...checkStyles.fieldLabels, position: 'absolute', top: '250px', left: '60px' }">
                                <span class="dollar-line"></span>
                            </div>
                            <!-- Hand-drawn line after amount words -->
                            <svg v-if="check.lineLength" 
                                 class="amount-handdrawn-line" 
                                 :style="{ 
                                     position: 'absolute', 
                                     top: '252px', 
                                     left: `${check.lineLength + 60 + 45}px`,
                                     width: `${840 - check.lineLength - 45}px`,
                                     height: '6px'
                                 }"
                                 :viewBox="`0 0 ${840 - check.lineLength - 45} 6`"
                                 preserveAspectRatio="none">
                                <path :d="`M 0 3 Q ${(840 - check.lineLength - 45) * 0.1} 2, ${(840 - check.lineLength - 45) * 0.2} 3.5 T ${(840 - check.lineLength - 45) * 0.4} 2.8 T ${(840 - check.lineLength - 45) * 0.6} 3.3 T ${(840 - check.lineLength - 45) * 0.8} 2.5 T ${840 - check.lineLength - 45} 3`"
                                      stroke="#2b2b2b" 
                                      stroke-width="1.8" 
                                      stroke-linecap="round"
                                      fill="none"
                                      opacity="0.85"/>
                            </svg>
                            <div class="memo-data" :style="{ ...checkStyles.memo, position: 'absolute', ...dynamicTextPositions.memo }">{{check.memo}}</div>
                            <div class="memo" :style="{ ...checkStyles.fieldLabels, position: 'absolute', top: '390px', left: '60px' }">
                                Memo: ____________________________________
                            </div>
                            <div class="signature-data" :style="{ ...checkStyles.signature, position: 'absolute', ...dynamicTextPositions.signature }">{{check.signature}}</div>
                            <div class="signature" :style="{ ...checkStyles.fieldLabels, position: 'absolute', top: '390px', left: '750px' }">
                                _______________________________
                            </div>
                            <div class="signature-label" :style="{ ...checkStyles.fieldLabels, position: 'absolute', top: '410px', left: '780px', width: '300px', textAlign: 'center' }">
                                Authorized Signature
                            </div>
                            <div class="banking" :style="{ ...checkStyles.bankInfo, position: 'absolute', ...dynamicTextPositions.bankInfo, width: '100%', textAlign: 'center' }">
                                <div class="routing" style="display: inline;">
                                    a{{check.routingNumber}}a
                                </div>
                                <div class="bank-account" style="display: inline;">{{check.bankAccountNumber}}c</div>
                                <div class="check-number" style="display: inline; margin-left:20px">{{check.checkNumber}}</div>
                            </div>

                            <!-- Logo Section -->
                            <div v-if="hasCustomLogo && logoImageSrc" 
                                 class="logo-container" 
                                 :class="`logo-${currentSettings?.logo?.position || 'top-left'}`"
                                 :style="{ 
                                   width: `${currentSettings?.logo?.size?.width || 100}px`,
                                   height: `${currentSettings?.logo?.size?.height || 50}px`,
                                   opacity: currentSettings?.logo?.opacity || 1,
                                   marginTop: `${currentSettings?.logo?.margin?.top || 0}px`,
                                   marginRight: `${currentSettings?.logo?.margin?.right || 0}px`,
                                   marginBottom: `${currentSettings?.logo?.margin?.bottom || 0}px`,
                                   marginLeft: `${currentSettings?.logo?.margin?.left || 0}px`
                                 }">
                                <img :src="logoImageSrc" 
                                     alt="Logo"
                                     :style="{
                                       width: '100%',
                                       height: '100%',
                                       objectFit: currentSettings?.logo?.objectFit || 'contain',
                                       objectPosition: currentSettings?.logo?.objectPosition || 'center'
                                     }"
                                     @error="handleLogoError"
                                     @load="handleLogoLoad" />
                            </div>
                            

                        </div>
                        </div>
                    </div>

                    <!-- SECTION 2: Payment Details (Middle Third) -->
                    <div class="payment-details-section">
                        <h3 style="margin-bottom: 20px; color: #333; text-align: center;">📋 Payment Details</h3>
                        <div class="line-items-table" style="background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6; max-width: 800px; margin: 0 auto;">
                            <table style="width: 100%; font-size: 14px;">
                                <thead>
                                    <tr style="border-bottom: 2px solid #333;">
                                        <th style="text-align: left; padding: 12px;">Description</th>
                                        <th style="text-align: center; padding: 12px;">Qty</th>
                                        <th style="text-align: right; padding: 12px;">Rate</th>
                                        <th style="text-align: right; padding: 12px;">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in currentLineItems" :key="item.id" style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 10px 12px;">{{ item.description }}</td>
                                        <td style="text-align: center; padding: 10px 12px;">{{ item.quantity }}</td>
                                        <td style="text-align: right; padding: 10px 12px;">${{ item.rate.toFixed(2) }}</td>
                                        <td style="text-align: right; padding: 10px 12px;">${{ (item.quantity * item.rate).toFixed(2) }}</td>
                                    </tr>
                                    <tr v-if="currentLineItems.length === 0">
                                        <td colspan="4" style="text-align: center; padding: 20px; color: #6c757d;">
                                            No line items added. Add service details in the form above.
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot v-if="currentLineItems.length > 0">
                                    <tr style="border-top: 2px solid #333; font-weight: bold; font-size: 18px; background: #f0f0f0;">
                                        <td colspan="3" style="text-align: right; padding: 15px 12px;">Total:</td>
                                        <td style="text-align: right; padding: 15px 12px;">${{ lineItemsTotal.toFixed(2) }}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    <!-- SECTION 3: Enhanced Payment Summary (Bottom Third) -->
                    <div class="payment-summary-section" style="margin-top: 50px; padding: 30px; border-top: 2px solid #ddd;">
                        
                        <!-- Two-Column Layout -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 1200px; margin: 0 auto;">
                            <!-- Payment Totals Card -->
                            <div style="background: #e8f5e8; padding: 25px; border-radius: 12px; border-left: 6px solid #4caf50;">
                                <h5 style="color: #388e3c; margin-bottom: 20px;">💰 Payment Totals</h5>
                                <div style="font-size: 15px; line-height: 1.6;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding: 8px 0; border-bottom: 1px solid rgba(56, 142, 60, 0.2);">
                                        <span style="font-weight: 500;">This Month:</span>
                                        <strong style="color: #2e7d32; font-size: 16px;">${{ enhancedPaymentStats.thisMonth.toFixed(2) }}</strong>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding: 8px 0; border-bottom: 1px solid rgba(56, 142, 60, 0.2);">
                                        <span style="font-weight: 500;">Last Month:</span>
                                        <strong style="color: #2e7d32; font-size: 16px;">${{ enhancedPaymentStats.lastMonth.toFixed(2) }}</strong>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding: 8px 0; border-bottom: 1px solid rgba(56, 142, 60, 0.2);">
                                        <span style="font-weight: 500;">This Year:</span>
                                        <strong style="color: #2e7d32; font-size: 16px;">${{ paymentStats.thisYear.toFixed(2) }}</strong>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding: 8px 0; border-bottom: 1px solid rgba(56, 142, 60, 0.2);">
                                        <span style="font-weight: 500;">This Quarter:</span>
                                        <strong style="color: #2e7d32; font-size: 16px;">${{ enhancedPaymentStats.thisQuarter.toFixed(2) }}</strong>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                                        <span style="font-weight: 500;">Last Year:</span>
                                        <strong style="color: #2e7d32; font-size: 16px;">${{ enhancedPaymentStats.lastYear.toFixed(2) }}</strong>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Payment Statistics Card -->
                            <div style="background: #fff3e0; padding: 25px; border-radius: 12px; border-left: 6px solid #ff9800;">
                                <h5 style="color: #f57c00; margin-bottom: 20px;">📈 Payment Statistics</h5>
                                <div style="font-size: 15px; line-height: 1.6;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding: 8px 0; border-bottom: 1px solid rgba(245, 124, 0, 0.2);">
                                        <span style="font-weight: 500;">Average Payment:</span>
                                        <strong style="color: #e65100; font-size: 16px;">${{ enhancedPaymentStats.averagePayment.toFixed(2) }}</strong>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding: 8px 0; border-bottom: 1px solid rgba(245, 124, 0, 0.2);">
                                        <span style="font-weight: 500;">Monthly Average:</span>
                                        <strong style="color: #e65100; font-size: 16px;">${{ enhancedPaymentStats.monthlyAverage.toFixed(2) }}</strong>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding: 8px 0; border-bottom: 1px solid rgba(245, 124, 0, 0.2);">
                                        <span style="font-weight: 500;">Largest Payment:</span>
                                        <strong style="color: #e65100; font-size: 16px;">${{ enhancedPaymentStats.largestPayment.toFixed(2) }}</strong>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding: 8px 0; border-bottom: 1px solid rgba(245, 124, 0, 0.2);">
                                        <span style="font-weight: 500;">Smallest Payment:</span>
                                        <strong style="color: #e65100; font-size: 16px;">${{ enhancedPaymentStats.smallestPayment.toFixed(2) }}</strong>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                                        <span style="font-weight: 500;">Total Payments:</span>
                                        <strong style="color: #e65100; font-size: 16px;">{{ paymentStats.count }}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- All Time Total - Highlighted Banner -->
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; max-width: 1200px; margin: 20px auto 0; text-align: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">
                            <div style="color: rgba(255, 255, 255, 0.9); font-size: 14px; margin-bottom: 5px; font-weight: 500;">All Time Total</div>
                            <div style="color: white; font-size: 32px; font-weight: bold;">${{ paymentStats.allTime.toFixed(2) }}</div>
                        </div>
                    </div>


                </div>
        </div>
    
    <!-- Show Info when no check is created -->
    <div v-else class="alert alert-info" role="alert" style="margin: 20px;">
        <strong>ℹ️ Info:</strong> Use the "Write New Check" button above to create checks. The check preview will display here. Background does not print.
    </div>
    
    <!-- Unsaved Changes Modal -->
    <div v-if="showUnsavedModal" class="modal show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">⚠️ Unsaved Changes</h5>
                    <button type="button" class="btn-close" @click="cancelLeave"></button>
                </div>
                <div class="modal-body">
                    <p>You have an unsaved check with data that will be lost if you leave this page.</p>
                    <p class="mb-0"><strong>Are you sure you want to leave without saving?</strong></p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="cancelLeave">
                        Cancel
                    </button>
                    <button type="button" class="btn btn-danger" @click="confirmLeave">
                        Leave Without Saving
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Add Bank Account Modal -->
    <!-- Bank Account Modal -->
    <BankAccountModal 
      v-model="showBankAccountModal" 
      :editing-bank="null"
      @save="saveBankAccount"
      @cancel="closeBankAccountModal"
    />

    <!-- Vendor Modal -->
    <VendorModal 
      v-model="showVendorModal" 
      :editing-vendor="null"
      @save="saveVendor"
      @cancel="closeVendorModal"
    />
</template>

<script setup lang="ts">
import print from 'print-js';
import { ToWords } from 'to-words';
import { ref, reactive, nextTick, watch, onMounted, onUnmounted, computed } from 'vue'
import { formatMoney } from '../utilities.ts'
import { useAppStore } from '../stores/app.ts'
import { useCustomizationStore } from '../stores/customization.ts'
import { useReceiptStore } from '../stores/receipt.ts'
import { useHistoryStore } from '../stores/history.ts'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import BankAccountModal from './BankAccountModal.vue'
import VendorModal from './VendorModal.vue'

const state = useAppStore()
const customizationStore = useCustomizationStore()
const receiptStore = useReceiptStore()
const historyStore = useHistoryStore()

// Debug mode flag - ONLY enabled when npm run dev:clear is used
// Check for VITE_DEBUG_MODE environment variable set by clear-history.js script
const DEBUG_MODE = ref(import.meta.env.VITE_DEBUG_MODE === 'true')

// If debug mode is active, clear all localStorage on startup
if (DEBUG_MODE.value) {
    console.log('%c🗑️ DEBUG MODE: Clearing check history...', 'color: red; font-weight: bold; font-size: 14px;')
    localStorage.removeItem('checkList')
    localStorage.removeItem('printchecks_receipts')
    localStorage.removeItem('printchecks_payments')
    console.log('%c✅ Check history cleared!', 'color: green; font-weight: bold; font-size: 14px;')
    console.log('%c⚠️ Debug mode active - started with npm run dev:clear', 'color: orange; font-size: 12px;')
    console.log('%cTo disable: Stop server and run "npm run dev" (without :clear)', 'color: gray; font-size: 12px;')
}

// Expose debug toggle function to window for console access (for manual testing)
if (typeof window !== 'undefined') {
    (window as any).enablePrintChecksDebug = () => {
        DEBUG_MODE.value = true
        console.log('%c🐛 PrintChecks Debug Mode ENABLED', 'color: green; font-weight: bold; font-size: 14px;')
        console.log('%cTo disable: window.disablePrintChecksDebug()', 'color: gray; font-size: 12px;')
    };
    (window as any).disablePrintChecksDebug = () => {
        DEBUG_MODE.value = false
        console.log('%c🐛 PrintChecks Debug Mode DISABLED', 'color: red; font-weight: bold; font-size: 14px;')
    }
}

const toWordsTool = new ToWords({
  localeCode: 'en-US',
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: true,
  },
});

const toWords: (denom: number | string) => string = (denom) => {
    try {
        const amount = Number(denom);
        const dollars = Math.floor(amount);
        const cents = Math.round((amount - dollars) * 100);
        
        // Get the word representation of the dollar amount (without "Dollars")
        const dollarWords = toWordsTool.convert(dollars, { currency: false });
        
        // Format as "Word Amount and XX/100" with proper stacked fraction
        const centsStr = cents.toString().padStart(2, '0');
        return `${dollarWords} and <sup style="font-size: 0.7em;">${centsStr}</sup>&frasl;<sub style="font-size: 0.7em;">100</sub>`;
    } catch (e) {
        return `${e}`;
    }
}

// Computed properties for customization
const currentSettings = computed(() => customizationStore.currentSettings)
const hasCustomLogo = computed(() => customizationStore.hasCustomLogo)
const logoImageSrc = computed(() => {
  if (!currentSettings.value?.logo) return ''
  return currentSettings.value.logo.file?.url || currentSettings.value.logo.url || ''
})
const lineItems = computed(() => receiptStore.currentReceipt?.lineItems || [])
const hasLineItems = computed(() => receiptStore.hasLineItems)
const calculatedTotals = computed(() => receiptStore.calculatedTotals)

// Test line items for demonstration
const testLineItems = ref([
  { id: 1, description: 'Professional Services', quantity: 1, rate: 150.00 },
  { id: 2, description: 'Consultation Fee', quantity: 2, rate: 75.00 },
  { id: 3, description: 'Materials & Supplies', quantity: 1, rate: 50.00 }
])

// Test totals for demonstration
const testTotals = ref({
  subtotal: 350.00,
  taxAmount: 28.00,
  shippingAmount: 0,
  total: 378.00
})

// Bank and Vendor Data for Quick Check (read-only)
const bankAccounts = ref(JSON.parse(localStorage.getItem('bankAccounts') || '[]'))
const selectedBankId = ref('')
const vendors = ref(JSON.parse(localStorage.getItem('vendors') || '[]'))
const selectedVendorId = ref('')

// Quick Check Modal
const showQuickCheckModal = ref(false)
const quickCheckForm = reactive({
    payTo: '',
    amount: '',
    memo: ''
})

// Bank Account Modal
const showBankAccountModal = ref(false)

// Vendor Modal
const showVendorModal = ref(false)


// Line Items Management
const showLineItemForm = ref(false)
const currentLineItems = ref<Array<{id: number, description: string, quantity: number, rate: number}>>([])
const newLineItem = reactive({
    description: '',
    quantity: 1,
    rate: 0
})

// Computed line items total
const lineItemsTotal = computed(() => {
    return currentLineItems.value.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
})

// Add line item
function addLineItem() {
    if (!newLineItem.description || newLineItem.quantity <= 0 || newLineItem.rate <= 0) return
    
    const item = {
        id: Date.now(),
        description: newLineItem.description,
        quantity: newLineItem.quantity,
        rate: newLineItem.rate
    }
    
    currentLineItems.value.push(item)
    
    // Reset form
    newLineItem.description = ''
    newLineItem.quantity = 1
    newLineItem.rate = 0
}

// Remove line item
function removeLineItem(index: number) {
    currentLineItems.value.splice(index, 1)
}

// Computed properties for bank and vendor selection
const selectedBank = computed(() => bankAccounts.value.find(b => b.id === selectedBankId.value))
const selectedVendor = computed(() => vendors.value.find(v => v.id === selectedVendorId.value))

// Auto-calculate next check number based on selected bank
const nextCheckNumber = computed(() => {
    if (!selectedBank.value) return '1001'
    
    const bankChecks = JSON.parse(localStorage.getItem('checkList') || '[]')
        .filter(check => check.bankName === selectedBank.value.name)
    
    if (bankChecks.length === 0) {
        return selectedBank.value.startingCheckNumber || 1001
    }
    
    const lastCheckNumber = Math.max(...bankChecks.map(check => parseInt(check.checkNumber) || 0))
    return lastCheckNumber + 1
})



// Dynamic text positioning to avoid logo overlap
const dynamicTextPositions = computed(() => {
  const logo = currentSettings.value?.logo
  if (!hasCustomLogo.value || !logo) {
    // Return default positions when no logo
    return {
      accountHolderName: { top: '40px', left: '60px' },
      accountHolderAddress: { top: '70px', left: '60px' },
      checkNumber: { top: '40px', right: '50px' },
      date: { top: '90px', left: '850px' },
      payTo: { top: '200px', left: '180px' },
      amount: { top: '202px', left: '970px' },
      amountWords: { top: '240px', left: '100px' },
      bankName: { top: '300px', left: '60px' },
      memo: { top: '390px', left: '130px' },
      signature: { top: '366px', left: '770px' },
      bankInfo: { top: '435px', left: '0px' }
    }
  }

  const logoWidth = logo.size?.width || 100
  const logoHeight = logo.size?.height || 50
  const logoPosition = logo.position || 'top-left'
  const margin = logo.margin || { top: 10, right: 10, bottom: 10, left: 10 }
  
  // Calculate logo boundaries including margins
  const logoBounds = {
    'top-left': { 
      left: 20 + margin.left, 
      right: 20 + margin.left + logoWidth, 
      top: 20 + margin.top, 
      bottom: 20 + margin.top + logoHeight 
    },
    'top-center': { 
      left: (1200 - logoWidth) / 2 + margin.left, 
      right: (1200 + logoWidth) / 2 + margin.right, 
      top: 20 + margin.top, 
      bottom: 20 + margin.top + logoHeight 
    },
    'top-right': { 
      left: 1200 - 20 - logoWidth - margin.right, 
      right: 1200 - 20 - margin.right, 
      top: 20 + margin.top, 
      bottom: 20 + margin.top + logoHeight 
    },
    'bottom-left': { 
      left: 20 + margin.left, 
      right: 20 + margin.left + logoWidth, 
      top: 450 - logoHeight - 20 - margin.bottom, 
      bottom: 450 - 20 - margin.bottom 
    },
    'bottom-center': { 
      left: (1200 - logoWidth) / 2 + margin.left, 
      right: (1200 + logoWidth) / 2 + margin.right, 
      top: 450 - logoHeight - 20 - margin.bottom, 
      bottom: 450 - 20 - margin.bottom 
    },
    'bottom-right': { 
      left: 1200 - 20 - logoWidth - margin.right, 
      right: 1200 - 20 - margin.right, 
      top: 450 - logoHeight - 20 - margin.bottom, 
      bottom: 450 - 20 - margin.bottom 
    }
  }

  const bounds = logoBounds[logoPosition]
  
  // Default positions
  let positions = {
    accountHolderName: { top: '40px', left: '60px' },
    accountHolderAddress: { top: '70px', left: '60px' },
    checkNumber: { top: '40px', right: '50px' },
    date: { top: '90px', left: '850px' },
    payTo: { top: '200px', left: '180px' },
    amount: { top: '202px', left: '970px' },
    amountWords: { top: '240px', left: '100px' },
    bankName: { top: '300px', left: '60px' },
    memo: { top: '390px', left: '130px' },
    signature: { top: '366px', left: '770px' },
    bankInfo: { top: '435px', left: '0px' }
  }

  // Adjust positions based on logo placement - text flows around logo
  if (logoPosition === 'top-left') {
    // For top-left logo, move account holder info right to flow around logo
    if (bounds.right > 60) {
      positions.accountHolderName.left = `${bounds.right + 15}px`
      positions.accountHolderAddress.left = `${bounds.right + 15}px`
    }
    // Keep text at original vertical positions - no downward movement
    // Text flows horizontally around the logo space
  }

  if (logoPosition === 'top-center') {
    // For top-center, text flows around both sides of the logo
    if (bounds.left < 300) {
      // Logo extends into left area, move account holder right to flow around
      positions.accountHolderName.left = `${bounds.right + 15}px`
      positions.accountHolderAddress.left = `${bounds.right + 15}px`
    }
    if (bounds.right > 800) {
      // Logo extends into right area, move check number left to flow around
      positions.checkNumber.left = `${Math.max(bounds.left - 100, 600)}px`
      positions.date.left = `${Math.max(bounds.left - 100, 600)}px`
    }
    // Text maintains original vertical positions - flows horizontally around logo
  }

  if (logoPosition === 'top-right') {
    // For top-right logo, text flows around to the left of the logo
    if (bounds.left < 1060) {
      positions.checkNumber.left = `${Math.max(bounds.left - 100, 700)}px`
    }
    if (bounds.left < 950) {
      positions.date.left = `${Math.max(bounds.left - 100, 700)}px`
    }
    // Text maintains original vertical positions - flows horizontally around logo
  }

  if (logoPosition.includes('bottom')) {
    // For bottom logos, text flows around horizontally - no vertical movement
    if (logoPosition === 'bottom-left') {
      // Text flows to the right of the logo
      if (bounds.right > 80) {
        positions.bankInfo.left = `${bounds.right + 15}px`
      }
      if (bounds.right > 120) {
        positions.memo.left = `${bounds.right + 15}px`
      }
      if (bounds.right > 60) {
        positions.bankName.left = `${bounds.right + 15}px`
      }
    }
    
    if (logoPosition === 'bottom-right') {
      // Text flows to the left of the logo
      if (bounds.left < 770) {
        positions.signature.left = `${Math.max(bounds.left - 200, 500)}px`
      }
    }
    
    if (logoPosition === 'bottom-center') {
      // Text flows around both sides of centered logo
      if (bounds.left < 400) {
        // Logo extends left, move left elements right
        positions.bankInfo.left = `${bounds.right + 15}px`
        positions.memo.left = `${bounds.right + 15}px`
        positions.bankName.left = `${bounds.right + 15}px`
      }
      if (bounds.right > 700) {
        // Logo extends right, move right elements left
        positions.signature.left = `${Math.max(bounds.left - 200, 500)}px`
      }
    }
    
    // Text maintains original vertical positions - flows horizontally around logo
  }

  return positions
})

// Payment statistics
const paymentStats = computed(() => {
    const currentYear = new Date().getFullYear()
    const allPayments = [
        ...historyStore.checks.map(check => ({
            amount: parseFloat(check.amount || '0'),
            date: new Date(check.date || Date.now())
        })),
        ...historyStore.paymentRecords.map(payment => ({
            amount: payment.amount,
            date: new Date(payment.date)
        }))
    ]
    
    const thisYearPayments = allPayments.filter(payment => 
        payment.date.getFullYear() === currentYear
    )
    
    const thisYearTotal = thisYearPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const allTimeTotal = allPayments.reduce((sum, payment) => sum + payment.amount, 0)
    
    
    return {
        thisYear: thisYearTotal,
        allTime: allTimeTotal,
        count: allPayments.length,
        thisYearCount: thisYearPayments.length
    }
})


// Enhanced payment statistics with comprehensive metrics
const enhancedPaymentStats = computed(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    const allPayments = [
        ...historyStore.checks.map(check => ({
            amount: parseFloat(check.amount || '0'),
            date: new Date(check.date || Date.now()),
            payTo: check.payTo || 'Unknown'
        })),
        ...historyStore.paymentRecords.map(payment => ({
            amount: payment.amount,
            date: new Date(payment.date),
            payTo: payment.payTo || 'Unknown'
        }))
    ]
    
    // Filter payments by time period
    const thisMonthPayments = allPayments.filter(payment => {
        const paymentDate = payment.date
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear
    })
    
    const lastMonthPayments = allPayments.filter(payment => {
        const paymentDate = payment.date
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
        return paymentDate.getMonth() === lastMonth && paymentDate.getFullYear() === lastMonthYear
    })
    
    const thisYearPayments = allPayments.filter(payment => 
        payment.date.getFullYear() === currentYear
    )
    
    const lastYearPayments = allPayments.filter(payment => 
        payment.date.getFullYear() === currentYear - 1
    )
    
    // Calculate current quarter
    const currentQuarter = Math.floor(currentMonth / 3)
    const thisQuarterPayments = allPayments.filter(payment => {
        const paymentDate = payment.date
        const paymentQuarter = Math.floor(paymentDate.getMonth() / 3)
        return paymentQuarter === currentQuarter && paymentDate.getFullYear() === currentYear
    })
    
    // Calculate totals
    const thisMonth = thisMonthPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const lastMonth = lastMonthPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const thisQuarter = thisQuarterPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const lastYear = lastYearPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const total = allPayments.reduce((sum, payment) => sum + payment.amount, 0)
    
    // Calculate statistics
    const averagePayment = allPayments.length > 0 ? total / allPayments.length : 0
    const largestPayment = allPayments.length > 0 
        ? Math.max(...allPayments.map(p => p.amount))
        : 0
    const smallestPayment = allPayments.length > 0 
        ? Math.min(...allPayments.map(p => p.amount).filter(a => a > 0))
        : 0
    
    // Calculate monthly average (total / number of months with data)
    const monthsWithData = new Set(allPayments.map(p => {
        const d = p.date
        return `${d.getFullYear()}-${d.getMonth()}`
    })).size
    const monthlyAverage = monthsWithData > 0 ? total / monthsWithData : 0
    
    return {
        thisMonth,
        lastMonth,
        thisQuarter,
        lastYear,
        thisMonthCount: thisMonthPayments.length,
        averagePayment,
        monthlyAverage,
        largestPayment,
        smallestPayment
    }
})



// Dynamic styles based on customization
const checkStyles = computed(() => {
    if (!currentSettings.value || !currentSettings.value.fonts) return {}
    
    const settings = currentSettings.value
    const fonts = settings.fonts
    
    // Helper function to safely get font styles with fallbacks
    const getFontStyle = (fontConfig: any, fallback = { family: 'Arial, sans-serif', size: 16, weight: 'normal', color: '#000000' }) => ({
        fontFamily: fontConfig?.family || fallback.family,
        fontSize: `${fontConfig?.size || fallback.size}px`,
        fontWeight: fontConfig?.weight || fallback.weight,
        color: fontConfig?.color || fallback.color
    })
    
    return {
        accountHolderName: getFontStyle(fonts.accountHolder),
        payTo: getFontStyle(fonts.payTo),
        amount: getFontStyle(fonts.amount),
        memo: getFontStyle(fonts.memo),
        signature: getFontStyle(fonts.signature, { family: 'Caveat, cursive', size: 40, weight: 'normal', color: '#000000' }),
        bankInfo: getFontStyle(fonts.bankInfo, { family: 'banking, monospace', size: 37, weight: 'normal', color: '#000000' }),
        amountWords: getFontStyle(fonts.amountWords),
        checkNumber: getFontStyle(fonts.checkNumber),
        date: getFontStyle(fonts.date),
        bankName: getFontStyle(fonts.bankName, { family: 'Open Sans, sans-serif', size: 24, weight: 'bold', color: '#000000' }),
        fieldLabels: getFontStyle(fonts.fieldLabels, { family: 'Arial, sans-serif', size: 14, weight: 'normal', color: '#000000' })
    }
})

function printCheck () {
    // Validate check has required data before printing
    if (!check.payTo || !check.amount || check.amount <= 0) {
        alert('Cannot print: Check must have a payee and valid amount.')
        return
    }
    
    // Only save to history on first print
    if (!check.isPrinted) {
        saveToHistory()
        check.isPrinted = true
    }
    
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        @page {
          margin: 0;
        }
        
        /* Force background colors to print */
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        /* Reset body for print */
        body {
          margin: 0 !important;
          padding: 0 !important;
        }
        
        /* Strip all styling from container but keep the structure */
        .container {
          max-width: none !important;
          width: auto !important;
          padding: 0 !important;
          margin: 0 !important;
          background: none !important;
        }
        
        /* Hide the navigation container completely */
        .container:has(.nav-tabs) {
          display: none !important;
        }
        
        /* Hide form container and other elements */
        .form-container {
          display: none !important;
        }
        
        /* Hide navigation and title elements */
        .nav, .nav-tabs, .nav-item, .nav-link,
        .panel-header, .header,
        h1, p, nav {
          display: none !important;
        }
        
        /* Show the print container with its natural flow */
        .print-container {
          display: block !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
        }
        
        /* Ensure all sections are visible */
        .check-section,
        .payment-details-section,
        .payment-summary-section {
          display: block !important;
        }
        
        /* Section 1: Check (Top Third) */
        .check-section {
          height: 33.33vh !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          position: relative !important;
          background: white !important;
        }
        
        .check-box {
          height: 100% !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 20px !important;
          background: white !important;
          border: none !important;
          box-shadow: none !important;
          position: relative !important;
        }
        
        /* Hide background image on check during print */
        #check-box-print {
          background: none !important;
          background-image: none !important;
        }
        
        /* Section 2: Payment Details (Middle Third) */
        .payment-details-section {
          height: 33.33vh !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 20px !important;
          border-top: 2px solid #000 !important;
          background: white !important;
          position: relative !important;
        }
        
        .line-items-table {
          background: white !important;
          border: 2px solid #000 !important;
          max-width: none !important;
          margin: 0 !important;
          padding: 10px !important;
          border-radius: 0 !important;
        }
        
        /* Override any inline styles that might cause spacing issues */
        .payment-details-section h3,
        .payment-summary-section h3 {
          margin: 0 0 10px 0 !important;
          padding: 0 !important;
        }
        
        /* Section 3: Payment Summary (Bottom Third) */
        .payment-summary-section {
          height: 33.33vh !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 20px !important;
          border-top: 2px solid #000 !important;
          background: white !important;
          position: relative !important;
        }
        
        .stats-card {
          background: #e3f2fd !important;
          border: 2px solid #000 !important;
          border-left: 6px solid #2196f3 !important;
          max-width: none !important;
          margin: 0 !important;
          padding: 25px !important;
          border-radius: 12px !important;
        }
      }
    `;
    document.head.appendChild(style);
    window.print();
    style.remove();
}

function saveToHistory () {
    // Only save checks that have been properly filled out
    if (!check.payTo || !check.amount || check.amount <= 0) {
        if (DEBUG_MODE.value) console.warn('Cannot save empty check to history')
        return
    }
    
    // Don't save if already saved
    if (check.isSaved) {
        if (DEBUG_MODE.value) console.warn('Check has already been saved')
        return
    }
    
    let checkList = JSON.parse(localStorage.getItem('checkList') || '[]')
    
    // Create a copy of the check with a unique ID and timestamp
    const checkToSave = {
        ...check,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        printedAt: new Date().toISOString(),
        isVoid: false,
        isPrinted: true,
        isSaved: true,
        lineItems: currentLineItems.value // Include line items when saving
    }
    if (DEBUG_MODE.value) {
        console.log('Saving line items to history:', currentLineItems.value)
        console.log('checkToSave:', checkToSave)
    }
    
    checkList.push(checkToSave)
    localStorage.setItem('checkList', JSON.stringify(checkList))
    
    // Reload history store to reflect the new check
    historyStore.loadHistory()
    
    // Mark the current check as saved to make it read-only
    check.isSaved = true
}

// Initialize check as empty - only populate when user creates a check
const check = reactive({
    accountHolderName: '',
    accountHolderAddress: '',
    accountHolderCity: '',
    accountHolderState: '',
    accountHolderZip: '',
    checkNumber: '',
    date: '',
    bankName: '',
    bankAddress: '',
    amount: 0,
    payTo: '',
    memo: '',
    signature: '',
    routingNumber: '',
    bankAccountNumber: '',
    lineLength: 0,
    isPrinted: false,
    isSaved: false
})

const line = ref(null)

// Navigation guard state
const router = useRouter()
const showUnsavedModal = ref(false)
let pendingRoute: any = null

// Navigation guard to warn about unsaved changes
onBeforeRouteLeave((to, from, next) => {
    // Check if there's an unsaved check (has data but not saved)
    const hasCheckData = check.payTo && check.amount > 0
    if (hasCheckData && !check.isSaved) {
        // Show modal instead of navigating
        showUnsavedModal.value = true
        // Store the destination route
        pendingRoute = to
        next(false) // Prevent navigation for now
    } else {
        next() // Allow navigation
    }
})

// Modal confirmation handlers
function confirmLeave() {
    showUnsavedModal.value = false
    if (pendingRoute) {
        // Clear check data first
        check.payTo = ''
        check.amount = 0
        check.memo = ''
        check.date = ''
        check.checkNumber = null
        currentLineItems.value = []
        
        // Navigate to the pending route
        router.push(pendingRoute)
        pendingRoute = null
    }
}

function cancelLeave() {
    showUnsavedModal.value = false
    pendingRoute = null
}

// Watch for check changes to update line length only
// DO NOT auto-save to history - checks should only be saved when printed
watch(check, async () => {
    await nextTick(() => {
        let computedLine = line?.value?.clientWidth
        check.lineLength = computedLine
    })
})

function handlePrintShortcut(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'p') {
        event.preventDefault();
        printCheck();
    }
}

// Logo error handling functions
function handleLogoError(event: Event) {
    if (DEBUG_MODE.value) console.warn('Logo failed to load:', event)
    // Could add user notification here if needed
}

function handleLogoLoad(event: Event) {
    if (DEBUG_MODE.value) console.log('Logo loaded successfully:', event)
}

// Bank Management Methods
// Bank account selection - don't populate check until user clicks "Create Check"
function loadBankAccount() {
    // Bank selection is now just for reference
    // The actual check data will be populated in createQuickCheck()
}

// Vendor loading for Quick Check - don't populate check until user clicks "Create Check"
function loadVendor() {
    // Vendor selection is now just for reference
    // The actual check data will be populated in openQuickCheckModal()
}

// Quick Check Methods
function openQuickCheckModal() {
    if (!selectedBankId.value) {
        alert('Please select a bank account first.')
        return
    }
    
    // Pre-populate with selected vendor if any
    if (selectedVendor.value) {
        quickCheckForm.payTo = selectedVendor.value.name
    } else {
        quickCheckForm.payTo = ''
    }
    
    // If line items exist, lock amount to line items total
    if (currentLineItems.value.length > 0) {
        quickCheckForm.amount = lineItemsTotal.value.toString()
    } else {
        quickCheckForm.amount = ''
    }
    
    quickCheckForm.memo = ''
    showQuickCheckModal.value = true
}

function createQuickCheck() {
    if (!selectedBank.value) {
        alert('Please select a bank account.')
        return
    }
    
    // Fill in the check form with bank account and form data
    check.accountHolderName = selectedBank.value.accountHolderName || ''
    check.accountHolderAddress = selectedBank.value.accountHolderAddress || ''
    check.accountHolderCity = selectedBank.value.accountHolderCity || ''
    check.accountHolderState = selectedBank.value.accountHolderState || ''
    check.accountHolderZip = selectedBank.value.accountHolderZip || ''
    check.checkNumber = nextCheckNumber.value.toString()
    check.date = new Date().toISOString().split('T')[0]
    check.bankName = selectedBank.value.name || ''
    check.bankAddress = selectedBank.value.address || ''
    check.routingNumber = selectedBank.value.routingNumber || ''
    check.bankAccountNumber = selectedBank.value.accountNumber || ''
    check.signature = selectedBank.value.signature || ''
    
    // Fill in the user-entered data
    check.payTo = quickCheckForm.payTo
    check.amount = quickCheckForm.amount
    check.memo = quickCheckForm.memo
    
    // Reset print status for new check
    check.isPrinted = false
    
    closeQuickCheckModal()
}

function closeQuickCheckModal() {
    showQuickCheckModal.value = false
    Object.assign(quickCheckForm, {
        payTo: '',
        amount: '',
        memo: ''
    })
}

function openNewBankAccountModal() {
    showBankAccountModal.value = true
}


function closeBankAccountModal() {
    showBankAccountModal.value = false
}

function saveBankAccount(bankData) {
    // Validate required fields (matching BankAccountsView.vue)
    if (!bankData.name || !bankData.accountNumber || !bankData.routingNumber) {
        alert('Please fill in Bank Name, Account Number, and Routing Number.')
        return
    }
    
    // Generate unique ID with 'bank-' prefix to match BankAccountsView.vue
    const newBank = {
        ...bankData,
        id: 'bank-' + Date.now()
    }
    
    // Add to bank accounts
    bankAccounts.value.push(newBank)
    
    // Save to localStorage
    localStorage.setItem('bankAccounts', JSON.stringify(bankAccounts.value))
    
    // Auto-select the new bank
    selectedBankId.value = newBank.id
    loadBankAccount()
    
    // Close modal
    closeBankAccountModal()
}

function openNewVendorModal() {
    showVendorModal.value = true
}

function closeVendorModal() {
    showVendorModal.value = false
}

function saveVendor(vendorData) {
    // Validate required fields (matching VendorsView.vue)
    if (!vendorData.name) {
        alert('Please enter a vendor name.')
        return
    }
    
    // Generate unique ID with 'vendor-' prefix to match VendorsView.vue
    const newVendor = {
        ...vendorData,
        id: 'vendor-' + Date.now()
    }
    
    // Add to vendors
    vendors.value.push(newVendor)
    
    // Save to localStorage
    localStorage.setItem('vendors', JSON.stringify(vendors.value))
    
    // Auto-select the new vendor
    selectedVendorId.value = newVendor.id
    loadVendor()
    
    // Close modal
    closeVendorModal()
}


onMounted(() => {
    // Initialize stores
    customizationStore.initializeCustomization()
    historyStore.loadHistory()
    
    // Auto-select default bank account if one exists
    const defaultBank = bankAccounts.value.find(bank => bank.isDefault)
    if (defaultBank) {
        selectedBankId.value = defaultBank.id
    }
    
    if (state.check) {
        if (DEBUG_MODE.value) {
            console.log('Loading check from history:', state.check)
            console.log('Line items in loaded check:', state.check.lineItems)
        }
        check.accountHolderName = state.check.accountHolderName
        check.accountHolderAddress = state.check.accountHolderAddress
        check.accountHolderCity = state.check.accountHolderCity
        check.accountHolderState = state.check.accountHolderState
        check.accountHolderZip = state.check.accountHolderZip
        check.checkNumber = state.check.checkNumber
        check.date = state.check.date
        check.bankName = state.check.bankName
        check.amount = state.check.amount
        check.payTo = state.check.payTo
        check.memo = state.check.memo
        check.signature = state.check.signature
        check.routingNumber = state.check.routingNumber
        check.bankAccountNumber = state.check.bankAccountNumber
        check.isSaved = state.check.isSaved || false  // Preserve saved status
        check.isPrinted = state.check.isPrinted || false  // Preserve printed status
        
        // Restore line items if they exist
        if (state.check.lineItems && Array.isArray(state.check.lineItems)) {
            currentLineItems.value = state.check.lineItems
            if (DEBUG_MODE.value) {
                console.log('Restoring line items:', state.check.lineItems)
                console.log('currentLineItems after restore:', currentLineItems.value)
            }
        } else {
            if (DEBUG_MODE.value) console.warn('No line items found in loaded check or lineItems is not an array')
        }
    }
    state.check = null

    window.addEventListener('keydown', handlePrintShortcut);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handlePrintShortcut);
});

</script>

<style>

label {
    font-weight: bold;
}

/* Tab styling */
.tab-content {
    padding: 20px;
    border: 1px solid #dee2e6;
    border-top: none;
    border-radius: 0 0 0.375rem 0.375rem;
}

/* Modal styling */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
}

/* Enhanced stats cards */
.stats-card-enhanced {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
}

.stats-card-enhanced:hover {
    transform: translateY(-2px);
}

.stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
}

.stat-label {
    font-weight: 500;
    color: rgba(0, 0, 0, 0.7);
}

.stat-value {
    font-size: 18px;
    font-weight: bold;
}

/* Bank card styling */
.card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Vendor table styling */
.table-responsive {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table th {
    background-color: #f8f9fa;
    font-weight: 600;
    border-bottom: 2px solid #dee2e6;
}

/* Button group styling */
.btn-group-sm .btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
}
.memo-data {
    font-family: Caveat;
    font-size: 30px;
    max-width: 350px;
    line-height: 0.65;
}
.signature-data {
    font-family: Caveat;
    font-size: 40px;
    transform: rotate(-2deg);
}
.amount-line-data {
    text-transform: capitalize;
}
.date-data, .pay-to-data, .amount-data{
    font-size: 20px;
    font-weight: bold;
}
.check-data {
    margin-top: 50px;
    padding: 50px 120px;
    border-top: 1px solid #e6e6e6;
}
.bank-name{
    font-size: 20px;
    font-weight: bold;
}
.account-holder-name {
    font-size: 20px;
    font-weight: bold;
}
.check-number-human {
    font-size: 20px;
    font-weight: bold;
}
.amount-box::before {
    content: "$";
    font-size: 20px;
    margin-left: -15px;
    font-weight: bold;
}
.amount-box {
    width: 225px;
    height: 40px;
    border: 1px solid #c7c7c7;
    background-color: white;
}
.check-box {
    width: 100%;
    aspect-ratio: 1200 / 500;
    margin: 0 auto;
    border: 1px solid #e6e6e6;
    background-color: white;
    position: relative;
    overflow: hidden;
    container-type: inline-size;
}

#check-box {
    width: 100%;
    height: 100%;
}

#check-box-print {
    position: relative;
    width: 1200px;
    height: 500px;
    background: url('../assets/checkbg.png');
    background-repeat: no-repeat;
    background-size: 1200px 500px;
    transform-origin: top left;
    transform: scale(calc(100cqw / 1200px));
}

@font-face {
    font-family: 'banking';
    src: url('../assets/micrenc.ttf');
}


.banking {
    font-family: 'banking';
    font-size: 37px;
}
.dollar-line::after{
    content: "Dollars";
    font-size: 18px;
    position: absolute;
    right: -73px;
    top: 0;
}
.dollar-line {
    width: 840px;
    display: block;
    border-bottom: 1px solid black;
    margin-left: 10px;
    margin-top: 20px;
}
.amount-handdrawn-line {
    filter: drop-shadow(0 0.3px 0.2px rgba(0,0,0,0.2));
    pointer-events: none;
}
.payto-line {
    width: 776px;
    display: block;
    border-bottom: 1px solid black;
    margin-left: 73px;
    border-right: 1px solid black;
    height: 28px;
    margin-top: -32px;
}

/* Logo positioning classes */
.logo-container {
    position: absolute;
    z-index: 10;
}

.logo-top-left {
    top: 20px;
    left: 20px;
}

.logo-top-center {
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
}

.logo-top-right {
    top: 20px;
    right: 20px;
}

.logo-bottom-left {
    bottom: 20px;
    left: 20px;
}

.logo-bottom-center {
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
}

.logo-bottom-right {
    bottom: 20px;
    right: 20px;
}
</style>
