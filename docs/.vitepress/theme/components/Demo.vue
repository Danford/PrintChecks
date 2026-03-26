<template>
  <ClientOnly>
    <div class="demo-container">
      <div v-if="title" class="demo-label">{{ title }}</div>
      <div class="demo-preview">
        <slot />
      </div>
      <div v-if="code" class="demo-toggle" @click="showCode = !showCode">
        {{ showCode ? '▼ Hide Code' : '▶ Show Code' }}
      </div>
      <div v-if="showCode && code" class="demo-code">
        <div v-html="highlightedCode"></div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useData } from 'vitepress'

const props = defineProps<{
  title?: string
  code?: string
  lang?: string
}>()

const showCode = ref(false)

// Simple syntax highlighting (VitePress will handle this in production)
const highlightedCode = computed(() => {
  if (!props.code) return ''

  const language = props.lang || 'vue'
  return `<pre><code class="language-${language}">${escapeHtml(props.code)}</code></pre>`
})

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, m => map[m])
}
</script>
