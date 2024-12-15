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
const clientIdSpan = document.getElementById('clientId');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

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
    const message = messageInput.value;
    if (event.target == modal) {
        modal.style.display = 'none';
        messageInput.value = '';
    }
}

// Send message
function sendMessage() {
    const message = messageInput.value;
    const clientId = clientIdSpan.textContent.split(' ')[1];
    console.log(`Сообщение для клиента ${clientId}: ${message}`);
    messageInput.value = '';
    modal.style.display = 'none';
}

// Event listeners
searchInput.addEventListener('input', filterClients);
sendButton.addEventListener('click', sendMessage);

// Initial population of client list
populateClientList(clients);