document.addEventListener('DOMContentLoaded', () => {
    const datePicker = document.getElementById('date-picker');
    const prevDayBtn = document.getElementById('prev-day');
    const nextDayBtn = document.getElementById('next-day');
    const dayOfWeekElement = document.getElementById('day-of-week');
    const appointmentsListElement = document.getElementById('appointments-list');

    let selectedDate = new Date();
    let isUpdating = false;

    function formatDate(date) {
        return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    function getDayOfWeek(date) {
        return date.toLocaleDateString('ru-RU', { weekday: 'long' });
    }

    function createAppointmentElement(appointment) {
        const appointmentElement = document.createElement('div');
        appointmentElement.className = 'appointment-item';
        appointmentElement.innerHTML = `
            <div class="appointment-time">${appointment.time}</div>
            <div class="appointment-details">
                <div class="client-name">${appointment.clientName}</div>
                <div class="id-name">ID: ${appointment.id}</div>
                <div class="tg-container">
                    <div class="tgtext">ТГ:</div>
                    <div class="telegram-username">${appointment.telegramUsername}</div>
                </div>
                <div class="comment-container">
                    <div class="commtext">Комментарий:</div>
                    <div class="appointment-comment">${appointment.comment}</div>
                </div>
            </div>
        `;
        return appointmentElement;
    }

    function updateCalendarPosition(calendarElement, inputElement) {
        if (!calendarElement || !inputElement) return;

        const inputRect = inputElement.getBoundingClientRect();
        const bodyRect = document.body.getBoundingClientRect();

        let top = inputRect.bottom + window.scrollY;
        let left = inputRect.left + window.scrollX - 74; // Subtract 74px to move it 30px from the left edge

        // Adjust if the calendar would go off the right edge of the screen
        if (left + 340 > window.innerWidth) {
            left = window.innerWidth - 340;
        }

        // Adjust if the calendar would go off the bottom of the screen
        if (top + calendarElement.offsetHeight > window.innerHeight + window.scrollY) {
            top = inputRect.top + window.scrollY - calendarElement.offsetHeight;
        }

        calendarElement.style.setProperty('--calendar-top', `${top}px`);
        calendarElement.style.setProperty('left', `${left}px`);
        calendarElement.classList.add('custom-position');
    }

    async function fetchAppointments(date) {
        // Здесь должен быть реальный API-запрос
        // Сейчас это просто имитация с задержкой
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {id: 1, time: '10:00', clientName: 'Анна Иванова', telegramUsername: '@anna_iv', comment: 'Небольшие, короткие, мини, легкие тексты для чтения со школьниками. Детские тексты, тексты с простыми словами, любые тексты для детей.\nСтраницы отсортированы по длине текста. под индексом 1 - идут самые короткие тексты, под индексом 40 - длинные тексты.' },
                    {id: 2, time: '11:30', clientName: 'Петр Сидоров', telegramUsername: '@petr_s', comment: 'Коррекция' },
                    {id: 3, time: '14:00', clientName: 'Мария Петрова', telegramUsername: '@maria_p', comment: 'Снятие' },
                ]);
            }, 500);
        });
    }

    async function updateAppointments() {
        if (isUpdating) return;
        isUpdating = true;

        updateDateDisplay();
        appointmentsListElement.innerHTML = 'Загрузка...';
        
        const appointments = await fetchAppointments(selectedDate);
        appointmentsListElement.innerHTML = '';
        
        appointments.forEach(appointment => {
            const appointmentElement = createAppointmentElement(appointment);
            appointmentsListElement.appendChild(appointmentElement);
        });

        fp.setDate(selectedDate, false);
        isUpdating = false;
    }

    function updateDateDisplay() {
        datePicker.value = formatDate(selectedDate);
        dayOfWeekElement.textContent = getDayOfWeek(selectedDate);
    }

    const fp = flatpickr(datePicker, {
        dateFormat: 'd.m.Y',
        locale: 'ru',
        disableMobile: true,
        monthSelectorType: "static",
        onChange: (selectedDates) => {
            if (selectedDates.length > 0 && !isUpdating) {
                selectedDate = selectedDates[0];
                updateAppointments();
            }
        },
        onOpen: (selectedDates, dateStr, instance) => {
            updateCalendarPosition(instance.calendarContainer, instance.input);
        },
        onReady: (selectedDates, dateStr, instance) => {
            // Initial positioning
            updateCalendarPosition(instance.calendarContainer, instance.input);

            // Reposition on window resize
            window.addEventListener('resize', () => {
                updateCalendarPosition(instance.calendarContainer, instance.input);
            });

            // Force update position after a short delay
            setTimeout(() => {
                updateCalendarPosition(instance.calendarContainer, instance.input);
            }, 0);
        }
    });

    prevDayBtn.addEventListener('click', () => {
        selectedDate.setDate(selectedDate.getDate() - 1);
        updateAppointments();
    });

    nextDayBtn.addEventListener('click', () => {
        selectedDate.setDate(selectedDate.getDate() + 1);
        updateAppointments();
    });

    updateAppointments();
});

