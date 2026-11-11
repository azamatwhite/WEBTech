'use strict';

/**
 * Gallery Page Logic for Dastarkhan
 * Author: Miko
 */

function initGallery() {
    const galleryItems = [
        { id: 1, title: 'Oriental VIP Lounge', branch: 'dostyk', category: 'interior', img: 'images/interior/IMG_1160.jpg', desc: 'Authentic eastern tapchan with hand-carved wood.' },
        { id: 2, title: 'Main Wooden Hall', branch: 'dostyk', category: 'interior', img: 'images/interior/IMG_1161.jpg', desc: 'Spacious dining area with carved wooden tables.' },
        { id: 3, title: 'Mosaic Archway Corridor', branch: 'dostyk', category: 'interior', img: 'images/interior/IMG_1165.jpg', desc: 'Ornate oriental tile mosaic and arch design.' },
        { id: 4, title: 'Classic Dastarkhan Room', branch: 'dostyk', category: 'interior', img: 'images/interior/IMG_1157.jpg', desc: 'Cozy oriental curtains and authentic wall decor.' },
        { id: 5, title: 'Red Accent Dining Zone', branch: 'auezov', category: 'interior', img: 'images/interior/IMG_1170.jpg', desc: 'Modern table setting with red wall and blue glass.' },
        { id: 6, title: 'Banquet Hall Setup', branch: 'auezov', category: 'interior', img: 'images/interior/IMG_1171.jpg', desc: 'Large banquet arrangement with modern seating.' },
        { id: 7, title: 'Decorative Lighting Lounge', branch: 'auezov', category: 'interior', img: 'images/interior/IMG_1180.jpg', desc: 'Warm ambient pendant lamps and shelf accents.' },
        { id: 8, title: 'Panoramic Dining Area', branch: 'auezov', category: 'interior', img: 'images/interior/IMG_1179.jpg', desc: 'Comfortable red armchairs with panoramic windows.' }
    ];

    const targetSection = document.querySelector('main .container section:first-of-type') || document.querySelector('main .container');
    if (!targetSection) return;

    if (document.getElementById('galleryControlsBar')) return;

    let currentSort = 'default';

    // Панель управления с поиском, филиалами и кнопками сортировки
    const controlsWrapper = document.createElement('div');
    controlsWrapper.className = 'card p-3 shadow-sm mb-4 border-0';
    controlsWrapper.id = 'galleryControlsBar';
    controlsWrapper.innerHTML = `
        <div class="row g-3 align-items-center">
            <div class="col-12 col-md-4">
                <input type="text" id="gallerySearch" class="form-control" placeholder="Search photos by keyword...">
            </div>
            <div class="col-12 col-md-4">
                <select id="branchFilter" class="form-select">
                    <option value="all">All Branches (Dostyk & Auezov)</option>
                    <option value="dostyk">Dostyk Street, 1</option>
                    <option value="auezov">Mukhtar Auezov, 33</option>
                </select>
            </div>
            <div class="col-12 col-md-4 text-md-end">
                <span id="resultCount" class="fw-bold text-primary"></span>
            </div>
        </div>
        <div class="d-flex align-items-center gap-2 mt-3 pt-3 border-top flex-wrap">
            <span class="fw-bold me-1">Sort Photos:</span>
            <div class="btn-group btn-group-sm" id="gallerySortGroup" role="group">
                <button type="button" class="btn btn-outline-primary active" data-sort="default">Default</button>
                <button type="button" class="btn btn-outline-primary" data-sort="asc">Name (A-Z) ↑</button>
                <button type="button" class="btn btn-outline-primary" data-sort="desc">Name (Z-A) ↓</button>
            </div>
        </div>
    `;

    // Секция динамической сетки
    const dynamicSection = document.createElement('section');
    dynamicSection.className = 'my-4';
    dynamicSection.id = 'dynamicGallerySection';
    dynamicSection.innerHTML = `
        <h2 class="fs-3 fw-bold text-primary border-bottom pb-2 mb-4">Filtered Gallery Explorer</h2>
        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-3" id="dynamicPhotoGrid"></div>
    `;

    targetSection.before(controlsWrapper);
    targetSection.before(dynamicSection);

    const photoGrid = document.getElementById('dynamicPhotoGrid');
    const searchInput = document.getElementById('gallerySearch');
    const branchSelect = document.getElementById('branchFilter');
    const resultCount = document.getElementById('resultCount');

    // Плавный CSS-переход для эффекта fade
    photoGrid.style.transition = 'opacity 0.2s ease-in-out';

    function updateGallery(animate = true) {
        const updateDOM = () => {
            const query = searchInput.value.toLowerCase().trim();
            const selectedBranch = branchSelect.value;

            photoGrid.innerHTML = '';

            let filtered = galleryItems.filter(item => {
                const matchesQuery = item.title.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query);
                const matchesBranch = selectedBranch === 'all' || item.branch === selectedBranch;
                return matchesQuery && matchesBranch;
            });

            // Сортировка по выбранной кнопке
            if (currentSort === 'asc') {
                filtered.sort((a, b) => a.title.localeCompare(b.title));
            } else if (currentSort === 'desc') {
                filtered.sort((a, b) => b.title.localeCompare(a.title));
            }

            resultCount.textContent = `Showing ${filtered.length} photos`;

            if (filtered.length === 0) {
                const emptyState = document.createElement('div');
                emptyState.className = 'col-12 text-center py-5 text-muted';
                emptyState.innerHTML = `
                    <p class="fs-5 mb-2">No photos matched your criteria.</p>
                    <button class="btn btn-sm btn-outline-secondary" id="resetGalleryFilters">Reset Filters</button>
                `;
                photoGrid.appendChild(emptyState);

                document.getElementById('resetGalleryFilters').addEventListener('click', () => {
                    searchInput.value = '';
                    branchSelect.value = 'all';
                    currentSort = 'default';
                    controlsWrapper.querySelectorAll('#gallerySortGroup button').forEach(b => b.classList.remove('active'));
                    controlsWrapper.querySelector('#gallerySortGroup button[data-sort="default"]').classList.add('active');
                    updateGallery(true);
                });
            } else {
                filtered.forEach(item => {
                    const col = document.createElement('div');
                    col.className = 'col gallery-card-col';

                    const card = document.createElement('figure');
                    card.className = 'card h-100 shadow-sm overflow-hidden mb-0 border-0';

                    const img = document.createElement('img');
                    img.src = item.img;
                    img.alt = item.title;
                    img.className = 'card-img-top img-fluid object-fit-cover';
                    img.style.height = '180px';
                    img.loading = 'lazy';

                    const caption = document.createElement('figcaption');
                    caption.className = 'p-2 text-center small bg-white';

                    const titleStrong = document.createElement('strong');
                    titleStrong.className = 'd-block text-truncate';
                    titleStrong.textContent = item.title;

                    const descSpan = document.createElement('span');
                    descSpan.className = 'text-muted';
                    descSpan.textContent = item.desc;

                    caption.appendChild(titleStrong);
                    caption.appendChild(descSpan);
                    card.appendChild(img);
                    card.appendChild(caption);
                    col.appendChild(card);

                    photoGrid.appendChild(col);
                });
            }

            if (animate) {
                // Fade In (плавное появление)
                requestAnimationFrame(() => {
                    photoGrid.style.opacity = '1';
                });
            } else {
                photoGrid.style.opacity = '1';
            }
        };

        if (animate) {
            // Fade Out (плавное растворение)
            photoGrid.style.opacity = '0';
            setTimeout(updateDOM, 160);
        } else {
            updateDOM();
        }
    }

    // Обработка кнопок сортировки (Default, A-Z, Z-A) с запуском Fade
    controlsWrapper.querySelector('#gallerySortGroup').addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        controlsWrapper.querySelectorAll('#gallerySortGroup button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSort = btn.dataset.sort;
        updateGallery(true);
    });

    searchInput.addEventListener('input', () => updateGallery(true));
    branchSelect.addEventListener('change', () => updateGallery(true));

    photoGrid.addEventListener('click', (e) => {
        const cardCol = e.target.closest('.gallery-card-col');
        if (cardCol) {
            const fig = cardCol.querySelector('figure');
            if (fig) fig.classList.toggle('shadow-lg');
        }
    });

    updateGallery(false);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGallery);
} else {
    initGallery();
}