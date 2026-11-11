'use strict';

$(function () {

    // 1. Form elements
    const $form = $('#careers-form');

    if (!$form.length) return;

    const $nameInput = $('#appName');
    const $phoneInput = $('#appPhone');
    const $positionSelect = $('#positionSelect');
    const $experienceInput = $('#appExperience');

    // Егер HTML-де Email өрісі жоқ болса, оны кодпен динамикалық түрде жасаймыз (HTML Freeze сақтау үшін)
    let $emailInput = $('#appEmail, input[type="email"]').first();

    if (!$emailInput.length) {
        const $emailCol = $(`
            <div class="col-12 mt-3">
                <label class="form-label fw-medium" for="appEmail">Email Address:</label>
                <input class="form-control" id="appEmail" name="appEmail" placeholder="example@mail.com" type="email">
            </div>
        `);
        $phoneInput.closest('.row').append($emailCol);
        $emailInput = $('#appEmail');
    }

    const MAX_LENGTH = 500;
    const STORAGE_KEY = 'careersApplications';

    $form.prop('noValidate', true);

    // 2. Show error message (Chaining 3+ methods)
    function showError($input, message) {
        if (!$input.siblings('.error-message').length) {
            $input.after(
                '<small class="error-message text-danger d-block mt-1"></small>'
            );
        }

        $input
            .addClass('is-invalid error')
            .attr('aria-invalid', 'true')
            .siblings('.error-message')
            .text(message);
    }

    // 3. Clear error message (Chaining 3+ methods)
    function clearError($input) {
        $input
            .removeClass('is-invalid error')
            .attr('aria-invalid', 'false')
            .siblings('.error-message')
            .text('');
    }

    // 4. Character counter
    const $counter = $(
        '<small class="text-muted d-block text-end mt-1"></small>'
    );

    $experienceInput.parent().append($counter);

    function updateCounter() {
        const length = ($experienceInput.val() || '').length;

        $counter
            .text(`${length} / ${MAX_LENGTH}`)
            .toggleClass('text-danger fw-bold', length > MAX_LENGTH);
    }

    updateCounter();

    // 5. Success message
    const $success = $(
        '<div class="alert alert-success success mb-3" role="alert"></div>'
    ).hide();

    $form.before($success);

    // 6. Application history container
    const $card = $form.closest('.card');

    const $history = $(`
        <div class="card p-4 shadow-sm border-0 mt-4">
            <div class="d-flex justify-content-between align-items-center">
                <h3 class="h5 mb-0">Submitted Applications</h3>
                <button type="button" id="toggle-apps" class="btn btn-outline-primary btn-sm">
                    Show / Hide History
                </button>
            </div>
            <div id="apps-box" class="mt-3">
                <ul id="apps-list" class="list-group"></ul>
            </div>
        </div>
    `);

    $card.after($history);

    const $appsBox = $history.find('#apps-box').hide();
    const $appsList = $history.find('#apps-list');

    // 7. Load applications from LocalStorage
    function loadApplications() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch (error) {
            return [];
        }
    }

    // 8. Render applications
    function renderApplications() {
        const applications = loadApplications();

        $appsList.empty();

        if (applications.length === 0) {
            $appsList.html(
                '<li class="list-group-item text-muted">No applications submitted yet.</li>'
            );
            return;
        }

        $.each(applications, function (index, app) {
            const info =
                `${index + 1}. ${app.name} (${app.email}) — ` +
                `${app.phone} — ${app.position} [${app.date}]`;

            const $deleteButton = $('<button>', {
                type: 'button',
                class: 'btn btn-danger btn-sm delete-btn ms-2',
                text: 'Delete'
            }).attr('data-index', index);

            const $item = $('<li>', {
                class: 'list-group-item d-flex justify-content-between align-items-center'
            });

            const $text = $('<span>').text(info);

            $item.append($text, $deleteButton);
            $appsList.append($item);
        });
    }

    // 9. Delete application using event delegation
    $appsList.on('click', '.delete-btn', function (event) {
        event.preventDefault();

        const $button = $(this);
        const index = Number($button.attr('data-index'));
        const applications = loadApplications();

        if (index < 0 || index >= applications.length) {
            return;
        }

        applications.splice(index, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));

        $button.closest('li').slideUp(200, function () {
            renderApplications();
        });
    });

    // 10. Show / Hide history
    $('#toggle-apps').on('click', function () {
        renderApplications();
        $appsBox.slideToggle(300);
    });

    // 11. Form validation
    function validateForm() {
        let valid = true;

        $form.find('.form-control, .form-select').each(function () {
            clearError($(this));
        });

        const name = $.trim($nameInput.val());
        const email = $.trim($emailInput.val());
        const phone = $.trim($phoneInput.val());
        const position = $positionSelect.val();
        const experience = $.trim($experienceInput.val());

        // Name validation
        const nameRegex = /^[a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\s-]{2,}$/;
        if (!nameRegex.test(name)) {
            showError($nameInput, 'Enter a valid full name (at least 2 letters).');
            valid = false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError($emailInput, 'Enter a valid email address (e.g., name@mail.com).');
            valid = false;
        }

        // Phone validation (10 to 15 digits allowed so +7 700 000 00 00 or 8700... works smoothly)
        const digits = phone.replace(/\D/g, '');
        if (digits.length < 10 || digits.length > 15) {
            showError($phoneInput, 'Enter a valid phone number (at least 10 digits).');
            valid = false;
        }

        // Position validation
        if (!position) {
            showError($positionSelect, 'Please select a position.');
            valid = false;
        }

        // Experience validation
        if (experience.length === 0) {
            showError($experienceInput, 'Please briefly describe your experience.');
            valid = false;
        } else if (experience.length > MAX_LENGTH) {
            showError($experienceInput, `Maximum ${MAX_LENGTH} characters allowed.`);
            valid = false;
        }

        // Focus first invalid field
        if (!valid) {
            $form.find('.is-invalid:first').trigger('focus');
        }

        return valid;
    }

    // 12. Clear errors when user changes input
    $form.on('input change', 'input, select, textarea', function () {
        clearError($(this));
        updateCounter();
    });

    // 13. Submit form
    $form.on('submit', function (event) {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        const name = $.trim($nameInput.val());
        const email = $.trim($emailInput.val());
        const phone = $.trim($phoneInput.val());
        const selectedPosition = $positionSelect.find('option:selected').text();
        const experience = $.trim($experienceInput.val());

        const applications = loadApplications();

        const newApplication = {
            name: name,
            email: email,
            phone: phone,
            position: selectedPosition,
            experience: experience,
            date: new Date().toLocaleDateString()
        };

        applications.push(newApplication);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));

        // Show success message
        $success
            .stop(true, true)
            .text(`Thank you, ${name}! Your application for "${selectedPosition}" has been received.`)
            .fadeIn(400, function () {
                $(this).delay(3500).fadeOut(400);
            });

        // Reset form
        $form[0].reset();
        $positionSelect.val('');

        // Clear previous errors
        $form.find('.form-control, .form-select').each(function () {
            clearError($(this));
        });

        updateCounter();
        renderApplications();
        $appsBox.slideDown(300); // Сақталған бойда тізімді бірден ашып көрсетеді
    });

    // 14. Initial history rendering
    renderApplications();

});