// menu.js: builds syllable-count buttons and navigates to words page
window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('wordCounts');
  fetch('api/word-counts')
    .then(res => res.json())
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
    });
});
