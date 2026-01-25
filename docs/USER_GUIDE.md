# PrintChecks User Guide

Welcome to **PrintChecks**! This comprehensive guide will help you get the most out of the application.

> 💡 **Tip**: For visual examples of the interface, check out the [screenshots in the main README](../README.md#-screenshots).

---

## 📚 Table of Contents

1. [Getting Started](#getting-started)
2. [Bank Account Management](#bank-account-management)
3. [Printing Checks](#printing-checks)
4. [Managing Vendors](#managing-vendors)
5. [Creating Receipts](#creating-receipts)
6. [Customizing Check Style](#customizing-check-style)
7. [Viewing History](#viewing-history)
8. [Analytics Dashboard](#analytics-dashboard)
9. [Tips for Best Results](#tips-for-best-results)
10. [Troubleshooting](#troubleshooting)

---

## 🚀 Getting Started

### First Time Setup

When you first open PrintChecks, you'll need to set up a few things:

1. **Add Your First Bank Account**
   - Click on "Bank Accounts" in the left sidebar
   - Enter your routing number and account number
   - Give your account a friendly name (e.g., "Business Checking")
   - Optionally upload your bank's logo

2. **Customize Your Check Style** (Optional)
   - Navigate to "Customization"
   - Choose fonts, colors, and layout
   - Upload your company logo
   - Save your style as a preset for quick access

3. **Add Vendors** (Optional)
   - Go to "Vendors" in the sidebar
   - Add frequently used payees
   - This makes check writing faster

Now you're ready to print your first check!

---

## 🏦 Bank Account Management

### Adding a Bank Account

1. Navigate to **Bank Accounts** from the sidebar
2. Click **"Add Bank Account"**
3. Fill in the required information:
   - **Bank Name**: Your bank's name (e.g., "Chase Bank")
   - **Routing Number**: Your bank's 9-digit routing number
   - **Account Number**: Your account number
4. Optional: Upload your bank's logo
5. Click **"Save"**

### Finding Your Routing and Account Numbers

Your routing and account numbers can be found:
- On the bottom of your paper checks
- In your online banking portal
- By calling your bank

**Example check bottom:**
```
|:064000017|: 123456789012 || 1001
   ^             ^              ^
Routing    Account Number    Check Number
```

### Editing a Bank Account

1. Go to **Bank Accounts**
2. Find the account you want to edit
3. Click the **Edit** button
4. Make your changes
5. Click **"Save"**

### Deleting a Bank Account

1. Go to **Bank Accounts**
2. Find the account you want to remove
3. Click the **Delete** button
4. Confirm deletion

⚠️ **Note**: This only removes the account from your list. It does not affect your bank.

---

## 💰 Printing Checks

### Basic Check Printing

1. Navigate to **Home** from the sidebar
2. Fill in the check information:

   **Required Fields:**
   - **Date**: Check date (defaults to today)
   - **Payee**: Who you're paying (type to search vendors or enter manually)
   - **Amount**: Dollar amount (e.g., 125.50)
   - **Bank Account**: Select which account to use

   **Optional Fields:**
   - **Memo**: Note about the payment
   - **Check Number**: Auto-increments, but can be manually set

3. Click **"Print Check"**
4. Review the preview
5. Click your browser's print button

### Amount to Words Conversion

PrintChecks automatically converts your dollar amount to words:

- **$125.50** becomes "One Hundred Twenty-Five and 50/100"
- **$1,000.00** becomes "One Thousand and 00/100"

This meets banking standards and prevents check alteration.

### Using Vendor Quick-Fill

If you've added the payee as a vendor:

1. Start typing the vendor name in the **Payee** field
2. Select from the dropdown
3. The address and other details auto-fill

### Check Number Management

- Check numbers auto-increment with each check
- You can manually override any check number
- The system remembers the last check number used per account

### Printing Tips

**Browser Settings:**
- Enable "Background graphics"
- Set margins to "None" or "Minimum"
- Use 100% scale (no shrink-to-fit)

**Paper:**
- Use standard 8.5" x 11" blank check stock
- Ensure your printer supports check stock thickness
- MICR ink toner is recommended but not required

**Printers:**
- Laser printers work best
- Inkjet printers are acceptable but may smudge
- Ensure printer is properly calibrated

---

## 👥 Managing Vendors

Vendors are payees you write checks to frequently. Storing vendor information saves time and ensures consistency.

### Adding a Vendor

1. Navigate to **Vendors**
2. Click **"Add Vendor"**
3. Fill in the information:
   - **Name**: Vendor or person's name (required)
   - **Address**: Street address
   - **City**: City name
   - **State**: Two-letter state code
   - **ZIP**: Postal code
   - **Email**: Contact email
   - **Phone**: Contact phone number
4. Click **"Save"**

### Editing a Vendor

1. Go to **Vendors**
2. Find the vendor in the list
3. Click the **Edit** button
4. Make your changes
5. Click **"Save"**

### Deleting a Vendor

1. Go to **Vendors**
2. Find the vendor you want to remove
3. Click the **Delete** button
4. Confirm deletion

⚠️ **Note**: Deleting a vendor doesn't delete historical checks. Past checks will still show the vendor name.

### Searching Vendors

Use the search box at the top of the Vendors page:
- Search by name, email, phone, or address
- Results update as you type

### Viewing Vendor Payment History

1. Go to **Vendors**
2. Click on a vendor name
3. View all checks written to that vendor
4. See total amount paid over time

---

## 📋 Creating Receipts

PrintChecks can generate professional itemized receipts.

### Creating a Receipt

1. Navigate to **Receipts**
2. Fill in receipt header information:
   - **Recipient**: Who the receipt is for
   - **Date**: Receipt date
   - **Receipt Number**: Auto-generated or manual

3. **Add Line Items:**
   - Click **"Add Line Item"**
   - Enter description (e.g., "Web Design Services")
   - Enter quantity (e.g., 10)
   - Enter unit price (e.g., 75.00)
   - Subtotal calculates automatically

4. **Configure Tax:**
   - Set tax rate (percentage)
   - Total calculates automatically

5. Click **"Generate Receipt"**

### Editing Line Items

- Click the **Edit** button next to any line item
- Modify description, quantity, or price
- Click **"Save"**

### Deleting Line Items

- Click the **Delete** button next to any line item
- Confirm deletion

### Printing Receipts

1. Click **"Print Receipt"**
2. Review the preview
3. Use your browser's print function

Receipts format professionally for both digital and physical distribution.

---

## 🎨 Customizing Check Style

Make your checks match your brand with the Customization panel.

### Accessing Customization

Navigate to **Customization** from the sidebar.

### Font Customization

Customize fonts for each check element:

- **Payee Name**: Font for the "Pay to the Order of" line
- **Amount**: Font for the dollar amount
- **Amount Words**: Font for the written amount
- **Date**: Font for the date
- **Memo**: Font for the memo line
- **Signature**: Font for your signature (or upload an image)

**Font Options:**
- Arial
- Times New Roman
- Courier
- Georgia
- Verdana
- And many more elegant signature fonts

### Color Customization

Change colors for:
- Check borders
- Text colors
- Background tints
- Logo overlays

### Logo Management

1. Click **"Upload Logo"**
2. Select your image (PNG, JPG, SVG)
3. Adjust logo size and position
4. Preview changes in real-time

**Logo Tips:**
- Use high-resolution images (300 DPI)
- Transparent backgrounds work best (PNG)
- Optimal size: 200x80 pixels
- Position in the top-left is standard

### Layout Controls

⚠️ **Coming Soon**: Advanced layout controls for spacing and positioning will be added in a future update.

### Saving Style Presets

1. Customize your check style
2. Click **"Save as Preset"**
3. Give your preset a name (e.g., "Business Blue")
4. Click **"Save"**

### Loading Style Presets

1. Go to **Customization**
2. Select a preset from the dropdown
3. Click **"Load Preset"**
4. Your check style updates instantly

### Deleting Presets

1. Select the preset you want to delete
2. Click **"Delete Preset"**
3. Confirm deletion

---

## 📚 Viewing History

Track all your payments in one place with the History view.

### Accessing History

Navigate to **History** from the sidebar.

### Viewing All Payments

The History page shows:
- All checks written
- All receipts generated
- Payment amounts
- Dates and payees
- Memos and notes

⚠️ **Coming Soon**: The following features are currently in development and will be available in future updates:

### Planned Features

**Advanced Search**
- Search by payee name
- Search by memo text
- Search by amount
- Search by date

**Filtering**
- Date range filtering
- Amount range filtering
- Filter by specific vendors
- Filter by payment type

**Sorting & Organization**
- Sort by date, amount, payee, or check number
- Ascending and descending order
- Custom column sorting

**Pagination**
- Navigate through pages
- Adjustable items per page
- Quick page jumping

**Data Export**
- Export to CSV format
- Export to PDF format
- Filtered export options
- Full backup capabilities

---

## 📊 Analytics Dashboard

Gain insights into your payment patterns with the Analytics view.

### Accessing Analytics

Navigate to **Analytics** from the sidebar.

### Overview Statistics

See at-a-glance metrics:
- **Total Checks Written**: Lifetime count
- **Total Amount Paid**: Sum of all payments
- **Average Check Amount**: Mean payment size
- **Most Active Month**: Your busiest payment month

### Payment Trends Over Time

**Line Chart** showing:
- Payment volume by month
- Spending patterns
- Seasonal variations
- Growth trends

### Top Vendors

**Bar Chart** displaying:
- Your top 10 vendors by payment amount
- Total paid to each vendor
- Percentage of total spending

### Monthly Breakdown

**Table View** with:
- Spending by month
- Number of payments per month
- Average payment amount per month
- Year-over-year comparisons

### Time Range Selection

Filter analytics by:
- Last 30 days
- Last 90 days
- Last 6 months
- Last year
- All time
- Custom date range

### Exporting Analytics

1. Click **"Export Report"**
2. Choose PDF or CSV format
3. Download your analytics report

**Uses for Analytics:**
- Budget planning
- Expense tracking
- Vendor relationship management
- Financial forecasting

---

## 💡 Tips for Best Results

### Check Printing Best Practices

1. **Use Quality Check Stock**
   - 24 lb or heavier paper
   - Security features (watermarks, toner adhesion)
   - MICR line area (bottom of check)

2. **Printer Settings**
   - Print in portrait orientation
   - Disable "fit to page" or scaling
   - Enable background graphics/colors
   - Use highest quality setting

3. **Test Print First**
   - Print on plain paper first
   - Verify alignment with check stock
   - Adjust if necessary
   - Save check stock for final prints

4. **Check Alignment**
   - Place check stock correctly in printer
   - Some printers have rear feeds for specialty paper
   - Check printer manual for best practices

### Data Management

1. **Regular Backups** (Coming Soon)
   - Data export feature will be available soon
   - Manual browser localStorage backup as interim solution
   - Store backups in secure location

2. **Browser Considerations**
   - Don't use incognito/private mode (data won't persist)
   - Don't clear browser data if you want to keep history
   - Use the same browser consistently

3. **Security**
   - Run PrintChecks locally (don't host publicly)
   - Don't share your computer with untrusted users
   - **Coming Soon**: Built-in encryption options for enhanced security

### Performance Optimization

1. **History Management**
   - The immutable history log tracks all payments
   - Current performance is optimized for typical usage
   - Export and archive features coming soon

2. **Logo Optimization**
   - Use compressed images
   - Resize images before uploading
   - Smaller files = faster loading

### Accounting Integration

1. **Export Feature** (Coming Soon)
   - Data export for QuickBooks, Xero, etc. will be available soon
   - CSV format for spreadsheet compatibility
   - Full history export capabilities

2. **Memo Field Usage**
   - Use consistent memo formats
   - Include invoice numbers
   - Add project codes if applicable
   - Makes accounting easier

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### Prints Are Misaligned

**Solution:**
1. Disable all scaling in print settings
2. Set margins to "None"
3. Verify paper is loaded correctly
4. Check your printer's rear feed option for specialty paper
5. Adjust layout in Customization settings if needed

#### MICR Font Doesn't Display

**Solution:**
1. Ensure you're using a modern browser (Chrome/Firefox)
2. Clear browser cache
3. Reload the page
4. Check console for font loading errors

#### Data Disappeared

**Solution:**
1. Check if you cleared browser data
2. Verify you're using the same browser
3. Check if you're in private/incognito mode
4. Restore from backup if available

#### Can't Upload Logo

**Solution:**
1. Check file size (keep under 2MB)
2. Use supported formats (PNG, JPG, SVG)
3. Try a different image
4. Check browser console for errors

#### Need to Clear All Check History

**For Development/Testing:**

If you need to completely clear all check history (useful for testing or starting fresh):

**Method 1: Browser Console (Recommended for Production)**
1. Open your browser's Developer Console:
   - Chrome/Edge: Press `F12` or `Ctrl+Shift+J` (Windows) / `Cmd+Option+J` (Mac)
   - Firefox: Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)
2. Paste the following commands:
   ```javascript
   localStorage.removeItem('checkList')
   localStorage.removeItem('printchecks_receipts')
   localStorage.removeItem('printchecks_payments')
   ```
3. Press Enter
4. Refresh the page

**Method 2: Development Script**
If you're running the app in development mode:
```bash
npm run dev:clear
```

This will start the dev server with debug mode enabled, automatically clearing all localStorage data on page load.

⚠️ **Warning**: Both methods will **permanently delete** all your check history, receipts, and payment records. This action cannot be undone. Make sure to export your data first if you want to keep a backup (see Import/Export section).

💡 **Tip**: Consider using the Import/Export feature to backup your data before clearing history.

#### Print Button Doesn't Work

**Solution:**
1. Allow pop-ups for the site
2. Check browser's print permissions
3. Try a different browser
4. Restart the application

#### Browser Freezes or Crashes

**Solution:**
1. Clear browser cache
2. Reduce history size (export and clear old entries)
3. Use smaller logo files
4. Update your browser to the latest version

#### Check Numbers Out of Sequence

**Solution:**
1. Manually set the correct check number
2. The system will auto-increment from there
3. Export your history for records

#### Amount Words Incorrect

**Solution:**
1. Verify you entered the amount correctly
2. Use standard format (e.g., 125.50, not $125.5)
3. Report if issue persists

### Getting Help

If you encounter issues not covered here:

1. **Check the FAQ** (if available)
2. **Search GitHub Issues** for similar problems
3. **Open a new issue** with:
   - Detailed description
   - Steps to reproduce
   - Browser and OS information
   - Screenshots if applicable

---

## 📞 Support

For additional support:

- 📖 **Documentation**: See the main [README](../README.md)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/Danford/PrintChecks/issues)
- 💬 **Questions**: [GitHub Discussions](https://github.com/Danford/PrintChecks/discussions)

---

**Thank you for using PrintChecks!** 🏦✨

We hope this guide helps you make the most of the application. Happy printing!

---

*Last updated: December 2024*
