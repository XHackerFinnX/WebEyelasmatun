document.addEventListener('DOMContentLoaded', function() {
    const menuIcon = document.getElementById('menuIcon');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const datePicker = document.getElementById('datePicker');
    const ctx = document.getElementById('earningsChart').getContext('2d');
    let chart;
    let selectedDate = new Date();
    let currentFilter = 'day';

    // Menu functionality
    menuIcon.addEventListener('click', function(event) {
        event.stopPropagation();
        dropdownMenu.classList.toggle('active');
    });

    document.addEventListener('click', function(event) {
        if (!menuIcon.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.remove('active');
        }
    });

    // Logout functionality
    const logoutButton = document.getElementById('logoutButton');
    logoutButton.addEventListener('click', async function() {
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

    // Filter buttons functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            updateChart();
        });
    });

    // Date picker functionality
    flatpickr(datePicker, {
        locale: "ru",
        dateFormat: "d.m.Y",
        disableMobile: "true",
        defaultDate: selectedDate,
        onChange: function(selectedDates, dateStr, instance) {
            selectedDate = selectedDates[0];
            updateChart();
        },
        onOpen: function(selectedDates, dateStr, instance) {
            instance.element.parentNode.classList.add('date-picker-open');
        },
        onClose: function(selectedDates, dateStr, instance) {
            instance.element.parentNode.classList.remove('date-picker-open');
        }
    });

    // Chart functionality
    function createChart(labels, data) {
        if (chart) {
            chart.destroy();
        }
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Заработок',
                    data: data,
                    borderColor: 'rgb(212, 169, 119)',
                    backgroundColor: 'rgba(212, 169, 119, 0.2)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value, index, values) {
                                return value + ' ₽';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.parsed.y + ' ₽';
                            }
                        }
                    }
                }
            }
        });
    }

    function updateTable(labels, data) {
        const tableBody = document.querySelector('#earningsTable tbody');
        tableBody.innerHTML = '';
        for (let i = 0; i < labels.length; i++) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${labels[i]}</td>
                <td>${data[i].toLocaleString('ru-RU')} ₽</td>
            `;
            tableBody.appendChild(row);
        }
    }

    // Fetch data from server
    async function fetchData(startDate, endDate) {
        try {
            const response = await fetch('/api/earnings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ startDate, endDate }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching data:', error);
            return { labels: [], earnings: [] };
        }
    }

    async function updateChart() {
        let startDate, endDate;

        switch (currentFilter) {
            case 'day':
                startDate = new Date(selectedDate);
                endDate = new Date(selectedDate);
                endDate.setDate(endDate.getDate() + 1);
                break;
            case 'week':
                startDate = new Date(selectedDate);
                startDate.setDate(startDate.getDate() - startDate.getDay());
                endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 7);
                break;
            case 'month':
                startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
                endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
                break;
            case 'year':
                startDate = new Date(selectedDate.getFullYear(), 0, 1);
                endDate = new Date(selectedDate.getFullYear(), 11, 31);
                break;
        }
        console.log(startDate.getDate(), startDate.getMonth()+1, startDate.getFullYear());
        const data = await fetchData(startDate, endDate);
        createChart(data.labels, data.earnings);
        updateTable(data.labels, data.earnings);
    }

    // Initial chart load
    updateChart();
});

