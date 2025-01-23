document.addEventListener('DOMContentLoaded', function () {
    const timerArea = document.getElementById('timer-area');
    const ingredientList = document.getElementById('ingredient-list');
    const historyList = document.getElementById('history-list');

    // 历史记录数据
    let history = [];

    // 食材点击事件
    ingredientList.addEventListener('click', function (event) {
        if (event.target.tagName === 'LI') {
            const ingredientName = event.target.textContent;
            const cookingTime = parseInt(event.target.getAttribute('data-time'), 10);
            addTimer(ingredientName, cookingTime);
        }
    });

    // 添加计时器
    function addTimer(name, time) {
        const timerId = `timer-${Date.now()}`;
        const timerElement = document.createElement('div');
        timerElement.id = timerId;
        timerElement.className = 'timer';
        timerElement.innerHTML = `
            <span>${name} - ${time}秒</span>
            <button onclick="removeTimer('${timerId}')">移除</button>
        `;
        timerArea.appendChild(timerElement);

        startCountdown(timerId, time, name);
    }

    // 开始倒计时
    function startCountdown(timerId, time, name) {
        const timerElement = document.getElementById(timerId);
        let remainingTime = time;

        const interval = setInterval(() => {
            remainingTime--;
            timerElement.querySelector('span').textContent = `${name} - ${remainingTime}秒`;

            // 倒计时结束
            if (remainingTime <= 0) {
                clearInterval(interval);
                timerElement.style.backgroundColor = '#e74c3c'; // 背景变红
                timerElement.querySelector('button').textContent = '煮好'; // 按钮文字改为“煮好”
                timerElement.querySelector('button').onclick = () => finishCooking(timerId, name); // 点击“煮好”后完成烹饪
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