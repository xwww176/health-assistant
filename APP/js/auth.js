document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // 模拟用户数据库
    let users = JSON.parse(localStorage.getItem('healthAppUsers')) || [];
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // 验证用户
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                // 保存当前用户会话
                sessionStorage.setItem('currentUser', JSON.stringify(user));
                // 跳转到主页面
                window.location.href = 'index.html';
            } else {
                alert('邮箱或密码不正确！');
            }
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const newUser = {
                id: Date.now().toString(),
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                age: document.getElementById('age').value,
                weight: document.getElementById('weight').value,
                height: document.getElementById('height').value,
                goal: document.getElementById('goal').value
            };
            
            // 检查邮箱是否已注册
            if (users.some(u => u.email === newUser.email)) {
                alert('该邮箱已被注册！');
                return;
            }
            
            // 添加到用户数据库
            users.push(newUser);
            localStorage.setItem('healthAppUsers', JSON.stringify(users));
            
            // 自动登录并跳转
            sessionStorage.setItem('currentUser', JSON.stringify(newUser));
            window.location.href = 'index.html';
        });
    }
    
    // 检查是否已登录（用于index.html）
    if (window.location.pathname.includes('index.html')) {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser) {
            window.location.href = 'login.html';
        }
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // 用户数据库
    let users = JSON.parse(localStorage.getItem('healthAppUsers')) || [];
    
    // 登录功能
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            
            // 验证用户
            const user = users.find(u => u.email === email);
            
            if (user) {
                if (user.password === password) {
                    // 保存当前用户会话
                    sessionStorage.setItem('currentUser', JSON.stringify(user));
                    // 跳转到主页面
                    window.location.href = 'index.html';
                } else {
                    showError('password', '密码不正确');
                }
            } else {
                showError('email', '该邮箱未注册');
            }
        });
    }
    
    // 注册功能
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 获取表单数据
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const age = parseInt(document.getElementById('age').value);
            const height = parseInt(document.getElementById('height').value);
            const weight = parseFloat(document.getElementById('weight').value);
            const goal = document.getElementById('goal').value;
            
            // 验证表单
            if (!validateRegistration(email, password, confirmPassword)) {
                return;
            }
            
            // 创建新用户
            const newUser = {
                id: Date.now().toString(),
                name,
                email,
                password,
                age,
                height,
                weight,
                goal,
                registeredAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            };
            
            // 添加到用户数据库
            users.push(newUser);
            localStorage.setItem('healthAppUsers', JSON.stringify(users));
            
            // 自动登录并跳转
            sessionStorage.setItem('currentUser', JSON.stringify(newUser));
            window.location.href = 'index.html';
        });
    }
    
    // 检查是否已登录
    if (window.location.pathname.includes('index.html')) {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser) {
            window.location.href = 'login.html';
        }
    }
    
    // 表单验证函数
    function validateRegistration(email, password, confirmPassword) {
        let isValid = true;
        
        // 验证邮箱
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showError('email', '请输入有效的邮箱地址');
            isValid = false;
        } else if (users.some(u => u.email === email)) {
            showError('email', '该邮箱已被注册');
            isValid = false;
        } else {
            clearError('email');
        }
        
        // 验证密码
        if (password.length < 6) {
            showError('password', '密码长度至少为6位');
            isValid = false;
        } else {
            clearError('password');
        }
        
        // 验证确认密码
        if (password !== confirmPassword) {
            showError('confirm-password', '两次输入的密码不一致');
            isValid = false;
        } else {
            clearError('confirm-password');
        }
        
        return isValid;
    }
    
    function showError(fieldId, message) {
        const errorElement = document.getElementById(`${fieldId}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }
    
    function clearError(fieldId) {
        const errorElement = document.getElementById(`${fieldId}-error`);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }
});