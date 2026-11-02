// old-js-version.js — Салыстыру үшін сақталған ескі Vanilla JS функциялары (ешбір бетке қосылмайды)

// 1-функция: Брондау тарихын көрсету (renderHistory)
function renderHistory() {
    const bookings =
        JSON.parse(localStorage.getItem('dastarkhan_bookings')) || [];

    historyList.innerHTML = '';

    if (bookings.length === 0) {
        historyList.innerHTML =
            '<li class="list-group-item">No bookings saved.</li>';
        return;
    }

    bookings.forEach(function (booking, index) {
        const item = document.createElement('li');
        item.className = 'list-group-item';

        item.textContent =
            (index + 1) + '. ' + booking.name +
            ' - ' + booking.guests + ' guests, ' +
            booking.zone + ', ' + booking.date +
            ' at ' + booking.time;

        historyList.appendChild(item);
    });
}

// 2-функция: Тарихты ашу және жабу
document.getElementById('toggle-history')
    .addEventListener('click', function () {
        historyBox.classList.toggle('d-none');
        renderHistory();
    });

// 3-функция: Форманы тексеру (validateForm)
function validateForm() {
    let valid = true;

    if (nameInput.value.trim() === '') {
        showError(nameInput, 'Full name is required.');
        valid = false;
    }

    if (emailInput.value.trim() === '' &&
        phoneInput.value.trim() === '') {
        showError(emailInput, 'Enter an email or phone number.');
        valid = false;
    }

    const guests = Number(guestsInput.value);

    if (!guestsInput.value || guests < 1 || guests > 20) {
        showError(guestsInput, 'Guests must be between 1 and 20.');
        valid = false;
    }

    if (!dateInput.value || dateInput.value < today) {
        showError(dateInput, 'Choose today or a future date.');
        valid = false;
    }

    if (!timeInput.value) {
        showError(timeInput, 'Please select a time.');
        valid = false;
    }

    return valid;
}