# Interactive Demo Test

This page demonstrates the live demo and playground components.

## Basic Demo - Live Component

<Demo title="Simple Counter Demo">
  <div style="text-align: center; padding: 20px;">
    <button
      @click="count++"
      style="padding: 10px 20px; font-size: 16px; cursor: pointer;"
    >
      Count: {{ count }}
    </button>
  </div>
</Demo>

<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

## Interactive Playground

Edit the code below and see live updates:

<Playground :code="`
<template>
  <div style='padding: 20px; text-align: center;'>
    <h2>{{ message }}</h2>
    <button @click='changeMessage' style='padding: 10px 20px;'>
      Click Me!
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello from Playground!'
    }
  },
  methods: {
    changeMessage() {
      this.message = 'You clicked the button!'
    }
  }
}
<\/script>
`" />

## PrintChecks Demo

Coming soon: Live PrintChecks component demos with editable props and real-time preview.
