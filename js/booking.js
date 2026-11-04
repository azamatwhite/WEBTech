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
        // Traversal: .siblings() және class селекторы (.error-message) арқылы қате блогын іздеу
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

    const $summary = $('<div class="card p-3 mt-4 bg-light"></div>').html(`
        <h3 class="h5">Live Booking Summary</h3>
        <p class="mb-1">Name: <span id="sum-name">Not provided</span></p>
        <p class="mb-1">Contact: <span id="sum-contact">Not provided</span></p>
        <p class="mb-1">Date and time: <span id="sum-date">Not selected</span></p>
        <p class="mb-1">Guests: <span id="sum-guests">Not specified</span></p>
        <p class="mb-1">Zone: <span id="sum-zone">Main Hall</span></p>
        <p class="mb-1">High chair: <span id="sum-chair">No</span></p>
        <p class="mb-0">Special requests: <span id="sum-wishes">None</span></p>
    `);

    $card.append($summary);

   
    const $notices = $('<div id="notices-box"></div>');
    const $depositNotice = $(`
        <p class="alert alert-warning mb-2">
            Groups over 10 guests may need a deposit.
        </p>
    `).hide();

    const $vipNotice = $(`
        <p class="alert alert-info mb-2">
            VIP rooms have a minimum order requirement.
        </p>
    `).hide();

    $notices.append($depositNotice, $vipNotice);
    $form.before($notices);

    const $history = $('<div class="card p-3 mt-4"></div>').html(`
        <h3 class="h5">Booking History</h3>

        <button type="button" id="toggle-history" class="btn btn-outline-dark">
            Show / Hide History
        </button>

        <div id="history-box" class="mt-3">
            <ul id="history-list" class="list-group"></ul>

            <button type="button" id="clear-history" class="btn btn-outline-danger mt-2">
                Clear History
            </button>
        </div>
    `);

    $card.append($history);

    // Traversal: .find() әдісі арқылы ішкі элементтерді табу
    const $historyBox = $history.find('#history-box').hide(); // d-none орнына бастапқыда .hide() қолданамыз
    const $historyList = $history.find('#history-list');

   
    const $success = $('<div class="alert alert-success mt-3"></div>').hide();
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
        $('#sum-guests').text(guestsVal || 'Not specified');
        $('#sum-zone').text(getZone());

        // Чекбокстың күйін .prop('checked') арқылы тексеру
        $('#sum-chair').text($highChairInput.prop('checked') ? 'Yes' : 'No');
        $('#sum-wishes').text(wishesVal || 'None');

        updateNotices();
    }

    $form.find('input:not([type="submit"]):not([type="reset"]), select, textarea')
        .on('input change', function () {
            clearError($(this));
            updateSummary();
        });

    
    function renderHistory() {
        const bookings = JSON.parse(localStorage.getItem('dastarkhan_bookings')) || [];

        $historyList.empty();

        if (bookings.length === 0) {
            $historyList.html('<li class="list-group-item text-muted">No bookings saved.</li>');
            return;
        }

        $.each(bookings, function (index, booking) {
            const itemText = (index + 1) + '. ' + booking.name +
                ' — ' + booking.guests + ' guests, ' +
                booking.zone + ', ' + booking.date +
                ' at ' + booking.time;

            // Delete батырмасын кодпен жасау (.attr() арқылы индексті сақтау)
            const $deleteBtn = $('<button type="button"></button>')
                .addClass('btn btn-sm btn-outline-danger delete-btn ms-2')
                .attr('data-index', index)
                .text('Delete');

            // <li> элементін жасап, ішіне мәтін мен Delete батырмасын қосу
            const $li = $('<li></li>')
                .addClass('list-group-item d-flex justify-content-between align-items-center')
                .append($('<span></span>').text(itemText))
                .append($deleteBtn);

            $historyList.append($li);
        });
    }

 
    $historyList.on('click', '.delete-btn', function () {
       
        const $btn = $(this);
        const $li = $btn.closest('li');
        const index = Number($btn.attr('data-index'));

        const bookings = JSON.parse(localStorage.getItem('dastarkhan_bookings')) || [];
        bookings.splice(index, 1);
        localStorage.setItem('dastarkhan_bookings', JSON.stringify(bookings));

        // Элементті жою және тізімді жаңарту
        $li.slideUp(200, function () {
            renderHistory();
        });
    });


    $('#toggle-history').on('click', function () {
        renderHistory();
        
        $historyBox.slideToggle(300);
    });

    // Тарихты толық тазалау
    $('#clear-history').on('click', function () {
        localStorage.removeItem('dastarkhan_bookings');
        renderHistory();
    });


    function validateForm() {
        let valid = true;

        // Барлық өрістерді .each() арқылы аралап, алдыңғы қателерді тазалау
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
        }

       
        if (emailVal === '') {
            showError($emailInput, 'Email address is required.');
            valid = false;
        } else if (!emailRegex.test(emailVal)) {
            showError($emailInput, 'Please enter a valid email (e.g., name@domain.com).');
            valid = false;
        }

        if (phoneVal === '') {
            showError($phoneInput, 'Phone number is required.');
            valid = false;
        } else if (!phoneRegex.test(phoneVal)) {
            showError($phoneInput, 'Please enter a valid phone number (at least 10 digits).');
            valid = false;
        }

        
        const guests = Number(guestsVal);
        if (guestsVal === '' || isNaN(guests) || guests < 1 || guests > 20) {
            showError($guestsInput, 'Guests must be between 1 and 20.');
            valid = false;
        }

   
        if (dateVal === '' || dateVal < today) {
            showError($dateInput, 'Choose today or a future date.');
            valid = false;
        }


        if (timeVal === '') {
            showError($timeInput, 'Please select a time slot.');
            valid = false;
        }

      
        if (!valid) {
            $form.find('.is-invalid:first').trigger('focus');
        }

        return valid;
    }

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
            wishes: $.trim($wishesInput.val())
        };

        const bookings = JSON.parse(localStorage.getItem('dastarkhan_bookings')) || [];
        bookings.push(booking);
        localStorage.setItem('dastarkhan_bookings', JSON.stringify(bookings));

      
        $success
            .stop(true, true)
            .text('Booking successful! Thank you, ' + booking.name + '.')
            .fadeIn(400, function () {
                
                $(this).delay(3000).fadeOut(400);
            });

       
        $form[0].reset();
     
        $('input[name="zone"]:first').prop('checked', true);

        updateSummary();
        renderHistory();
    });

  
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