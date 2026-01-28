#!/usr/bin/env node

/**
 * Cleanup script to remove debug mode artifacts
 * Run this if you have leftover clear-storage.js or index.html modifications
 * from an old version of dev:clear
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs')
const path = require('path')

console.log('\n🧹 Cleaning up debug mode artifacts...\n')

const publicDir = path.join(__dirname, '../public')
const indexPath = path.join(__dirname, '../index.html')
const clearScriptPath = path.join(publicDir, 'clear-storage.js')

let cleaned = false

// Remove clear-storage.js if it exists
if (fs.existsSync(clearScriptPath)) {
  fs.unlinkSync(clearScriptPath)
  console.log('✅ Removed public/clear-storage.js')
  cleaned = true
} else {
  console.log('ℹ️  No clear-storage.js file found')
}

// Remove script injection from index.html if it exists
if (fs.existsSync(indexPath)) {
  let indexContent = fs.readFileSync(indexPath, 'utf8')
  const originalContent = indexContent

  indexContent = indexContent.replace(/\s*<script src="\/clear-storage\.js"><\/script>\n?/g, '')

  if (indexContent !== originalContent) {
    fs.writeFileSync(indexPath, indexContent, 'utf8')
    console.log('✅ Removed clear-storage.js reference from index.html')
    cleaned = true
  } else {
    console.log('ℹ️  No clear-storage.js reference in index.html')
  }
}

if (cleaned) {
  console.log('\n✨ Cleanup complete! You can now run "npm run dev" normally.\n')
} else {
  console.log('\n✨ Everything is already clean! No artifacts found.\n')
}
