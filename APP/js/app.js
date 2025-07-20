// 主应用类
class FitnessApp {
    constructor() {
        this.healthData = {
            steps: 0,
            caloriesBurned: 0,
            waterIntake: 0,
            sleep: 0,
            weight: 0,
            exercises: [],
            foodEntries: [],
            workoutHistory: [],
            achievements: []
        };
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupNavigation();
        this.setupDataUpdates();
        this.setupWorkoutSection();
        this.setupNutritionSection();
        this.setupProgressChart();
        this.setupWorkoutTracking();
        
        // 检查是否有训练计划，如果没有则显示用户画像表单
        const savedPlan = localStorage.getItem('workoutPlan');
        if (!savedPlan) {
            document.getElementById('user-profile').classList.remove('hidden');
        } else {
            this.renderWorkoutPlan(JSON.parse(savedPlan));
        }
    }

    loadData() {
        const savedData = localStorage.getItem('healthAppData');
        if (savedData) {
            this.healthData = {...this.healthData, ...JSON.parse(savedData)};
        }
        
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (currentUser) {
            if (currentUser.weight) this.healthData.weight = currentUser.weight;
            if (currentUser.height) this.calculateBMI();
        }
        
        this.updateDashboard();
    }

    saveData() {
        localStorage.setItem('healthAppData', JSON.stringify(this.healthData));
    }

    updateDashboard() {
        document.getElementById('steps').textContent = this.healthData.steps.toLocaleString();
        document.getElementById('calories').textContent = this.healthData.caloriesBurned;
        document.getElementById('water').textContent = `${this.healthData.waterIntake} ml`;
        document.getElementById('sleep').textContent = `${this.healthData.sleep} 小时`;
        document.getElementById('weight').textContent = `${this.healthData.weight} kg`;
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('nav a');
        const sections = document.querySelectorAll('main section');
        
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                
                sections.forEach(section => {
                    section.classList.add('hidden');
                });
                
                document.getElementById(targetId).classList.remove('hidden');
            });
        });
    }

    setupDataUpdates() {
        document.querySelectorAll('.update-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.getAttribute('data-target');
                this.openModal(target);
            });
        });
        
        document.querySelectorAll('.water-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const amount = parseInt(btn.getAttribute('data-amount'));
                this.healthData.waterIntake += amount;
                this.updateDashboard();
                this.saveData();
            });
        });
        
        document.querySelector('.close-modal').addEventListener('click', () => this.closeModal());
        
        document.getElementById('data-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const target = e.target.getAttribute('data-target');
            const value = parseFloat(document.getElementById('modal-input').value);
            
            if (!isNaN(value)) {
                if (target === 'steps') {
                    this.healthData.steps = value;
                } else if (target === 'sleep') {
                    this.healthData.sleep = value;
                } else if (target === 'weight') {
                    this.healthData.weight = value;
                    this.calculateBMI();
                }
                
                this.updateDashboard();
                this.saveData();
                this.closeModal();
            }
        });
    }

    openModal(target) {
        const modal = document.getElementById('modal');
        const title = document.getElementById('modal-title');
        const label = document.getElementById('modal-label');
        const form = document.getElementById('data-form');
        
        form.setAttribute('data-target', target);
        
        if (target === 'steps') {
            title.textContent = '更新步数';
            label.textContent = '今日步数:';
        } else if (target === 'sleep') {
            title.textContent = '记录睡眠';
            label.textContent = '睡眠时间(小时):';
        } else if (target === 'weight') {
            title.textContent = '记录体重';
            label.textContent = '体重(kg):';
        }
        
        modal.classList.remove('hidden');
    }

    closeModal() {
        document.getElementById('modal').classList.add('hidden');
    }

    calculateBMI() {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (currentUser && currentUser.height && this.healthData.weight) {
            const heightInMeters = currentUser.height / 100;
            const bmi = (this.healthData.weight / (heightInMeters * heightInMeters)).toFixed(1);
            document.getElementById('bmi').textContent = bmi;
        }
    }

    setupWorkoutSection() {
        this.renderExerciseList();
        this.setupWorkoutPlans();
        this.setupExerciseForm();
        this.setupTimer();
        
        // 用户画像表单提交
        document.getElementById('profile-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const userData = {
                age: parseInt(document.getElementById('age').value),
                height: parseInt(document.getElementById('height').value),
                weight: parseFloat(document.getElementById('weight').value),
                goal: document.getElementById('goal').value,
                equipment: Array.from(document.querySelectorAll('input[name="equipment"]:checked')).map(el => el.value)
            };
            
            // 保存用户数据
            const currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || {};
            sessionStorage.setItem('currentUser', JSON.stringify({...currentUser, ...userData}));
            
            // 生成训练计划
            const workoutPlan = this.generateWorkoutPlan(userData);
            localStorage.setItem('workoutPlan', JSON.stringify(workoutPlan));
            localStorage.setItem('planStartDate', new Date().toISOString());
            
            // 显示训练计划
            this.renderWorkoutPlan(workoutPlan);
            document.getElementById('user-profile').classList.add('hidden');
            document.getElementById('workout-plan-view').classList.remove('hidden');
        });
    }

    generateWorkoutPlan(userData) {
        const { goal, equipment } = userData;
        const exerciseLibrary = {
            beginner: [
                { name: "深蹲", gif: "squat.gif", description: "双脚与肩同宽，下蹲时膝盖不超过脚尖" },
                { name: "跪姿俯卧撑", gif: "knee_pushup.gif", description: "核心收紧，身体保持直线" },
                { name: "平板支撑", gif: "plank.gif", description: "肘部在肩膀正下方，臀部不要抬高" }
            ],
            hiit: [
                { name: "开合跳", gif: "jumping_jacks.gif", description: "跳跃时手脚协调，落地轻柔" },
                { name: "高抬腿", gif: "high_knees.gif", description: "快速交替抬腿，保持核心稳定" },
                { name: "波比跳", gif: "burpee.gif", description: "俯卧撑后立即跳起，动作连贯" }
            ],
            strength: [
                { name: "哑铃弯举", gif: "dumbbell_curl.gif", description: "肘部固定，仅前臂移动" },
                { name: "弹力带划船", gif: "band_row.gif", description: "背部发力，肩胛骨收紧" }
            ]
        };
        
        let plan = [];
        
        // 简单规则引擎生成计划
        if (goal === "weightloss") {
            // 减脂计划以HIIT为主
            for (let i = 1; i <= 14; i++) {
                plan.push({
                    day: i,
                    type: "hiit",
                    exercises: this.getRandomExercises(exerciseLibrary.hiit, 3),
                    duration: 20
                });
            }
        } else if (goal === "musclegain") {
            // 增肌计划以力量训练为主
            for (let i = 1; i <= 14; i++) {
                plan.push({
                    day: i,
                    type: "strength",
                    exercises: this.getRandomExercises(exerciseLibrary.strength, equipment.includes("none") ? 2 : 4),
                    duration: 30
                });
            }
        } else {
            // 塑形计划混合训练
            for (let i = 1; i <= 14; i++) {
                const type = i % 2 === 0 ? "hiit" : "strength";
                plan.push({
                    day: i,
                    type,
                    exercises: this.getRandomExercises(exerciseLibrary[type], 3),
                    duration: type === "hiit" ? 20 : 25
                });
            }
        }
        
        return plan;
    }

    getRandomExercises(exercises, count) {
        const selected = [];
        const availableExercises = [...exercises];
        
        while (selected.length < count && availableExercises.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableExercises.length);
            selected.push(availableExercises[randomIndex]);
            availableExercises.splice(randomIndex, 1);
        }
        
        return selected;
    }

    renderWorkoutPlan(plan) {
        const calendarEl = document.getElementById('workout-calendar');
        calendarEl.innerHTML = '';
        
        plan.forEach(day => {
            const dayEl = document.createElement('div');
            dayEl.className = 'day-card';
            dayEl.innerHTML = `
                <h4>第${day.day}天</h4>
                <p>${day.type === 'hiit' ? 'HIIT训练' : '力量训练'}</p>
                <p>${day.duration}分钟</p>
            `;
            
            dayEl.addEventListener('click', () => this.showDayDetails(day));
            calendarEl.appendChild(dayEl);
        });
    }

    showDayDetails(day) {
        const detailsEl = document.getElementById('exercise-details');
        detailsEl.innerHTML = `
            <h3>第${day.day}天训练内容</h3>
            <p>类型: ${day.type === 'hiit' ? 'HIIT训练' : '力量训练'}</p>
            <p>时长: ${day.duration}分钟</p>
            <h4>包含动作:</h4>
            <div class="exercise-list"></div>
        `;
        
        const exerciseListEl = detailsEl.querySelector('.exercise-list');
        day.exercises.forEach(ex => {
            const exEl = document.createElement('div');
            exEl.className = 'exercise-item';
            exEl.innerHTML = `
                <h5>${ex.name}</h5>
                <p>${ex.description}</p>
            `;
            exerciseListEl.appendChild(exEl);
        });
    }

    setupWorkoutPlans() {
        const workoutPlanSelect = document.getElementById('workout-plan');
        
        workoutPlanSelect.addEventListener('change', () => {
            const plan = workoutPlanSelect.value;
            
            if (plan === 'beginner') {
                this.healthData.exercises = [
                    { name: '深蹲', sets: 3, reps: 12 },
                    { name: '俯卧撑(膝盖着地)', sets: 3, reps: 8 },
                    { name: '平板支撑', duration: 30 }
                ];
            } else if (plan === 'weightloss') {
                this.healthData.exercises = [
                    { name: '开合跳', duration: 60 },
                    { name: '高抬腿', duration: 60 },
                    { name: '波比跳', sets: 3, reps: 10 },
                    { name: '登山跑', duration: 45 }
                ];
            } else if (plan === 'strength') {
                this.healthData.exercises = [
                    { name: '深蹲', sets: 4, reps: 8 },
                    { name: '俯卧撑', sets: 4, reps: 8 },
                    { name: '弓步', sets: 3, reps: 10 },
                    { name: '引体向上', sets: 3, reps: 5 }
                ];
            } else {
                this.healthData.exercises = [];
            }
            
            this.renderExerciseList();
        });
    }

    setupExerciseForm() {
        const exerciseForm = document.getElementById('exercise-form');
        const exerciseTypeRadios = document.querySelectorAll('input[name="exercise-type"]');
        const repsField = document.getElementById('exercise-reps-field');
        const timeField = document.getElementById('exercise-time-field');
        
        exerciseTypeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'reps') {
                    repsField.classList.remove('hidden');
                    timeField.classList.add('hidden');
                } else {
                    repsField.classList.add('hidden');
                    timeField.classList.remove('hidden');
                }
            });
        });
        
        exerciseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('exercise-name').value.trim();
            const type = document.querySelector('input[name="exercise-type"]:checked').value;
            
            if (name) {
                if (type === 'reps') {
                    const sets = parseInt(document.getElementById('exercise-sets').value) || 3;
                    const reps = parseInt(document.getElementById('exercise-reps').value) || 10;
                    this.healthData.exercises.push({ name, sets, reps });
                } else {
                    const duration = parseInt(document.getElementById('exercise-duration').value) || 30;
                    this.healthData.exercises.push({ name, duration });
                }
                
                this.renderExerciseList();
                exerciseForm.reset();
                repsField.classList.remove('hidden');
                timeField.classList.add('hidden');
            }
        });
    }

    renderExerciseList() {
        const exerciseList = document.getElementById('exercise-list');
        exerciseList.innerHTML = '';
        
        this.healthData.exercises.forEach(exercise => {
            const exerciseItem = document.createElement('div');
            exerciseItem.className = 'exercise-item';
            
            if (exercise.duration) {
                exerciseItem.innerHTML = `
                    <h4>${exercise.name}</h4>
                    <p>持续时间: ${exercise.duration}秒</p>
                `;
            } else {
                exerciseItem.innerHTML = `
                    <h4>${exercise.name}</h4>
                    <p>${exercise.sets}组 × ${exercise.reps}次</p>
                `;
            }
            
            exerciseList.appendChild(exerciseItem);
        });
    }

    setupTimer() {
        const startBtn = document.getElementById('start-workout');
        const pauseBtn = document.getElementById('pause-timer');
        const stopBtn = document.getElementById('stop-timer');
        const timerDisplay = document.querySelector('.timer-display');
        const timerContainer = document.getElementById('workout-timer');
        const currentExerciseDisplay = document.getElementById('current-exercise');
        
        let timer;
        let seconds = 0;
        let isPaused = false;
        let currentExerciseIndex = 0;
        
        startBtn.addEventListener('click', () => {
            if (this.healthData.exercises.length === 0) {
                alert('请先添加练习或选择锻炼计划！');
                return;
            }
            
            seconds = 0;
            currentExerciseIndex = 0;
            this.startTimer();
            this.updateCurrentExercise();
            timerContainer.classList.remove('hidden');
        });
        
        pauseBtn.addEventListener('click', () => {
            if (isPaused) {
                this.startTimer();
                pauseBtn.textContent = '暂停';
            } else {
                clearInterval(timer);
                pauseBtn.textContent = '继续';
            }
            isPaused = !isPaused;
        });
        
        stopBtn.addEventListener('click', () => {
            clearInterval(timer);
            timerContainer.classList.add('hidden');
            this.recordWorkout();
        });
    }

    startTimer() {
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.seconds++;
            this.updateTimerDisplay();
            
            const currentExercise = this.healthData.exercises[this.currentExerciseIndex];
            if (currentExercise.duration && this.seconds >= currentExercise.duration) {
                this.nextExercise();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const mins = Math.floor(this.seconds / 60);
        const secs = this.seconds % 60;
        document.querySelector('.timer-display').textContent = 
            `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    updateCurrentExercise() {
        const exercise = this.healthData.exercises[this.currentExerciseIndex];
        if (exercise.duration) {
            document.getElementById('current-exercise').textContent = 
                `${exercise.name} - ${exercise.duration}秒`;
        } else {
            document.getElementById('current-exercise').textContent = 
                `${exercise.name} - ${exercise.sets}组 × ${exercise.reps}次`;
        }
    }

    nextExercise() {
        this.currentExerciseIndex++;
        if (this.currentExerciseIndex < this.healthData.exercises.length) {
            this.seconds = 0;
            this.updateCurrentExercise();
        } else {
            clearInterval(this.timer);
            document.getElementById('current-exercise').textContent = '锻炼完成！';
        }
    }

    recordWorkout() {
        const caloriesBurned = Math.floor(this.seconds / 60 * 8);
        this.healthData.caloriesBurned += caloriesBurned;
        this.updateDashboard();
        
        this.healthData.workoutHistory.push({
            date: new Date(),
            duration: this.seconds,
            exercises: this.healthData.exercises,
            caloriesBurned: caloriesBurned
        });
        
        this.saveData();
    }

    setupWorkoutTracking() {
        document.getElementById('check-in-btn')?.addEventListener('click', () => {
            const today = new Date().toISOString().split('T')[0];
            const existingLog = this.healthData.workoutHistory.find(
                log => new Date(log.date).toISOString().split('T')[0] === today
            );
            
            if (existingLog) {
                alert('今天已经打卡过了！');
                return;
            }
            
            const currentPlan = JSON.parse(localStorage.getItem('workoutPlan'));
            const todayPlan = currentPlan?.find(day => day.day === this.getCurrentDay());
            
            if (todayPlan) {
                const caloriesBurned = this.calculateCaloriesBurned(todayPlan);
                
                this.healthData.workoutHistory.push({
                    date: new Date(),
                    duration: todayPlan.duration * 60,
                    exercises: todayPlan.exercises,
                    caloriesBurned: caloriesBurned
                });
                
                this.healthData.caloriesBurned += caloriesBurned;
                this.updateDashboard();
                this.saveData();
                this.updateProgressChart();
                this.checkAchievements();
                alert('打卡成功！');
            }
        });
    }

    getCurrentDay() {
        const startDate = localStorage.getItem('planStartDate');
        if (!startDate) return 1;
        
        const diffDays = Math.floor((new Date() - new Date(startDate)) / (1000 * 60 * 60 * 24));
        return Math.min(diffDays + 1, 14);
    }

    calculateCaloriesBurned(workout) {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || {};
        const weight = currentUser.weight || 60;
        const met = workout.type === 'hiit' ? 8 : 6;
        return Math.round(weight * met * (workout.duration / 60));
    }

    checkAchievements() {
        const consecutiveDays = this.getConsecutiveDays();
        
        if (consecutiveDays >= 3 && !this.healthData.achievements.includes('beginner')) {
            this.healthData.achievements.push('beginner');
            this.showAchievement('健身小白');
        }
        
        if (consecutiveDays >= 7 && !this.healthData.achievements.includes('dedicated')) {
            this.healthData.achievements.push('dedicated');
            this.showAchievement('自律达人');
        }
        
        this.saveData();
    }

    getConsecutiveDays() {
        if (this.healthData.workoutHistory.length === 0) return 0;
        
        const sortedLogs = [...this.healthData.workoutHistory].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        let consecutiveDays = 0;
        let currentDate = new Date();
        
        for (const log of sortedLogs) {
            const logDate = new Date(log.date);
            if (logDate.toDateString() === currentDate.toDateString()) {
                continue; // 同一天多次训练只计一次
            }
            
            const diffDays = Math.floor((currentDate - logDate) / (1000 * 60 * 60 * 24));
            if (diffDays > 1) break;
            
            consecutiveDays++;
            currentDate = logDate;
        }
        
        return consecutiveDays;
    }

    showAchievement(title) {
        const achievementEl = document.createElement('div');
        achievementEl.className = 'achievement-popup';
        achievementEl.innerHTML = `
            <h3>成就解锁!</h3>
            <p>${title}</p>
        `;
        document.body.appendChild(achievementEl);
        
        setTimeout(() => {
            achievementEl.remove();
        }, 3000);
    }

    setupNutritionSection() {
        document.getElementById('food-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const foodName = document.getElementById('food-input').value.trim();
            const calories = parseInt(document.getElementById('calorie-input').value);
            
            if (foodName && !isNaN(calories)) {
                this.healthData.foodEntries.push({
                    name: foodName,
                    calories: calories,
                    date: new Date()
                });
                
                this.renderFoodList();
                document.getElementById('food-input').value = '';
                document.getElementById('calorie-input').value = '';
                this.saveData();
            }
        });
        
        this.renderFoodList();
    }

    renderFoodList() {
        const foodList = document.getElementById('food-list');
        foodList.innerHTML = '';
        
        this.healthData.foodEntries.forEach(entry => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${entry.name}</span>
                <span>${entry.calories} 卡路里</span>
            `;
            foodList.appendChild(li);
        });
    }

    setupProgressChart() {
        this.updateProgressChart();
        
        document.getElementById('progress-metric').addEventListener('change', () => {
            this.updateProgressChart();
        });
        
        document.getElementById('progress-period').addEventListener('change', () => {
            this.updateProgressChart();
        });
    }

    updateProgressChart() {
        const ctx = document.getElementById('progress-chart').getContext('2d');
        const metric = document.getElementById('progress-metric').value;
        const period = parseInt(document.getElementById('progress-period').value) || 7;
        
        const { labels, data } = this.getChartData(metric, period);
        
        if (this.progressChart) {
            this.progressChart.destroy();
        }
        
        this.progressChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: this.getMetricLabel(metric),
                    data: data,
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                    borderColor: 'rgba(76, 175, 80, 1)',
                    borderWidth: 2,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: metric !== 'weight'
                    }
                }
            }
        });
        
        this.renderWorkoutHistory();
    }

    getChartData(metric, days) {
        const labels = [];
        const data = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString().slice(5));
            
            // 在实际应用中，这里应该从健康数据中获取真实值
            // 这里使用模拟数据
            if (metric === 'steps') {
                data.push(Math.floor(Math.random() * 2000) + 4000);
            } else if (metric === 'weight') {
                const currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || {};
                const baseWeight = currentUser.weight || 65;
                data.push(baseWeight - i * 0.1);
            } else if (metric === 'caloriesBurned') {
                const hasWorkout = this.healthData.workoutHistory.some(log => {
                    const logDate = new Date(log.date).toDateString();
                    return logDate === date.toDateString();
                });
                data.push(hasWorkout ? Math.floor(Math.random() * 200) + 300 : 0);
            } else if (metric === 'waterIntake') {
                data.push(Math.floor(Math.random() * 500) + 1500);
            } else if (metric === 'workouts') {
                const count = this.healthData.workoutHistory.filter(log => {
                    const logDate = new Date(log.date).toDateString();
                    return logDate === date.toDateString();
                }).length;
                data.push(count);
            }
        }
        
        return { labels, data };
    }

    getMetricLabel(metric) {
        const labels = {
            steps: '每日步数',
            weight: '体重 (kg)',
            caloriesBurned: '消耗卡路里',
            waterIntake: '饮水量 (ml)',
            workouts: '锻炼次数'
        };
        return labels[metric] || metric;
    }

    renderWorkoutHistory() {
        const historyList = document.getElementById('workout-history');
        historyList.innerHTML = '';
        
        if (this.healthData.workoutHistory.length === 0) {
            historyList.innerHTML = '<li>暂无锻炼历史记录</li>';
            return;
        }
        
        const sortedHistory = [...this.healthData.workoutHistory].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        sortedHistory.forEach(workout => {
            const li = document.createElement('li');
            const date = new Date(workout.date);
            
            li.innerHTML = `
                <div class="workout-date">${date.toLocaleDateString()} ${date.toLocaleTimeString().slice(0, 5)}</div>
                <div class="workout-duration">${Math.floor(workout.duration / 60)}分钟 - ${workout.caloriesBurned}卡路里</div>
                <div class="workout-exercises">
                    ${workout.exercises.map(ex => 
                        ex.duration ? `${ex.name} (${ex.duration}秒)` : `${ex.name} (${ex.sets}×${ex.reps})`
                    ).join(', ')}
                </div>
            `;
            
            historyList.appendChild(li);
        });
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    // 检查是否已登录
    if (window.location.pathname.includes('index.html')) {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }
    }
    
    new FitnessApp();
});
