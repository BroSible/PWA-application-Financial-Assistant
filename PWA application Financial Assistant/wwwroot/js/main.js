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
async function handleRegistration(e) {
    e.preventDefault();
    const email = document.getElementById('RegistrationEmail').value;
    const password = document.getElementById('RegistrationPassword').value;

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            alert('Вы успешно зарегистрированы!');
            registrationForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        } else {
            const error = await response.json();
            alert(`Ошибка регистрации: ${error.message}`);
        }
    } catch (err) {
        console.error('Ошибка регистрации:', err);
        alert('Произошла ошибка при регистрации.');
    }
}


async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Ответ сервера:", data); // Логируем ответ сервера

            // Проверяем, что data содержит userId
            if (!data.userId) {
                console.error("Ошибка: userId не найден в ответе сервера");
                alert("Ошибка входа: userId не найден.");
                return;
            }

            alert(`Добро пожаловать, ${data.username || "пользователь"}!`);

            // Сохраняем accessToken и userId в localStorage
            localStorage.setItem('accessToken', data.access_token);
            localStorage.setItem('userId', data.userId.toString()); // Убедитесь, что userId сохраняется как строка

            loginForm.classList.add('hidden');
            dashboard.classList.remove('hidden');
            showPage('statistics');
        } else {
            alert('Неправильный email или пароль.');
        }
    } catch (err) {
        console.error('Ошибка входа:', err);
        alert('Произошла ошибка при входе.');
    }
}



// Navigation functions
function showPage(pageName) {
    currentPage = pageName;
    goalsPage.classList.add('hidden');
    expensesPage.classList.add('hidden');
    statisticsPage.classList.add('hidden');

    switch (pageName) {
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
    localStorage.removeItem('jwt');
    localStorage.removeItem('username');
    localStorage.removeItem('goals');
    localStorage.removeItem('expenses');
    dashboard.classList.add('hidden');
    registrationForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    sideNav.classList.remove('translate-x-0');
    sideNav.classList.add('-translate-x-full');
}

// Handle Goal Submit
async function handleGoalSubmit(event) {
    event.preventDefault();

    const userId = localStorage.getItem('userId');
    if (!userId) {
        console.error("Ошибка: userId не найден в localStorage");
        alert("Вы не авторизованы.");
        return;
    }

    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
        console.error("Ошибка: userId не является числом");
        alert("Ошибка: userId не является числом.");
        return;
    }

    const title = document.querySelector('[name="title"]').value.trim();
    const target_date = document.querySelector('[name="targetDate"]').value;
    const amount = parseFloat(document.querySelector('[name="amount"]').value);
    const income = parseFloat(document.querySelector('[name="income"]').value);
    const currency = document.querySelector('[name="currency"]').value.trim();

    if (!title || !target_date || amount <= 0 || income <= 0 || !currency) {
        console.error("Некорректные данные формы");
        alert("Все поля должны быть заполнены правильно.");
        return;
    }

    // Calculate months until target
    const today = new Date();
    const targetDateObj = new Date(target_date);
    const monthsUntilTarget =
        (targetDateObj.getFullYear() - today.getFullYear()) * 12 +
        (targetDateObj.getMonth() - today.getMonth());

    // Calculate required monthly savings
    const required_monthly_savings = amount / monthsUntilTarget;
    const maxPossibleMonthlySavings = income * 0.5; // Assume max 50% of income can be saved

    if (required_monthly_savings > maxPossibleMonthlySavings) {
        alert('Внимание! С текущим доходом достижение цели к указанной дате может быть затруднительным. Рекомендуем увеличить срок или уменьшить целевую сумму.');
        //return;
    }

    const goalData = {
        personId: parsedUserId, // Используем parsedUserId
        title,
        target_date,
        amount,
        income,
        currency,
    };

    loadGoals();
    loadStatistics();
    goalModal.classList.add('hidden');
    goalForm.reset();

    console.log("Отправляемые данные:", goalData);

    try {
        const response = await fetch('https://localhost:7034/api/goals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify(goalData)
        });

        console.log("Статус ответа:", response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Ответ сервера:", errorData);
            alert("Ошибка сервера: " + JSON.stringify(errorData));
            return;
        }

        alert('Цель успешно добавлена!');
        event.target.reset();

    } catch (error) {
        console.error("Ошибка запроса:", error);
        alert("Ошибка при сохранении цели. Проверьте консоль.");
    }
}





// Функция для скрытия модального окна (если нужно)
function hideModal() {
    const goalModal = document.getElementById('goalModal');
    goalModal.classList.add('hidden');
}

// Функция для отображения модального окна (если нужно)
function showModal() {
    const goalModal = document.getElementById('goalModal');
    goalModal.classList.remove('hidden');
}




// Handle Expense Submit
function handleExpenseSubmit(e) {
    e.preventDefault();

    const formData = new FormData(expenseForm);
    const title = formData.get('title');
    const amount = parseFloat(formData.get('amount'));
    const category = formData.get('category');
    const date = formData.get('date');

    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    expenses.push({
        title,
        amount,
        category,
        date
    });

    localStorage.setItem('expenses', JSON.stringify(expenses));
    loadExpenses();
    expenseModal.classList.add('hidden');
}

// Load Goals
async function loadGoals() {
    try {
        const response = await fetch("/api/goals", {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
            }
        });

        if (!response.ok) {
            throw new Error("Ошибка загрузки целей");
        }

        const goals = await response.json();

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
                    <span>${new Date(goal.target_date).toLocaleDateString('ru-RU')}</span>
                </div>
                <div class="goal-info">
                    <span>Необходимая сумма:</span>
                    <span>${goal.amount.toLocaleString('ru-RU')} ${currencySymbols[goal.currency]}</span>
                </div>
                <div class="goal-info">
                    <span>Ежемесячный взнос:</span>
                    <span class="monthly-savings">${Math.ceil(goal.required_monthly_savings).toLocaleString('ru-RU')} ${currencySymbols[goal.currency]}</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        goalsList.innerHTML = `<p class="text-red-500">Ошибка загрузки данных. Попробуйте позже.</p>`;
    }
}


// Load Expenses
function loadExpenses() {
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    expensesList.innerHTML = expenses.map(expense => `
        <div class="expense-card">
            <h3>${expense.title}</h3>
            <div class="expense-info">
                <span>Сумма:</span>
                <span>${expense.amount.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div class="expense-info">
                <span>Категория:</span>
                <span>${expense.category}</span>
            </div>
            <div class="expense-info">
                <span>Дата:</span>
                <span>${new Date(expense.date).toLocaleDateString('ru-RU')}</span>
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




