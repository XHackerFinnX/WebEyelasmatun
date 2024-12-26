document.addEventListener('DOMContentLoaded', function() {
    const menuIcon = document.getElementById('menuIcon');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const addItemBtn = document.getElementById('addItemBtn');
    const priceList = document.getElementById('priceList');

    // Existing menu functionality
    menuIcon.addEventListener('click', function(event) {
        event.stopPropagation();
        dropdownMenu.classList.toggle('active');
        menuIcon.classList.toggle('active');
    });

    document.addEventListener('click', function(event) {
        if (!menuIcon.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.remove('active');
            menuIcon.classList.remove('active');
        }
    });

    dropdownMenu.addEventListener('click', function(event) {
        event.stopPropagation();
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

    function addPriceItem(item) {
        const li = document.createElement('li');
        li.className = 'price-item';
        li.dataset.id = item.id;
        li.innerHTML = `
            <input type="text" placeholder="Название" class="item-name" value="${item.name}">
            <input type="number" placeholder="Цена" class="item-price" value="${item.price}">
        `;
        priceList.appendChild(li);

        setupItemListeners(li);
    }

    function setupItemListeners(li) {
        const saveBtn = li.querySelector('.save-btn');
        const deleteBtn = li.querySelector('.delete-btn');
        const nameInput = li.querySelector('.item-name');
        const priceInput = li.querySelector('.item-price');

        saveBtn.addEventListener('click', function() {
            if (nameInput.value && priceInput.value) {
                const item = {
                    id: li.dataset.id,
                    name: nameInput.value,
                    price: priceInput.value
                };
                console.log('Saving item:', item);
                savePriceItem(item);

                li.innerHTML = `
                    <span class="item-name-display">${item.name}</span>
                    <span class="item-price-display">${item.price} руб.</span>
                `;
                
                const editBtn = li.querySelector('.edit-btn');
                
                setupDeleteListener(li);
            }
        });

        setupDeleteListener(li);
    }
});

