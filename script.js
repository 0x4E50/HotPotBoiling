document.addEventListener('DOMContentLoaded', function () {
    const timerArea = document.getElementById('timer-area');
    const ingredientList = document.getElementById('ingredient-list');
    const historyList = document.getElementById('history-list');
    const resetButton = document.getElementById('reset-button');

    // 从 localStorage 加载数据
    let timers = JSON.parse(localStorage.getItem('timers')) || [];
    let history = JSON.parse(localStorage.getItem('history')) || [];

    // 初始化页面
    renderHistory();
    timers.forEach(timer => {
        // 检查是否已经存在相同的计时器
        if (!document.getElementById(timer.id)) {
            const remainingTime = calculateRemainingTime(timer.startTime, timer.duration);
            if (remainingTime > 0) {
                addTimer(timer.name, remainingTime, timer.startTime, timer.id);
            } else {
                updateHistory(timer.name, 'cooked');
            }
        }
    });

    // 食材点击事件
    ingredientList.addEventListener('click', function (event) {
        if (event.target.tagName === 'LI') {
            const ingredientName = event.target.textContent;
            const cookingTime = parseInt(event.target.getAttribute('data-time'), 10);
            addTimer(ingredientName, cookingTime);
        }
    });

    // 添加计时器
    function addTimer(name, time, startTime = Date.now(), timerId = `timer-${Date.now()}`) {
        const timerElement = document.createElement('div');
        timerElement.id = timerId;
        timerElement.className = 'timer';
        timerElement.innerHTML = `
            <span>${name} - ${time}秒</span>
            <button onclick="removeTimer('${timerId}')">移除</button>
        `;
        timerArea.appendChild(timerElement);

        // 保存计时器数据
        timers.push({ id: timerId, name, duration: time, startTime });
        saveTimers();

        startCountdown(timerId, time, name, startTime);
    }

    // 开始倒计时
    function startCountdown(timerId, time, name, startTime) {
        const timerElement = document.getElementById(timerId);
        let remainingTime = time;

        const interval = setInterval(() => {
            remainingTime--;
            timerElement.querySelector('span').textContent = `${name} - ${remainingTime}秒`;

            // 倒计时结束
            if (remainingTime <= 0) {
                clearInterval(interval);
                timerElement.style.backgroundColor = '#e74c3c';
                timerElement.classList.add('finished');
                const button = timerElement.querySelector('button');
                button.textContent = '煮好';

                // 点击按钮完成烹饪
                button.onclick = () => finishCooking(timerId, name);

                // 点击整个计时器区域完成烹饪
                timerElement.addEventListener('click', function handleTimerClick() {
                    finishCooking(timerId, name);
                    timerElement.removeEventListener('click', handleTimerClick);
                });
            }
        }, 1000);
    }

    // 完成烹饪
    function finishCooking(timerId, name) {
        removeTimer(timerId);
        updateHistory(name, 'cooked');
    }

    // 移除计时器
    window.removeTimer = function (timerId, name) {
        const timerElement = document.getElementById(timerId);
        if (timerElement) {
            timerElement.remove();
            timers = timers.filter(timer => timer.id !== timerId);
            saveTimers();
            if (name) {
                updateHistory(name, 'removed');
            }
        }
    };

    // 更新历史记录
    function updateHistory(name, type) {
        const existingRecord = history.find(record => record.name === name && record.type === type);

        if (existingRecord) {
            existingRecord.count++;
        } else {
            history.push({ name, type, count: 1 });
        }

        saveHistory();
        renderHistory();
    }

    // 渲染历史记录
    function renderHistory() {
        historyList.innerHTML = history
            .map(record => `
                <li>
                    <span>${record.name} (${record.type === 'cooked' ? '煮好' : '移除'} x${record.count})</span>
                    <button onclick="reCook('${record.name}')">再来一份</button>
                </li>
            `)
            .join('');
    }

    // 保存计时器数据
    function saveTimers() {
        localStorage.setItem('timers', JSON.stringify(timers));
    }

    // 保存历史记录数据
    function saveHistory() {
        localStorage.setItem('history', JSON.stringify(history));
    }

    // 计算剩余时间
    function calculateRemainingTime(startTime, duration) {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        return Math.max(duration - elapsedTime, 0);
    }

    // 重新开始
    resetButton.addEventListener('click', function () {
        timers = [];
        history = [];
        localStorage.clear();
        timerArea.innerHTML = '';
        historyList.innerHTML = '';
    });

    // 再来一份
    window.reCook = function (name) {
        // 找到所有食材列表项
        const ingredients = document.querySelectorAll('#ingredient-list li');
        let cookingTime = null;

        // 遍历食材列表，找到匹配的食材
        ingredients.forEach(ingredient => {
            if (ingredient.textContent === name) {
                cookingTime = parseInt(ingredient.getAttribute('data-time'), 10);
            }
        });

        // 如果找到匹配的食材，重新添加计时器
        if (cookingTime !== null) {
            addTimer(name, cookingTime);
        } else {
            console.error(`未找到食材: ${name}`);
        }
    };
});
