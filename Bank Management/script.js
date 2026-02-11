// Data Management
let accounts = {};
let selectedAccount = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderAccountList();
    setupEventListeners();
});

// Load Data from LocalStorage
function loadData() {
    const storedData = localStorage.getItem('bankAccounts');
    if (storedData) {
        accounts = JSON.parse(storedData);
    }
}

// Save Data to LocalStorage
function saveData() {
    localStorage.setItem('bankAccounts', JSON.stringify(accounts));
}

// Event Listeners
function setupEventListeners() {
    // Buttons
    document.getElementById('add-account-btn').addEventListener('click', () => {
        openModal('add-account-modal');
    });

    // Close Modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            closeAllModals();
        });
    });

    // Add Account Form
    document.getElementById('add-account-form').addEventListener('submit', (e) => {
        e.preventDefault();
        createAccount();
    });

    // Transaction Form
    document.getElementById('transaction-form').addEventListener('submit', (e) => {
        e.preventDefault();
        processTransaction();
    });

    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
}

// Render Account List Sidebar
function renderAccountList() {
    const list = document.getElementById('accounts-list');
    list.innerHTML = '';

    const accountKeys = Object.keys(accounts).sort();

    if (accountKeys.length === 0) {
        list.innerHTML = '<li style="text-align:center; padding:20px; color:#666;">No accounts yet</li>';
        return;
    }

    accountKeys.forEach(accNo => {
        const acc = accounts[accNo];
        const li = document.createElement('li');
        li.className = 'account-item';
        if (selectedAccount === accNo) li.classList.add('active');

        li.innerHTML = `
            <div class="acc-name">${acc.name}</div>
            <div class="acc-mini-no">#${accNo}</div>
        `;
        li.addEventListener('click', () => {
            selectAccount(accNo);
        });
        list.appendChild(li);
    });
}

// Select Account logic
function selectAccount(accNo) {
    selectedAccount = accNo;
    renderAccountList(); // Update active state styling

    // Update View
    document.getElementById('welcome-message').classList.add('hidden');
    const detailsView = document.getElementById('account-details');
    detailsView.classList.remove('hidden');

    const acc = accounts[accNo];
    document.getElementById('acc-name').textContent = acc.name;
    document.getElementById('acc-no').textContent = `AC: ${accNo}`;

    // Calculate Balance
    const balance = calculateBalance(acc.transactions);
    document.getElementById('acc-balance').textContent = `₹${balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    // Render Transactions
    renderTransactions(acc.transactions);
}

function calculateBalance(transactions) {
    return transactions.reduce((acc, txn) => {
        if (txn.type === 'Deposit' || txn.type === 'Account Created') return acc + txn.amount;
        if (txn.type === 'Withdrawal') return acc - txn.amount;
        return acc;
    }, 0);
}

function renderTransactions(transactions) {
    const tbody = document.getElementById('transactions-body');
    tbody.innerHTML = '';

    // Sort by date desc
    const sortedTxns = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (sortedTxns.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No transactions yet</td></tr>';
        return;
    }

    sortedTxns.forEach(txn => {
        const tr = document.createElement('tr');
        const date = new Date(txn.date).toLocaleDateString() + ' ' + new Date(txn.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const amountClass = (txn.type === 'Withdrawal') ? 'txn-neg' : 'txn-pos';
        const sign = (txn.type === 'Withdrawal') ? '-' : '+';

        tr.innerHTML = `
            <td>${date}</td>
            <td>${txn.type}</td>
            <td>${txn.description}</td>
            <td class="${amountClass}">${sign}₹${txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Create Account
function createAccount() {
    const name = document.getElementById('new-acc-name').value.trim();
    const accNo = document.getElementById('new-acc-no').value.trim();
    const deposit = parseFloat(document.getElementById('new-acc-deposit').value) || 0;

    if (accounts[accNo]) {
        alert('Account number already exists!');
        return;
    }

    accounts[accNo] = {
        name: name,
        transactions: [
            {
                date: new Date().toISOString(),
                type: 'Account Created',
                amount: deposit,
                description: 'Initial Deposit'
            }
        ]
    };

    saveData();
    renderAccountList();
    selectAccount(accNo);
    closeAllModals();
    document.getElementById('add-account-form').reset();
}

// Transaction Handling
function openTransactionModal(type) {
    const modal = document.getElementById('transaction-modal');
    modal.classList.remove('hidden');

    document.getElementById('transaction-title').textContent = `${type} Money`;
    document.getElementById('txn-btn-text').textContent = type;
    document.getElementById('txn-type').value = type;
}

function processTransaction() {
    const type = document.getElementById('txn-type').value; // Deposit or Withdrawal
    const amount = parseFloat(document.getElementById('txn-amount').value);
    const desc = document.getElementById('txn-desc').value || type;

    if (amount <= 0) {
        alert('Please enter a valid positive amount');
        return;
    }

    if (type === 'Withdrawal') {
        const currentBalance = calculateBalance(accounts[selectedAccount].transactions);
        if (amount > currentBalance) {
            alert('Insufficient Funds!');
            return;
        }
    }

    const transaction = {
        date: new Date().toISOString(),
        type: type,
        amount: amount,
        description: desc
    };

    accounts[selectedAccount].transactions.push(transaction);
    saveData();
    selectAccount(selectedAccount); // Refresh view
    closeAllModals();
    document.getElementById('transaction-form').reset();
}

// Delete Account
function deleteCurrentAccount() {
    if (!selectedAccount) return;
    if (confirm(`Are you sure you want to delete ${accounts[selectedAccount].name}'s account? This cannot be undone.`)) {
        delete accounts[selectedAccount];
        saveData();
        selectedAccount = null;
        renderAccountList();

        // Return to welcome screen
        document.getElementById('account-details').classList.add('hidden');
        document.getElementById('welcome-message').classList.remove('hidden');
    }
}

// Helper
function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
}
