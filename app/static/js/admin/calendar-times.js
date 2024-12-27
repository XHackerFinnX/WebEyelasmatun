document.addEventListener('DOMContentLoaded', () => {
    const clientsList = document.getElementById('clientsList');
    const searchInput = document.getElementById('searchInput');
    const modal = document.getElementById('modal');
    const closeBtn = document.getElementsByClassName('close')[0];
    const clientAppointments = document.getElementById('clientAppointments');

    // Функция для отображения клиентов
    function displayClients(clientsToShow) {
        clientsList.innerHTML = '';
        clientsToShow.forEach(client => {
            const clientCard = document.createElement('div');
            clientCard.className = 'client-card';
            clientCard.innerHTML = `
                <h3>ID: ${client.id}</h3>
                <p><strong class="client-label">Имя:</strong> <span class="client-value">${client.name}</span></p>
                <p><strong class="client-label">Telegram:</strong> <span class="client-value">${client.telegram}</span></p>
                <p><strong class="client-label">Телефон:</strong> <span class="client-value">${client.phone}</span></p>
            `;
            clientCard.addEventListener('click', () => showClientAppointments(client));
            clientsList.appendChild(clientCard);
        });
    }

    async function fetchClients() {
        try {
            const response = await fetch('/api/clients-all/del', {
                method: 'POST'
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            clients = await response.json();
            displayClients(clients);
        } catch (error) {
            console.error('Ошибка при выборке клиентов:', error);
        }
    }

    // Отображаем всех клиентов при загрузке страницы
    fetchClients()

    // Обработка поиска
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredClients = clients.filter(client => {
            const id_n = client.id ? String(client.id) : '';
            const name = client.name ? client.name.toLowerCase() : '';
            const telegram = client.telegram ? client.telegram.toLowerCase() : '';
            const phone = client.phone ? client.phone : '';

            return (
                id_n.includes(searchTerm) ||
                name.includes(searchTerm) ||
                telegram.includes(searchTerm) ||
                phone.includes(searchTerm)
            );
        });
        displayClients(filteredClients);
    });

    // Функция для отображения записей клиента
    async function showClientAppointments(client) {
        // В реальном приложении здесь должен быть запрос к серверу для получения записей клиента
        console.log(client.id);

        const response = await fetch(`/record_user/admin/${client.id}`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const appointments = await response.json();
        console.log(appointments);

        clientAppointments.innerHTML = '';
        appointments.forEach(appointment => {
            const appointmentElement = document.createElement('div');
            appointmentElement.className = 'appointment';
            appointmentElement.innerHTML = `
                <div class="appointment-info">
                    <div class="appointment-date-time">${appointment.date} | ${appointment.time}</div>
                    <div class="appointment-comment">${appointment.comment}</div>
                </div>
                <button class="delete-btn" data-id="${appointment.id}-${appointment.date}-${appointment.time}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            clientAppointments.appendChild(appointmentElement);
        });

        modal.style.display = 'block';
    }

    // Закрытие модального окна
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    // Обработка удаления записи
    clientAppointments.addEventListener('click', async (e) => {
        if (e.target.closest('.delete-btn')) {
            const button = e.target.closest('.delete-btn');
            const appointmentId = button.dataset.id;
            const appointmentElement = button.closest('.appointment');

            // Показываем индикатор загрузки
            button.innerHTML = '<div class="loading"></div>';
            button.disabled = true;

            try {
                // Отправка POST запроса на сервер для удаления записи
                const response = await fetch('/delete_appointment_record_user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ appointmentId }),
                });

                if (!response.ok) {
                    throw new Error('Ошибка удаления записи');
                }

                // Удаляем элемент из DOM
                appointmentElement.remove();
                alert('Запись успешно удалена');
            } catch (error) {
                console.error('Ошибка при удалении записи:', error);
                alert('Не удалось удалить запись. Попробуйте снова.');
            } finally {
                // Восстанавливаем кнопку
                button.innerHTML = '<i class="fas fa-trash"></i>';
                button.disabled = false;
            }
        }
    });
});