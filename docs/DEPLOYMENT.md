# PrintChecks Deployment Guide

This guide covers various deployment options for PrintChecks, from local usage to static hosting.

---

## 📚 Table of Contents

1. [Local Development](#local-development)
2. [Production Build](#production-build)
3. [Static Hosting Options](#static-hosting-options)
4. [Security Considerations](#security-considerations)
5. [Performance Optimization](#performance-optimization)
6. [Troubleshooting](#troubleshooting)

---

## 💻 Local Development

### Running Locally

The simplest and most secure way to use PrintChecks:

```bash
# Navigate to the application directory
cd printchecks

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev

# Open in browser
# Navigate to http://localhost:5173/
```

### Advantages of Local Usage

✅ **Maximum Privacy**: Data never leaves your computer  
✅ **No Hosting Costs**: No server or hosting fees  
✅ **Instant Setup**: Ready in minutes  
✅ **Full Control**: Complete control over your data  
✅ **No Internet Required**: Works completely offline

### Running on Network

To access from other devices on your local network:

```bash
# Start with network access
npm run dev -- --host

# Or specify a custom port
npm run dev -- --port 3000 --host
```

Then access from other devices using your computer's IP:

```
http://192.168.1.100:5173/
```

⚠️ **Warning**: Only do this on trusted networks!

---

## 📦 Production Build

### Building for Production

```bash
cd printchecks
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Build Output

```
dist/
├── index.html           # Entry point
├── assets/
│   ├── index-[hash].js  # Minified JavaScript
│   ├── index-[hash].css # Minified CSS
│   └── fonts/           # Font files
└── [other assets]
```

### Testing the Build Locally

```bash
npm run preview
```

Navigate to `http://localhost:4173/` to test the production build.

---

## 🌐 Static Hosting Options

Since PrintChecks is a static application with no backend, it can be hosted on any static file hosting service.

### Option 1: Netlify (Recommended)

**Pros**: Free tier, automatic deployments, custom domains, HTTPS

**Deployment Steps:**

1. **Build your application**

```bash
npm run build
```

2. **Sign up at [Netlify](https://www.netlify.com/)**

3. **Deploy via Netlify CLI** (recommended)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd printchecks
netlify deploy --prod --dir=dist
```

4. **Or drag & drop** the `dist/` folder to Netlify's web interface

**netlify.toml Configuration:**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 2: Vercel

**Pros**: Free tier, excellent performance, automatic deployments

**Deployment Steps:**

1. **Install Vercel CLI**

```bash
npm install -g vercel
```

2. **Deploy**

```bash
cd printchecks
vercel --prod
```

3. **Configure** `vercel.json` (optional)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [{ "handle": "filesystem" }, { "src": "/(.*)", "dest": "/index.html" }]
}
```

### Option 3: GitHub Pages

**Pros**: Free, easy integration with GitHub repositories

**Deployment Steps:**

1. **Add to `vite.config.ts`**

```typescript
export default defineConfig({
  base: '/PrintChecks/', // Replace with your repo name
  // ... other config
})
```

2. **Build**

```bash
npm run build
```

3. **Deploy to GitHub Pages**

```bash
# Using gh-pages package
npm install -D gh-pages

# Add to package.json scripts
"deploy": "gh-pages -d dist"

# Deploy
npm run deploy
```

### Option 4: AWS S3 + CloudFront

**Pros**: Scalable, reliable, full control

**Deployment Steps:**

1. **Build your application**

```bash
npm run build
```

2. **Create S3 Bucket**
   - Enable static website hosting
   - Configure bucket policy for public read access

3. **Upload files**

```bash
aws s3 sync dist/ s3://your-bucket-name/ --delete
```

4. **Create CloudFront Distribution** (optional, for HTTPS)
   - Point to S3 bucket
   - Configure custom domain
   - Enable HTTPS

### Option 5: Self-Hosted (Nginx/Apache)

**Pros**: Full control, can run on internal network

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name printchecks.example.com;
    root /var/www/printchecks;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

**Apache Configuration (.htaccess):**

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/css application/json application/javascript
</IfModule>
```

---

## 🔒 Security Considerations

### ⚠️ Important Security Warning

**DO NOT host PrintChecks publicly if you plan to enter real banking information!**

While the application doesn't transmit data externally:

- Anyone with access to the URL can use the application
- LocalStorage data is accessible via browser DevTools
- Your banking information could be exposed if someone gains access

### Recommended Usage

1. **Run Locally** (Most Secure)
   - Only for personal use
   - Data stays on your computer
   - No network exposure

2. **Internal Network Only**
   - Access from trusted devices on your network
   - Behind firewall
   - Requires VPN for remote access

3. **Password-Protected Hosting**
   - Add HTTP Basic Auth if hosting
   - Use strong passwords
   - Limit IP access if possible

### Adding Password Protection

**Netlify Basic Auth:**

```toml
# netlify.toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = true
  headers = {X-Frame-Options = "SAMEORIGIN"}

# Add to environment variables:
# NETLIFY_AUTH_USER=username
# NETLIFY_AUTH_PASSWORD=password
```

**Nginx Basic Auth:**

```nginx
location / {
    auth_basic "Restricted";
    auth_basic_user_file /etc/nginx/.htpasswd;
    try_files $uri $uri/ /index.html;
}
```

### HTTPS Requirement

Always use HTTPS when hosting:

- Prevents man-in-the-middle attacks
- Protects data in transit
- Required for modern browser features

Most hosting providers (Netlify, Vercel, etc.) provide free HTTPS.

---

## ⚡ Performance Optimization

### Build Optimizations

Already configured in Vite:

- ✅ Code minification
- ✅ Tree shaking
- ✅ Code splitting
- ✅ Asset optimization

### Additional Optimizations

#### 1. Enable Compression

**Nginx:**

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

**Apache:**

```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/css application/json application/javascript
</IfModule>
```

#### 2. Enable Caching

**Nginx:**

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

**Apache:**

```apache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/x-icon "access plus 1 year"
</IfModule>
```

#### 3. Use a CDN

For faster global access:

- Cloudflare (free tier available)
- AWS CloudFront
- Fastly

#### 4. Optimize Images/Logos

Before uploading logos:

```bash
# Install image optimization tools
npm install -g sharp-cli

# Optimize images
sharp -i logo.png -o logo-optimized.png --width 200
```

### Monitoring Performance

**Lighthouse Audit:**

```bash
# Install Lighthouse
npm install -g lighthouse

# Run audit
lighthouse http://localhost:4173/ --view
```

**Expected Scores:**

- Performance: 90+
- Accessibility: 85+
- Best Practices: 95+
- SEO: 80+

---

## 🐛 Troubleshooting

### Build Errors

**Issue**: `npm run build` fails

**Solutions:**

```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Ensure correct Node version
node --version  # Should be v18+

# Run type checking first
npm run type-check
```

### Routing Issues on Hosting

**Issue**: Refreshing pages shows 404 error

**Solution**: Configure rewrites to serve `index.html` for all routes

See hosting-specific configurations above.

### Font Loading Issues

**Issue**: Fonts don't load in production

**Solution:**

1. Ensure fonts are in `public/` directory
2. Check font paths in CSS
3. Verify CORS headers if using CDN

### Performance Issues

**Issue**: App loads slowly

**Solutions:**

1. Enable compression (gzip/brotli)
2. Use a CDN
3. Enable browser caching
4. Optimize images before upload

### LocalStorage Not Persisting

**Issue**: Data doesn't save between sessions

**Solutions:**

1. Check browser settings (not in private mode)
2. Ensure localStorage is enabled
3. Check for quota exceeded errors in console
4. Verify correct domain/origin

---

## 📊 Deployment Checklist

Before deploying to production:

- [ ] Run `npm run build` successfully
- [ ] Test production build locally with `npm run preview`
- [ ] Run `npm run type-check` without errors
- [ ] Run `npm run lint` without errors
- [ ] Configure routing/rewrites for SPA
- [ ] Enable HTTPS
- [ ] Enable compression (gzip/brotli)
- [ ] Configure caching headers
- [ ] Add security headers (if hosting publicly)
- [ ] Test on multiple browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices
- [ ] Test printing functionality
- [ ] Add password protection (if needed)
- [ ] Set up monitoring (optional)
- [ ] Document access instructions for users

---

## 🔗 Useful Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Vue.js Production Deployment](https://vuejs.org/guide/best-practices/production-deployment.html)
- [Netlify Documentation](https://docs.netlify.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

---

## 🆘 Getting Help

If you encounter deployment issues:

1. Check this guide first
2. Search [GitHub Issues](https://github.com/Danford/PrintChecks/issues)
3. Open a new issue with:
   - Hosting platform
   - Build output/errors
   - Browser console errors
   - Steps to reproduce

---

**Remember: For maximum security, run PrintChecks locally on your computer!** 🔒

---

_Last updated: December 2024_
