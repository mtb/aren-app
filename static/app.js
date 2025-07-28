const menu = document.getElementById('menu');
const wordCountsContainer = document.getElementById('wordCounts');
const practice = document.getElementById('practice');
const display = document.getElementById('display');
const counterEl = document.getElementById('counter');
const backBtn = document.getElementById('back');

let lengthSelected = 0;
let shownCount = 0;

// Load available word syllable counts and populate buttons
fetch('/api/word-counts')
  .then(res => res.json())
  .then(data => {
    data.counts.forEach(count => {
      const btn = document.createElement('button');
      btn.textContent = `${count} Hece`;
      btn.dataset.count = count;
      wordCountsContainer.appendChild(btn);
    });
  });

// Handle syllable-count button clicks in the wordCounts container
wordCountsContainer.addEventListener('click', e => {
  const btn = e.target.closest('button[data-count]');
  if (!btn) return;
  lengthSelected = parseInt(btn.dataset.count, 10);
  startPractice();
});

backBtn.addEventListener('click', () => {
  practice.classList.add('hidden');
  menu.classList.remove('hidden');
});

document.addEventListener('keydown', e => {
  if (practice.classList.contains('hidden')) return;
  if (e.code === 'Space') {
    fetchItem();
  }
});

function startPractice() {
  // hide menu, reset counter, and show practice
  menu.classList.add('hidden');
  shownCount = 0;
  counterEl.textContent = shownCount;
  practice.classList.remove('hidden');
  // scroll to top so practice view is visible
  window.scrollTo(0, 0);
  fetchItem();
}

function fetchItem() {
  fetch(`/api/word/${lengthSelected}`)
    .then(res => res.json())
    .then(data => {
      display.textContent = data.word;
      // increment and display counter
      shownCount++;
      counterEl.textContent = shownCount;
    });
}

// Hide practice at start
practice.classList.add('hidden');
