// Initialize tasks array from localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// DOM Elements
const todoForm = document.getElementById('todoForm');
const taskInput = document.getElementById('taskInput');
const todoList = document.getElementById('todoList');

// Form submit handler
function handleAddTask(e) {
  e.preventDefault();
  if (taskInput.value.trim()) {
    const newTask = {
      id: Date.now(),
      text: taskInput.value.trim(),
      completed: false,
      dueDate: document.getElementById('dueDateInput').value || null,
      reminderTime: document.getElementById('reminderInput').value || null
    };
    tasks.push(newTask);
    console.log('Tasks after addition:', tasks); // Debug line
    saveAndRender();
    taskInput.value = '';
  }
}

// Delete task handler
function handleDeleteTask(taskId) {
  tasks = tasks.filter(task => task.id !== taskId);
  saveAndRender();
}

// Edit task handler
let currentEditId = null;

function handleEditTask(taskId) {
  currentEditId = parseInt(taskId, 10);
  const task = tasks.find(task => task.id === currentEditId);
  if (task) {
    document.getElementById('editInput').value = task.text;
    document.getElementById('editModal').style.display = 'block';
  }
}

// Modal handlers
function handleSaveEdit() {
  const newText = document.getElementById('editInput').value.trim();
  const newDueDate = document.getElementById('editDueDate').value || null;
  const newReminder = document.getElementById('editReminder').value || null;
  if (newText && currentEditId) {
    const task = tasks.find(task => task.id === currentEditId);
    if (task) {
      task.text = newText;
      task.dueDate = newDueDate;
      task.reminderTime = newReminder;
      saveAndRender();
    }
  }
  closeModal();
}

function closeModal() {
  document.getElementById('editModal').style.display = 'none';
  currentEditId = null;
  document.getElementById('editInput').value = '';
}

// Toggle completion handler
// Render tasks to DOM
function renderTasks(filter = 'all') {
  const html = tasks
    .sort((a, b) => (a.dueDate || Infinity) - (b.dueDate || Infinity))
    .filter(task => {
      if (filter === 'completed') return task.completed;
      if (filter === 'pending') return !task.completed;
      return true;
    })
    .map((task, index) => {
      // Determine if task is overdue
      const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
      // Add a small delay to each task for staggered animation
      const animationDelay = `animation-delay: ${index * 0.05}s;`;
      
      // Generate a subtle gradient for each task card
      const hue1 = Math.floor(Math.random() * 60) + 180; // Blue to green range
      const hue2 = hue1 + 30;
      const glassGradient = `linear-gradient(135deg, 
                            hsla(${hue1}, 70%, 80%, 0.2) 0%, 
                            hsla(${hue2}, 70%, 80%, 0.2) 100%)`;
      
      return `
      <li 
        class="flex flex-col rounded-lg transition-all duration-300"
        data-id="${task.id}"
        data-completed="${task.completed}"
        data-priority="${isOverdue ? 'high' : 'low'}"
        style="${animationDelay}; background: ${task.completed ? 'rgba(248, 250, 252, 0.2)' : glassGradient};"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <input 
              type="checkbox"
              ${task.completed ? 'checked' : ''}
              class="rounded border-gray-300"
            >
            <span class="font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}">
              ${task.text}
            </span>
          </div>
          <div class="flex gap-2">
            <button
              onclick="handleEditTask(${task.id})"
              class="px-2 py-1 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors duration-200 flex items-center gap-1"
            >
              <i class="fas fa-edit"></i>
              <span class="hidden sm:inline">Edit</span>
            </button>
            <button
              onclick="handleDeleteTask(${task.id})"
              class="px-2 py-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 flex items-center gap-1"
            >
              <i class="fas fa-trash-alt"></i>
              <span class="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>
        ${task.dueDate ? 
          `<div class="flex items-center gap-2 text-sm ${isOverdue ? 'text-red-500' : 'text-gray-500'}">
            <i class="far fa-calendar-alt"></i>
            <span>Due: ${new Date(task.dueDate).toLocaleString()}</span>
          </div>` : 
          ''}
        ${task.reminderTime ? 
          `<div class="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <i class="far fa-bell"></i>
            <span>Reminder: ${new Date(task.reminderTime).toLocaleString()}</span>
          </div>` : 
          ''}
      </li>
    `})
    .join('');
  
  todoList.innerHTML = html || `<div class="empty-state text-center py-10 text-white opacity-70">
    <i class="fas fa-tasks text-5xl mb-4"></i>
    <p>No tasks found. Add a new task to get started!</p>
  </div>`;
  
  // Add a small delay before showing tasks to ensure CSS animations work
  setTimeout(() => {
    document.querySelectorAll('#todoList li').forEach(li => {
      li.classList.add('show');
    });
  }, 10);
}

// Filter button handler
document.querySelectorAll('.filter-btn').forEach(button => {
  button.addEventListener('click', (e) => {
    const filter = e.target.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('bg-blue-500', 'text-white');
    });
    e.target.classList.add('bg-blue-500', 'text-white');
    renderTasks(filter);
  });
});

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  renderTasks();
  setInterval(checkNotifications, 60000); // Check every minute
  
  // Add animation classes to the form
  setTimeout(() => {
    document.getElementById('todoForm').classList.add('fade-in-up');
    document.querySelector('.filter-container').classList.add('fade-in-up');
  }, 300);

  // Add event delegation for task checkboxes
  todoList.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox') {
      const taskId = parseInt(e.target.closest('li').dataset.id, 10);
      handleToggleComplete(taskId);
    }
  });
});
todoForm.addEventListener('submit', handleAddTask);
document.getElementById('saveEditBtn').addEventListener('click', handleSaveEdit);
document.getElementById('cancelEditBtn').addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
  if (e.target === document.getElementById('editModal')) {
    closeModal();
  }
});

// Add confetti effect when completing a task
function handleToggleComplete(taskId) {
  const task = tasks.find(task => task.id === taskId);
  const wasCompleted = task ? task.completed : false;
  
  if (task) task.completed = !task.completed;
  saveAndRender();
  
  // Show confetti when task is marked as completed
  if (!wasCompleted && task && task.completed) {
    showConfetti();
  }
}

// Confetti animation function
function showConfetti() {
  const duration = 2000;
  const end = Date.now() + duration;
  
  (function frame() {
    // Launch confetti from the bottom of the viewport
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      gravity: 1,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      gravity: 1,
    });
    
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
}

// Save to localStorage and re-render
function saveAndRender() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
}

// Notification system
function checkNotifications() {
  tasks.forEach(task => {
    if (task.reminderTime && new Date(task.reminderTime) <= new Date()) {
      if (Notification.permission === 'granted') {
        new Notification(`Reminder: ${task.text}`, {
          body: `Due: ${new Date(task.dueDate).toLocaleString()}`
        });
      }
    }
  });
}

// Request notification permission
if (Notification.permission !== 'denied') {
  Notification.requestPermission();
}