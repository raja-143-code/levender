import express from 'express';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Enable gzip/deflate compression for all responses (text, HTML, CSS, JS, JSON, SVG)
app.use(compression({
  level: 6,
  threshold: 1024, // only compress responses larger than 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// Add performance and security response headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// Determine static root (prefer dist in production if built, otherwise project root)
const staticRoot = fs.existsSync(path.join(__dirname, 'dist', 'index.html'))
  ? path.join(__dirname, 'dist')
  : __dirname;

// Set caching headers for static assets: 1 year for immutable media/css/js, 1 hour for HTML
const staticOptions = {
  maxAge: '1y',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('.xml') || filePath.endsWith('.txt') || filePath.endsWith('.webmanifest')) {
      res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
};

// Serve static assets for subdirectories like blog
app.use('/blog/img', express.static(path.join(staticRoot, 'img'), staticOptions));
app.use('/blog/style', express.static(path.join(staticRoot, 'style'), staticOptions));
app.use('/blog/js', express.static(path.join(staticRoot, 'js'), staticOptions));

// Explicit SEO endpoints
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(path.join(staticRoot, 'robots.txt'));
});

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(path.join(staticRoot, 'sitemap.xml'));
});

app.get('/site.webmanifest', (req, res) => {
  res.type('application/manifest+json');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(path.join(staticRoot, 'site.webmanifest'));
});

app.get('/favicon.svg', (req, res) => {
  res.type('image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.sendFile(path.join(staticRoot, 'favicon.svg'));
});

app.get('/favicon.ico', (req, res) => {
  res.type('image/x-icon');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.sendFile(path.join(staticRoot, 'favicon.ico'));
});

// Handle /blog explicitly so directory lookup doesn't override blog.html
app.get(['/blog', '/blog/'], (req, res) => {
  res.sendFile(path.join(staticRoot, 'blog.html'));
});

// Handle /aari-class explicitly
app.get(['/aari-class', '/aari-class/'], (req, res) => {
  res.sendFile(path.join(staticRoot, 'aari-class.html'));
});

// Serve root static assets (with html extension resolution)
app.use(express.static(staticRoot, {
  ...staticOptions,
  extensions: ['html']
}));

// Route fallback: if route matches an html file in root or blog, serve it
app.get('*', (req, res) => {
  const cleanPath = req.path.replace(/^\//, '');
  const candidateHtml = path.join(staticRoot, `${cleanPath}.html`);
  if (fs.existsSync(candidateHtml)) {
    return res.sendFile(candidateHtml);
  }
  const candidateBlog = path.join(staticRoot, 'blog', `${cleanPath.replace(/^blog\//, '')}.html`);
  if (fs.existsSync(candidateBlog)) {
    return res.sendFile(candidateBlog);
  }
  res.sendFile(path.join(staticRoot, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Lavender Park Beauty Parlour server running at http://0.0.0.0:${PORT}`);
});
