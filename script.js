document.addEventListener('DOMContentLoaded', () => {
  const showNewTaskButton = document.getElementById('showNewTaskButton');
  const addTaskButton = document.getElementById('addTaskButton');
  const taskList = document.getElementById('taskList');
  const newTaskInputContainer = document.getElementById('newTaskInputContainer');
  const newTaskInput = document.getElementById('newTaskInput');
  const appTitle = document.getElementById('appTitle');
  const langIcon = document.getElementById('langIcon');
  const htmlTag = document.querySelector('html');

  const translations = {
    en: {
      title: 'What Should I Do Today? 🤔',
      placeholder: 'Enter a new task...',
      add_button: 'Add',
      show_button: '+ New Task',
      task1: 'Create a style guide',
      task2: 'Send out prototypes',
      task3: 'Review "About" page legibility',
      task4: 'Check color contrast',
    },
    ar: {
      title: 'إيش حسوي اليوم؟ 🤔',
      placeholder: 'أدخل مهمة جديدة...',
      add_button: 'إضافة',
      show_button: '+ مهمة جديدة',
      task1: 'إنشاء دليل الأسلوب',
      task2: 'إرسال النماذج الأولية',
      task3: 'قابلية قراءة صفحة "حول"',
      task4: 'التحقق من تباين الألوان',
    },
    zh: {
      title: '我今天应该做什么？🤔',
      placeholder: '输入新任务...',
      add_button: '添加',
      show_button: '+ 新任务',
      task1: '创建风格指南',
      task2: '发送原型',
      task3: '检查“关于”页面的可读性',
      task4: '检查颜色对比度',
    },
  };

  // Background animation
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: null, y: null, radius: 150 };

  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
  });
  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor(x, y, directionX, directionY, size, color) {
      this.x = x;
      this.y = y;
      this.directionX = directionX;
      this.directionY = directionY;
      this.size = size;
      this.color = color;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
    update() {
      if (this.x + this.size > canvas.width || this.x - this.size < 0) {
        this.directionX = -this.directionX;
      }
      if (this.y + this.size > canvas.height || this.y - this.size < 0) {
        this.directionY = -this.directionY;
      }
      this.x += this.directionX;
      this.y += this.directionY;

      if (mouse.x && mouse.y) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
          let angle = Math.atan2(dy, dx);
          let force = (mouse.radius - distance) / mouse.radius;
          this.x -= Math.cos(angle) * force;
          this.y -= Math.sin(angle) * force;
        }
      }
      this.draw();
    }
  }

  function init() {
    particles = [];
    let numberOfParticles = (canvas.width * canvas.height) / 9000;
    for (let i = 0; i < numberOfParticles; i++) {
      let size = Math.random() * 5 + 1;
      let x = Math.random() * (window.innerWidth - size * 2) + size;
      let y = Math.random() * (window.innerHeight - size * 2) + size;
      let directionX = Math.random() * 0.5 - 0.25;
      let directionY = Math.random() * 0.5 - 0.25;
      let color = `rgba(155, 112, 229, ${Math.random()})`;
      particles.push(new Particle(x, y, directionX, directionY, size, color));
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
    }
  }
  init();
  animate();

  // Language switching
  const languageOrder = ['en', 'zh', 'ar'];
  let currentLangIndex = 0;

  function switchLanguage() {
    currentLangIndex = (currentLangIndex + 1) % languageOrder.length;
    const newLang = languageOrder[currentLangIndex];
    const newDirection = newLang === 'ar' ? 'rtl' : 'ltr';

    htmlTag.lang = newLang;
    htmlTag.dir = newDirection;
    document.body.style.fontFamily = newLang === 'ar' ? "'Cairo', sans-serif" : "'Inter', sans-serif";

    appTitle.textContent = translations[newLang].title;
    newTaskInput.placeholder = translations[newLang].placeholder;
    addTaskButton.textContent = translations[newLang].add_button;
    showNewTaskButton.querySelector('span').textContent = translations[newLang].show_button;

    document.querySelectorAll('.task-text').forEach((taskSpan) => {
      const key = taskSpan.getAttribute('data-key');
      if (key) {
        taskSpan.textContent = translations[newLang][key];
      }
    });

    document.querySelectorAll('.task-list .trash-icon').forEach((icon) => {
      if (newDirection === 'rtl') {
        icon.classList.remove('ml-auto');
        icon.classList.add('mr-auto');
      } else {
        icon.classList.remove('mr-auto');
        icon.classList.add('ml-auto');
      }
    });

    if (newDirection === 'rtl') {
      langIcon.classList.remove('left-4');
      langIcon.classList.add('right-4');
    } else {
      langIcon.classList.remove('right-4');
      langIcon.classList.add('left-4');
    }
  }

  langIcon.addEventListener('click', switchLanguage);

  // To-do logic
  showNewTaskButton.addEventListener('click', () => {
    newTaskInputContainer.classList.toggle('scale-y-0');
    newTaskInputContainer.classList.toggle('scale-y-100');
    if (!newTaskInputContainer.classList.contains('scale-y-0')) {
      newTaskInput.focus();
    } else {
      newTaskInput.value = '';
      updateAddTaskButtonState();
    }
  });

  function handleAddTask() {
    const taskText = newTaskInput.value.trim();
    if (taskText !== '') {
      addTask(taskText);
      newTaskInput.value = '';
      newTaskInputContainer.classList.remove('scale-y-100');
      newTaskInputContainer.classList.add('scale-y-0');
      updateAddTaskButtonState();
    }
  }

  newTaskInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      handleAddTask();
    }
  });

  addTaskButton.addEventListener('click', handleAddTask);

  function updateAddTaskButtonState() {
    if (newTaskInput.value.trim() !== '') {
      addTaskButton.classList.remove('bg-gray-400', 'cursor-not-allowed');
      addTaskButton.classList.add('bg-[#9B70E5]', 'hover:bg-[#8D61CD]', 'cursor-pointer');
      addTaskButton.disabled = false;
    } else {
      addTaskButton.classList.remove('bg-[#9B70E5]', 'hover:bg-[#8D61CD]', 'cursor-pointer');
      addTaskButton.classList.add('bg-gray-400', 'cursor-not-allowed');
      addTaskButton.disabled = true;
    }
  }

  newTaskInput.addEventListener('input', updateAddTaskButtonState);
  updateAddTaskButtonState();

  function addTask(text) {
    const newTask = document.createElement('div');
    newTask.classList.add('flex', 'items-center', 'space-x-4');

    const currentDirection = htmlTag.dir;
    const marginClass = currentDirection === 'rtl' ? 'mr-auto' : 'ml-auto';

    newTask.innerHTML = `
      <div class="task-circle"></div>
      <span class="task-text">${text}</span>
      <span class="${marginClass} cursor-pointer text-gray-400 trash-icon hover:text-red-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
      </span>
    `;
    taskList.appendChild(newTask);
  }

  taskList.addEventListener('click', (event) => {
    if (event.target.classList.contains('task-circle')) {
      const circle = event.target;
      const taskText = circle.nextElementSibling;
      circle.classList.toggle('completed');
      taskText.classList.toggle('completed');
    }
    const trashIcon = event.target.closest('.trash-icon');
    if (trashIcon) {
      const task = trashIcon.closest('.flex.items-center.space-x-4');
      if (task) {
        task.remove();
      }
    }
  });
});
