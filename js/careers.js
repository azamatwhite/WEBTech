'use strict';

// Используется jQuery 3.7.1. Весь код обернут в $(function () { ... })
$(function () {
    const $form = $('#careers-form');
    if (!$form.length) return;

    const $nameInput = $('#appName');
    const $phoneInput = $('#appPhone');
    const $positionSelect = $('#positionSelect');
    const $experienceInput = $('#appExperience');

    const MAX_LENGTH = 500;
    const STORAGE_KEY = 'careersApplications';

    // Отключаем стандартную валидацию браузера через .prop()
    $form.prop('noValidate', true);

    // 1. Показ и очистка ошибок
    function showError($input, message) {
        if ($input.siblings('.error-message').length === 0) {
            $input.parent().append('<small class="error-message text-danger d-block mt-1"></small>');
        }
        // ЦЕПОЧКА (Chaining из 4 методов): 1) .addClass() добавляет красную рамку, 2) .attr() ставит ARIA-атрибут,
        // 3) .siblings() находит соседний блок ошибки, 4) .text() записывает текст ошибки.
        $input.addClass('is-invalid').attr('aria-invalid', 'true').siblings('.error-message').text(message);
    }

    function clearError($input) {
        $input.removeClass('is-invalid').attr('aria-invalid', 'false').siblings('.error-message').text('');
    }

    // 2. Счетчик символов и подсказка по вакансии (Эффект №3: .slideDown / .slideUp)
    const $counter = $('<small class="text-muted d-block text-end mt-1"></small>');
    $experienceInput.parent().append($counter);

    const $posNotice = $('<div class="alert alert-info py-2 mt-2 mb-0 small"></div>').hide();
    $positionSelect.parent().append($posNotice);

    function updateCounter() {
        const len = $experienceInput.val().length;
        $counter.text(`${len} / ${MAX_LENGTH}`).toggleClass('text-danger fw-bold', len > MAX_LENGTH);
    }
    updateCounter();

    // 3. Сообщение об успехе и блок истории откликов (без класса d-none, так как !important ломает анимации jQuery)
    const $success = $('<div class="alert alert-success mb-3" role="alert"></div>').hide();
    $form.before($success);

    const $card = $form.closest('.card');
    const $history = $('<div class="card p-4 shadow-sm border-0 mt-4"></div>').html(`
        <div class="d-flex justify-content-between align-items-center">
            <h3 class="h5 mb-0">Submitted Applications</h3>
            <button type="button" id="toggle-apps" class="btn btn-outline-dark btn-sm">Show / Hide History</button>
        </div>
        <div id="apps-box" class="mt-3">
            <ul id="apps-list" class="list-group"></ul>
        </div>
    `);
    $card.after($history);

    const $appsBox = $history.find('#apps-box').hide();
    const $appsList = $history.find('#apps-list');

    // 4. Кнопки "Apply" в карточках вакансий (.each(), фильтр :not(:disabled))
    const $validOptions = $positionSelect.find('option:not(:disabled)');
    $('article.card').each(function (index) {
        const $option = $validOptions.eq(index);
        if (!$option.length) return;

        const $btn = $('<button type="button" class="btn btn-outline-primary btn-sm mt-3 align-self-start">Apply for this position</button>')
            .attr('data-val', $option.val());

        $(this).addClass('d-flex flex-column').append($btn);
    });

    // Делегирование клика по кнопкам "Apply" в карточках
    $('main').on('click', 'article.card button[data-val]', function () {
        const val = $(this).attr('data-val'); // 1-е использование $(this)
        $positionSelect.val(val).trigger('change');
        $('html, body').animate({ scrollTop: $form.offset().top - 80 }, 400);
        $nameInput.trigger('focus');
    });

    // 5. Список откликов из localStorage (Шаг 1: рендер списка на jQuery)
    // КОММЕНТАРИЙ: Вместо createElement, className и appendChild использованы $('<li>'), .addClass(),
    // .text() и .append(). Код создания списка с кнопкой Delete стал компактнее и нагляднее.
    function renderApplications() {
        let list = [];
        try { list = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch (e) { list = []; }

        $appsList.empty();
        if (!list.length) {
            $appsList.html('<li class="list-group-item text-muted">No applications submitted yet.</li>');
            return;
        }

        $.each(list, function (i, app) {
            const info = `${i + 1}. ${app.name} (${app.phone}) — ${app.position} [${app.date}]`;
            const $delBtn = $('<button type="button" class="btn btn-sm btn-outline-danger delete-btn ms-2">Delete</button>').attr('data-index', i);
            const $li = $('<li class="list-group-item d-flex justify-content-between align-items-center"></li>')
                .append($('<span></span>').text(info), $delBtn);
            $appsList.append($li);
        });
    }

    // 6. Event Delegation для удаления (Шаг 2)
    // КОММЕНТАРИЙ: Прямая привязка к .delete-btn не сработает, так как элементы списка создаются динамически
    // при каждом вызове renderApplications(). Делегирование на #apps-list ловит клики по новым кнопкам.
    $appsList.on('click', '.delete-btn', function () {
        const $btn = $(this); // 2-е использование $(this)
        const idx = Number($btn.attr('data-index'));
        const list = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        list.splice(idx, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        $btn.closest('li').slideUp(200, renderApplications);
    });

    // 7. Показ/скрытие истории (Шаг 3: Эффект №1 .slideToggle с длительностью 300 мс)
    $('#toggle-apps').on('click', function () {
        renderApplications();
        $appsBox.slideToggle(300);
    });

    // 8. Валидация полей с Regex (Шаг 4)
    // КОММЕНТАРИЙ: Атрибут required в браузере не заменяет серверную проверку, так как пользователь может
    // удалить его через DevTools или отправить запрос напрямую на сервер в обход формы.
    function validateForm() {
        let valid = true;
        $form.find('.form-control, .form-select').each(function () { clearError($(this)); });

        const name = $.trim($nameInput.val());
        const phone = $.trim($phoneInput.val());
        const pos = $positionSelect.val();
        const exp = $.trim($experienceInput.val());

        const nameRegex = /^[a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\s\-]{2,}$/;
        const digits = phone.replace(/\D/g, '');
        const phoneRegex = /^[78]\d{10}$/;

        if (!nameRegex.test(name)) {
            showError($nameInput, 'Enter a valid full name (at least 2 letters, no digits).');
            valid = false;
        }
        if (!phoneRegex.test(digits)) {
            showError($phoneInput, 'Enter a valid 11-digit phone number (e.g. +7 700 000 00 00).');
            valid = false;
        }
        if (!pos) {
            showError($positionSelect, 'Please select a position.');
            valid = false;
        }
        if (exp.length > MAX_LENGTH) {
            showError($experienceInput, `Maximum ${MAX_LENGTH} characters allowed.`);
            valid = false;
        }

        if (!valid) $form.find('.is-invalid:first').trigger('focus');
        return valid;
    }

    // 9. События input и change для полей формы
    $form.find('input[name], select, textarea').on('input change', function () {
        clearError($(this));
        updateCounter();
    });

    $positionSelect.on('change', function () {
        const selectedTitle = $(this).find('option:selected').text();
        if ($(this).val()) {
            $posNotice.text(`Selected role: ${selectedTitle}. Tip: Mention relevant experience below!`).slideDown(200);
        } else {
            $posNotice.slideUp(200);
        }
    });

    // 10. Отправка формы (Submit)
    // КОММЕНТАРИЙ: Без event.preventDefault() форма отправит GET-запрос и перезагрузит страницу,
    // сбросив выполнение JS-скрипта, анимации и сохранение в localStorage.
    $form.on('submit', function (event) {
        event.preventDefault();
        if (!validateForm()) return;

        const selectedText = $positionSelect.find('option:selected').text();
        const list = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        list.push({
            name: $.trim($nameInput.val()),
            phone: $.trim($phoneInput.val()),
            position: selectedText,
            experience: $.trim($experienceInput.val()),
            date: new Date().toLocaleDateString()
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

        // Эффект №2: .fadeIn() и в callback .fadeOut()
        $success.stop(true, true)
            .text(`Thank you, ${$.trim($nameInput.val())}! Your application for "${selectedText}" has been received.`)
            .fadeIn(400, function () {
                $(this).delay(3500).fadeOut(400);
            });

        $form[0].reset();
        $posNotice.slideUp(200);
        updateCounter();
        renderApplications();
    });

    renderApplications();
});