let isLoading = false;

const myAppointmentsBtn = document.getElementById('myAppointmentsBtn');
const appointmentsModal = document.getElementById('appointmentsModal');
const appointmentsList = document.getElementById('appointmentsList');
const downloadRecord = document.getElementById('downolad-record')


// Тестовые данные для имитации записей
const mockAppointments = [
    { id: 1, date: '2024-12-20', time: '10:00', comment: 'Обследование глаз' },
    { id: 2, date: '2024-12-22', time: '15:00', comment: 'Контрольное обследование' },
    { id: 3, date: '2024-12-24', time: '09:30', comment: 'Подбор очков' },
];

myAppointmentsBtn.addEventListener('click', async function() {
    appointmentsModal.style.display = 'block';
    await loadAppointments();
});

window.addEventListener('click', function(event) {
    if (event.target === appointmentsModal) {
        if (!isLoading) {
            appointmentsModal.style.display = 'none';
        }
    }
});

// Имитация загрузки данных с сервера
async function loadAppointments() {
    try {
        console.log('Загрузка записей...');
        appointmentsList.innerHTML = '<p class="loading-message">Загрузка записей...</p>';
        
        // Устанавливаем флаг загрузки
        isLoading = true;
        
        // Отключаем кнопку "Мои записи" и кнопку закрытия во время загрузки
        myAppointmentsBtn.disabled = true;
        modalCloseButton.disabled = true;
        
        // Добавляем класс для блокировки закрытия модального окна
        appointmentsModal.classList.add('loading');
        
        // Имитируем задержку, как будто данные приходят с сервера
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Используем тестовые данные
        appointmentsList.innerHTML = mockAppointments.map(appointment => `
            <div class="appointment-item" data-id="${appointment.id}">
                <div class="appointment-info">
                    <p><strong>Дата:</strong> ${appointment.date}</p>
                    <p><strong>Время:</strong> ${appointment.time}</p>
                    <p><strong>Комментарий:</strong> ${appointment.comment}</p>
                </div>
                <button class="delete-btn" data-id="${appointment.id}" title="Удалить запись">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `).join('');

        // Добавляем обработчики на кнопки удаления
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', deleteAppointment);
        });

        console.log('Записи успешно загружены.');
    } catch (error) {
        console.error('Ошибка загрузки записей:', error);
        appointmentsList.innerHTML = '<p class="error-message">Ошибка при загрузке записей. Пожалуйста, попробуйте позже.</p>';
    } finally {
        // Сбрасываем флаг загрузки
        isLoading = false;
        
        // Включаем кнопку "Мои записи" и кнопку закрытия после загрузки
        myAppointmentsBtn.disabled = false;
        modalCloseButton.disabled = false;
        
        // Удаляем класс для разблокировки закрытия модального окна
        appointmentsModal.classList.remove('loading');
    }
}

// Имитация удаления записи
async function deleteAppointment(event) {
    const btn = event.currentTarget;
    const appointmentId = btn.dataset.id;
    const appointmentItem = btn.closest('.appointment-item');

    // Заменяем иконку корзины на индикатор загрузки
    btn.innerHTML = '<div class="loading"></div>';
    btn.disabled = true;

    try {
        console.log(`Удаление записи с ID: ${appointmentId}`);
        // Имитируем задержку на отправку POST-запроса
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Имитируем удаление записи из тестовых данных
        const index = mockAppointments.findIndex(app => app.id === Number(appointmentId));
        if (index !== -1) {
            mockAppointments.splice(index, 1);
            appointmentItem.remove();
            console.log(`Запись с ID: ${appointmentId} успешно удалена.`);
        } else {
            throw new Error('Запись не найдена');
        }
    } catch (error) {
        console.error('Ошибка при удалении записи:', error);
        alert('Не удалось удалить запись. Попробуйте позже.');
        // Возвращаем иконку корзины в случае ошибки
        btn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        btn.disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const editButtons = document.querySelectorAll('.edit-button');
    
    editButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const fieldId = this.dataset.field;
            const inputField = document.getElementById(fieldId);
            const icon = this.querySelector('i');

            if (inputField.readOnly) {
                // Enable editing
                inputField.readOnly = false;
                inputField.focus();
                icon.classList.remove('fa-pencil-alt');
                icon.classList.add('fa-check');
                icon.style.color = 'green';
            } else {
                // Save changes
                inputField.readOnly = true;
                icon.classList.remove('fa-check');
                icon.classList.add('fa-pencil-alt');
                icon.style.color = '';
                
                console.log(`Updated ${fieldId}: ${inputField.value}`);

                const userIdElement = document.getElementById("userId");
                const userId = userIdElement.textContent.trim();
                const name = fieldId;
                const update_name = inputField.value;

                try {
                    const response = await fetch(`/profile/update/${userId}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({name, update_name}),
                    });
                    console.log(response.ok);
                } catch (error) {
                    console.error('Error:', error);
                }
            }
        });
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

// Закрытие модального окна по крестику
const modalCloseButton = document.getElementById('modalCloseButton');
modalCloseButton.addEventListener('click', function () {
    if (!isLoading) {
        appointmentsModal.style.display = 'none';
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
});

