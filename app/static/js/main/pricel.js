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

    // New price list functionality
    addItemBtn.addEventListener('click', function() {
        const newItem = { id: Date.now(), name: '', price: '' };
        addPriceItem(newItem);
    });

    function addPriceItem(item) {
        const li = document.createElement('li');
        li.className = 'price-item';
        li.dataset.id = item.id;
        li.innerHTML = `
            <input type="text" placeholder="Название" class="item-name" value="${item.name}">
            <input type="number" placeholder="Цена" class="item-price" value="${item.price}">
            <div class="actions">
                <button class="save-btn" title="Сохранить"><i class="fas fa-check"></i></button>
                <button class="delete-btn" title="Удалить"><i class="fas fa-trash"></i></button>
            </div>
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
                    <div class="actions">
                        <button class="edit-btn" title="Редактировать"><i class="fas fa-edit"></i></button>
                        <button class="delete-btn" title="Удалить"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                
                const editBtn = li.querySelector('.edit-btn');
                editBtn.addEventListener('click', function() {
                    li.innerHTML = `
                        <input type="text" value="${item.name}" class="item-name">
                        <input type="number" value="${item.price}" class="item-price">
                        <div class="actions">
                            <button class="save-btn" title="Сохранить"><i class="fas fa-check"></i></button>
                            <button class="delete-btn" title="Удалить"><i class="fas fa-trash"></i></button>
                        </div>
                    `;
                    setupItemListeners(li);
                });
                
                setupDeleteListener(li);
            }
        });

        setupDeleteListener(li);
    }

    function setupDeleteListener(li) {
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', function() {
            const itemId = li.dataset.id;
            console.log('Deleting item:', itemId);
            deletePriceItem(itemId);
            li.remove();
        });
    }

    async function savePriceItem(item) {
        try {
            const response = await fetch('/api/price-items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(item),
            });
            if (!response.ok) {
                throw new Error('Failed to save price item');
            }
            console.log('Price item saved successfully');
        } catch (error) {
            console.error('Error saving price item:', error);
        }
    }

    async function deletePriceItem(itemId) {
        try {
            const response = await fetch(`/api/price-items/${itemId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete price item');
            }
            console.log('Price item deleted successfully');
        } catch (error) {
            console.error('Error deleting price item:', error);
        }
    }

    async function loadPriceItems() {
        try {
            const response = await fetch('/api/price-items');
            if (!response.ok) {
                throw new Error('Failed to load price items');
            }
            const items = await response.json();
            items.forEach(addPriceItem);
        } catch (error) {
            console.error('Error loading price items:', error);
        }
    }

    // Load existing price items when the page loads
    loadPriceItems();
});
