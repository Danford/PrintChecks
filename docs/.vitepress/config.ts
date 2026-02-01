import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'PrintChecks',
  description: 'Professional check printing and payment documentation that runs entirely in your browser',

  base: '/PrintChecks/',

  head: [
    ['link', { rel: 'icon', href: '/PrintChecks/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:title', content: 'PrintChecks Documentation' }],
    ['meta', { name: 'og:description', content: 'Privacy-first check printing and payment documentation' }]
  ],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Guide', link: '/guide/installation' },
      { text: 'API', link: '/api/core/printchecks-core' },
      { text: 'Examples', link: '/examples/basic-check' },
      { text: 'Components', link: '/components/check-form' },
      {
        text: 'Reference',
        items: [
          { text: 'FAQ', link: '/reference/faq' },
          { text: 'Changelog', link: '/reference/changelog' }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Basic Usage', link: '/guide/basic-usage' },
            { text: 'Quick Start', link: '/getting-started' }
          ]
        },
        {
          text: 'Core Features',
          items: [
            { text: 'Bank Accounts', link: '/guide/bank-accounts' },
            { text: 'Checks', link: '/guide/checks' },
            { text: 'Vendors', link: '/guide/vendors' },
            { text: 'Receipts', link: '/guide/receipts' }
          ]
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Encryption', link: '/guide/encryption' },
            { text: 'Storage Adapters', link: '/guide/storage-adapters' },
            { text: 'Customization', link: '/guide/customization' },
            { text: 'Data Management', link: '/guide/data-management' },
            { text: 'Troubleshooting', link: '/guide/troubleshooting' }
          ]
        }
      ],

      '/api/': [
        {
          text: '@printchecks/core',
          items: [
            { text: 'PrintChecksCore', link: '/api/core/printchecks-core' },
            { text: 'CheckService', link: '/api/core/check-service' },
            { text: 'VendorService', link: '/api/core/vendor-service' },
            { text: 'BankAccountService', link: '/api/core/bank-account-service' },
            { text: 'ReceiptService', link: '/api/core/receipt-service' },
            { text: 'Models', link: '/api/core/models' },
            { text: 'Storage Adapters', link: '/api/core/storage-adapters' },
            { text: 'Utilities', link: '/api/core/utilities' }
          ]
        },
        {
          text: '@printchecks/vue',
          items: [
            { text: 'usePrintChecks', link: '/api/vue/use-printchecks' },
            { text: 'useChecks', link: '/api/vue/use-checks' },
            { text: 'useVendors', link: '/api/vue/use-vendors' },
            { text: 'useBankAccounts', link: '/api/vue/use-bank-accounts' },
            { text: 'useReceipts', link: '/api/vue/use-receipts' }
          ]
        },
        {
          text: '@printchecks/web-components',
          items: [
            { text: 'Overview', link: '/api/web-components/overview' },
            { text: 'check-form', link: '/api/web-components/check-form' },
            { text: 'check-preview', link: '/api/web-components/check-preview' },
            { text: 'vendor-list', link: '/api/web-components/vendor-list' },
            { text: 'vendor-form', link: '/api/web-components/vendor-form' },
            { text: 'bank-account-list', link: '/api/web-components/bank-account-list' },
            { text: 'bank-account-form', link: '/api/web-components/bank-account-form' }
          ]
        }
      ],

      '/examples/': [
        {
          text: 'Basic Examples',
          items: [
            { text: 'Basic Check', link: '/examples/basic-check' },
            { text: 'Vendor Management', link: '/examples/vendor-management' },
            { text: 'Receipts with Line Items', link: '/examples/receipts' }
          ]
        },
        {
          text: 'Storage & Security',
          items: [
            { text: 'Encrypted Storage', link: '/examples/encrypted-storage' },
            { text: 'Custom Storage Adapter', link: '/examples/custom-adapter' },
            { text: 'Data Import/Export', link: '/examples/data-import-export' }
          ]
        },
        {
          text: 'Framework Integration',
          items: [
            { text: 'Vue Integration', link: '/examples/vue-integration' },
            { text: 'React Usage', link: '/examples/react-usage' },
            { text: 'Vanilla JavaScript', link: '/examples/vanilla-js' }
          ]
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Multi-Account Setup', link: '/examples/multi-account' }
          ]
        }
      ],

      '/components/': [
        {
          text: 'Component Showcase',
          items: [
            { text: 'Check Form', link: '/components/check-form' },
            { text: 'Vendor Management', link: '/components/vendor-management' },
            { text: 'Receipt Builder', link: '/components/receipt-builder' },
            { text: 'Bank Account Manager', link: '/components/bank-account-manager' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Danford/PrintChecks' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Joshua Danford'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/Danford/PrintChecks/edit/master/docs/:path',
      text: 'Edit this page on GitHub'
    }
  },

  vite: {
    resolve: {
      alias: {
        '@printchecks/core': '../packages/core/src',
        '@printchecks/vue': '../packages/vue/src',
        '@printchecks/web-components': '../packages/web-components/src'
      }
    }
  }
})
