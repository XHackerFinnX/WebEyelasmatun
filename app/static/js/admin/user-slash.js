const clientList = document.getElementById('clientList');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('modal');
const clientIdSpan = document.getElementById('clientId');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const sendButtonBL = document.getElementById('sendButtonBL'); // Added for blacklist button

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

async function fetchClients() {
    try {
        const response = await fetch('/api/clients-all', {
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

// Filter clients based on search input
function filterClients() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredClients = clients.filter(client => 
        client.id.toString().includes(searchTerm)
    );
    populateClientList(filteredClients);
}

// Open modal
function openModal(clientId) {
    clientIdSpan.textContent = `ID: ${clientId}`;
    modal.style.display = 'block';
}

// Close modal
function closeModal() {
    modal.style.display = 'none';
}

// Add to blacklist
async function addToBlacklist() {
    const clientId = clientIdSpan.textContent.split(' ')[1];

    const response = await fetch('/api/blacklist-true', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clientId }),
    });

    if (response.ok) {
        console.log(`Client ID ${clientId} added to blacklist`);
        closeModal();
    }
}

// Event listeners
searchInput.addEventListener('input', filterClients);
sendButton.addEventListener('click', closeModal);
sendButtonBL.addEventListener('click', addToBlacklist);

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target == modal) {
        closeModal();
    }
}

// Initial population of client list
fetchClients();