// Default User Management
let currentUser = JSON.parse(localStorage.getItem('currentUser'));

if (!currentUser) {
    currentUser = {
        id: 'default-user',
        name: 'My Budget',
        email: 'user@example.com',
        registrationDate: new Date().toISOString(),
        transactions: [],
        nextId: 1
    };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

function saveUserData() {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

function initApp() {
    const today = new Date();
    document.getElementById('current-date').textContent = today.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    document.getElementById('income-date').valueAsDate = today;
    document.getElementById('expense-date').valueAsDate = today;

    // Chart Defaults
    if (window.Chart) {
        Chart.defaults.color = '#fff';
        Chart.defaults.borderColor = 'rgba(255,255,255,0.1)';
    }

    // Initialize Charts if elements exist
    let expenseChart, comparisonChart;
    const expenseChartCanvas = document.getElementById('expense-chart');
    const comparisonChartCanvas = document.getElementById('comparison-chart');

    if (expenseChartCanvas && window.Chart) {
        // Destroy existing chart if it exists to avoid duplication glitches
        if (window.myExpenseChart instanceof Chart) window.myExpenseChart.destroy();

        window.myExpenseChart = new Chart(expenseChartCanvas, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#4361ee', '#3a0ca3', '#4cc9f0', '#f72585',
                        '#fca311', '#7209b7', '#4895ef'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right', labels: { color: 'white' } }
                }
            }
        });
        expenseChart = window.myExpenseChart;
    }

    if (comparisonChartCanvas && window.Chart) {
        if (window.myComparisonChart instanceof Chart) window.myComparisonChart.destroy();

        window.myComparisonChart = new Chart(comparisonChartCanvas, {
            type: 'bar',
            data: {
                labels: ['Income', 'Expenses'],
                datasets: [{
                    label: 'Amount',
                    data: [0, 0],
                    backgroundColor: ['#00d2ff', '#ff5e62']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' } },
                    x: { grid: { display: false } }
                },
                plugins: { legend: { display: false } }
            }
        });
        comparisonChart = window.myComparisonChart;
    }

    // Toggle Transactions Button Logic
    const toggleBtn = document.getElementById('toggle-transactions-btn');
    const transactionList = document.getElementById('transaction-list');

    if (toggleBtn && transactionList) {
        // Reset state
        transactionList.classList.remove('show');
        transactionList.style.display = 'none';
        toggleBtn.textContent = 'Show Transactions';

        toggleBtn.onclick = function () {
            if (transactionList.classList.contains('show')) {
                transactionList.classList.remove('show');
                setTimeout(() => { transactionList.style.display = 'none'; }, 300); // Wait for potential fade out if added
                transactionList.style.display = 'none'; // Immediate hide for now
                this.textContent = 'Show Transactions';
            } else {
                transactionList.style.display = 'block';
                // Small delay to allow display:block to apply before adding class for animation
                setTimeout(() => transactionList.classList.add('show'), 10);
                this.textContent = 'Hide Transactions';
            }
        };
    }

    updateUI(expenseChart, comparisonChart);

    document.getElementById('income-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const title = document.getElementById('income-title').value || 'Untitled';
        const amount = parseFloat(document.getElementById('income-amount').value) || 0;
        const date = document.getElementById('income-date').value || new Date().toISOString().split('T')[0];
        const category = document.getElementById('income-category').value;

        addTransaction('income', title, amount, date, category);
        this.reset();
        document.getElementById('income-date').valueAsDate = new Date();
    });

    document.getElementById('expense-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const title = document.getElementById('expense-title').value || 'Untitled';
        const amount = parseFloat(document.getElementById('expense-amount').value) || 0;
        const date = document.getElementById('expense-date').value || new Date().toISOString().split('T')[0];
        const category = document.getElementById('expense-category').value;

        addTransaction('expense', title, amount, date, category);
        this.reset();
        document.getElementById('expense-date').valueAsDate = new Date();
    });

    function addTransaction(type, title, amount, date, category) {
        const transaction = {
            id: currentUser.nextId++,
            type,
            title,
            amount,
            date,
            category
        };

        currentUser.transactions.push(transaction);
        saveUserData();
        updateUI(expenseChart, comparisonChart);
    }

    function deleteTransaction(id) {
        currentUser.transactions = currentUser.transactions.filter(transaction => transaction.id !== id);
        saveUserData();
        updateUI(expenseChart, comparisonChart);
    }

    function updateUI(eChart, cChart) {
        const totalIncome = currentUser.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = currentUser.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalBalance = totalIncome - totalExpenses;

        document.getElementById('total-income').textContent = `₹${totalIncome.toFixed(2)}`;
        document.getElementById('total-expenses').textContent = `₹${totalExpenses.toFixed(2)}`;
        document.getElementById('total-balance').textContent = `₹${totalBalance.toFixed(2)}`;

        const tList = document.getElementById('transaction-list');
        tList.innerHTML = '';

        const sortedTransactions = [...currentUser.transactions].sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        );

        sortedTransactions.forEach(transaction => {
            const li = document.createElement('li');
            li.className = `transaction-item ${transaction.type}-item`;

            li.innerHTML = `
                <div class="transaction-info">
                    <div class="transaction-title">${transaction.title}</div>
                    <div class="transaction-category">${transaction.category} • ${new Date(transaction.date).toLocaleDateString()}</div>
                </div>
                <div class="transaction-amount" style="color: ${transaction.type === 'income' ? '#00d2ff' : '#ff5e62'};">
                    ${transaction.type === 'income' ? '+' : '-'}₹${transaction.amount.toFixed(2)}
                </div>
                <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            tList.appendChild(li);
        });

        updateCharts(eChart, cChart);
    }

    function updateCharts(eChart, cChart) {
        if (!currentUser) return;

        // Expense Chart
        if (eChart) {
            const expensesByCategory = {};
            currentUser.transactions
                .filter(t => t.type === 'expense')
                .forEach(t => {
                    expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
                });

            eChart.data.labels = Object.keys(expensesByCategory);
            eChart.data.datasets[0].data = Object.values(expensesByCategory);
            eChart.update();
        }

        // Comparison Chart
        if (cChart) {
            const totalIncome = currentUser.transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

            const totalExpenses = currentUser.transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            cChart.data.datasets[0].data = [totalIncome, totalExpenses];
            cChart.update();
        }
    }

    window.deleteTransaction = deleteTransaction;
}

document.addEventListener('DOMContentLoaded', function () {
    initApp();
});
