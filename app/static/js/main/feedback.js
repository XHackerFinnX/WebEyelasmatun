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

document.addEventListener('DOMContentLoaded', () => {
    const feedbackForm = document.getElementById('feedback-form');
    const feedbackList = document.getElementById('feedback-list');
    const loadMoreBtn = document.getElementById('load-more');
    const filterDropdownBtn = document.querySelector('.filter-dropdown-btn');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const stars = document.querySelectorAll('.star');

    let currentRating = 0;
    let currentFilter = 'new';
    let currentPage = 1;

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

    feedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const feedbackText = document.getElementById('feedback-text').value;
        if (feedbackText && currentRating > 0) {
            submitFeedback(feedbackText, currentRating);
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
            currentPage = 1;
            loadFeedback();

            const filterDropdownContent = document.querySelector('.filter-dropdown-content');
            filterDropdownContent.style.display = 'none';
        });
    });

    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        loadFeedback(true);
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

    function submitFeedback(text, rating) {
        console.log('Отзыв отправлен:', { text, rating });
        loadFeedback();
        alert('Спасибо за ваш отзыв :)');
    }

    function loadFeedback(append = false) {
        let sortedFeedback = [...fakeFeedback];
        if (currentFilter === 'new') {
            sortedFeedback.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (currentFilter === 'old') {
            sortedFeedback.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (currentFilter === 'high') {
            sortedFeedback.sort((a, b) => b.rating - a.rating);
        } else if (currentFilter === 'low') {
            sortedFeedback.sort((a, b) => a.rating - b.rating);
        } else if (currentFilter === 'my') {
            const userId = 2;
            sortedFeedback = sortedFeedback.filter(feedback => feedback.id === userId);
        }

        const startIndex = (currentPage - 1) * 10;
        const endIndex = currentPage * 10;
        const currentPageFeedback = sortedFeedback.slice(startIndex, endIndex);

        if (!append) {
            feedbackList.innerHTML = '';
        }

        currentPageFeedback.forEach(feedback => {
            const feedbackItem = createFeedbackItem(feedback);
            feedbackList.appendChild(feedbackItem);
        });

        if (endIndex >= sortedFeedback.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
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

    const fakeFeedback = [
        { id: 1, name: 'Анна', avatar: '/app/static/images/feedback.png', text: 'Отличный сервис!', rating: 5, date: '2024-12-01' },
        { id: 2, name: 'Иван', avatar: '/app/static/images/feedback.png', text: 'Хорошо, но можно лучше.', rating: 4, date: '2024-11-30' },
        { id: 3, name: 'Мария', avatar: '/app/static/images/feedback.png', text: 'Не понравилось обслуживание.', rating: 2, date: '2024-11-29' },
        { id: 4, name: 'Петр', avatar: '/app/static/images/feedback.png', text: 'Все отлично!', rating: 5, date: '2024-11-28' },
        { id: 5, name: 'Ольга', avatar: '/app/static/images/feedback.png', text: 'Нормально.', rating: 3, date: '2024-11-27' },
        { id: 6, name: 'Сергей', avatar: '/app/static/images/feedback.png', text: 'Ужасно!', rating: 1, date: '2024-11-26' },
        { id: 7, name: 'Елена', avatar: '/app/static/images/feedback.png', text: 'Рекомендую!', rating: 5, date: '2024-11-25' },
        { id: 8, name: 'Дмитрий', avatar: '/app/static/images/feedback.png', text: 'Неплохо.', rating: 4, date: '2024-11-24' },
        { id: 9, name: 'Светлана', avatar: '/app/static/images/feedback.png', text: 'Быстро и удобно.', rating: 5, date: '2024-11-23' },
        { id: 10, name: 'Андрей', avatar: '/app/static/images/feedback.png', text: 'Все понравилось!', rating: 5, date: '2024-11-22' },
        { id: 11, name: 'Татьяна', avatar: '/app/static/images/feedback.png', text: 'Отличный сервис!', rating: 5, date: '2024-11-21' },
        { id: 12, name: 'Алексей', avatar: '/app/static/images/feedback.png', text: 'Хорошо, но можно лучше.', rating: 4, date: '2024-11-20' },
        { id: 13, name: 'Наталья', avatar: '/app/static/images/feedback.png', text: 'Не понравилось обслуживание. Не апварпп ы понравилось обслуживание. Не понравилось обслуживание. Не понравилось обслуживание.', rating: 2, date: '2024-11-19' },
        { id: 14, name: 'Владимир', avatar: '/app/static/images/feedback.png', text: 'Все отлично!', rating: 5, date: '2024-11-18' },
        { id: 15, name: 'Юлия', avatar: '/app/static/images/feedback.png', text: 'Нормально.', rating: 3, date: '2024-11-17' },
        { id: 16, name: 'Михаил', avatar: '/app/static/images/feedback.png', text: 'Ужасно!', rating: 1, date: '2024-11-16' },
        { id: 17, name: 'Ирина', avatar: '/app/static/images/feedback.png', text: 'Рекомендую!', rating: 5, date: '2024-11-15' },
        { id: 18, name: 'Евгений', avatar: '/app/static/images/feedback.png', text: 'Неплохо.', rating: 4, date: '2024-11-14' },
        { id: 19, name: 'Анастасия', avatar: '/app/static/images/feedback.png', text: 'Быстро и удобно.', rating: 5, date: '2024-11-12' },
        { id: 20, name: 'Денис', avatar: '/app/static/images/feedback.png', text: 'Все понравилось!', rating: 5, date: '2024-11-13' },
        { id: 21, name: 'Денис', avatar: '/app/static/images/feedback.png', text: 'Все понравилось!', rating: 5, date: '2024-11-13' }
    ];

    loadFeedback();
});
