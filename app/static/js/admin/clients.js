const clientList = document.getElementById('clientList');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('modal');
const historyModal = document.getElementById('historyModal');
const clientIdSpan = document.getElementById('clientId');
const closeButton = document.getElementById('closeButton');
const historyButton = document.getElementById('historyButton');
const closeHistoryButton = document.getElementById('closeHistoryButton');
const historyTableBody = document.getElementById('historyTableBody');

async function fetchClients() {
    try {
        const response = await fetch('/api/clients-all/all', {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        clients = await response.json();
        populateClientList(clients);
    } catch (error) {
        console.error('Ошибка при выборке клиентов:', error);
        clientList.innerHTML = '<p>Ошибка при загрузке клиентов. Пожалуйста, повторите попытку позже.</p>';
    }
}

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
        (client.id && client.id.toString().includes(searchTerm)) ||
        (client.name && client.name.toLowerCase().includes(searchTerm)) ||
        (client.telegram && client.telegram.toLowerCase().includes(searchTerm)) ||
        (client.phone && client.phone.includes(searchTerm))
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
    try {
        const response = await fetch(`/api/client-info/${clientId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Ошибка при получении информации о клиенте');
        }

        const clientInfo = await response.json();

        return clientInfo;
    } catch (error) {
        console.error('Ошибка при выполнении POST запроса:', error);
        return null; // Возвращаем null в случае ошибки
    }
}

// Close modal
function closeModal() {
    modal.style.display = 'none';
}

// Open history modal
async function openHistoryModal() {
    const clientId = clientIdSpan.textContent.split(' ')[1];
    history = await fetchVisitHistory(clientId);
    adminstatus = await selectNameAdmin();
    populateHistoryTable(history, adminstatus);
    historyModal.style.display = 'block';
}

// Close history modal
function closeHistoryModal() {
    historyModal.style.display = 'none';
}

async function fetchVisitHistory(clientId) {
    try {
        const response = await fetch(`/api/visit-history/${clientId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Ошибка при получении истории посещений: ${response.statusText}`);
        }

        const visitHistory = await response.json();
        return visitHistory;
    } catch (error) {
        console.error('Ошибка при выполнении POST-запроса:', error);
        return []; // Возвращаем пустой массив в случае ошибки
    }
}

async function selectNameAdmin() {
    try {
        const response = await fetch('/api/usedby_admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Ошибка при получении статуса админа: ${response.statusText}`);
        }

        const adminName = await response.json();
        console.log(adminName.status);
        return adminName.status;
    } catch (error) {
        console.error('Ошибка при выполнении POST-запроса:', error);
    }
}

function populateHistoryTable(history, adminstatus) {
    historyTableBody.innerHTML = '';
    const clientId = clientIdSpan.textContent.split(' ')[1];

    if (adminstatus === 'admin') {
        history.forEach((visit, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td data-label="Дата">${visit.date} (${visit.dayOfWeek})</td>
                <td data-label="Время">${visit.time}</td>
                <td data-label="Комментарий" contenteditable="true">${visit.comment}</td>
            `;
            row.dataset.index = index;
            row.dataset.clientId = clientId;
            historyTableBody.appendChild(row);
        });
    } else {
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
    }

    // Add event listeners for editing
    historyTableBody.querySelectorAll('td[contenteditable="true"]').forEach(cell => {
        cell.addEventListener('blur', handleCellEdit);
    });
}

// Handle cell edits
async function handleCellEdit(event) {
    const cell = event.target;
    const row = cell.closest('tr');
    const index = parseInt(row.dataset.index);
    const clientId = row.dataset.clientId;
    const field = cell.getAttribute('data-label');
    const newValue = cell.textContent.trim();

    // Update the data
    const updatedVisit = { ...history[index], [field.toLowerCase()]: newValue };
    history[index] = updatedVisit;

    const requestData = {
        clientId: clientId,
        date: updatedVisit.date,
        time: updatedVisit.time,
        update: [field, newValue]
    };

    console.log(`Изменение в записи:`, requestData);

    try {
        const response = await fetch('/api/update-visit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData) // Отправка данных в формате JSON
        });

        if (!response.ok) {
            throw new Error(`Ошибка при обновлении записи: ${response.statusText}`);
        }

    } catch (error) {
        console.error('Ошибка при выполнении POST-запроса:', error);
    }
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

fetchClients();
let history = [];

document.addEventListener('DOMContentLoaded', () => {
    const sortIcons = document.querySelectorAll('.sort-icon');
    let currentSort = null;

    sortIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            const sortType = icon.dataset.sort;
            const directionIcon = icon.nextElementSibling;
            directionIcon.classList.toggle('desc');
            // Your sorting logic here
            console.log(`Sorting by ${sortType}, direction: ${directionIcon.classList.contains('desc') ? 'descending' : 'ascending'}`);
        });
    });
});