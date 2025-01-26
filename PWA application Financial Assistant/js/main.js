// DOM Elements
const registrationForm = document.getElementById('registrationForm');
const loginForm = document.getElementById('loginForm');
const dashboard = document.getElementById('dashboard');
const authForm = document.getElementById('authForm');
const loginAuthForm = document.getElementById('loginAuthForm');
const showLoginBtn = document.getElementById('showLoginBtn');
const showRegisterBtn = document.getElementById('showRegisterBtn');
const menuBtn = document.getElementById('menuBtn');
const sideNav = document.getElementById('sideNav');
const logoutBtn = document.getElementById('logoutBtn');
const addBtn = document.getElementById('addBtn');
const typeModal = document.getElementById('typeModal');
const addGoalType = document.getElementById('addGoalType');
const addExpenseType = document.getElementById('addExpenseType');
const goalModal = document.getElementById('goalModal');
const expenseModal = document.getElementById('expenseModal');
const goalForm = document.getElementById('goalForm');
const expenseForm = document.getElementById('expenseForm');
const cancelGoalBtn = document.getElementById('cancelGoalBtn');
const cancelExpenseBtn = document.getElementById('cancelExpenseBtn');
const goalsList = document.getElementById('goalsList');
const expensesList = document.getElementById('expensesList');
const goalsPage = document.getElementById('goalsPage');
const expensesPage = document.getElementById('expensesPage');
const statisticsPage = document.getElementById('statisticsPage');
const closeMenuBtn = document.getElementById('closeMenuBtn');

// Currency symbols mapping
const currencySymbols = {
    'RUB': '₽',
    'BYN': 'Br',
    'USD': '$',
    'CNY': '¥',
    'JPY': '¥',
    'EUR': '€',
    'CHF': '₣'
};

// Navigation state
let currentPage = 'statistics';

// Event Listeners for auth forms
showLoginBtn.addEventListener('click', () => {
    registrationForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
});

showRegisterBtn.addEventListener('click', () => {
    loginForm.classList.add('hidden');
    registrationForm.classList.remove('hidden');
});

authForm.addEventListener('submit', handleRegistration);
loginAuthForm.addEventListener('submit', handleLogin);

// Event Listeners
menuBtn.addEventListener('click', toggleMenu);
closeMenuBtn.addEventListener('click', toggleMenu);
logoutBtn.addEventListener('click', handleLogout);
addBtn.addEventListener('click', () => typeModal.classList.remove('hidden'));
addGoalType.addEventListener('click', () => {
    typeModal.classList.add('hidden');
    goalModal.classList.remove('hidden');
});
addExpenseType.addEventListener('click', () => {
    typeModal.classList.add('hidden');
    expenseModal.classList.remove('hidden');
});
cancelGoalBtn.addEventListener('click', () => goalModal.classList.add('hidden'));
cancelExpenseBtn.addEventListener('click', () => expenseModal.classList.add('hidden'));
goalForm.addEventListener('submit', handleGoalSubmit);
expenseForm.addEventListener('submit', handleExpenseSubmit);

// Auth handlers
function handleRegistration(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Store user data
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push({ email, password });
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify({ email }));

    // Show dashboard
    registrationForm.classList.add('hidden');
    dashboard.classList.remove('hidden');
    showPage('statistics');
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Check credentials
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem('currentUser', JSON.stringify({ email }));
        loginForm.classList.add('hidden');
        dashboard.classList.remove('hidden');
        showPage('statistics');
    } else {
        alert('Неверный email или пароль');
    }
}

// Navigation functions
function showPage(pageName) {
    currentPage = pageName;
    goalsPage.classList.add('hidden');
    expensesPage.classList.add('hidden');
    statisticsPage.classList.add('hidden');

    switch(pageName) {
        case 'goals':
            goalsPage.classList.remove('hidden');
            loadGoals();
            break;
        case 'expenses':
            expensesPage.classList.remove('hidden');
            loadExpenses();
            break;
        case 'statistics':
            statisticsPage.classList.remove('hidden');
            loadStatistics();
            break;
    }
}

// Load Statistics
function loadStatistics() {
    const goals = JSON.parse(localStorage.getItem('goals') || '[]');
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');

    if (goals.length === 0 && expenses.length === 0) {
        statisticsPage.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg p-6 text-center animate-fadeIn">
                <p class="text-lg text-gray-600 mb-4">
                    У вас пока нет никакой статистики. Добавьте цели и расходы, чтобы увидеть статистику.
                </p>
            </div>
        `;
        return;
    }

    const totalGoals = goals.length;
    const totalExpenses = expenses.length;
    const totalGoalAmount = goals.reduce((sum, goal) => sum + goal.amount, 0);
    const totalExpenseAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    statisticsPage.innerHTML = `
        <div class="statistics-card">
            <h2 class="text-xl font-semibold mb-4">Общая статистика</h2>
            <div class="grid grid-cols-2 gap-4">
                <div class="stat-item">
                    <span class="stat-label">Всего целей</span>
                    <span class="stat-value">${totalGoals}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Всего расходов</span>
                    <span class="stat-value">${totalExpenses}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Сумма целей</span>
                    <span class="stat-value">${totalGoalAmount.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Сумма расходов</span>
                    <span class="stat-value">${totalExpenseAmount.toLocaleString('ru-RU')} ₽</span>
                </div>
            </div>
        </div>
    `;
}

function toggleMenu() {
    const isOpen = sideNav.classList.contains('translate-x-0');
    if (isOpen) {
        sideNav.classList.remove('translate-x-0');
        sideNav.classList.add('-translate-x-full');
    } else {
        sideNav.classList.add('translate-x-0');
        sideNav.classList.remove('-translate-x-full');
    }
}

// Handle Logout
function handleLogout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('goals');
    localStorage.removeItem('expenses');
    dashboard.classList.add('hidden');
    registrationForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    sideNav.classList.remove('translate-x-0');
    sideNav.classList.add('-translate-x-full');
}

// Handle Goal Submit
function handleGoalSubmit(e) {
    e.preventDefault();

    const formData = new FormData(goalForm);
    const title = formData.get('title');
    const targetDate = formData.get('targetDate');
    const amount = parseFloat(formData.get('amount'));
    const income = parseFloat(formData.get('income'));
    const currency = formData.get('currency');

    // Calculate months until target
    const today = new Date();
    const targetDateObj = new Date(targetDate);
    const monthsUntilTarget =
        (targetDateObj.getFullYear() - today.getFullYear()) * 12 +
        (targetDateObj.getMonth() - today.getMonth());

    // Calculate required monthly savings
    const requiredMonthlySavings = amount / monthsUntilTarget;
    const maxPossibleMonthlySavings = income * 0.5; // Assume max 50% of income can be saved

    if (requiredMonthlySavings > maxPossibleMonthlySavings) {
        alert('Внимание! С текущим доходом достижение цели к указанной дате может быть затруднительным. Рекомендуем увеличить срок или уменьшить целевую сумму.');
        return;
    }

    const goal = {
        title,
        targetDate,
        amount,
        currency,
        requiredMonthlySavings,
        createdAt: new Date().toISOString()
    };

    // Save goal
    const existingGoals = JSON.parse(localStorage.getItem('goals') || '[]');
    localStorage.setItem('goals', JSON.stringify([...existingGoals, goal]));

    // Update UI
    loadGoals();
    goalModal.classList.add('hidden');
    goalForm.reset();
}

// Handle Expense Submit
function handleExpenseSubmit(e) {
    e.preventDefault();

    const formData = new FormData(expenseForm);
    const expense = {
        title: formData.get('title'),
        date: formData.get('date'),
        amount: parseFloat(formData.get('amount')),
        currency: formData.get('currency'),
        category: formData.get('category'),
        createdAt: new Date().toISOString()
    };

    const existingExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    localStorage.setItem('expenses', JSON.stringify([...existingExpenses, expense]));

    loadExpenses();
    expenseModal.classList.add('hidden');
    expenseForm.reset();
}

// Load Goals
function loadGoals() {
    const goals = JSON.parse(localStorage.getItem('goals') || '[]');
    if (goals.length === 0) {
        goalsList.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg p-6 text-center animate-fadeIn">
                <p class="text-lg text-gray-600 mb-4">
                    У вас пока нет целей. Нажмите + чтобы добавить новую цель.
                </p>
            </div>
        `;
        return;
    }

    goalsList.innerHTML = goals.map(goal => `
        <div class="goal-card">
            <h3>${goal.title}</h3>
            <div class="goal-info">
                <span>Цель до:</span>
                <span>${new Date(goal.targetDate).toLocaleDateString('ru-RU')}</span>
            </div>
            <div class="goal-info">
                <span>Необходимая сумма:</span>
                <span>${goal.amount.toLocaleString('ru-RU')} ${currencySymbols[goal.currency]}</span>
            </div>
            <div class="goal-info">
                <span>Ежемесячный взнос:</span>
                <span class="monthly-savings">${Math.ceil(goal.requiredMonthlySavings).toLocaleString('ru-RU')} ${currencySymbols[goal.currency]}</span>
            </div>
        </div>
    `).join('');
}

// Load Expenses
function loadExpenses() {
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    if (expenses.length === 0) {
        expensesList.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg p-6 text-center animate-fadeIn">
                <p class="text-lg text-gray-600 mb-4">
                    У вас пока нет расходов. Нажмите + чтобы добавить новые расходы.
                </p>
            </div>
        `;
        return;
    }

    expensesList.innerHTML = expenses.map(expense => `
        <div class="expense-card">
            <h3>${expense.title}</h3>
            <div class="expense-info">
                <span>Дата:</span>
                <span>${new Date(expense.date).toLocaleDateString('ru-RU')}</span>
            </div>
            <div class="expense-info">
                <span>Сумма:</span>
                <span>${expense.amount.toLocaleString('ru-RU')} ${currencySymbols[expense.currency]}</span>
            </div>
            <div class="expense-info">
                <span>Категория:</span>
                <span>${getCategoryName(expense.category)}</span>
            </div>
        </div>
    `).join('');
}

// Helper function to get category name
function getCategoryName(category) {
    const categories = {
        food: 'Еда',
        transport: 'Транспорт',
        entertainment: 'Развлечения',
        shopping: 'Покупки',
        health: 'Здоровье',
        utilities: 'Коммунальные услуги',
        other: 'Другое'
    };
    return categories[category] || category;
}

// Check if user is logged in on page load
window.addEventListener('load', () => {
    const user = localStorage.getItem('currentUser');
    if (user) {
        registrationForm.classList.add('hidden');
        loginForm.classList.add('hidden');
        dashboard.classList.remove('hidden');
        showPage('statistics');
    }
});

// Add event listeners for navigation
document.getElementById('goalsLink').addEventListener('click', () => {
    showPage('goals');
    toggleMenu();
});

document.getElementById('expensesLink').addEventListener('click', () => {
    showPage('expenses');
    toggleMenu();
});

document.getElementById('statisticsLink').addEventListener('click', () => {
    showPage('statistics');
    toggleMenu();
});
