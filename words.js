// words.js: fetch and display words for selected syllable count
window.addEventListener('DOMContentLoaded', () => {
  // Parse URL parameters to get the selected syllable count or 'random'
  const params = new URLSearchParams(window.location.search);
  const count = params.get('count');
  const display = document.getElementById('display');
  // Add red-flag button for marking words to check (once)
  if (!document.getElementById('flag')) {
    const flagBtn = document.createElement('button');
    flagBtn.innerHTML = '🚩';
    flagBtn.id = 'flag';
    Object.assign(flagBtn.style, {
      position: 'fixed', bottom: '1rem', right: '1rem',
      fontSize: '2rem', background: 'transparent', border: 'none', color: 'red', cursor: 'pointer'
    });
    document.body.appendChild(flagBtn);
    flagBtn.addEventListener('click', () => {
      const current = display.textContent;
      fetch('/api/check-word', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ word: current }) });
    });
  }
  const counterEl = document.getElementById('counter');
  const backBtn = document.getElementById('back');
  const practiceDiv = document.getElementById('practice');
  let shownCount = 0; // ADDED: track number of words shown, start at 0
  // Prompt user for target number of words to practice
  let targetCount;
  do {
    targetCount = parseInt(prompt('Kaç kelime göstermek istersiniz?'), 10);
  } while (isNaN(targetCount) || targetCount <= 0);
  let isFetching = false; // Prevent concurrent fetches
  let skipInitial = true; // ADDED: skip counting the initial word load
  let lastFetchTime = 0; // ADDED: timestamp of last fetch to ignore accidental clicks
  let lastSyllableCount = null; // ADDED: avoid consecutive same-syllable random words
  let cachedData = null; // Cache to hold the prefetched next word
// PERFORMANCE LOGGING: track session start and click timestamps
  const sessionId = Date.now() + '-' + Math.random().toString(36).substr(2,9);
  let times = [];            // Array of Date.now() timestamps for each word display
  let startedAt = null;      // ISO timestamp when the first word is shown
  let wordsLogged = [];      // Array of words displayed in this session
  let sessionLogged = false; // Ensure we only commit performance once

  // Palette of darker, muted background colors
  const colors = [
    '#0d5e4e', '#1a4c6e', '#4e2d5b', '#733f11',
    '#74261e', '#176639', '#0b5043', '#145730'
  ];
  let lastColor = null;
  function changeBackgroundColor() {
    let newColor;
    do {
      newColor = colors[Math.floor(Math.random() * colors.length)];
    } while (newColor === lastColor);
    lastColor = newColor;
    practiceDiv.style.backgroundColor = newColor;
  }
  /**
   * Fetches a new word from the server, updates display, counter, background,
   * and logs timestamps for performance tracking.
   */
  function fetchWord() {
    const now = Date.now();
    // RECORD timestamp for each word display
  if (!startedAt) startedAt = new Date(now).toISOString();
  times.push(now);
    // Ignore clicks or taps if within 1 second of last fetch to avoid accidental repeats
    if (lastFetchTime && now - lastFetchTime < 1000) return;
    // Prevent multiple simultaneous fetches
    if (isFetching) return;
    isFetching = true;
    // Determine API endpoint: random mode vs fixed syllable count
  const endpoint = (count === 'random') ? '/api/word-random' : `/api/word/${count}`;
  console.log('Fetching word from', endpoint);
    // Use cached data if available, otherwise fetch from server
    const wordPromise = cachedData
      ? Promise.resolve(cachedData)
      : fetch(endpoint).then(res => {
          if (!res.ok) throw new Error('status ' + res.status);
          return res.json();
        });
    if (cachedData) cachedData = null;
    wordPromise
      .then(data => {
        // Normalize word to lowercase for consistent display (Turkish locale)
        const wordText = data.word.toLocaleLowerCase('tr');
        // Record first display timestamp
        if (!startedAt) startedAt = new Date(times[0]).toISOString();
        // Split into syllables and alternate highlight
        const syllables = wordText.split(' ');
        const syllableCount = syllables.length;
        // Avoid consecutive words with same syllable count in random mode
        if (count === 'random' && lastSyllableCount !== null && syllableCount === lastSyllableCount) {
          isFetching = false;
          fetchWord();
          return;
        }
        // Record this word for performance logging
        wordsLogged.push(wordText);
        // Wrap each syllable in a span, alternating highlight and dim classes
        display.innerHTML = syllables.map((s, i) => {
          const cls = (i % 2 === 0) ? 'highlight' : 'dim';
          return `<span class="${cls}">${s}</span>`;
        }).join(' ');
        // Skip initial load count, then increment counter
        if (skipInitial) {
          skipInitial = false;
        } else {
          shownCount++;
        }
        // Ensure counter shows current count out of target
        counterEl.textContent = `${shownCount}/${targetCount}`;
        // Update last syllable count for next fetch
        lastSyllableCount = syllableCount;
        // Change background color on each word display
        changeBackgroundColor();
  // Defer performance logging until session end
        // Prefetch the next word for faster subsequent fetches
        cacheNextWord();
      })
      .catch(err => {
        console.error('Error fetching word:', err);
        display.innerHTML = `<span style="color:red">Hata: ${err.message}</span>`;
        changeBackgroundColor();
      })
      .finally(() => {
        // Update timestamp and clear fetch lock
        lastFetchTime = Date.now();
        isFetching = false;
      });
  }
  /** Prefetch the next word and store in cache */
  function cacheNextWord() {
  const endpoint = (count === 'random') ? '/api/word-random' : `/api/word/${count}`;
    fetch(endpoint)
      .then(res => res.json())
      .then(data => { cachedData = data; })
      .catch(err => console.error('Error caching next word:', err));
  }

  function commitSession() {
    if (sessionLogged) return;
    if (!startedAt || times.length === 0) {
      console.log('No session data to commit');
      return;
    }
    sessionLogged = true;
    const finishedAt = new Date(times[times.length - 1] || Date.now()).toISOString();
    const durations = times.slice(1).map((t, i) => (t - times[i]) / 1000);
  fetch('/api/performance', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ sessionId, startedAt, finishedAt, countMode: count, targetCount, durations, words: wordsLogged })
  }).then(r => r.json()).then(js => console.log('Performance committed:', js)).catch(err => console.error('Commit failed', err));
  }

  backBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    commitSession();
    // slight delay to allow fetch to fire
    setTimeout(() => { window.location.href = 'index.html'; }, 150);
  });

  window.addEventListener('beforeunload', commitSession);

  // SPACE key, click or touch on display to fetch next word
  document.addEventListener('keydown', e => {
    if (e.code === 'Space') fetchWord();
  });
  // Allow click/touch anywhere in practice area to fetch next word
  // Trigger next word on click or touch anywhere in practice area
  practiceDiv.addEventListener('click', fetchWord);
  practiceDiv.addEventListener('touchend', e => {
    e.preventDefault();
    fetchWord();
  });
  practiceDiv.addEventListener('touchstart', e => {
    e.preventDefault();
    fetchWord();
  });

  // initial load
  // initial load: reset count and fetch first word (counter updates in fetchWord)
  shownCount = 0;
  fetchWord();
});
