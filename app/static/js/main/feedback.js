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
    let userId = 0;

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
                alert('Вы уже оставляли отзыв. Вы сможете оставить ещё один отзыв, если придете на запись к Eyelasmatun');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Ошибка при отправке отзыва. Попробуйте позже.');
        }
    }

    async function loadFeedback(append = false) {
        try {
            const response = await fetch('/api/feedback/load', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ filteruser: currentFilter, page: currentPage }),
            });

            if (response.ok) {
                const feedbackData = await response.json();
                
                const { feedback, hasMore, userId: fetchedUserId } = feedbackData;
                userId = fetchedUserId;
                if (!append) {
                    feedbackList.innerHTML = '';
                }

                const sortedFeedback = sortFeedback(feedback);

                sortedFeedback.forEach(item => {
                    const feedbackItem = createFeedbackItem(item);
                    feedbackList.appendChild(feedbackItem);
                });

                if (!hasMore) {
                    loadMoreBtn.style.display = 'none';
                } else {
                    loadMoreBtn.style.display = 'block';
                }
            } else {
                console.error('Failed to load feedback');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    function sortFeedback(feedback) {
        if (currentFilter === 'new') {
            return feedback.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (currentFilter === 'old') {
            return feedback.sort((a, b) => new Date(a.date) - new Date(b.date));
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
