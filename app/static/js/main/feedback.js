document.addEventListener('DOMContentLoaded', () => {
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => {
        tile.addEventListener('click', handleTileClick);
    });
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

    dropdownMenu.addEventListener('click', function(event) {
        event.stopPropagation();
    });

    function adjustDropdownPosition() {
        const header = document.querySelector('header');
        const dropdownMenu = document.getElementById('dropdownMenu');
        dropdownMenu.style.top = header.offsetHeight + 'px';
    }

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

document.addEventListener('DOMContentLoaded', () => {
    const feedbackForm = document.getElementById('feedback-form');
    const feedbackList = document.getElementById('feedback-list');
    const loadMoreBtn = document.getElementById('load-more');
    const filterDropdownBtn = document.querySelector('.filter-dropdown-btn');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const stars = document.querySelectorAll('.star');

    let currentRating = 0;
    let currentFilter = 'new';
    let userId = 0;
    let allFeedback = []; // Хранение всех отзывов
    let visibleFeedbackCount = 0; // Сколько отзывов сейчас отображено

    const FEEDBACK_STEP = 5; // Количество отзывов, отображаемых за один раз

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.dataset.rating);
            currentRating = rating;
            updateStars();
        });
    });

    function updateStars() {
        stars.forEach(star => {
            const rating = parseInt(star.dataset.rating);
            if (rating <= currentRating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const feedbackText = document.getElementById('feedback-text').value;
        if (feedbackText && currentRating > 0) {
            await submitFeedback(feedbackText, currentRating);
            feedbackForm.reset();
            currentRating = 0;
            updateStars();
        } else {
            alert('Пожалуйста, оставьте отзыв и выберите оценку.');
        }
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.filter;
            filterDropdownBtn.textContent = btn.textContent + ' ';
            const icon = document.createElement('i');
            icon.className = 'fas fa-chevron-down';
            filterDropdownBtn.appendChild(icon);

            // Сброс видимых отзывов
            visibleFeedbackCount = 0;
            applyFilter();
            const filterDropdownContent = document.querySelector('.filter-dropdown-content');
            filterDropdownContent.style.display = 'none';
        });
    });

    loadMoreBtn.addEventListener('click', () => {
        showMoreFeedback();
    });

    document.addEventListener('click', (event) => {
        const filterDropdown = document.querySelector('.filter-dropdown');
        const filterDropdownContent = document.querySelector('.filter-dropdown-content');
        if (!filterDropdown.contains(event.target)) {
            filterDropdownContent.style.display = 'none';
        }
    });

    filterDropdownBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        const filterDropdownContent = document.querySelector('.filter-dropdown-content');
        filterDropdownContent.style.display = filterDropdownContent.style.display === 'block' ? 'none' : 'block';
    });

    async function submitFeedback(text, rating) {
        try {
            const response = await fetch('/api/feedback/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text, rating }),
            });

            if (response.ok) {
                console.log('Отзыв отправлен:', { text, rating });
                alert('Спасибо за ваш отзыв :)');
                loadFeedback();
            } else {
                alert('Ошибка: вы уже оставляли отзыв. Чтобы оставить ещё раз отзыв, запишитесь к Eyelasmatun');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Ошибка при отправке отзыва. Попробуйте позже.');
        }
    }

    async function loadFeedback() {
        try {
            const response = await fetch('/api/feedback/load', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ filteruser: currentFilter }),
            });

            if (response.ok) {
                const feedbackData = await response.json();
                allFeedback = feedbackData.feedback; // Сохраняем все отзывы
                userId = feedbackData.userId;

                // Сбрасываем видимые отзывы и отображаем первые
                visibleFeedbackCount = 0;
                applyFilter();
            } else {
                console.error('Failed to load feedback');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    function applyFilter() {
        const sortedFeedback = sortFeedback(allFeedback);
        feedbackList.innerHTML = ''; // Очистка списка отзывов
        visibleFeedbackCount = 0; // Сбрасываем количество видимых отзывов
        showMoreFeedback(sortedFeedback);
    }

    function showMoreFeedback(filteredFeedback = sortFeedback(allFeedback)) {
        const remainingFeedback = filteredFeedback.slice(visibleFeedbackCount, visibleFeedbackCount + FEEDBACK_STEP);

        remainingFeedback.forEach(item => {
            const feedbackItem = createFeedbackItem(item);
            feedbackList.appendChild(feedbackItem);
        });

        visibleFeedbackCount += remainingFeedback.length;

        // Скрываем кнопку "Ещё", если отзывы закончились
        if (visibleFeedbackCount >= filteredFeedback.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }
    }

    function parseDate(dateString) {
        // Разбиваем строку на день, месяц, год
        const [day, month, year] = dateString.split('.').map(Number);
        // Создаем объект Date (месяцы начинаются с 0)
        return new Date(year, month - 1, day);
    }

    function sortFeedback(feedback) {
        if (currentFilter === 'new') {
            // Сортировка по убыванию даты
            return feedback.sort((a, b) => parseDate(b.date) - parseDate(a.date));
        } else if (currentFilter === 'old') {
            // Сортировка по возрастанию даты
            return feedback.sort((a, b) => parseDate(a.date) - parseDate(b.date));
        } else if (currentFilter === 'high') {
            return feedback.sort((a, b) => b.rating - a.rating);
        } else if (currentFilter === 'low') {
            return feedback.sort((a, b) => a.rating - b.rating);
        } else if (currentFilter === 'my') {
            return feedback.filter(item => item.id === userId);
        }
    }

    function createFeedbackItem(feedback) {
        const item = document.createElement('div');
        item.className = 'feedback-item';
        item.innerHTML = `
            <div class="feedback-header">
                <div class="feedback-avatar-container">
                    <img src="${feedback.avatar}" alt="${feedback.name}" class="feedback-avatar">
                    <span class="feedback-date">${feedback.date}</span>
                </div>
            </div>
            <span class="feedback-name">${feedback.name}</span>
            <div class="feedback-stars">
                ${createStars(feedback.rating)}
                <span class="feedback-rating">${feedback.rating}</span>
            </div>
            <div class="feedback-text">${feedback.text}</div>
        `;
        return item;
    }

    function createStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += `<span class="star ${i <= rating ? 'active' : ''}"">&#9733;</span>`;
        }
        return stars;
    }

    loadFeedback();
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