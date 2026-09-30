import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateToken } from './server/auth.ts';
import { db } from './server/db.ts';
import { router as apiRouter } from './server/routes.ts';
import { testDbConnection } from './server/mysql.ts';

// Dual CJS / ESM support
const currentFilename = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
const currentDirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(currentFilename);

async function startServer() {
  // Test MySQL connection on boot
  await testDbConnection();

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Basic security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Attach auth context from JWT
  app.use(authenticateToken);

  // 1. Technical SEO Endpoints: robots.txt & sitemap.xml
  app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /account\nSitemap: https://luxecommerce.com/sitemap.xml`);
  });

  app.get('/sitemap.xml', (req, res) => {
    res.type('application/xml');
    const urls = [
      '',
      '/shop',
      '/about',
      '/faq',
      '/blog',
      ...db.categories.map((c) => `/shop?category=${c.slug}`),
      ...db.products.map((p) => `/product/${p.slug}`),
      ...db.blogs.map((b) => `/blog/${b.slug}`),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>https://luxecommerce.com${u}</loc>
    <changefreq>daily</changefreq>
    <priority>${u === '' ? '1.0' : u.startsWith('/product') ? '0.8' : '0.6'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
    res.send(xml);
  });

  // 2. Mount API Routes
  app.use('/api', apiRouter);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 3. Vite Middleware for Development or Static Files for Production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LuxeCommerce production server active on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal startup error:', err);
});
