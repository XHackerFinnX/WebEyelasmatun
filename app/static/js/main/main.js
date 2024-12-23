document.addEventListener('DOMContentLoaded', async function () {
    const today = 'today';
    let availableDates = [];

    try {
        const responsedr = await fetch('/date_record', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ today }),
        });

        if (responsedr.ok) {
            const data = await responsedr.json();
            availableDates = data.dates;

            // Выполняем main после получения availableDates
            await main();
        } else {
            console.error('Ошибка при выполнении запроса:', responsedr.status);
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }

    // Основная функция для получения IP и отправки на сервер
    async function main() {
        async function getUserIP() {
            try {
                const response = await fetch('https://api.ipify.org?format=json');
                if (!response.ok) throw new Error('Ошибка получения IP');
                const data = await response.json();
                return data.ip;
            } catch (error) {
                return null;
            }
        }

        async function sendIPToServer(ip) {
            try {
                const response = await fetch('/save-ip', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ ip }),
                });

                if (!response.ok) throw new Error('Ошибка отправки IP');
            } catch (error) {
                console.error(error);
            }
        }

        const ip = await getUserIP();
        if (ip) {
            await sendIPToServer(ip);
        } else {
            console.error('');
        }
    }

    let calendar = flatpickr("#calendar", {
        inline: true,
        minDate: "today",
        dateFormat: "Y-m-d",
        locale: "ru",
        monthSelectorType: "static",
        onDayCreate: function(dObj, dStr, fp, dayElem) {
            const dateStr = dayElem.dateObj.toISOString().split('T')[0];
            if (availableDates.includes(dateStr)) {
                dayElem.style.border = "2px solid green";
                dayElem.style.borderRadius = "50%";
                dayElem.style.boxSizing = "border-box";
            }
        },
        onChange: function(selectedDates, dateStr, instance) {
            const bookButton = document.getElementById('book-button');
            bookButton.disabled = selectedDates.length === 0;
        }
    });

    const bookButton = document.getElementById('book-button');
    const errorPopup = document.getElementById('errorPopup');
    const closePopupButton = document.getElementById('closePopup');

    bookButton.addEventListener('click', function() {
        const selectedDate = calendar.selectedDates[0];
        if (selectedDate) {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const isAvailable = availableDates.includes(dateStr);

            if (isAvailable) {
                openModal();  // Вызов функции для открытия модального окна
            } else {
                showErrorPopup();
            }
        }
    });

    closePopupButton?.addEventListener('click', function() {
        errorPopup.style.display = 'none';
    });

    function showErrorPopup() {
        errorPopup.style.display = 'block';
        setTimeout(() => {
            errorPopup.style.display = 'none';
        }, 3000);
    }

    // Функция для открытия модального окна
    async function openModal() {
        const modalOverlay = document.getElementById('modalOverlay');
        const closeModal = document.getElementById('closeModal');
        const timeButtons = document.querySelectorAll('.time-button');
        const submitButton = document.getElementById('submitButton');
        const commentBox = document.querySelector('.comment-box');
        const modalContent = modalOverlay.querySelector('.modal'); // Контейнер для кнопок времени
        let selectedTime = null;

        try {
            const responsetr = await fetch('/time_record', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ time: calendar.selectedDates[0].toISOString().split('T')[0] }),
            });

            // if (responsetr.ok) {

            //     const timeHTML = await responsetr.text(); // Получаем HTML с сервера
            //     const modalContent = document.querySelector(".modal");
            //     modalContent.innerHTML = timeHTML; // Вставляем полученный HTML

            if (responsetr.ok) {
                const data = await responsetr.json();
                const times = data.times_r;
                let buttonsHTML = '';
                const modalTitle = document.querySelector('.modal-title');

                modalContent.querySelectorAll('.time-button').forEach(btn => btn.remove());

                times.forEach(time => {
                    buttonsHTML += `<button class="time-button"><span class="icon">&#x23F0;</span> ${time}</button>`;
                });
                
                // Вставляем сразу весь блок кнопок после <h2 class="modal-title">
                modalTitle.insertAdjacentHTML('afterend', buttonsHTML);

                // Переназначаем слушатели после создания кнопок
                modalContent.querySelectorAll('.time-button').forEach(button => {
                    button.addEventListener('click', () => {
                        // Удаляем класс "selected" у всех кнопок и добавляем для выбранной
                        modalContent.querySelectorAll('.time-button').forEach(btn => btn.classList.remove('selected'));
                        button.classList.add('selected');
                        selectedTime = button.textContent.split('\n')[0].split(' ')[1]; // Получаем значение времени из data-time
                    });
                });

            } else {
                console.error('Ошибка при выполнении запроса:', responsetr.status);
            }
        } catch (error) {
            console.error('Ошибка time_record:', error);
        }

        modalOverlay.style.display = 'flex';

        closeModal.addEventListener('click', () => {
            modalOverlay.style.display = 'none';
            commentBox.value = '';
        });

        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) {
                modalOverlay.style.display = 'none';
                commentBox.value = '';
            }
        });

        // timeButtons.forEach(button => {
        //     button.addEventListener('click', () => {
        //         timeButtons.forEach(btn => btn.classList.remove('selected'));
        //         button.classList.add('selected');
        //         selectedTime = button.textContent.trim();
        //     });
        // });

        submitButton.addEventListener('click', async () => {
            const comment = commentBox.value.trim();
            if (!selectedTime) {
                console.log('Не выбрано время');
                return;
            }

            // Скрыть модальное окно
            modalOverlay.style.display = 'none';

            // Показать загрузку
            showLoading();

            // Отправить POST запрос
            await fetch('/record', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date: calendar.selectedDates[0].toISOString().split('T')[0],
                    time: selectedTime,
                    comment: comment
                })
            })
            .then(response => response.json())
            .then(data => {
                // Скрыть загрузку
                hideLoading();

                // Показать статус ответа
                if (data.success) {
                    showStatusMessageTrue("Вы записались 😊");
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 2000);
                } else {
                    showStatusMessageFalse("На это время записаться нельзя 😢");
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 2000);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                hideLoading();
                showStatusMessageFalse("Произошла ошибка при записи 😭");
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            });

            // Очистить поле комментария
            commentBox.value = '';
        });
    }

    // Функция для показа загрузки
    function showLoading() {
        const overlayElement = document.createElement('div');
        overlayElement.id = 'loadingOverlay';
        overlayElement.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;

        const loadingElement = document.createElement('div');
        loadingElement.id = 'loading';
        loadingElement.style.cssText = `
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        `;

        overlayElement.appendChild(loadingElement);
        document.body.appendChild(overlayElement);

        // Добавляем стиль анимации
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        // Блокируем взаимодействие с элементами под оверлеем
        document.body.style.overflow = 'hidden';
        const allElements = document.body.getElementsByTagName('*');
        for (let i = 0; i < allElements.length; i++) {
            if (allElements[i] !== overlayElement && !overlayElement.contains(allElements[i])) {
                allElements[i].style.pointerEvents = 'none';
            }
        }
    }

    // Функция для скрытия загрузки
    function hideLoading() {
        const overlayElement = document.getElementById('loadingOverlay');
        if (overlayElement) {
            overlayElement.remove();
        }

        // Разблокируем взаимодействие с элементами
        document.body.style.overflow = '';
        const allElements = document.body.getElementsByTagName('*');
        for (let i = 0; i < allElements.length; i++) {
            allElements[i].style.pointerEvents = '';
        }
    }

    // Функция для показа статуса ответа
    function showStatusMessageTrue(message) {
        const statusElement = document.createElement('div');
        statusElement.textContent = message;
        statusElement.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            width: auto;
            justify-content: center;
            transform: translate(-50%, -50%);
            padding: 20px;
            background-color: #f8f8f8;
            border: 1px solid #ddd;
            border-radius: 30px;
            z-index: 10000;
        `;
        document.body.appendChild(statusElement);

        // Удалить сообщение через 2 секунды
        setTimeout(() => {
            statusElement.remove();
        }, 2000);
    }

    // Функция для показа статуса ответа
    function showStatusMessageFalse(message) {
        const statusElement = document.createElement('div');
        statusElement.textContent = message;
        statusElement.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            width: auto;
            width: 180px;
            justify-content: center;
            transform: translate(-50%, -50%);
            padding: 20px;
            background-color: #f8f8f8;
            border: 1px solid #ddd;
            border-radius: 30px;
            z-index: 10000;
        `;
        document.body.appendChild(statusElement);

        // Удалить сообщение через 2 секунды
        setTimeout(() => {
            statusElement.remove();
        }, 2000);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const menuIcon = document.getElementById('menuIcon');
    const dropdownMenu = document.getElementById('dropdownMenu');

    menuIcon.addEventListener('click', function(event) {
        event.stopPropagation();
        dropdownMenu.classList.toggle('active');
        menuIcon.classList.toggle('active');
    });

    // Close the menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!menuIcon.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.remove('active');
            menuIcon.classList.remove('active');
        }
    });

    // Prevent clicks inside the dropdown menu from closing it
    dropdownMenu.addEventListener('click', function(event) {
        event.stopPropagation();
    });

    const logoutButton = document.getElementById('logoutButton');
    logoutButton.addEventListener('click', async function() {
        console.log('User logged out');
        try {
            const response = await fetch('/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(),
            });

            if (response.ok) {
                window.location.href = '/auth';
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
});