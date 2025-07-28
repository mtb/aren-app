const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
// Dynamically load word lists by syllable count
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
app.use(cors());
// Serve static frontend files from project root and under '/aren'
app.use(express.static(path.join(__dirname)));
app.use('/aren', express.static(path.join(__dirname)));
const port = process.env.PORT || 3000;


// GET random word from all words (root and under '/aren')
function sendRandomWord(req, res) {
  const idx = Math.floor(Math.random() * words.length);
  res.json({ word: words[idx] });
}
app.get('/api/word', sendRandomWord);

// GET available syllable counts for words
function sendWordCounts(req, res) {
  const counts = Object.keys(wordBuckets)
    .map(n => parseInt(n, 10))
    .sort((a, b) => a - b);
  res.json({ counts });
}
app.get('/api/word-counts', sendWordCounts);
app.get('/aren/api/word-counts', sendWordCounts);

// GET random word with exact syllable count
function sendWordByCount(req, res) {
  const count = parseInt(req.params.count, 10);
  const list = wordBuckets[count];
  if (!list) return res.status(404).json({ error: 'No words of that syllable count' });
  const idx = Math.floor(Math.random() * list.length);
  res.json({ word: list[idx] });
}
app.get('/api/word/:count', sendWordByCount);
app.get('/aren/api/word/:count', sendWordByCount);

// Fallback to index.html for all non-API routes (SPA)
// Fallback to index.html for SPA (non-API requests) at root and '/aren'
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).end();
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/aren/*', (req, res) => {
  if (req.path.startsWith('/aren/api/')) return res.status(404).end();
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});
app.listen(port, () => console.log(`Server running on port ${port}`));
