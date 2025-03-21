document.addEventListener("DOMContentLoaded", function () {
    checkAuth();
});

function checkAuth() {
    const user = localStorage.getItem("currentUser");
    if (user) {
        document.getElementById("presentation").style.display = "none";
        document.getElementById("navbar").style.display = "flex";
        // Show admin button only for admin user
        if (user === 'leo.tran@outlook.fr') {
            document.getElementById("adminButton").style.display = "block";
        }
        navigate('offers');
    }
}

function navigate(page) {
    const app = document.getElementById("app");
    if (page === 'offers') {
        loadOffers();
    } else if (page === 'courses') {
        loadMyCourses();
    } else if (page === 'myinfo') {
        loadUserInfo();
    } else if (page === 'admin') {
        loadAdminPanel();
    }
}

function showLogin() {
    document.getElementById("presentation").style.display = "none";
    document.getElementById("app").innerHTML = `
        <div class="auth-container">
            <h1>Login</h1>
            <div id="login-error" class="error-message" style="display: none;"></div>
            <input type="email" id="login-email" placeholder="Email Address">
            <input type="password" id="login-password" placeholder="Password">
            <button class="auth-btn" onclick="login()">Sign In</button>
            <div class="auth-links">
                <a href="#" onclick="showSignup()">Sign Up</a>
            </div>
        </div>
    `;
}

function showSignup() {
    document.getElementById("presentation").style.display = "none";
    document.getElementById("app").innerHTML = `
        <div class="auth-container">
            <h1>Sign Up</h1>
            <div id="signup-error" class="error-message" style="display: none;"></div>
            <input type="text" id="signup-name" placeholder="Full Name">
            <input type="email" id="signup-email" placeholder="Email Address">
            <input type="password" id="signup-password" placeholder="Password">
            <input type="password" id="confirm-password" placeholder="Confirm Password">
            <button class="auth-btn" onclick="signup()">Sign Up</button>
            <div class="auth-links">
                <a href="#" onclick="showLogin()">Already have an account? Sign In</a>
            </div>
        </div>
    `;
}

function login() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const now = new Date().toISOString();

    // Check if email exists
    const storedPassword = localStorage.getItem(`${email}_password`);
    if (!storedPassword) {
        showError('login-error', 'Email address not found. Please sign up first.');
        return;
    }

    // Validate password
    if (storedPassword !== password) {
        showError('login-error', 'Incorrect password. Please try again.');
        return;
    }
    
    // Update user data and proceed with login
    localStorage.setItem("currentUser", email);
    localStorage.setItem(`${email}_lastLogin`, now);
    
    // Track activity
    const today = new Date().toISOString().split('T')[0];
    const week = getWeekNumber(new Date());
    const month = new Date().toISOString().slice(0, 7);
    
    // Daily activity
    let dailyActivity = JSON.parse(localStorage.getItem('dailyActivity') || '{}');
    dailyActivity[today] = [...new Set([...(dailyActivity[today] || []), email])];
    localStorage.setItem('dailyActivity', JSON.stringify(dailyActivity));
    
    // Weekly activity
    let weeklyActivity = JSON.parse(localStorage.getItem('weeklyActivity') || '{}');
    weeklyActivity[week] = [...new Set([...(weeklyActivity[week] || []), email])];
    localStorage.setItem('weeklyActivity', JSON.stringify(weeklyActivity));
    
    // Monthly activity
    let monthlyActivity = JSON.parse(localStorage.getItem('monthlyActivity') || '{}');
    monthlyActivity[month] = [...new Set([...(monthlyActivity[month] || []), email])];
    localStorage.setItem('monthlyActivity', JSON.stringify(monthlyActivity));

    const connections = parseInt(localStorage.getItem(`${email}_connections`) || '0');
    localStorage.setItem(`${email}_connections`, connections + 1);
    
    document.getElementById("navbar").style.display = "flex";
    if (email === 'leo.tran@outlook.fr') {
        document.getElementById("adminButton").style.display = "block";
    }
    navigate('offers');
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1)/7);
    return d.getUTCFullYear() + '-W' + weekNo;
}

function signup() {
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const name = document.getElementById("signup-name").value;
    const now = new Date().toISOString();

    // Show error if email already exists
    if (localStorage.getItem(`${email}_password`)) {
        showError('signup-error', 'This email is already registered. Please login instead.');
        return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
        showError('signup-error', 'Passwords do not match.');
        return;
    }

    // Store user data
    localStorage.setItem(`${email}_password`, password);
    localStorage.setItem(`${email}_name`, name);
    localStorage.setItem(`${email}_created`, now);
    localStorage.setItem(`${email}_connections`, '0');
    localStorage.setItem(`${email}_paid`, 'false');

    // Automatically log in after signup
    localStorage.setItem("currentUser", email);
    document.getElementById("navbar").style.display = "flex";
    navigate('offers');
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000); // Hide error after 5 seconds
}

function loadOffers() {
    document.getElementById("app").innerHTML = `
        <div class="offers-container">
            <h1>Offers</h1>
            <button class="big-btn" onclick="loadYearCourses(1)">1st Year Courses</button>
            <button class="big-btn" onclick="loadYearCourses(2)">2nd Year Courses</button>
            <button class="big-btn" onclick="loadPacks()">Packs</button>
            <button class="big-btn" onclick="loadFreeDemo()">Free Demo</button>
        </div>
    `;
}

function loadPacks() {
    document.getElementById("app").innerHTML = `
        <div class="offers-container">
            <h1>Course Packs</h1>
            <button class="big-btn">1st Year Full First Semester's Courses</button>
            <button class="big-btn">1st Year Full Second Semester's Courses</button>
            <button class="big-btn">2nd Year Full First Semester's Courses</button>
            <button class="big-btn">2nd Year Full Second Semester's Courses</button>
            <button class="back-btn" onclick="loadOffers()">Back to Offers</button>
        </div>
    `;
}

function loadFreeDemo() {
    document.getElementById("app").innerHTML = `
        <div class="offers-container">
            <h1>Free Demo Course</h1>
            <button class="big-btn" onclick="loadMarketingFundamentals()">Marketing Fundamentals</button>
            <button class="back-btn" onclick="loadOffers()">Back to Offers</button>
        </div>
    `;
}

function loadYearCourses(year) {
    document.getElementById("app").innerHTML = `
        <div class="offers-container">
            <h1>${year}st Year Courses</h1>
            <button class="big-btn" onclick="loadSemesterCourses(${year}, 1)">Semester 1</button>
            <button class="big-btn" onclick="loadSemesterCourses(${year}, 2)">Semester 2</button>
            <button class="back-btn" onclick="loadOffers()">Back to Offers</button>
        </div>
    `;
}

function loadSemesterCourses(year, semester) {
    let courses = {
        "1-1": ["Applied Business Mathematics", "Financial Accounting", "Management Tools and Principles", "Marketing Fundamentals"],
        "1-2": ["Mathematics For Management", "Introduction To Programming", "Cost Accounting", "Microeconomics"],
        "2-1": ["Business Driven-Information", "Corporate Finance", "Macroeconomics", "Marketing Management", "Statistics & Data Analysis"],
        "2-2": ["Capital Markets", "Financial Reporting & Analysis", "Global Economic Environment", "Operations Management", "Organizational Behavior"]
    };

    let courseList = courses[`${year}-${semester}`]
        .map(course => `<button class="big-btn">${course}</button>`)
        .join("");

    document.getElementById("app").innerHTML = `
        <div class="offers-container">
            <h1>${year}st Year - Semester ${semester}</h1>
            ${courseList}
            <button class="back-btn" onclick="loadYearCourses(${year})">Back to ${year}st Year</button>
        </div>
    `;
}

function loadMyCourses() {
    const courses = {
        "1-1": ["Applied Business Mathematics", "Financial Accounting", "Management Tools and Principles", "Marketing Fundamentals"],
        "1-2": ["Mathematics For Management", "Introduction To Programming", "Cost Accounting", "Microeconomics"],
        "2-1": ["Business Driven-Information", "Corporate Finance", "Macroeconomics", "Marketing Management", "Statistics & Data Analysis"],
        "2-2": ["Capital Markets", "Financial Reporting & Analysis", "Global Economic Environment", "Operations Management", "Organizational Behavior"]
    };

    const semesters = {
        "1-1": "1st Year First Semester",
        "1-2": "1st Year Second Semester",
        "2-1": "2nd Year First Semester",
        "2-2": "2nd Year Second Semester"
    };

    document.getElementById("app").innerHTML = `
        <div class="offers-container">
            <h1>My Courses</h1>
            ${Object.entries(semesters).map(([id, title]) => `
                <div class="semester-section">
                    <h2>${title}</h2>
                    <div class="courses-grid">
                        ${courses[id].map(course => `
                            <button class="course-button" onclick="loadCourse('${encodeURIComponent(course)}')">${course}</button>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function loadCourse(courseName) {
    const decodedName = decodeURIComponent(courseName);
    document.getElementById("app").innerHTML = `
        <div class="offers-container">
            <h1>${decodedName}</h1>
            <div class="course-navigation">
                <button class="course-nav-btn active" onclick="showCourseSection('${encodeURIComponent(courseName)}', 'class')">Class</button>
                <button class="course-nav-btn" onclick="showCourseSection('${encodeURIComponent(courseName)}', 'exercises')">Exercises</button>
                <button class="course-nav-btn" onclick="showCourseSection('${encodeURIComponent(courseName)}', 'progress')">Progress</button>
            </div>
            <div id="course-content" class="course-content-section">
                <h2>Welcome to ${decodedName}</h2>
                <p>Select a section above to begin your learning journey:</p>
                <ul>
                    <li><strong>Class:</strong> Access lecture materials, videos, and course content</li>
                    <li><strong>Exercises:</strong> Practice with interactive exercises and assignments</li>
                    <li><strong>Progress:</strong> Track your learning progress and achievements</li>
                </ul>
            </div>
            <button class="back-btn" onclick="loadMyCourses()">Back to My Courses</button>
        </div>
    `;
}

function showCourseSection(courseName, section) {
    const decodedName = decodeURIComponent(courseName);
    const content = document.getElementById('course-content');
    
    // Update navigation buttons
    document.querySelectorAll('.course-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === section) {
            btn.classList.add('active');
        }
    });

    // Update content based on section
    switch(section) {
        case 'class':
            content.innerHTML = `
                <h2>Class Materials</h2>
                <div class="course-materials">
                    <button class="course-button">Lecture Notes</button>
                    <button class="course-button">Video Lectures</button>
                    <button class="course-button">Supplementary Materials</button>
                    <button class="course-button">Discussion Forum</button>
                </div>
            `;
            break;
        case 'exercises':
            content.innerHTML = `
                <div class="quiz-wrapper">
                    <h2>Definition Quizzes</h2>
                    <div class="course-materials">
                        <button class="course-button" onclick="showDefinitionQuiz(1)">Definition Quiz Chapter 1</button>
                        <button class="course-button" onclick="showDefinitionQuiz(2)">Definition Quiz Chapter 2</button>
                        <button class="course-button" onclick="showDefinitionQuiz(3)">Definition Quiz Chapter 3</button>
                        <button class="course-button" onclick="showDefinitionQuiz(4)">Definition Quiz Chapter 4</button>
                        <button class="course-button" onclick="showDefinitionQuiz(5)">Definition Quiz Chapter 5</button>
                        <button class="course-button" onclick="showDefinitionQuiz(6)">Definition Quiz Chapter 6</button>
                        <button class="course-button" onclick="showDefinitionQuiz(7)">Definition Quiz Chapter 7</button>
                    </div>
                    <div class="quiz-wrapper" style="margin-top: 40px;">
                        <h2 style="margin-bottom: 20px;">Midterm and Final's Questions</h2>
                        <div class="course-materials" style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
                            <button class="course-button" style="max-width: 400px;" onclick="showMidtermTest()">Midterm 1</button>
                            <button class="course-button" style="max-width: 400px;" onclick="showMidterm2Test()">Midterm 2</button>
                            <button class="course-button" style="max-width: 400px;" onclick="showMidterm3Test()">Midterm 3</button>
                            <button class="course-button" style="max-width: 400px;" onclick="showMidterm4Test()">Midterm 4</button>
                            <button class="course-button" style="max-width: 400px;" onclick="showFinal1Test()">Final 1</button>
                        </div>
                    </div>
                </div>
            `;
            break;
        case 'progress':
            content.innerHTML = `
                <div class="quiz-wrapper">
                    <h2>Your Progress</h2>
                    <div class="course-materials" style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
                        <button class="course-button" style="max-width: 400px;" onclick="showMainSubmissions()">Definition Quiz Submissions</button>
                        <button class="course-button" style="max-width: 400px;" onclick="showMidtermSubmissions()">Midterm 1 Submissions</button>
                        <button class="course-button" style="max-width: 400px;" onclick="showMidterm2Submissions()">Midterm 2 Submissions</button>
                        <button class="course-button" style="max-width: 400px;" onclick="showMidterm3Submissions()">Midterm 3 Submissions</button>
                        <button class="course-button" style="max-width: 400px;" onclick="showMidterm4Submissions()">Midterm 4 Submissions</button>
                        <button class="course-button" style="max-width: 400px;" onclick="showFinal1Submissions()">Final 1 Submissions</button>
                        <button class="course-button" style="max-width: 400px;" onclick="showFinalQuestions()">Final's Questions</button>
                    </div>
                </div>
            `;
            break;
    }
}

function loadUserInfo() {
    document.getElementById("app").innerHTML = `
        <h1>My Information</h1>
        <p><strong>Email:</strong> ${localStorage.getItem("currentUser")}</p>
        <button class="logout-btn" onclick="logout()">Logout</button>
    `;
}

function loadAdminPanel() {
    const allUsers = Object.keys(localStorage)
        .filter(key => key.includes('@') && key.endsWith('_created'))
        .map(key => {
            const email = key.replace('_created', '');
            const lastLogin = localStorage.getItem(`${email}_lastLogin`) || new Date().toISOString();
            const connections = parseInt(localStorage.getItem(`${email}_connections`) || '0');
            const created = localStorage.getItem(`${email}_created`);
            const paid = localStorage.getItem(`${email}_paid`) === 'true';
            const name = localStorage.getItem(`${email}_name`) || email.split('@')[0];
            const sponsorships = parseInt(localStorage.getItem(`${email}_sponsorships`) || '0');
            return { email, name, paid, created, connections, lastLogin, sponsorships };
        });

    const totalUsers = allUsers.length;
    const paidAccounts = allUsers.filter(user => user.paid).length;
    const totalSponsorships = allUsers.reduce((sum, user) => sum + user.sponsorships, 0);
    
    document.getElementById("app").innerHTML = `
        <div class="admin-page">
            <h1 class="admin-main-title">Admin Dashboard</h1>
            
            <div class="admin-card">
                <div class="admin-nav">
                    <button class="admin-nav-btn active" onclick="showAdminSection('metrics')">Metrics</button>
                    <button class="admin-nav-btn" onclick="showAdminSection('users')">Users</button>
                </div>
                
                <div id="metrics-section" class="admin-section active">
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-label">Total Users</div>
                            <div class="metric-value">${totalUsers}</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-label">Paid Accounts</div>
                            <div class="metric-value">${paidAccounts}</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-label">Total Sponsorships</div>
                            <div class="metric-value">${totalSponsorships}</div>
                        </div>
                    </div>

                    <div class="activity-charts">
                        <div class="chart-container">
                            <h3>Daily Active Users</h3>
                            <canvas id="dailyChart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h3>Weekly Active Users</h3>
                            <canvas id="weeklyChart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h3>Monthly Active Users</h3>
                            <canvas id="monthlyChart"></canvas>
                        </div>
                    </div>
                </div>

                <div id="users-section" class="admin-section">
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-label">Total Users</div>
                            <div class="metric-value">${totalUsers}</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-label">Paid Accounts</div>
                            <div class="metric-value">${paidAccounts}</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-label">Total Sponsorships</div>
                            <div class="metric-value">${totalSponsorships}</div>
                        </div>
                    </div>
                    <div class="users-table-container">
                        <table class="users-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Account Status</th>
                                    <th>Sponsorships</th>
                                    <th>Date of Creation</th>
                                    <th>Number of Connections</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${allUsers.map(user => `
                                    <tr>
                                        <td>${user.name}</td>
                                        <td>${user.email}</td>
                                        <td>${user.paid ? '<span class="status-paid">Paid</span>' : '<span class="status-unpaid">Unpaid</span>'}</td>
                                        <td>${user.sponsorships}</td>
                                        <td>${new Date(user.created).toLocaleDateString()}</td>
                                        <td class="connections-count">${user.connections}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Create charts after DOM is ready
    setTimeout(() => {
        // Daily Chart
        new Chart(document.getElementById('dailyChart'), {
            type: 'line',
            data: {
                labels: Array.from({length: 7}, (_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    return d.toISOString().split('T')[0];
                }).reverse(),
                datasets: [{
                    label: 'Daily Active Users',
                    data: Array.from({length: 7}, (_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() - i);
                        const dailyActivity = JSON.parse(localStorage.getItem('dailyActivity') || '{}');
                        return (dailyActivity[d.toISOString().split('T')[0]] || []).length;
                    }).reverse(),
                    borderColor: '#1E3A5F',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });

        // Weekly Chart
        new Chart(document.getElementById('weeklyChart'), {
            type: 'line',
            data: {
                labels: Array.from({length: 4}, (_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (i * 7));
                    return getWeekNumber(d);
                }).reverse(),
                datasets: [{
                    label: 'Weekly Active Users',
                    data: Array.from({length: 4}, (_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() - (i * 7));
                        const weeklyActivity = JSON.parse(localStorage.getItem('weeklyActivity') || '{}');
                        return (weeklyActivity[getWeekNumber(d)] || []).length;
                    }).reverse(),
                    borderColor: '#1E3A5F',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });

        // Monthly Chart
        new Chart(document.getElementById('monthlyChart'), {
            type: 'line',
            data: {
                labels: Array.from({length: 6}, (_, i) => {
                    const d = new Date();
                    d.setMonth(d.getMonth() - i);
                    return d.toISOString().slice(0, 7);
                }).reverse(),
                datasets: [{
                    label: 'Monthly Active Users',
                    data: Array.from({length: 6}, (_, i) => {
                        const d = new Date();
                        d.setMonth(d.getMonth() - i);
                        const monthlyActivity = JSON.parse(localStorage.getItem('monthlyActivity') || '{}');
                        return (monthlyActivity[d.toISOString().slice(0, 7)] || []).length;
                    }).reverse(),
                    borderColor: '#1E3A5F',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
    }, 0);
}

function showAdminSection(section) {
    // Update button states
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(section)) {
            btn.classList.add('active');
        }
    });

    // Update section visibility with animation
    const metricsSection = document.getElementById('metrics-section');
    const usersSection = document.getElementById('users-section');

    if (section === 'metrics') {
        usersSection.classList.remove('active');
        setTimeout(() => {
            metricsSection.classList.add('active');
        }, 50);
    } else {
        metricsSection.classList.remove('active');
        setTimeout(() => {
            usersSection.classList.add('active');
        }, 50);
    }
}

function logout() {
    localStorage.removeItem("currentUser");
    document.getElementById("navbar").style.display = "none";
    document.getElementById("presentation").style.display = "flex";
    document.getElementById("app").innerHTML = "";
}

function loadMarketingFundamentals() {
    document.getElementById("app").innerHTML = `
        <div class="quiz-wrapper">
            <h1>Marketing Fundamentals</h1>
            <div class="course-navigation">
                <button class="course-nav-btn active" onclick="showMarketingSection('class')">Class</button>
                <button class="course-nav-btn" onclick="showMarketingSection('exercises')">Exercises</button>
                <button class="course-nav-btn" onclick="showMarketingSection('progress')">Progress</button>
            </div>
            <div id="course-content" class="course-content-section"></div>
            <button class="back-btn" onclick="loadFreeDemo()">Back to Free Demo</button>
        </div>
    `;
    showMarketingSection('class');
}

// Store all chapter 1 definitions
const chapter1Definitions = [
    { 
        term: 'Needs', 
        definition: 'States of felt deprivation',
        explanation: 'A need is something essential for survival or well-being.',
        example: 'You need food to stay alive'
    },
    { 
        term: 'Wants', 
        definition: 'The form human needs take as they are shaped by culture and individual personality',
        explanation: 'A want is how you choose to satisfy a need, influenced by culture or personal taste.',
        example: 'You want pizza (to satisfy your need for food).'
    },
    { 
        term: 'Demands', 
        definition: 'Human wants that are backed by buying power',
        explanation: 'A demand is a want that you have the money and ability to buy.',
        example: 'You buy pizza because you want it and have the money to pay for it.'
    },
    { 
        term: 'Market offerings', 
        definition: 'Combinations of products, services, info or experiences offered to a market to satisfy needs or wants',
        example: 'A smartphone comes with a warranty and customer support.'
    },
    { 
        term: 'Marketing myopia', 
        definition: 'Paying more attention to the product that the benefits and experiences produced',
        example: 'A camera company only promotes camera specs, forgetting customers want to capture memories easily.'
    },
    { 
        term: 'Consumer market', 
        definition: 'All the individuals and households that buy goods and services for personal consumption',
        explanation: 'People who buy products for personal use.',
        example: 'Shoppers buying clothes from a store.'
    },
    { 
        term: 'Marketing management', 
        definition: 'Choosing target markets and building profitable relationship with them',
        example: 'Nike targets athletes and builds loyalty through personalized offers.'
    },
    { 
        term: 'Value proposition', 
        definition: 'Set of benefits or values it promises to deliver to customers to satisfy their needs',
        example: 'Uber promises fast, easy, and affordable rides.'
    },
    { 
        term: 'Value driven marketing strategy', 
        definition: 'Production/product/selling/marketing/societal marketing concepts',
        explanation: 'Different ways companies focus',
        example: 'Tesla focuses on societal marketing by promoting clean energy cars.'
    },
    { 
        term: 'Societal marketing', 
        definition: 'Consider consumers wants, company requirements, consumers long run interests and society long run interests',
        example: 'Body Shop uses natural ingredients and fights animal testing.'
    },
    { 
        term: 'Sustainable marketing', 
        definition: 'Corporate ethics and social responsibility have become important for every business',
        example: 'A coffee brand using recyclable packaging and supporting fair-trade farmers.'
    },
    { 
        term: 'Marketing mix', 
        definition: 'Product/price/promotion/place',
        example: 'Coca-Cola\'s product (soda), price ($1), ads (promotion), and stores (place).'
    },
    { 
        term: 'Integrated marketing', 
        definition: 'Plan that communicates and delivers intended value',
        explanation: 'Coordinated efforts to deliver value consistently across all channels.',
        example: 'Apple\'s website, ads, and stores all deliver the same premium brand message.'
    },
    { 
        term: 'Customer relationship management', 
        definition: 'The overall process of building and maintaining profitable customer relationships by delivering superior customer value and satisfaction',
        example: 'Amazon recommends products based on past purchases.'
    },
    { 
        term: 'Customer perceived value', 
        definition: 'Difference btw total customer perceived benefits and customer cost',
        explanation: 'What customers feel they gain vs. what they pay.',
        example: 'Buying a $5 coffee that feels worth it because of quality and service.'
    },
    { 
        term: 'Customer engagement marketing', 
        definition: 'Direct and continuous customer involvement',
        example: 'Starbucks\' app rewards program keeps customers engaged.'
    },
    { 
        term: 'Consumer generated marketing', 
        definition: 'Brand exchanges created by consumers themselves',
        explanation: 'Customers create content or promote the brand.',
        example: 'Hashtag challenges on TikTok promoting a brand.'
    },
    { 
        term: 'Partner relationship management', 
        definition: 'Working with partners in other company departments and outside the company',
        example: 'Nike collaborates with influencers and retail partners.'
    },
    { 
        term: 'Customer lifetime value', 
        definition: 'Value of entire stream of purchases that the customer would make over a lifetime of patronage',
        explanation: 'Total value a customer brings over their lifetime.',
        example: 'A loyal Netflix subscriber for 10 years.'
    },
    { 
        term: 'Customer satisfaction', 
        definition: 'The extent to which perceived performance matches a buyer\'s expectations',
        example: 'Getting fast delivery when you expected a delay.'
    },
    { 
        term: 'Share of customer', 
        definition: 'Portion of the customers purchasing that a company gets in its product categories',
        example: 'One person buys all their groceries from Walmart.'
    },
    { 
        term: 'Customer equity', 
        definition: 'Total combined customer lifetime values of all of the company\'s customers',
        example: 'Amazon\'s overall customer base value.'
    },
    { 
        term: 'The changing marketing landscape', 
        definition: 'Digital age/economic environment/growth of not for profit marketing/rapid globalization/sustainable marketing',
        explanation: 'New trends reshaping marketing.',
        example: 'Social media, globalization, and sustainable practices influencing how companies operate.'
    },
    { 
        term: 'Sustainable marketing', 
        definition: 'Corporate ethics and social responsibility have become important for every business',
        example: 'A coffee brand using recyclable packaging and supporting fair-trade farmers.'
    }
];

const chapter2Definitions = [
    { 
        term: 'Strategic planning',
        definition: 'Process of developing and maintaining a strategic fit between the organization\'s goals and capabilities and its changing marketing opportunities',
        explanation: 'Creating a long-term plan to align company goals with market opportunities.',
        example: 'Apple adjusts its product strategy based on new tech trends.'
    },
    { 
        term: 'Mission statement',
        definition: 'The organization\'s purpose, what it wants to accomplish in the larger environment',
        example: 'Google\'s mission: "To organize the world\'s information."'
    },
    { 
        term: 'Business objectives',
        definition: 'Build profitable customer relationship/invest in research/improve profits',
        example: 'Investing in R&D to launch new products.'
    },
    { 
        term: 'Marketing objectives',
        definition: 'Increase market share/create local partnership/increase promotion',
        example: 'Partnering locally to boost brand visibility.'
    },
    { 
        term: 'Business portfolio',
        definition: 'Collection of businesses and products that make up the company',
        example: 'Unilever\'s portfolio includes Dove, Lipton, and Ben & Jerry\'s.'
    },
    { 
        term: 'Portfolio analysis',
        definition: 'Major activity in strategic planning whereby management evaluates the products and businesses that make up the company',
        explanation: 'Evaluating each product or business to decide resource allocation.',
        example: 'Dropping underperforming brands and investing in best-sellers.'
    },
    { 
        term: 'Strategic business units',
        definition: 'Company division/product line within a division/single product or brand',
        explanation: 'Divisions or product lines treated as separate businesses.',
        example: 'PepsiCo\'s snacks division vs. beverages division.'
    },
    { 
        term: 'The BCG growth-share matrix',
        definition: 'A tool to analyze business portfolio',
        explanation: 'Tool to classify products as Stars, Cash Cows, Question Marks, or Dogs.',
        example: 'Apple\'s iPhone = Star; older products = Cash Cow.'
    },
    { 
        term: 'Problems matrix approaches',
        definition: 'Define SBU and measuring share and growth/time consuming/expensive/may not apply well to markets facing structural changes or disruptions/doesn\'t suit specific situations(customized approach)'
    },
    { 
        term: 'The product/market expansion grid',
        definition: 'Market penetration/market development/product development/diversification'
    },
    { 
        term: 'Downsizing',
        definition: 'A company must harvest or divest businesses that are unprofitable or that no longer fit the strategy',
        explanation: 'Reducing product lines or selling off units that don\'t fit the strategy.',
        example: 'Ford stopped producing sedans to focus on SUVs.'
    },
    { 
        term: 'Value chain',
        definition: 'Series of departments that carry out value creating activities to design, produce, market, deliver and support a firm\'s product',
        explanation: 'Activities within a company that add value to the product.',
        example: 'Design, production, marketing, and delivery steps at Zara.'
    },
    { 
        term: 'Value delivery network',
        definition: 'Made up of companies suppliers, distributors, customers who partner with each other to improve performance of the entire system',
        explanation: 'Partnerships between suppliers, distributors, and customers to deliver value.',
        example: 'Amazon\'s network includes suppliers, warehouses, and delivery partners.'
    },
    { 
        term: 'Customer value-driven marketing strategy',
        definition: 'Is the marketing logic by which the company hopes to create customer value and achieve profitable customer relationships',
        explanation: 'Creating strategies to deliver value and build strong relationships.',
        example: 'Netflix\'s personalized recommendations keep customers loyal.'
    },
    { 
        term: 'Market segmentation',
        definition: 'Division of a market into distinct groups of buyers who have different needs, characteristics or behaviors and who might require separate products or marketing mixes',
        explanation: 'Dividing the market into smaller groups with specific needs.',
        example: 'Segmenting by age: kids, teens, adults.'
    },
    { 
        term: 'Market segment',
        definition: 'Is a group of consumers who respond in a similar way to a given set of marketing efforts',
        explanation: 'A group of consumers who react similarly to marketing.',
        example: 'Young professionals interested in eco-friendly products.'
    },
    { 
        term: 'Market targeting',
        definition: 'Process of evaluating each market segment\'s attractiveness and selecting one or more segments to enter',
        explanation: 'Selecting which segment(s) to focus on.',
        example: 'Targeting college students for affordable laptops.'
    },
    { 
        term: 'Market positioning',
        definition: 'Arranging for a product to occupy a clear and desirable place relative to competing products in the minds of target consumers(begin with differentiation)',
        explanation: 'Placing a product in a distinct spot in customers\' minds.',
        example: 'Volvo positions itself as the safest car brand.'
    },
    { 
        term: 'Positioning',
        definition: 'Is arranging for a product to occupy a clear, distinctive, and desirable place relative to competing products from competing brands and give them the greatest advantage in their target markets',
        explanation: 'Defining how the product stands out versus competitors.',
        example: 'Nike = performance and innovation.'
    },
    { 
        term: 'Managing marketing',
        definition: 'Analysis/planning/implementation/control',
        explanation: 'Managing marketing involves 4 key steps:\nAnalysis – Studying the market and environment.\nPlanning – Setting objectives and strategies.\nImplementation – Putting plans into action.\nControl – Monitoring results and making adjustments.',
        example: 'Launching a new product:\nAnalyze customer needs\nPlan pricing and promotion\nImplement the campaign\nControl by checking sales performance'
    },
    { 
        term: 'SWOT analysis',
        definition: 'Strengths/weaknesses/opportunities/threats',
        explanation: 'A tool used to assess internal (Strengths & Weaknesses) and external (Opportunities & Threats) factors.',
        example: 'For Coca-Cola:\nStrength: Strong brand\nWeakness: High sugar content\nOpportunity: Growing demand for healthy drinks\nThreat: Competitors like Pepsi'
    },
    { 
        term: 'Marketing implementation',
        definition: 'Turning marketing strategies and plans into marketing actions to accomplish strategic marketing objectives(who, where, when, how)',
        example: 'Planning an Instagram ad campaign, then scheduling posts, assigning designers, setting deadlines, and launching.'
    },
    { 
        term: 'Marketing departments organization',
        definition: 'Functional organization/geographic organization/product management organization/market or customer organization',
        explanation: 'How a company structures its marketing team:\nFunctional Organization – By tasks (e.g., advertising, sales).\nGeographic Organization – By regions (e.g., North America, Europe).\nProduct Management Organization – By product lines.\nMarket or Customer Organization – By customer types (e.g., B2B vs B2C).',
        example: 'Nike may have product managers for shoes, apparel, and accessories, each with their own marketing team.'
    },
    { 
        term: 'Marketing control',
        definition: 'Management/operating control/strategic control',
        explanation: 'Monitoring marketing efforts to ensure objectives are met:\nManagement Control – Overall performance.\nOperating Control – Day-to-day activities like sales targets.\nStrategic Control – Checking if strategies align with long-term goals.',
        example: 'Starbucks reviews sales data weekly (operating control), checks annual profits (management control), and revisits long-term strategies (strategic control).'
    }
];

const chapter3Definitions = [
    { 
        term: 'Marketing environment',
        definition: 'Includes the actors and forces outside marketing that affect marketing management\'s ability to build and maintain successful relationships with target customers',
        explanation: 'All external factors that affect how a company builds strong customer relationships.',
        example: 'New government regulations affecting how fast-food chains market to kids.'
    },
    { 
        term: 'Microenvironment',
        definition: 'Consists of the actors close to the company that affect its ability to serve its customers the company, suppliers, marketing intermediaries, customer markets, competitors, and publics',
        example: 'Suppliers raising prices impacts product costs.'
    },
    { 
        term: 'Macroenvironments',
        definition: 'Consists of the larger societal forces that affect the microenvironment demographic, economic,natural, technological, political, and cultural forces',
        example: 'Economic recession affects consumer buying power.'
    },
    { 
        term: 'Marketing intermediaries',
        definition: 'Are firms that help the company to promote, finance, sell, and distribute its goods to final buyers',
        example: 'Retailers like Walmart sell products from brands to customers.'
    },
    { 
        term: 'Publics',
        definition: 'Any group that has an actual or potential interest in or impact on an organization\'s ability to achieve its objectives',
        example: 'Media reporting on a company\'s sustainability efforts.'
    },
    { 
        term: 'Demographic environment',
        definition: 'Study of human populations size, density, location, age, gender, race, occupation…',
        example: 'Targeting ads to millennials based on age group data.'
    },
    { 
        term: 'Demographic trends',
        definition: 'Include changing age and family structures, geographic population shifts, educational characteristics, and population diversity',
        example: 'More single-person households influencing demand for smaller homes.'
    },
    { 
        term: 'Generational marketing',
        definition: 'Important in segmenting people by lifestyle or life stage instead of age',
        example: 'Marketing eco-friendly products to Gen Z due to their sustainability focus.'
    },
    { 
        term: 'Economic environment',
        definition: 'Consumers adopted a new back to basics sensibility in their lifestyles and spending patterns',
        example: 'During a recession, consumers choose cheaper brands.'
    },
    { 
        term: 'Natural environment',
        definition: 'Physical environment and the natural resources that are needed as inputs by marketers or that are affected by marketing activities',
        explanation: 'Resources and physical conditions affecting businesses.',
        example: 'Shortage of water impacting beverage companies.'
    },
    { 
        term: 'Environmental sustainability',
        definition: 'Developing strategies and practices that create a world economy that the planet can support indefinitely',
        example: 'Using recyclable packaging to reduce waste.'
    },
    { 
        term: 'Technological environment',
        definition: 'Most dramatic force in changing the marketplace/new products, opportunities/concern for the safety of new products',
        explanation: 'New tech developments that change the market.',
        example: 'Smartphones revolutionized communication and app industries.'
    },
    { 
        term: 'Political & social environment',
        definition: 'Increase emphasis on ethics and socially responsible actions and its cause-related marketing',
        explanation: 'Laws, ethics, and social responsibility affecting marketing.',
        example: 'Ban on plastic bags influencing retail packaging.'
    },
    { 
        term: 'Cultural environment',
        definition: 'Institutions that affect a society basic values, perceptions and behaviors',
        example: 'Health-conscious cultures prefer organic food brands.'
    }
];

const chapter4Definitions = [
    { 
        term: 'Customer insights',
        definition: 'Fresh marketing information-based understandings of customers and the marketplace that become the basis for creating customer value, engagement, relationship',
        explanation: 'Understanding customers better based on fresh data to create value and build relationships.',
        example: 'A clothing brand learns that customers prefer eco-friendly fabrics, so they start offering more sustainable options.'
    },
    { 
        term: 'Big data',
        definition: 'Is the huge and complex data sets generated by today\'s sophisticated information generation, collection, storage, and analysis technologies.(like marketing research, internal transactions data, real time data flowing from its social media monitoring, connected devices, and other digital sources)',
        explanation: 'Large and complex data sets gathered from various digital sources, analyzed to understand trends.',
        example: 'A company analyzes data from its website, social media, and customer purchases to improve marketing strategies.'
    },
    { 
        term: 'Marketing information ecosystem',
        definition: 'People, processes, and assets dedicated to assessing managers\' information needs, developing the needed information, and helping managers and decision makers apply that information to generate and validate actionable customer and market insights',
        explanation: 'The system of people, processes, and tools that helps gather and use information to make better marketing decisions.',
        example: 'A marketing team uses customer surveys, internal sales data, and market reports to improve campaigns.'
    },
    { 
        term: 'Marketing information system',
        definition: 'Provides information to the company\'s marketing and other managers and external partners such as suppliers, resellers and marketing service agencies',
        explanation: 'A system that provides necessary information to managers and partners for decision-making.',
        example: 'A retail store uses a system that shares sales data and customer feedback with suppliers to adjust stock levels.'
    },
    { 
        term: 'Marketers obtain info from',
        definition: 'Internal data/marketing intelligence/marketing research',
        explanation: 'Sources like internal data, marketing intelligence, and marketing research to make decisions.',
        example: 'A marketer uses customer data (internal), competitor insights (intelligence), and market surveys (research) to plan a campaign.'
    },
    { 
        term: 'Internal data',
        definition: 'Collections of consumers and market info obtained from data sources within the company network',
        explanation: 'Data from within the company, like sales records and customer feedback.',
        example: 'A store reviews its sales data to determine which products are selling well.'
    },
    { 
        term: 'Competitive marketing intelligence',
        definition: 'Collection and analysis of publicity available info about consumers, competitors and developments in the marketing environment',
        example: 'A company tracks competitors\' social media ads and customer reviews to improve its own offerings.'
    },
    { 
        term: 'Marketing research',
        definition: 'Systematic design, collection, analysis and reporting of data relevant to a specific marketing situation facing an organization',
        explanation: 'Systematic collection and analysis of data to understand a specific marketing issue.',
        example: 'A company surveys customers to understand why they stopped buying a product.'
    },
    { 
        term: 'Secondary data',
        definition: 'Informations that already exists somewhere, having been collected for another purpose(lower cost and obtained quickly)',
        explanation: 'Existing data collected for a different purpose, often cheaper and faster to gather.',
        example: 'A company uses government statistics about consumer behavior instead of conducting their own survey.'
    },
    { 
        term: 'Primary data',
        definition: 'Informations collected for a specific purpose(relevant, accurate, current, impartial) through observation, ethnography, surveys, experiences, contacts',
        explanation: 'New data collected for a specific purpose, usually more relevant and accurate.',
        example: 'A company conducts a new survey to understand customer preferences for a new product.'
    },
    { 
        term: 'Observational research',
        definition: 'Involves gathering primary data by observing relevant people, actions, and situations',
        example: 'A store observes how customers interact with products to decide where to place items.'
    },
    { 
        term: 'Ethnographic research',
        definition: 'Involves sending trained observers to watch and interact with consumers in their "natural environments"',
        example: 'A researcher spends time in a home to see how families use a kitchen appliance.'
    },
    { 
        term: 'Survey research',
        definition: 'A research method where data is collected by asking people questions, typically through surveys or questionnaires, to gather information on their opinions, behaviors, or experiences',
        example: 'A company sends out a questionnaire to understand customer satisfaction.'
    },
    { 
        term: 'Experimental research',
        definition: 'Involves gathering primary data by selecting matched groups of subjects, giving them different treatments, controlling related factors, and checking for differences in group responses',
        explanation: 'Gathering data by testing different conditions and observing how they affect results.',
        example: 'A retailer tests two different store layouts to see which one results in more sales.'
    },
    { 
        term: 'Online marketing survey research',
        definition: 'Collecting primary marketing research data through internet and mobile surveys, online focus groups, and online panels and brand communities',
        example: 'A brand sends an online survey to collect feedback from customers about a new product.'
    },
    { 
        term: 'Customer relationship management',
        definition: 'Managing detailed info about individual customers and carefully managing customer touch point to maximize customer loyalty',
        example: 'A company uses CRM software to track customer interactions and offer personalized promotions.'
    },
    { 
        term: 'Marketing analytics',
        definition: 'Involves analysis tools, technologies, and processes by which marketers dig out meaningful patterns in big data to gain customer insights and gauge marketing performance',
        explanation: 'Analyzing big data to find patterns and improve marketing strategies.',
        example: 'A company uses analytics to determine which marketing channels bring the most traffic to its website.'
    }
];

const chapter5Definitions = [
    {
        term: 'Consumer buyer behavior',
        definition: 'Buying behavior of final consumers and households that buy goods and services for personal consumption',
        explanation: 'The decision-making process and actions of consumers when purchasing goods or services.',
        example: 'A person decides to buy a new laptop based on factors like price, brand reputation, and features that fit their needs.'
    },
    {
        term: 'Consumer market',
        definition: 'All the individuals and households that buy goods and services for personal consumption',
        explanation: 'The market of people who purchase groceries, clothing, or electronics for their own use.',
        example: 'Shoppers buying clothes from a store.'
    },
    {
        term: 'Cultural factors',
        definition: 'Set of basic values, perceptions, wants and behavior learned by a member of society from family and other important institutions',
        explanation: 'The influence of culture on consumer behavior.',
        example: 'In some cultures, it is traditional to buy gifts for major holidays, influencing purchasing decisions.'
    },
    {
        term: 'Subcultures',
        definition: 'Groups of people within a culture with shared value systems based on common life experiences and situations',
        explanation: 'Subgroups within a culture that share similar values and behaviors.',
        example: 'The hip-hop community may have its own preferences for clothing brands or music-related products.'
    },
    {
        term: 'Social factors',
        definition: 'Family/role and status',
        explanation: 'The influence of family, social roles, and status on buying decisions.',
        example: 'A person may buy a luxury car to align with their status as a successful professional, or because of family preferences.'
    },
    {
        term: 'Personal factors',
        definition: 'Lifestyle/economic situations/age and life stage/occupations/personality',
        explanation: 'Characteristics such as lifestyle, economic situation, age, life stage, occupation, and personality that influence buying behavior.',
        example: 'A young professional might buy trendy clothing, while a retiree might prioritize comfort over style in their clothing choices.'
    },
    {
        term: 'Psychological factors',
        definition: 'Motivation/perception/learning/beliefs and attitudes',
        explanation: 'Factors like motivation, perception, learning, beliefs, and attitudes that affect consumer decisions.',
        example: 'A person might choose a brand based on positive beliefs about its environmental impact or because they perceive it to be higher quality.'
    },
    {
        term: 'Motivation research',
        definition: 'Qualitative research designed to probe consumer\'s hidden subconscious motivations',
        example: 'A company conducts in-depth interviews to uncover why consumers prefer certain products even though they are more expensive.'
    },
    {
        term: 'Maslow\'s hierarchy of needs',
        definition: 'A psychological theory that suggests human needs are arranged in a hierarchy, starting with basic needs like food and safety and progressing to higher-level needs like self-actualization'
    },
    {
        term: 'Selective attention',
        definition: 'The tendency for people to screen out most of the info to which they are exposed',
        explanation: 'The tendency for people to ignore most of the information they encounter and only focus on what catches their attention.',
        example: 'A person may only notice ads for their favorite brand of sneakers while ignoring ads for other brands.'
    },
    {
        term: 'Selective distortion',
        definition: 'The tendency for people to interpret info in a way that will support what they already believe',
        explanation: 'The tendency for people to interpret information in a way that supports their existing beliefs or opinions.',
        example: 'A consumer might hear a product review and twist the details to make it seem more favorable if it matches their preference for that brand.'
    },
    {
        term: 'Selective retention',
        definition: 'The tendency to remember good points made about a brand they favor and forget good points made about competing brands',
        explanation: 'The tendency to remember information that aligns with one\'s own preferences and forget information that doesn\'t.',
        example: 'A loyal customer may remember all the positive things said about their favorite smartphone brand but forget the complaints about it.'
    },
    {
        term: 'Buying behavior',
        definition: 'The decision-making process and actions involved in purchasing products',
        explanation: 'The decision-making process and actions of consumers when purchasing goods or services.',
        example: 'A person decides to buy a new laptop based on factors like price, brand reputation, and features that fit their needs.'
    },
    {
        term: 'Buyer decision process',
        definition: '1st step: consumer recognizes a problem triggered by internal and external stimuli\n2nd step: consumer motivated to search for more information (personal, commercial, public, experiential sources)\n3rd step: consumer uses info to evaluate alternative brands in the choice set\n4th step: is the buyer\'s decision about which brand to purchase.\n5th step: consumers take further action after purchase, based on their satisfaction or dissatisfaction.',
        explanation: 'The decision-making process and actions of consumers when purchasing goods and services, influenced by various factors such as personal preferences, social influences, and psychological factors.',
        example: 'A person buys a new laptop based on their need for a faster processor and better battery life, considering factors like price, brand reputation, and online reviews before making the final purchase decision.'
    },
    {
        term: 'Cognitive dissonance',
        definition: 'Buyer discomfort caused by postpurchase conflict',
        explanation: 'The discomfort or tension a buyer feels after making a purchase, caused by conflicting thoughts or doubts about the decision.',
        example: 'After buying an expensive car, a person starts questioning if they made the right choice, feeling uneasy about the high cost despite wanting the vehicle.'
    },
    {
        term: 'Customer journey',
        definition: 'The sum of the ongoing experiences consumers have with a brand that affect their buying behavior, engagement, and brand advocacy over time',
        explanation: 'The overall experience a consumer has with a brand, from first learning about it to post-purchase interactions, influencing their behavior, engagement, and loyalty.',
        example: 'A person discovers a brand on social media, interacts with it through an email campaign, makes a purchase online, and then continues to engage with the brand through loyalty programs and customer support.'
    },
    {
        term: 'Adoption process',
        definition: 'Mental process an individual goes through from first learning about an innovation to final regular use',
        example: 'A person first hears about a new fitness app, researches its features, tries it out, and eventually incorporates it into their daily workout routine.'
    }
];

const chapter6Definitions = [
    {
        term: 'Business buyer behavior',
        definition: 'Buying behavior of organizations that buy goods and services for use in production',
        explanation: 'How businesses make purchasing decisions for their operations.',
        example: 'A manufacturing company buying raw materials or machinery for production.'
    },
    {
        term: 'Business market',
        definition: 'Fewer but larger buyers/derived demand/inelastic demand/fluctuating demand',
        explanation: 'Market where businesses sell to other businesses, characterized by fewer buyers making larger purchases.',
        example: 'A company selling industrial equipment to factories.'
    },
    {
        term: 'Straight rebuy',
        definition: 'The buyer routinely reorders something without any modifications',
        explanation: 'Regular reordering of the same product with no changes.',
        example: 'An office regularly ordering the same paper supplies from the same vendor.'
    },
    {
        term: 'Modified rebuy',
        definition: 'Buyer wants to modify product specifications, prices, terms or suppliers',
        explanation: 'Changing some aspects of a regular purchase.',
        example: 'A restaurant switching to a new supplier for better prices on ingredients.'
    },
    {
        term: 'New task',
        definition: 'Buyer purchases a product or service for the first time',
        explanation: 'First-time purchase requiring extensive research and decision-making.',
        example: 'A company buying a new type of software system they\'ve never used before.'
    },
    { 
        term: 'System selling', 
        definition: 'Buying a complete solution to a problem from a single seller',
        explanation: 'Purchasing an entire system or solution rather than individual components.',
        example: 'A business buying a complete IT system including hardware, software, and support services from one vendor.'
    },
    { 
        term: 'Buying center', 
        definition: 'All the participants in the business purchase decision making process',
        explanation: 'Group of people involved in making business purchasing decisions.',
        example: 'A purchasing team including technical experts, users, and financial analysts deciding on new equipment.'
    },
    { 
        term: 'Deciders', 
        definition: 'Formal or informal power to select and approve final suppliers',
        explanation: 'People with authority to make final purchase decisions.',
        example: 'A CEO approving a major equipment purchase.'
    },
    { 
        term: 'Value analysis', 
        definition: 'Approach to cost reduction where components are studied',
        explanation: 'Systematic evaluation of products to reduce costs while maintaining quality.',
        example: 'A manufacturer analyzing each component of their product to find cost-saving opportunities.'
    },
    { 
        term: 'General need description', 
        definition: 'Describes the characteristics and quantity of the needed item',
        explanation: 'Detailed specification of what the business needs to purchase.',
        example: 'A company creating specifications for new manufacturing equipment, including capacity and technical requirements.'
    },
    { 
        term: 'Product specification', 
        definition: 'Describes the technical criteria',
        explanation: 'Detailed technical requirements for a product or service.',
        example: 'A company specifying exact dimensions, materials, and performance requirements for custom machinery.'
    },
    { 
        term: 'Supplier search', 
        definition: 'Compiling a list of qualified suppliers to find the best vendors',
        explanation: 'This is the process of looking for suppliers who can provide the product or service a company needs, and finding the best ones.',
        example: 'A company that needs to buy office chairs checks out various furniture suppliers to find those who offer high-quality and reasonably priced options.'
    },
    { 
        term: 'Proposal solicitation', 
        definition: 'The process of requesting proposals from qualified suppliers',
        explanation: 'This is when a company asks for offers (proposals) from suppliers on how much they will charge and what they will provide.',
        example: 'A university sends out a request for proposals to different catering companies to see which one can offer the best menu for their upcoming event.'
    },
    { 
        term: 'Supplier selection', 
        definition: 'When the buying center creates a list of desired supplier attributes and negotiates with preferred suppliers for favorable terms and conditions',
        explanation: 'After reviewing suppliers, the company decides which ones are the best match for their needs and starts negotiating terms like price and delivery.',
        example: 'A company looks at three different suppliers for computer parts and chooses the one with the best prices and delivery terms.'
    },
    { 
        term: 'Order routine specifications', 
        definition: 'The final order with the chosen supplier and lists all of the specifications and terms of the purchase',
        example: 'After selecting a supplier, a company finalizes the order with a document that confirms the price, delivery date, and product details like size and quantity.'
    },
    { 
        term: 'Performance review', 
        definition: 'A critique of supplier performance to the order routine specifications',
        explanation: 'This is when the company checks how well the supplier is meeting the terms of the contract, such as product quality and delivery times.',
        example: 'A business checks if a supplier is delivering the right amount of products on time and whether the quality matches the agreed standards.'
    },
    { 
        term: 'Advantages E procurement', 
        definition: 'Access to new supplier/lower cost/speeds order processing/improves sales/facilitate service and support',
        example: 'A company uses an online platform to order supplies, which helps them find better prices, place orders faster, and get quicker responses from suppliers.'
    },
    { 
        term: 'B to B digital', 
        definition: 'Use digital and social media marketing approaches to engage business customers and manage customers relationship anywhere any time',
        example: 'A company sells products online to other businesses and uses social media to keep in touch with customers and answer their questions instantly.'
    },
    { 
        term: 'Institutional markets', 
        definition: 'Consist of schools, hospitals, nursing homes, and prisons that provide goods and services to people in their care. (low budget, captive patrons)',
        explanation: 'These markets consist of organizations like schools, hospitals, and prisons that buy goods and services to provide for the people they care for. They often work with a limited budget.',
        example: 'A hospital buys medical supplies on a tight budget, needing to choose suppliers that can provide low-cost items without sacrificing quality.'
    },
    { 
        term: 'Government markets', 
        definition: 'Favor domestic suppliers, require them to submit bids and normally award the contract to the lowest bidder',
        explanation: 'These markets involve the government buying goods and services. The government usually chooses domestic suppliers, requires bids, and often picks the lowest-priced offer.',
        example: 'The government needs to buy construction materials for public buildings. Several companies submit bids, and the government picks the one with the lowest price.'
    }
];

const chapter7Definitions = [
    {
        term: 'Market segmentation',
        definition: 'Dividing a market into smaller segments with distinct needs, characteristics or behavior that might require separate marketing strategies or mixes',
        explanation: 'Market segmentation is when a company divides a large market into smaller groups of people who have similar needs or behaviors. This helps companies target their marketing better.',
        example: 'A clothing brand divides its market into segments like teenagers, working professionals, and elderly people, each with different styles and needs.'
    },
    {
        term: 'Geographic segmentation',
        definition: 'Different geographical units such as nations, regions, states, counties, cities or even neighborhoods',
        example: 'A coffee chain offers different drinks in colder climates (like hot lattes) and warmer places (like iced coffee).'
    },
    {
        term: 'Demographic segmentation',
        definition: 'Divides the market into segments based on variables such as age, life cycle stage, gender, income, occupations, educations, religion, ethnicity and generation',
        example: 'A brand may offer luxury cars to high-income individuals, while offering budget-friendly models to young people starting their careers.'
    },
    {
        term: 'Psychographic segmentation',
        definition: 'Divides a market into different segments based on social class, lifestyle, personality',
        example: 'A brand selling adventure gear targets outdoor enthusiasts (lifestyle) or a brand may target eco-friendly consumers (environmental values).'
    },
    {
        term: 'Behavioral segmentation',
        definition: 'Consumer knowledge, attitudes, uses of a product, responses to a product',
        example: 'A company might target frequent flyers with special deals on flights or reward long-time customers with loyalty discounts.'
    },
    {
        term: 'Multiple segmentation',
        definition: 'Identify smaller and better defined target groups',
        explanation: 'This combines different types of segmentation to create more precise and better-targeted groups.',
        example: 'A smartphone company might target young, tech-savvy people (psychographic) in urban areas (geographic) with high income (demographic).'
    },
    {
        term: 'Segmenting business markets',
        definition: 'Customer operating characteristics/purchasing approaches/situational factors/personal characteristics',
        explanation: 'When segmenting business markets, companies divide customers based on things like how they operate, how they buy products, and their individual preferences.',
        example: 'A software company might segment its business market into small businesses needing simple tools and large corporations needing complex, customizable software.'
    },
    {
        term: 'Segmenting international markets',
        definition: 'Geographic location/economic factors/political and legal factors/cultural factors',
        explanation: 'This involves dividing international markets based on factors like location, economy, politics, and culture.',
        example: 'A fast-food chain may offer spicy food options in India and non-spicy ones in the U.S. based on local tastes (cultural factors).'
    },
    {
        term: 'Intermarket segmentation',
        definition: 'Forming segments of consumers who have similar needs and buying behaviors even though they are located in different countries',
        example: 'People in various countries who love adventure sports could be grouped together to market outdoor equipment.'
    },
    {
        term: 'Effective segmentation',
        definition: 'Measurable/accessible/substantial/differentiable/actionable',
        explanation: 'For segmentation to be useful, it must be measurable (able to track size), accessible (reachable through marketing), substantial (big enough to matter), differentiable (clearly different), and actionable (can create targeted strategies).',
        example: 'A company segments its market into budget shoppers and luxury shoppers, and can reach both groups with distinct marketing.'
    },
    {
        term: 'Target market',
        definition: 'Set of buyers who share common needs or characteristics that the company decides to serve',
        explanation: 'This is the group of people or businesses that a company decides to focus its marketing efforts on because they share common needs or characteristics.',
        example: 'A fitness brand targets health-conscious individuals aged 25-40 who work out regularly.'
    },
    {
        term: 'Undifferentiated marketing',
        definition: 'Targets the whole market with one offer and focus on common needs (mass marketing)',
        explanation: 'This marketing strategy targets the entire market with one product and focuses on the common needs of everyone.',
        example: 'A salt company uses undifferentiated marketing by selling the same product to everyone.'
    },
    {
        term: 'Differentiated marketing',
        definition: 'Targets several different market segments and designs separate offers for each. Goal is to achieve higher sales and strong position (more expensive than undifferentiated)',
        example: 'A car manufacturer offers different models for different segments: luxury cars for wealthy customers, economy cars for budget-conscious buyers, and SUVs for families.'
    },
    {
        term: 'Concentrated market',
        definition: 'Targets large share of a smaller market, have a good knowledge of the market and have limited company resources(more efficient)',
        explanation: 'This strategy targets a specific, smaller market segment, focusing all resources on serving that segment well.',
        example: 'A small business making luxury chocolates focuses on high-end customers who value premium products.'
    },
    {
        term: 'Micromarketing',
        definition: 'Tailoring products and marketing programs to suit the tastes of specific individuals and locations (local and individual marketing)',
        explanation: 'This is when marketing efforts are tailored very specifically to individuals or very small groups.',
        example: 'A local store sends personalized discounts to customers based on their previous purchases.'
    },
    {
        term: 'Local marketing',
        definition: 'Tailoring brands and promotion to the needs and wants of local customer segments (cities, neighborhoods, stores)',
        example: 'A restaurant tailors its menu to local tastes, offering seafood in coastal areas and steaks in landlocked regions.'
    },
    {
        term: 'Individual marketing',
        definition: 'Tailoring products and marketing programs to the needs and preferences of individuals customers (mass customization, one to one marketing)',
        explanation: 'This takes customization to the next level, creating products or marketing strategies for each individual customer.',
        example: 'A company allows customers to design their own shoes, choosing colors and materials, making each pair unique.'
    },
    {
        term: 'Product position',
        definition: 'The way the product is defined by consumers on important attributes',
        explanation: 'This is how customers view a product in comparison to other products based on key features.',
        example: 'A car brand positions itself as "the safest vehicle," while another car brand positions itself as "the most fuel-efficient."'
    },
    {
        term: 'Positioning mapping',
        definition: 'Consumer perceptions of marketer\'s brands versus competing products on important buying dimensions',
        explanation: 'This is a visual tool used to show how consumers view different brands based on important factors like price and quality.',
        example: 'A graph showing that Brand A is perceived as both high-quality and high-price, while Brand B is low-quality but affordable.'
    },
    {
        term: 'Competitive advantages',
        definition: 'An advantage over competitors gained by offering consumers greater value, either through lower prices or by providing more benefits that justify higher prices. It is important/distinctive/superior/communicable/preemptive/affordable/profitable',
        explanation: 'This is what makes a company\'s product better or different from others, offering consumers more value, either through lower prices or extra benefits.',
        example: 'A phone company offers more features at a lower price than its competitors, giving it a competitive advantage.'
    },
    {
        term: 'Value proposition',
        definition: 'Full mix of benefits upon which a brand is positioned',
        explanation: 'This is the full set of benefits a brand promises to deliver to customers, justifying why they should choose that brand over others.',
        example: 'A hotel\'s value proposition could be, "Luxurious rooms, amazing service, and great location, all at an affordable price."'
    }
];

function generateQuestions(chapter, difficulty) {
    let definitions;
    switch(chapter) {
        case 1:
            definitions = chapter1Definitions;
            break;
        case 2:
            definitions = chapter2Definitions;
            break;
        case 3:
            definitions = chapter3Definitions;
            break;
        case 4:
            definitions = chapter4Definitions;
            break;
        case 5:
            definitions = chapter5Definitions;
            break;
        case 6:
            definitions = chapter6Definitions;
            break;
        case 7:
            definitions = chapter7Definitions;
            break;
        default:
            definitions = chapter1Definitions;
    }

    const questions = [];
    const totalQuestions = definitions.length; // Use all definitions

    if (difficulty === 'easy') {
        // Create multiple choice questions for all definitions
        definitions.forEach((correct, index) => {
            // Get 3 random wrong options
            const wrongOptions = definitions
                .filter((_, i) => i !== index)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                .map(def => def.term);

            const options = [...wrongOptions, correct.term]
                .sort(() => Math.random() - 0.5);

            questions.push({
                definition: correct.definition,
                options: options,
                correct: correct.term,
                type: 'multiple_choice'
            });
        });
    } else if (difficulty === 'medium') {
        // Half multiple choice, half write-in
        const halfLength = Math.ceil(definitions.length / 2);
        
        // First half: multiple choice
        definitions.slice(0, halfLength).forEach((correct, index) => {
            const wrongOptions = definitions
                .filter((_, i) => i !== index)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                .map(def => def.term);

            const options = [...wrongOptions, correct.term]
                .sort(() => Math.random() - 0.5);

            questions.push({
                definition: correct.definition,
                options: options,
                correct: correct.term,
                type: 'multiple_choice'
            });
        });

        // Second half: write-in terms
        definitions.slice(halfLength).forEach(def => {
            questions.push({
                definition: def.definition,
                correct: def.term,
                type: 'write_term'
            });
        });
    } else {
        // Hard - split into thirds
        const thirdLength = Math.ceil(definitions.length / 3);
        
        // First third: multiple choice
        definitions.slice(0, thirdLength).forEach((correct, index) => {
            const wrongOptions = definitions
                .filter((_, i) => i !== index)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                .map(def => def.term);

            const options = [...wrongOptions, correct.term]
                .sort(() => Math.random() - 0.5);

            questions.push({
                type: 'multiple_choice',
                definition: correct.definition,
                options: options,
                correct: correct.term
            });
        });

        // Second third: write-in terms
        definitions.slice(thirdLength, thirdLength * 2).forEach(def => {
            questions.push({
                definition: def.definition,
                correct: def.term,
                type: 'write_term'
            });
        });

        // Final third: write-in definitions
        definitions.slice(thirdLength * 2).forEach(def => {
            questions.push({
                term: def.term,
                correct: def.definition,
                type: 'write_definition'
            });
        });
    }

    return shuffleArray(questions);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function showDefinitionQuiz(chapter) {
    currentChapter = chapter;
    const content = document.getElementById('course-content');
    content.innerHTML = `
        <h2>Definition Quiz - Chapter ${chapter}</h2>
        <div class="difficulty-selection">
            <div class="difficulty-card">
                <h3>Easy</h3>
                <p>Multiple choice questions</p>
                <button class="quiz-btn" onclick="startQuiz(${chapter}, 'easy')">Start Quiz</button>
            </div>
            <div class="difficulty-card">
                <h3>Medium</h3>
                <p>Fill in the blank questions</p>
                <button class="quiz-btn" onclick="startQuiz(${chapter}, 'medium')">Start Quiz</button>
            </div>
            <div class="difficulty-card">
                <h3>Hard</h3>
                <p>Short answer questions</p>
                <button class="quiz-btn" onclick="startQuiz(${chapter}, 'hard')">Start Quiz</button>
            </div>
        </div>
        <div class="nav-container">
            <button class="nav-btn" onclick="showMainMenu()">Back to Menu</button>
            <button class="nav-btn" onclick="showSubmissions(${chapter})">View Submissions</button>
        </div>
    `;
}

function startQuiz(chapter, difficulty) {
    currentChapter = chapter;
    const questions = generateQuestions(chapter, difficulty);
    let currentQuestion = 0;
    const answers = [];

    function showQuestion() {
        const content = document.getElementById('course-content');
        const question = questions[currentQuestion];
        
        content.innerHTML = `
            <div class="quiz-container">
                <h2>Question ${currentQuestion + 1} of ${questions.length}</h2>
                ${question.type === 'write_definition' ?
                    `<p>Term: <strong>${question.term}</strong>?</p>` :
                    `<p>Definition: <em>${question.definition}</em></p>`
                }
                ${question.type === 'multiple_choice' ?
                    `<div class="options-container">
                        ${question.options.map((option, index) => `
                            <button class="option-btn" onclick="submitAnswer('${option}')">${option}</button>
                        `).join('')}
                    </div>` :
                    `<div class="input-container">
                        <input type="text" id="answer-input" placeholder="Type your answer here">
                        <button class="submit-btn" onclick="submitAnswer(document.getElementById('answer-input').value)">Submit</button>
                    </div>`
                }
            </div>
        `;
    }

    window.submitAnswer = function(userAnswer) {
        const question = questions[currentQuestion];
        const isCorrect = userAnswer.toLowerCase().trim() === question.correct.toLowerCase().trim();
        
        answers.push({
            question: question,
            userAnswer: userAnswer,
            isCorrect: isCorrect,
            type: question.type
        });

        currentQuestion++;
        if (currentQuestion < questions.length) {
            showQuestion();
        } else {
            const score = answers.filter(a => a.isCorrect).length;
            
            // Save submission
            const submission = {
                date: new Date().toLocaleString(),
                score: score,
                total: questions.length,
                answers: answers
            };
            if (!quizSubmissions[currentChapter]) {
                quizSubmissions[currentChapter] = [];
            }
            quizSubmissions[currentChapter].unshift(submission);
            
            // Show results
            const content = document.getElementById('course-content');
            content.innerHTML = `
                <div class="quiz-results">
                    <h2>Quiz Complete!</h2>
                    <p class="score">Your Score: ${score} out of ${questions.length}</p>
                    <button class="quiz-btn" onclick="showStoredReview(${currentChapter}, 0)">Review Answers</button>
                    <button class="quiz-btn" onclick="showDefinitionQuiz(${currentChapter})">Try Again</button>
                    <button class="quiz-btn" onclick="showSubmissions(${currentChapter})">View All Submissions</button>
                </div>
            `;
        }
    };

    showQuestion();
}

let understandingStates = {};

function getUnderstandingState(chapter, index) {
    const key = `${chapter}-${index}`;
    return understandingStates[key];
}

function markUnderstanding(chapter, index, state) {
    const key = `${chapter}-${index}`;
    const definitionCard = document.getElementById(`def-${key}`);
    
    // Remove existing states
    definitionCard.classList.remove('understood', 'review-later');
    
    // Update state
    understandingStates[key] = state;
    
    // Apply new state
    if (state === true) {
        definitionCard.classList.add('understood');
    } else if (state === false) {
        definitionCard.classList.add('review-later');
    }

    // Update button states
    const buttons = definitionCard.querySelectorAll('.understanding-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if ((state === true && btn.classList.contains('understood')) ||
            (state === false && btn.classList.contains('review-later'))) {
            btn.classList.add('active');
        }
    });
}

function toggleExplanation(chapter, index) {
    const explanationContent = document.getElementById(`explanation-${chapter}-${index}`);
    const viewMoreBtn = document.getElementById(`view-more-${chapter}-${index}`);
    
    if (explanationContent.classList.contains('visible')) {
        explanationContent.classList.remove('visible');
        viewMoreBtn.textContent = 'view more';
    } else {
        explanationContent.classList.add('visible');
        viewMoreBtn.textContent = 'view less';
    }
}

function showChapterDefinitions(chapter) {
    document.querySelectorAll('.chapter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === `Chapter ${chapter}`) {
            btn.classList.add('active');
        }
    });

    const definitionsDiv = document.getElementById('chapter-definitions');
    let definitions;
    
    switch(chapter) {
        case 1:
            definitions = chapter1Definitions;
            break;
        case 2:
            definitions = chapter2Definitions;
            break;
        case 3:
            definitions = chapter3Definitions;
            break;
        case 4:
            definitions = chapter4Definitions;
            break;
        case 5:
            definitions = chapter5Definitions;
            break;
        case 6:
            definitions = chapter6Definitions;
            break;
        case 7:
            definitions = chapter7Definitions;
            break;
        default:
            definitions = [];
    }
    
    definitionsDiv.innerHTML = `
        <div class="definitions-container">
            <h3>Chapter ${chapter} Definitions</h3>
            <div class="definitions-list">
                ${definitions.map((def, index) => {
                    const state = getUnderstandingState(chapter, index);
                    const stateClass = state === true ? 'understood' : state === false ? 'review-later' : '';
                    return `
                        <div class="definition-item ${stateClass}" id="def-${chapter}-${index}">
                            <div class="definition-content">
                                <h4>${def.term}</h4>
                                <p>${def.definition}</p>
                                ${(def.explanation || def.example) ? `
                                    <button class="view-more-btn" id="view-more-${chapter}-${index}" 
                                            onclick="toggleExplanation(${chapter}, ${index})">
                                        view more
                                    </button>
                                    <div class="explanation-content" id="explanation-${chapter}-${index}">
                                        ${def.explanation ? `<p class="simple-text"><em>Explanation:</em> ${def.explanation}</p>` : ''}
                                        ${def.example ? `<p class="simple-text"><em>Example:</em> ${def.example}</p>` : ''}
                                    </div>
                                ` : ''}
                            </div>
                            <div class="understanding-controls">
                                <button class="understanding-btn understood ${state === true ? 'active' : ''}" 
                                        onclick="markUnderstanding(${chapter}, ${index}, true)">
                                    Understood
                                </button>
                                <button class="understanding-btn review-later ${state === false ? 'active' : ''}" 
                                        onclick="markUnderstanding(${chapter}, ${index}, false)">
                                    Review Later
                                </button>
                                <button class="understanding-btn reset" 
                                        onclick="markUnderstanding(${chapter}, ${index}, null)">
                                    Reset
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function showMarketingSection(section) {
    const content = document.getElementById('course-content');
    
    document.querySelectorAll('.course-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === section) {
            btn.classList.add('active');
        }
    });

    switch(section) {
        case 'class':
            content.innerHTML = `
                <div class="quiz-wrapper">
                    <h2>Course Summary</h2>
                    <div style="text-align: left;">
                        <p>Marketing Fundamentals is a very theoretical subject, in which you'll mainly have to learn definitions. Depending on the teacher, there will be <strong>two different types of exam</strong>:</p>
                        <ul>
                            <li><strong>50 multiple choice questions</strong></li>
                            <li><strong>40% multiple choice and 60% open-ended questions</strong> (3 questions of 20% each)</li>
                        </ul>
                        
                        <p>In combination with your teacher's lessons or the book, this section will give you <strong>everything you need to know for your exams</strong>. Below you'll find all the definitions from the book/course (it's important to know these sentence formulations because the exams are based on them).</p>
                        
                        <p>Knowing ourselves that these definitions can be unclear and difficult to remember, we've added to each definition <strong>a simpler explanation with examples</strong> for each situation.</p>
                        
                        <p>Once you're comfortable with these terms, you'll be able to practice in the exercise section. We've included:</p>
                        <ul>
                            <li><strong>A quiz with 3 levels of difficulty</strong> to help you practice with the definitions</li>
                            <li><strong>Midterm and final exams from previous years</strong> - these are probably the closest versions of what you will get</li>
                        </ul>
                        
                        <p>You'll find all your submissions in the <strong>progress section</strong>.</p>
                    </div>
                    
                    <h2>Definitions by Chapter</h2>
                    <div class="chapter-buttons">
                        <button class="chapter-btn active" onclick="showChapterDefinitions(1)">Chapter 1</button>
                        <button class="chapter-btn" onclick="showChapterDefinitions(2)">Chapter 2</button>
                        <button class="chapter-btn" onclick="showChapterDefinitions(3)">Chapter 3</button>
                        <button class="chapter-btn" onclick="showChapterDefinitions(4)">Chapter 4</button>
                        <button class="chapter-btn" onclick="showChapterDefinitions(5)">Chapter 5</button>
                        <button class="chapter-btn" onclick="showChapterDefinitions(6)">Chapter 6</button>
                        <button class="chapter-btn" onclick="showChapterDefinitions(7)">Chapter 7</button>
                    </div>
                    <div id="chapter-definitions"></div>
                </div>
            `;
            showChapterDefinitions(1);
            break;
        case 'exercises':
            content.innerHTML = `
                <div class="quiz-wrapper">
                    <h2>Definition Quizzes</h2>
                    <div class="course-materials">
                        <button class="course-button" onclick="showDefinitionQuiz(1)">Definition Quiz Chapter 1</button>
                        <button class="course-button" onclick="showDefinitionQuiz(2)">Definition Quiz Chapter 2</button>
                        <button class="course-button" onclick="showDefinitionQuiz(3)">Definition Quiz Chapter 3</button>
                        <button class="course-button" onclick="showDefinitionQuiz(4)">Definition Quiz Chapter 4</button>
                        <button class="course-button" onclick="showDefinitionQuiz(5)">Definition Quiz Chapter 5</button>
                        <button class="course-button" onclick="showDefinitionQuiz(6)">Definition Quiz Chapter 6</button>
                        <button class="course-button" onclick="showDefinitionQuiz(7)">Definition Quiz Chapter 7</button>
                    </div>
                    <div class="quiz-wrapper" style="margin-top: 40px;">
                        <h2 style="margin-bottom: 20px;">Midterm and Final's Questions</h2>
                        <div class="course-materials" style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
                            <button class="course-button" style="max-width: 400px;" onclick="showMidtermTest()">Midterm 1</button>
                            <button class="course-button" style="max-width: 400px;" onclick="showMidterm2Test()">Midterm 2</button>
                            <button class="course-button" style="max-width: 400px;" onclick="showMidterm3Test()">Midterm 3</button>
                            <button class="course-button" style="max-width: 400px;" onclick="showMidterm4Test()">Midterm 4</button>
                            <button class="course-button" style="max-width: 400px;" onclick="showFinal1Test()">Final 1</button>
                        </div>
                    </div>
                </div>
            `;
            break;
        case 'progress':
            content.innerHTML = `
                <div class="quiz-wrapper">
                    <h2>Your Progress</h2>
                    <div class="course-materials" style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
                        <button class="course-button" style="max-width: 400px;" onclick="showMainSubmissions()">Definition Quiz Submissions</button>
                        <button class="course-button" style="max-width: 400px;" onclick="showMidtermSubmissions()">Midterm 1 Submissions</button>
                        <button class="course-button" style="max-width: 400px;" onclick="showMidterm2Submissions()">Midterm 2 Submissions</button>
                        <button class="course-button" style="max-width: 400px;" onclick="showMidterm3Submissions()">Midterm 3 Submissions</button>
                        <button class="course-button" style="max-width: 400px;" onclick="showMidterm4Submissions()">Midterm 4 Submissions</button>
                        <button class="course-button" style="max-width: 400px;" onclick="showFinal1Submissions()">Final 1 Submissions</button>
                        <button class="course-button" style="max-width: 400px;" onclick="showFinalQuestions()">Final's Questions</button>
                    </div>
                </div>
            `;
            break;
    }
}

let quizSubmissions = {
    1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []
};
let currentChapter = 1;

function showSubmissions(chapter) {
    const content = document.getElementById('course-content');
    const submissions = quizSubmissions[chapter] || [];
    
    content.innerHTML = `
        <h2>Submissions - Chapter ${chapter}</h2>
        ${submissions.length === 0 ? 
            '<p>No submissions yet for this chapter.</p>' :
            submissions.map((sub, index) => `
                <div class="review-card">
                    <div class="review-progress">
                        <span>${sub.score}/${sub.total}</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${sub.score / sub.total * 100}%"></div>
                        </div>
                        <span>${Math.round(sub.score / sub.total * 100)}%</span>
                    </div>
                    <p>${sub.date}</p>
                    <button class="quiz-btn" onclick="showStoredReview(${chapter}, ${index})">Review Answers</button>
                </div>
            `).join('')}
        </div>
        <div class="nav-container">
            <button class="nav-btn" onclick="showDefinitionQuiz(${chapter})">Back to Quiz</button>
            <button class="nav-btn" onclick="showMainMenu()">Back to Menu</button>
        </div>
    `;
}

function showFinalQuestions() {
    const content = document.getElementById('course-content');
    
    content.innerHTML = `
        <div class="quiz-wrapper">
            <h2>Final's Questions</h2>
            <div class="course-materials">
                <button class="course-button" onclick="showFinalQuiz(1)">Chapter 1-2 Questions</button>
                <button class="course-button" onclick="showFinalQuiz(2)">Chapter 3-4 Questions</button>
                <button class="course-button" onclick="showFinalQuiz(3)">Chapter 5-7 Questions</button>
            </div>
            <button class="nav-btn" onclick="showMainMenu()">Back to Menu</button>
        </div>
    `;
}

function showFinalQuiz(section) {
    let startChapter, endChapter;
    switch(section) {
        case 1:
            startChapter = 1;
            endChapter = 2;
            break;
        case 2:
            startChapter = 3;
            endChapter = 4;
            break;
        case 3:
            startChapter = 5;
            endChapter = 7;
            break;
    }

    // Combine definitions from the chapters
    let allDefinitions = [];
    for(let chapter = startChapter; chapter <= endChapter; chapter++) {
        switch(chapter) {
            case 1: allDefinitions = allDefinitions.concat(chapter1Definitions); break;
            case 2: allDefinitions = allDefinitions.concat(chapter2Definitions); break;
            case 3: allDefinitions = allDefinitions.concat(chapter3Definitions); break;
            case 4: allDefinitions = allDefinitions.concat(chapter4Definitions); break;
            case 5: allDefinitions = allDefinitions.concat(chapter5Definitions); break;
            case 6: allDefinitions = allDefinitions.concat(chapter6Definitions); break;
            case 7: allDefinitions = allDefinitions.concat(chapter7Definitions); break;
        }
    }

    // Shuffle the definitions
    allDefinitions = allDefinitions.sort(() => Math.random() - 0.5);

    // Take first 10 definitions for the quiz
    const quizDefinitions = allDefinitions.slice(0, 10);

    // Generate questions
    const questions = [];
    quizDefinitions.forEach((correct, index) => {
        // Get 3 random wrong options
        const wrongOptions = allDefinitions
            .filter(d => d.term !== correct.term)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(d => d.term);

        // Combine and shuffle all options
        const options = [...wrongOptions, correct.term]
            .sort(() => Math.random() - 0.5);

        questions.push({
            type: 'multiple_choice',
            definition: correct.definition,
            options: options,
            correct: correct.term
        });
    });

    currentChapter = `Final ${startChapter}-${endChapter}`;
    startQuiz(questions);
}

function showMainSubmissions() {
    const content = document.getElementById('course-content');
    
    content.innerHTML = `
        <div class="quiz-wrapper">
            <h2>Definition Quiz Submissions</h2>
            <div class="course-materials">
                <button class="course-button" onclick="showSubmissions(1)">Chapter 1 Submissions</button>
                <button class="course-button" onclick="showSubmissions(2)">Chapter 2 Submissions</button>
                <button class="course-button" onclick="showSubmissions(3)">Chapter 3 Submissions</button>
                <button class="course-button" onclick="showSubmissions(4)">Chapter 4 Submissions</button>
                <button class="course-button" onclick="showSubmissions(5)">Chapter 5 Submissions</button>
                <button class="course-button" onclick="showSubmissions(6)">Chapter 6 Submissions</button>
                <button class="course-button" onclick="showSubmissions(7)">Chapter 7 Submissions</button>
            </div>
            <button class="nav-btn" onclick="showMainMenu()">Back to Menu</button>
        </div>
    `;
}

function showStoredReview(chapter, submissionIndex) {
    const submission = quizSubmissions[chapter][submissionIndex];
    const content = document.getElementById('course-content');
    
    // Calculate progress
    const progress = (submission.score / submission.total) * 100;
    
    content.innerHTML = `
        <h2>Review - Chapter ${chapter}</h2>
        <div class="review-progress">
            <span>${submission.score}/${submission.total}</span>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <span>${Math.round(progress)}%</span>
        </div>
        <p>Date: ${submission.date}</p>
        ${submission.answers.map((answer, i) => `
            <div class="review-card ${answer.isCorrect ? 'correct' : 'incorrect'}">
                <h3>Question ${i + 1}</h3>
                ${answer.type === 'write_definition' ?
                    `<p>Term: ${answer.question.term}</p>` :
                    `<p>Definition: ${answer.question.definition}</p>`
                }
                <p>Your answer: ${answer.userAnswer}</p>
                ${!answer.isCorrect ? 
                    `<p>Correct answer: ${answer.question.correct}</p>` : 
                    ''
                }
            </div>
        `).join('')}
        <div class="nav-container">
            <button class="nav-btn" onclick="showDefinitionQuiz(${chapter})">Try Again</button>
            <button class="nav-btn" onclick="showSubmissions(${chapter})">Back to Submissions</button>
        </div>
    `;
}

const midtermQuestions = [
    {
        question: "Which environment shows trends including shortages of certain raw materials, higher pollution levels, and more government intervention?",
        options: [
            "The political environment",
            "The economic environment",
            "The technological environment",
            "The sociocultural environment",
            "The natural environment"
        ],
        correct: "The natural environment"
    },
    {
        question: "What is the purpose of a value proposition?",
        options: [
            "To define the target market",
            "To balance customer management with demand management",
            "To differentiate and position a market offering in the marketplace",
            "To determine the prices a company will charge for its products",
            "To determine whom a company will serve with its market offerings"
        ],
        correct: "To differentiate and position a market offering in the marketplace"
    },
    {
        question: "A wedding services company changes its marketing strategy to reflect the fact that more LGBTQ marriages are taking place. The company is offering a broader range of ceremonies that cater to this market. Which of the following environments must this wedding company analyze?",
        options: [
            "Technological",
            "Natural",
            "Cultural",
            "Economic",
            "Political"
        ],
        correct: "Cultural"
    },
    {
        question: "A marketing plan begins with ________ and ends with a(n) ________.",
        options: [
            "objectives; outline of controls",
            "a marketing strategy; profit forecast",
            "an executive summary; action plan",
            "objectives; budget forecast",
            "an executive summary; outline of controls"
        ],
        correct: "objectives; outline of controls"
    },
    {
        question: "Which growth strategy seeks to increase sales to current customers without changing the product?",
        options: [
            "Product development",
            "Market development",
            "Portfolio analysis",
            "Market penetration",
            "Diversification"
        ],
        correct: "Market penetration"
    },
    {
        question: "Which of the following is NOT an element of the marketing mix?",
        options: [
            "Place",
            "Promotion",
            "Product",
            "Purchase",
            "Price"
        ],
        correct: "Purchase"
    },
    {
        question: "According to the BCG, which of the following describes a STAR?",
        options: [
            "High market share, high market growth",
            "High market share, low market growth",
            "Low market share, high market growth",
            "Low market investment, high market growth",
            "High market investment, high market growth"
        ],
        correct: "High market share, high market growth"
    },
    {
        question: "Amazon Echo's Alexa is an example of:",
        options: [
            "Artificial intelligence",
            "Digital learning",
            "Data analytics",
            "Desktop computing",
            "The worldwide web"
        ],
        correct: "Artificial intelligence"
    },
    {
        question: "________ occurs when satisfied customers initiate favorable interactions with others about a brand.",
        options: [
            "Partnership marketing",
            "Customer intrusion",
            "Targeting new customers",
            "Customer brand advocacy",
            "Customer-engagement marketing"
        ],
        correct: "Customer brand advocacy"
    },
    {
        question: "The IoT is part of which external marketing environment?",
        options: [
            "The natural environment",
            "The sociocultural environment",
            "The technological environment",
            "The demographic environment",
            "The economic environment"
        ],
        correct: "The technological environment"
    },
    {
        question: "In a SWOT analysis, ________ include favorable trends in the external environment.",
        options: [
            "Opportunities",
            "Strengths",
            "Challenges",
            "Threats",
            "Weaknesses"
        ],
        correct: "Opportunities"
    },
    {
        question: "Arranging for a product to occupy a clear, distinctive, and desirable place relative to competing products in the minds of target consumers is known as:",
        options: [
            "Diversifying",
            "Positioning",
            "Segmenting",
            "Prospecting",
            "Satisficing"
        ],
        correct: "Positioning"
    },
    {
        question: "The technology that involves machines that think and learn like humans is known as:",
        options: [
            "Analytics",
            "Artificial intelligence",
            "The Internet of Things",
            "Big data",
            "Digital thinking"
        ],
        correct: "Artificial intelligence"
    },
    {
        question: "A video game manufacturer wants to enter the Japanese market with their current line of games. Based on the product/market expansion grid, which growth strategy is the firm using?",
        options: [
            "Market penetration",
            "Market development",
            "Diversification",
            "Product development",
            "Harvesting"
        ],
        correct: "Market development"
    },
    {
        question: "Reese's is developing a special edition for their chocolates for Halloween, with a new packaging and dedicated communication strategy. Which strategy is this more likely to be according to the ANSOFF matrix?",
        options: [
            "Product development",
            "Market penetration",
            "Market development",
            "Diversification",
            "Need development"
        ],
        correct: "Product development"
    }
];

const explanations = [
    {
        explanation: "The natural environment involves natural resources and ecological factors like raw material availability, pollution, and environmental regulations that affect businesses.",
        example: "For example, a car company facing a shortage of lithium (used in electric car batteries) and stricter pollution laws must adapt to these natural environment changes."
    },
    {
        explanation: "A value proposition explains why a customer should choose a company's product by showing its unique benefits and value compared to competitors.",
        example: "Apple's value proposition is premium quality, innovation, and design, which sets it apart from other smartphone brands."
    },
    {
        explanation: "The cultural environment reflects societal values, beliefs, and trends that businesses must consider to meet changing customer preferences.",
        example: "The wedding company updates its services to reflect growing societal acceptance and demand for LGBTQ ceremonies."
    },
    {
        explanation: "A marketing plan starts by setting clear objectives and finishes with controls to measure if goals were achieved and adjust as needed.",
        example: "A company may set a goal to grow sales by 10% and later use sales reports to check progress and control outcomes."
    },
    {
        explanation: "Market penetration focuses on selling more of the existing product to the current market.",
        example: "McDonald's offering discounts or loyalty programs to encourage customers to buy more burgers."
    },
    {
        explanation: "The marketing mix includes Product, Price, Place, Promotion – not Purchase.",
        example: "Setting the product price and deciding where to sell it are part of the marketing mix, but the customer's act of purchase is not."
    },
    {
        explanation: "A STAR has a high market share in a fast-growing market, needing investment to maintain leadership.",
        example: "Tesla's Model 3 in the booming electric vehicle market."
    },
    {
        explanation: "Artificial intelligence (AI) refers to machines like Alexa that can understand and respond to voice commands.",
        example: "Alexa answering your questions and controlling smart home devices."
    },
    {
        explanation: "This is called Customer brand advocacy, where happy customers promote the brand to others.",
        example: "A customer posting positive reviews about Nike shoes on social media."
    },
    {
        explanation: "The Technological environment includes innovations like the Internet of Things (IoT) that connect devices.",
        example: "Smart fridges that connect to apps to help manage groceries."
    },
    {
        explanation: "Opportunities are positive external trends that companies can exploit for growth.",
        example: "A growing demand for electric cars is an opportunity for car manufacturers."
    },
    {
        explanation: "Positioning is making a product stand out clearly in consumers' minds compared to competitors.",
        example: "Volvo positions itself as the safest car brand."
    },
    {
        explanation: "Artificial Intelligence (AI) refers to machines that mimic human thinking and learning.",
        example: "Chatbots that answer customer service questions automatically."
    },
    {
        explanation: "Market development is selling current products in new geographic or demographic markets.",
        example: "Launching existing games in Japan for the first time."
    },
    {
        explanation: "Product development means modifying products (e.g., packaging) for current markets.",
        example: "Reese's Halloween-themed chocolate packaging to boost sales during the holiday."
    }
];

let midtermSubmissions = [];

function showMidtermTest() {
    const content = document.getElementById('course-content');
    content.innerHTML = `
        <div class="quiz-wrapper">
            <h2>Midterm 1</h2>
            <div id="quiz-container">
                ${midtermQuestions.map((q, index) => `
                    <div class="quiz-question">
                        <p><strong>Question ${index + 1}:</strong> ${q.question}</p>
                        <div class="options" style="display: flex; flex-direction: column; gap: 10px;">
                            ${q.options.map(option => `
                                <button class="option-btn" style="width: 100%; text-align: left; padding: 10px;" onclick="selectMidtermOption(this, ${index})">${option}</button>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
                <div class="nav-container">
                    <button class="nav-btn" onclick="checkAndSubmitMidterm()">Submit Test</button>
                    <button class="nav-btn secondary" onclick="showMainMenu()">Back to Menu</button>
                </div>
            </div>
        </div>
    `;
}

function selectMidtermOption(button, questionIndex) {
    // Get all option buttons for this question
    const questionDiv = button.closest('.quiz-question');
    const allOptions = questionDiv.querySelectorAll('.option-btn');
    
    // Remove selected class from all options in this question
    allOptions.forEach(btn => btn.classList.remove('selected'));
    
    // Add selected class to clicked button
    button.classList.add('selected');
}

function checkAndSubmitMidterm() {
    const questions = document.querySelectorAll('.quiz-question');
    const unansweredCount = Array.from(questions).filter(q => !q.querySelector('.option-btn.selected')).length;
    
    if (unansweredCount > 0) {
        const confirmSubmit = confirm(`Warning: You have ${unansweredCount} unanswered question${unansweredCount > 1 ? 's' : ''}. Do you want to submit anyway?`);
        if (!confirmSubmit) {
            return;
        }
    }
    
    submitMidterm();
}

function submitMidterm() {
    // Create an array of all questions with their selected answers
    const questions = document.querySelectorAll('.quiz-question');
    let score = 0;
    const answers = [];
    
    // Go through each question
    questions.forEach((questionDiv, index) => {
        const selectedButton = questionDiv.querySelector('.option-btn.selected');
        const answer = {
            question: midtermQuestions[index].question,
            answer: selectedButton ? selectedButton.textContent : 'Not answered',
            correct: midtermQuestions[index].correct,
            isCorrect: false
        };
        
        // Check if the question was answered and if it's correct
        if (selectedButton) {
            answer.isCorrect = selectedButton.textContent === midtermQuestions[index].correct;
            if (answer.isCorrect) score++;
        }
        
        answers.push(answer);
    });

    // Store the submission
    const submission = {
        date: new Date().toLocaleString(),
        score: score,
        total: midtermQuestions.length,
        answers: answers,
        unansweredCount: answers.filter(a => a.answer === 'Not answered').length
    };

    if (!midtermSubmissions) {
        midtermSubmissions = [];
    }
    midtermSubmissions.unshift(submission);

    showMidtermReview(0);
}

function showMidtermReview(submissionIndex) {
    const submission = midtermSubmissions[submissionIndex];
    const content = document.getElementById('course-content');
    
    content.innerHTML = `
        <div class="quiz-wrapper">
            <h2>Midterm 1 Review</h2>
            <div class="review-progress">
                <span>Score:</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="--progress: ${(submission.score / submission.total) * 100}%"></div>
                </div>
                <span>${submission.score}/${submission.total}</span>
            </div>
            <div class="submissions-list">
                ${submission.answers.map((answer, index) => `
                    <div class="review-card ${answer.isCorrect ? 'correct' : 'incorrect'}">
                        <p><strong>Question ${index + 1}:</strong> ${answer.question}</p>
                        <p>Your answer: ${answer.answer}</p>
                        <p>Correct answer: ${answer.correct}</p>
                        <div class="flyout-menu">
                            <button class="flyout-button">View Explanation</button>
                            <div class="flyout-content">
                                <div class="explanation-title">Explanation:</div>
                                <div class="explanation-text">
                                    ${explanations[index].explanation}
                                </div>
                                <div class="example-title">Example:</div>
                                <div class="example-text">
                                    ${explanations[index].example}
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="nav-container">
                <button class="nav-btn" onclick="showMidtermSubmissions()">Back to Submissions</button>
                <button class="nav-btn secondary" onclick="showMainMenu()">Back to Menu</button>
            </div>
        </div>
    `;
}

function showMidtermSubmissions() {
    const content = document.getElementById('course-content');
    const submissions = midtermSubmissions || [];
    
    content.innerHTML = `
        <div class="quiz-wrapper">
            <h2>Midterm 1 Submissions</h2>
            ${submissions.length === 0 ? 
                '<p>No submissions yet.</p>' :
                submissions.map((sub, index) => {
                    const progress = (sub.score / sub.total) * 100;
                    return `
                        <div class="review-card">
                            <div class="review-progress">
                                <span>${sub.score}/${sub.total}</span>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${progress}%"></div>
                                </div>
                                <span>${Math.round(progress)}%</span>
                            </div>
                            <p>${sub.date}</p>
                            <button class="quiz-btn" onclick="showMidtermReview(${index})">Review Answers</button>
                        </div>
                    `;
                }).join('')
            }
            <div class="nav-container">
                <button class="nav-btn" onclick="showMainMenu()">Back to Menu</button>
            </div>
        </div>
    `;
}

function showMainMenu() {
    const content = document.getElementById('course-content');
    content.innerHTML = `
        <div class="menu-container">
            <div class="menu-section">
                <h2>Definition Quizzes</h2>
                <div class="button-grid">
                    <button onclick="showDefinitionQuiz(1)" class="menu-btn">Definition Quiz Chapter 1</button>
                    <button onclick="showDefinitionQuiz(2)" class="menu-btn">Definition Quiz Chapter 2</button>
                    <button onclick="showDefinitionQuiz(3)" class="menu-btn">Definition Quiz Chapter 3</button>
                    <button onclick="showDefinitionQuiz(4)" class="menu-btn">Definition Quiz Chapter 4</button>
                    <button onclick="showDefinitionQuiz(5)" class="menu-btn">Definition Quiz Chapter 5</button>
                    <button onclick="showDefinitionQuiz(6)" class="menu-btn">Definition Quiz Chapter 6</button>
                    <button onclick="showDefinitionQuiz(7)" class="menu-btn">Definition Quiz Chapter 7</button>
                </div>
            </div>
            <div class="menu-section">
                <h2>Tests</h2>
                <div class="button-grid" style="display: flex; flex-direction: column; gap: 20px;">
                    <button onclick="showMidtermTest()" class="menu-btn">Midterm 1</button>
                    <button onclick="showMidterm2Test()" class="menu-btn">Midterm 2</button>
                    <button onclick="showMidterm3Test()" class="menu-btn">Midterm 3</button>
                    <button onclick="showFinal1Test()" class="menu-btn">Final 1</button>
                </div>
            </div>
            <div class="menu-section">
                <h2>Progress</h2>
                <div class="button-grid" style="display: flex; flex-direction: column; gap: 20px; max-width: 400px; margin: 0 auto;">
                    <button onclick="showMainSubmissions()" class="menu-btn">Definition Quiz Submissions</button>
                    <button onclick="showMidtermSubmissions()" class="menu-btn">Midterm 1 Submissions</button>
                    <button onclick="showMidterm2Submissions()" class="menu-btn">Midterm 2 Submissions</button>
                    <button onclick="showMidterm3Submissions()" class="menu-btn">Midterm 3 Submissions</button>
                    <button onclick="showFinal1Submissions()" class="menu-btn">Final 1 Submissions</button>
                </div>
            </div>
        </div>
    `;
}

// Show main menu when page loads
document.addEventListener('DOMContentLoaded', function() {
    showMainMenu();
});

const midterm2Questions = [
    {
        question: "A university is buying new overhead projectors for its classrooms. The university's Information Technology Department has been asked to provide specifications and recommendations for this purchase. The IT Department is playing which role in the university's buying center?",
        options: [
            "Buyer",
            "Decider",
            "Gatekeeper",
            "Influencer",
            "User"
        ],
        correct: "Gatekeeper"
    },
    {
        question: "Which of the following statements regarding the buyer decision process is correct?",
        options: [
            "Consumers tend to take the same amount of time going through the stages of the buyer decision process.",
            "Consumers go through all stages of the buyer decision process for every purchase situation.",
            "The nature of the product has no effect on the buyer decision process.",
            "The buyer decision process consists of four stages.",
            "Consumers may, in some situations, skip steps in the buyer decision process."
        ],
        correct: "Consumers may, in some situations, skip steps in the buyer decision process."
    },
    {
        question: "Which of the following correctly defines the consumer market?",
        options: [
            "Consumers and the businesses who sell to them",
            "Consumers who spend more than $5,000 yearly on goods and services",
            "Consumers and the resellers who consumers buy their products from",
            "Manufacturers, resellers, and consumers",
            "Individuals and households that buy goods and services for personal consumption"
        ],
        correct: "Individuals and households that buy goods and services for personal consumption"
    },
    {
        question: "Business-to-business marketing involves buying and selling goods or services by which of the following?",
        options: [
            "Manufacturers, producers, retailers, wholesalers",
            "Manufacturers, retailers, consumers, wholesalers",
            "Consumers, manufacturers, resellers, suppliers",
            "Manufacturers, producers, retailers, the government",
            "Manufacturers, producers, retailers, consumers"
        ],
        correct: "Manufacturers, producers, retailers, wholesalers"
    },
    {
        question: "Alfie is a GPS tracker for dogs. The company decided to use the same provider for storage, shipping, and handling returns. This is an example of:",
        options: [
            "Straight rebuy",
            "Modified rebuy",
            "New task",
            "Group rebuy",
            "System selling"
        ],
        correct: "System selling"
    },
    {
        question: "When consumers engage in __________ buying behavior, they go through a learning process and are faced with brands that significantly differ between them, so it is most important that marketers understand information gathering and evaluation behavior.",
        options: [
            "Low involvement",
            "Habitual",
            "Dissonance-reducing",
            "Variety-seeking",
            "Complex"
        ],
        correct: "Variety-seeking"
    },
    {
        question: "Which of the following statements is correct regarding consumer buying decisions?",
        options: [
            "Consumers are often unaware of what influences their purchases.",
            "Marketers are interested in what and where consumers buy, but not how much they buy.",
            "The easiest part of studying buying decisions is determining the whys behind consumer buying behavior.",
            "A buyer's characteristics such as age and income have little influence on buying decisions.",
            "The consumer buying decision process is of little interest to marketers."
        ],
        correct: "Consumers are often unaware of what influences their purchases."
    },
    {
        question: "People can be classified into adopter categories. Which two categories are the first to adopt a new product idea?",
        options: [
            "Early mainstream and the late mainstream",
            "Early adopters and lagging adopters",
            "Innovators and the early mainstream",
            "Early adopters and early innovators",
            "Innovators and early adopters"
        ],
        correct: "Innovators and early adopters"
    },
    {
        question: "Which of the following is a business-to-business market transaction?",
        options: [
            "A person buying their weekly groceries",
            "A person getting a parking ticket",
            "The U.S. government buying supplies for military personnel",
            "A family vacationing at Disneyland",
            "A grocery store buying cereal from Kellogg's"
        ],
        correct: "A grocery store buying cereal from Kellogg's"
    },
    {
        question: "Which of the following statements is correct regarding major influences on business buyer behavior?",
        options: [
            "Culture is more important to domestic B-to-B marketers than to global B-to-B marketers.",
            "Emotion plays an important role in business buying decisions.",
            "Interpersonal factors have little influence on business buyer behavior.",
            "Economic factors have little influence on business buying decisions.",
            "Marketers in the B-to-B market are not concerned with competitive developments in their environment."
        ],
        correct: "Interpersonal factors have little influence on business buyer behavior."
    }
];

const midterm2Explanations = [
    {
        explanation: "The IT Department acts as a Gatekeeper, controlling the flow of information and recommendations to decision-makers.",
        example: "The IT team researches projector specs and recommends brands, filtering the options for the university's purchasing department."
    },
    {
        explanation: "Consumers may skip steps depending on how complex or familiar the purchase is.",
        example: "For routine grocery shopping, a consumer may skip researching or evaluating alternatives."
    },
    {
        explanation: "The consumer market includes individuals and households who buy goods for personal use.",
        example: "Families buying groceries or clothing are part of the consumer market."
    },
    {
        explanation: "Business-to-business (B2B) marketing involves transactions between manufacturers, producers, retailers, and wholesalers.",
        example: "A retailer buying large quantities of products from a wholesaler."
    },
    {
        explanation: "System selling means buying a complete solution (e.g., storage, shipping, returns) from one provider.",
        example: "Alfie choosing one logistics company to handle everything instead of multiple suppliers."
    },
    {
        explanation: "Consumers who like trying different brands for fun, not loyalty, show variety-seeking behavior.",
        example: "A person buying a different brand of chips each time they shop."
    },
    {
        explanation: "Consumers are often unaware of what influences their buying decisions (like ads, trends).",
        example: "Buying a popular sneaker brand due to peer influence without realizing it."
    },
    {
        explanation: "Innovators and early adopters are the first people to try new products.",
        example: "Tech enthusiasts who buy the latest smartphones as soon as they're launched."
    },
    {
        explanation: "A grocery store buying cereal from Kellogg's is a B2B transaction.",
        example: "The store buys in bulk to resell to consumers."
    },
    {
        explanation: "In B2B, interpersonal factors like relationships and communication strongly influence buying decisions.",
        example: "A company may prefer suppliers they trust and communicate well with, even if prices are higher."
    }
];

let midterm2Submissions = [];

function showMidterm2Test() {
    const content = document.getElementById('course-content');
    content.innerHTML = `
        <div class="quiz-wrapper">
            <h2>Midterm 2</h2>
            <div id="quiz-container">
                ${midterm2Questions.map((q, index) => `
                    <div class="quiz-question">
                        <p><strong>Question ${index + 1}:</strong> ${q.question}</p>
                        <div class="options" style="display: flex; flex-direction: column; gap: 10px;">
                            ${q.options.map(option => `
                                <button class="option-btn" style="width: 100%; text-align: left; padding: 10px;" onclick="selectMidterm2Option(this, ${index})">${option}</button>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
                <div class="nav-container">
                    <button class="nav-btn" onclick="checkAndSubmitMidterm2()">Submit Test</button>
                    <button class="nav-btn secondary" onclick="showMainMenu()">Back to Menu</button>
                </div>
            </div>
        </div>
    `;
}

function selectMidterm2Option(button, questionIndex) {
    // Get all option buttons for this question
    const questionDiv = button.closest('.quiz-question');
    const allOptions = questionDiv.querySelectorAll('.option-btn');
    
    // Remove selected class from all options in this question
    allOptions.forEach(btn => btn.classList.remove('selected'));
    
    // Add selected class to clicked button
    button.classList.add('selected');
}

function checkAndSubmitMidterm2() {
    const questions = document.querySelectorAll('.quiz-question');
    const unansweredCount = Array.from(questions).filter(q => !q.querySelector('.option-btn.selected')).length;
    
    if (unansweredCount > 0) {
        const confirmSubmit = confirm(`Warning: You have ${unansweredCount} unanswered question${unansweredCount > 1 ? 's' : ''}. Do you want to submit anyway?`);
        if (!confirmSubmit) {
            return;
        }
    }
    
    submitMidterm2();
}

function submitMidterm2() {
    // Create an array of all questions with their selected answers
    const questions = document.querySelectorAll('.quiz-question');
    let score = 0;
    const answers = [];
    
    // Go through each question
    questions.forEach((questionDiv, index) => {
        const selectedButton = questionDiv.querySelector('.option-btn.selected');
        const answer = {
            question: midterm2Questions[index].question,
            answer: selectedButton ? selectedButton.textContent : 'Not answered',
            correct: midterm2Questions[index].correct,
            isCorrect: false
        };
        
        // Check if the question was answered and if it's correct
        if (selectedButton) {
            answer.isCorrect = selectedButton.textContent === midterm2Questions[index].correct;
            if (answer.isCorrect) score++;
        }
        
        answers.push(answer);
    });

    // Store the submission
    const submission = {
        date: new Date().toLocaleString(),
        score: score,
        total: midterm2Questions.length,
        answers: answers,
        unansweredCount: answers.filter(a => a.answer === 'Not answered').length
    };

    if (!midterm2Submissions) {
        midterm2Submissions = [];
    }
    midterm2Submissions.unshift(submission);

    showMidterm2Review(0);
}

function showMidterm2Review(submissionIndex) {
    const submission = midterm2Submissions[submissionIndex];
    const content = document.getElementById('course-content');
    
    content.innerHTML = `
        <div class="quiz-wrapper">
            <h2>Midterm 2 Review</h2>
            <div class="review-progress">
                <span>Score:</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="--progress: ${(submission.score / submission.total) * 100}%"></div>
                </div>
                <span>${submission.score}/${submission.total}</span>
            </div>
            <div class="submissions-list">
                ${submission.answers.map((answer, index) => `
                    <div class="review-card ${answer.isCorrect ? 'correct' : 'incorrect'}">
                        <p><strong>Question ${index + 1}:</strong> ${answer.question}</p>
                        <p>Your answer: ${answer.answer}</p>
                        <p>Correct answer: ${answer.correct}</p>
                        ${index < midterm2Explanations.length ? `
                            <div class="flyout-menu">
                                <button class="flyout-button">View Explanation</button>
                                <div class="flyout-content">
                                    <div class="explanation-title">Explanation:</div>
                                    <div class="explanation-text">
                                        ${midterm2Explanations[index].explanation}
                                    </div>
                                    <div class="example-title">Example:</div>
                                    <div class="example-text">
                                        ${midterm2Explanations[index].example}
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
            <div class="nav-container">
                <button class="nav-btn" onclick="showMidterm2Submissions()">Back to Submissions</button>
                <button class="nav-btn secondary" onclick="showMainMenu()">Back to Menu</button>
            </div>
        </div>
    `;
}

function showMidterm2Submissions() {
    const content = document.getElementById('course-content');
    const submissions = midterm2Submissions || [];
    
    content.innerHTML = `
        <div class="quiz-wrapper">
            <h2>Midterm 2 Submissions</h2>
            ${submissions.length === 0 ? 
                '<p>No submissions yet.</p>' :
                submissions.map((sub, index) => {
                    const progress = (sub.score / sub.total) * 100;
                    return `
                        <div class="review-card">
                            <div class="review-progress">
                                <span>${sub.score}/${sub.total}</span>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${progress}%"></div>
                                </div>
                                <span>${Math.round(progress)}%</span>
                            </div>
                            <p>${sub.date}</p>
                            <button class="quiz-btn" onclick="showMidterm2Review(${index})">Review Answers</button>
                        </div>
                    `;
                }).join('')
            }
            <div class="nav-container">
                <button class="nav-btn" onclick="showMainMenu()">Back to Menu</button>
            </div>
        </div>
    `;
}

const midterm3Questions = [
    {
        question: "When marketers use online commercial databases and internet search engines to collect data, what type of data are they collecting?",
        options: [
            "Primary data",
            "Secondary data",
            "Big data",
            "Ethnographic data",
            "Internal data"
        ],
        correct: "Secondary data"
    },
    {
        question: "Shine Enterprises mass produces an all-purpose floor cleaner that is aimed at the whole market. This firm uses a(n) ________ marketing strategy.",
        options: [
            "Individual",
            "Niche",
            "Undifferentiated",
            "One-to-one",
            "Segmented"
        ],
        correct: "Undifferentiated"
    },
    {
        question: "Gilron Holidays runs a premium membership club that caters to customers whose annual salary exceeds $100,000. Members of this club are offered seasonal discounts on select luxury hotels in select cities worldwide. Gilron Holidays most likely follows a(n) ________ segmentation approach.",
        options: [
            "Income",
            "Geographic",
            "Gender",
            "Occasion",
            "Benefit"
        ],
        correct: "Income"
    },
    {
        question: "________ is the first step in the marketing research process.",
        options: [
            "Analyzing data",
            "Defining the problem and research objectives",
            "Collecting data",
            "Developing the research plan",
            "Interpreting and reporting the findings"
        ],
        correct: "Defining the problem and research objectives"
    },
    {
        question: "BMW says their cars are \"The Fastest Driving Machine.\" Ford trucks are \"Built to Last.\" Which type of differentiation do these examples represent?",
        options: [
            "Image differentiation",
            "People differentiation",
            "Services differentiation",
            "Channel differentiation",
            "Product differentiation"
        ],
        correct: "Product differentiation"
    },
    {
        question: "Huge and complex data sets generated by today's sophisticated information generation, collection, storage, and analysis technologies are referred to as ________.",
        options: [
            "Marketing research",
            "Customer insights",
            "Competitive marketing intelligence",
            "A marketing information system",
            "Big data"
        ],
        correct: "Big data"
    },
    {
        question: "Marketers who use ________ often segment their markets by consumer lifestyles and base their marketing strategies on lifestyle appeals.",
        options: [
            "Demographic segmentation",
            "Benefit segmentation",
            "Psychographic segmentation",
            "Occasion segmentation",
            "Geographic segmentation"
        ],
        correct: "Psychographic segmentation"
    },
    {
        question: "Ferrari sports cars claim superior quality, performance, and style. Ferrari provides \"perfection\" at a premium price to keep its brand image intact. Which type of value proposition does Ferrari most likely position its products with?",
        options: [
            "More for the same",
            "Less for much less",
            "More for more",
            "The same for less",
            "More for less"
        ],
        correct: "More for more"
    },
    {
        question: "An American cola-manufacturing company that primarily targets rebellious and adventurous people most likely uses ________ segmentation.",
        options: [
            "Benefit",
            "Psychographic",
            "Occasion",
            "Income",
            "Geographic"
        ],
        correct: "Psychographic"
    },
    {
        question: "When researchers select the easiest population members from which to collect information, they are using a ________ sample.",
        options: [
            "Simple random",
            "Convenience",
            "Cluster",
            "Stratified random",
            "Quota"
        ],
        correct: "Convenience"
    }
];

const midterm3Explanations = [
    {
        explanation: "Secondary data is information already collected and available (not gathered firsthand).",
        example: "A company using Google searches or industry reports to analyze competitors."
    },
    {
        explanation: "An undifferentiated strategy targets the whole market with one offer, ignoring differences.",
        example: "Selling one floor cleaner brand to everyone without customizing for different customer groups."
    },
    {
        explanation: "Income segmentation divides the market based on income levels.",
        example: "Offering luxury hotel discounts to people earning over $100,000 annually."
    },
    {
        explanation: "Research starts by defining the problem clearly to guide data collection.",
        example: "A company wants to know why sales dropped, so they first set that as their research goal."
    },
    {
        explanation: "Product differentiation focuses on unique product features or performance.",
        example: "BMW highlighting speed; Ford emphasizing durability."
    },
    {
        explanation: "Big data refers to extremely large data sets processed to find patterns and trends.",
        example: "Amazon analyzing millions of customer purchases to recommend products."
    },
    {
        explanation: "Psychographic segmentation divides the market based on lifestyles, interests, or personality.",
        example: "Targeting eco-conscious consumers with sustainable products."
    },
    {
        explanation: "More for more offers higher quality or luxury at a premium price.",
        example: "Ferrari cars cost more but promise top quality, style, and performance."
    },
    {
        explanation: "This company uses psychographic segmentation, focusing on customers' attitudes and personality.",
        example: "Advertising cola as the choice for adventurous, non-conforming people."
    },
    {
        explanation: "A convenience sample involves choosing the easiest, most accessible people for research.",
        example: "Surveying students at a nearby campus because they're easy to reach."
    }
];

let midterm3Submissions = [];

function showMidterm3Test() {
    const content = document.getElementById('course-content');
    content.innerHTML = `
        <div class="quiz-wrapper">
            <h2>Midterm 3</h2>
            <div id="quiz-container">
                ${midterm3Questions.map((q, index) => `
                    <div class="quiz-question">
                        <p><strong>Question ${index + 1}:</strong> ${q.question}</p>
                        <div class="options" style="display: flex; flex-direction: column; gap: 10px;">
                            ${q.options.map(option => `
                                <button class="option-btn" style="width: 100%; text-align: left; padding: 10px;" onclick="selectMidterm3Option(this, ${index})">${option}</button>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
                <div class="nav-container">
                    <button class="nav-btn" onclick="checkAndSubmitMidterm3()">Submit Test</button>
                    <button class="nav-btn secondary" onclick="showMainMenu()">Back to Menu</button>
                </div>
            </div>
        </div>
    `;
}

function selectMidterm3Option(button, questionIndex) {
    // Get all option buttons for this question
    const questionDiv = button.closest('.quiz-question');
    const allOptions = questionDiv.querySelectorAll('.option-btn');
    
    // Remove selected class from all options in this question
    allOptions.forEach(btn => btn.classList.remove('selected'));
    
    // Add selected class to clicked button
    button.classList.add('selected');
}

function checkAndSubmitMidterm3() {
    const questions = document.querySelectorAll('.quiz-question');
    const unansweredCount = Array.from(questions).filter(q => !q.querySelector('.option-btn.selected')).length;
    
    if (unansweredCount > 0) {
        const confirmSubmit = confirm(`Warning: You have ${unansweredCount} unanswered question${unansweredCount > 1 ? 's' : ''}. Do you want to submit anyway?`);
        if (!confirmSubmit) {
            return;
        }
    }
    
    submitMidterm3();
}

function submitMidterm3() {
    // Create an array of all questions with their selected answers
    const questions = document.querySelectorAll('.quiz-question');
    let score = 0;
    const answers = [];
    
    // Go through each question
    questions.forEach((questionDiv, index) => {
        const selectedButton = questionDiv.querySelector('.option-btn.selected');
        const answer = {
            question: midterm3Questions[index].question,
            answer: selectedButton ? selectedButton.textContent : 'Not answered',
            correct: midterm3Questions[index].correct,
            isCorrect: false
        };
        
        // Check if the question was answered and if it's correct
        if (selectedButton) {
            answer.isCorrect = selectedButton.textContent === midterm3Questions[index].correct;
            if (answer.isCorrect) score++;
        }
        
        answers.push(answer);
    });

    // Store the submission
    const submission = {
        date: new Date().toLocaleString(),
        score: score,
        total: midterm3Questions.length,
        answers: answers,
        unansweredCount: answers.filter(a => a.answer === 'Not answered').length
    };

    if (!midterm3Submissions) {
        midterm3Submissions = [];
    }
    midterm3Submissions.unshift(submission);

    showMidterm3Review(0);
}

function showMidterm3Review(submissionIndex) {
    const submission = midterm3Submissions[submissionIndex];
    const content = document.getElementById('course-content');
    
    content.innerHTML = `
        <div class="quiz-wrapper">
            <h2>Midterm 3 Review</h2>
            <div class="review-progress">
                <span>Score:</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="--progress: ${(submission.score / submission.total) * 100}%"></div>
                </div>
                <span>${submission.score}/${submission.total}</span>
            </div>
            <div class="submissions-list">
                ${submission.answers.map((answer, index) => `
                    <div class="review-card ${answer.isCorrect ? 'correct' : 'incorrect'}">
                        <p><strong>Question ${index + 1}:</strong> ${answer.question}</p>
                        <p>Your answer: ${answer.answer}</p>
                        <p>Correct answer: ${answer.correct}</p>
                        ${index < midterm3Explanations.length ? `
                            <div class="flyout-menu">
                                <button class="flyout-button">View Explanation</button>
                                <div class="flyout-content">
                                    <div class="explanation-title">Explanation:</div>
                                    <div class="explanation-text">
                                        ${midterm3Explanations[index].explanation}
                                    </div>
                                    <div class="example-title">Example:</div>
                                    <div class="example-text">
                                        ${midterm3Explanations[index].example}
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
            <div class="nav-container">
                <button class="nav-btn" onclick="showMidterm3Submissions()">Back to Submissions</button>
                <button class="nav-btn secondary" onclick="showMainMenu()">Back to Menu</button>
            </div>
        </div>
    `;
}

function showMidterm3Submissions() {
    const content = document.getElementById('course-content');
    const submissions = midterm3Submissions || [];
    
    content.innerHTML = `
        <div class="quiz-wrapper">
            <h2>Midterm 3 Submissions</h2>
            ${submissions.length === 0 ? 
                '<p>No submissions yet.</p>' :
                submissions.map((sub, index) => {
                    const progress = (sub.score / sub.total) * 100;
                    return `
                        <div class="review-card">
                            <div class="review-progress">
                                <span>${sub.score}/${sub.total}</span>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${progress}%"></div>
                                </div>
                                <span>${Math.round(progress)}%</span>
                            </div>
                            <p>${sub.date}</p>
                            <button class="quiz-btn" onclick="showMidterm3Review(${index})">Review Answers</button>
                        </div>
                    `;
                }).join('')
            }
            <div class="nav-container">
                <button class="nav-btn" onclick="showMainMenu()">Back to Menu</button>
            </div>
        </div>
    `;
}
const midterm4Questions = [
    {
        question: "Which of the following correctly lists marketing intermediaries?",
        options: [
            "Resellers, physical distribution firms, marketing services agencies, and financial intermediaries",
            "Resellers, physical distribution firms, customer markets, and competitors",
            "Resellers, physical distribution firms, marketing services agencies, and customer markets",
            "The company itself, competitors, suppliers, and customer markets",
            "Suppliers, competitors, resellers, and publics"
        ],
        correct: "Resellers, physical distribution firms, marketing services agencies, and financial intermediaries"
    },
    {
        question: "What is the best example of indirect CUSTOMERS of a company?",
        options: [
            "For delivery services, Amazon which contracts them to deliver parcels to Amazon customers",
            "For a cereal company, a child asking the mother to buy a certain brand of cereal",
            "For Uber drivers, Uber users who find and use their service through Uber app",
            "For a microchip producer, the end-users who choose laptops but not microchips inside",
            "For a retail shop, a neighboring shop that offers cheaper products"
        ],
        correct: "For a microchip producer, the end-users who choose laptops but not microchips inside"
    },
    {
        question: "Stripe is a financial tech company that provides easy payment solutions for small businesses wanting to do business online. In SWOT analysis for Stripe, (1) economic downturn and consumers not buying is a(n) ________, and Stripe having a hard-to-imitate encryption technology is a(n) ________.",
        options: [
            "Opportunity; weakness",
            "Opportunity; strength",
            "Weakness; threat",
            "Threat; opportunity",
            "Threat; strength"
        ],
        correct: "Threat; strength"
    },
    {
        question: "In the product/market expansion grid, which one best describes the market penetration strategy?",
        options: [
            "Company growth by starting/acquiring business outside the company's products and markets",
            "Company growth by identifying new markets for existing products",
            "Company growth by increasing sales of current products",
            "Company growth by offering new products to current market segments"
        ],
        correct: "Company growth by increasing sales of current products"
    },
    {
        question: "Which is NOT part of the MACRO-environment of a company?",
        options: [
            "Economic cycle",
            "Technological environments",
            "Competitive situation",
            "Political atmosphere",
            "Social context"
        ],
        correct: "Competitive situation"
    },
    {
        question: "What is true about the development of customer concepts?",
        options: [
            "Mass marketing is the best method for promoting customer loyalty.",
            "Direct marketing was invented to increase customer satisfaction.",
            "Segmenting the market is a practice enabled by Internet technology.",
            "The customer concept development was propelled by increased competition in the marketplace.",
            "The main driver of the development of the customer concept is the selling-oriented view of the companies."
        ],
        correct: "The customer concept development was propelled by increased competition in the marketplace."
    },
    {
        question: "What is the best description of the concept of \"future customers\"?",
        options: [
            "Anyone who hasn't bought our product yet",
            "Non-clients who are more likely to use our goods/services than our competitors' goods/services",
            "Current customers who will keep on buying in the future",
            "Those who will join the workforce and start earning money soon",
            "Those who create good word-of-mouth for our brand"
        ],
        correct: "Non-clients who are more likely to use our goods/services than our competitors' goods/services"
    },
    {
        question: "What is NOT included in typical definitions of marketing?",
        options: [
            "Value",
            "Relationship",
            "Customer",
            "Competitor",
            "Process"
        ],
        correct: "Competitor"
    },
    {
        question: "The primary goal of consistently delivering superior value is to ________.",
        options: [
            "Maximize profits",
            "Avoid the need to advertise",
            "Build profitable customer relationships",
            "Expand into global markets",
            "Keep costs down"
        ],
        correct: "Build profitable customer relationships"
    },
    {
        question: "What is the industry condition in which you can expect stronger future competition (high threat of future entrants)?",
        options: [
            "Where there is a high margin",
            "Where companies invest heavily in R&D",
            "When there is a strong economy of scale",
            "In a mature market",
            "When the incumbent firms have high brand loyalty"
        ],
        correct: "Where there is a high margin"
    },
    {
        question: "Which of the following uses a sense-and-respond philosophy to promote a customer-centered marketing orientation?",
        options: [
            "The production concept",
            "The marketing concept",
            "The selling concept",
            "The product concept",
            "The societal marketing concept"
        ],
        correct: "The marketing concept"
    },
    {
        question: "To create and capture customer value, companies must engage the first step of the marketing process, which is ________.",
        options: [
            "Construct an integrated marketing program",
            "Understand the marketplace and customer needs and wants",
            "Create customer delight",
            "Build profitable customer relationships",
            "Design a customer value-driven marketing strategy"
        ],
        correct: "Understand the marketplace and customer needs and wants"
    },
    {
        question: "You decided to post your travel pics to Instagram because you wanted to feel connected to your friends. Your drive to post on Instagram is a ________ and your drive to feel connected is a ________.",
        options: [
            "Want; need",
            "Demand; want",
            "Need; want",
            "Demand; need",
            "Need; demand"
        ],
        correct: "Want; need"
    },
    {
        question: "The four Ps of the marketing mix have been redefined in buyer's terms as the four As. Product design influences ________, price affects ________, place affects ________, and promotion influences ________.",
        options: [
            "Awareness; affordability; accessibility; acceptability",
            "Acceptability; affordability; accessibility; awareness",
            "Acceptability; affordability; awareness; accessibility",
            "Acceptability; affordability; awareness; accessibility",
            "Awareness; acceptability; affordability; accessibility"
        ],
        correct: "Acceptability; affordability; awareness; accessibility"
    },
    {
        question: "What are the main components of a marketing plan?",
        options: [
            "A mission statement, objectives, a business portfolio",
            "Segmentation, targeting, positioning",
            "Situation analysis, marketing strategy, implementation plan",
            "Product, price, place, promotion",
            "The marketing budget and a marketing dashboard"
        ],
        correct: "Situation analysis, marketing strategy, implementation plan"
    },
    {
        question: "What is the overall focus of strategic planning?",
        options: [
            "To design a business portfolio",
            "To maximize profits",
            "To ensure prices are lower than competitors",
            "To define the company's mission",
            "To create a game plan for long-run survival and growth in consideration of changing marketing opportunities"
        ],
        correct: "To create a game plan for long-run survival and growth in consideration of changing marketing opportunities"
    },
    {
        question: "The most important actors in the company's microenvironment are ________.",
        options: [
            "Publics",
            "Customers",
            "Suppliers",
            "The company itself",
            "Competitors"
        ],
        correct: "Customers"
    },
    {
        question: "Many companies are going beyond government regulation and are developing strategies and practices that create a world economy that the planet can support indefinitely. This represents:",
        options: [
            "Environmental sustainability",
            "Environmental marketing",
            "Sustained marketing",
            "Pollution control",
            "Green marketing"
        ],
        correct: "Environmental sustainability"
    },
    {
        question: "What are good examples of indirect competitors?",
        options: [
            "iPhone and AirPod",
            "EasyJet and Eurostar",
            "Instagram and Amazon",
            "Nintendo Switch and PlayStation 5",
            "Zara and Mango"
        ],
        correct: "EasyJet and Eurostar"
    },
    {
        question: "Which of the following correctly identifies the five core customer and marketplace concepts?",
        options: [
            "Needs; Wants; Demands; Market offerings; and Markets",
            "Needs, wants, and demands; Market offerings; Value; Satisfaction; and Markets",
            "Needs, wants, and demands; Market offerings; Value and satisfaction; Exchanges and relationships; and Markets",
            "Needs, wants, and demands; Market offerings; Value and satisfaction; Competitors; and Profits",
            "Needs, wants, and demands; Products; Value; Customers; and Competitors"
        ],
        correct: "Needs, wants, and demands; Market offerings; Value and satisfaction; Exchanges and relationships; and Markets"
    }
];

const midterm4Explanations = [
    {
        explanation: "Marketing intermediaries are companies that help deliver products to customers.",
        example: "Wholesalers, resellers, and financial firms that distribute Coca-Cola products."
    },
    {
        explanation: "Indirect customers influence purchases but don't buy directly.",
        example: "Laptop users choosing laptops while unaware of which microchip brand is inside."
    },
    {
        explanation: "Economic downturn = threat, strong encryption = strength.",
        example: "Less consumer spending hurts sales (threat), but Stripe's unique tech keeps them competitive (strength)."
    },
    {
        explanation: "Selling more of current products to existing customers.",
        example: "Starbucks encouraging current customers to buy more coffee."
    },
    {
        explanation: "Competitive situation is part of the microenvironment, not macro.",
        example: "Rival brands competing directly (micro), vs. economic shifts (macro)."
    },
    {
        explanation: "Increased competition pushed companies to focus more on satisfying customers.",
        example: "Many brands competing forces businesses to prioritize customer needs."
    },
    {
        explanation: "People likely to buy from your company in the future, more than competitors.",
        example: "Potential gym clients who prefer your location over others."
    },
    {
        explanation: "Marketing focuses on customers, value, relationships, processes—not competitors directly.",
        example: "Marketing is about delivering value to customers, not beating competitors."
    },
    {
        explanation: "Builds long-term, profitable customer relationships.",
        example: "Apple retains loyal customers by consistently delivering high value."
    },
    {
        explanation: "High-profit industries attract new competitors.",
        example: "New brands entering the profitable smartphone market."
    },
    {
        explanation: "The marketing concept focuses on understanding and responding to customer needs.",
        example: "Netflix analyzing viewer preferences to suggest shows."
    },
    {
        explanation: "Start by understanding customer needs.",
        example: "Surveying students before launching a new study app."
    },
    {
        explanation: "Posting = want, feeling connected = need.",
        example: "Posting vacation photos to feel social belonging."
    },
    {
        explanation: "Product = Acceptability, Price = Affordability, Place = Awareness, Promotion = Accessibility.",
        example: "Affordable smartphone (price), available in many stores (place), with features people want (product)."
    },
    {
        explanation: "Core elements: Product, Price, Place, Promotion.",
        example: "A brand decides what to sell, where, at what price, and how to promote."
    },
    {
        explanation: "Designing the business portfolio for long-term success.",
        example: "A company diversifying products to stay competitive over time."
    },
    {
        explanation: "Customers are central—without them, business fails.",
        example: "All marketing efforts aim to attract and retain customers."
    },
    {
        explanation: "Companies adopting eco-friendly practices beyond laws.",
        example: "IKEA using sustainable materials."
    },
    {
        explanation: "Different products meeting the same need.",
        example: "EasyJet vs. Eurostar—both provide travel options."
    },
    {
        explanation: "Needs, wants, demands; market offerings; value & satisfaction; exchanges & relationships; markets.",
        example: "Customers need transportation, want a car, demand affordable options, exchange money for it, and create a market."
    }
];

let midterm4Submissions = [];

function showMidterm4Test() {
    const content = document.getElementById('course-content');
    content.innerHTML = `
        <div class="quiz-wrapper">
            <h2>Midterm 4</h2>
            <div id="quiz-container">
                ${midterm4Questions.map((q, index) => `
                    <div class="quiz-question">
                        <p><strong>Question ${index + 1}:</strong> ${q.question}</p>
                        <div class="options" style="display: flex; flex-direction: column; gap: 10px;">
                            ${q.options.map(option => `
                                <button class="option-btn" style="width: 100%; text-align: left; padding: 10px;" onclick="selectMidterm4Option(this, ${index})">${option}</button>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
                <div class="nav-container">
                    <button class="nav-btn" onclick="checkAndSubmitMidterm4()">Submit Test</button>
                    <button class="nav-btn secondary" onclick="showMainMenu()">Back to Menu</button>
                </div>
            </div>
        </div>
    `;
}

function selectMidterm4Option(button, questionIndex) {
    // Get all option buttons for this question
    const questionDiv = button.closest('.quiz-question');
    const allOptions = questionDiv.querySelectorAll('.option-btn');
    
    // Remove selected class from all options in this question
    allOptions.forEach(btn => btn.classList.remove('selected'));
    
    // Add selected class to clicked button
    button.classList.add('selected');
}

function checkAndSubmitMidterm4() {
    const questions = document.querySelectorAll('.quiz-question');
    const unansweredCount = Array.from(questions).filter(q => !q.querySelector('.option-btn.selected')).length;
    
    if (unansweredCount > 0) {
        const confirmSubmit = confirm(`Warning: You have ${unansweredCount} unanswered question${unansweredCount > 1 ? 's' : ''}. Do you want to submit anyway?`);
        if (!confirmSubmit) {
            return;
        }
    }
    
    submitMidterm4();
}

function submitMidterm4() {
    // Create an array of all questions with their selected answers
    const questions = document.querySelectorAll('.quiz-question');
    let score = 0;
    const answers = [];
    
    // Go through each question
    questions.forEach((questionDiv, index) => {
        const selectedButton = questionDiv.querySelector('.option-btn.selected');
        const answer = {
            question: midterm4Questions[index].question,
            answer: selectedButton ? selectedButton.textContent : 'Not answered',
            correct: midterm4Questions[index].correct,
            isCorrect: false
        };
        
        // Check if the question was answered and if it's correct
        if (selectedButton) {
            answer.isCorrect = selectedButton.textContent === midterm4Questions[index].correct;
            if (answer.isCorrect) score++;
        }
        
        answers.push(answer);
    });

    // Store the submission
    const submission = {
        date: new Date().toLocaleString(),
        score: score,
        total: midterm4Questions.length,
        answers: answers,
        unansweredCount: answers.filter(a => a.answer === 'Not answered').length
    };

    if (!midterm4Submissions) {
        midterm4Submissions = [];
    }
    midterm4Submissions.unshift(submission);

    showMidterm4Review(0);
}

function showMidterm4Review(submissionIndex) {
    const submission = midterm4Submissions[submissionIndex];
    const content = document.getElementById('course-content');
    
    content.innerHTML = `
        <div class="quiz-wrapper">
            <h2>Midterm 4 Review</h2>
            <div class="review-progress">
                <span>Score:</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="--progress: ${(submission.score / submission.total) * 100}%"></div>
                </div>
                <span>${submission.score}/${submission.total}</span>
            </div>
            <div class="submissions-list">
                ${submission.answers.map((answer, index) => `
                    <div class="review-card ${answer.isCorrect ? 'correct' : 'incorrect'}">
                        <p><strong>Question ${index + 1}:</strong> ${answer.question}</p>
                        <p>Your answer: ${answer.answer}</p>
                        <p>Correct answer: ${answer.correct}</p>
                        ${index < midterm4Explanations.length ? `
                            <div class="flyout-menu">
                                <button class="flyout-button">View Explanation</button>
                                <div class="flyout-content">
                                    <div class="explanation-title">Explanation:</div>
                                    <div class="explanation-text">
                                        ${midterm4Explanations[index].explanation}
                                    </div>
                                    <div class="example-title">Example:</div>
                                    <div class="example-text">
                                        ${midterm4Explanations[index].example}
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
            <div class="nav-container">
                <button class="nav-btn" onclick="showMidterm4Submissions()">Back to Submissions</button>
                <button class="nav-btn secondary" onclick="showMainMenu()">Back to Menu</button>
            </div>
        </div>
    `;
}

function showMidterm4Submissions() {
    const content = document.getElementById('course-content');
    const submissions = midterm4Submissions || [];
    
    content.innerHTML = `
        <div class="quiz-wrapper">
            <h2>Midterm 4 Submissions</h2>
            ${submissions.length === 0 ? 
                '<p>No submissions yet.</p>' :
                submissions.map((sub, index) => {
                    const progress = (sub.score / sub.total) * 100;
                    return `
                        <div class="review-card">
                            <div class="review-progress">
                                <span>${sub.score}/${sub.total}</span>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${progress}%"></div>
                                </div>
                                <span>${Math.round(progress)}%</span>
                            </div>
                            <p>${sub.date}</p>
                            <button class="quiz-btn" onclick="showMidterm4Review(${index})">Review Answers</button>
                        </div>
                    `;
                }).join('')
            }
            <div class="nav-container">
                <button class="nav-btn" onclick="showMainMenu()">Back to Menu</button>
            </div>
        </div>
    `;
}

const final1Questions = [
    {
        question: "The buying decision process starts with ________, in which the buyer spots a problem.",
        options: [
            "Buyer's remorse",
            "Impulse purchases",
            "Alternative evaluation",
            "Information search",
            "Need recognition"
        ],
        correct: "Need recognition"
    },
    {
        question: "According to Maslow's hierarchy of needs, which of the following is the LEAST urgent need?",
        options: [
            "Social needs",
            "Self-actualization needs",
            "Physiological needs",
            "Safety needs",
            "Esteem needs"
        ],
        correct: "Self-actualization needs"
    },
    {
        question: "________ refers to the measurement of brain activity to learn how consumers feel and respond.",
        options: [
            "Sampling",
            "Biometrics",
            "Psychographics",
            "Demographics",
            "Neuromarketing"
        ],
        correct: "Neuromarketing"
    },
    {
        question: "Sam has been directed to study the demographic, economic, political, and cultural forces that affect an organization. In this instance, Sam has been directed to study the ________ of the organization.",
        options: [
            "Internal environment",
            "Marketing mix",
            "Marketing intermediaries",
            "Micro-environment",
            "Macro-environment"
        ],
        correct: "Macro-environment"
    },
    {
        question: "Vista Outdoor Apparel, known for high-performance outdoor clothing, faces competition from cheaper brands while recognizing a growing market in eco-friendly products. Based on the SWOT Analysis, which strategy should Vista Outdoor Apparel pursue to best leverage its strengths and opportunities?",
        options: [
            "Increase marketing efforts to strengthen brand loyalty among current customers by launching a loyalty program",
            "Launch an eco-friendly product line to capitalize on market trends and improve brand image",
            "Reduce production costs by outsourcing to compete on price with new entrants",
            "Maintain focus on existing product lines to avoid risks and investments associated with new initiatives",
            "Disregard the eco-friendly trend and concentrate on traditional product strengths"
        ],
        correct: "Launch an eco-friendly product line to capitalize on market trends and improve brand image"
    },
    {
        question: "Logistics firm, UPS, doesn't just deliver packages for its business customers, it partners with them to provide a full range of logistics solutions that help sharpen their logistics strategies, cut costs, and serve customers better. This is called:",
        options: [
            "Straight Rebuy",
            "Modified Rebuy",
            "New Task Situation",
            "Systems selling",
            "Wholesaler"
        ],
        correct: "Systems selling"
    },
    {
        question: "The full mix of benefits on which a brand is differentiated and positioned is known as the brand's ________.",
        options: [
            "Supply chain",
            "Value stream",
            "Demand chain",
            "Service life",
            "Value proposition"
        ],
        correct: "Value proposition"
    },
    {
        question: "Juana looked at the September issue of her favorite fashion magazine and did not find anything particularly interesting despite the fact that the magazine had several advertisements targeted at her demographic. The only thing that interested her was an article about an upcoming fashion show. Which consumer behavior is being illustrated in this instance?",
        options: [
            "Selective attention",
            "Subliminal advertising",
            "Consumer ethnocentrism",
            "Social loafing",
            "Groupthink"
        ],
        correct: "Selective attention"
    },
    {
        question: "The marketing department of a reputed firm wants to improve strategic decision-making, track the actions of other players in the market, and provide early warning of opportunities and threats. Which of the following would help the firm achieve its objectives?",
        options: [
            "Ethnographic research",
            "Customer relationship management",
            "Competitive marketing intelligence",
            "Strategic planning",
            "Data warehousing"
        ],
        correct: "Competitive marketing intelligence"
    },
    {
        question: "A wedding services company changes its marketing strategy to reflect the fact that more LGBTQ marriages are taking place. The company is offering a broader range of ceremonies that cater to this market. Which of the following environments must this wedding company analyze?",
        options: [
            "Economic",
            "Technological",
            "Political",
            "Natural",
            "Cultural"
        ],
        correct: "Cultural"
    },
    {
        question: "Which of the following is the first stage in the new product adoption process?",
        options: [
            "Adoption",
            "Trial",
            "Evaluation",
            "Interest",
            "Awareness"
        ],
        correct: "Awareness"
    },
    {
        question: "Sarah Thomas wants to improve future sales of the company's products, so she has decided to collect customer opinions and feedback. She is looking for a highly flexible contact method that can be used to gather large amounts of data within the least possible time. Which of the following contact methods is most likely to hold the highest appeal for Sarah?",
        options: [
            "Telephone interviews",
            "Mail questionnaires",
            "In-depth interviews",
            "Online surveys",
            "Individual interviews"
        ],
        correct: "Online surveys"
    },
    {
        question: "A ________ is a need that is sufficiently pressing to direct a person to seek satisfaction.",
        options: [
            "Culture",
            "Stimulus",
            "Tradition",
            "Perception",
            "Motive"
        ],
        correct: "Motive"
    },
    {
        question: "Through ________ differentiation, brands can be differentiated on features, performance, or style and design.",
        options: [
            "Channel",
            "Price",
            "Services",
            "People",
            "Product"
        ],
        correct: "Product"
    },
    {
        question: "According to the customers relationship groups matrix, the term \"butterflies\" refers to:",
        options: [
            "Short-term loyalty/low profitability customers",
            "Long-term loyalty/high profitability customers",
            "Short-term loyalty/high profitability customers",
            "Short-term loyalty/low growth customers",
            "Long-term loyalty/high growth customers"
        ],
        correct: "Short-term loyalty/high profitability customers"
    },
    {
        question: "In the Business Buying process, when the Buyer reorders something without making any modification to the order, this is called:",
        options: [
            "Straight Rebuy",
            "Modified Rebuy",
            "New Task Situation",
            "Systems selling",
            "Changing supplier"
        ],
        correct: "Straight Rebuy"
    },
    {
        question: "Jason Perkins has the informal power to approve the final suppliers in his organization. In other words, Jason plays the role of a(n) ________ in his organization's buying center.",
        options: [
            "Influencer",
            "Gatekeeper",
            "User",
            "Decider",
            "Buyer"
        ],
        correct: "Decider"
    },
    {
        question: "Which of the following is true with regard to the \"same for less\" value proposition?",
        options: [
            "The same for less value proposition is mostly offered by marketers who sell higher-quality upscale products or services.",
            "Discount stores and \"category killers\" rarely use the same for less value proposition.",
            "The same for less value proposition cannot generate profits.",
            "Offering the same for less can be a powerful value proposition because everyone likes a good deal.",
            "The same for less positioning involves meeting consumers' lower performance or quality requirements at a much lower price."
        ],
        correct: "Offering the same for less can be a powerful value proposition because everyone likes a good deal"
    },
    {
        question: "Which of the following is a valid source of secondary data?",
        options: [
            "Conducting a focus-group",
            "Conducting interviews",
            "Observing consumers",
            "Developing a research survey",
            "Analyzing data collected by an external agency"
        ],
        correct: "Analyzing data collected by an external agency"
    },
    {
        question: "The marketing team of 7 Star Inc., a company manufacturing smartphones, is currently studying the size, density, location, age, and occupation of its target market. Which of the following environments is being studied in this scenario?",
        options: [
            "Technological environment",
            "Economic environment",
            "Political environment",
            "Cultural environment",
            "Demographic environment"
        ],
        correct: "Demographic environment"
    },
    {
        question: "The research plan should be presented in a written proposal. The proposal should include all of the following EXCEPT:",
        options: [
            "Research objectives",
            "Estimated research costs",
            "The results that will help management's decision-making",
            "The predicted results",
            "The information to be obtained"
        ],
        correct: "The predicted results"
    },
    {
        question: "What is the purpose of a customer relationship management (CRM) in marketing?",
        options: [
            "Managing supply chain logistics",
            "To analyze production efficiency",
            "To build and maintain profitable long-term relationships with customers and other stakeholders",
            "To measure primarily advertising ROI",
            "To communicate internally with employees"
        ],
        correct: "To build and maintain profitable long-term relationships with customers and other stakeholders"
    },
    {
        question: "In a coastal town, tourists seek fresh seafood dishes and tropical drinks during their stay. Although food and drink fulfill basic human needs, tourists' specific preferences for these items are influenced by the local culture and their personal tastes. These preferences are examples of ________.",
        options: [
            "Demands",
            "Exchanges",
            "Values",
            "Necessities",
            "Wants"
        ],
        correct: "Wants"
    },
    {
        question: "Tigers Inc., a manufacturer of sports merchandise, is gathering customer opinions about the firm's new sports shoe line. A team of researchers in the company invited eight regular customers to talk about the new line of shoes, asking why they chose to buy the shoe and what they disliked most about its design. A moderator was present to monitor the discussion. Which of the following types of contact methods is Tigers using?",
        options: [
            "Individual interviewing",
            "Mall intercept",
            "Mass survey",
            "E-mail questionnaire",
            "Focus Groups"
        ],
        correct: "Focus Groups"
    },
    {
        question: "What is the main function of a mission statement in strategic planning?",
        options: [
            "Define short-term financial objectives",
            "To establish annual sales goals",
            "Describe the fundamental purpose of the organization",
            "Detail human resources policies",
            "Specify the production techniques used"
        ],
        correct: "Describe the fundamental purpose of the organization"
    },
    {
        question: "Mark has long supported a particular brand of footwear and has always bought that brand. Recently, the brand was embroiled in a controversy for using child labor at its manufacturing plants. Mark doubts the news reports and continues to purchase the same brand of footwear. It is most accurate to say that Mark displays ________.",
        options: [
            "Cognitive dissonance",
            "Selective retention",
            "Consumer ethnocentrism",
            "Selective attention",
            "Selective distortion"
        ],
        correct: "Selective distortion"
    },
    {
        question: "Dan has been directed to study the forces close to a company that affects its ability to serve its customers, such as the company, suppliers, marketing intermediaries, customer markets, competitors, and the publics. In this instance, Dan has been directed to study the ________ of the company.",
        options: [
            "Macro-environment",
            "Micro-environment",
            "Demographic environment",
            "Political environment",
            "Technological environment"
        ],
        correct: "Micro-environment"
    },
    {
        question: "Which of the following are characteristics of the Business buying process?",
        options: [
            "Centered on logic and characteristics",
            "Few clients and a large purchasing volume",
            "Very educated relationship",
            "Make large-scale sales",
            "All are correct"
        ],
        correct: "All are correct"
    },
    {
        question: "Which of the following is NOT part of the business market?",
        options: [
            "Airmark sells a 3D printing machine to a manufacturer of plastic storage containers.",
            "A firm buys laptops from Dell for company salespeople to use when traveling.",
            "Kruger Group sells interior security systems to resorts.",
            "A country club buys safety equipment for its swimming pool.",
            "Sue shops for her family's groceries at the local Whole Foods store"
        ],
        correct: "Sue shops for her family's groceries at the local Whole Foods store"
    },
    {
        question: "A beverage company has introduced a new product line using biodegradable packaging and sources its ingredients from fair-trade certified farms. What type of marketing approach is the company employing?",
        options: [
            "Evangelism marketing",
            "Database marketing",
            "Ambush marketing",
            "Affinity marketing",
            "Sustainable marketing"
        ],
        correct: "Sustainable marketing"
    },
    {
        question: "After the purchase of a product, consumers will be either satisfied or dissatisfied and engage in ________.",
        options: [
            "Alternative evaluation",
            "Information searches",
            "Consumer ethnocentrism",
            "Consumer capitalism",
            "Postpurchase behavior"
        ],
        correct: "Postpurchase behavior"
    },
    {
        question: "Many companies use virtual card payment in their stores, which exemplifies the ________ environment in business.",
        options: [
            "Political",
            "Demographic",
            "Natural",
            "Technological",
            "Economic"
        ],
        correct: "Technological"
    },
    {
        question: "QuickTech, a tech startup, is known for its innovative software solutions, which they sell in Europe. Which of the following do you consider a strength of this company?",
        options: [
            "Their external developments in Artificial Intelligence",
            "Their leadership in innovation",
            "The intense competition in this market",
            "The potential expansion to international markets",
            "The growth of the Global Economy"
        ],
        correct: "Their leadership in innovation"
    },
    {
        question: "A(n) ________ is a segment of the population selected for marketing research to represent the population as a whole.",
        options: [
            "Secondary group",
            "Primary group",
            "Focus group",
            "Sample",
            "Immersion group"
        ],
        correct: "Sample"
    },
    {
        question: "Which of the following is an example of a focus group?",
        options: [
            "Asking consumers to fill out an online survey about a product",
            "Observing consumers as they interact with a product",
            "Gaining insights through one-to-one communications",
            "Using smart digital and mechanical sensors to monitor consumer behavior",
            "Have a small group of consumers meet with a moderator to discuss a product/topic"
        ],
        correct: "Have a small group of consumers meet with a moderator to discuss a product/topic"
    },
    {
        question: "Carrie tends to purchase various brands of bath soap. She has never been loyal to a specific brand; instead, she does a lot of brand switching. Carrie exhibits ________.",
        options: [
            "Habitual buying behavior",
            "Variety-seeking buying behavior",
            "Conspicuous consumption behavior",
            "Dissonance-reducing buying behavior",
            "Complex buying behavior"
        ],
        correct: "Variety-seeking buying behavior"
    },
    {
        question: "Which term describes delivering superior value and building strong customer relationships to capture customer value in return?",
        options: [
            "Selling orientation",
            "Marketing concept",
            "Production concept",
            "Sales Funnel",
            "Customer Relationship Management (CRM)"
        ],
        correct: "Marketing concept"
    },
    {
        question: "In the framework of the 5C Analysis, the 5 C's stand for:",
        options: [
            "Customer, Collaborators, Context, Competitors, and Communication",
            "Customer, Collaborators, Content, Competitors, and Company",
            "Cooperation, Collaborators, Context, Competitors, and Company",
            "Customer, Communication, Content, Competitors, and Company",
            "Customer, Collaborators, Context, Competitors, and Company"
        ],
        correct: "Customer, Collaborators, Context, Competitors, and Company"
    },
    {
        question: "Deluxe Windows, a company specializing in high-end custom window solutions, is working on its marketing plan. When proposing the marketing mix, the company now needs to define the 4Ps. Therefore, they will focus on:",
        options: [
            "Product, People, Promotion, and Packaging",
            "Packaging, Publicity, Product, and Pricing",
            "Product, Pricing, Promotion, and Placement/Distribution",
            "Planning, Pricing, Product, Promotion",
            "Public evidence, People, Product, and Pricing"
        ],
        correct: "Product, Pricing, Promotion, and Placement/Distribution"
    },
    {
        question: "Globex Electronics evaluates its \"TimeTracker\" smartwatch line using the BCG Matrix. Despite high market growth, the product holds a low market share compared to competitors. How should Globex categorize \"TimeTracker\" and what strategy should they pursue?",
        options: [
            "Cash Cow – Decrease investment in \"TimeTracker\" as it generates significant cash with little need for further support",
            "Star – Invest heavily in \"TimeTracker\" to capitalize on its high growth and work towards gaining a higher market share",
            "Question Mark – Identify whether \"TimeTracker\" has the potential to gain market share given its high growth, and consider increased investment",
            "Dog – Divest or phase out \"TimeTracker\" due to its low market share and high resource consumption",
            "Star – Reduce investment as it already dominates a high-growth market"
        ],
        correct: "Question Mark – Identify whether \"TimeTracker\" has the potential to gain market share given its high growth, and consider increased investment"
    },
    {
        question: "AutoDrive, a company specializing in traditional automotive parts in Europe, seeks to diversify by applying the Product/Marketing expansion grid (Ansoff Matrix) methodology. What would be the best step to take?",
        options: [
            "Acquire a small manufacturer of Electrical Vehicles in China to gain immediate market presence",
            "Launch in their market a series of electric vehicle parts compatible with existing models",
            "Develop current products for Chinese manufacturers",
            "Partner with other spare parts manufacturers",
            "Introduce their traditional automotive parts in the U.S"
        ],
        correct: "Acquire a small manufacturer of Electrical Vehicles in China to gain immediate market presence"
    },
    {
        question: "Individuals and households that buy or acquire goods and services for personal consumption make up the ________.",
        options: [
            "Subculture",
            "Consumer market",
            "Social class",
            "Market mix",
            "Market offering"
        ],
        correct: "Consumer market"
    },
    {
        question: "Which of the following examples best illustrates the 'Market Development' strategy as per the Product / Market Expansion Grid (Ansoff Matrix)?",
        options: [
            "A clothing retailer introduces a new line of eco-friendly fabrics to its existing store",
            "A coffee shop chain opens new outlets in a country where they have never operated",
            "A smartphone company launches a new model with enhanced camera features to attract photography enthusiasts",
            "A software company that is specialized in accounting programs develops an entirely new type of project management tool intended for architects",
            "A toy manufacturer adds a new color variant to its best-selling range of action figures"
        ],
        correct: "A coffee shop chain opens new outlets in a country where they have never operated"
    },
    {
        question: "What is the primary focus of strategic planning at Bright Solutions, a company specializing in renewable energy solutions, that is tasked with increasing market share in newly targeted regions?",
        options: [
            "Defining long-term objectives and overall growth direction, such as global market expansion",
            "Purchasing promotional materials",
            "Determining pricing strategies",
            "Improving short-term operational efficiencies",
            "Focusing on immediate product launches and advertising campaigns"
        ],
        correct: "Defining long-term objectives and overall growth direction, such as global market expansion"
    },
    {
        question: "OceanView Resorts is a chain of luxury seaside hotels. Which of the following statements from OceanView Resorts is most likely to be an objective for the upcoming year?",
        options: [
            "We aim to improve guest satisfaction by updating room decor and amenities",
            "We should consider expanding our brand to coastal cities in Asia",
            "We want to increase overall profitability by 15% compared to last year",
            "We need to think about training our staff to be more guest-oriented",
            "Our goal is to explore potential partnerships with international tour operators"
        ],
        correct: "We want to increase overall profitability by 15% compared to last year"
    },
    {
        question: "The microenvironment consists of all of the following EXCEPT __________.",
        options: [
            "Suppliers",
            "Publics",
            "Competitors",
            "Customers",
            "Demographics"
        ],
        correct: "Demographics"
    },
    {
        question: "Bateman's, an office supply chain store, had the best product selection, the best service, and the lowest prices compared to other office supply chain stores. As a result, Bateman's captured a significant chunk of the market in the short run. Which of the following positioning strategies did Bateman's most likely use?",
        options: [
            "More for less",
            "More for more",
            "Same for less",
            "Less for much less",
            "More for the same"
        ],
        correct: "More for less"
    },
    {
        question: "What is the correct sequence of steps in the Marketing Process to create and deliver value?",
        options: [
            "Conducting market research to gather insights → designing the product → setting up distribution channels → determining pricing strategies",
            "Focusing on product design → creating advertising campaigns → driving sales → providing post-sale customer service",
            "Understanding customer needs and wants → designing a customer value-driven marketing strategy → constructing an integrated marketing mix → engaging customers and building profitable relationships",
            "Identifying the needs of the target audience → producing the product → ensuring its availability in the market → setting a price that matches market demand",
            "Researching customer needs → developing a marketing strategy → implementing the marketing mix → monitoring and adjusting strategies based on feedback"
        ],
        correct: "Understanding customer needs and wants → designing a customer value-driven marketing strategy → constructing an integrated marketing mix → engaging customers and building profitable relationships"
    },
    {
        question: "The Jay Group hires better employees than its competition by conducting effective searches, multi-tiered interviews, and providing high-quality training to its employees, an aspect often neglected by competitors. The Jay Group is applying which type of differentiation?",
        options: [
            "Services differentiation",
            "Image differentiation",
            "Product differentiation",
            "People differentiation",
            "Channel differentiation"
        ],
        correct: "People differentiation"
    }
];

const final1Explanations = [
    {
        explanation: "The process begins when a consumer realizes they have a need or problem.",
        example: "Noticing your phone battery doesn't last long anymore, so you decide to look for a new phone."
    },
    {
        explanation: "Self-actualization (personal growth, fulfillment) is only pursued after basic needs like safety and food are met.",
        example: "After securing a job and stable life, someone pursues their dream of writing a novel."
    },
    {
        explanation: "It uses brain scans to study how customers react to marketing materials.",
        example: "Testing which advertisement makes people more excited by scanning their brainwaves."
    },
    {
        explanation: "Macro-environment includes broad external factors like demographics and culture that affect the company.",
        example: "Studying how rising environmental concerns influence customer buying behavior."
    },
    {
        explanation: "This strategy uses the company's strengths (brand reputation) and opportunities (eco-friendly trend).",
        example: "Releasing jackets made from recycled fabrics to attract eco-conscious customers."
    },
    {
        explanation: "Systems selling offers complete packages, not just individual products.",
        example: "UPS managing shipping, warehousing, and returns for a business, not just delivering parcels."
    },
    {
        explanation: "It is the promise of unique benefits to customers.",
        example: "Tesla's value proposition: luxury electric cars with cutting-edge technology."
    },
    {
        explanation: "Consumers focus only on information that interests them and ignore the rest.",
        example: "Skipping ads in a magazine but reading an article about a favorite celebrity."
    },
    {
        explanation: "It involves gathering data on market players to improve decisions.",
        example: "Monitoring competitors' price changes to adjust your own pricing strategy."
    },
    {
        explanation: "Culture shapes people's preferences, values, and buying behavior.",
        example: "Offering ceremonies specifically designed for LGBTQ couples reflects cultural trends."
    },
    {
        explanation: "Customers first learn about the product before considering buying it.",
        example: "Seeing a new smartwatch advertised on social media."
    },
    {
        explanation: "Online surveys allow reaching many customers fast and are easy to manage.",
        example: "Sending a survey link by email to collect feedback from recent buyers."
    },
    {
        explanation: "A motive drives action to satisfy a need.",
        example: "Feeling thirsty and deciding to buy a bottle of water."
    },
    {
        explanation: "Product differentiation helps a brand stand out by offering unique features or design.",
        example: "Apple differentiates its iPhones through sleek design and exclusive features like Face ID."
    },
    {
        explanation: "Butterflies are profitable but don't stay loyal long-term.",
        example: "Tourists who spend heavily at luxury stores but don't return regularly."
    },
    {
        explanation: "Straight rebuy means repeating a purchase without changes.",
        example: "A hotel regularly reordering the same brand of cleaning supplies."
    },
    {
        explanation: "The decider has authority to make final purchasing decisions.",
        example: "A purchasing manager selecting which supplier the company will use."
    },
    {
        explanation: "Companies offer similar quality products at lower prices to attract customers.",
        example: "Walmart sells well-known brands at discounted prices."
    },
    {
        explanation: "Secondary data is information collected by others, not firsthand.",
        example: "Using government census data to study demographics."
    },
    {
        explanation: "Demographics involve measurable population statistics.",
        example: "A smartphone company analyzing age groups that prefer premium models."
    },
    {
        explanation: "Research proposals outline objectives, costs, and methods, but can't predict exact results.",
        example: "A survey plan detailing questions, budget, and target respondents, but not assuming answers."
    },
    {
        explanation: "CRM helps manage customer interactions to boost loyalty and profits.",
        example: "Starbucks' rewards program encouraging repeat purchases."
    },
    {
        explanation: "Wants are shaped by culture and personal preferences.",
        example: "Tourists wanting coconut drinks because they're popular in beach resorts."
    },
    {
        explanation: "Focus groups involve small, guided discussions to get feedback.",
        example: "8 customers sharing opinions on a new sports shoe design."
    },
    {
        explanation: "A mission statement outlines why a company exists.",
        example: "Nike's mission: 'To bring inspiration and innovation to every athlete.'"
    },
    {
        explanation: "Selective distortion is interpreting information to fit beliefs.",
        example: "Ignoring news about unethical practices by a brand you like."
    },
    {
        explanation: "Micro-environment includes factors like suppliers and competitors.",
        example: "Analyzing how a new competitor affects sales."
    },
    {
        explanation: "Business buyers are rational, purchase in bulk, and value strong relationships.",
        example: "A car manufacturer buying thousands of tires after detailed negotiations."
    },
    {
        explanation: "Business markets involve purchases for resale or production, not personal use.",
        example: "A restaurant buying vegetables from a wholesaler is business; Sue buying groceries is not."
    },
    {
        explanation: "Sustainable marketing focuses on eco-friendly and ethical practices.",
        example: "A tea company using compostable tea bags and sourcing from certified organic farms."
    },
    {
        explanation: "This is how customers feel or act after buying, like satisfaction or regret.",
        example: "Writing a positive online review after loving a product."
    },
    {
        explanation: "Technology impacts how businesses operate and serve customers.",
        example: "Apple Pay allowing contactless payment."
    },
    {
        explanation: "Innovation gives a company a competitive advantage.",
        example: "Being first to market with AI-driven software."
    },
    {
        explanation: "Researchers study samples to draw conclusions.",
        example: "Surveying 500 customers to predict overall satisfaction levels."
    },
    {
        explanation: "It's used to gather opinions and insights.",
        example: "Customers discussing a new shoe design in a focus group session."
    },
    {
        explanation: "She tries new brands instead of sticking to one.",
        example: "Buying different soap brands each month."
    },
    {
        explanation: "Focuses on satisfying customers to drive business success.",
        example: "Amazon offering fast delivery and easy returns."
    },
    {
        explanation: "It's a framework to analyze key factors affecting a business.",
        example: "A clothing brand analyzing its suppliers, customers, and competitors."
    },
    {
        explanation: "These are the 4Ps used to market products effectively.",
        example: "Setting competitive prices and distributing through select showrooms."
    },
    {
        explanation: "It has high market growth but low market share, needing strategic decisions.",
        example: "Investing in marketing to grow smartwatch sales."
    },
    {
        explanation: "This is diversification under Ansoff Matrix strategy.",
        example: "Buying a local electric car company to enter the Chinese market."
    },
    {
        explanation: "Includes people buying goods for themselves.",
        example: "A family buying groceries."
    },
    {
        explanation: "Selling existing products in new markets.",
        example: "Starbucks entering a new country."
    },
    {
        explanation: "Strategic planning sets growth directions.",
        example: "Setting goals to expand renewable energy products worldwide."
    },
    {
        explanation: "This is a measurable business objective.",
        example: "Launching new packages to boost sales."
    },
    {
        explanation: "Microenvironment includes close actors like customers and suppliers.",
        example: "Studying competitors but not general population trends."
    },
    {
        explanation: "Offering high value at lower cost.",
        example: "Costco's bulk products at discounted prices."
    },
    {
        explanation: "Starts with knowing customers, ends with relationship building.",
        example: "Conducting research, making the product, promoting, and retaining customers."
    },
    {
        explanation: "People differentiation focuses on service quality through staff.",
        example: "A hotel known for its excellent, friendly staff."
    }
];

let final1Submissions = [];

function showFinal1Test() {
    const content = document.getElementById('course-content');
    content.innerHTML = `
        <div class="quiz-wrapper">
            <h2>Final 1</h2>
            <div id="quiz-container">
                ${final1Questions.map((q, index) => `
                    <div class="quiz-question">
                        <p><strong>Question ${index + 1}:</strong> ${q.question}</p>
                        <div class="options" style="display: flex; flex-direction: column; gap: 10px;">
                            ${q.options.map(option => `
                                <button class="option-btn" style="width: 100%; text-align: left; padding: 10px;" onclick="selectFinal1Option(this, ${index})">${option}</button>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
                <div class="nav-container">
                    <button class="nav-btn" onclick="checkAndSubmitFinal1()">Submit Test</button>
                    <button class="nav-btn secondary" onclick="showMainMenu()">Back to Menu</button>
                </div>
            </div>
        </div>
    `;
}

function selectFinal1Option(button, questionIndex) {
    // Get all option buttons for this question
    const questionDiv = button.closest('.quiz-question');
    const allOptions = questionDiv.querySelectorAll('.option-btn');
    
    // Remove selected class from all options in this question
    allOptions.forEach(btn => btn.classList.remove('selected'));
    
    // Add selected class to clicked button
    button.classList.add('selected');
}

function checkAndSubmitFinal1() {
    const questions = document.querySelectorAll('.quiz-question');
    const unansweredCount = Array.from(questions).filter(q => !q.querySelector('.option-btn.selected')).length;
    
    if (unansweredCount > 0) {
        const confirmSubmit = confirm(`Warning: You have ${unansweredCount} unanswered question${unansweredCount > 1 ? 's' : ''}. Do you want to submit anyway?`);
        if (!confirmSubmit) {
            return;
        }
    }
    
    submitFinal1();
}

function submitFinal1() {
    // Create an array of all questions with their selected answers
    const questions = document.querySelectorAll('.quiz-question');
    let score = 0;
    const answers = [];
    
    // Go through each question
    questions.forEach((questionDiv, index) => {
        const selectedButton = questionDiv.querySelector('.option-btn.selected');
        const answer = {
            question: final1Questions[index].question,
            answer: selectedButton ? selectedButton.textContent : 'Not answered',
            correct: final1Questions[index].correct,
            isCorrect: false
        };
        
        // Check if the question was answered and if it's correct
        if (selectedButton) {
            answer.isCorrect = selectedButton.textContent === final1Questions[index].correct;
            if (answer.isCorrect) score++;
        }
        
        answers.push(answer);
    });

    // Store the submission
    const submission = {
        date: new Date().toLocaleString(),
        score: score,
        total: final1Questions.length,
        answers: answers,
        unansweredCount: answers.filter(a => a.answer === 'Not answered').length
    };

    if (!final1Submissions) {
        final1Submissions = [];
    }
    final1Submissions.unshift(submission);

    showFinal1Review(0);
}

function showFinal1Review(submissionIndex) {
    const submission = final1Submissions[submissionIndex];
    const content = document.getElementById('course-content');
    
    content.innerHTML = `
        <div class="quiz-wrapper">
            <h2>Final 1 Review</h2>
            <div class="review-progress">
                <span>Score:</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="--progress: ${(submission.score / submission.total) * 100}%"></div>
                </div>
                <span>${submission.score}/${submission.total}</span>
            </div>
            <div class="submissions-list">
                ${submission.answers.map((answer, index) => `
                    <div class="review-card ${answer.isCorrect ? 'correct' : 'incorrect'}">
                        <p><strong>Question ${index + 1}:</strong> ${answer.question}</p>
                        <p>Your answer: ${answer.answer}</p>
                        <p>Correct answer: ${answer.correct}</p>
                        ${index < final1Explanations.length ? `
                            <div class="flyout-menu">
                                <button class="flyout-button">View Explanation</button>
                                <div class="flyout-content">
                                    <div class="explanation-title">Explanation:</div>
                                    <div class="explanation-text">
                                        ${final1Explanations[index].explanation}
                                    </div>
                                    <div class="example-title">Example:</div>
                                    <div class="example-text">
                                        ${final1Explanations[index].example}
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
            <div class="nav-container">
                <button class="nav-btn" onclick="showFinal1Submissions()">Back to Submissions</button>
                <button class="nav-btn secondary" onclick="showMainMenu()">Back to Menu</button>
            </div>
        </div>
    `;
}

function showFinal1Submissions() {
    const content = document.getElementById('course-content');
    const submissions = final1Submissions || [];
    
    content.innerHTML = `
        <div class="quiz-wrapper">
            <h2>Final 1 Submissions</h2>
            ${submissions.length === 0 ? 
                '<p>No submissions yet.</p>' :
                submissions.map((sub, index) => {
                    const progress = (sub.score / sub.total) * 100;
                    return `
                        <div class="review-card">
                            <div class="review-progress">
                                <span>${sub.score}/${sub.total}</span>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${progress}%"></div>
                                </div>
                                <span>${Math.round(progress)}%</span>
                            </div>
                            <p>${sub.date}</p>
                            <button class="quiz-btn" onclick="showFinal1Review(${index})">Review Answers</button>
                        </div>
                    `;
                }).join('')
            }
            <div class="nav-container">
                <button class="nav-btn" onclick="showMainMenu()">Back to Menu</button>
            </div>
        </div>
    `;
}
