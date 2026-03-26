// Playground code examples stored separately to avoid parsing conflicts

export const basicCheckCode = `<template>
  <div style="padding: 20px;">
    <!-- Form Section -->
    <div style="max-width: 600px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9; margin-bottom: 30px;">
      <h3 style="margin-top: 0; color: #1a1a1a;">Create Check</h3>
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Check Number:</label>
        <input v-model="checkNumber" style="padding: 8px; width: 100%; border: 1px solid #ccc; border-radius: 4px; color: #000;" />
      </div>
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Date:</label>
        <input v-model="date" style="padding: 8px; width: 100%; border: 1px solid #ccc; border-radius: 4px; color: #000;" />
      </div>
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Pay To:</label>
        <input v-model="payTo" style="padding: 8px; width: 100%; border: 1px solid #ccc; border-radius: 4px; color: #000;" />
      </div>
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Amount:</label>
        <input v-model.number="amount" type="number" step="0.01" style="padding: 8px; width: 100%; border: 1px solid #ccc; border-radius: 4px; color: #000;" />
      </div>
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Memo:</label>
        <input v-model="memo" style="padding: 8px; width: 100%; border: 1px solid #ccc; border-radius: 4px; color: #000;" />
      </div>
    </div>

    <!-- Check Preview -->
    <div style="width: 100%;">
      <h3 style="margin-top: 0; margin-bottom: 15px;">Live Check Preview</h3>
      <div style="width: 750px; min-width: 750px; background: linear-gradient(to bottom, #f0f8ff 0%, #e6f3ff 100%); border: 2px solid #333; border-radius: 4px; padding: 30px; font-family: 'Courier New', monospace; position: relative; box-shadow: 2px 2px 8px rgba(0,0,0,0.1);">
        <!-- Header with Check Number -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
          <div>
            <div style="font-weight: bold; font-size: 14px; color: #1a1a1a;">YOUR COMPANY NAME</div>
            <div style="font-size: 11px; color: #444;">123 Business St</div>
            <div style="font-size: 11px; color: #444;">City, ST 12345</div>
          </div>
          <div style="text-align: right; font-size: 18px; font-weight: bold; color: #000;">
            {{ checkNumber }}
          </div>
        </div>

        <!-- Date -->
        <div style="text-align: right; margin-bottom: 15px; font-size: 12px;">
          <span style="margin-right: 10px; color: #444;">Date:</span>
          <span style="border-bottom: 1px solid #333; padding: 0 5px; color: #000;">{{ date }}</span>
        </div>

        <!-- Pay To -->
        <div style="margin-bottom: 10px; font-size: 13px;">
          <span style="margin-right: 10px; color: #444;">Pay to the order of:</span>
          <span style="border-bottom: 1px solid #333; padding: 0 5px; flex: 1; display: inline-block; min-width: 200px; color: #000;">{{ payTo }}</span>
        </div>

        <!-- Amount Box and Words -->
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
          <div style="flex: 1; margin-right: 10px; font-size: 12px;">
            <div style="border-bottom: 1px solid #333; padding: 2px 5px; min-height: 20px; color: #000;">
              {{ amountInWords }}
            </div>
            <div style="font-size: 10px; color: #555; margin-top: 2px;">DOLLARS</div>
          </div>
          <div style="border: 2px solid #333; padding: 5px 10px; background: white; font-weight: bold; font-size: 14px; color: #000;">
            {{ formatAmount(amount) }}
          </div>
        </div>

        <!-- Memo and Signature -->
        <div style="display: flex; justify-content: space-between; margin-top: 20px; font-size: 12px;">
          <div>
            <span style="margin-right: 5px; color: #444;">Memo:</span>
            <span style="border-bottom: 1px solid #333; padding: 0 5px; display: inline-block; min-width: 150px; color: #000;">{{ memo }}</span>
          </div>
          <div style="text-align: right;">
            <div style="border-bottom: 1px solid #333; padding: 0 5px; min-width: 150px; height: 20px;"></div>
            <div style="font-size: 10px; color: #555; margin-top: 2px;">Authorized Signature</div>
          </div>
        </div>

        <!-- MICR Line (bottom of check) -->
        <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #ccc; font-family: 'MICR', monospace; font-size: 11px; color: #444;">
          ⑆123456789⑆ ⑈987654321⑈ {{ checkNumber }}⑆
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      checkNumber: "1001",
      date: new Date().toLocaleDateString(),
      payTo: "Acme Corporation",
      amount: 1250.50,
      memo: "Invoice #12345"
    }
  },
  computed: {
    amountInWords() {
      return this.numberToWords(this.amount)
    }
  },
  methods: {
    formatAmount(amount) {
      return "$" + (amount || 0).toFixed(2)
    },
    numberToWords(num) {
      if (!num || num === 0) return "Zero"

      const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
      const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
      const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

      let dollars = Math.floor(num)
      const cents = Math.round((num - dollars) * 100)

      let result = ""

      if (dollars >= 1000) {
        const thousands = Math.floor(dollars / 1000)
        result += ones[thousands] + " Thousand "
        dollars = dollars % 1000
      }

      if (dollars >= 100) {
        const hundreds = Math.floor(dollars / 100)
        result += ones[hundreds] + " Hundred "
        dollars = dollars % 100
      }

      if (dollars >= 20) {
        const tensDigit = Math.floor(dollars / 10)
        const onesDigit = dollars % 10
        result += tens[tensDigit]
        if (onesDigit > 0) result += "-" + ones[onesDigit]
      } else if (dollars >= 10) {
        result += teens[dollars - 10]
      } else if (dollars > 0) {
        result += ones[dollars]
      }

      return result.trim() + " and " + cents + "/100"
    }
  }
}
</` + `script>`

export const vendorManagementCode = `<template>
  <div style='padding: 20px; max-width: 600px; font-family: Arial, sans-serif;'>
    <div style='margin-bottom: 20px;'>
      <h3>Add Vendor</h3>
      <input
        v-model='vendorName'
        @keyup.enter='addVendor'
        placeholder='Vendor name'
        style='padding: 8px; width: 200px; margin-right: 10px;'
      />
      <button
        @click='addVendor'
        style='padding: 8px 16px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;'
      >
        Add
      </button>
    </div>

    <div style='display: grid; grid-template-columns: 1fr 1fr; gap: 15px;'>
      <div>
        <h3>Vendors ({{ vendors.length }})</h3>
        <div
          v-for='vendor in vendors'
          :key='vendor.id'
          @click='selectedVendor = vendor.id'
          :style='{
            padding: "10px",
            background: selectedVendor === vendor.id ? "#e3f2fd" : "#f5f5f5",
            marginBottom: "5px",
            borderRadius: "4px",
            cursor: "pointer",
            border: selectedVendor === vendor.id ? "2px solid #2196F3" : "1px solid #ddd"
          }'
        >
          <strong>{{ vendor.name }}</strong>
          <div style="font-size: 0.85em; color: #666;">
            Total: {{ getVendorTotal(vendor.id) }}
          </div>
        </div>
      </div>

      <div v-if='selectedVendor'>
        <h3>Record Payment</h3>
        <input
          v-model.number='paymentAmount'
          type='number'
          placeholder='Amount'
          style='padding: 8px; width: 150px; margin-bottom: 10px;'
        />
        <button
          @click='recordPayment'
          style='padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; display: block;'
        >
          Record Payment
        </button>

        <div style='margin-top: 15px;'>
          <h4>Payment History</h4>
          <div
            v-for='payment in getVendorPayments(selectedVendor)'
            :key='payment.id'
            style='padding: 5px; background: white; margin-bottom: 3px; border-radius: 3px; font-size: 0.9em;'
          >
            {{ payment.amount }} - {{ payment.date }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      vendorName: '',
      vendors: [],
      payments: [],
      selectedVendor: null,
      paymentAmount: 0,
      nextId: 1
    }
  },
  methods: {
    addVendor() {
      if (this.vendorName.trim()) {
        this.vendors.push({
          id: this.nextId++,
          name: this.vendorName.trim()
        })
        this.vendorName = ''
      }
    },
    recordPayment() {
      if (this.selectedVendor && this.paymentAmount > 0) {
        this.payments.push({
          id: this.nextId++,
          vendorId: this.selectedVendor,
          amount: this.paymentAmount,
          date: new Date().toLocaleDateString()
        })
        this.paymentAmount = 0
      }
    },
    getVendorTotal(vendorId) {
      const total = this.payments
        .filter(p => p.vendorId === vendorId)
        .reduce((sum, p) => sum + p.amount, 0)
      return "$" + total.toFixed(2)
    },
    getVendorPayments(vendorId) {
      return this.payments.filter(p => p.vendorId === vendorId).reverse()
    }
  }
}
</` + `script>`

export const buttonClickCode = `<template>
  <div style="padding: 20px; text-align: center;">
    <h2>{{ message }}</h2>
    <button
      @click="changeMessage"
      style="padding: 10px 20px; font-size: 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;"
    >
      Click Me!
    </button>
    <p style="margin-top: 15px; color: #666;">
      Clicked {{ count }} times
    </p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: "Hello from Playground!",
      count: 0
    }
  },
  methods: {
    changeMessage() {
      this.count++
      this.message = "You clicked the button!"
      setTimeout(() => {
        this.message = "Click again!"
      }, 1000)
    }
  }
}
</` + `script>`

export const contactFormCode = `<template>
  <div style="max-width: 400px; padding: 20px; margin: 0 auto; background: #f9f9f9; border-radius: 8px;">
    <h3>Contact Form</h3>
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 5px;">Name:</label>
      <input
        v-model="name"
        style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
      />
    </div>
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 5px;">Email:</label>
      <input
        v-model="email"
        type="email"
        style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
      />
    </div>
    <button
      @click="submit"
      style="padding: 10px 20px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;"
    >
      Submit
    </button>
    <div v-if="submitted" style="margin-top: 15px; padding: 10px; background: #4CAF50; color: white; border-radius: 4px;">
      Thanks {{ name }}! We will contact you at {{ email }}
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: "",
      email: "",
      submitted: false
    }
  },
  methods: {
    submit() {
      if (this.name && this.email) {
        this.submitted = true
        setTimeout(() => {
          this.submitted = false
          this.name = ""
          this.email = ""
        }, 3000)
      }
    }
  }
}
</` + `script>`

export const receiptsCode = `<template>
  <div style="padding: 20px;">
    <div style="max-width: 600px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9; margin-bottom: 30px;">
      <h3 style="margin-top: 0; color: #1a1a1a;">Receipt Builder</h3>

      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Receipt Number:</label>
        <input v-model="receiptNumber" style="padding: 8px; width: 100%; border: 1px solid #ccc; border-radius: 4px; color: #000;" />
      </div>

      <div style="margin-bottom: 20px;">
        <h4 style="color: #333; margin-bottom: 10px;">Add Line Item</h4>
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 10px; align-items: end;">
          <input v-model="newItem.description" placeholder="Description" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; color: #000;" />
          <input v-model.number="newItem.quantity" type="number" placeholder="Qty" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; color: #000;" />
          <input v-model.number="newItem.price" type="number" step="0.01" placeholder="Price" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; color: #000;" />
          <button @click="addLineItem" style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">Add</button>
        </div>
      </div>
    </div>

    <div style="width: 100%;">
      <h3 style="margin-top: 0; margin-bottom: 15px;">Receipt Preview</h3>
      <div style="width: 600px; background: white; border: 2px solid #333; border-radius: 4px; padding: 30px; box-shadow: 2px 2px 8px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px;">
          <h2 style="margin: 0; color: #1a1a1a;">RECEIPT</h2>
          <div style="margin-top: 5px; color: #444;">Receipt #{{ receiptNumber }}</div>
          <div style="font-size: 14px; color: #444;">{{ currentDate }}</div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="border-bottom: 2px solid #333; background: white;">
              <th style="text-align: left; padding: 10px 5px; color: #1a1a1a; background: white;">Description</th>
              <th style="text-align: center; padding: 10px 5px; color: #1a1a1a; background: white;">Qty</th>
              <th style="text-align: right; padding: 10px 5px; color: #1a1a1a; background: white;">Price</th>
              <th style="text-align: right; padding: 10px 5px; color: #1a1a1a; background: white;">Total</th>
              <th style="width: 30px; background: white;"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in lineItems" :key="index" style="border-bottom: 1px solid #ddd; background: white;">
              <td style="padding: 10px 5px; color: #000; background: white;">{{ item.description }}</td>
              <td style="text-align: center; padding: 10px 5px; color: #000; background: white;">{{ item.quantity }}</td>
              <td style="text-align: right; padding: 10px 5px; color: #000; background: white;">{{ formatCurrency(item.price) }}</td>
              <td style="text-align: right; padding: 10px 5px; color: #000; background: white;">{{ formatCurrency(item.quantity * item.price) }}</td>
              <td style="text-align: center; padding: 10px 5px; background: white;">
                <button @click="removeItem(index)" style="background: #f44336; color: white; border: none; border-radius: 3px; padding: 4px 8px; cursor: pointer; font-size: 12px;">×</button>
              </td>
            </tr>
            <tr v-if="lineItems.length === 0" style="background: white;">
              <td colspan="5" style="text-align: center; padding: 20px; color: #999; font-style: italic; background: white;">No items added yet</td>
            </tr>
          </tbody>
        </table>

        <div style="border-top: 2px solid #333; padding-top: 15px;">
          <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold;">
            <span style="color: #1a1a1a;">TOTAL:</span>
            <span style="color: #000;">{{ formatCurrency(total) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      receiptNumber: "R-1001",
      currentDate: new Date().toLocaleDateString(),
      lineItems: [],
      newItem: {
        description: "",
        quantity: 1,
        price: 0
      }
    }
  },
  computed: {
    total() {
      return this.lineItems.reduce((sum, item) => {
        return sum + (item.quantity * item.price)
      }, 0)
    }
  },
  methods: {
    addLineItem() {
      if (this.newItem.description && this.newItem.quantity > 0 && this.newItem.price > 0) {
        this.lineItems.push({
          description: this.newItem.description,
          quantity: this.newItem.quantity,
          price: this.newItem.price
        })
        this.newItem = { description: "", quantity: 1, price: 0 }
      }
    },
    removeItem(index) {
      this.lineItems.splice(index, 1)
    },
    formatCurrency(amount) {
      return "$" + amount.toFixed(2)
    }
  }
}
</` + `script>`

export const vanillaJsCode = `<template>
  <div style="padding: 20px;">
    <div style="max-width: 600px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9; margin-bottom: 30px;">
      <h3 style="margin-top: 0; color: #1a1a1a;">Vanilla JavaScript Demo</h3>
      <p style="color: #444; margin-bottom: 15px;">This demonstrates using PrintChecks with plain JavaScript (no framework)</p>

      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Payee Name:</label>
        <input v-model="payeeName" @input="updateCheck" style="padding: 8px; width: 100%; border: 1px solid #ccc; border-radius: 4px; color: #000;" />
      </div>

      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Amount:</label>
        <input v-model.number="checkAmount" @input="updateCheck" type="number" step="0.01" style="padding: 8px; width: 100%; border: 1px solid #ccc; border-radius: 4px; color: #000;" />
      </div>

      <button @click="createCheckData" style="padding: 10px 20px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Create Check Object
      </button>
    </div>

    <div style="width: 100%;">
      <h3 style="margin-top: 0; margin-bottom: 15px;">Check Data (JSON)</h3>
      <pre style="background: #1e1e1e; color: #d4d4d4; padding: 20px; border-radius: 4px; overflow-x: auto; font-family: monospace; font-size: 14px;">{{ checkDataJson }}</pre>

      <div v-if="checkData" style="margin-top: 20px; padding: 15px; background: #e8f5e9; border-left: 4px solid #4CAF50; border-radius: 4px;">
        <strong style="color: #2e7d32;">Check Created!</strong>
        <div style="margin-top: 10px; color: #1b5e20;">
          <div>Pay to: <strong>{{ checkData.payTo }}</strong></div>
          <div>Amount: <strong>{{ formatCurrency(checkData.amount) }}</strong></div>
          <div>In words: {{ checkData.amountInWords }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      payeeName: "Office Supplies Inc.",
      checkAmount: 250.00,
      checkData: null,
      checkDataJson: "// Click 'Create Check Object' to generate check data"
    }
  },
  methods: {
    updateCheck() {
      this.checkDataJson = "// Click 'Create Check Object' to see updated data"
    },
    createCheckData() {
      this.checkData = {
        checkNumber: "1001",
        date: new Date().toLocaleDateString(),
        payTo: this.payeeName,
        amount: this.checkAmount,
        amountInWords: this.numberToWords(this.checkAmount),
        memo: "Payment",
        signature: "Authorized Signature"
      }
      this.checkDataJson = JSON.stringify(this.checkData, null, 2)
    },
    formatCurrency(amount) {
      return "$" + amount.toFixed(2)
    },
    numberToWords(num) {
      if (!num || num === 0) return "Zero"
      const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
      const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
      const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
      let dollars = Math.floor(num)
      const cents = Math.round((num - dollars) * 100)
      let result = ""
      if (dollars >= 1000) {
        const thousands = Math.floor(dollars / 1000)
        result += ones[thousands] + " Thousand "
        dollars = dollars % 1000
      }
      if (dollars >= 100) {
        const hundreds = Math.floor(dollars / 100)
        result += ones[hundreds] + " Hundred "
        dollars = dollars % 100
      }
      if (dollars >= 20) {
        const tensDigit = Math.floor(dollars / 10)
        const onesDigit = dollars % 10
        result += tens[tensDigit]
        if (onesDigit > 0) result += "-" + ones[onesDigit]
      } else if (dollars >= 10) {
        result += teens[dollars - 10]
      } else if (dollars > 0) {
        result += ones[dollars]
      }
      return result.trim() + " and " + cents + "/100"
    }
  }
}
</` + `script>`

export const vueIntegrationCode = `<template>
  <div style="padding: 20px; font-family: Arial, sans-serif;">
    <h2>Vendor Management</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
      <div style="padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
        <h3>Add Vendor</h3>
        <input v-model="newVendor" placeholder="Vendor name" style="width: 100%; padding: 8px; margin-bottom: 10px;" />
        <button @click="addVendor" style="padding: 8px 16px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Add Vendor
        </button>
      </div>
      <div style="padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
        <h3>Vendors ({{ vendors.length }})</h3>
        <div v-for="vendor in vendors" :key="vendor.id" style="padding: 5px; background: #f5f5f5; margin-bottom: 5px; border-radius: 3px;">
          {{ vendor.name }}
        </div>
      </div>
    </div>
    <div style="padding: 15px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9;">
      <h3>Create Check</h3>
      <select v-model="selectedVendor" style="width: 100%; padding: 8px; margin-bottom: 10px;">
        <option value="">Select Vendor</option>
        <option v-for="vendor in vendors" :key="vendor.id" :value="vendor.name">
          {{ vendor.name }}
        </option>
      </select>
      <input v-model.number="amount" type="number" placeholder="Amount" style="width: 100%; padding: 8px; margin-bottom: 10px;" />
      <button @click="createCheck" :disabled="!selectedVendor" style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Create Check
      </button>
      <div v-if="checks.length > 0" style="margin-top: 15px;">
        <h4>Recent Checks:</h4>
        <div v-for="check in checks" :key="check.id" style="padding: 8px; background: white; margin-bottom: 5px; border-radius: 3px;">
          Check to {{ check.payee }} - {{ formatAmount(check.amount) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      vendors: [],
      checks: [],
      newVendor: "",
      selectedVendor: "",
      amount: 100,
      nextId: 1
    }
  },
  methods: {
    addVendor() {
      if (this.newVendor.trim()) {
        this.vendors.push({
          id: this.nextId++,
          name: this.newVendor.trim()
        })
        this.newVendor = ""
      }
    },
    createCheck() {
      if (this.selectedVendor && this.amount > 0) {
        this.checks.push({
          id: this.nextId++,
          payee: this.selectedVendor,
          amount: this.amount,
          date: new Date().toLocaleDateString()
        })
        this.amount = 100
      }
    },
    formatAmount(amount) {
      return "$" + amount.toFixed(2)
    }
  }
}
</` + `script>`

export const printableCheckPageCode = `<template>
  <div style="padding: 20px; font-family: Arial, sans-serif;">
    <!-- Controls (hidden when printing) -->
    <div class="controls-panel" style="max-width: 800px; margin: 0 auto 20px; padding: 15px; background: #f5f5f5; border-radius: 8px;">
      <h3 style="margin: 0 0 15px 0; color: #1a1a1a;">Printable Check Page Controls</h3>
      <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 15px;">
        <button @click="showAnalytics = !showAnalytics" style="padding: 8px 16px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">
          {{ showAnalytics ? 'Hide' : 'Show' }} Analytics
        </button>
        <button @click="showLineItems = !showLineItems" style="padding: 8px 16px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">
          {{ showLineItems ? 'Hide' : 'Show' }} Line Items
        </button>
        <button @click="triggerPrint" style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
          🖨️ Print
        </button>
      </div>

      <!-- Add Line Item Form -->
      <div style="padding: 15px; background: white; border-radius: 4px; margin-top: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">Add Line Item</h4>
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <input v-model="newItem.description" placeholder="Description" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; color: #000; width: 100%; box-sizing: border-box;" />
          <input v-model.number="newItem.quantity" type="number" min="1" placeholder="Qty" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; color: #000; width: 100%; box-sizing: border-box;" />
          <input v-model.number="newItem.price" type="number" step="0.01" min="0" placeholder="Price" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; color: #000; width: 100%; box-sizing: border-box;" />
        </div>
        <div style="text-align: right;">
          <button @click="addLineItem" style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">Add</button>
        </div>
      </div>
    </div>

    <!-- Printable Page Container with Scaling -->
    <div>
      <div>
        <div style="transform: scale(0.7); transform-origin: top left; width: 816px;">
          <div class="printable-content" style="position: relative; width: 816px; min-height: 1056px; background: white; border: 2px solid #333;">
      <!-- SECTION 1: Check Display -->
      <div style="padding: 20px; border-bottom: 2px solid #ddd; background: linear-gradient(to bottom, #ffffff 0%, #f9f9f9 100%);">
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #ccc;">
          <div>
            <h3 style="margin: 0 0 5px 0; font-size: 14pt; color: #1a1a1a;">Acme Corporation</h3>
            <p style="margin: 0; font-size: 9pt; color: #444; line-height: 1.3;">123 Business Ave<br>Springfield, IL 62701</p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 9pt; color: #555;">Check No.</div>
            <div style="font-size: 18pt; font-weight: bold; color: #000;">{{ checkNumber }}</div>
          </div>
        </div>

        <div style="text-align: right; margin-bottom: 10px;">
          <span style="font-size: 9pt; color: #555;">Date: </span>
          <span style="font-size: 11pt; color: #000; border-bottom: 1px solid #000; padding: 2px 8px;">{{ currentDate }}</span>
        </div>

        <div style="margin-bottom: 10px;">
          <div><span style="font-size: 9pt; color: #555;">Pay to the Order of: </span><span style="font-size: 12pt; color: #000; border-bottom: 1px solid #000; padding: 2px 8px; display: inline-block; min-width: 400px;">{{ payee }}</span></div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="flex: 1; border-bottom: 1px solid #000; padding: 2px 4px; display: flex; align-items: baseline; gap: 6px;">
            <span style="font-size: 10pt; color: #000;">{{ amountInWords }}</span>
            <span style="flex: 1; font-size: 10pt; color: #000; letter-spacing: 1px;">~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~</span>
            <span style="font-size: 8pt; color: #555; font-weight: bold;">DOLLARS</span>
          </div>
          <div style="border: 2px solid #000; padding: 8px 12px; margin-left: 10px; min-width: 120px;">
            <span style="font-size: 14pt; font-weight: bold; color: #000;">$<span style="margin-left: 4px;">{{ totalAmount.toFixed(2) }}</span></span>
          </div>
        </div>

        <div style="text-align: right; margin-top: 15px;">
          <span style="font-size: 8pt; color: #555;">Authorized Signature: </span>
          <span style="font-size: 11pt; font-style: italic; color: #000; border-bottom: 1px solid #000; padding: 2px 8px; display: inline-block; min-width: 200px;">John Doe</span>
        </div>

        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ccc; font-family: 'Courier New', monospace; font-size: 10pt; color: #444;">
          ⑆123456789⑆ 987654321⑈ {{ checkNumber }}⑆
        </div>
      </div>

      <!-- SECTION 2: Line Items -->
      <div v-if="showLineItems" :style="'padding: 20px; border-bottom: 2px solid #ddd; background: white; transform: scale(' + lineItemsScale + '); transform-origin: top center; margin-bottom: -50px;'">
        <h3 style="text-align: center; margin: 0 0 20px 0; color: #333; font-weight: 600;">📋 Payment Details</h3>
        <table style="display: table; width: 100%; table-layout: fixed; border-collapse: collapse; background: white; border: 2px solid #333; border-radius: 4px; overflow: hidden;">
            <thead>
              <tr style="background: white; border-bottom: 2px solid #333;">
                <th style="text-align: left; padding: 12px 16px; color: #000; font-weight: 600; background: white;">Description</th>
                <th style="text-align: center; padding: 12px 16px; color: #000; font-weight: 600; background: white;">Qty</th>
                <th style="text-align: right; padding: 12px 16px; color: #000; font-weight: 600; background: white;">Rate</th>
                <th style="text-align: right; padding: 12px 16px; color: #000; font-weight: 600; background: white;">Amount</th>
                <th style="width: 60px; background: white;"></th>
              </tr>
            </thead>
          <tbody>
            <tr v-for="(item, index) in lineItems" :key="index" style="border-bottom: 1px solid #eee; background: white;">
              <td style="padding: 10px 12px; color: #000; background: white;">{{ item.description }}</td>
              <td style="text-align: center; padding: 10px 12px; color: #000; background: white;">{{ item.quantity }}</td>
              <td style="text-align: right; padding: 10px 12px; color: #000; background: white;">\${{ item.price.toFixed(2) }}</td>
              <td style="text-align: right; padding: 10px 12px; color: #000; background: white;">\${{ (item.quantity * item.price).toFixed(2) }}</td>
              <td style="text-align: center; padding: 10px 12px; background: white;">
                <button @click="removeLineItem(index)" style="background: #f44336; color: white; border: none; border-radius: 3px; padding: 4px 8px; cursor: pointer; font-size: 12px;">×</button>
              </td>
            </tr>
            <tr v-if="lineItems.length === 0" style="background: white;">
              <td colspan="5" style="text-align: center; padding: 30px; color: #999; font-style: italic; background: white;">No line items added</td>
            </tr>
          </tbody>
          <tfoot v-if="lineItems.length > 0">
            <tr style="border-top: 2px solid #333; font-weight: bold; font-size: 16pt; background: white;">
              <td colspan="3" style="text-align: right; padding: 15px 16px; color: #000; font-weight: 600; background: white;">Total:</td>
              <td style="text-align: right; padding: 15px 16px; color: #000; font-weight: 700; background: white;">\${{ totalAmount.toFixed(2) }}</td>
              <td style="background: white;"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- SECTION 3: Analytics -->
      <div v-if="showAnalytics" style="position: absolute; bottom: 0; left: 0; right: 0; padding: 15px; background: white; border-top: 2px solid #ddd;">
        <h3 style="text-align: center; margin: 0 0 12px 0; font-size: 16pt; font-weight: 600; color: #333;">📊 Historical Payment Summary</h3>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <!-- Payment Totals Card -->
          <div style="background: #e8f5e8; padding: 12px; border-radius: 8px; border-left: 4px solid #4caf50;">
            <h5 style="color: #388e3c; margin: 0 0 8px 0; font-size: 12pt; font-weight: 600;">💰 Payment Totals</h5>
            <div style="font-size: 10pt;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px; padding: 4px 0; border-bottom: 1px solid rgba(56, 142, 60, 0.2);">
                <span style="font-weight: 500; color: #333;">This Month:</span>
                <strong style="color: #2e7d32; font-size: 11pt;">\$5,240.00</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px; padding: 4px 0; border-bottom: 1px solid rgba(56, 142, 60, 0.2);">
                <span style="font-weight: 500; color: #333;">Last Month:</span>
                <strong style="color: #2e7d32; font-size: 11pt;">\$4,875.00</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px; padding: 4px 0; border-bottom: 1px solid rgba(56, 142, 60, 0.2);">
                <span style="font-weight: 500; color: #333;">This Year:</span>
                <strong style="color: #2e7d32; font-size: 11pt;">\$58,920.00</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px; padding: 4px 0; border-bottom: 1px solid rgba(56, 142, 60, 0.2);">
                <span style="font-weight: 500; color: #333;">This Quarter:</span>
                <strong style="color: #2e7d32; font-size: 11pt;">\$15,340.00</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 6px 0;">
                <span style="font-weight: 500; color: #333;">Last Year:</span>
                <strong style="color: #2e7d32; font-size: 11pt;">\$52,680.00</strong>
              </div>
            </div>
          </div>

          <!-- Payment Statistics Card -->
          <div style="background: #fff3e0; padding: 12px; border-radius: 8px; border-left: 4px solid #ff9800;">
            <h5 style="color: #f57c00; margin: 0 0 8px 0; font-size: 12pt; font-weight: 600;">📈 Payment Statistics</h5>
            <div style="font-size: 10pt;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px; padding: 4px 0; border-bottom: 1px solid rgba(245, 124, 0, 0.2);">
                <span style="font-weight: 500; color: #333;">Average Payment:</span>
                <strong style="color: #e65100; font-size: 11pt;">\$1,240.00</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px; padding: 4px 0; border-bottom: 1px solid rgba(245, 124, 0, 0.2);">
                <span style="font-weight: 500; color: #333;">Monthly Average:</span>
                <strong style="color: #e65100; font-size: 11pt;">\$4,910.00</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px; padding: 4px 0; border-bottom: 1px solid rgba(245, 124, 0, 0.2);">
                <span style="font-weight: 500; color: #333;">Largest Payment:</span>
                <strong style="color: #e65100; font-size: 11pt;">\$5,500.00</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px; padding: 4px 0; border-bottom: 1px solid rgba(245, 124, 0, 0.2);">
                <span style="font-weight: 500; color: #333;">Smallest Payment:</span>
                <strong style="color: #e65100; font-size: 11pt;">\$125.00</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 6px 0;">
                <span style="font-weight: 500; color: #333;">Total Payments:</span>
                <strong style="color: #e65100; font-size: 13pt;">47</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- All Time Total Banner -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 10px; border-radius: 8px; text-align: center; color: white; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">
          <div style="font-size: 10pt; opacity: 0.95; margin-bottom: 2px;">All Time Total</div>
          <div style="font-size: 18pt; font-weight: bold; line-height: 1;">\$111,600.00</div>
        </div>
          </div>
        </div>
      </div>
    </div>
  </div>

    <!-- Print Styles -->
    <style>
      @media print {
        /* Page setup */
        @page {
          margin: 0.5in;
          size: letter portrait;
        }

        /* Hide EVERYTHING on the page */
        body * {
          visibility: hidden !important;
          display: none !important;
        }

        /* Show ONLY the printable content */
        .printable-content,
        .printable-content * {
          visibility: visible !important;
          display: block !important;
        }

        /* Restore table display for line items */
        .printable-content table {
          display: table !important;
        }

        .printable-content thead {
          display: table-header-group !important;
        }

        .printable-content tbody {
          display: table-row-group !important;
        }

        .printable-content tfoot {
          display: table-footer-group !important;
        }

        .printable-content tr {
          display: table-row !important;
        }

        .printable-content th,
        .printable-content td {
          display: table-cell !important;
        }

        /* Position printable content at top of page */
        .printable-content {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          max-width: 100% !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          background: white !important;
        }

        /* Ensure colors print */
        .printable-content * {
          print-color-adjust: exact !important;
          -webkit-print-color-adjust: exact !important;
        }
      }
    </style>
  </div>
</template>

<script>
export default {
  data() {
    return {
      checkNumber: "1001",
      currentDate: new Date().toLocaleDateString(),
      payee: "Acme Supplier Co.",
      lineItems: [
        { description: "Consulting Services", quantity: 10, price: 150.00 },
        { description: "Software License", quantity: 1, price: 500.00 }
      ],
      newItem: {
        description: "",
        quantity: 1,
        price: 0
      },
      showAnalytics: true,
      showLineItems: true
    }
  },
  computed: {
    totalAmount() {
      return this.lineItems.reduce((sum, item) => {
        return sum + (item.quantity * item.price)
      }, 0)
    },
    amountInWords() {
      const num = this.totalAmount
      if (num === 0) return "Zero Dollars"

      const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
      const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
      const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

      let dollars = Math.floor(num)
      const cents = Math.round((num - dollars) * 100)
      let result = ""

      if (dollars >= 1000) {
        const thousands = Math.floor(dollars / 1000)
        result += ones[thousands] + " Thousand "
        dollars = dollars % 1000
      }

      if (dollars >= 100) {
        const hundreds = Math.floor(dollars / 100)
        result += ones[hundreds] + " Hundred "
        dollars = dollars % 100
      }

      if (dollars >= 20) {
        const tensDigit = Math.floor(dollars / 10)
        const onesDigit = dollars % 10
        result += tens[tensDigit]
        if (onesDigit > 0) result += " " + ones[onesDigit]
      } else if (dollars >= 10) {
        result += teens[dollars - 10]
      } else if (dollars > 0) {
        result += ones[dollars]
      }

      return result.trim() + " and " + cents + "/100 Dollars"
    },
    lineItemsScale() {
      // Scale down the table when there are many items
      const count = this.lineItems.length
      if (count <= 3) return 1
      if (count <= 5) return 0.9
      if (count <= 7) return 0.75
      if (count <= 10) return 0.68
      if (count <= 13) return 0.62
      return 0.58
    }
  },
  methods: {
    addLineItem() {
      if (this.newItem.description && this.newItem.quantity > 0 && this.newItem.price > 0) {
        this.lineItems.push({
          description: this.newItem.description,
          quantity: this.newItem.quantity,
          price: this.newItem.price
        })
        this.newItem = { description: "", quantity: 1, price: 0 }
      }
    },
    removeLineItem(index) {
      this.lineItems.splice(index, 1)
    },
    triggerPrint() {
      // Get the printable content
      const printContent = document.querySelector('.printable-content')
      if (!printContent) {
        alert('Printable content not found')
        return
      }

      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600')
      if (!printWindow) {
        alert('Please allow popups to print')
        return
      }

      // Write the content to the new window
      printWindow.document.write(\`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Print Check</title>
          <style>
            @page {
              margin: 0.5in;
              size: letter portrait;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
            }
            .printable-content {
              border: none !important;
              max-width: 100% !important;
            }
            /* Hide remove buttons in line items */
            .printable-content button {
              display: none !important;
            }
            /* Hide the last column (actions) in line items table */
            .printable-content table th:last-child,
            .printable-content table td:last-child {
              display: none !important;
            }
            * {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          </style>
        </head>
        <body>
          \${printContent.outerHTML}
        </body>
        </html>
      \`)

      // Wait for content to load, then print
      printWindow.document.close()
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
    }
  }
}
</` + `script>`
