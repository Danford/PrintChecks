# Vanilla JavaScript

Use PrintChecks with plain JavaScript.

## Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
  <title>PrintChecks - Vanilla JS</title>
</head>
<body>
  <h1>PrintChecks</h1>

  <div id="app">
    <h2>Create Check</h2>
    <form id="checkForm">
      <div>
        <label>Check Number:</label>
        <input type="text" id="checkNumber" value="1001" required />
      </div>

      <div>
        <label>Pay To:</label>
        <input type="text" id="payTo" required />
      </div>

      <div>
        <label>Amount:</label>
        <input type="number" id="amount" step="0.01" required />
      </div>

      <div>
        <label>Memo:</label>
        <input type="text" id="memo" />
      </div>

      <button type="submit">Create Check</button>
    </form>

    <h2>Checks</h2>
    <div id="checksList"></div>
  </div>

  <script type="module">
    import { PrintChecksCore } from '@printchecks/core'

    // Initialize
    const printChecks = new PrintChecksCore()

    // Create bank account
    const bankAccount = await printChecks.createBankAccount({
      name: 'Business Checking',
      routingNumber: '123456789',
      accountNumber: '987654321',
      bankName: 'First National Bank',
      accountType: 'checking'
    })

    // Form submission
    const form = document.getElementById('checkForm')
    form.addEventListener('submit', async (e) => {
      e.preventDefault()

      const checkNumber = document.getElementById('checkNumber').value
      const payTo = document.getElementById('payTo').value
      const amount = parseFloat(document.getElementById('amount').value)
      const memo = document.getElementById('memo').value

      try {
        await printChecks.createCheck({
          checkNumber,
          date: new Date().toLocaleDateString(),
          payTo,
          amount,
          memo,
          bankAccountId: bankAccount.id,
          signature: 'John Doe',
          // Bank account fields
          accountHolderName: 'Acme Corporation',
          accountHolderAddress: '123 Main St',
          accountHolderCity: 'Springfield',
          accountHolderState: 'IL',
          accountHolderZip: '62701',
          bankName: bankAccount.bankName,
          routingNumber: bankAccount.routingNumber,
          bankAccountNumber: bankAccount.accountNumber
        })

        // Reset form
        form.reset()

        // Refresh list
        await displayChecks()
      } catch (error) {
        alert('Error creating check: ' + error.message)
      }
    })

    // Display checks
    async function displayChecks() {
      const checks = await printChecks.getChecks()
      const checksList = document.getElementById('checksList')

      if (checks.length === 0) {
        checksList.innerHTML = '<p>No checks created yet.</p>'
        return
      }

      checksList.innerHTML = `
        <table>
          <thead>
            <tr>
              <th>Number</th>
              <th>Date</th>
              <th>Payee</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${checks.map(check => `
              <tr>
                <td>${check.checkNumber}</td>
                <td>${check.date}</td>
                <td>${check.payTo}</td>
                <td>$${typeof check.amount === 'number' ? check.amount.toFixed(2) : check.amount}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `
    }

    // Initial load
    displayChecks()
  </script>

  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    form div {
      margin-bottom: 15px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }

    input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
    }

    button {
      padding: 10px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    button:hover {
      background: #0056b3;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }

    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }

    th {
      background: #f5f5f5;
      font-weight: bold;
    }
  </style>
</body>
</html>
```

## See Also

- [PrintChecksCore](/api/core/printchecks-core)
- [Basic Check](/examples/basic-check)
