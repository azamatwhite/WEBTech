'use strict';

/**
 * Feedback Page Logic for Dastarkhan
 * Author: Miko
 */

function initFeedback() {
    const reviewsContainer = document.getElementById('reviews-list');
    const feedbackFormSection = document.getElementById('feedback-form-section');

    if (!reviewsContainer) return;

    const initialReviews = [
        {
            id: 'REV-101',
            name: 'Tolqyn',
            rating: 5,
            text: 'Polished it off all by myself. Not bad, right?',
            date: '2026-09-01',
            avatar: 'images/fb/ass1.jpeg',
            photo: 'images/fb/fb_ima2.jpg'
        },
        {
            id: 'REV-102',
            name: 'Dana',
            rating: 5,
            text: 'I kissed the hands of the chef who prepared this—tears even welled up in my eyes.',
            date: '2026-09-04',
            avatar: 'images/fb/ass2.jpeg',
            photo: 'images/fb/fb_ima4.jpg'
        },
        {
            id: 'REV-103',
            name: 'Toty',
            rating: 4,
            text: 'That lamp is flickering in a strange way. I hope it’s not what I think it is—cause, the food here is truly delicious!',
            date: '2026-09-07',
            avatar: 'images/fb/ass3.jpeg',
            photo: 'images/interior/IMG_1164.JPG'
        },
        {
            id: 'REV-104',
            name: 'Arman',
            rating: 5,
            text: 'I went on a date with a girl—and the lagman was so delicious, I was absolutely blown away by the flavor—but otherwise, it was just a standard date.',
            date: '2026-09-10',
            avatar: 'images/fb/ass4.jpeg',
            photo: 'images/fb/fb_ima3.jpg'
        },
        {
            id: 'REV-105',
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

    // Включаем поддержку плавного растворения/проявления
    listRow.style.transition = 'opacity 0.2s ease-in-out';

    function createReviewCard(review) {
        const col = document.createElement('div');
        col.className = 'col-12 col-md-6 review-item';

        const card = document.createElement('article');
        card.className = 'card p-4 shadow-sm h-100 border-0';

        const headerDiv = document.createElement('div');
        headerDiv.className = 'd-flex align-items-center gap-3 mb-3';

        const avatarImg = document.createElement('img');
        avatarImg.src = review.avatar || 'images/fb/ass1.jpeg';
        avatarImg.alt = `${review.name} avatar`;
        avatarImg.className = 'rounded-circle border border-2 border-warning object-fit-cover';
        avatarImg.width = 50;
        avatarImg.height = 50;

        const nameGroup = document.createElement('div');
        const h3 = document.createElement('h3');
        h3.className = 'h5 mb-0';
        h3.textContent = review.name;

        const ratingSpan = document.createElement('span');
        ratingSpan.className = 'badge bg-warning text-dark ms-2';
        ratingSpan.textContent = `★ ${review.rating}`;

        h3.appendChild(ratingSpan);
        nameGroup.appendChild(h3);
        headerDiv.appendChild(avatarImg);
        headerDiv.appendChild(nameGroup);

        let photoDiv = null;
        if (review.photo) {
            photoDiv = document.createElement('div');
            photoDiv.className = 'mb-3';
            const photoImg = document.createElement('img');
            photoImg.src = review.photo;
            photoImg.alt = `Review photo by ${review.name}`;
            photoImg.className = 'rounded border object-fit-cover shadow-sm';
            photoImg.width = 120;
            photoImg.height = 120;
            photoDiv.appendChild(photoImg);
        }

        const pText = document.createElement('p');
        pText.className = 'card-text';
        const q = document.createElement('q');
        q.className = 'fst-italic text-muted';
        q.textContent = review.text;
        pText.appendChild(q);

        const pDate = document.createElement('p');
        pDate.className = 'small text-body-secondary mt-auto mb-0 d-flex justify-content-between';
        
        const timeElem = document.createElement('time');
        timeElem.dateTime = review.date;
        timeElem.textContent = review.date;

        const refSpan = document.createElement('span');
        refSpan.className = 'text-muted';
        refSpan.textContent = review.id;

        pDate.appendChild(timeElem);
        pDate.appendChild(refSpan);

        card.appendChild(headerDiv);
        if (photoDiv) card.appendChild(photoDiv);
        card.appendChild(pText);
        card.appendChild(pDate);
        col.appendChild(card);

        return col;
    }

    // Отрисовка с эффектом Fade
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
                emptyDiv.className = 'col-12 text-center py-4 text-muted';
                emptyDiv.textContent = 'No reviews found for this filter.';
                listRow.appendChild(emptyDiv);
            } else {
                filtered.forEach(review => {
                    listRow.appendChild(createReviewCard(review));
                });
            }

            if (animate) {
                // Плавный Fade In (появление)
                requestAnimationFrame(() => {
                    listRow.style.opacity = '1';
                });
            } else {
                listRow.style.opacity = '1';
            }
        };

        if (animate) {
            // Плавный Fade Out (растворение)
            listRow.style.opacity = '0';
            setTimeout(updateDOM, 180);
        } else {
            updateDOM();
        }
    }

    // Создание панели управления (Фильтры + Сортировка)
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

        // Клик по кнопкам сортировки с запуском Fade
        controlsBar.querySelector('#btnGroupSorting').addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            controlsBar.querySelectorAll('#btnGroupSorting button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSort = btn.dataset.sort;
            renderReviews(true);
        });

        // Клик по кнопкам рейтинга с запуском Fade
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
            if (rating < 5) {
                showError(btn, 'Only ratings of 5 are currently available for filtering.');
            }
        });
    }

    buildFilterButtons();
    renderReviews(false);

    // Счётчик символов для textarea
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

    // Валидация и отправка формы
    if (feedbackFormSection) {
        const form = feedbackFormSection.querySelector('form');
        if (form) {
            form.addEventListener('input', (e) => {
                if (e.target.classList.contains('is-invalid')) {
                    e.target.classList.remove('is-invalid');
                    const err = e.target.nextElementSibling;
                    if (err && err.classList.contains('invalid-feedback')) err.remove();
                }
            });

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
                    errDiv.className = 'invalid-feedback d-block';
                    errDiv.textContent = message;
                    field.after(errDiv);
                    if (!firstInvalid) firstInvalid = field;
                };

                const nameVal = nameInput.value.trim();
                if (nameVal.length < 2) {
                    showError(nameInput, 'Please enter a valid full name (at least 2 characters).');
                }

                const phoneVal = phoneInput.value.trim();
                const phoneRegEx = /^\+7\d{10}$/;
                if (phoneVal !== '' && !phoneRegEx.test(phoneVal)) {
                    showError(phoneInput, 'Format must be +7 (700) 000-00-00.');
                }

                const dateVal = dateInput.value;
                if (!dateVal) {
                    showError(dateInput, 'Please select a visit date.');
                } else {
                    const selectedDate = new Date(dateVal);
                    if (selectedDate > new Date()) {
                        showError(dateInput, 'Visit date cannot be in the future.');
                    }
                }

                const textVal = textInput.value.trim();
                if (textVal.length < 10) {
                    showError(textInput, 'Review comment must be at least 10 characters long.');
                }

                if (!consentBox.checked) {
                    showError(consentBox.parentElement, 'You must consent to publishing your review.');
                }

                if (!isValid) {
                    if (firstInvalid) firstInvalid.focus();
                    return;
                }

                const refCode = `REV-${Math.floor(1000 + Math.random() * 9000)}`;

                const newReview = {
                    id: refCode,
                    name: nameVal,
                    rating: parseInt(ratingInput.value, 10),
                    text: textVal,
                    date: dateVal,
                    avatar: 'images/fb/ass1.jpeg',
                    photo: ''
                };

                reviewsData.unshift(newReview);
                buildFilterButtons();
                renderReviews(true);

                const alertDiv = document.createElement('div');
                alertDiv.className = 'alert alert-success mt-4 shadow-sm';
                alertDiv.innerHTML = `
                    <h4 class="alert-heading h5">Thank You, ${nameVal}!</h4>
                    <p class="mb-1">Your feedback has been successfully recorded under Reference <strong>${refCode}</strong>.</p>
                    <small class="text-muted d-block mt-2">* Demonstration Mode: No data was transmitted to a remote backend server.</small>
                `;

                form.reset();
                form.replaceWith(alertDiv);
            });
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFeedback);
} else {
    initFeedback();
}