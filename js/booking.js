'use strict';

/* Booking page — jQuery. Load order: jQuery, Bootstrap, js/menu-data.js, this file. */
$(function () {
    var $form = $('#booking-form');
    if (!$form.length) { return; }

    var STORAGE_KEY = 'dastarkhan_bookings';
    var DEPOSIT = 5000;            // booking deposit, ₸
    var MAX_GUESTS = 20;           // overall limit per booking
    var MAX_DISH_QTY = 20;
    var KZ_MOBILE_CODES = ['700', '701', '702', '705', '706', '707', '708', '747', '771', '775', '776', '777', '778'];
    var CATALOG = (typeof menuItems !== 'undefined') ? menuItems : [];   // from js/menu-data.js

    /* ---------- Data: change hall limits here (min / max guests; null = no hall-specific limit) ---------- */
    // Photo assignment follows js/gallery.js (the project's own branch tags).
    var BRANCHES = {
        auezov: {
            name: 'Mukhtar Auezov 33 (Auezov)',
            title: 'Mukhtar Auezov 33 — Interior',
            photos: [
                { src: 'images/interior/IMG_1170.jpg', title: 'Red Accent Dining Zone', alt: 'Auezov: dining zone with a red wall and blue glassware' },
                { src: 'images/interior/IMG_1171.jpg', title: 'Banquet Hall Setup', alt: 'Auezov: banquet hall with a long set table' },
                { src: 'images/interior/IMG_1180.jpg', title: 'Decorative Lighting Lounge', alt: 'Auezov: lounge area with warm pendant lamps' }
            ],
            zones: [
                { id: 'tapchan', group: 'Tapchan', name: 'Tapchan', label: 'Tapchan — up to 20 guests', description: 'Traditional tapchan seating for family gatherings and larger groups. Minimum 8 guests.', min: 8, max: 20 }
            ]
        },
        dostyk: {
            name: 'Dostyk 1',
            title: 'Dostyk 1 — Interior',
            photos: [
                { src: 'images/interior/IMG_1160.jpg', title: 'Oriental VIP Lounge', alt: 'Dostyk: oriental VIP lounge with carved wood and mosaic tiles' },
                { src: 'images/interior/IMG_1161.jpg', title: 'Main Wooden Hall', alt: 'Dostyk: main dining hall with carved wooden tables' },
                { src: 'images/interior/IMG_1165.JPG', title: 'Mosaic Archway Corridor', alt: 'Dostyk: ornate mosaic wall and arch' }
            ],
            zones: [
                { id: 'main-windows', group: 'Main Dining Hall', name: 'Tables near panoramic windows', label: 'Tables near panoramic windows', description: 'Tables beside the panoramic windows.', min: 1, max: null },
                { id: 'central-booths', group: 'Main Dining Hall', name: 'Central booths', label: 'Central booths — 4–6 guests', description: 'Central booth seating for groups of four to six guests.', min: 4, max: 6 },
                { id: 'east-hall', group: 'VIP Halls', name: 'East Hall', label: 'East Hall — up to 12 guests', description: 'A private room for family dinners and small celebrations. Minimum 6 guests.', min: 6, max: 12 },
                { id: 'khan-room', group: 'VIP Halls', name: 'Khan Room', label: 'Khan Room — up to 20 guests', description: 'A spacious private room for larger gatherings. Minimum 10 guests.', min: 10, max: 20 },
                { id: 'tea-lounge', group: 'Tea Lounge', name: 'Tea Lounge', label: 'Tea Lounge', description: 'A relaxed space for tea and conversation.', min: 1, max: null }
            ]
        }
    };
    var CATEGORY_NAMES = { lagmans: 'Lagmans & Ganfan', salads: 'Salads', turkish: 'Turkish & Kebabs', oriental: 'Oriental & Main Dishes' };

    /* ---------- Elements ---------- */
    var $branch = $('#branch-select'), $zoneGroup = $('#zone-options');
    var $gallery = $('#booking-gallery'), $galleryTitle = $('#branch-gallery-title');
    var $name = $('#guest-name'), $email = $('#guest-email'), $phone = $('#guest-phone');
    var $guests = $('#guest-count'), $date = $('#booking-date'), $time = $('#booking-time');
    var $highChair = $('#highChair'), $wishes = $('#special-wishes');
    var $success = $('#booking-success'), $alert = $('#booking-alert'), $notices = $('#booking-notices');
    var $preorderPanel = $('#preorder-panel'), $menuList = $('#menu-list'), $preorderSummary = $('#preorder-summary');

    var $modal = $('#bookingPhotoModal'), $modalImage = $('#bookingModalImage');
    var $modalTitle = $('#bookingPhotoModalLabel'), $modalCounter = $('#bookingPhotoCounter');
    var $historyBox = $('#history-box'), $historyList = $('#history-list'), $historyToggle = $('#toggle-history');

    var $pay = $('#paymentModal');

    var activePhotos = [], activePhotoIndex = 0;
    var touched = {};
    var order = {};               // pre-order: dish id -> quantity
    var pendingBooking = null;    // booking waiting for payment
    var processing = false;
    var justSaved = false;

    /* ---------- Helpers ---------- */
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function formatDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
    function money(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0') + '\u00A0₸'; }

    var now = new Date();
    var TODAY = formatDate(now);
    var LAST_DAY = formatDate(new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()));
    $date.attr({ min: TODAY, max: LAST_DAY });
    $('#deposit-note').text(money(DEPOSIT));

    function getBranch() { return BRANCHES[$branch.val()] || null; }
    function getSelectedZone() {
        var branch = getBranch();
        var id = $zoneGroup.find('input[name="zone"]:checked').val();
        if (!branch || !id) { return null; }
        var found = $.grep(branch.zones, function (zone) { return zone.id === id; });
        return found.length ? found[0] : null;
    }
    function wantsPreorder() { return $('input[name="preorder"]:checked').val() === 'yes'; }

    function getDish(id) {
        var found = $.grep(CATALOG, function (dish) { return dish.id === id; });
        return found.length ? found[0] : null;
    }
    function getOrderLines() {
        var lines = [];
        $.each(order, function (id, qty) {
            var dish = getDish(id);
            if (dish && qty > 0) { lines.push({ id: id, name: dish.name, qty: qty, price: dish.price }); }
        });
        return lines;
    }
    function getOrderTotal() {
        var total = 0;
        $.each(getOrderLines(), function (i, line) { total += line.qty * line.price; });
        return total;
    }
    function getPayableTotal() { return DEPOSIT + (wantsPreorder() ? getOrderTotal() : 0); }

    /* ---------- Phone and email checks (same rules as js/careers.js) ---------- */
    function parseKzPhone(raw) {
        var value = $.trim(raw);
        if (!value) { return { error: 'Enter your phone number.' }; }
        if (!/^\+?[\d\s()\-]+$/.test(value)) { return { error: 'Use digits only. Spaces, hyphens and parentheses are allowed.' }; }
        if (value.split('(').length !== value.split(')').length) { return { error: 'Check the parentheses in the phone number.' }; }
        var digits = value.replace(/\D/g, '');
        if (value.charAt(0) === '+' && digits.charAt(0) !== '7') { return { error: 'Kazakhstan numbers start with +7.' }; }
        if (digits.length === 11 && digits.charAt(0) === '8') { digits = '7' + digits.slice(1); }
        if (digits.length !== 11) { return { error: 'A Kazakhstan mobile number has 11 digits, for example +7 701 123 45 67.' }; }
        if (digits.charAt(0) !== '7') { return { error: 'Enter a Kazakhstan number starting with +7, 7 or 8.' }; }
        if ($.inArray(digits.substr(1, 3), KZ_MOBILE_CODES) === -1) {
            return { error: 'Enter a Kazakhstan mobile number (codes such as 701, 705, 707, 747, 775, 777).' };
        }
        return { error: '', formatted: '+7 ' + digits.substr(1, 3) + ' ' + digits.substr(4, 3) + ' ' + digits.substr(7, 2) + ' ' + digits.substr(9, 2) };
    }

    function getEmailError(raw) {
        var value = $.trim(raw);
        if (!value) { return 'Enter your email address.'; }
        if (/\s/.test(value)) { return 'The email address must not contain spaces.'; }
        var parts = value.split('@');
        if (parts.length !== 2 || !parts[0] || !parts[1]) { return 'Enter an email like name@example.com.'; }
        var local = parts[0], domain = parts[1];
        if (value.length > 254 || local.length > 64) { return 'This email address is too long.'; }
        if (!/^[A-Za-z0-9._%+\-]+$/.test(local)) { return 'The part before @ contains invalid characters.'; }
        if (local.charAt(0) === '.' || local.slice(-1) === '.' || local.indexOf('..') !== -1) {
            return 'The part before @ must not start or end with a dot or contain two dots in a row.';
        }
        var labels = domain.split('.');
        if (labels.length < 2) { return 'The domain needs an extension, for example example.com.'; }
        var badLabels = $.grep(labels, function (label) { return !/^[A-Za-z0-9]([A-Za-z0-9\-]*[A-Za-z0-9])?$/.test(label); });
        if (badLabels.length) { return 'The domain after @ is not valid (check for double dots or odd characters).'; }
        if (!/^[A-Za-z]{2,}$/.test(labels[labels.length - 1])) { return 'The domain extension must be at least two letters.'; }
        return '';
    }

    /* ---------- Guest limits of the chosen hall ---------- */
    function guestLimits(zone) {
        return { min: zone && zone.min ? zone.min : 1, max: zone && zone.max ? zone.max : MAX_GUESTS };
    }

    function updateGuestsHint() {
        var zone = getSelectedZone();
        if (!zone) { $('#guests-hint').text('Choose a hall to see its guest limits.'); return; }
        var limits = guestLimits(zone);
        $('#guests-hint').text(zone.name + ': ' + (limits.min === limits.max ? limits.min : limits.min + '–' + limits.max) + ' guests.');
        $guests.attr({ min: limits.min, max: limits.max });
    }

    /* ---------- Main-form validators: each returns an error message or '' ---------- */
    var validators = {
        branch: function () { return getBranch() ? '' : 'Please choose a restaurant location.'; },
        zone: function () { return getSelectedZone() ? '' : 'Please choose a hall at this location.'; },
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
            if (zone) {
                var limits = guestLimits(zone);
                if (count < limits.min) {
                    return zone.name + ' is for groups of at least ' + limits.min + ' guests (up to ' + limits.max + '). Add guests or choose a smaller hall.';
                }
                if (count > limits.max) {
                    return zone.name + ' seats up to ' + limits.max + ' guests. Reduce the group size or choose a larger hall.';
                }
            }
            return '';
        },
        date: function () {
            var value = $date.val();
            if (!value) { return 'Choose a visit date.'; }
            var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
            if (!(m && formatDate(new Date(+m[1], +m[2] - 1, +m[3])) === value)) { return 'Enter a valid date.'; }
            if (value < TODAY) { return 'The date cannot be in the past.'; }
            if (value > LAST_DAY) { return 'Bookings open up to one year in advance.'; }
            return '';
        },
        time: function () {
            var value = $time.val();
            if (!value) { return 'Select a time slot.'; }
            if ($date.val() === TODAY) {
                var current = new Date(), slot = value.split(':');
                if (+slot[0] * 60 + +slot[1] <= current.getHours() * 60 + current.getMinutes()) {
                    return 'This time slot has already passed today. Choose a later slot or another date.';
                }
            }
            return '';
        },
        preorder: function () {
            if (!wantsPreorder()) { return ''; }
            return getOrderLines().length ? '' : 'Choose at least one dish, or select “No, just the table”.';
        }
    };
    var fieldOrder = ['branch', 'zone', 'name', 'phone', 'email', 'date', 'time', 'guests', 'preorder'];
    var $controls = {
        branch: $branch, zone: $zoneGroup, name: $name, email: $email, phone: $phone,
        guests: $guests, date: $date, time: $time, preorder: $preorderPanel
    };
    var NO_VALID_STYLE = { zone: true, preorder: true };

    /* ---------- Errors directly under each field ---------- */
    function applyState($control, message, skipValid) {
        var $feedback = $control.nextAll('.invalid-feedback').first();
        if (message) {
            $control.addClass('is-invalid').removeClass('is-valid').attr('aria-invalid', 'true');
            $feedback.text(message);
        } else {
            $control.removeClass('is-invalid').removeAttr('aria-invalid');
            if (!skipValid) { $control.addClass('is-valid'); }
            $feedback.text('');
        }
    }

    function showFieldState(key, message) {
        applyState($controls[key], message, NO_VALID_STYLE[key]);
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

    function revalidateIfTouched(key) { if (touched[key]) { validateField(key); } }

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

    /* ---------- Halls and photos ---------- */
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
            var $img = $('<img>', { src: photo.src, alt: photo.alt, 'class': 'w-100 h-100 rounded shadow-sm object-fit-cover' });
            var $button = $('<button>', {
                type: 'button', 'class': 'btn p-0 border-0 w-100 booking-photo',
                'data-photo-index': index, 'aria-label': 'Enlarge photo: ' + photo.title
            }).append($('<span>', { 'class': 'ratio ratio-4x3 d-block' }).append($img));
            $img.on('error', function () { $button.prop('disabled', true).addClass('opacity-50'); });
            var $caption = $('<span>', { 'class': 'd-block small text-muted text-center mt-1', text: photo.title });
            $gallery.append($('<div>', { 'class': 'col' }).append($button, $caption));
        });
    }

    function onBranchChanged() {
        renderZones();
        renderPhotos();
        clearFieldState('zone');
        updateGuestsHint();
        revalidateIfTouched('guests');
        updateSummary();
    }

    /* ---------- Photo lightbox ---------- */
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

    /* ---------- Pre-order: pick dishes from the menu ---------- */
    function renderMenu() {
        var category = $('#menu-category').val();
        var query = $.trim($('#menu-search').val()).toLowerCase();
        $menuList.empty();
        var shown = 0;
        $.each(CATALOG, function (i, dish) {
            if (category !== 'all' && dish.category !== category) { return; }
            if (query && (dish.name + ' ' + dish.ingredients).toLowerCase().indexOf(query) === -1) { return; }
            shown++;
            var $row = $('<div>', { 'class': 'd-flex align-items-center gap-3 py-2 border-bottom', 'data-dish': dish.id });
            var $img = $('<img>', { src: dish.image, alt: '', width: 56, height: 56, loading: 'lazy', 'class': 'rounded object-fit-cover flex-shrink-0' });
            var $info = $('<div>', { 'class': 'flex-grow-1' }).append(
                $('<div>', { 'class': 'fw-semibold lh-sm', text: dish.name }),
                $('<small>', { 'class': 'text-muted', text: dish.weight + ' g · ' + money(dish.price) })
            );
            var $stepper = $('<div>', { 'class': 'd-flex align-items-center gap-2 flex-shrink-0' }).append(
                $('<button>', { type: 'button', 'class': 'btn btn-outline-secondary btn-sm dish-minus', 'aria-label': 'Remove one ' + dish.name, text: '−' }),
                $('<span>', { 'class': 'dish-qty text-center fw-semibold', style: 'min-width: 1.5rem;', text: order[dish.id] || 0 }),
                $('<button>', { type: 'button', 'class': 'btn btn-outline-primary btn-sm dish-plus', 'aria-label': 'Add one ' + dish.name, text: '+' })
            );
            $menuList.append($row.append($img, $info, $stepper));
        });
        if (!shown) { $menuList.append($('<p>', { 'class': 'text-muted py-3 mb-0', text: 'No dishes match your search.' })); }
    }

    function renderPreorderSummary() {
        var lines = getOrderLines();
        $preorderSummary.empty();
        if (!lines.length) {
            $preorderSummary.append($('<p>', { 'class': 'text-muted small mb-0', text: 'No dishes selected yet.' }));
            return;
        }
        var $list = $('<ul>', { 'class': 'list-unstyled small mb-2' });
        $.each(lines, function (i, line) {
            $list.append($('<li>', { 'class': 'd-flex justify-content-between', text: '' }).append(
                $('<span>', { text: line.qty + ' × ' + line.name }),
                $('<span>', { text: money(line.qty * line.price) })
            ));
        });
        $preorderSummary.append($list, $('<div>', { 'class': 'd-flex justify-content-between fw-bold' }).append(
            $('<span>', { text: 'Pre-order total' }), $('<span>', { text: money(getOrderTotal()) })
        ));
    }

    function changeDish(id, step) {
        var qty = Math.min(MAX_DISH_QTY, Math.max(0, (order[id] || 0) + step));
        if (qty) { order[id] = qty; } else { delete order[id]; }
        $menuList.find('[data-dish="' + id + '"] .dish-qty').text(qty);
        renderPreorderSummary();
        revalidateIfTouched('preorder');
        updateSummary();
    }

    $menuList.on('click', '.dish-plus', function () { changeDish($(this).closest('[data-dish]').data('dish'), 1); });
    $menuList.on('click', '.dish-minus', function () { changeDish($(this).closest('[data-dish]').data('dish'), -1); });
    $('#menu-category').on('change', renderMenu);
    $('#menu-search').on('input', renderMenu);

    function onPreorderToggled() {
        $preorderPanel.toggleClass('d-none', !wantsPreorder());
        if (wantsPreorder()) { renderMenu(); renderPreorderSummary(); } else { clearFieldState('preorder'); }
        updateSummary();
    }

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
        var branch = getBranch(), zone = getSelectedZone();
        $('#sum-branch').text(branch ? branch.name : '—');
        $('#sum-zone').text(zone ? zone.label : 'Not selected');
        $('#sum-name').text($.trim($name.val()) || 'Not provided');
        $('#sum-contact').text($.grep([$.trim($email.val()), $.trim($phone.val())], Boolean).join(' / ') || 'Not provided');
        $('#sum-date').text(($date.val() || 'Date not set') + ' at ' + ($time.val() || 'time not set'));
        $('#sum-guests').text($.trim($guests.val()) || 'Not specified');
        $('#sum-chair').text($highChair.is(':checked') ? 'Yes' : 'No');
        $('#sum-wishes').text($.trim($wishes.val()) || 'None');
        var lines = wantsPreorder() ? getOrderLines() : [];
        $('#sum-preorder').text(lines.length ? lines.length + ' dish(es), ' + money(getOrderTotal()) : 'None');
        $('#sum-total').text(money(getPayableTotal()));
        updateNotices();
    }

    /* ---------- Booking history (localStorage) ---------- */
    function readBookings() {
        try {
            var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            return Array.isArray(saved) ? saved : [];
        } catch (error) { return []; }
    }
    function writeBookings(bookings) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings)); return true; } catch (error) { return false; }
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
            var pay = booking.payment
                ? money(booking.payment.amount) + ' paid via ' + booking.payment.method + ' •••• ' + booking.payment.last4 + ' (' + booking.payment.ref + ')'
                : 'not recorded';
            var dishes = $.map(booking.preorder || [], function (line) { return line.qty + ' × ' + line.name; }).join(', ');
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
                ),
                $('<div>', { 'class': 'small d-flex flex-wrap column-gap-4' }).append(
                    detail('Payment', pay),
                    detail('Pre-order', dishes || 'none')
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

    /* ---------- Payment (demo checkout: nothing is charged, card data is never stored) ---------- */
    var payFields = ['number', 'holder', 'expiry', 'cvv'];

    function luhnOk(digits) {
        var sum = 0, doubleIt = false;
        for (var i = digits.length - 1; i >= 0; i--) {
            var n = Number(digits.charAt(i));
            if (doubleIt) { n *= 2; if (n > 9) { n -= 9; } }
            sum += n;
            doubleIt = !doubleIt;
        }
        return sum % 10 === 0;
    }

    var payValidators = {
        number: function (v) {
            var digits = v.replace(/\s/g, '');
            if (!digits) { return 'Enter your card number.'; }
            if (!/^\d{16}$/.test(digits)) { return 'A card number has 16 digits.'; }
            return luhnOk(digits) ? '' : 'This card number is not valid. Check the digits.';
        },
        holder: function (v) {
            v = $.trim(v);
            if (!v) { return 'Enter the name as printed on the card.'; }
            return /^[\p{L}][\p{L}\s.'’\-]{1,49}$/u.test(v) ? '' : 'Use letters only, for example NAME SURNAME.';
        },
        expiry: function (v) {
            var m = /^(\d{2})\/(\d{2})$/.exec($.trim(v));
            if (!v) { return 'Enter the expiry date.'; }
            if (!m || +m[1] < 1 || +m[1] > 12) { return 'Use the format MM/YY, for example 08/28.'; }
            var year = 2000 + Number(m[2]), month = Number(m[1]);
            var current = new Date();
            if (year < current.getFullYear() || (year === current.getFullYear() && month < current.getMonth() + 1)) {
                return 'This card has expired.';
            }
            return '';
        },
        cvv: function (v) {
            if (!v) { return 'Enter the 3-digit CVV code.'; }
            return /^\d{3}$/.test(v) ? '' : 'CVV is 3 digits.';
        }
    };
    function payControl(key) { return $('#pay-' + key); }
    function validatePayField(key) {
        var message = payValidators[key](payControl(key).val());
        applyState(payControl(key), message, false);
        return !message;
    }

    // Format as the user types
    $pay.on('input', '#pay-number', function () {
        var digits = $(this).val().replace(/\D/g, '').slice(0, 16);
        $(this).val(digits.replace(/(.{4})/g, '$1 ').replace(/\s$/, ''));
    });
    $pay.on('input', '#pay-expiry', function () {
        var digits = $(this).val().replace(/\D/g, '').slice(0, 4);
        $(this).val(digits.length > 2 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits);
    });
    $pay.on('input', '#pay-cvv', function () { $(this).val($(this).val().replace(/\D/g, '').slice(0, 3)); });
    // Re-check a card field once it was flagged
    $pay.on('input', '[data-pay]', function () {
        var $f = $(this);
        if ($f.hasClass('is-invalid')) { validatePayField($f.data('pay')); }
    });

    function openPayment(booking) {
        pendingBooking = booking;
        processing = false;
        $.each(payFields, function (i, key) { payControl(key).val('').removeClass('is-invalid is-valid').nextAll('.invalid-feedback').first().text(''); });
        $('#pay-kaspi').prop('checked', true);
        $('#pay-stage-form, #pay-footer-form').removeClass('d-none');
        $('#pay-stage-done, #pay-done-close').addClass('d-none');
        $('#pay-submit').prop('disabled', false).text('Pay ' + money(booking.payment.amount));
        $('#pay-cancel').prop('disabled', false);
        $('#pay-booking-info').text(booking.branch + ' · ' + booking.zone + ' · ' + booking.date + ' at ' + booking.time + ' · ' + booking.guests + ' guests');
        var $lines = $('#pay-lines').empty();
        $lines.append($('<li>', { 'class': 'd-flex justify-content-between' }).append(
            $('<span>', { text: 'Booking deposit' }), $('<span>', { text: money(DEPOSIT) })));
        $.each(booking.preorder, function (i, line) {
            $lines.append($('<li>', { 'class': 'd-flex justify-content-between gap-2' }).append(
                $('<span>', { text: line.qty + ' × ' + line.name }), $('<span>', { 'class': 'text-nowrap', text: money(line.qty * line.price) })));
        });
        $('#pay-total').text(money(booking.payment.amount));
        bootstrap.Modal.getOrCreateInstance($pay[0]).show();
    }

    $pay.on('hide.bs.modal', function (event) { if (processing) { event.preventDefault(); } });

    $('#pay-submit').on('click', function () {
        if (processing || !pendingBooking) { return; }
        var firstInvalid = null;
        $.each(payFields, function (i, key) {
            if (!validatePayField(key) && !firstInvalid) { firstInvalid = key; }
        });
        if (firstInvalid) { payControl(firstInvalid).trigger('focus'); return; }

        processing = true;
        var $button = $(this);
        $button.prop('disabled', true).text('Processing…');
        $('#pay-cancel, #pay-close').prop('disabled', true);
        var digits = payControl('number').val().replace(/\s/g, '');
        var method = $('input[name="payMethod"]:checked').val();

        setTimeout(function () {
            var booking = pendingBooking;
            booking.payment.method = method;
            booking.payment.last4 = digits.slice(-4);       // only the last 4 digits are kept
            booking.payment.status = 'paid';
            booking.payment.ref = 'DK-' + Date.now().toString(36).toUpperCase();
            $.each(payFields, function (i, key) { payControl(key).val(''); });   // wipe card data

            var bookings = readBookings();
            bookings.push(booking);
            var saved = writeBookings(bookings);
            processing = false;
            $('#pay-close').prop('disabled', false);
            pendingBooking = null;

            if (!saved) {
                bootstrap.Modal.getOrCreateInstance($pay[0]).hide();
                $alert.text('Payment went through but the booking could not be saved: browser storage is unavailable or full.').removeClass('d-none');
                return;
            }
            $('#pay-stage-form, #pay-footer-form').addClass('d-none');
            $('#pay-stage-done, #pay-done-close').removeClass('d-none');
            $('#pay-done-text').text('Thank you, ' + booking.name + '! ' + money(booking.payment.amount) + ' paid via ' + booking.payment.method + '. We look forward to seeing you on ' + booking.date + ' at ' + booking.time + '.');
            $('#pay-done-ref').text(booking.payment.ref);

            finishBooking(booking);
        }, 1200);
    });

    function finishBooking(booking) {
        var branchId = booking.branchId;
        justSaved = true;
        $form[0].reset();
        $branch.val(branchId);
        $success.text('Booking confirmed and paid (' + booking.payment.ref + '). Thank you, ' + booking.name + '!').removeClass('d-none');
        renderHistory();
    }

    /* ---------- Main-form events ---------- */
    $branch.on('change', onBranchChanged);

    // After the first submit attempt, re-check each field as it is edited.
    // (No check on blur: an error appearing under the field would move the Submit/Reset button mid-click.)
    $form.on('input change', '[data-field]', function () {
        var key = $(this).data('field');
        $success.addClass('d-none');
        if (key === 'preorder') { onPreorderToggled(); }
        revalidateIfTouched(key);
        if (key === 'zone') { updateGuestsHint(); revalidateIfTouched('guests'); }
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
            var $target = firstInvalid === 'zone' ? $zoneGroup.find('input').first()
                : firstInvalid === 'preorder' ? $('#menu-search') : $controls[firstInvalid];
            $target.trigger('focus');
            return;
        }
        $alert.addClass('d-none');

        var zone = getSelectedZone();
        var lines = wantsPreorder() ? getOrderLines() : [];
        var preorderTotal = 0;
        $.each(lines, function (i, line) { preorderTotal += line.qty * line.price; });
        openPayment({
            name: $.trim($name.val()),
            email: $.trim($email.val()),
            phone: parseKzPhone($phone.val()).formatted,
            branch: getBranch().name,
            branchId: $branch.val(),
            zone: zone.label,
            zoneId: zone.id,
            guests: Number($guests.val()),
            date: $date.val(),
            time: $time.val(),
            highChair: $highChair.is(':checked') ? 'Yes' : 'No',
            wishes: $.trim($wishes.val()),
            preorder: lines,
            deposit: DEPOSIT,
            preorderTotal: preorderTotal,
            payment: { amount: DEPOSIT + preorderTotal, method: '', last4: '', status: 'pending', ref: '' },
            savedAt: new Date().toISOString()
        });
    });

    $form.on('reset', function () {
        var keepSuccess = justSaved;
        justSaved = false;
        setTimeout(function () {
            order = {};
            resetValidation();
            $('.is-valid').removeClass('is-valid');
            if (!keepSuccess) { $success.addClass('d-none'); }
            renderZones();
            renderPhotos();
            onPreorderToggled();
            updateGuestsHint();
            updateSummary();
        }, 0);
    });

    /* ---------- Start ---------- */
    $alert.data('defaultText', $alert.text());
    renderZones();
    renderPhotos();
    renderHistory();
    updateGuestsHint();
    updateSummary();
});
