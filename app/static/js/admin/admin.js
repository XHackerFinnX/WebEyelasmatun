document.addEventListener('DOMContentLoaded', () => {
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => {
        tile.addEventListener('click', handleTileClick);
    });
});

async function handleTileClick(event) {
    const tileId = event.currentTarget.id;
    let endpoint = '';

    // Находим все элементы с классом "nav-button-center"
    const links = document.querySelectorAll(".nav-button-center");

    // Ищем конкретный элемент, например, по тексту "Админ панель"
    const adminLink = Array.from(links).find(link => link.textContent.trim() === "Админ панель");

    // Получаем значение href, если нашли нужный элемент
    if (adminLink) {
        const hrefValue = adminLink.getAttribute("href");
        id_user = hrefValue.split('/')[3];
    } else {
        console.error("Ссылка с текстом 'Админ панель' не найдена.");
    }

    switch (tileId) {
        case 'assign-day':
            endpoint = `update/assign-day/${id_user}`;
            break;
        case 'remove-day':
            endpoint = `update/remove-day/${id_user}`;
            break;
        case 'view-schedule':
            endpoint = `update/view-schedule/${id_user}`;
            break;
        case 'send-message':
            endpoint = `update/send-message/${id_user}`;
            break;
        case 'send-broadcast':
            endpoint = `update/send-broadcast/${id_user}`;
            break;
        case 'add-to-blacklist':
            endpoint = `update/add-to-blacklist/${id_user}`;
            break;
        case 'remove-from-blacklist':
            endpoint = `update/remove-from-blacklist/${id_user}`;
            break;
        case 'view-blacklist':
            endpoint = `update/view-blacklist/${id_user}`;
            break;
        case 'delete-appointment':
            endpoint = `update/delete-appointment/${id_user}`;
            break;
        case 'view-clients':
            endpoint = `update/view-clients/${id_user}`;
            break;
        default:
            console.error('Unknown tile clicked');
            return;
    }

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();

        if (response.ok){
            window.location.href = result.data;
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Произошла ошибка при выполнении запроса. Пожалуйста, попробуйте еще раз.');
    }
}

function handleResponse(tileId, data) {
    switch (tileId) {
        case 'assign-day':
            alert('День успешно назначен');
            break;
        case 'remove-day':
            alert('День успешно удален');
            break;
        case 'view-schedule':
            // Здесь можно открыть модальное окно с графиком
            console.log('График:', data);
            break;
        case 'send-message':
            alert('Сообщение отправлено');
            break;
        case 'send-broadcast':
            alert('Рассылка отправлена');
            break;
        case 'add-to-blacklist':
            alert('Клиент добавлен в ЧС');
            break;
        case 'remove-from-blacklist':
            alert('Клиент удален из ЧС');
            break;
        case 'view-blacklist':
            // Здесь можно открыть модальное окно со списком клиентов в ЧС
            console.log('Клиенты в ЧС:', data);
            break;
        case 'delete-appointment':
            alert('Запись клиента удалена');
            break;
        case 'view-clients':
            // Здесь можно открыть модальное окно со списком клиентов
            console.log('Список клиентов:', data);
            break;
        default:
            console.error('Unknown tile response');
    }
}