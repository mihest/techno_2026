import { defineConfig } from 'vite'
import fs from 'node:fs'
import path from 'node:path'

// Serve static template pages at root URLs in dev.
export default defineConfig({
  root: 'template',
  publicDir: false,
  appType: 'mpa',
  plugins: [
    {
      name: 'clean-urls-for-template-pages',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (!req.url) return next()

          const [pathname, search = ''] = req.url.split('?')
          if (!pathname || pathname.startsWith('/@') || pathname.startsWith('/js/') || pathname.startsWith('/css/') || pathname.startsWith('/themes/')) {
            return next()
          }

          if (pathname === '/index.html') {
            res.statusCode = 302
            res.setHeader('Location', '/')
            res.end()
            return
          }

          if (pathname.endsWith('.html')) {
            const cleanPath = pathname.slice(0, -5) || '/'
            res.statusCode = 302
            res.setHeader('Location', `${cleanPath}${search ? `?${search}` : ''}`)
            res.end()
            return
          }

          if (pathname === '/' || path.extname(pathname)) {
            return next()
          }

          const fileCandidate = path.join(server.config.root, `${pathname.slice(1)}.html`)
          if (fs.existsSync(fileCandidate)) {
            req.url = `${pathname}.html${search ? `?${search}` : ''}`
          }
          next()
        })
      },
    },
  ],
  server: {
    open: '/',
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
})
