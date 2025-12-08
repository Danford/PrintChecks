<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>

    <div class="container">
        <div style="padding-bottom: 20px; padding-top: 20px; text-align: center;">
            <h1 style="color: #007bff; margin: 0; font-weight: bold;">
                🏦 PrintChecks
            </h1>
            <p style="color: #6c757d; margin: 5px 0 0 0; font-size: 14px;">
                Professional Check Printing & Payment Documentation
            </p>
        </div>
        <ul class="nav nav-tabs">
            <li class="nav-item">
                <RouterLink to="/" class="nav-link" :class="{'active': $route.path == '/'}">✅ Check</RouterLink>
            </li>
            <li class="nav-item">
                <RouterLink to="/customization" class="nav-link" :class="{'active': $route.path == '/customization'}">🎨 Customization</RouterLink>
            </li>
            <li class="nav-item">
                <RouterLink to="/receipt" class="nav-link" :class="{'active': $route.path == '/receipt'}">📋 Receipt</RouterLink>
            </li>
            <li class="nav-item">
                <RouterLink to="/history" class="nav-link" :class="{'active': $route.path == '/history'}">📚 History</RouterLink>
            </li>
            <li class="nav-item">
                <RouterLink to="/banks" class="nav-link" :class="{'active': $route.path == '/banks'}">🏦 Bank Accounts</RouterLink>
            </li>
            <li class="nav-item">
                <RouterLink to="/vendors" class="nav-link" :class="{'active': $route.path == '/vendors'}">👥 Vendors</RouterLink>
            </li>
            <li class="nav-item">
                <RouterLink to="/analytics" class="nav-link" :class="{'active': $route.path == '/analytics'}">📊 Analytics</RouterLink>
            </li>
        </ul>
      <nav>
      </nav>
    </div>

    <div class="container">
      <RouterView />
    </div>
</template>

<style scoped>

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

</style>
