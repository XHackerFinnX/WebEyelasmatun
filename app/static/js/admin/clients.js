// Sample client data
const clients = [
    { id: 1, name: "Иван Иванов", telegram: "@ivan", phone: "+7 (999) 123-45-67" },
    { id: 222, name: "Мария Петрова", telegram: "@maria", phone: "+7 (999) 234-56-78" },
    { id: 23, name: "Алексей Сидоров", telegram: "@alex", phone: "+7 (999) 345-67-89" },
    { id: 224, name: "Елена Козлова", telegram: "@elena", phone: "+7 (999) 456-78-90" },
];

const clientList = document.getElementById('clientList');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('modal');
const historyModal = document.getElementById('historyModal');
const clientIdSpan = document.getElementById('clientId');
const closeButton = document.getElementById('closeButton');
const historyButton = document.getElementById('historyButton');
const closeHistoryButton = document.getElementById('closeHistoryButton');
const historyTableBody = document.getElementById('historyTableBody');

// Populate client list
function populateClientList(clients) {
    clientList.innerHTML = '';
    clients.forEach(client => {
        const li = document.createElement('li');
        li.className = 'client-item';
        li.innerHTML = `
            <strong>ID: ${client.id}</strong><br>
            Имя: ${client.name}<br>
            Telegram: ${client.telegram}<br>
            Телефон: ${client.phone}
        `;
        li.addEventListener('click', () => openModal(client.id));
        clientList.appendChild(li);
    });
}

// Filter clients based on search input
function filterClients() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredClients = clients.filter(client => 
        client.id.toString().includes(searchTerm) ||
        client.name.toLowerCase().includes(searchTerm) ||
        client.telegram.toLowerCase().includes(searchTerm) ||
        client.phone.includes(searchTerm)
    );
    populateClientList(filteredClients);
}

// Open modal
async function openModal(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    clientIdSpan.textContent = `ID: ${clientId}`;
    
    // Симуляция получения дополнительной информации о клиенте
    const clientInfo = await fetchClientInfo(clientId);
    
    document.getElementById('lastVisit').textContent = clientInfo.lastVisit;
    document.getElementById('lastAppointment').textContent = clientInfo.lastAppointment;
    document.getElementById('visitCount').textContent = clientInfo.visitCount;
    document.getElementById('cancelCount').textContent = clientInfo.cancelCount;
    
    const blacklistStatus = document.getElementById('blacklistStatus');
    blacklistStatus.textContent = clientInfo.isBlacklisted ? 'Добавлен в ЧС' : 'Не в ЧС';
    blacklistStatus.style.color = clientInfo.isBlacklisted ? 'red' : 'green';
    
    const locationInfo = document.getElementById('locationInfo');
    if (clientInfo.ipAddress) {
        document.getElementById('ipAddress').textContent = clientInfo.ipAddress;
        document.getElementById('country').textContent = clientInfo.country;
        document.getElementById('city').textContent = clientInfo.city;
        locationInfo.style.display = 'block';
    } else {
        locationInfo.style.display = 'none';
    }
    
    modal.style.display = 'block';
}

// Симуляция получения информации о клиенте
async function fetchClientInfo(clientId) {
    // В реальном приложении здесь был бы запрос к серверу
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                lastVisit: '2023-06-15',
                lastAppointment: '2023-06-10',
                visitCount: 5,
                cancelCount: 1,
                isBlacklisted: Math.random() < 0.5, // Случайное значение для демонстрации
                ipAddress: Math.random() < 0.7 ? '192.168.1.1' : null, // Симуляция возможного отсутствия IP
                country: 'Россия',
                city: 'Москва'
            });
        }, 500);
    });
}

// Close modal
function closeModal() {
    modal.style.display = 'none';
}

// Open history modal
async function openHistoryModal() {
    const clientId = clientIdSpan.textContent.split(' ')[1];
    history = await fetchVisitHistory(clientId);
    populateHistoryTable(history);
    historyModal.style.display = 'block';
}

// Close history modal
function closeHistoryModal() {
    historyModal.style.display = 'none';
}

// Fetch visit history
async function fetchVisitHistory(clientId) {
    // В реальном приложении здесь был бы запрос к серверу
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                { date: '11.11.2024', time: '14:30', dayOfWeek: 'Четверг', comment: 'Стандартная процедура', money: 1500 },
                { date: '14.11.2024', time: '11:00', dayOfWeek: 'Суббота', comment: 'Клиент опоздал на 15 минут', money: 1800 },
                { date: '18.11.2024', time: '16:45', dayOfWeek: 'Воскресенье', comment: 'Дополнительная услуга: окрашивание', money: 2500 },
                { date: '12.12.2024', time: '10:15', dayOfWeek: 'Понедельник', comment: 'Первое посещение, консультация', money: 1000 },
                { date: '15.12.2024', time: '13:00', dayOfWeek: 'Вторник', comment: 'Отменен клиентом в последний момент', money: 0 },
                { date: '15.12.2024', time: '13:00', dayOfWeek: 'Вторник', comment: 'Отменен клиентом в последний момент', money: 0 },
                { date: '15.12.2024', time: '13:00', dayOfWeek: 'Вторник', comment: 'Отменен клиентом в последний момент', money: 0 },
            ]);
        }, 500);
    });
}

// Populate history table
function populateHistoryTable(history) {
    historyTableBody.innerHTML = '';
    const clientId = clientIdSpan.textContent.split(' ')[1];
    history.forEach((visit, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="Дата">${visit.date} (${visit.dayOfWeek})</td>
            <td data-label="Время">${visit.time}</td>
            <td data-label="Комментарий" contenteditable="true">${visit.comment}</td>
            <td data-label="Деньги" contenteditable="true">${visit.money}</td>
        `;
        row.dataset.index = index;
        row.dataset.clientId = clientId;
        historyTableBody.appendChild(row);
    });

    // Add event listeners for editing
    historyTableBody.querySelectorAll('td[contenteditable="true"]').forEach(cell => {
        cell.addEventListener('blur', handleCellEdit);
    });
}

// Handle cell edits
function handleCellEdit(event) {
    const cell = event.target;
    const row = cell.closest('tr');
    const index = parseInt(row.dataset.index);
    const clientId = row.dataset.clientId;
    const field = cell.getAttribute('data-label');
    const newValue = cell.textContent.trim();

    // Update the data
    const updatedVisit = { ...history[index], [field.toLowerCase()]: newValue };
    history[index] = updatedVisit;

    // Log the change to the console
    console.log(`Изменение в записи:`, {
        clientId: clientId,
        date: updatedVisit.date,
        time: updatedVisit.time,
        [field]: newValue
    });
}

// Sort history table
function sortHistoryTable(column) {
    const rows = Array.from(historyTableBody.querySelectorAll('tr'));
    const isAscending = this.asc = !this.asc;
    const multiplier = isAscending ? 1 : -1;

    rows.sort((a, b) => {
        let aValue, bValue;
        if (column === 'date') {
            aValue = a.querySelector('td[data-label="Дата"]').textContent.split(' ')[0];
            bValue = b.querySelector('td[data-label="Дата"]').textContent.split(' ')[0];
            // Parse date strings to Date objects
            aValue = parseDate(aValue);
            bValue = parseDate(bValue);
            return (aValue - bValue) * multiplier;
        } else if (column === 'money') {
            aValue = parseFloat(a.querySelector('td[data-label="Деньги"]').textContent);
            bValue = parseFloat(b.querySelector('td[data-label="Деньги"]').textContent);
            return (aValue - bValue) * multiplier;
        } else {
            aValue = a.querySelector(`td[data-label="${column === 'date' ? 'Дата' : 'Время'}"]`).textContent;
            bValue = b.querySelector(`td[data-label="${column === 'date' ? 'Дата' : 'Время'}"]`).textContent;
            return aValue.localeCompare(bValue) * multiplier;
        }
    });

    rows.forEach(row => historyTableBody.appendChild(row));

    // Update active sort icon
    document.querySelectorAll('.sort-icon').forEach(icon => {
        icon.classList.remove('active');
        if (icon.dataset.sort === column) {
            icon.classList.add('active');
        }
    });
}

// Helper function to parse date string
function parseDate(dateString) {
    const [day, month, year] = dateString.split('.');
    return new Date(year, month - 1, day);
}

// Event listeners
searchInput.addEventListener('input', filterClients);
closeButton.addEventListener('click', closeModal);
historyButton.addEventListener('click', openHistoryModal);
closeHistoryButton.addEventListener('click', closeHistoryModal);

document.addEventListener('DOMContentLoaded', function() {
    const sortableElements = [
        document.getElementById('sortDate'),
        document.getElementById('sortTime'),
        document.getElementById('sortMoney'),
        document.getElementById('dateHeader'),
        document.getElementById('timeHeader'),
        document.getElementById('moneyHeader')
    ];

    sortableElements.forEach(el => {
        if (el) {
            el.addEventListener('click', () => {
                const column = el.dataset.sort;
                sortHistoryTable(column);
            });
        }
    });
});


window.onclick = function(event) {
    if (event.target == modal) {
        closeModal();
    } else if (event.target == historyModal) {
        closeHistoryModal();
    }
}

// Initial population of client list
populateClientList(clients);

let history = [];








document.addEventListener('DOMContentLoaded', () => {
    const sortIcons = document.querySelectorAll('.sort-icon');
    let currentSort = null;

    sortIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            const sortType = icon.dataset.sort;
            const directionIcon = icon.nextElementSibling;

            // if (currentSort === sortType) {
            //     // Toggle direction
            //     directionIcon.classList.toggle('desc');
            //     console.log('выкл');
            // } else {
            //     // Reset all icons
            //     sortIcons.forEach(i => i.nextElementSibling.classList.remove('active', 'desc'));
            //     // Set new sort
            //     directionIcon.classList.add('active');
            //     currentSort = sortType;
            //     console.log('вкл')
            // }
            directionIcon.classList.toggle('desc');
            // Your sorting logic here
            console.log(`Sorting by ${sortType}, direction: ${directionIcon.classList.contains('desc') ? 'descending' : 'ascending'}`);
        });
    });
});