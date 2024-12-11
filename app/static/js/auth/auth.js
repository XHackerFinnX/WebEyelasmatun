document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorPopup = document.getElementById('errorPopup');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                window.location.href = '/';
            } else {
                showErrorPopup();
            }
        } catch (error) {
            console.error('Error:', error);
            showErrorPopup();
        }
    });

    function showErrorPopup() {
        errorPopup.style.display = 'block';
        setTimeout(() => {
            errorPopup.style.display = 'none';
        }, 3000);
    }
});

