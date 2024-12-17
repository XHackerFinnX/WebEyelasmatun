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
        appointmentsModal.style.display = 'none';
    }
});

// Имитация загрузки данных с сервера
async function loadAppointments() {
    try {
        console.log('Загрузка записей...');
        downloadRecord.style.display = 'block';
        // Имитируем задержку, как будто данные приходят с сервера
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Используем тестовые данные
        appointmentsList.innerHTML = mockAppointments.map(appointment => `
            <div class="appointment-item" data-id="${appointment.id}">
                <div class="appointment-info">
                    <p>Дата: ${appointment.date}</p>
                    <p>Время: ${appointment.time}</p>
                    <p>Комментарий: ${appointment.comment}</p>
                </div>
                <button class="delete-btn" data-id="${appointment.id}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `).join('');

        // Добавляем обработчики на кнопки удаления
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', deleteAppointment);
        });

        console.log('Записи успешно загружены.');
        downloadRecord.style.display = 'none';
    } catch (error) {
        console.error('Ошибка загрузки записей:', error);
    }
}

// Имитация удаления записи
async function deleteAppointment(event) {
    const btn = event.currentTarget;
    const appointmentId = btn.dataset.id;

    // Имитируем изменение интерфейса
    btn.disabled = true;
    btn.innerHTML = '<div class="loading"></div>';

    try {
        console.log(`Удаление записи с ID: ${appointmentId}`);
        // Имитируем задержку на отправку POST-запроса
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Имитируем удаление записи из тестовых данных
        const index = mockAppointments.findIndex(app => app.id === Number(appointmentId));
        if (index !== -1) {
            mockAppointments.splice(index, 1);
            btn.closest('.appointment-item').remove();
            console.log(`Запись с ID: ${appointmentId} успешно удалена.`);
        } else {
            throw new Error('Запись не найдена');
        }
    } catch (error) {
        console.error('Ошибка при удалении записи:', error);
        alert('Не удалось удалить запись. Попробуйте позже.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-trash-alt"></i>';
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
    appointmentsModal.style.display = 'none';
});

