'use strict';

document.addEventListener('DOMContentLoaded', function () {
    // 1. HTML элементтерін табу
    const form = document.getElementById('careers-form');

    if (!form) {
        return;
    }

    const nameInput = document.getElementById('appName');
    const phoneInput = document.getElementById('appPhone');
    const positionSelect = document.getElementById('positionSelect');
    const experienceInput = document.getElementById('appExperience');

    const MAX_LENGTH = 500;
    const STORAGE_KEY = 'careersApplications';

    // Браузердің өз тексеруін өшіреміз, өз хабарламаларымыз шығады
    form.noValidate = true;

    // 2. Қате көрсету / өшіру (booking.js сияқты)
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

    function clearError(input) {
        const error = input.parentNode.querySelector('.error-message');

        if (error) {
            error.textContent = '';
        }

        input.classList.remove('is-invalid');
    }

    // 3. Әр өрісті тексеру (дұрыс болса true қайтарады)
    function validateName() {
        const value = nameInput.value.trim();

        if (value.length < 2) {
            showError(nameInput, 'Please enter your full name (at least 2 characters).');
            return false;
        }

        if (/\d/.test(value)) {
            showError(nameInput, 'Name should not contain numbers.');
            return false;
        }

        clearError(nameInput);
        return true;
    }

    function validatePhone() {
        // Тек цифрларды қалдырамыз: +7 700 000 00 00 -> 77000000000
        const digits = phoneInput.value.replace(/\D/g, '');

        if (digits.length !== 11 || (digits[0] !== '7' && digits[0] !== '8')) {
            showError(phoneInput, 'Enter a valid phone number, e.g. +7 700 000 00 00.');
            return false;
        }

        clearError(phoneInput);
        return true;
    }

    function validatePosition() {
        if (!positionSelect.value) {
            showError(positionSelect, 'Please select a position.');
            return false;
        }

        clearError(positionSelect);
        return true;
    }

    function validateExperience() {
        if (experienceInput.value.length > MAX_LENGTH) {
            showError(experienceInput, 'Maximum ' + MAX_LENGTH + ' characters allowed.');
            return false;
        }

        clearError(experienceInput);
        return true;
    }

    // 4. Textarea астына символ санағышын қосу
    const counter = document.createElement('small');
    counter.className = 'text-muted d-block text-end';
    experienceInput.parentNode.appendChild(counter);

    function updateCounter() {
        counter.textContent = experienceInput.value.length + ' / ' + MAX_LENGTH;
    }

    updateCounter();

    // 5. Сәтті жіберілгенде шығатын хабарлама
    const success = document.createElement('div');
    success.className = 'alert alert-success d-none';
    success.setAttribute('role', 'alert');
    form.parentNode.insertBefore(success, form);

    // 6. Open Positions карточкаларына "Apply" батырмасын қосу
    // Карточкалар мен select-тегі опциялар бірдей ретпен тұр,
    // сондықтан N-ші карточка = (N+1)-ші опция (0-ші опция "Select a position...")
    const cards = document.querySelectorAll('article.card');

    cards.forEach(function (card, index) {
        const option = positionSelect.options[index + 1];

        if (!option) {
            return;
        }

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-outline-primary btn-sm mt-3 align-self-start';
        button.textContent = 'Apply for this position';

        button.addEventListener('click', function () {
            positionSelect.value = option.value;
            clearError(positionSelect);
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
            nameInput.focus({ preventScroll: true });
        });

        card.classList.add('d-flex', 'flex-column');
        card.appendChild(button);
    });

    // 7. localStorage-ға өтінімді сақтау
    function saveApplication(data) {
        let list = [];

        try {
            list = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch (e) {
            list = [];
        }

        list.push(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }

    // 8. Жазу кезінде қатені бірден өшіру / тексеру
    nameInput.addEventListener('input', function () {
        if (nameInput.classList.contains('is-invalid')) {
            validateName();
        }
    });

    phoneInput.addEventListener('input', function () {
        if (phoneInput.classList.contains('is-invalid')) {
            validatePhone();
        }
    });

    positionSelect.addEventListener('change', validatePosition);

    experienceInput.addEventListener('input', function () {
        updateCounter();
        validateExperience();
    });

    // 9. Форманы жіберу
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        // Барлығын тексереміз (& қолданамыз, барлық қате бірден көрінсін)
        const isValid = validateName() &
            validatePhone() &
            validatePosition() &
            validateExperience();

        if (!isValid) {
            success.classList.add('d-none');
            return;
        }

        const selectedText = positionSelect.options[positionSelect.selectedIndex].text;

        saveApplication({
            name: nameInput.value.trim(),
            phone: phoneInput.value.trim(),
            position: selectedText,
            experience: experienceInput.value.trim(),
            date: new Date().toLocaleString()
        });

        success.textContent = 'Thank you, ' + nameInput.value.trim() +
            '! Your application for "' + selectedText + '" has been received. We will contact you soon.';
        success.classList.remove('d-none');

        form.reset();
        updateCounter();
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
});