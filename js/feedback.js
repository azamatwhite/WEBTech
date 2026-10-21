'use strict';

/**
 * Feedback Page Logic for Dastarkhan
 * Author: Miko
 */

document.addEventListener('DOMContentLoaded', () => {
    const reviewsContainer = document.getElementById('reviews-list');
    const feedbackFormSection = document.getElementById('feedback-form-section');

    if (!reviewsContainer || !feedbackFormSection) return;

    // Initial dataset
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

    // Card Renderer
    function createReviewCard(review) {
        const col = document.createElement('div');
        col.className = 'col-12 col-md-6';

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

    // Render List
    function renderReviews(filterRating = 'all') {
        const listRow = reviewsContainer.querySelector('.row');
        if (!listRow) return;

        listRow.textContent = '';

        const filtered = filterRating === 'all'
            ? reviewsData
            : reviewsData.filter(r => r.rating === parseInt(filterRating, 10));

        if (filtered.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'col-12 text-center py-4 text-muted';
            emptyDiv.textContent = 'No reviews found for this rating filter.';
            listRow.appendChild(emptyDiv);
            return;
        }

        filtered.forEach(review => {
            listRow.appendChild(createReviewCard(review));
        });
    }

    // Dynamic Filter Buttons
    const filterControlsDiv = document.createElement('div');
    filterControlsDiv.className = 'd-flex gap-2 mb-4 align-items-center flex-wrap';

    function renderFilterButtons() {
        filterControlsDiv.textContent = '';

        const spanLabel = document.createElement('span');
        spanLabel.className = 'fw-bold me-2';
        spanLabel.textContent = 'Filter by Rating:';
        filterControlsDiv.appendChild(spanLabel);

        const availableRatings = [...new Set(reviewsData.map(r => r.rating))].sort((a, b) => b - a);
        const filterOptions = ['all', ...availableRatings];

        filterOptions.forEach(rating => {
            const btn = document.createElement('button');
            btn.className = `btn btn-sm btn-outline-primary ${rating === 'all' ? 'active' : ''}`;
            btn.dataset.rating = rating;
            btn.textContent = rating === 'all' ? 'All' : `${rating} ★`;
            filterControlsDiv.appendChild(btn);
        });
    }

    renderFilterButtons();

    const h2Title = reviewsContainer.querySelector('h2');
    if (h2Title) {
        h2Title.after(filterControlsDiv);
    }

    filterControlsDiv.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            filterControlsDiv.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            renderReviews(e.target.dataset.rating);
        }
    });

    renderReviews();

    // Textarea Character Counter
    const reviewTextarea = document.getElementById('review-text');
    if (reviewTextarea) {
        const counterSpan = document.createElement('small');
        counterSpan.className = 'text-muted d-block mt-1';
        counterSpan.id = 'char-counter';
        counterSpan.textContent = '0 / 500 characters';
        reviewTextarea.after(counterSpan);

        reviewTextarea.addEventListener('input', () => {
            const len = reviewTextarea.value.length;
            counterSpan.textContent = `${len} / 500 characters`;
            if (len > 500) {
                counterSpan.classList.add('text-danger');
            } else {
                counterSpan.classList.remove('text-danger');
            }
        });
    }

    // Form Handling
    const form = feedbackFormSection.querySelector('form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('user-name');
            const phoneInput = document.getElementById('user-phone');
            const dateInput = document.getElementById('visit-date');
            const ratingInput = document.getElementById('service-rating');
            const textInput = document.getElementById('review-text');
            const consentCheckbox = document.getElementById('consent');

            let isValid = true;
            let firstInvalidField = null;

            form.querySelectorAll('.invalid-feedback').forEach(el => el.remove());
            form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

            const showError = (field, message) => {
                isValid = false;
                field.classList.add('is-invalid');
                const errDiv = document.createElement('div');
                errDiv.className = 'invalid-feedback';
                errDiv.textContent = message;
                field.after(errDiv);
                if (!firstInvalidField) firstInvalidField = field;
            };

            if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
                showError(nameInput, 'Please enter a valid full name (at least 2 characters).');
            }

            const phoneRegEx = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
            if (phoneInput.value.trim() && !phoneRegEx.test(phoneInput.value.trim())) {
                showError(phoneInput, 'Format must be +7 (700) 000-00-00.');
            }

            if (!dateInput.value) {
                showError(dateInput, 'Please select a visit date.');
            } else {
                const selectedDate = new Date(dateInput.value);
                const today = new Date();
                if (selectedDate > today) {
                    showError(dateInput, 'Visit date cannot be in the future.');
                }
            }

            if (!textInput.value.trim() || textInput.value.trim().length < 10) {
                showError(textInput, 'Review comment must be at least 10 characters long.');
            }

            if (!consentCheckbox.checked) {
                showError(consentCheckbox, 'You must consent to publishing your review.');
            }

            if (!isValid) {
                if (firstInvalidField) firstInvalidField.focus();
                return;
            }

            const randomNum = Math.floor(1000 + Math.random() * 9000);
            const refCode = `REV-${randomNum}`;

            const newReview = {
                id: refCode,
                name: nameInput.value.trim(),
                rating: parseInt(ratingInput.value, 10),
                text: textInput.value.trim(),
                date: dateInput.value,
                avatar: 'images/fb/ass1.jpeg',
                photo: ''
            };

            reviewsData.unshift(newReview);
            renderReviews();
            renderFilterButtons();

            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-success mt-4 shadow-sm';

            const h4 = document.createElement('h4');
            h4.className = 'alert-heading h5';
            h4.textContent = `Thank You, ${nameInput.value.trim()}!`;

            const pMsg = document.createElement('p');
            pMsg.className = 'mb-1';
            pMsg.textContent = 'Your feedback has been successfully recorded under Reference ';

            const strongRef = document.createElement('strong');
            strongRef.textContent = refCode;
            pMsg.appendChild(strongRef);

            const smallNote = document.createElement('small');
            smallNote.className = 'text-muted d-block mt-2';
            smallNote.textContent = '* Demonstration Mode: No data was transmitted to a remote backend server.';

            alertDiv.appendChild(h4);
            alertDiv.appendChild(pMsg);
            alertDiv.appendChild(smallNote);

            form.reset();
            if (document.getElementById('char-counter')) {
                document.getElementById('char-counter').textContent = '0 / 500 characters';
            }
            form.replaceWith(alertDiv);
        });
    }
});