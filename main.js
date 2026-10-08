// 1. استدعاء العناصر الأساسية من الواجهة
const taskInput = document.getElementById('txt');
const saveButton = document.getElementById('btn-src');
const counterSpan = document.querySelector('.counttask');
const tasksContainer = document.getElementById('tasks-container');

// 2. دالة لتحديث العداد العلوي وتفعيل أنيميشن الارتداد، مع ميزة الإخفاء التلقائي
function updateCounter() {
    // حساب العناصر التي لم تأخذ كلاس الحذف والـ fall بعد
    const totalTasks = tasksContainer.querySelectorAll('.contact:not(.fall)').length;
    counterSpan.textContent = totalTasks;
    
    // التعديل الجديد: إذا كان عدد المهام 0 قم بإخفاء العداد، وإلا قم بإظهاره
    if (totalTasks === 0) {
        counterSpan.style.display = 'none';
    } else {
        counterSpan.style.display = 'inline-block'; // إظهاره مجدداً عند إضافة مهمة
    }
    
    // تشغيل أنيميشن التكبير السريع للعداد عن طريق إضافة وإزالة كلاس الـ pop
    if (totalTasks > 0) {
        counterSpan.classList.add('pop');
        setTimeout(() => {
            counterSpan.classList.remove('pop');
        }, 150);
    }
}

// 3. دالة لحفظ مصفوفة المهام داخل الـ Local Storage للمتصفح
function saveTasksToLocalStorage() {
    const tasksArray = [];
    const taskElements = tasksContainer.querySelectorAll('.contact:not(.fall)');

    taskElements.forEach(taskEl => {
        const text = taskEl.querySelector('.write').textContent;
        const isCompleted = taskEl.querySelector('.task-checkbox').checked;
        
        // حفظ النص مع حالة الـ Checkbox الحالية للمهمة
        tasksArray.push({ text: text, completed: isCompleted });
    });

    localStorage.setItem('myTasks', JSON.stringify(tasksArray));
}

// 4. الدالة الأساسية لإنشاء وإضافة مهمة جديدة ديناميكياً مع تفعيل الحركات والتفاعلات
function createDynamicTask(text, isCompleted = false) {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'contact';

    // بناء هيكل المهمة الداخلي مع الحفاظ التام على تسمياتك الأصلية
    taskDiv.innerHTML = `
        <div class="allcontact">
            <input type="checkbox" class="task-checkbox" ${isCompleted ? 'checked' : ''}>
            <div class="write" style="${isCompleted ? 'text-decoration: line-through; opacity: 0.5;' : ''}">${text}</div>
        </div>
        <button id="btn">X</button>
    `;

    tasksContainer.appendChild(taskDiv);
    updateCounter();

    // أ: برمجة زر الحذف (X) والانتظار حتى انتهاء أنيميشن الخروج
    const deleteBtn = taskDiv.querySelector('#btn');
    deleteBtn.addEventListener('click', function() {
        taskDiv.classList.add('fall'); // تشغيل تأثير الحذف البصري من الـ CSS أولاً
        
        // تحديث العداد وتحديث الذاكرة فوراً لتبدو الحركة متزامنة ولحظية للمستخدم
        updateCounter();
        saveTasksToLocalStorage();

        // حذف العنصر تماماً من شجرة الـ DOM بعد انتهاء الحركة البصرية
        taskDiv.addEventListener('animationend', function() {
            taskDiv.remove();
        });
    });

    // ب: برمجة الـ Checkbox وتأثير تمرير الخط عند إنهاء المهام
    const checkbox = taskDiv.querySelector('.task-checkbox');
    const writeDiv = taskDiv.querySelector('.write');

    checkbox.addEventListener('change', function() {
        if (checkbox.checked) {
            writeDiv.style.textDecoration = "line-through";
            writeDiv.style.opacity = "0.5";
        } else {
            writeDiv.style.textDecoration = "none";
            writeDiv.style.opacity = "1";
        }
        saveTasksToLocalStorage(); // تحديث حالة الإنجاز في ذاكرة المتصفح
    });
}

// 5. دالة لقراءة واسترجاع المهام المحفوظة بمجرد فتح الصفحة أو عمل ريفريش
function loadTasksFromLocalStorage() {
    const savedTasks = localStorage.getItem('myTasks');
    
    if (savedTasks) {
        const tasksArray = JSON.parse(savedTasks);
        tasksArray.forEach(task => {
            createDynamicTask(task.text, task.completed);
        });
    } else {
        // إذا كان المتصفح فارغاً تماماً (أول تشغيل)، يتم بناء المهمة الافتراضية تلقائياً
        createDynamicTask("hello world", false);
        saveTasksToLocalStorage();
    }
}

// 6. معالجة حدث الضغط على زر الحفظ (Save)
saveButton.addEventListener('click', function() {
    const taskText = taskInput.value.trim();

    if (taskText === "") {
        alert("الرجاء كتابة مهمة أولاً!");
        return;
    }

    createDynamicTask(taskText, false);
    saveTasksToLocalStorage();
    taskInput.value = ""; // إفراغ الحقل للكتابة مجدداً
});

// 7. ميزة إضافية مريحة للمستخدم: الحفظ الفوري عند الضغط على Enter في الكيبورد
taskInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        saveButton.click();
    }
});

// 8. تحميل البيانات من الذاكرة المحلية بمجرد تشغيل الصفحة
loadTasksFromLocalStorage();
