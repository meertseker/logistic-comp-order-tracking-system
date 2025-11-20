import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const SITE_URL = process.env.VITE_SITE_URL?.replace(/\/$/, '') || 'https://www.sekersoft.com'
const DIST_DIR = resolve(process.cwd(), 'dist')

const staticRoutes = [
  '/',
  '/features',
  '/solutions',
  '/pricing',
  '/about',
  '/testimonials',
  '/demo',
  '/resources',
  '/contact',
  '/blog',
  '/support',
  '/privacy',
  '/terms',
  '/kvkk',
  '/cookie-policy',
]

const createUrlEntry = (path) => {
  const loc = path.startsWith('http') ? path : `${SITE_URL}${path}`
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${path === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${path === '/' ? '1.0' : '0.7'}</priority>
  </url>`
}

const buildSitemap = () => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes.map(createUrlEntry).join('\n')}
</urlset>
`

if (!existsSync(DIST_DIR)) {
  mkdirSync(DIST_DIR, { recursive: true })
}

const sitemapPath = resolve(DIST_DIR, 'sitemap.xml')
writeFileSync(sitemapPath, buildSitemap(), 'utf8')
console.log(`✅ Generated sitemap at ${sitemapPath}`)

