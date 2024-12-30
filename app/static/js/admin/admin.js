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
        case 'delete-appointment':
            endpoint = `update/delete-appointment/${id_user}`;
            break;
        case 'view-clients':
            endpoint = `update/view-clients/${id_user}`;
            break;
        case 'earnings-chart':
            endpoint = `update/earnings-chart/${id_user}`;
            break;
        case 'technical':
            endpoint = `update/technical/${id_user}`;
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

document.addEventListener('DOMContentLoaded', function() {
    const menuIcon = document.getElementById('menuIcon');
    const dropdownMenu = document.getElementById('dropdownMenu');

    menuIcon.addEventListener('click', function(event) {
        event.stopPropagation();
        dropdownMenu.classList.toggle('active');
        menuIcon.classList.toggle('active');
    });

    // Close the menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!menuIcon.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.remove('active');
            menuIcon.classList.remove('active');
        }
    });

    // Prevent clicks inside the dropdown menu from closing it
    dropdownMenu.addEventListener('click', function(event) {
        event.stopPropagation();
    });

    function adjustDropdownPosition() {
        const header = document.querySelector('header');
        const dropdownMenu = document.getElementById('dropdownMenu');
        dropdownMenu.style.top = header.offsetHeight + 'px';
    }

    // Call this function on load and resize
    window.addEventListener('load', adjustDropdownPosition);
    window.addEventListener('resize', adjustDropdownPosition);

    const logoutButton = document.getElementById('logoutButton');
    logoutButton.addEventListener('click', async function() {
        console.log('User logged out');
        try {
            const response = await fetch('/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(),
            });

            if (response.ok) {
                window.location.href = '/auth';
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
});

async function togglePulseDot() {
    try {
      const response = await fetch('/api/check-pulse-dot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      const show = data.show;
      console.log(show)
      const pulseDot = document.querySelector('.pulse-dot');
      if (pulseDot) {
        pulseDot.style.display = show ? 'inline-block' : 'none';
      }
  
      return show;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  }
  
document.addEventListener('DOMContentLoaded', async function() {
const showDot = await togglePulseDot();
});