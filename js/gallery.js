'use strict';

/**
 * Gallery Page Logic for Dastarkhan
 * Author: Miko
 */

document.addEventListener('DOMContentLoaded', () => {
    const galleryCarousel = document.getElementById('galleryCarousel');
    if (!galleryCarousel) return;

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

    const galleryContainer = document.querySelector('main .container');
    if (!galleryContainer) return;

    // Controls Panel
    const controlsWrapper = document.createElement('div');
    controlsWrapper.className = 'card p-3 shadow-sm mb-4 border-0';

    const rowDiv = document.createElement('div');
    rowDiv.className = 'row g-3 align-items-center';

    const col1 = document.createElement('div');
    col1.className = 'col-12 col-md-4';
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'gallerySearch';
    searchInput.className = 'form-control';
    searchInput.placeholder = 'Search photos by keyword...';
    col1.appendChild(searchInput);

    const col2 = document.createElement('div');
    col2.className = 'col-12 col-md-4';
    const branchSelect = document.createElement('select');
    branchSelect.id = 'branchFilter';
    branchSelect.className = 'form-select';

    const optAll = document.createElement('option');
    optAll.value = 'all';
    optAll.textContent = 'All Branches (Dostyk & Auezov)';

    const optDostyk = document.createElement('option');
    optDostyk.value = 'dostyk';
    optDostyk.textContent = 'Dostyk Street, 1';

    const optAuezov = document.createElement('option');
    optAuezov.value = 'auezov';
    optAuezov.textContent = 'Mukhtar Auezov, 33';

    branchSelect.appendChild(optAll);
    branchSelect.appendChild(optDostyk);
    branchSelect.appendChild(optAuezov);
    col2.appendChild(branchSelect);

    const col3 = document.createElement('div');
    col3.className = 'col-12 col-md-4 text-md-end';
    const resultCount = document.createElement('span');
    resultCount.id = 'resultCount';
    resultCount.className = 'fw-bold text-primary';
    col3.appendChild(resultCount);

    rowDiv.appendChild(col1);
    rowDiv.appendChild(col2);
    rowDiv.appendChild(col3);
    controlsWrapper.appendChild(rowDiv);

    const firstSection = galleryContainer.querySelector('section');
    if (firstSection) {
        firstSection.before(controlsWrapper);
    }

    // Dynamic Photo Grid
    const dynamicGridSection = document.createElement('section');
    dynamicGridSection.className = 'my-4';

    const gridH2 = document.createElement('h2');
    gridH2.className = 'fs-3 fw-bold text-primary border-bottom pb-2 mb-4';
    gridH2.textContent = 'Filtered Gallery Explorer';

    const photoGrid = document.createElement('div');
    photoGrid.className = 'row row-cols-1 row-cols-sm-2 row-cols-md-4 g-3';
    photoGrid.id = 'dynamicPhotoGrid';

    dynamicGridSection.appendChild(gridH2);
    dynamicGridSection.appendChild(photoGrid);

    if (firstSection) {
        firstSection.before(dynamicGridSection);
    }

    function updateGallery() {
        const query = searchInput.value.toLowerCase().trim();
        const selectedBranch = branchSelect.value;

        photoGrid.textContent = '';

        const filtered = galleryItems.filter(item => {
            const matchesQuery = item.title.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query);
            const matchesBranch = selectedBranch === 'all' || item.branch === selectedBranch;
            return matchesQuery && matchesBranch;
        });

        resultCount.textContent = `Showing ${filtered.length} photos`;

        if (filtered.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'col-12 text-center py-5 text-muted';

            const emptyP = document.createElement('p');
            emptyP.className = 'fs-5 mb-2';
            emptyP.textContent = 'No photos matched your criteria.';

            const resetBtn = document.createElement('button');
            resetBtn.className = 'btn btn-sm btn-outline-secondary';
            resetBtn.textContent = 'Reset Filters';

            resetBtn.addEventListener('click', () => {
                searchInput.value = '';
                branchSelect.value = 'all';
                updateGallery();
            });

            emptyState.appendChild(emptyP);
            emptyState.appendChild(resetBtn);
            photoGrid.appendChild(emptyState);
            return;
        }

        filtered.forEach(item => {
            const col = document.createElement('div');
            col.className = 'col';

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

    searchInput.addEventListener('input', updateGallery);
    branchSelect.addEventListener('change', updateGallery);

    updateGallery();
});