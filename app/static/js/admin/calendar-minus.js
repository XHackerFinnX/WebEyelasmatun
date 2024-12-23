document.addEventListener('DOMContentLoaded', function() {
    
    function updateCalendarPosition(calendarElement, inputElement) {
        if (!calendarElement || !inputElement) return;

        const inputRect = inputElement.getBoundingClientRect();
        const bodyRect = document.body.getBoundingClientRect();

        let top = inputRect.bottom + window.scrollY;
        let left = inputRect.left + window.scrollX - 40; // Subtract 74px to move it 30px from the left edge

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
    
    // Initialize Flatpickr
    flatpickr("#datepicker", {
        locale: "ru",
        dateFormat: "d.m.Y",
        minDate: "today",
        disableMobile: true,
        monthSelectorType: "static",
        prevArrow: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
        nextArrow: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>',
        onChange: function(selectedDates, dateStr, instance) {
            instance.element.value = dateStr;
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

    // Assign day button
    const assignButton = document.getElementById('assignDay');
    assignButton.addEventListener('click', async function() {
        const selectedDate = document.getElementById('datepicker').value;

        const date = selectedDate;

        if (selectedDate) {
            console.log('Selected date:', selectedDate);

            const response = await fetch('/api/delete_day', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ date }),
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            if (response.ok){
                console.log('День удален');
                alert('День удален');
            }

        } else {
            alert('Пожалуйста, выберите дату');
        }
    });
});

