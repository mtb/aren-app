// menu.js: builds syllable-count buttons and navigates to words page
window.addEventListener('DOMContentLoaded', () => {
  // detect base path for deployment (e.g., /aren)
  const base = window.location.pathname.startsWith('/aren') ? '/aren' : '';
  const container = document.getElementById('wordCounts');
  // fetch from Express API (no physical /api folder needed)
  fetch('api/word-counts')
    .then(res => {
      if (!res.ok) throw new Error('word-counts status ' + res.status);
      return res.json();
    })
    .then(data => {
      data.counts.forEach(count => {
        const btn = document.createElement('button');
        btn.textContent = `${count} Hece`;
        btn.dataset.count = count;
        btn.addEventListener('click', () => {
          window.location.href = `words.html?count=${count}`;
        });
        container.appendChild(btn);
      });
      // Added: Random button to select any word regardless of syllable count
      const randBtn = document.createElement('button');
      randBtn.textContent = 'Karışık';
      randBtn.dataset.count = 'random';
      randBtn.addEventListener('click', () => {
        window.location.href = `words.html?count=random`;
      });
      container.appendChild(randBtn);
    })
    .catch(err => {
      const div = document.createElement('div');
      div.style.color = 'red';
      div.textContent = 'Hata: ' + err.message;
      container.appendChild(div);
    });
});
