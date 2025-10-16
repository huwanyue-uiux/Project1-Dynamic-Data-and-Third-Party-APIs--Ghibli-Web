(async function () {
  const API = 'https://ghibliapi.vercel.app/films';
  const container = document.getElementById('container');
  const loading = document.getElementById('loading');
  const searchInput = document.getElementById('search');
  const decadeSelect = document.getElementById('decadeSelect');
  const sortRating = document.getElementById('sortRating');
  const sortRuntime = document.getElementById('sortRuntime');
  const resetBtn = document.getElementById('reset');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const closeModalBtn = document.getElementById('closeModal');
  const modalImg = document.getElementById('modalImage');
  const modalTitle = document.getElementById('modalTitle');
  const modalOrig = document.getElementById('modalOriginal');
  const modalDir = document.getElementById('modalDirector');
  const modalProd = document.createElement('div'); // Create producer element
  const modalDate = document.getElementById('modalDate');
  const modalDesc = document.getElementById('modalDesc');

  modalProd.className = 'modal-meta'; // Add class for styling
  modalDir.parentNode.insertBefore(modalProd, modalDate); // Insert producer below director

  let films = [],
    filtered = [];
  let ratingState = 0,
    runtimeState = 0;

  async function loadFilms() {
    const res = await fetch(API);
    const data = await res.json();
    films = data.map((f) => ({
      ...f,
      release_date: parseInt(f.release_date) || 0,
      rt_score: parseInt(f.rt_score) || 0,
      running_time: parseInt(f.running_time) || 0,
    }));
    filtered = films.slice();
    render();
  }

  function render() {
    if (!filtered.length) {
      container.innerHTML = '<div class="loading">No films found.</div>';
      return;
    }
    container.innerHTML = '';
    for (const f of filtered) {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <div class="poster">
          ${
            f.image
              ? `<img src="${f.image}" alt="Poster for ${escapeHtml(f.title)}">`
              : `<div style="color:#888">No image</div>`
          }
        </div>
        <div class="card-body">
          <h3 class="film-title">${escapeHtml(f.title)}</h3>
          <div class="info-row">
            <span>${f.release_date || '—'}</span>
            <span>⏳ ${f.running_time ? f.running_time + ' mins' : '—'}</span>
            <span>⭐ ${f.rt_score || '—'}</span>
          </div>
        </div>`;
      card.addEventListener('click', () => openModal(f));
      container.appendChild(card);
    }
  }

  function openModal(f) {
    modalImg.src = f.image || f.movie_banner || '';
    modalTitle.textContent = f.title;
    modalOrig.innerHTML = `<strong>Original Title:</strong> ${
      f.original_title || '—'
    }`;
    modalDir.innerHTML = `<strong>Director:</strong> ${f.director || '—'}`;
    modalProd.innerHTML = `<strong>Producer:</strong> ${f.producer || '—'}`; // Add producer data
    modalDate.innerHTML = `<strong>Release Date:</strong> ${
      f.release_date || '—'
    }`;
    modalDesc.innerHTML = `<strong>Description:</strong> ${
      f.description || 'No description available.'
    }`;
    modalBackdrop.classList.add('active');
  }

  closeModalBtn.addEventListener('click', () =>
    modalBackdrop.classList.remove('active')
  );
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) modalBackdrop.classList.remove('active');
  });

  function applyFilters() {
    const q = searchInput.value.toLowerCase();
    const decade = parseInt(decadeSelect.value) || 0;
    filtered = films.filter((f) => {
      const matchQ = !q || f.title.toLowerCase().includes(q);
      const matchDecade =
        decade === 0 || Math.floor(f.release_date / 10) * 10 === decade;
      return matchQ && matchDecade;
    });
    if (ratingState === 1) filtered.sort((a, b) => b.rt_score - a.rt_score);
    else if (ratingState === 2) filtered.sort((a, b) => a.rt_score - b.rt_score);
    if (runtimeState === 1)
      filtered.sort((a, b) => b.running_time - a.running_time);
    else if (runtimeState === 2)
      filtered.sort((a, b) => a.running_time - b.running_time);
    render();
  }

  searchInput.addEventListener('input', applyFilters);
  decadeSelect.addEventListener('change', applyFilters);
  sortRating.addEventListener('click', () => {
    ratingState = (ratingState + 1) % 3;
    updateButton(sortRating, ratingState, 'Rating');
    applyFilters();
  });
  sortRuntime.addEventListener('click', () => {
    runtimeState = (runtimeState + 1) % 3;
    updateButton(sortRuntime, runtimeState, 'Running Time');
    applyFilters();
  });
  resetBtn.addEventListener('click', () => {
    searchInput.value = '';
    decadeSelect.value = 'all';
    ratingState = 0;
    runtimeState = 0;
    updateButton(sortRating, 0, 'Rating');
    updateButton(sortRuntime, 0, 'Running Time');
    applyFilters();
  });

  function updateButton(btn, state, label) {
    btn.classList.toggle('active', state !== 0);
    if (state === 0) btn.textContent = label;
    else if (state === 1) btn.textContent = `${label} ↓`;
    else btn.textContent = `${label} ↑`;
  }

  function escapeHtml(t) {
    return String(t)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  }

  await loadFilms();
  loading.remove();
})();