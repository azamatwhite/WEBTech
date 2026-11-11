'use strict';

$(function () {
    const $form = $('#booking-form');

    if (!$form.length) {
        return;
    }

    
    $form.attr('novalidate', 'novalidate');

    const $nameInput = $('#guest-name');
    const $emailInput = $('#guest-email');
    const $phoneInput = $('#guest-phone');
    const $guestsInput = $('#guest-count');
    const $dateInput = $('#booking-date');
    const $timeInput = $('#booking-time');
    const $highChairInput = $('#highChair');
    const $wishesInput = $('#special-wishes');

   
    const now = new Date();
    const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString().split('T')[0];
    $dateInput.attr('min', today);

   
    function showError($input, message) {
        let $error = $input.siblings('.error-message');

        if ($error.length === 0) {
            $error = $('<small class="error-message text-danger d-block mt-1"></small>');
            $input.parent().append($error);
        }

        $input
            .addClass('is-invalid')
            .attr('aria-invalid', 'true')
            .siblings('.error-message')
            .text(message);
    }

    
    function clearError($input) {
        $input
            .removeClass('is-invalid')
            .attr('aria-invalid', 'false')
            .siblings('.error-message')
            .text('');
    }

   
    const $card = $form.closest('.card');

    const $summary = $('<div class="card p-3 mt-4 bg-light border-0 shadow-sm"></div>').html(`
        <h3 class="h5 text-dark mb-3">Live Booking Summary</h3>
        <p class="mb-1"><strong>Name:</strong> <span id="sum-name">Not provided</span></p>
        <p class="mb-1"><strong>Contact:</strong> <span id="sum-contact">Not provided</span></p>
        <p class="mb-1"><strong>Date & Time:</strong> <span id="sum-date">Not selected</span></p>
        <p class="mb-1"><strong>Guests:</strong> <span id="sum-guests">Not specified</span></p>
        <p class="mb-1"><strong>Zone:</strong> <span id="sum-zone">Main Hall</span></p>
        <p class="mb-1"><strong>High Chair:</strong> <span id="sum-chair">No</span></p>
        <p class="mb-0"><strong>Special Requests:</strong> <span id="sum-wishes">None</span></p>
    `);

    $card.append($summary);


    const $notices = $('<div id="notices-box"></div>');
    const $depositNotice = $(`
        <p class="alert alert-warning mb-2 py-2">
            ⚠️ <strong>Deposit note:</strong> Groups over 10 guests require an advance deposit of 20,000 KZT.
        </p>
    `).hide();

    const $vipNotice = $(`
        <p class="alert alert-info mb-2 py-2">
            ℹ️ <strong>VIP Room:</strong> Minimum order limit is 50,000 KZT.
        </p>
    `).hide();

    $notices.append($depositNotice, $vipNotice);
    $form.before($notices);

    
    const $history = $('<div class="card p-3 mt-4 border-0 shadow-sm"></div>').html(`
        <div class="d-flex justify-content-between align-items-center">
            <h3 class="h5 mb-0">Saved Bookings</h3>
            <button type="button" id="toggle-history" class="btn btn-sm btn-outline-dark">
                Show / Hide History
            </button>
        </div>
        <div id="history-box" class="mt-3">
            <ul id="history-list" class="list-group list-group-flush mb-2"></ul>
            <div class="d-flex justify-content-end">
                <button type="button" id="clear-history" class="btn btn-sm btn-outline-danger">
                    Clear All Bookings
                </button>
            </div>
        </div>
    `);

    $card.append($history);

    
    const $historyBox = $history.find('#history-box').hide();
    const $historyList = $history.find('#history-list');

    
    const $success = $('<div class="alert alert-success mt-3" role="alert"></div>').hide();
    $form.before($success);

   
    function getZone() {
        const selectedVal = $('input[name="zone"]:checked').val();
        if (selectedVal === 'vip') {
            return 'VIP Room';
        }
        if (selectedVal === 'tapchan') {
            return 'Tapchan Area';
        }
        return 'Main Hall';
    }

    function updateNotices() {
        const guestsCount = Number($guestsInput.val());
        if (guestsCount > 10) {
            $depositNotice.slideDown(250);
        } else {
            $depositNotice.slideUp(250);
        }

        const isVip = $('input[name="zone"]:checked').val() === 'vip';
        if (isVip) {
            $vipNotice.slideDown(250);
        } else {
            $vipNotice.slideUp(250);
        }
    }

    // Деректерді динамикалық жаңарту
    function updateSummary() {
        const nameVal = $.trim($nameInput.val());
        const emailVal = $.trim($emailInput.val());
        const phoneVal = $.trim($phoneInput.val());
        const dateVal = $dateInput.val();
        const timeVal = $timeInput.val();
        const guestsVal = $guestsInput.val();
        const wishesVal = $.trim($wishesInput.val());

        $('#sum-name').text(nameVal || 'Not provided');
        $('#sum-contact').text([emailVal, phoneVal].filter(Boolean).join(', ') || 'Not provided');
        $('#sum-date').text((dateVal || 'Date not set') + ' at ' + (timeVal || 'Time not set'));
        $('#sum-guests').text(guestsVal ? guestsVal + ' guest(s)' : 'Not specified');
        $('#sum-zone').text(getZone());
        $('#sum-chair').text($highChairInput.prop('checked') ? 'Yes' : 'No');
        $('#sum-wishes').text(wishesVal || 'None');

        updateNotices();
    }

    // Инпуттар өзгерген сайын қатені өшіру және Summary жаңарту
    $form.find('input:not([type="submit"]):not([type="reset"]), select, textarea')
        .on('input change', function () {
            clearError($(this));
            updateSummary();
        });

    // LocalStorage арқылы брондау тарихын құру
    function renderHistory() {
        let bookings = [];
        try {
            bookings = JSON.parse(localStorage.getItem('dastarkhan_bookings')) || [];
        } catch (e) {
            bookings = [];
        }

        $historyList.empty();

        if (bookings.length === 0) {
            $historyList.html('<li class="list-group-item text-muted px-0">No previous bookings found.</li>');
            return;
        }

        $.each(bookings, function (index, booking) {
            const itemText = (index + 1) + '. ' + booking.name +
                ' (' + booking.guests + ' guests) — ' +
                booking.zone + ' on ' + booking.date + ' at ' + booking.time;

            const $deleteBtn = $('<button type="button"></button>')
                .addClass('btn btn-sm btn-outline-danger delete-btn ms-2')
                .attr('data-index', index)
                .text('Delete');

            const $li = $('<li></li>')
                .addClass('list-group-item d-flex justify-content-between align-items-center px-0')
                .append($('<span></span>').text(itemText))
                .append($deleteBtn);

            $historyList.append($li);
        });
    }

    // Event Delegation: Кейіннен динамикалық пайда болатын Delete батырмаларын ұстау
    $historyList.on('click', '.delete-btn', function () {
        const $btn = $(this);
        const $li = $btn.closest('li');
        const index = Number($btn.attr('data-index'));

        let bookings = JSON.parse(localStorage.getItem('dastarkhan_bookings')) || [];
        bookings.splice(index, 1);
        localStorage.setItem('dastarkhan_bookings', JSON.stringify(bookings));

        $li.slideUp(200, function () {
            renderHistory();
        });
    });

    // Effect 3: slideToggle
    $('#toggle-history').on('click', function () {
        $historyBox.slideToggle(300);
    });

    // Тарихты толық өшіру
    $('#clear-history').on('click', function () {
        localStorage.removeItem('dastarkhan_bookings');
        renderHistory();
    });

    // Dead button болмауы үшін жоғары жылжу
    $('#backToTop').on('click', function (e) {
        e.preventDefault();
        $('html, body').stop().animate({ scrollTop: 0 }, 350);
    });

    // Форманы толық тексеру
    function validateForm() {
        let valid = true;

        $form.find('.form-control, .form-select').each(function () {
            clearError($(this));
        });

        const nameVal = $.trim($nameInput.val());
        const emailVal = $.trim($emailInput.val());
        const phoneVal = $.trim($phoneInput.val());
        const guestsVal = $.trim($guestsInput.val());
        const dateVal = $.trim($dateInput.val());
        const timeVal = $.trim($timeInput.val());

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\+?[\d\s\-()]{10,20}$/;

        if (nameVal === '') {
            showError($nameInput, 'Full name is required.');
            valid = false;
        } else if (nameVal.length < 2) {
            showError($nameInput, 'Name must be at least 2 characters.');
            valid = false;
        }

        if (emailVal === '') {
            showError($emailInput, 'Email address is required.');
            valid = false;
        } else if (!emailRegex.test(emailVal)) {
            showError($emailInput, 'Enter a valid email address (e.g. name@example.com).');
            valid = false;
        }

        if (phoneVal === '') {
            showError($phoneInput, 'Phone number is required.');
            valid = false;
        } else if (!phoneRegex.test(phoneVal)) {
            showError($phoneInput, 'Enter a valid phone number (at least 10 digits).');
            valid = false;
        }

        const guests = Number(guestsVal);
        if (guestsVal === '' || isNaN(guests) || guests < 1 || guests > 20) {
            showError($guestsInput, 'Please specify between 1 and 20 guests.');
            valid = false;
        }

        if (dateVal === '' || dateVal < today) {
            showError($dateInput, 'Please choose today or an upcoming date.');
            valid = false;
        }

        if (timeVal === '') {
            showError($timeInput, 'Please choose an available time slot.');
            valid = false;
        }

        if (!valid) {
            $form.find('.is-invalid:first').trigger('focus');
        }

        return valid;
    }

    // Submit әрекеті
    $form.on('submit', function (event) {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        const booking = {
            name: $.trim($nameInput.val()),
            email: $.trim($emailInput.val()),
            phone: $.trim($phoneInput.val()),
            guests: $.trim($guestsInput.val()),
            date: $.trim($dateInput.val()),
            time: $.trim($timeInput.val()),
            zone: getZone(),
            highChair: $highChairInput.prop('checked') ? 'Yes' : 'No',
            wishes: $.trim($wishesInput.val()) || 'None'
        };

        let bookings = [];
        try {
            bookings = JSON.parse(localStorage.getItem('dastarkhan_bookings')) || [];
        } catch (e) {
            bookings = [];
        }
        bookings.push(booking);
        localStorage.setItem('dastarkhan_bookings', JSON.stringify(bookings));

        // Effect 4: fadeIn және fadeOut растау хабарламасы
        $success
            .stop(true, true)
            .text('Table reserved successfully for ' + booking.name + '! We look forward to seeing you.')
            .fadeIn(350, function () {
                $(this).delay(4000).fadeOut(350);
            });

        $form[0].reset();
        $('input[name="zone"]:first').prop('checked', true);

        updateSummary();
        renderHistory();
    });

    // Reset әрекеті
    $form.on('reset', function () {
        setTimeout(function () {
            $form.find('.form-control, .form-select').each(function () {
                clearError($(this));
            });
            $success.stop(true, true).fadeOut(200);
            updateSummary();
        }, 0);
    });

    updateSummary();
    renderHistory();
});