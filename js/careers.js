'use strict';

/* Careers page — jQuery. Load order on the page: jQuery, Bootstrap, this file. */
$(function () {
    var $form = $('#careers-form');
    if (!$form.length) { return; }

    var STORAGE_KEY = 'careersApplications';
    var KZ_MOBILE_CODES = ['700', '701', '702', '705', '706', '707', '708', '747', '771', '775', '776', '777', '778'];

    var $name = $('#appName');
    var $email = $('#appEmail');
    var $phone = $('#appPhone');
    var $position = $('#positionSelect');
    var $experience = $('#appExperience');
    var $success = $('#careers-success');
    var $alert = $('#careers-alert');

    var touched = {};
    var justSaved = false;

    /* ---------- Phone and email checks (same rules as js/booking.js) ---------- */
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
        name: function () {
            var value = $.trim($name.val());
            if (!value) { return 'Enter your full name.'; }
            return /^[\p{L}][\p{L}\s'’\-]{1,59}$/u.test(value) ? '' : 'Name must be 2–60 letters (no digits or symbols).';
        },
        email: function () { return getEmailError($email.val()); },
        phone: function () { return parseKzPhone($phone.val()).error; },
        position: function () {
            return $position.val() ? '' : 'Please select the position you are applying for.';
        },
        experience: function () {
            var length = $.trim($experience.val()).length;
            if (!length) { return 'Tell us about your experience.'; }
            if (length < 20) { return 'Please write at least 20 characters about your experience or motivation.'; }
            if (length > 1000) { return 'Your message must be 1,000 characters or fewer.'; }
            return '';
        }
    };
    var fieldOrder = ['name', 'email', 'phone', 'position', 'experience'];
    var $controls = { name: $name, email: $email, phone: $phone, position: $position, experience: $experience };

    /* ---------- Showing errors directly under each field ---------- */
    function showFieldState(key, message) {
        var $control = $controls[key];
        var $feedback = $control.nextAll('.invalid-feedback').first();
        if (message) {
            $control.addClass('is-invalid').removeClass('is-valid').attr('aria-invalid', 'true');
            $feedback.text(message);
        } else {
            $control.removeClass('is-invalid').addClass('is-valid').removeAttr('aria-invalid');
            $feedback.text('');
        }
    }

    function clearFieldState(key) {
        $controls[key].removeClass('is-invalid is-valid').removeAttr('aria-invalid');
        $controls[key].nextAll('.invalid-feedback').first().text('');
        touched[key] = false;
    }

    function validateField(key) {
        touched[key] = true;
        var message = validators[key]();
        showFieldState(key, message);
        return !message;
    }

    function validateAll() {
        var firstInvalid = null;
        $.each(fieldOrder, function (i, key) {
            if (!validateField(key) && !firstInvalid) { firstInvalid = key; }
        });
        return firstInvalid;
    }

    /* ---------- Saved applications (localStorage) ---------- */
    function readApplications() {
        try {
            var stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            return Array.isArray(stored) ? stored : [];
        } catch (error) {
            return [];
        }
    }

    function writeApplications(applications) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
            return true;
        } catch (error) {
            return false;
        }
    }

    /* ---------- Events ---------- */
    // After the first submit attempt, re-check each field as it is edited.
    // (No check on blur: an error appearing under the field would move the Submit/Reset button mid-click.)
    $form.on('input change', '[data-field]', function () {
        var key = $(this).data('field');
        $success.addClass('d-none');
        if (touched[key]) { validateField(key); }
        if (!$form.find('.is-invalid').length) { $alert.addClass('d-none'); }
    });

    $form.on('submit', function (event) {
        event.preventDefault();
        $success.addClass('d-none');
        var firstInvalid = validateAll();
        if (firstInvalid) {
            $alert.text($alert.data('defaultText')).removeClass('d-none');
            $controls[firstInvalid].trigger('focus');
            return;
        }
        $alert.addClass('d-none');

        var applications = readApplications();
        applications.push({
            name: $.trim($name.val()),
            email: $.trim($email.val()),
            phone: parseKzPhone($phone.val()).formatted,
            position: $position.find('option:selected').text(),
            experience: $.trim($experience.val()),
            submittedAt: new Date().toISOString()
        });
        if (!writeApplications(applications)) {
            $alert.text('Your application could not be saved: browser storage is unavailable or full.').removeClass('d-none');
            return;
        }

        justSaved = true;
        $form[0].reset();
        $success.text('Your application has been saved on this device. Thank you for your interest!').removeClass('d-none');
    });

    $form.on('reset', function () {
        var keepSuccess = justSaved;
        justSaved = false;
        // Wait for the browser to restore default values, then clear the validation state
        setTimeout(function () {
            $.each(fieldOrder, function (i, key) { clearFieldState(key); });
            $alert.addClass('d-none');
            if (!keepSuccess) { $success.addClass('d-none'); }
        }, 0);
    });

    $alert.data('defaultText', $alert.text());
});
