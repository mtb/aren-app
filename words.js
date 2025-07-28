// words.js: fetch and display words for selected syllable count
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const count = params.get('count');
  const display = document.getElementById('display');
  const counterEl = document.getElementById('counter');
  const backBtn = document.getElementById('back');
  let shownCount = 0;

  // Palette of background colors with sufficient contrast against white text
  const colors = [
    '#1abc9c', '#3498db', '#9b59b6', '#e67e22',
    '#e74c3c', '#2ecc71', '#16a085', '#27ae60'
  ];
  let lastColor = null;
  function changeBackgroundColor() {
    let newColor;
    do {
      newColor = colors[Math.floor(Math.random() * colors.length)];
    } while (newColor === lastColor);
    lastColor = newColor;
    document.body.style.backgroundColor = newColor;
  }
  function fetchWord() {
    fetch(`api/word/${count}`)
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
