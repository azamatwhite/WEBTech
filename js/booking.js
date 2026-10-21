
'use strict';

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('booking-form');

    if (!form) {
        return;
    }

    // 1. HTML элементтерін табу
    const nameInput = document.getElementById('guest-name');
    const emailInput = document.getElementById('guest-email');
    const phoneInput = document.getElementById('guest-phone');
    const guestsInput = document.getElementById('guest-count');
    const dateInput = document.getElementById('booking-date');
    const timeInput = document.getElementById('booking-time');

    const zoneHall = document.getElementById('zoneHall');
    const zoneTapchan = document.getElementById('zoneTapchan');
    const zoneVIP = document.getElementById('zoneVIP');
    const highChairInput = document.getElementById('highChair');
    const wishesInput = document.getElementById('special-wishes');

    // 2. Өткен күндерді таңдауға тыйым салу
    const now = new Date();
    const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString().split('T')[0];

    dateInput.min = today;

    // 3. Қате көрсету
    function showError(input, message) {
        let error = input.parentNode.querySelector('.error-message');

        if (!error) {
            error = document.createElement('small');
            error.className = 'error-message text-danger d-block';
            input.parentNode.appendChild(error);
        }

        error.textContent = message;
        input.classList.add('is-invalid');
    }

    // Қате хабарламасын өшіру
    function clearError(input) {
        const error = input.parentNode.querySelector('.error-message');

        if (error) {
            error.textContent = '';
        }

        input.classList.remove('is-invalid');
    }

    // 4. Live Booking Summary жасау
    const card = form.closest('.card') || form.parentNode;

    const summary = document.createElement('div');
    summary.className = 'card p-3 mt-4 bg-light';

    summary.innerHTML = `
        <h3 class="h5">Live Booking Summary</h3>
        <p>Name: <span id="sum-name">Not provided</span></p>
        <p>Contact: <span id="sum-contact">Not provided</span></p>
        <p>Date and time: <span id="sum-date">Not selected</span></p>
        <p>Guests: <span id="sum-guests">Not specified</span></p>
        <p>Zone: <span id="sum-zone">Main Hall</span></p>
        <p>High chair: <span id="sum-chair">No</span></p>
        <p>Special requests: <span id="sum-wishes">None</span></p>
    `;

    card.appendChild(summary);

    // Ескертулер шығатын орын
    const notices = document.createElement('div');
    form.parentNode.insertBefore(notices, form);

    // 5. Booking History жасау
    const history = document.createElement('div');
    history.className = 'card p-3 mt-4';

    history.innerHTML = `
        <h3 class="h5">Booking History</h3>

        <button type="button" id="toggle-history"
                class="btn btn-outline-dark">
            Show / Hide History
        </button>

        <div id="history-box" class="d-none mt-3">
            <ul id="history-list" class="list-group"></ul>

            <button type="button" id="clear-history"
                    class="btn btn-outline-danger mt-2">
                Clear History
            </button>
        </div>
    `;

    card.appendChild(history);

    const historyBox = document.getElementById('history-box');
    const historyList = document.getElementById('history-list');

    // 6. Сәтті брондау хабарламасы
    const success = document.createElement('div');
    success.className = 'alert alert-success mt-3 d-none';
    form.parentNode.insertBefore(success, form);

    // 7. Таңдалған аймақты анықтау
    function getZone() {
        if (zoneVIP.checked) {
            return 'VIP Room';
        }

        if (zoneTapchan.checked) {
            return 'Tapchan Area';
        }

        return 'Main Hall';
    }

    // 8. VIP және депозит туралы ескертулер
    function updateNotices() {
        notices.innerHTML = '';

        if (Number(guestsInput.value) > 10) {
            notices.innerHTML += `
                <p class="alert alert-warning">
                    Groups over 10 guests may need a deposit.
                </p>
            `;
        }

        if (zoneVIP.checked) {
            notices.innerHTML += `
                <p class="alert alert-info">
                    VIP rooms have a minimum order requirement.
                </p>
            `;
        }
    }

    // 9. Live Summary жаңарту
    function updateSummary() {
        document.getElementById('sum-name').textContent =
            nameInput.value.trim() || 'Not provided';

        document.getElementById('sum-contact').textContent =
            [emailInput.value.trim(), phoneInput.value.trim()]
                .filter(Boolean).join(', ') || 'Not provided';

        document.getElementById('sum-date').textContent =
            (dateInput.value || 'Date not set') +
            ' at ' + (timeInput.value || 'Time not set');

        document.getElementById('sum-guests').textContent =
            guestsInput.value || 'Not specified';

        document.getElementById('sum-zone').textContent = getZone();

        document.getElementById('sum-chair').textContent =
            highChairInput.checked ? 'Yes' : 'No';

        document.getElementById('sum-wishes').textContent =
            wishesInput.value.trim() || 'None';

        updateNotices();
    }

    // 10. Өзгерістерді бақылау
    const inputs = [
        nameInput, emailInput, phoneInput, guestsInput,
        dateInput, timeInput, zoneHall, zoneTapchan,
        zoneVIP, highChairInput, wishesInput
    ];

    inputs.forEach(function (input) {
        input.addEventListener('input', function () {
            clearError(input);
            updateSummary();
        });

        input.addEventListener('change', function () {
            clearError(input);
            updateSummary();
        });
    });

    // 11. Форманы тексеру
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

    // 12. Брондау тарихын көрсету
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

    // Тарихты ашу және жабу
    document.getElementById('toggle-history')
        .addEventListener('click', function () {
            historyBox.classList.toggle('d-none');
            renderHistory();
        });

    // Тарихты тазалау
    document.getElementById('clear-history')
        .addEventListener('click', function () {
            localStorage.removeItem('dastarkhan_bookings');
            renderHistory();
        });

    // 13. Брондауды сақтау
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        success.classList.add('d-none');

        if (!validateForm()) {
            return;
        }

        const booking = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            guests: guestsInput.value,
            date: dateInput.value,
            time: timeInput.value,
            zone: getZone(),
            highChair: highChairInput.checked ? 'Yes' : 'No',
            wishes: wishesInput.value.trim()
        };

        const bookings =
            JSON.parse(localStorage.getItem('dastarkhan_bookings')) || [];

        bookings.push(booking);

        localStorage.setItem(
            'dastarkhan_bookings',
            JSON.stringify(bookings)
        );

        success.textContent =
            'Booking successful! Thank you, ' + booking.name + '.';

        success.classList.remove('d-none');

        form.reset();
        updateSummary();
        renderHistory();
    });

    // 14. Форма тазаланғанда
    form.addEventListener('reset', function () {
        setTimeout(function () {
            inputs.forEach(clearError);
            success.classList.add('d-none');
            updateSummary();
        }, 0);
    });

    // Бет ашылғанда Summary көрсету
    updateSummary();
});
