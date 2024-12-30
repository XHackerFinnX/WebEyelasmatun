function getUserId() {
    const userIdElement = document.getElementById("userId");
    return userIdElement ? userIdElement.textContent.trim() : null;
}

let isLoading = false;

const myAppointmentsBtn = document.getElementById('myAppointmentsBtn');
const appointmentsModal = document.getElementById('appointmentsModal');
const appointmentsList = document.getElementById('appointmentsList');
const downloadRecord = document.getElementById('downolad-record');
const menuList = document.getElementById('menuIcon');


myAppointmentsBtn.addEventListener('click', async function() {
    appointmentsModal.style.display = 'block';
    menuList.style.display = 'none';
    await loadAppointments();
});

window.addEventListener('click', function(event) {
    if (event.target === appointmentsModal) {
        if (!isLoading) {
            appointmentsModal.style.display = 'none';
            menuList.style.display = 'flex';
        }
    }
});

// Имитация загрузки данных с сервера
async function loadAppointments() {
    try {
        console.log('Загрузка записей...');
        appointmentsList.innerHTML = '<p class="loading-message">Загрузка записей...</p>';
        
        isLoading = true;
        myAppointmentsBtn.disabled = true;
        modalCloseButton.disabled = true;
        appointmentsModal.classList.add('loading');
        
        const response = await fetch('/record_user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: getUserId() }) // Assuming you have a function to get the user ID
        });
        if (!response.ok) {
            throw new Error('Ошибка при загрузке записей');
        }
        
        const appointments = await response.json();
        console.log(appointments.status);
        if (appointments.status) {
            appointmentsList.innerHTML = appointments.data.map(appointment => `
                <div class="appointment-item" data-id="${appointment.id}">
                    <div class="appointment-info">
                        <p><strong>Дата:</strong> ${appointment.date}</p>
                        <p><strong>Время:</strong> ${appointment.time}</p>
                        <p><strong>Комментарий:</strong> ${appointment.comment}</p>
                    </div>
                    <button class="delete-btn" data-id="${appointment.id}-${appointment.date}-${appointment.time}" title="Удалить запись">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `).join('');
        }
        else {
            appointmentsList.innerHTML = ''
        }

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', deleteAppointment);
        });

        console.log('Записи успешно загружены.');
    } catch (error) {
        console.error('Ошибка загрузки записей:', error);
        appointmentsList.innerHTML = '<p class="error-message">Ошибка при загрузке записей. Пожалуйста, попробуйте позже.</p>';
    } finally {
        isLoading = false;
        myAppointmentsBtn.disabled = false;
        modalCloseButton.disabled = false;
        appointmentsModal.classList.remove('loading');
    }
}

// Имитация удаления записи
async function deleteAppointment(event) {
    const btn = event.currentTarget;
    const appointmentId = btn.dataset.id;
    const appointmentItem = btn.closest('.appointment-item');

    // Заменяем иконку корзины на индикатор загрузки
    btn.innerHTML = '<div class="loading"></div>';
    btn.disabled = true;

    try {
        console.log(`Удаление записи с ID: ${appointmentId}`);
        
        // Отправляем POST запрос на удаление записи
        const response = await fetch('/delete_record', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ appointmentId }),
        });

        if (!response.ok) {
            throw new Error('Ошибка при удалении записи');
        }

        // Удаляем элемент из DOM
        appointmentItem.remove();
        console.log(`Запись с ID: ${appointmentId} успешно удалена.`);
    } catch (error) {
        console.error('Ошибка при удалении записи:', error);
        alert('Не удалось удалить запись. Попробуйте позже.');
        // Возвращаем иконку корзины в случае ошибки
        btn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    } finally {
        btn.disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const editButtons = document.querySelectorAll('.edit-button');
    
    editButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const fieldId = this.dataset.field;
            const inputField = document.getElementById(fieldId);
            const icon = this.querySelector('i');

            if (inputField.readOnly) {
                // Enable editing
                inputField.readOnly = false;
                inputField.focus();
                icon.classList.remove('fa-pencil-alt');
                icon.classList.add('fa-check');
                icon.style.color = 'green';
            } else {
                // Save changes
                inputField.readOnly = true;
                icon.classList.remove('fa-check');
                icon.classList.add('fa-pencil-alt');
                icon.style.color = '';
                
                console.log(`Updated ${fieldId}: ${inputField.value}`);

                const userIdElement = document.getElementById("userId");
                const userId = userIdElement.textContent.trim();
                const name = fieldId;
                const update_name = inputField.value;

                try {
                    const response = await fetch(`/profile/update/${userId}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({name, update_name}),
                    });
                    console.log(response.ok);
                } catch (error) {
                    console.error('Error:', error);
                }
            }
        });
    });

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

// Закрытие модального окна по крестику
const modalCloseButton = document.getElementById('modalCloseButton');
modalCloseButton.addEventListener('click', function () {
    if (!isLoading) {
        appointmentsModal.style.display = 'none';
        menuList.style.display = 'flex';
    }
});

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