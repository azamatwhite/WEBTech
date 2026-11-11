
'use strict';

document.addEventListener('DOMContentLoaded', function () {

    const form = document.querySelector('#careers-form');
    const positionSelect = document.querySelector('#positionSelect');
    const main = document.querySelector('main');
    const nameInput = document.querySelector('#appName');

    if (!form || !positionSelect || !main) {
        return;
    }

    // 1. Select ішіндегі позицияларды массив пен объектілерге жинау
    const positions = Array.from(positionSelect.options)
        .filter(option => !option.disabled && option.value.trim() !== '')
        .map(option => ({
            value: option.value,
            title: option.textContent.trim()
        }));

    // 2. Select ішіндегі позицияларды цикл арқылы шығару
    const placeholder = positionSelect.querySelector('option:disabled');

    positionSelect.innerHTML = '';

    if (placeholder) {
        positionSelect.appendChild(placeholder);
    } else {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a position';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        positionSelect.appendChild(defaultOption);
    }

    positions.forEach(function (position) {
        const option = document.createElement('option');

        option.value = position.value;
        option.textContent = position.title;

        positionSelect.appendChild(option);
    });

    // 3. Позицияны value арқылы іздейтін функция
    function getPositionByValue(value) {
        return positions.find(function (position) {
            return position.value === value;
        }) || null;
    }

    // 4. Apply батырмасын жасайтын функция
    function createApplyButton(position) {
        const button = document.createElement('button');

        button.type = 'button';
        button.className = 'btn btn-primary mt-3';
        button.textContent = 'Apply for this position';
        button.dataset.position = position.value;

        return button;
    }

    // 5. Жұмыс карточкаларына батырмаларды қосу
    const jobCards = document.querySelectorAll('article.card');

    jobCards.forEach(function (card, index) {

        const position = positions[index];

        if (!position) {
            return;
        }

        const button = createApplyButton(position);

        card.classList.add('d-flex', 'flex-column');
        card.appendChild(button);
    });

    // 6. Хабарлама контейнерін JavaScript арқылы жасау
    const notice = document.createElement('div');

    notice.className = 'alert alert-info mt-2 hidden';
    notice.setAttribute('aria-live', 'polite');

    positionSelect.parentElement.appendChild(notice);

    // 7. Позиция өзгерген кездегі логика
    function updatePositionNotice() {

        const selectedValue = positionSelect.value;
        const position = getPositionByValue(selectedValue);

        if (position) {
            notice.textContent =
                `Selected role: ${position.title}. Mention your relevant experience below!`;

            notice.classList.remove('hidden');
            notice.hidden = false;

        } else {
            notice.classList.add('hidden');
            notice.hidden = true;
        }
    }

    positionSelect.addEventListener('change', updatePositionNotice);

    // 8. Event Delegation: барлық Apply батырмаларын бір тыңдаушы басқарады
    main.addEventListener('click', function (event) {

        const button = event.target.closest('button[data-position]');

        if (!button || !main.contains(button)) {
            return;
        }

        const selectedPosition = button.dataset.position;

        // Таңдалған позицияны select ішіне орнату
        positionSelect.value = selectedPosition;

        // change оқиғасын іске қосу
        positionSelect.dispatchEvent(
            new Event('change', { bubbles: true })
        );

        // Бұрынғы active класын алып тастау
        jobCards.forEach(function (card) {
            card.classList.remove('active');
        });

        // Таңдалған карточкаға active класын қосу
        button.closest('article.card').classList.add('active');

        // Формаға дейін жылжу
        form.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

        // Name өрісіне фокус беру
        if (nameInput) {
            nameInput.focus();
        }
    });

    // Бет ашылған кезде бастапқы мәнді тексеру
    updatePositionNotice();

});
