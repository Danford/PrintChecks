#!/usr/bin/env node

/**
 * Debug script to start dev environment with debug mode enabled
 * Run with: npm run dev:clear
 * 
 * This sets VITE_DEBUG_MODE=true which tells the app to:
 * 1. Clear localStorage on startup
 * 2. Enable debug console logging
 * 
 * NO FILES ARE MODIFIED - everything is controlled via environment variable
 */

const { spawn } = require('child_process');

console.log('\n🗑️  PrintChecks - Clear History Debug Mode\n');
console.log('Starting dev server with VITE_DEBUG_MODE=true');
console.log('This will clear all check history from localStorage on page load.\n');

console.log('📝 localStorage will be cleared when you open the app');
console.log('🚀 Starting dev server in DEBUG MODE...\n');
console.log('⚠️  To disable: Stop server and run "npm run dev" (without :clear)\n');

// Start the vite dev server with DEBUG MODE environment variable
// The app will detect this and clear localStorage on startup
const vite = spawn('vite', [], { 
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, VITE_DEBUG_MODE: 'true' }
});

// Handle exit
vite.on('exit', (code) => {
  process.exit(code);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n👋 Debug mode stopped. Run "npm run dev" for normal mode.\n');
  process.exit(0);
});
