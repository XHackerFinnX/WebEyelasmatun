document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('notificationButton');
    const statusModal = document.getElementById('statusModal');
    const statusText = document.getElementById('statusText');

    function showModal(message, isError = false) {
        statusText.textContent = message;
        statusText.style.color = isError ? '#f44336' : '#4CAF50';
        statusModal.classList.add('show');
        
        setTimeout(() => {
            statusModal.classList.remove('show');
        }, 3000);
    }

    button.addEventListener('click', async () => {
        button.disabled = true;

        try {
            const response = await fetch('/api/notifications/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                showModal('Уведомления успешно запущены!');
            } else {
                throw new Error('Ошибка сервера');
            }
        } catch (error) {
            showModal('Произошла ошибка при запуске уведомлений.', true);
        } finally {
            button.disabled = false;
        }
    });
});