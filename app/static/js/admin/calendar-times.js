document.addEventListener('DOMContentLoaded', () => {
    const clientsList = document.getElementById('clientsList');
    const searchInput = document.getElementById('searchInput');
    const modal = document.getElementById('modal');
    const closeBtn = document.getElementsByClassName('close')[0];
    const clientAppointments = document.getElementById('clientAppointments');

    // Пример данных клиентов (в реальном приложении эти данные должны загружаться с сервера)
    const clients = [
        { id: 1, name: 'Иван Иванов', telegram: '@ivanov', phone: '+7 (999) 123-45-67' },
        { id: 2, name: 'Мария Петрова', telegram: '@petrova', phone: '+7 (999) 234-56-78' },
        // Добавьте больше клиентов по необходимости
    ];

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

    // Отображаем всех клиентов при загрузке страницы
    displayClients(clients);

    // Обработка поиска
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredClients = clients.filter(client => 
            client.name.toLowerCase().includes(searchTerm) ||
            client.telegram.toLowerCase().includes(searchTerm) ||
            client.phone.includes(searchTerm)
        );
        displayClients(filteredClients);
    });

    // Функция для отображения записей клиента
    function showClientAppointments(client) {
        // В реальном приложении здесь должен быть запрос к серверу для получения записей клиента
        const appointments = [
            { id: 1, date: '2023-06-01', time: '10:00', comment: 'Первый визит' },
            { id: 2, date: '2023-06-15', time: '15:30', comment: 'Повторный визит' },
        ];

        clientAppointments.innerHTML = '';
        appointments.forEach(appointment => {
            const appointmentElement = document.createElement('div');
            appointmentElement.className = 'appointment';
            appointmentElement.innerHTML = `
                <div class="appointment-info">
                    <div class="appointment-date-time">${appointment.date} | ${appointment.time}</div>
                    <div class="appointment-comment">${appointment.comment}</div>
                </div>
                <button class="delete-btn" data-id="${appointment.id}">
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
    clientAppointments.addEventListener('click', (e) => {
        if (e.target.closest('.delete-btn')) {
            const button = e.target.closest('.delete-btn');
            const appointmentId = button.dataset.id;
            const appointmentElement = button.closest('.appointment');

            // Показываем индикатор загрузки
            button.innerHTML = '<div class="loading"></div>';
            button.disabled = true;

            // Имитация запроса к серверу
            setTimeout(() => {
                // В реальном приложении здесь должен быть запрос к серверу для удаления записи
                appointmentElement.remove();
                alert('Запись успешно удалена');
            }, 1000);
        }
    });
});