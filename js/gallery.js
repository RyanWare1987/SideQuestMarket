/**
 * Gallery - May 2026
 * Images served from S3: s3://side-quest-market/media/may2026/<category>/
 *
 * TO ADD IMAGES: add filenames to the arrays below for each category.
 * The S3 base path is set in S3_BASE.
 */

const S3_BASE = 'https://side-quest-market.s3.eu-west-2.amazonaws.com/media/may2026';

const CATEGORIES = {
  contest: {
    label: 'Competition',
    images: [
      'SQM_May2026_Winners.jpg',
      ...Array.from({length: 3}, (_, i) => `SQM_May2026_Winners_${i + 2}.jpg`)
    ]
  },
  miniatures: {
    label: 'Miniatures',
    images: [
      'SQM_May2026_MiniaturesComp.jpg',
      ...Array.from({length: 64}, (_, i) => `SQM_May2026_MiniaturesComp_${i + 2}.jpg`)
    ]
  },
  portrait: {
    label: 'Portraits',
    images: [
      'SQM_May2026_Portrait.jpg',
      ...Array.from({length: 13}, (_, i) => `SQM_May2026_Portrait_${i + 2}.jpg`)
    ]
  },
  'scenes-l': {
    label: 'Scenes (Landscape)',
    images: [
      'SQM_May2026_Scenes_L.jpg',
      ...Array.from({length: 48}, (_, i) => `SQM_May2026_Scenes_L_${i + 2}.jpg`)
    ]
  },
  'scenes-p': {
    label: 'Scenes (Portrait)',
    images: [
      'SQM_May2026_Scenes_P.jpg',
      ...Array.from({length: 215}, (_, i) => `SQM_May2026_Scenes_P_${i + 2}.jpg`)
    ]
  },
  stallfronts: {
    label: 'Stall Fronts',
    images: [
      'SQM_May2026_Stallfront.jpg',
      ...Array.from({length: 27}, (_, i) => `SQM_May2026_Stallfront_${i + 2}.jpg`)
    ]
  }
};

// ── Build flat list of all images with category metadata ──────────────────────
let allImages = [];
Object.entries(CATEGORIES).forEach(([cat, data]) => {
  data.images.forEach(filename => {
    allImages.push({
      src: `${S3_BASE}/${cat}/${filename}`,
      category: cat,
      categoryLabel: data.label,
      alt: `${data.label} photo from Side Quest Market May 2026`
    });
  });
});

// ── State ─────────────────────────────────────────────────────────────────────
let activeCategory = 'all';
let visibleImages = [];
let lightboxIndex = 0;

// ── DOM refs ──────────────────────────────────────────────────────────────────
const grid        = document.getElementById('galleryGrid');
const emptyMsg    = document.getElementById('galleryEmpty');
const lightbox    = document.getElementById('lightbox');
const lbImg       = document.getElementById('lightboxImg');
const lbCaption   = document.getElementById('lightboxCaption');
const lbClose     = document.getElementById('lightboxClose');
const lbPrev      = document.getElementById('lightboxPrev');
const lbNext      = document.getElementById('lightboxNext');
const lbOverlay   = document.getElementById('lightboxOverlay');
const filterBtns  = document.querySelectorAll('.filter-btn');

// ── Render grid ───────────────────────────────────────────────────────────────
function renderGrid() {
  visibleImages = activeCategory === 'all'
    ? allImages
    : allImages.filter(img => img.category === activeCategory);

  grid.innerHTML = '';

  if (visibleImages.length === 0) {
    emptyMsg.hidden = false;
    return;
  }
  emptyMsg.hidden = true;

  visibleImages.forEach((img, index) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-label', `View ${img.alt}`);
    item.dataset.index = index;

    const thumb = document.createElement('img');
    thumb.src = img.src;
    thumb.alt = img.alt;
    thumb.loading = 'lazy';
    thumb.decoding = 'async';

    const overlay = document.createElement('div');
    overlay.className = 'gallery-item-overlay';
    const diceIcon = document.createElement('img');
    diceIcon.src = 'https://side-quest-market.s3.eu-west-2.amazonaws.com/assets/Dice/Dice-white.png';
    diceIcon.alt = '';
    diceIcon.className = 'gallery-item-zoom';
    diceIcon.setAttribute('aria-hidden', 'true');
    overlay.appendChild(diceIcon);

    item.appendChild(thumb);
    item.appendChild(overlay);
    grid.appendChild(item);

    item.addEventListener('click', () => openLightbox(index));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(index);
      }
    });
  });
}

// ── Filter ────────────────────────────────────────────────────────────────────
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCategory = btn.dataset.category;
    renderGrid();
  });
});

// ── Lightbox ──────────────────────────────────────────────────────────────────
function openLightbox(index) {
  lightboxIndex = index;
  updateLightbox();
  lightbox.setAttribute('aria-hidden', 'false');
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  lbClose.focus();
}

function closeLightbox() {
  lightbox.setAttribute('aria-hidden', 'true');
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function updateLightbox() {
  const img = visibleImages[lightboxIndex];
  lbImg.src = img.src;
  lbImg.alt = img.alt;
  lbCaption.textContent = `${img.categoryLabel} — Photo ${lightboxIndex + 1} of ${visibleImages.length}`;
  lbPrev.style.visibility = lightboxIndex > 0 ? 'visible' : 'hidden';
  lbNext.style.visibility = lightboxIndex < visibleImages.length - 1 ? 'visible' : 'hidden';
}

function prevImage() {
  if (lightboxIndex > 0) { lightboxIndex--; updateLightbox(); }
}

function nextImage() {
  if (lightboxIndex < visibleImages.length - 1) { lightboxIndex++; updateLightbox(); }
}

lbClose.addEventListener('click', closeLightbox);
lbOverlay.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', prevImage);
lbNext.addEventListener('click', nextImage);

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   prevImage();
  if (e.key === 'ArrowRight')  nextImage();
});

// Touch swipe support for lightbox
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', e => {
  const delta = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(delta) > 50) delta < 0 ? nextImage() : prevImage();
}, { passive: true });

// ── Init ──────────────────────────────────────────────────────────────────────
renderGrid();
