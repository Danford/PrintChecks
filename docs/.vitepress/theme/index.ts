import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Demo from './components/Demo.vue'
import Playground from './components/Playground.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // Custom layout slots can be added here if needed
    })
  },
  enhanceApp({ app }) {
    // Register global components
    app.component('Demo', Demo)
    app.component('Playground', Playground)
  }
} satisfies Theme
