document.addEventListener('DOMContentLoaded', async function() {
    const clientIdElement = document.getElementById('clientId');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');

    sendButton.addEventListener('click', async function() {
        const message = messageInput.value.trim();
        if (message) {
            const response = await fetch('/api/mailing-bot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });
    
            if (!response.ok) {
                throw new Error('Failed to send message');
            }
            else {
                console.log('Sending message:', message);
                alert('Рассылка отправлена!');
                messageInput.value = '';
            }
        } else {
            alert('Пожалуйста, введите текст рассылки.');
        }
    });
});

