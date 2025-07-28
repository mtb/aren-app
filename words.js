// words.js: fetch and display words for selected syllable count
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const count = params.get('count');
  const display = document.getElementById('display');
  const counterEl = document.getElementById('counter');
  const backBtn = document.getElementById('back');
  const practiceDiv = document.getElementById('practice');
  let shownCount = 0;
  let isFetching = false;

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
  function fetchWord() {
    if (isFetching) return;
    isFetching = true;

    fetch(`/api/word/${count}`)
      .then(res => res.json())
      .then(data => {
      // Split into syllables and alternate highlight
      const syllables = data.word.split(' ');
      // Wrap each syllable in a span, alternating highlight and dim classes
      display.innerHTML = syllables.map((s, i) => {
        const cls = (i % 2 === 0) ? 'highlight' : 'dim';
        return `<span class="${cls}">${s}</span>`;
      }).join(' ');
      // Increment and display counter
      shownCount++;
      counterEl.textContent = shownCount;
      // Change background color on each word display
      changeBackgroundColor();
      })
      .catch(err => {
        console.error('Error fetching word:', err);
        changeBackgroundColor();
      })
      .finally(() => {
        isFetching = false;
      });
  }

  backBtn.addEventListener('click', () => {
    // Navigate back to menu (index.html) under same base path
    window.location.href = 'index.html';
  });

  // SPACE key, click or touch on display to fetch next word
  document.addEventListener('keydown', e => {
    if (e.code === 'Space') fetchWord();
  });
  display.addEventListener('click', fetchWord);
  display.addEventListener('touchend', e => {
    e.preventDefault();
    fetchWord();
  });

  // initial load
  shownCount = 0;
  counterEl.textContent = shownCount;
  fetchWord();
});
