# Frequently Asked Questions

## General

### What is PrintChecks?

PrintChecks is a privacy-first, browser-based check printing and payment documentation system. All data stays on your computer - nothing is ever sent to external servers.

### Is PrintChecks free?

Yes, PrintChecks is completely free and open source under the MIT license.

### Do I need an internet connection?

No, once loaded, PrintChecks works entirely offline. All data is stored locally in your browser.

## Security

### Is my banking information secure?

Yes. PrintChecks runs entirely in your browser and never sends data to external servers. You can optionally enable encryption for extra security.

### Where is my data stored?

By default, data is stored in your browser's localStorage. You can use custom storage adapters or enable encryption.

### Can I encrypt my data?

Yes. Use the `SecureStorageAdapter` with a password to encrypt all data. See the [Encryption Guide](/guide/encryption).

### Should I use PrintChecks for sensitive data?

PrintChecks is designed with privacy in mind, but browser-based storage has limitations. For highly sensitive data, consider:
- Using encryption
- Implementing additional security measures
- Regular backups
- Secure device practices

## Compatibility

### Which browsers are supported?

PrintChecks works in all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Internet Explorer is not supported.

### Can I use PrintChecks on mobile?

Yes, PrintChecks works on mobile browsers, though the experience is optimized for desktop.

### Does PrintChecks work offline?

Yes, once the page is loaded, PrintChecks works completely offline.

## Usage

### How do I print checks?

Use the browser's print function (Ctrl/Cmd + P) when viewing a check preview.

### Can I use my own check stock?

Yes, PrintChecks is designed to print on standard blank check stock available from office supply stores.

### What is the MICR font?

MICR (Magnetic Ink Character Recognition) is the special font used for routing and account numbers at the bottom of checks. PrintChecks uses the official E13B MICR font.

### Can I manage multiple bank accounts?

Yes, PrintChecks supports unlimited bank accounts. You can set a default account and switch between them when creating checks.

### How do I backup my data?

Use the export feature to download all data as JSON. Store this backup file securely. See the [Data Management Guide](/guide/data-management).

### Can I import data from other systems?

Yes, you can import data using the import feature. The data must be in the correct JSON format. See [Data Import/Export](/examples/data-import-export).

## Development

### Can I use PrintChecks in my application?

Yes! PrintChecks provides three packages:
- `@printchecks/core` - Framework-agnostic core library
- `@printchecks/vue` - Vue 3 integration
- `@printchecks/web-components` - Framework-agnostic web components

### Is there a React version?

Use the core library or web components with React. See the [React Usage Example](/examples/react-usage).

### Can I customize the appearance?

Yes, you can customize fonts, colors, logos, and more. See the [Customization Guide](/guide/customization).

### Can I create my own storage adapter?

Yes, implement the `StorageAdapter` interface. See the [Custom Storage Adapter Example](/examples/custom-adapter).

## Legal

### Can I use PrintChecks for business?

Yes, PrintChecks is free for both personal and commercial use under the MIT license.

### Are the checks legally valid?

PrintChecks generates properly formatted checks with MICR encoding. However, you should verify with your bank that they accept checks printed on blank stock.

### Do I need special paper?

Yes, you should use blank check stock with MICR-compatible ink for the routing/account numbers. This paper is available from office supply stores.

## Troubleshooting

### My data disappeared after clearing browser cache

Browser localStorage is cleared when you clear browser data. Always export regular backups.

### The MICR font isn't displaying

Ensure you have the MICR E13B font installed. See the [Troubleshooting Guide](/guide/troubleshooting).

### I forgot my encryption password

If you lose your encryption password, your encrypted data cannot be recovered. Always keep your password in a secure location.

### Can I recover deleted checks?

No, deleted checks are permanently removed. Export regular backups to prevent data loss.

## Support

### How do I report a bug?

Create an issue on [GitHub](https://github.com/Danford/PrintChecks/issues).

### How can I contribute?

Contributions are welcome! See the [GitHub repository](https://github.com/Danford/PrintChecks).

### Where can I get help?

- Check this FAQ
- Read the [User Guide](/guide/installation)
- Search [GitHub Issues](https://github.com/Danford/PrintChecks/issues)
- Create a new issue

## See Also

- [Getting Started](/getting-started)
- [User Guide](/guide/installation)
- [Troubleshooting](/guide/troubleshooting)
