// DOM Elements
const registrationForm = document.getElementById('registrationForm');
const loginForm = document.getElementById('loginForm');
const loginAuthForm = document.getElementById('loginAuthForm');
const dashboard = document.getElementById('dashboard');
const authForm = document.getElementById('authForm');

const avatarImage = document.getElementById('avatarImage');
const avatarInput = document.getElementById('avatarInput');
const uploadAvatarBtn = document.getElementById('uploadAvatarBtn');

const profileUsername = document.getElementById('profileUsername');
const profileBio = document.getElementById('profileBio');
const profileBirthdate = document.getElementById('profileBirthdate');

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

const profileAvatarImage = document.getElementById('profileAvatarImage');
const profileUsernameView = document.getElementById('profileUsernameView');
const profileUsernameInput = document.getElementById('profileUsernameInput');
const profileBioView = document.getElementById('profileBioView');
const profileBioInput = document.getElementById('profileBioInput');
const profileBirthdateView = document.getElementById('profileBirthdateView');
const profileBirthdateInput = document.getElementById('profileBirthdateInput');

const editProfileBtn = document.getElementById('editProfileBtn');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

const avatarUploadControls = document.getElementById('avatarUploadControls');

const topUpModal = document.getElementById('topUpModal');
const topUpForm = document.getElementById('topUpForm');
const topUpGoalId = document.getElementById('topUpGoalId');
const topUpAmount = document.getElementById('topUpAmount');
const cancelTopUpBtn = document.getElementById('cancelTopUpBtn');

const adminPage = document.getElementById('adminPage');
const adminLink = document.getElementById('adminLink');



    // Навигация между страницами
    const goalsLink = document.getElementById('goalsLink');
    const expensesLink = document.getElementById('expensesLink');
    const statisticsLink = document.getElementById('statisticsLink');

// Navigation state
let currentPage = 'statistics';


document.addEventListener("DOMContentLoaded", async function () {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
        loginForm.classList.remove('hidden');
        registrationForm.classList.add('hidden');
        dashboard.classList.add('hidden');
        return;
    }

    try {
        const response = await fetch('/check-session', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) throw new Error('Invalid session');

        const session = await response.json();
        document.getElementById("headerUsername").textContent = session.username || "Пользователь";

        function updateMenu(session) {
            const adminLink = document.getElementById('adminLink');

            if (session.role === 'Admin') {
                adminLink?.classList.remove('hidden');
            } else {
                adminLink?.classList.add('hidden');
            }
        }

        updateMenu(session);


        loginForm.classList.add('hidden');
        registrationForm.classList.add('hidden');
        dashboard.classList.remove('hidden');

        showPage('shorts');
        loadGoals();
        loadExpenses();
        loadStatistics();
        loadShorts();
        loadUserProfile();

    } catch (error) {
        console.error("Ошибка при проверке сессии:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userId");

        loginForm.classList.remove('hidden');
        registrationForm.classList.add('hidden');
        dashboard.classList.add('hidden');
    }
});



    // Инициализация кнопок редактирования профиля
    editProfileBtn.addEventListener('click', enableProfileEditing);
    cancelEditBtn.addEventListener('click', () => {
        loadUserProfile();
        disableProfileEditing();
    });

const accessToken = localStorage.getItem('accessToken');

saveProfileBtn.addEventListener('click', async () => {
    const body = {
        username: profileUsernameInput.value.trim(),
        bio: profileBioInput.value.trim(),
        birthdate: profileBirthdateInput.value ? new Date(profileBirthdateInput.value) : null
    };

    try {
        const response = await fetch('/api/userprofile/me', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Ошибка сохранения");
        }

        alert('Профиль обновлён!');
        await loadUserProfile();
    } catch (err) {
        console.error('Ошибка при обновлении профиля:', err);
        alert('Ошибка при обновлении профиля: ' + err.message);
    }
});

    uploadAvatarBtn.addEventListener('click', async () => {
        const file = avatarInput.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch('/api/userprofile/avatar', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            body: formData
        });

        if (res.ok) {
            const result = await res.json();
            profileAvatarImage.src = result.avatarUrl;
        } else {
            console.error("Ошибка загрузки аватара");
        }
    });







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





    // Навигация по страницам
    goalsLink.addEventListener('click', () => {
        showPage('goals');
        toggleMenu();
    });

    expensesLink.addEventListener('click', () => {
        showPage('expenses');
        toggleMenu();
    });

    statisticsLink.addEventListener('click', () => {
        showPage('statistics');
        toggleMenu();
    });
    profileLink.addEventListener('click', () => {
    showPage('profile');
    toggleMenu();
    });
    adminLink.addEventListener('click', () => {
    showPage('admin');
    toggleMenu();
    });
shortLink.addEventListener('click', () => {
    showPage('shorts');
    loadShorts();
    toggleMenu();
});



// Auth handlers
async function handleRegistration(e) {
    e.preventDefault();
    const email = document.getElementById('RegistrationEmail').value.trim();
    const password = document.getElementById('RegistrationPassword').value.trim();

    if (!email || !password) {
        alert('Заполните все поля.');
        return;
    }

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        // Проверяем, есть ли в ответе JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();

            if (response.ok) {
                alert('Вы успешно зарегистрированы!');
                document.getElementById('registrationForm').classList.add('hidden');
                document.getElementById('loginForm').classList.remove('hidden');
            } else {
                alert(`Ошибка регистрации: ${data.message || "Неизвестная ошибка"}`);
            }
        } else {
            // Если ответ не JSON, выводим его текст
            const errorText = await response.text();
            console.error("Ошибка регистрации: ", errorText);
            alert(`Ошибка регистрации: Сервер вернул неожиданный ответ.`);
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
    // Функция для переключения страниц
function showPage(pageName) {
    currentPage = pageName;

    // Скрываем все страницы
    goalsPage.classList.add('hidden');
    expensesPage.classList.add('hidden');
    statisticsPage.classList.add('hidden');
    profilePage.classList.add('hidden'); // ← Добавляем скрытие профиля
    shortsPage.classList.add('hidden');
    adminPage.classList.add('hidden'); //

    if (pageName === 'shorts') {
        loadShorts(); // Загрузка шортсов при переходе
    }

    // Показываем нужную страницу и загружаем данные
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
        case 'profile':
            profilePage.classList.remove('hidden');
            loadUserProfile();
            break;
        case 'admin':
            adminPage.classList.remove('hidden');
            break;
        case 'shorts':
            shortsPage.classList.remove('hidden');
            break;
    }
}

async function loadStatistics() {
    try {
        const [goalsResponse, expensesResponse] = await Promise.all([
            fetch('/api/goals', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
            }),
            fetch('/api/expenses', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
            })
        ]);

        if (!goalsResponse.ok || !expensesResponse.ok) {
            throw new Error("Ошибка при загрузке данных");
        }

        const goals = await goalsResponse.json();
        const expenses = await expensesResponse.json();

        const totalGoals = goals.length;
        const totalExpenses = expenses.length;
        const totalGoalAmount = goals.reduce((sum, goal) => sum + goal.amount, 0);
        const totalExpenseAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

        statisticsPage.innerHTML = `
            <div class="statistics-card">
                <h2 class="text-xl font-semibold mb-4">Общая статистика</h2>
                <div class="grid grid-cols-2 gap-4 mb-6">
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
                <div class="flex flex-col items-center justify-center gap-6">
                    <canvas id="goalsChart" class="max-w-2xl w-full"></canvas>
                    <canvas id="expensesChart" class="max-w-2xl w-full"></canvas>
                </div>
            </div>
        `;

        
        if (goals.length > 0) {
            const goalTitles = goals.map(goal => goal.title);
            const goalAmounts = goals.map(goal => goal.amount);

            new Chart(document.getElementById('goalsChart'), {
                type: 'bar',
                data: {
                    labels: goalTitles,
                    datasets: [{
                        label: 'Цели (₽)',
                        data: goalAmounts,
                        backgroundColor: '#60a5fa'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        title: { display: true, text: 'Цели по суммам' }
                    }
                }
            });
        }

        
        const categoryTranslations = {
            food: 'Еда',
            transport: 'Транспорт',
            housing: 'Жильё',
            entertainment: 'Развлечения',
            health: 'Здоровье',
            education: 'Образование',
            other: 'Другое',
            utilities: 'Коммунальные услуги'

        };

        
        const categories = {};
        expenses.forEach(e => {
            const engCategory = e.category || 'other';
            const rusCategory = categoryTranslations[engCategory] || engCategory;
            categories[rusCategory] = (categories[rusCategory] || 0) + e.amount;
        });

        
        const colorMap = {
            'Еда': '#f87171',
            'Транспорт': '#60a5fa',
            'Жильё': '#34d399',
            'Развлечения': '#fbbf24',
            'Здоровье': '#a78bfa',
            'Образование': '#fb923c',
            'Другое': '#94a3b8'
        };

        if (expenses.length > 0) {
            const categoryLabels = Object.keys(categories);
            const categoryAmounts = Object.values(categories);
            const categoryColors = categoryLabels.map(label => colorMap[label] || '#ccc');

            
            new Chart(document.getElementById('expensesChart'), {
                type: 'pie',
                data: {
                    labels: categoryLabels,
                    datasets: [{
                        label: 'Сумма расходов (₽)',
                        data: categoryAmounts,
                        backgroundColor: categoryColors
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: true, position: 'bottom' },
                        title: { display: true, text: 'Категории расходов (₽)' }
                    }
                }
            });
        }

    } catch (error) {
        console.error('Ошибка при загрузке статистики:', error);
        statisticsPage.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg p-6 text-center">
                <p class="text-lg text-gray-600 mb-4">
                    Произошла ошибка при загрузке статистики: ${error.message}
                </p>
            </div>
        `;
    }
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
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
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

    // Получаем значения из формы
    const title = goalForm.querySelector('[name="title"]').value.trim();
    const target_date = goalForm.querySelector('[name="targetDate"]').value;
    const amount = parseFloat(goalForm.querySelector('[name="amount"]').value);
    const income = parseFloat(goalForm.querySelector('[name="income"]').value);
    const currency = goalForm.querySelector('[name="currency"]').value.trim();

    // Проверка данных
    if (!title || !target_date || isNaN(amount) || amount <= 0 || isNaN(income) || income <= 0 || !currency) {
        console.error("Некорректные данные формы");
        alert("Все поля должны быть заполнены правильно.");
        return;
    }

    const today = new Date();
    const targetDateObj = new Date(target_date);
    const daysUntilTarget = Math.max(1, Math.ceil((targetDateObj - today) / (1000 * 60 * 60 * 24)));
    const monthsUntilTarget = daysUntilTarget / 30.44;
    const required_monthly_savings = amount / monthsUntilTarget;
    const maxPossibleMonthlySavings = income * 0.5;

    if (required_monthly_savings > maxPossibleMonthlySavings) {
        alert('С текущим доходом достичь цель может быть трудно. Увеличьте срок или уменьшите сумму.');
    }

    const goalData = {
        personId: parsedUserId,
        title,
        target_date,
        amount,
        income,
        currency,
    };

    console.log("Отправляемые данные:", goalData);

    try {
        const response = await fetch('/api/goals', {
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
        goalForm.reset();
        goalModal.classList.add('hidden');
        loadGoals();
        loadStatistics();

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
async function handleExpenseSubmit(e) {
    e.preventDefault();

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

    const title = document.querySelector('#expenseForm [name="title"]').value.trim();
    const amount = parseFloat(document.querySelector('#expenseForm [name="amount"]').value);
    const category = document.querySelector('[name="category"]').value.trim();
    const date = document.querySelector('[name="date"]').value;

    if (!title || isNaN(amount) || amount <= 0 || !category || !date) {
        console.error("Некорректные данные формы");
        alert("Все поля должны быть заполнены правильно.");
        return;
    }

    const expenseData = {
        personId: parsedUserId,
        title,
        amount: parseFloat(amount),
        category,
        date: new Date(date).toISOString(), // Преобразуем в ISO-формат
    };

    console.log("Отправляемые данные:", expenseData);

    try {
        const response = await fetch('https://localhost:7034/api/expenses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify(expenseData)
        });

        console.log("Статус ответа:", response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Ответ сервера:", errorData);
            alert("Ошибка сервера: " + JSON.stringify(errorData));
            return;
        }

        alert('Расход успешно добавлен!');
        loadExpenses(); // Обновляем список расходов
        expenseModal.classList.add('hidden'); // Закрываем модальное окно
        expenseForm.reset();

    } catch (error) {
        console.error("Ошибка запроса:", error);
        alert("Ошибка при сохранении расхода. Проверьте консоль.");
    }
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

        goalsList.innerHTML = goals.map(goal => {
            const saved = goal.saved || 0;
            const progress = Math.min((saved / goal.amount) * 100, 100).toFixed(1);
            return `
        <div class="goal-card bg-white rounded-lg shadow p-4 space-y-2">
            <h3 class="text-lg font-bold">${goal.title}</h3>
            <div>Цель до: <strong>${new Date(goal.target_date).toLocaleDateString('ru-RU')}</strong></div>
            <div>Необходимо: ${goal.amount.toLocaleString('ru-RU')} ${currencySymbols[goal.currency]}</div>
            <div>Накоплено: ${saved.toLocaleString('ru-RU')} ${currencySymbols[goal.currency]}</div>

            <div class="w-full bg-gray-200 rounded h-4">
                <div class="bg-blue-600 h-4 rounded" style="width: ${progress}%"></div>
            </div>
            <div class="text-sm text-gray-600">Прогресс: ${progress}%</div>

            <button onclick="openTopUpModal(${goal.id}, ${saved}, ${goal.amount}, '${goal.currency}')" class="text-sm text-blue-600 hover:underline">Пополнить</button>
            <button onclick="deleteGoal(${goal.id})" class="text-sm text-red-600 hover:underline">Удалить</button>
        </div>
    `;
        }).join('');


    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        goalsList.innerHTML = `<p class="text-red-500">Ошибка загрузки данных. Попробуйте позже.</p>`;
    }
}


// Load Expenses
async function loadExpenses() {
    try {
        // Запрос к серверу для получения расходов
        const response = await fetch('/api/expenses', {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`  // Если используется авторизация
            }
        });

        // Проверка успешности ответа
        if (!response.ok) {
            throw new Error(`Ошибка при загрузке расходов: ${response.statusText}`);
        }

        const expenses = await response.json();

        // Проверка, есть ли расходы
        if (expenses.length === 0) {
            expensesList.innerHTML = `
                <div class="bg-white rounded-lg shadow-lg p-6 text-center animate-fadeIn">
                    <p class="text-lg text-gray-600 mb-4">У вас пока нет расходов.</p>
                </div>
            `;
            return;
        }

        // Отображение расходов
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
        <button onclick="deleteExpense(${expense.id})" class="mt-2 text-red-600 hover:underline">Удалить</button>
    </div>
`).join('');

    } catch (error) {
        console.error('Ошибка при загрузке расходов:', error);
        expensesList.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg p-6 text-center animate-fadeIn">
                <p class="text-lg text-gray-600 mb-4">Произошла ошибка при загрузке расходов. Попробуйте снова.</p>
            </div>
        `;
    }
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

async function deleteGoal(id) {
    if (!confirm("Вы уверены, что хотите удалить эту цель?")) return;

    try {
        const response = await fetch(`/api/goals/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
        });

        if (!response.ok) throw new Error("Ошибка при удалении цели");

        alert("Цель удалена.");
        loadGoals();
        loadStatistics();

    } catch (err) {
        console.error("Ошибка удаления цели:", err);
        alert("Ошибка при удалении цели.");
    }
}

async function deleteExpense(id) {
    if (!confirm("Вы уверены, что хотите удалить этот расход?")) return;

    try {
        const response = await fetch(`/api/expenses/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
        });

        if (!response.ok) throw new Error("Ошибка при удалении расхода");

        alert("Расход удалён.");
        loadExpenses();
        loadStatistics();

    } catch (err) {
        console.error("Ошибка удаления расхода:", err);
        alert("Ошибка при удалении расхода.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();

    editProfileBtn.addEventListener('click', enableProfileEditing);
    cancelEditBtn.addEventListener('click', () => {
        loadUserProfile();
        disableProfileEditing();
    });

    saveProfileBtn.addEventListener('click', async () => {
        const body = {
            username: profileUsernameInput.value.trim(),
            bio: profileBioInput.value.trim(),
            birthdate: profileBirthdateInput.value || null
        };

        try {
            const response = await fetch('/api/userprofile/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) throw new Error("Ошибка сохранения");

            alert('Профиль обновлён!');
            await loadUserProfile();
        } catch (err) {
            console.error('Ошибка при обновлении профиля:', err);
            alert('Ошибка при обновлении профиля');
        }
    });

    uploadAvatarBtn.addEventListener('click', async () => {
        const file = avatarInput.files[0];
        if (!file) return alert("Выберите файл.");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch('/api/userprofile/avatar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
                },
                body: formData
            });

            if (!response.ok) throw new Error("Ошибка загрузки");

            const data = await response.json();
            profileAvatarImage.src = data.avatarUrl;
            headerAvatar.src = data.avatarUrl;
            alert('Фото обновлено!');
        } catch (err) {
            console.error("Ошибка при загрузке аватара:", err);
            alert("Ошибка загрузки изображения");
        }
    });
});


async function updateHeaderProfile() {
    try {
        const response = await fetch('/api/userprofile/me', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
            }
        });

        if (!response.ok) return;

        const profile = await response.json();

        document.getElementById("headerUsername").textContent = profile.username || "Пользователь";
        document.getElementById("headerAvatar").src = profile.avatar_path || "/default-avatar.png";
    } catch (err) {
        console.warn("Не удалось обновить данные профиля в шапке:", err);
    }
}

async function loadUserProfile() {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
        console.warn("Токен отсутствует — пользователь не авторизован");
        return;
    }

    try {
        const res = await fetch('/api/userprofile/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!res.ok) {
            const errText = await res.text();
            console.error("Ответ сервера:", res.status, errText);
            throw new Error("Ошибка загрузки профиля");
        }

        const profile = await res.json();

        // Установка данных на страницу
        profileUsernameView.textContent = profile.username || "Не указано";
        profileBioView.textContent = profile.bio || "Не указано";
        profileBirthdateView.textContent = profile.birthdate
            ? new Date(profile.birthdate).toLocaleDateString()
            : "Не указано";

        profileUsernameInput.value = profile.username || "";
        profileBioInput.value = profile.bio || "";
        profileBirthdateInput.value = profile.birthdate
            ? new Date(profile.birthdate).toISOString().split('T')[0]
            : "";

        profileAvatarImage.src = profile.avatar_path || "/default-avatar.png";
    } catch (err) {
        console.error("Ошибка загрузки профиля:", err);
    }
}


function enableProfileEditing() {
    profileUsernameView.classList.add('hidden');
    profileUsernameInput.classList.remove('hidden');

    profileBioView.classList.add('hidden');
    profileBioInput.classList.remove('hidden');

    profileBirthdateView.classList.add('hidden');
    profileBirthdateInput.classList.remove('hidden');

    avatarUploadControls.classList.remove('hidden');
    saveProfileBtn.classList.remove('hidden');
    cancelEditBtn.classList.remove('hidden');
    editProfileBtn.classList.add('hidden');
}

function disableProfileEditing() {
    profileUsernameView.classList.remove('hidden');
    profileUsernameInput.classList.add('hidden');

    profileBioView.classList.remove('hidden');
    profileBioInput.classList.add('hidden');

    profileBirthdateView.classList.remove('hidden');
    profileBirthdateInput.classList.add('hidden');

    avatarUploadControls.classList.add('hidden');
    saveProfileBtn.classList.add('hidden');
    cancelEditBtn.classList.add('hidden');
    editProfileBtn.classList.remove('hidden');
}

editProfileBtn.addEventListener('click', enableProfileEditing);
cancelEditBtn.addEventListener('click', () => {
    loadUserProfile(); // перезагрузит значения
    disableProfileEditing();
});

function openTopUpModal(goalId, saved, maxAmount, currency) {
    topUpGoalId.value = goalId;
    topUpAmount.value = '';
    topUpModal.classList.remove('hidden');
}

cancelTopUpBtn.addEventListener('click', () => topUpModal.classList.add('hidden'));

topUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const goalId = topUpGoalId.value;
    const addAmount = parseFloat(topUpAmount.value);
    if (!goalId || isNaN(addAmount) || addAmount <= 0) return alert("Введите корректную сумму");

    try {
        const response = await fetch(`/api/goals/${goalId}/topup`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify({ amount: addAmount })
        });

        if (!response.ok) throw new Error("Ошибка пополнения");

        alert("Цель пополнена!");
        topUpModal.classList.add('hidden');
        loadGoals();
        loadStatistics();

    } catch (err) {
        console.error("Ошибка при пополнении:", err);
        alert("Ошибка при пополнении цели.");
    }
});


document.getElementById('uploadShortForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);

    const res = await fetch('/api/shorts/upload', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: data
    });

    if (res.ok) {
        alert("Успешно загружено!");
        form.reset();
        loadShorts();
    } else {
        alert("Ошибка загрузки.");
    }
});

async function loadShorts() {
    const accessToken = localStorage.getItem('accessToken');
    const res = await fetch('/api/shorts', {
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) {
        console.error('Ошибка при загрузке шортсов');
        return;
    }

    const shorts = await res.json();

    const storiesContainer = document.getElementById('shortsStories');
    const modal = document.getElementById('shortModal');
    const modalVideo = document.getElementById('shortModalVideo');
    const closeBtn = document.getElementById('closeShortModal');

    storiesContainer.innerHTML = ''; 

    shorts.forEach(short => {
        const storyCircle = document.createElement('div');
        storyCircle.className = 'flex-shrink-0 w-16 h-16 rounded-full bg-blue-200 border-4 border-blue-600 cursor-pointer flex items-center justify-center overflow-hidden';
        storyCircle.title = short.title;

        const previewImage = document.createElement('img');
        previewImage.src = '/default-preview.png'; 
        previewImage.alt = short.title;
        previewImage.className = 'object-cover w-full h-full';

        storyCircle.appendChild(previewImage);

        storyCircle.addEventListener('click', () => {
            modalVideo.src = short.filePath;
            modal.classList.remove('hidden');
            modalVideo.play();
        });

        storiesContainer.appendChild(storyCircle);
    });

    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
            modalVideo.pause();
            modalVideo.currentTime = 0;
            modalVideo.src = '';
        });
    }
}



document.getElementById("closeShortModal").addEventListener("click", () => {
    const modal = document.getElementById("shortModal");
    const video = document.getElementById("shortModalVideo");
    video.pause();
    video.currentTime = 0;
    modal.classList.add("hidden");
});






