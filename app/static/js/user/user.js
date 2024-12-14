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

