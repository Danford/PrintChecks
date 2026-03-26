<template>
  <ClientOnly>
    <div class="playground-container">
      <div class="playground-editor">
        <div class="playground-code">
          <div class="playground-code-header">
            <span>Edit Code</span>
            <button @click="resetCode" style="margin-left: auto; padding: 4px 12px; background: #2196F3; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;">Reset</button>
          </div>
          <textarea
            v-model="currentCode"
            spellcheck="false"
            @input="debounceUpdate"
          />
        </div>
        <div class="playground-preview">
          <div class="playground-preview-header">
            <span>Live Preview</span>
          </div>
          <div v-if="error" class="playground-error">
            <strong>Error:</strong> {{ error }}
            <br><small>Tip: Click "Reset" to restore the original code</small>
          </div>
          <div v-else class="playground-preview-content">
            <component
              :is="compiledComponent"
              v-if="compiledComponent"
              :key="componentKey"
            />
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, shallowRef, useSlots, onErrorCaptured } from 'vue'

const props = defineProps<{
  code?: string
  imports?: Record<string, any>
}>()

const slots = useSlots()

// Get code from either prop or slot
const getInitialCode = () => {
  // Handle ref values
  const codeValue = props.code && typeof props.code === 'object' && 'value' in props.code
    ? props.code.value
    : props.code

  if (codeValue) return codeValue
  if (slots.default) {
    const slotContent = slots.default()
    return slotContent[0]?.children || ''
  }
  return ''
}

const initialCode = getInitialCode()
const currentCode = ref(initialCode)
const compiledComponent = shallowRef<any>(null)
const error = ref('')
const componentKey = ref(0)
let debounceTimer: ReturnType<typeof setTimeout>

function debounceUpdate() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    updatePreview()
  }, 500)
}

function resetCode() {
  currentCode.value = initialCode
  updatePreview()
}

function updatePreview() {
  try {
    // Clear previous state
    error.value = ''
    compiledComponent.value = null

    // Extract template and script from the code
    const templateMatch = currentCode.value.match(/<template>([\s\S]*?)<\/template>/)
    const scriptMatch = currentCode.value.match(/<script[^>]*>([\s\S]*?)<\/script>/)

    if (!templateMatch) {
      throw new Error('No <template> found in code')
    }

    const template = templateMatch[1].trim()
    const script = scriptMatch ? scriptMatch[1].trim() : ''

    // Create a component definition
    const componentDef: any = {
      template: template
    }

    // If there's a script section, try to evaluate it
    if (script) {
      try {
        // Extract the export default object
        const exportMatch = script.match(/export\s+default\s+({[\s\S]*})/);
        if (exportMatch) {
          const setupCode = exportMatch[1];
          // Use Function constructor to safely evaluate the object
          const setupFunc = new Function('return ' + setupCode);
          const setupObj = setupFunc();
          Object.assign(componentDef, setupObj);
        }
      } catch (e: any) {
        console.error('Script parse error:', e)
        error.value = 'Script compilation error: ' + e.message
        return
      }
    }

    // Force component recreation by updating key
    componentKey.value++
    compiledComponent.value = componentDef
  } catch (e: any) {
    console.error('Template error:', e)
    error.value = 'Template error: ' + e.message
  }
}

onMounted(() => {
  updatePreview()
})

watch(() => props.code, (newCode) => {
  if (newCode) {
    currentCode.value = newCode
    updatePreview()
  }
})

// Catch all errors from child components
onErrorCaptured((err, instance, info) => {
  console.error('Caught error in playground:', err, info)
  error.value = 'Runtime error: ' + (err.message || String(err))
  compiledComponent.value = null
  return false // Prevent error from propagating
})
</script>
