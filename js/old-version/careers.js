// old-careers-version.js — Старые функции на Vanilla JS для сравнения (не подключается к странице)

// 1. Добавление кнопок "Apply" в карточки вакансий
const cards = document.querySelectorAll('article.card');
cards.forEach(function (card, index) {
    const option = positionSelect.options[index + 1];
    if (!option) return;
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

// 2. Счетчик символов
function updateCounter() {
    counter.textContent = experienceInput.value.length + ' / ' + MAX_LENGTH;
}

// 3. Валидация полей
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