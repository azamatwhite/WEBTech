'use strict';

/* Booking page — jQuery. Load order on the page: jQuery, Bootstrap, this file. */
$(function () {
    var $form = $('#booking-form');
    if (!$form.length) { return; }

    var STORAGE_KEY = 'dastarkhan_bookings';
    var MAX_GUESTS = 20;
    var KZ_MOBILE_CODES = ['700', '701', '702', '705', '706', '707', '708', '747', '771', '775', '776', '777', '778'];

    /* ---------- Data ---------- */
    // Photo assignment follows js/gallery.js (the project's own branch tags):
    //  Auezov: IMG_1170, IMG_1171, IMG_1180 (also IMG_1179).  Dostyk: IMG_1160, IMG_1161, IMG_1165 (also IMG_1157).
    var BRANCHES = {
        auezov: {
            name: 'Mukhtar Auezov 33 (Auezov)',
            title: 'Mukhtar Auezov 33 — Interior',
            photos: [
                { src: 'images/interior/IMG_1160.jpg', title: 'Red Accent Dining Zone', alt: 'Auezov: dining zone with a red wall and blue glassware' },
                { src: 'images/interior/IMG_1171.jpg', title: 'Banquet Hall Setup', alt: 'Auezov: banquet hall with a long set table' },
                { src: 'images/interior/IMG_1165.jpg', title: 'Decorative Lighting Lounge', alt: 'Auezov: lounge area with warm pendant lamps' }
            ],
            zones: [
                { id: 'tapchan', group: 'Tapchan', name: 'Tapchan', label: 'Tapchan — up to 20 guests', description: 'Traditional tapchan seating for family gatherings and larger groups.', max: 20 }
            ]
        },
        dostyk: {
            name: 'Dostyk 1',
            title: 'Dostyk 1 — Interior',
            photos: [
                { src: 'images/interior/IMG_1170.jpg', title: 'Oriental VIP Lounge', alt: 'Dostyk: oriental VIP lounge with carved wood and mosaic tiles' },
                { src: 'images/interior/IMG_1171.jpg', title: 'Main Wooden Hall', alt: 'Dostyk: main dining hall with carved wooden tables' },
                { src: 'images/interior/IMG_1180.JPG', title: 'Mosaic Archway Corridor', alt: 'Dostyk: ornate mosaic wall and arch' }
            ],
            zones: [
                { id: 'main-windows', group: 'Main Dining Hall', name: 'Tables near panoramic windows', label: 'Tables near panoramic windows', description: 'Tables beside the panoramic windows.', max: null },
                { id: 'central-booths', group: 'Main Dining Hall', name: 'Central booths', label: 'Central booths — 4–6 guests', description: 'Central booth seating for groups of four to six guests.', max: 6 },
                { id: 'east-hall', group: 'VIP Halls', name: 'East Hall', label: 'East Hall — up to 12 guests', description: 'A private room for family dinners and small celebrations.', max: 12 },
                { id: 'khan-room', group: 'VIP Halls', name: 'Khan Room', label: 'Khan Room — up to 20 guests', description: 'A spacious private room for larger gatherings.', max: 20 },
                { id: 'tea-lounge', group: 'Tea Lounge', name: 'Tea Lounge', label: 'Tea Lounge', description: 'A relaxed space for tea and conversation.', max: null }
            ]
        }
    };

    /* ---------- Elements ---------- */
    var $branch = $('#branch-select');
    var $zoneGroup = $('#zone-options');
    var $gallery = $('#booking-gallery');
    var $galleryTitle = $('#branch-gallery-title');
    var $name = $('#guest-name');
    var $email = $('#guest-email');
    var $phone = $('#guest-phone');
    var $guests = $('#guest-count');
    var $date = $('#booking-date');
    var $time = $('#booking-time');
    var $highChair = $('#highChair');
    var $wishes = $('#special-wishes');
    var $success = $('#booking-success');
    var $alert = $('#booking-alert');
    var $notices = $('#booking-notices');

    var $modal = $('#bookingPhotoModal');
    var $modalImage = $('#bookingModalImage');
    var $modalTitle = $('#bookingPhotoModalLabel');
    var $modalCounter = $('#bookingPhotoCounter');

    var $historyBox = $('#history-box');
    var $historyList = $('#history-list');
    var $historyToggle = $('#toggle-history');

    var activePhotos = [];
    var activePhotoIndex = 0;
    var touched = {};
    var justSaved = false;

    /* ---------- Small helpers ---------- */
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function formatDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

    var now = new Date();
    var TODAY = formatDate(now);
    var maxDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    var LAST_DAY = formatDate(maxDate);
    $date.attr({ min: TODAY, max: LAST_DAY });

    function getBranch() { return BRANCHES[$branch.val()] || null; }
    function getSelectedZone() {
        var branch = getBranch();
        var id = $zoneGroup.find('input[name="zone"]:checked').val();
        if (!branch || !id) { return null; }
        var found = $.grep(branch.zones, function (zone) { return zone.id === id; });
        return found.length ? found[0] : null;
    }

    /* ---------- Phone and email checks (same rules as js/careers.js) ---------- */
    function parseKzPhone(raw) {
        var value = $.trim(raw);
        if (!value) { return { error: 'Enter your phone number.' }; }
        if (!/^\+?[\d\s()\-]+$/.test(value)) {
            return { error: 'Use digits only. Spaces, hyphens and parentheses are allowed.' };
        }
        if (value.split('(').length !== value.split(')').length) {
            return { error: 'Check the parentheses in the phone number.' };
        }
        var digits = value.replace(/\D/g, '');
        if (value.charAt(0) === '+' && digits.charAt(0) !== '7') {
            return { error: 'Kazakhstan numbers start with +7.' };
        }
        if (digits.length === 11 && digits.charAt(0) === '8') { digits = '7' + digits.slice(1); }
        if (digits.length !== 11) {
            return { error: 'A Kazakhstan mobile number has 11 digits, for example +7 701 123 45 67.' };
        }
        if (digits.charAt(0) !== '7') {
            return { error: 'Enter a Kazakhstan number starting with +7, 7 or 8.' };
        }
        if ($.inArray(digits.substr(1, 3), KZ_MOBILE_CODES) === -1) {
            return { error: 'Enter a Kazakhstan mobile number (codes such as 701, 705, 707, 747, 775, 777).' };
        }
        return {
            error: '',
            formatted: '+7 ' + digits.substr(1, 3) + ' ' + digits.substr(4, 3) + ' ' + digits.substr(7, 2) + ' ' + digits.substr(9, 2)
        };
    }

    function getEmailError(raw) {
        var value = $.trim(raw);
        if (!value) { return 'Enter your email address.'; }
        if (/\s/.test(value)) { return 'The email address must not contain spaces.'; }
        var parts = value.split('@');
        if (parts.length !== 2 || !parts[0] || !parts[1]) { return 'Enter an email like name@example.com.'; }
        var local = parts[0];
        var domain = parts[1];
        if (value.length > 254 || local.length > 64) { return 'This email address is too long.'; }
        if (!/^[A-Za-z0-9._%+\-]+$/.test(local)) { return 'The part before @ contains invalid characters.'; }
        if (local.charAt(0) === '.' || local.slice(-1) === '.' || local.indexOf('..') !== -1) {
            return 'The part before @ must not start or end with a dot or contain two dots in a row.';
        }
        var labels = domain.split('.');
        if (labels.length < 2) { return 'The domain needs an extension, for example example.com.'; }
        var badLabels = $.grep(labels, function (label) {
            return !/^[A-Za-z0-9]([A-Za-z0-9\-]*[A-Za-z0-9])?$/.test(label);
        });
        if (badLabels.length) { return 'The domain after @ is not valid (check for double dots or odd characters).'; }
        if (!/^[A-Za-z]{2,}$/.test(labels[labels.length - 1])) { return 'The domain extension must be at least two letters.'; }
        return '';
    }

    /* ---------- Field validators: each returns an error message or '' ---------- */
    var validators = {
        branch: function () {
            return getBranch() ? '' : 'Please choose a restaurant location.';
        },
        zone: function () {
            return getSelectedZone() ? '' : 'Please choose a hall at this location.';
        },
        name: function () {
            var value = $.trim($name.val());
            if (!value) { return 'Enter your full name.'; }
            return /^[\p{L}][\p{L}\s'’\-]{1,59}$/u.test(value) ? '' : 'Name must be 2–60 letters (no digits or symbols).';
        },
        email: function () { return getEmailError($email.val()); },
        phone: function () { return parseKzPhone($phone.val()).error; },
        guests: function () {
            var raw = $.trim($guests.val());
            if (!raw) { return 'Enter the number of guests.'; }
            if (!/^\d+$/.test(raw)) { return 'Enter a whole number of guests.'; }
            var count = Number(raw);
            if (count < 1 || count > MAX_GUESTS) { return 'We can seat between 1 and ' + MAX_GUESTS + ' guests per booking.'; }
            var zone = getSelectedZone();
            if (zone && zone.max && count > zone.max) {
                return zone.name + ' seats up to ' + zone.max + ' guests. Choose another hall or reduce the group size.';
            }
            return '';
        },
        date: function () {
            var value = $date.val();
            if (!value) { return 'Choose a visit date.'; }
            var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
            var real = m && formatDate(new Date(+m[1], +m[2] - 1, +m[3])) === value;
            if (!real) { return 'Enter a valid date.'; }
            if (value < TODAY) { return 'The date cannot be in the past.'; }
            if (value > LAST_DAY) { return 'Bookings open up to one year in advance.'; }
            return '';
        },
        time: function () {
            var value = $time.val();
            if (!value) { return 'Select a time slot.'; }
            if ($date.val() === TODAY) {
                var current = new Date();
                var slot = value.split(':');
                if (+slot[0] * 60 + +slot[1] <= current.getHours() * 60 + current.getMinutes()) {
                    return 'This time slot has already passed today. Choose a later slot or another date.';
                }
            }
            return '';
        }
    };
    var fieldOrder = ['branch', 'zone', 'name', 'phone', 'email', 'date', 'time', 'guests'];
    var $controls = {
        branch: $branch, zone: $zoneGroup, name: $name, email: $email,
        phone: $phone, guests: $guests, date: $date, time: $time
    };

    /* ---------- Showing errors directly under each field ---------- */
    function showFieldState(key, message) {
        var $control = $controls[key];
        var $feedback = $control.nextAll('.invalid-feedback').first();
        if (message) {
            $control.addClass('is-invalid').removeClass('is-valid').attr('aria-invalid', 'true');
            $feedback.text(message);
        } else {
            $control.removeClass('is-invalid').removeAttr('aria-invalid');
            if (key !== 'zone') { $control.addClass('is-valid'); }
            $feedback.text('');
        }
        if (key === 'zone') { $zoneGroup.find('.form-check').toggleClass('border-danger', !!message); }
    }

    function clearFieldState(key) {
        $controls[key].removeClass('is-invalid is-valid').removeAttr('aria-invalid');
        $controls[key].nextAll('.invalid-feedback').first().text('');
        if (key === 'zone') { $zoneGroup.find('.form-check').removeClass('border-danger'); }
        touched[key] = false;
    }

    function validateField(key) {
        touched[key] = true;
        var message = validators[key]();
        showFieldState(key, message);
        return !message;
    }

    function revalidateIfTouched(key) {
        if (touched[key]) { validateField(key); }
    }

    function validateAll() {
        var firstInvalid = null;
        $.each(fieldOrder, function (i, key) {
            if (!validateField(key) && !firstInvalid) { firstInvalid = key; }
        });
        return firstInvalid;
    }

    function resetValidation() {
        $.each(fieldOrder, function (i, key) { clearFieldState(key); });
        $alert.addClass('d-none');
    }

    /* ---------- Halls and photos for the selected location ---------- */
    function renderZones() {
        var branch = getBranch();
        $zoneGroup.empty();
        if (!branch) { return; }
        var previousGroup = '';
        $.each(branch.zones, function (index, zone) {
            if (zone.group !== previousGroup && zone.group !== zone.name) {
                $zoneGroup.append($('<h4>', { 'class': 'h6 text-muted mt-2 mb-0', text: zone.group }));
            }
            previousGroup = zone.group;
            var radioId = 'zone-' + zone.id;
            var $radio = $('<input>', {
                'class': 'form-check-input', type: 'radio', name: 'zone', id: radioId,
                value: zone.id, 'data-field': 'zone', checked: branch.zones.length === 1
            });
            var $label = $('<label>', { 'class': 'form-check-label fw-semibold', 'for': radioId, text: zone.label });
            var $hint = $('<small>', { 'class': 'd-block text-muted fw-normal mt-1', text: zone.description });
            $zoneGroup.append($('<div>', { 'class': 'form-check border rounded p-3 ps-5' }).append($radio, $label, $hint));
        });
    }

    function renderPhotos() {
        var branch = getBranch();
        if (!branch) { return; }
        activePhotos = branch.photos;
        $galleryTitle.text(branch.title);
        $gallery.empty();
        $.each(branch.photos, function (index, photo) {
            var $img = $('<img>', {
                src: photo.src, alt: photo.alt, 'class': 'w-100 h-100 rounded shadow-sm object-fit-cover'
            });
            var $button = $('<button>', {
                type: 'button', 'class': 'btn p-0 border-0 w-100 booking-photo',
                'data-photo-index': index, 'aria-label': 'Enlarge photo: ' + photo.title
            }).append($('<span>', { 'class': 'ratio ratio-4x3 d-block' }).append($img));
            $img.on('error', function () {
                $button.prop('disabled', true).addClass('opacity-50');
            });
            var $caption = $('<span>', { 'class': 'd-block small text-muted text-center mt-1', text: photo.title });
            $gallery.append($('<div>', { 'class': 'col' }).append($button, $caption));
        });
    }

    function onBranchChanged() {
        renderZones();
        renderPhotos();
        clearFieldState('zone');
        revalidateIfTouched('guests');
        updateSummary();
    }

    /* ---------- Lightbox ---------- */
    function showModalPhoto() {
        var photo = activePhotos[activePhotoIndex];
        if (!photo) { return; }
        $modalImage.attr({ src: photo.src, alt: photo.alt });
        $modalTitle.text(photo.title + ' — ' + getBranch().name);
        $modalCounter.text((activePhotoIndex + 1) + ' / ' + activePhotos.length);
    }

    function movePhoto(step) {
        if (!activePhotos.length) { return; }
        activePhotoIndex = (activePhotoIndex + step + activePhotos.length) % activePhotos.length;
        showModalPhoto();
    }

    $gallery.on('click', '.booking-photo', function () {
        activePhotoIndex = Number($(this).data('photo-index'));
        showModalPhoto();
        bootstrap.Modal.getOrCreateInstance($modal[0]).show();
    });
    $('#bookingPhotoPrev').on('click', function () { movePhoto(-1); });
    $('#bookingPhotoNext').on('click', function () { movePhoto(1); });
    $(document).on('keydown', function (event) {
        if (!$modal.hasClass('show')) { return; }
        if (event.key === 'ArrowLeft') { movePhoto(-1); }
        if (event.key === 'ArrowRight') { movePhoto(1); }
    });

    /* ---------- Live summary and notices ---------- */
    function updateNotices() {
        $notices.empty();
        var zone = getSelectedZone();
        if (Number($guests.val()) > 10) {
            $notices.append($('<div>', { 'class': 'alert alert-warning', text: 'For groups over 10 guests, an advance deposit may be requested.' }));
        }
        if (zone && zone.group === 'VIP Halls') {
            $notices.append($('<div>', { 'class': 'alert alert-info', text: 'You selected a private hall. Our team will confirm the reservation details.' }));
        }
    }

    function updateSummary() {
        var branch = getBranch();
        var zone = getSelectedZone();
        $('#sum-branch').text(branch ? branch.name : '—');
        $('#sum-zone').text(zone ? zone.label : 'Not selected');
        $('#sum-name').text($.trim($name.val()) || 'Not provided');
        $('#sum-contact').text($.grep([$.trim($email.val()), $.trim($phone.val())], Boolean).join(' / ') || 'Not provided');
        $('#sum-date').text(($date.val() || 'Date not set') + ' at ' + ($time.val() || 'time not set'));
        $('#sum-guests').text($.trim($guests.val()) || 'Not specified');
        $('#sum-chair').text($highChair.is(':checked') ? 'Yes' : 'No');
        $('#sum-wishes').text($.trim($wishes.val()) || 'None');
        updateNotices();
    }

    /* ---------- Booking history (localStorage) ---------- */
    function readBookings() {
        try {
            var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            return Array.isArray(saved) ? saved : [];
        } catch (error) {
            return [];
        }
    }

    function writeBookings(bookings) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
            return true;
        } catch (error) {
            return false;
        }
    }

    function detail(label, value) {
        return $('<span>').append($('<span>', { 'class': 'fw-semibold', text: label + ': ' }), $('<span>', { text: value }));
    }

    function renderHistory() {
        var bookings = readBookings();
        $('#history-count').text(bookings.length);
        $historyList.empty();
        $('#clear-history').toggleClass('d-none', !bookings.length);
        if (!bookings.length) {
            $historyList.append($('<p>', { 'class': 'text-muted mb-0', text: 'No bookings yet. Your saved bookings will appear here.' }));
            return;
        }
        var $list = $('<ul>', { 'class': 'list-group list-group-flush' });
        $.each(bookings.slice().reverse(), function (index, booking) {
            var contact = $.grep([booking.email, booking.phone], Boolean).join(' · ') || 'Contact not saved';
            var when = (booking.date || 'Date not saved') + ' at ' + (booking.time || 'time not saved');
            var $item = $('<li>', { 'class': 'list-group-item px-0' });
            $item.append(
                $('<div>', { 'class': 'd-flex flex-wrap justify-content-between gap-2' }).append(
                    $('<strong>', { text: booking.name || 'Guest name not saved' }),
                    $('<span>', { 'class': 'badge text-bg-warning align-self-center', text: when })
                ),
                $('<div>', { 'class': 'small text-muted mb-1', text: contact }),
                $('<div>', { 'class': 'small d-flex flex-wrap column-gap-4' }).append(
                    detail('Location', booking.branch || 'not saved'),
                    detail('Hall', booking.zone || 'not saved'),
                    detail('Guests', booking.guests ? String(booking.guests) : 'not saved')
                )
            );
            $list.append($item);
        });
        $historyList.append($list);
    }

    $historyToggle.on('click', function () {
        var willOpen = $historyBox.hasClass('d-none');
        $historyBox.toggleClass('d-none', !willOpen);
        $historyToggle.attr('aria-expanded', String(willOpen));
        $('#toggle-history-label').text(willOpen ? 'Hide Booking History' : 'Show Booking History');
        if (willOpen) { renderHistory(); }
    });

    $('#clear-history').on('click', function () {
        if (window.confirm('Delete all bookings saved on this device?')) {
            try { localStorage.removeItem(STORAGE_KEY); } catch (error) { /* storage unavailable */ }
            renderHistory();
        }
    });

    /* ---------- Events ---------- */
    $branch.on('change', onBranchChanged);

    // After the first submit attempt, re-check each field as it is edited.
    // (No check on blur: an error appearing under the field would move the Submit/Reset button mid-click.)
    $form.on('input change', '[data-field]', function () {
        var key = $(this).data('field');
        $success.addClass('d-none');
        revalidateIfTouched(key);
        if (key === 'zone') { revalidateIfTouched('guests'); }
        if (key === 'date') { revalidateIfTouched('time'); }
        if (!$form.find('.is-invalid').length) { $alert.addClass('d-none'); }
        updateSummary();
    });
    $form.on('input change', '#highChair, #special-wishes', updateSummary);

    $form.on('submit', function (event) {
        event.preventDefault();
        $success.addClass('d-none');
        var firstInvalid = validateAll();
        if (firstInvalid) {
            $alert.text($alert.data('defaultText')).removeClass('d-none');
            var $target = firstInvalid === 'zone' ? $zoneGroup.find('input').first() : $controls[firstInvalid];
            $target.trigger('focus');
            return;
        }
        $alert.addClass('d-none');

        var zone = getSelectedZone();
        var branchId = $branch.val();
        var booking = {
            name: $.trim($name.val()),
            email: $.trim($email.val()),
            phone: parseKzPhone($phone.val()).formatted,
            branch: getBranch().name,
            branchId: branchId,
            zone: zone.label,
            zoneId: zone.id,
            guests: Number($guests.val()),
            date: $date.val(),
            time: $time.val(),
            highChair: $highChair.is(':checked') ? 'Yes' : 'No',
            wishes: $.trim($wishes.val()),
            savedAt: new Date().toISOString()
        };

        var bookings = readBookings();
        bookings.push(booking);
        if (!writeBookings(bookings)) {
            $alert.text('Your booking could not be saved: browser storage is unavailable or full.').removeClass('d-none');
            return;
        }

        justSaved = true;
        $form[0].reset();
        $branch.val(branchId);
        $success.text('Booking saved. Thank you, ' + booking.name + '! Our team will contact you to confirm availability.')
            .removeClass('d-none');
        renderHistory();
        $('html, body').animate({ scrollTop: Math.max($success.offset().top - 100, 0) }, 250);
    });

    $form.on('reset', function () {
        var keepSuccess = justSaved;
        justSaved = false;
        // Wait for the browser to restore default values, then rebuild the dependent parts
        setTimeout(function () {
            resetValidation();
            $('.is-valid').removeClass('is-valid');
            if (!keepSuccess) { $success.addClass('d-none'); }
            renderZones();
            renderPhotos();
            updateSummary();
        }, 0);
    });

    /* ---------- Start ---------- */
    $alert.data('defaultText', $alert.text());
    renderZones();
    renderPhotos();
    renderHistory();
    updateSummary();
});
