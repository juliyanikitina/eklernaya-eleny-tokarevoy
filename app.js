'use strict';

const desserts = [
  {id:'raspberry', name:'Малина', category:'berry', categoryLabel:'Ягодная коллекция', note:'Сливочная нежность · Ягодная сердцевина', description:'Малиновая форма скрывает лёгкий сливочный крем и насыщенный ягодный центр. Нежность с ярким акцентом.', layers:['Тонкая красная оболочка','Лёгкий сливочный крем','Малиновая сердцевина и светлый бисквит'], alt:'Малиновое пирожное и его разрез на белой тарелке'},
  {id:'pistachio', name:'Фисташка', category:'nut', categoryLabel:'Ореховая коллекция', note:'Фисташковый крем · Пралине', description:'Сдержанный зелёный снаружи — и целый мир фисташки внутри. Мягкий крем, пралине и нежный бисквит.', layers:['Зелёная шоколадная оболочка','Лёгкий фисташковый крем','Фисташковое пралине и бисквит'], alt:'Зелёное фисташковое пирожное с разрезом, кремом и пралине'},
  {id:'blackberry', name:'Ежевика', category:'berry', categoryLabel:'Ягодная коллекция', note:'Ежевичная начинка · Нежный мусс', description:'Глубокий ягодный цвет и сочная ежевичная сердцевина. В каждом разрезе — контраст нежного мусса и насыщенной начинки.', layers:['Тонкая тёмная оболочка','Нежный ягодный мусс','Ежевичная сердцевина и тёмный бисквит'], alt:'Ежевичное пирожное с лиловым муссом и тёмной ягодной начинкой'},
  {id:'blueberry', name:'Голубика', category:'berry', categoryLabel:'Ягодная коллекция', note:'Бархатная оболочка · Ягодный центр', description:'Бархатистая синяя оболочка, воздушный мусс и ягодная сердцевина. Маленькая голубика с большим характером.', layers:['Синяя бархатистая оболочка','Воздушный ягодный мусс','Насыщенный ягодный центр и тёмный бисквит'], alt:'Синее пирожное в форме голубики и разрез с ягодным центром'},
  {id:'lemon', name:'Лимон', category:'fruit', categoryLabel:'Фруктовая коллекция', note:'Сливочный мусс · Цитрусовый акцент', description:'Знакомый силуэт лимона и удивительно нежная текстура внутри. Сливочная мягкость встречается с лёгкой цитрусовой кислинкой.', layers:['Тонкая жёлтая оболочка','Лёгкий сливочный мусс','Цитрусовая начинка и светлая основа'], alt:'Жёлтое пирожное-лимон и разрез со светлым воздушным муссом'},
  {id:'mango', name:'Манго', category:'fruit', categoryLabel:'Фруктовая коллекция', note:'Манговый ганаш · Фруктовая начинка', description:'Тёплые оттенки спелого манго снаружи и солнечная начинка внутри. Нежная фруктовая история в маленькой форме.', layers:['Тонкая оболочка в оттенках манго','Нежный манговый ганаш','Манговая сердцевина и светлый бисквит'], alt:'Пирожное-манго с золотистым муссом и оранжевой сердцевиной'}
];

const videoSources = DESSERT_MEDIA;
const grid = document.querySelector('#dessert-grid');
const dialog = document.querySelector('#dessert-dialog');
const detailVideo = document.querySelector('#detail-video');
const detailImage = document.querySelector('#detail-image');
const videoToggle = document.querySelector('#video-toggle');
let activeIndex = 0;
let opener = null;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionToggle = document.querySelector('#motion-toggle');
let motionEnabled = !reducedMotion.matches;
const visiblePreviews = new Set();
const previewObserver = new IntersectionObserver(entries => {
  entries.forEach(({target, isIntersecting}) => {
    if (isIntersecting) visiblePreviews.add(target);
    else visiblePreviews.delete(target);
    syncPreview(target);
  });
}, {threshold: .12});

function syncPreview(video) {
  if (!motionEnabled || document.hidden || dialog.open || !visiblePreviews.has(video)) {
    video.pause();
    return;
  }
  if (!video.getAttribute('src')) video.src = video.dataset.src;
  video.play().catch(() => { /* The photograph remains visible if autoplay is unavailable. */ });
}

function syncMotion() {
  motionToggle.hidden = !Object.keys(videoSources).length;
  motionToggle.setAttribute('aria-pressed', String(motionEnabled));
  motionToggle.textContent = motionEnabled ? 'Ⅱ Пауза видео' : '▶ Включить видео';
  document.querySelectorAll('.motion-preview').forEach(syncPreview);
}

function addMotionPreview(button, id) {
  if (!videoSources[id]) return;
  const video = document.createElement('video');
  video.className = 'motion-preview';
  video.dataset.src = videoSources[id];
  video.poster = `./assets/${id}.webp`;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.preload = 'none';
  video.tabIndex = -1;
  video.setAttribute('aria-hidden', 'true');
  video.addEventListener('error', () => {
    previewObserver.unobserve(video);
    visiblePreviews.delete(video);
    button.querySelector('.video-card-label')?.remove();
    video.remove();
  }, {once: true});
  button.querySelector('img').after(video);
  previewObserver.observe(video);
}

function renderCards(category = 'all') {
  grid.querySelectorAll('.motion-preview').forEach(video => {
    video.pause();
    previewObserver.unobserve(video);
    visiblePreviews.delete(video);
  });
  const visible = desserts.filter(item => category === 'all' || item.category === category);
  grid.replaceChildren(...visible.map(item => {
    const index = desserts.indexOf(item);
    const card = document.createElement('article');
    card.className = 'dessert-card';
    card.innerHTML = `<button class="card-visual" data-open="${item.id}" aria-label="Рассмотреть десерт ${item.name}"><img src="./assets/${item.id}.webp" alt="${item.alt}" width="1536" height="1024" loading="lazy"><span class="card-number" aria-hidden="true">0${index + 1}</span>${videoSources[item.id] ? '<span class="video-card-label">▶ Живое раскрытие</span>' : ''}<span class="card-expand" aria-hidden="true">↗</span></button><div class="card-text"><p class="card-kicker">${item.categoryLabel}</p><h3 class="card-title">${item.name}</h3><p class="card-description">${item.note}</p><div class="card-bottom"><span>Корпусный десерт</span><button class="text-button" data-open="${item.id}">Что внутри <span aria-hidden="true">↗</span></button></div></div>`;
    return card;
  }));
  grid.querySelectorAll('.card-visual').forEach(button => addMotionPreview(button, button.dataset.open));
  document.querySelector('#result-count').textContent = `${visible.length} ${visible.length === 1 ? 'десерт' : visible.length < 5 ? 'десерта' : 'десертов'}`;
}

function stopVideo() {
  detailVideo.pause();
  detailVideo.hidden = true;
  detailVideo.removeAttribute('src');
  detailVideo.load();
  detailImage.hidden = false;
  videoToggle.classList.remove('playing');
  videoToggle.innerHTML = '<span aria-hidden="true">▶</span> Смотреть раскрытие';
}

function showDessert(index) {
  stopVideo();
  activeIndex = (index + desserts.length) % desserts.length;
  const item = desserts[activeIndex];
  detailImage.src = `./assets/${item.id}.webp`;
  detailImage.alt = item.alt;
  detailVideo.poster = detailImage.src;
  document.querySelector('#detail-category').textContent = item.categoryLabel;
  document.querySelector('#detail-title').textContent = item.name;
  document.querySelector('#detail-description').textContent = item.description;
  const layers = item.layers.map(text => { const li = document.createElement('li'); li.textContent = text; return li; });
  document.querySelector('#detail-layers').replaceChildren(...layers);
  document.querySelector('#detail-index').textContent = `0${activeIndex + 1} / 0${desserts.length}`;
  videoToggle.hidden = !videoSources[item.id];
  videoToggle.disabled = false;
  if (dialog.open && motionEnabled && videoSources[item.id]) playDetail();
}

async function playDetail() {
  const source = videoSources[desserts[activeIndex].id];
  if (!source) return;
  detailVideo.src = source;
  detailVideo.muted = true;
  detailVideo.hidden = false;
  detailImage.hidden = true;
  videoToggle.classList.add('playing');
  videoToggle.innerHTML = '<span aria-hidden="true">↶</span> Вернуться к фото';
  try { await detailVideo.play(); } catch { /* Native controls allow explicit playback. */ }
}

document.addEventListener('click', event => {
  const openButton = event.target.closest('[data-open]');
  if (openButton) {
    const index = desserts.findIndex(item => item.id === openButton.dataset.open);
    if (index < 0) return;
    opener = openButton;
    showDessert(index);
    dialog.showModal();
    document.body.classList.add('dialog-open');
    syncMotion();
    if (motionEnabled && videoSources[desserts[index].id]) playDetail();
    document.querySelector('#close-dialog').focus();
  }
  const filter = event.target.closest('[data-filter]');
  if (filter) {
    document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button === filter)));
    renderCards(filter.dataset.filter);
  }
});

document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
document.querySelector('#previous-dessert').addEventListener('click', () => showDessert(activeIndex - 1));
document.querySelector('#next-dessert').addEventListener('click', () => showDessert(activeIndex + 1));
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const box = dialog.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  stopVideo();
  document.body.classList.remove('dialog-open');
  syncMotion();
  opener?.focus();
});
dialog.addEventListener('keydown', event => {
  if (event.target === detailVideo) return;
  if (event.key === 'ArrowRight') { event.preventDefault(); showDessert(activeIndex + 1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); showDessert(activeIndex - 1); }
});
videoToggle.addEventListener('click', () => {
  if (!detailVideo.hidden) { stopVideo(); return; }
  playDetail();
});
detailVideo.addEventListener('error', () => {
  stopVideo();
  videoToggle.textContent = 'Видео временно недоступно';
  videoToggle.disabled = true;
});
motionToggle.addEventListener('click', () => { motionEnabled = !motionEnabled; syncMotion(); });
reducedMotion.addEventListener('change', () => { motionEnabled = !reducedMotion.matches; syncMotion(); });
document.addEventListener('visibilitychange', syncMotion);

addMotionPreview(document.querySelector('.hero-image-button'), 'raspberry');
renderCards();
syncMotion();
