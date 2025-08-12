/**
 * Simple Express server for Turkish syllable practice app
 */
const express = require('express');
// Enable Cross-Origin Resource Sharing for API
const cors = require('cors');
const fs = require('fs');
const path = require('path');
// Global process-level diagnostics (temporary)
process.on('uncaughtException', err => {
  console.error('[FATAL uncaughtException]', err && err.stack ? err.stack : err);
});
process.on('unhandledRejection', reason => {
  console.error('[FATAL unhandledRejection]', reason);
});
// Ensure review log file exists
(() => {
  const checkLog = path.join(__dirname, 'words_needs_to_check.log');
  try {
    // open for append (creates if missing), then close
    const fd = fs.openSync(checkLog, 'a');
    fs.closeSync(fd);
  } catch (e) {
    console.error('Error initializing review log file:', e);
  }
})();
// Dynamically load JSON word lists from /data directory
const dataDir = path.join(__dirname, 'data');
// Load word buckets and combined list
const wordBuckets = {};
let words = [];
try {
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('_syllable.json'));
  files.forEach(file => {
    const match = file.match(/^(\d+)_syllable\.json$/);
    if (!match) return;
    const count = Number(match[1]);
    const content = fs.readFileSync(path.join(dataDir, file), 'utf-8');
    const arr = JSON.parse(content);
    wordBuckets[count] = arr;
    words = words.concat(arr);
  });
} catch (err) {
  console.error('Error loading data files:', err);
  process.exit(1);
}

const app = express();
// Use a shared router for API and pages, mount at root and '/aren'
const { param, validationResult } = require('express-validator');
const router = express.Router();
// CORS and JSON parsing on router
router.use(cors());
router.use(express.json());
// Diagnostic request logger (can remove after troubleshooting)
app.use((req, _res, next) => {
  console.log('[REQ]', req.method, req.url);
  next();
});
// Log key static file presence & sizes at startup
(() => {
  const filesToCheck = ['index.html', 'words.html', path.join('frontend','words.html')];
  filesToCheck.forEach(f => {
    const p = path.join(__dirname, f);
    try {
      const st = fs.statSync(p);
      console.log('[STARTUP] file', f, 'size', st.size);
    } catch (e) {
      console.log('[STARTUP] file', f, 'missing');
    }
  });
})();
// Serve static assets from project root (ignore any 'public/' directory to avoid stale files)
// Serve static assets from project root first
const rootDir = path.join(__dirname);
app.use(express.static(rootDir));
app.use('/aren', express.static(rootDir));
// Explicit handlers for words.html (avoid ambiguity)
// Add diagnostics for words.html requests
app.get('/words.html', (req, res) => {
  const filePath = path.join(__dirname, 'words.html');
  console.log('[DIAG] Request for words.html:', req.method, req.url, req.headers);
  res.sendFile(filePath, err => {
    if (err) {
      console.error('[DIAG] Error serving words.html:', err);
      res.status(500).send('Error loading words.html');
    } else {
      console.log('[DIAG] Successfully served words.html:', filePath);
    }
  });
});

app.get('/aren/words.html', (req, res) => {
  const filePath = path.join(__dirname, 'words.html');
  console.log('[DIAG] Request for aren/words.html:', req.method, req.url, req.headers);
  res.sendFile(filePath, err => {
    if (err) {
      console.error('[DIAG] Error serving aren/words.html:', err);
      res.status(500).send('Error loading aren/words.html');
    } else {
      console.log('[DIAG] Successfully served aren/words.html:', filePath);
    }
  });
});
// After root, serve any public folder assets (for hosting environments)
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.use('/aren', express.static(publicDir));
}
// Mount API and page routes on shared router
app.use('/', router);
app.use('/aren', router);
const port = process.env.PORT || 3000;


// Dynamically load and parse JSON word lists by syllable count
// Each file matching '<n>_syllable.json' populates wordBuckets[n]

// GET random word from all words (root and under '/aren')
/**
 * Handler to send a random word from the combined word list.
 * @param {import('express').Request} req - The Express request object
 * @param {import('express').Response} res - The Express response object
 */
function sendRandomWord(req, res) {
  try {
    if (!Array.isArray(words) || words.length === 0) {
      console.error('[sendRandomWord] words array empty');
      return res.status(500).json({ error: 'No words loaded' });
    }
    const idx = Math.floor(Math.random() * words.length);
    const w = words[idx];
    if (typeof w !== 'string') {
      console.error('[sendRandomWord] non-string word at idx', idx, w);
      return res.status(500).json({ error: 'Invalid word entry' });
    }
    console.log('[sendRandomWord] idx', idx, 'len', words.length, 'wordPreview', w.slice(0,20));
    res.json({ word: w });
  } catch (e) {
    console.error('[sendRandomWord] exception', e);
    res.status(500).json({ error: 'Random word failed' });
  }
}
/**
 * GET /api/word
 * Returns a random word from all syllable buckets
 */
router.get('/api/word', sendRandomWord);
// Alternate random endpoint for debugging differences on remote
router.get('/api/word-random', sendRandomWord);

// GET available syllable counts for words
/**
 * Handler to send the available syllable counts.
 * @param {import('express').Request} req - The Express request object
 * @param {import('express').Response} res - The Express response object
 */
function sendWordCounts(req, res) {
  const counts = Object.keys(wordBuckets)
    .map(n => parseInt(n, 10))
    .sort((a, b) => a - b);
  res.json({ counts });
}
/**
 * GET /api/word-counts
 * Returns available syllable counts sorted ascending
 */
router.get('/api/word-counts', sendWordCounts);

// Debug state endpoint to inspect server word buckets remotely
router.get('/api/debug/state', (req, res) => {
  const counts = Object.keys(wordBuckets).sort();
  const meta = counts.map(c => ({ count: c, size: Array.isArray(wordBuckets[c]) ? wordBuckets[c].length : null }));
  res.json({
    ok: true,
    counts: meta,
    totalWords: words.length,
    node: process.version,
    cwd: process.cwd(),
    pid: process.pid,
    uptimeSec: process.uptime()
  });
});
// Return a single test word for a given count without logging performance
router.get('/api/debug/test-word/:count', (req, res) => {
  const c = parseInt(req.params.count, 10);
  const list = wordBuckets[c];
  if (!list) return res.status(404).json({ error: 'no list' });
  return res.json({ sample: list[0] });
});
// Echo request info for debugging
router.all('/api/debug/echo', (req, res) => {
  res.json({ method: req.method, headers: req.headers, query: req.query, body: req.body });
});
// Serve raw words.html content for comparison
app.get('/debug/raw-words', (req, res) => {
  const p = path.join(__dirname, 'words.html');
  fs.readFile(p, 'utf-8', (err, data) => {
    if (err) return res.status(500).json({ error: 'read fail', detail: err.message });
    res.type('text/plain').send(data);
  });
});
// Simple health endpoint
router.get('/api/health', (req, res) => {
  res.json({ ok: true, counts: Object.keys(wordBuckets).length, totalWords: words.length, time: new Date().toISOString() });
});
// Debug version endpoint to confirm deployed code version & timestamp
router.get('/api/debug/version', (req, res) => {
  let pkgVersion = 'unknown';
  try {
    const pkg = require('./package.json');
    pkgVersion = pkg.version;
  } catch (e) {}
  res.json({ ok: true, version: pkgVersion, ts: new Date().toISOString() });
});

// GET random word with exact syllable count
/**
 * Handler to send a random word for a specified syllable count.
 * @param {import('express').Request} req - The Express request object
 *   req.params.count (number): desired syllable count
 * @param {import('express').Response} res - The Express response object
 */
function sendWordByCount(req, res) {
  const count = parseInt(req.params.count, 10);
  const list = wordBuckets[count];
  if (!list) {
    console.warn('[sendWordByCount] no list for count', count, 'available counts:', Object.keys(wordBuckets));
    return res.status(404).json({ error: 'No words of that syllable count' });
  }
  if (!Array.isArray(list) || list.length === 0) {
    console.warn('[sendWordByCount] empty list for count', count);
    return res.status(500).json({ error: 'Word list empty' });
  }
  const idx = Math.floor(Math.random() * list.length);
  res.json({ word: list[idx] });
}
/**
 * GET /api/word/:count
 * Returns a random word matching the specified syllable count
 */
// Validate :count is a positive integer
router.get('/api/word/:count', param('count').isInt({ min: 1 }), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn('[API /api/word/:count] validation failed', req.params.count);
    return res.status(400).json({ error: 'Invalid count parameter' });
  }
  try {
    console.log('[API /api/word/:count] fetching word for count', req.params.count);
    return sendWordByCount(req, res);
  } catch (e) {
    console.error('[API /api/word/:count] exception', e);
    return res.status(500).json({ error: 'Word fetch failed' });
  }
});
/**
 * POST /api/performance
 * Accepts a performance log entry in JSON and appends to log file
 * @param {string} sessionId - Unique identifier for the practice session
 * @param {string} startedAt - ISO timestamp when first word was shown
 * @param {string} finishedAt - ISO timestamp when last word was clicked
 * @param {string|number} countMode - 'random' or syllable count string
 * @param {number} targetCount - Number of words user intended to review
 * @param {number[]} durations - Seconds between word displays
 * @returns {object} ok flag and sessionId
 */
/**
 * POST /api/performance
 * Stores the performance entry in a date-based directory under /performance
 */
router.post('/api/performance', async (req, res, next) => {
  console.log('[API /api/performance] body keys:', Object.keys(req.body || {}));
  const entry = { ...req.body, ip: req.ip, timestamp: new Date().toISOString() };
  // Build date-based folder structure: performance/YYYY/MM/DD
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dir = path.join(__dirname, 'performance', String(year), month, day);
  // Ensure log directory exists
  try {
    await fs.promises.mkdir(dir, { recursive: true });
  } catch (err) {
    console.error('Error creating performance log directory:', err);
    return res.status(500).json({ error: 'perf mkdir failed' });
  }
  // Write one file per session
  const filename = path.join(dir, `${entry.sessionId}.log`);
  try {
    await fs.promises.writeFile(filename, JSON.stringify(entry, null, 2));
  } catch (err) {
    console.error('Error writing performance log file:', err);
    return res.status(500).json({ error: 'perf write failed' });
  }
  res.json({ ok: true, sessionId: entry.sessionId });
});
/**
 * GET /api/performance
 * Reads all session files under /performance and lists metadata
 */
// Performance listing API (root and /aren namespace)
app.get('/api/performance', (req, res) => {
  const baseDir = path.join(__dirname, 'performance');
  const sessions = [];
  // Recursively walk performance directory
  function walk(dir) {
    fs.readdirSync(dir).forEach(name => {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) {
        walk(full);
      } else if (name.endsWith('.log')) {
        const e = JSON.parse(fs.readFileSync(full, 'utf-8'));
        sessions.push({
          sessionId: e.sessionId,
          startedAt: e.startedAt,
          finishedAt: e.finishedAt,
          countMode: e.countMode,
          targetCount: e.targetCount,
          ip: e.ip
        });
      }
    });
  }
  if (fs.existsSync(baseDir)) walk(baseDir);
  res.json({ sessions });
});
app.get('/aren/api/performance', (req, res) => {
  // Delegate to existing handler
  req.url = '/api/performance';
  app._router.handle(req, res);
});
/**
 * GET /api/performance/:sessionId
 * Returns full data for a specific session
 */
// Performance detail API (root and /aren namespace)
app.get('/api/performance/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId;
  const baseDir = path.join(__dirname, 'performance');
  let found = null;
  // Recursively search for the file named '<sessionId>.log'
  function walk(dir) {
    fs.readdirSync(dir).forEach(name => {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) {
        walk(full);
      } else if (name === `${sessionId}.log`) {
        found = JSON.parse(fs.readFileSync(full, 'utf-8'));
      }
    });
  }
  if (fs.existsSync(baseDir)) walk(baseDir);
  if (!found) return res.status(404).end();
  res.json({ session: found });
});
app.get('/aren/api/performance/:sessionId', (req, res) => {
  req.url = `/api/performance/${req.params.sessionId}`;
  app._router.handle(req, res);
});
// Serve performance report pages and word-check page
app.get('/performance', (req, res) => res.sendFile(path.join(__dirname, 'performance.html')));
app.get('/performance/:sessionId', (req, res) => res.sendFile(path.join(__dirname, 'performance-detail.html')));
// POST a word to the check-list log
/**
 * POST /api/check-word
 * Flags a word for review by appending to review log
 */
app.post('/api/check-word', (req, res) => {
  const word = req.body.word;
  if (!word) return res.status(400).json({ error: 'No word provided' });
  const file = path.join(__dirname, 'words_needs_to_check.log');
  try {
    fs.appendFileSync(file, word + '\n');
    res.json({ ok: true });
  } catch (err) {
    console.error('Error writing to review log:', err);
    res.status(500).json({ error: 'Failed to flag word for review' });
  }
});
// GET the list of words to check
app.get('/api/check-list', (req, res) => {
  const file = path.join(__dirname, 'words_needs_to_check.log');
  try {
    const data = fs.readFileSync(file, 'utf-8');
    const lines = data.split('\n').filter(Boolean);
    return res.json({ words: lines });
  } catch (err) {
    console.error('Error reading review log:', err);
    return res.status(500).json({ error: 'Failed to read flagged words' });
  }
});
/**
 * DELETE /api/check-list
 * Clears all entries from the words_needs_to_check.log file
 */
/**
 * DELETE /api/check-list
 * Clears all flagged words
 */
app.delete('/api/check-list', (req, res) => {
  const file = path.join(__dirname, 'words_needs_to_check.log');
  try {
    fs.writeFileSync(file, '');
    res.json({ ok: true });
  } catch (err) {
    console.error('Error clearing review log:', err);
    res.status(500).json({ error: 'Failed to clear flagged words' });
  }
});
// Serve check page
// Serve word-review page
app.get('/check', (req, res, next) => {
  res.sendFile(path.join(__dirname, 'check.html'), err => {
    if (err) {
      console.error('Error sending check.html:', err);
      return next(err);
    }
  });
});
app.get('/aren/check', (req, res, next) => {
  res.sendFile(path.join(__dirname, 'check.html'), err => {
    if (err) {
      console.error('Error sending aren/check.html:', err);
      return next(err);
    }
  });
});

// Fallback to index.html for all non-API routes (SPA)
// Fallback to index.html for SPA (non-API requests) at root and '/aren'
// SPA fallback handlers commented out to allow direct .html serving
// app.get('*', (req, res) => {
//   if (req.path.startsWith('/api/')) return res.status(404).end();
//   res.sendFile(path.join(__dirname, 'index.html'));
// });
// app.get('/aren/*', (req, res) => {
//   if (req.path.startsWith('/aren/api/')) return res.status(404).end();
//   res.sendFile(path.join(__dirname, 'index.html'));
// });

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ERROR] path:', req.path, 'method:', req.method, 'params:', req.params, 'query:', req.query);
  console.error(err && err.stack ? err.stack : err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Internal server error' });
});
app.listen(port, () => console.log(`Server running on port ${port}`));
