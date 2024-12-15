document.addEventListener('DOMContentLoaded', function() {
    const clientIdElement = document.getElementById('clientId');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');

    sendButton.addEventListener('click', function() {
        const message = messageInput.value.trim();
        if (message) {
            // Here you would typically send the message to your server
            console.log('Sending message:', message);
            alert('Рассылка отправлена!');
            messageInput.value = '';
        } else {
            alert('Пожалуйста, введите текст рассылки.');
        }
    });

    // Initialize Flatpickr if needed
    // flatpickr("#some-date-input", {
    //     locale: "ru"
    // });
});

