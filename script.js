const filterButtons = document.querySelectorAll('.filter-btn');
const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
const searchInput = document.getElementById('search-input');
const lightbox = document.getElementById('lightbox-modal');
const lightboxImg = document.getElementById('lightbox-img');
const modalTitle = document.getElementById('modal-title');
const modalCategory = document.getElementById('modal-category');
const imageCounter = document.getElementById('image-counter');
const thumbStrip = document.getElementById('thumb-strip');
const closeModal = document.querySelector('.close-modal');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

/**
 * State Variables
 */
let activeItems = [...galleryItems];
let currentIndex = 0;

// Initialize layout matching initial states
updateGalleryFilters();

/**
 * 1. Tokenized Search & Category Filter Engine
 * Splits text into standalone keywords to match titles, categories, and tags.
 */
function updateGalleryFilters() {
  const activeCategoryButton = document.querySelector('.filter-btn.active');
  const activeCategory = activeCategoryButton ? activeCategoryButton.getAttribute('data-target') : 'all';
  
  // Convert input into a cleaned array of unique keyword tokens
  const searchTokens = searchInput.value
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(token => token !== "");

  galleryItems.forEach(item => {
    const itemCategory = (item.getAttribute('data-category') || '').toLowerCase();
    const itemTitle = (item.getAttribute('data-title') || '').toLowerCase();
    const itemTags = (item.getAttribute('data-tags') || '').toLowerCase(); 

    // Category Rule validation
    const matchesCategory = (activeCategory === 'all' || itemCategory === activeCategory);
    
    // Search Rule validation (All typed words must find a partial match somewhere)
    const matchesSearch = searchTokens.every(token => 
      itemTitle.includes(token) || 
      itemCategory.includes(token) || 
      itemTags.includes(token)
    );

    // Visibility toggling via visibility class tracking
    if (matchesCategory && matchesSearch) {
      item.classList.remove('hidden');
    } else {
      item.classList.add('hidden');
    }
  });

  // Re-map the state array to contain only currently visible images
  activeItems = galleryItems.filter(item => !item.classList.contains('hidden'));
  
  // Real-time structural adjustments if the user types while the lightbox is active
  if (lightbox.style.display === 'flex') {
    buildThumbnails();
    if (activeItems.length > 0) {
      currentIndex = 0;
      updateLightboxContent();
    } else {
      lightbox.style.display = 'none';
    }
  }
}

/**
 * 2. Event Listeners Setup
 */
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const activeBtn = document.querySelector('.filter-btn.active');
    if (activeBtn) activeBtn.classList.remove('active');
    
    btn.classList.add('active');
    updateGalleryFilters();
  });
});

searchInput.addEventListener('input', updateGalleryFilters);

galleryItems.forEach(item => {
  item.addEventListener('click', () => {
    currentIndex = activeItems.indexOf(item);
    if (currentIndex !== -1) openLightbox();
  });
});

/**
 * 3. Lightbox Framework Layer
 */
function openLightbox() {
  buildThumbnails();
  updateLightboxContent();
  lightbox.style.display = 'flex';
}

function updateLightboxContent() {
  if (activeItems.length === 0) return;
  
  const currentItem = activeItems[currentIndex];
  lightboxImg.src = currentItem.querySelector('img').src;
  modalTitle.innerText = currentItem.getAttribute('data-title') || '';
  modalCategory.innerText = currentItem.getAttribute('data-category') || '';
  imageCounter.innerText = `${currentIndex + 1} / ${activeItems.length}`;

  // Update visual focus tracking indicator on the preview rail
  document.querySelectorAll('.thumb-item').forEach((thumb, idx) => {
    if (idx === currentIndex) {
      thumb.classList.add('active');
      // Slide the thumbnail cleanly into view if container overflows
      thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } else {
      thumb.classList.remove('active');
    }
  });
}

/**
 * 4. Micro-Thumbnail Rail Generation
 */
function buildThumbnails() {
  thumbStrip.innerHTML = '';
  
  activeItems.forEach((item, idx) => {
    const imgElement = document.createElement('img');
    imgElement.src = item.querySelector('img').src;
    imgElement.classList.add('thumb-item');
    imgElement.alt = `Preview micro-target ${idx + 1}`;
    
    imgElement.addEventListener('click', () => {
      currentIndex = idx;
      updateLightboxContent();
    });
    
    thumbStrip.appendChild(imgElement);
  });
}

/**
 * 5. Navigation Control System
 */
function nextImage() {
  if (activeItems.length === 0) return;
  currentIndex = (currentIndex + 1) % activeItems.length;
  updateLightboxContent();
}

function prevImage() {
  if (activeItems.length === 0) return;
  currentIndex = (currentIndex - 1 + activeItems.length) % activeItems.length;
  updateLightboxContent();
}

// Navigation event triggers
nextBtn.addEventListener('click', nextImage);
prevBtn.addEventListener('click', prevImage);
closeModal.addEventListener('click', () => lightbox.style.display = 'none');

// Close modal instantly on out-of-bounds clicks
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) lightbox.style.display = 'none';
});

/**
 * 6. Accessibility Layout Add-on
 * Maps hardware keyboard buttons to active UI components
 */
document.addEventListener('keydown', e => {
  if (lightbox.style.display !== 'flex') return;
  
  if (e.key === 'ArrowRight') nextImage();
  if (e.key === 'ArrowLeft') prevImage();
  if (e.key === 'Escape') lightbox.style.display = 'none';
});
