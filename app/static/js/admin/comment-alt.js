const clientList = document.getElementById('clientList');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('modal');
const clientIdSpan = document.getElementById('clientId');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const loadingIndicator = document.getElementById('loadingIndicator');

let clients = [];

// Fetch client data
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
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
        messageInput.value = '';
    }
}

// Send message
async function sendMessage() {
    const message = messageInput.value;
    const clientId = clientIdSpan.textContent.split(' ')[1];
    
    try {
        const response = await fetch('/api/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ clientId, message }),
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        console.log(`Сообщение для клиента ${clientId} отправлено: ${message}`);
        messageInput.value = '';
        modal.style.display = 'none';
    } catch (error) {
        console.error('Сообщение об ошибке при отправке сообщения:', error);
        alert('Не удалось отправить сообщение. Пожалуйста, попробуйте снова.');
    }
}

// Event listeners
searchInput.addEventListener('input', filterClients);
sendButton.addEventListener('click', sendMessage);

// Initial fetch of client data
fetchClients();