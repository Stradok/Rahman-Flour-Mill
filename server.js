// Flour Mill Management System - Production Server
// This file runs the built Next.js application on Windows

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = false; // Production mode (uses .next build output)
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Ensure data directory exists for database
const dataDir = path.join(process.env.APPDATA || path.join(process.env.HOME || '', 'AppData', 'Local'), 'FlourMill');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Set database path for the app
process.env.DB_PATH = dataDir;

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
    // 127.0.0.1 only: keeps Windows Firewall silent (no listen prompt) and
    // keeps the app unreachable from the network — it's a single-PC system.
  }).listen(port, '127.0.0.1', (err) => {
    if (err) {
      console.error('Failed to start server:', err);
      process.exit(1);
    }
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  🌾 Al Rehman Flour Mills Management System               ║
║                                                            ║
║  Server running at: http://${hostname}:${port}            ║
║  Database: ${dataDir}                    ║
║                                                            ║
║  Opening in Microsoft Edge...                             ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
  });
}).catch((err) => {
  console.error('Failed to prepare app:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\nShutting down server...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  process.exit(0);
});
