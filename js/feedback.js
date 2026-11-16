'use strict';

/**
 * Feedback Page Logic for Dastarkhan (100% Plain Vanilla JavaScript)
 * Author: Miko
 * Features: Large full-width cards, larger typography, card hover scale + photo hover zoom,
 * full-screen photo lightbox modal on click, unified Bootstrap validation, confirmation toast, sorting & filters.
 */

function initFeedbackPage() {
    const reviewsContainer = document.getElementById('reviews-list');
    const feedbackFormSection = document.getElementById('feedback-form-section');

    if (!reviewsContainer) return;

    const initialReviews = [
        {
            name: 'Tolqyn',
            rating: 5,
            text: 'Polished it off all by myself. Not bad, right?',
            date: '2026-09-01',
            avatar: 'images/fb/ass1.jpeg',
            photo: 'images/fb/fb_ima2.jpg'
        },
        {
            name: 'Dana',
            rating: 5,
            text: 'I kissed the hands of the chef who prepared this—tears even welled up in my eyes.',
            date: '2026-09-04',
            avatar: 'images/fb/ass2.jpeg',
            photo: 'images/fb/fb_ima4.jpg'
        },
        {
            name: 'Toty',
            rating: 4,
            text: 'That lamp is flickering in a strange way. I hope it’s not what I think it is—cause, the food here is truly delicious!',
            date: '2026-09-07',
            avatar: 'images/fb/ass3.jpeg',
            photo: 'images/interior/IMG_1164.JPG'
        },
        {
            name: 'Arman',
            rating: 5,
            text: 'I went on a date with a girl—and the lagman was so delicious, I was absolutely blown away by the flavor—but otherwise, it was just a standard date.',
            date: '2026-09-10',
            avatar: 'images/fb/ass4.jpeg',
            photo: 'images/fb/fb_ima3.jpg'
        },
        {
            name: 'Alikhan',
            rating: 2,
            text: 'Came for a date, left with a wife.',
            date: '2026-09-12',
            avatar: 'images/fb/ass5.jpeg',
            photo: 'images/fb/fb_ima1.jpg'
        }
    ];

    let reviewsData = [...initialReviews];
    let activeRating = 'all';
    let currentSort = 'newest';

    const listRow = reviewsContainer.querySelector('.row');
    if (!listRow) return;

    listRow.className = 'row g-4 my-3';
    listRow.style.transition = 'opacity 0.2s ease-in-out';

    // Dynamic Full-Screen Lightbox Modal for Review Photos (created via DOM to respect HTML/CSS Freeze)
    let zoomModal = document.getElementById('feedbackZoomModal');
    if (!zoomModal) {
        zoomModal = document.createElement('div');
        zoomModal.id = 'feedbackZoomModal';
        zoomModal.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 1060; display: none; align-items: center; justify-content: center; padding: 1rem; opacity: 0; transition: opacity 0.2s ease;';
        zoomModal.innerHTML = `
            <div class="position-relative text-center" style="max-width: 900px; width: 100%;">
                <button type="button" id="closeFeedbackZoomBtn" class="btn-close btn-close-white position-absolute top-0 end-0 m-2 p-2 bg-dark rounded-circle" aria-label="Close"></button>
                <img id="feedbackZoomedImg" src="" alt="" class="img-fluid rounded shadow-lg" style="max-height: 78vh; object-fit: contain;">
                <div class="mt-3 text-white">
                    <h4 id="feedbackZoomedAuthor" class="h4 mb-1"></h4>
                    <p id="feedbackZoomedText" class="fs-6 text-light opacity-75 mb-0"></p>
                </div>
            </div>
        `;
        document.body.appendChild(zoomModal);
    }

    function openPhotoZoom(src, author, date, text) {
        document.getElementById('feedbackZoomedImg').src = src;
        document.getElementById('feedbackZoomedImg').alt = `Photo by ${author}`;
        document.getElementById('feedbackZoomedAuthor').textContent = `${author} • ${date}`;
        document.getElementById('feedbackZoomedText').textContent = `"${text}"`;

        zoomModal.style.display = 'flex';
        requestAnimationFrame(() => {
            zoomModal.style.opacity = '1';
        });
    }

    function closePhotoZoom() {
        zoomModal.style.opacity = '0';
        setTimeout(() => {
            zoomModal.style.display = 'none';
        }, 200);
    }

    zoomModal.addEventListener('click', (e) => {
        if (e.target.id === 'feedbackZoomModal' || e.target.closest('#closeFeedbackZoomBtn')) {
            closePhotoZoom();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && zoomModal.style.display === 'flex') {
            closePhotoZoom();
        }
    });

    function calculateStatistics(dataset) {
        if (!dataset || dataset.length === 0) {
            return { totalCount: 0, averageRating: '0.0' };
        }
        const sumRating = dataset.reduce((acc, curr) => acc + curr.rating, 0);
        const avg = (sumRating / dataset.length).toFixed(1);
        return {
            totalCount: dataset.length,
            averageRating: avg
        };
    }

    if (!document.getElementById('feedbackStatsCard')) {
        const statsCard = document.createElement('div');
        statsCard.className = 'card bg-light p-3 shadow-sm mb-4 border-0';
        statsCard.id = 'feedbackStatsCard';
        statsCard.innerHTML = `
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div>
                    <span class="text-muted small d-block">Community Reputation</span>
                    <strong class="fs-5 text-dark" id="statsAverageRating">★ 0.0 / 5.0</strong>
                </div>
                <div>
                    <span class="text-muted small d-block">Verified Experiences</span>
                    <span class="badge bg-primary px-3 py-2" id="statsTotalCount">0 Reviews</span>
                </div>
            </div>
        `;
        listRow.before(statsCard);
    }

    function updateStatsDisplay() {
        const stats = calculateStatistics(reviewsData);
        const avgElem = document.getElementById('statsAverageRating');
        const countElem = document.getElementById('statsTotalCount');
        if (avgElem) avgElem.textContent = `★ ${stats.averageRating} / 5.0`;
        if (countElem) countElem.textContent = `${stats.totalCount} Reviews Total`;
    }

    function createReviewCard(review) {
        const col = document.createElement('div');
        col.className = 'col-12 review-item';

        const card = document.createElement('article');
        card.className = 'card p-4 p-md-5 shadow-sm border-0';
        card.style.cssText = 'transition: transform 0.25s ease, box-shadow 0.25s ease;';

        // Top header row: Avatar + Larger Name + Rating (left) and Date (right opposite corner)
        const headerDiv = document.createElement('div');
        headerDiv.className = 'd-flex justify-content-between align-items-center flex-wrap gap-2 mb-4 pb-3 border-bottom';

        const leftHeader = document.createElement('div');
        leftHeader.className = 'd-flex align-items-center gap-3';

        const avatarImg = document.createElement('img');
        avatarImg.src = review.avatar || 'images/fb/ass1.jpeg';
        avatarImg.alt = `${review.name} avatar`;
        avatarImg.className = 'rounded-circle border border-2 border-warning object-fit-cover';
        avatarImg.width = 56;
        avatarImg.height = 56;

        const h3 = document.createElement('h3');
        h3.className = 'h4 mb-0 d-flex align-items-center fw-bold';
        h3.textContent = review.name;

        const ratingSpan = document.createElement('span');
        ratingSpan.className = 'badge bg-warning text-dark ms-3 fs-6';
        ratingSpan.textContent = `★ ${review.rating}`;

        h3.appendChild(ratingSpan);
        leftHeader.appendChild(avatarImg);
        leftHeader.appendChild(h3);

        const rightHeader = document.createElement('div');
        rightHeader.className = 'text-end text-body-secondary';

        const timeElem = document.createElement('time');
        timeElem.dateTime = review.date;
        timeElem.className = 'fw-semibold fs-6';
        timeElem.textContent = review.date;

        rightHeader.appendChild(timeElem);

        headerDiv.appendChild(leftHeader);
        headerDiv.appendChild(rightHeader);

        // Main card body: Photo and Larger Comment side by side on the same line
        const bodyDiv = document.createElement('div');
        bodyDiv.className = 'd-flex align-items-center gap-4 flex-column flex-sm-row';

        let photoImg = null;
        if (review.photo) {
            const photoWrap = document.createElement('div');
            photoWrap.className = 'rounded border shadow-sm overflow-hidden flex-shrink-0';
            photoWrap.style.cssText = 'width: 145px; height: 145px; cursor: zoom-in;';
            photoWrap.title = 'Click to zoom photo';

            photoImg = document.createElement('img');
            photoImg.src = review.photo;
            photoImg.alt = `Review photo by ${review.name}`;
            photoImg.className = 'w-100 h-100 object-fit-cover';
            photoImg.style.transition = 'transform 0.3s ease';

            photoWrap.appendChild(photoImg);
            bodyDiv.appendChild(photoWrap);

            // Click on review photo opens full-screen lightbox zoom
            photoWrap.addEventListener('click', (e) => {
                e.stopPropagation();
                openPhotoZoom(review.photo, review.name, review.date, review.text);
            });
        }

        const pText = document.createElement('p');
        pText.className = 'card-text mb-0 flex-grow-1';
        const q = document.createElement('q');
        q.className = 'fst-italic text-dark fs-5 lh-base';
        q.textContent = review.text;
        pText.appendChild(q);

        bodyDiv.appendChild(pText);

        card.appendChild(headerDiv);
        card.appendChild(bodyDiv);
        col.appendChild(card);

        // Hover zoom effect on the whole review card & inner image (like gallery)
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'scale(1.015)';
            card.classList.remove('shadow-sm');
            card.classList.add('shadow');
            if (photoImg) {
                photoImg.style.transform = 'scale(1.07)';
            }
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'scale(1)';
            card.classList.remove('shadow');
            card.classList.add('shadow-sm');
            if (photoImg) {
                photoImg.style.transform = 'scale(1)';
            }
        });

        return col;
    }

    function renderReviews(animate = true) {
        const updateDOM = () => {
            listRow.innerHTML = '';

            let filtered = activeRating === 'all'
                ? [...reviewsData]
                : reviewsData.filter(r => r.rating === parseInt(activeRating, 10));

            if (currentSort === 'newest') {
                filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
            } else if (currentSort === 'oldest') {
                filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
            } else if (currentSort === 'rating-desc') {
                filtered.sort((a, b) => b.rating - a.rating);
            } else if (currentSort === 'rating-asc') {
                filtered.sort((a, b) => a.rating - b.rating);
            }

            if (filtered.length === 0) {
                const emptyDiv = document.createElement('div');
                emptyDiv.className = 'col-12 text-center py-4 text-muted fs-5';
                emptyDiv.textContent = 'No reviews found for this rating filter.';
                listRow.appendChild(emptyDiv);
            } else {
                filtered.forEach(review => {
                    listRow.appendChild(createReviewCard(review));
                });
            }

            if (animate) {
                requestAnimationFrame(() => {
                    listRow.style.opacity = '1';
                });
            } else {
                listRow.style.opacity = '1';
            }
        };

        if (animate) {
            listRow.style.opacity = '0';
            setTimeout(updateDOM, 180);
        } else {
            updateDOM();
        }
    }

    if (!document.getElementById('reviewsControlsPanel')) {
        const controlsBar = document.createElement('div');
        controlsBar.className = 'card p-3 shadow-sm mb-4 border-0';
        controlsBar.id = 'reviewsControlsPanel';
        controlsBar.innerHTML = `
            <div class="d-flex flex-column flex-md-row gap-3 justify-content-between align-items-md-center">
                <div class="d-flex align-items-center gap-2 flex-wrap">
                    <span class="fw-bold me-1">Filter by Rating:</span>
                    <div class="btn-group btn-group-sm" role="group" id="btnGroupRatings"></div>
                </div>
                <div class="d-flex align-items-center gap-2 flex-wrap">
                    <span class="fw-bold me-1">Sort:</span>
                    <div class="btn-group btn-group-sm" role="group" id="btnGroupSorting">
                        <button type="button" class="btn btn-outline-primary active" data-sort="newest">Newest</button>
                        <button type="button" class="btn btn-outline-primary" data-sort="oldest">Oldest</button>
                        <button type="button" class="btn btn-outline-primary" data-sort="rating-desc">Rating High ↑</button>
                        <button type="button" class="btn btn-outline-primary" data-sort="rating-asc">Rating Low ↓</button>
                    </div>
                </div>
            </div>
        `;

        listRow.before(controlsBar);

        controlsBar.querySelector('#btnGroupSorting').addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            controlsBar.querySelectorAll('#btnGroupSorting button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSort = btn.dataset.sort;
            renderReviews(true);
        });

        controlsBar.querySelector('#btnGroupRatings').addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            controlsBar.querySelectorAll('#btnGroupRatings button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeRating = btn.dataset.rating;
            renderReviews(true);
        });
    }

    function buildFilterButtons() {
        const btnGroup = document.getElementById('btnGroupRatings');
        if (!btnGroup) return;
        btnGroup.innerHTML = '';

        const availableRatings = [...new Set(reviewsData.map(r => r.rating))].sort((a, b) => b - a);
        const allOptions = ['all', ...availableRatings];

        allOptions.forEach(rating => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `btn btn-outline-primary ${String(activeRating) === String(rating) ? 'active' : ''}`;
            btn.dataset.rating = rating;
            btn.textContent = rating === 'all' ? 'All' : `${rating} ★`;
            btnGroup.appendChild(btn);
        });
    }

    buildFilterButtons();
    updateStatsDisplay();
    renderReviews(false);

    const reviewTextarea = document.getElementById('review-text');
    if (reviewTextarea && !document.getElementById('char-counter')) {
        const counter = document.createElement('small');
        counter.id = 'char-counter';
        counter.className = 'text-muted d-block mt-1';
        counter.textContent = '0 / 500 characters';
        reviewTextarea.after(counter);

        reviewTextarea.addEventListener('input', () => {
            const len = reviewTextarea.value.length;
            counter.textContent = `${len} / 500 characters`;
            if (len > 500) {
                counter.classList.add('text-danger');
            } else {
                counter.classList.remove('text-danger');
            }
        });
    }

    function showReviewAddedNotification(userName) {
        const existingToast = document.getElementById('reviewAddedToast');
        if (existingToast) existingToast.remove();

        const toastDiv = document.createElement('div');
        toastDiv.id = 'reviewAddedToast';
        toastDiv.className = 'alert alert-success alert-dismissible fade show shadow-sm mb-4 border-start border-4 border-success';
        toastDiv.setAttribute('role', 'alert');
        toastDiv.innerHTML = `
            <strong>Review Added Successfully!</strong> Thank you, <b>${userName}</b> — your review has been published below.
            <button type="button" class="btn-close" aria-label="Close"></button>
        `;

        toastDiv.querySelector('.btn-close').addEventListener('click', () => {
            toastDiv.remove();
        });

        listRow.before(toastDiv);
    }

    if (feedbackFormSection) {
        const form = feedbackFormSection.querySelector('form');
        if (form) {
            form.setAttribute('novalidate', 'true');

            const clearFieldError = (target) => {
                if (target.classList.contains('is-invalid')) {
                    target.classList.remove('is-invalid');
                    const container = target.closest('.mb-3') || target.closest('.form-check') || target.parentElement;
                    const err = container.querySelector('.invalid-feedback');
                    if (err) err.remove();
                }
            };

            form.addEventListener('input', (e) => clearFieldError(e.target));
            form.addEventListener('change', (e) => clearFieldError(e.target));

            form.addEventListener('submit', (event) => {
                event.preventDefault();

                const nameInput = document.getElementById('user-name');
                const phoneInput = document.getElementById('user-phone');
                const dateInput = document.getElementById('visit-date');
                const ratingInput = document.getElementById('service-rating');
                const textInput = document.getElementById('review-text');
                const consentBox = document.getElementById('consent');

                let isValid = true;
                let firstInvalid = null;

                form.querySelectorAll('.invalid-feedback').forEach(el => el.remove());
                form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

                const showError = (field, message) => {
                    isValid = false;
                    field.classList.add('is-invalid');
                    const errDiv = document.createElement('div');
                    errDiv.className = 'invalid-feedback d-block fw-medium mt-1';
                    errDiv.textContent = message;
                    const container = field.closest('.mb-3') || field.closest('.form-check') || field.parentElement;
                    container.appendChild(errDiv);
                    if (!firstInvalid) firstInvalid = field;
                };

                const nameVal = nameInput.value.trim();
                if (nameVal.length < 2) {
                    showError(nameInput, 'Validation Error: Please enter your full name (at least 2 characters).');
                }

                const phoneVal = phoneInput.value.trim();
                const kzPhoneRegex = /^(\+7\s?\(\d{3}\)\s?\d{3}-\d{2}-\d{2}|\+7\d{10})$/;
                if (phoneVal !== '' && !kzPhoneRegex.test(phoneVal)) {
                    showError(phoneInput, 'Invalid Phone Format: Please enter as +7 (700) 000-00-00 or +77000000000.');
                }

                const dateVal = dateInput.value;
                if (!dateVal) {
                    showError(dateInput, 'Validation Error: Please select your visit date.');
                } else {
                    const selectedDate = new Date(dateVal);
                    const today = new Date();
                    today.setHours(23, 59, 59, 999);
                    if (selectedDate > today) {
                        showError(dateInput, 'Invalid Date: Visit date cannot be in the future.');
                    }
                }

                const ratingRaw = ratingInput.value.trim();
                const ratingVal = Number(ratingRaw);
                if (ratingRaw === '' || !Number.isInteger(ratingVal) || ratingVal < 1 || ratingVal > 5) {
                    showError(ratingInput, 'Invalid Rating: Please enter a whole number between 1 and 5.');
                }

                const textVal = textInput.value.trim();
                if (textVal.length < 10) {
                    showError(textInput, 'Validation Error: Review comment must be at least 10 characters long.');
                } else if (textVal.length > 500) {
                    showError(textInput, 'Validation Error: Review exceeds the 500-character limit.');
                }

                if (!consentBox.checked) {
                    showError(consentBox, 'Required: You must consent to publishing your review.');
                }

                if (!isValid) {
                    if (firstInvalid) firstInvalid.focus();
                    return;
                }

                const newReview = {
                    name: nameVal,
                    rating: ratingVal,
                    text: textVal,
                    date: dateVal,
                    avatar: 'images/fb/ass1.jpeg',
                    photo: ''
                };

                reviewsData.unshift(newReview);
                activeRating = 'all';
                buildFilterButtons();
                updateStatsDisplay();
                renderReviews(true);

                showReviewAddedNotification(nameVal);
                reviewsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

                form.reset();
                const counter = document.getElementById('char-counter');
                if (counter) counter.textContent = '0 / 500 characters';
            });
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFeedbackPage);
} else {
    initFeedbackPage();
}