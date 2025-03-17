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
function handleToggleComplete(taskId) {
  const task = tasks.find(task => task.id === taskId);
  if (task) task.completed = !task.completed;
  saveAndRender();
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

// Render tasks to DOM
function renderTasks(filter = 'all') {
  const html = tasks
    .sort((a, b) => (a.dueDate || Infinity) - (b.dueDate || Infinity))
    .filter(task => {
      if (filter === 'completed') return task.completed;
      if (filter === 'pending') return !task.completed;
      return true;
    })
    .map(task => `
      <li 
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-150"
        data-id="${task.id}"

      >
        <div class="flex items-center gap-3">
          <input 
            type="checkbox"
            ${task.completed ? 'checked' : ''}
            onchange="handleToggleComplete(${task.id})"
            class="w-4 h-4 rounded border-gray-300"
          >
          <span class="${task.completed ? 'line-through text-gray-400' : ''}">
            ${task.text}
            ${task.dueDate ? 
              `<span class="text-sm ${new Date(task.dueDate) < new Date() ? 'text-red-500' : 'text-gray-500'}">
                (${new Date(task.dueDate).toLocaleString()})
              </span>` : 
              ''}
          </span>
        </div>
        <div class="flex gap-2">
          <button
            onclick="handleEditTask(${task.id})"
            class="px-2 py-1 text-blue-500 hover:bg-blue-50 rounded"
          >
            Edit
          </button>
          <button
            onclick="handleDeleteTask(${task.id})"
            class="px-2 py-1 text-red-500 hover:bg-red-50 rounded"
          >
            Delete
          </button>
        </div>
      </li>
    `)
    .join('');
  
  console.log('Rendered HTML:', html);
  todoList.innerHTML = html;
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
});
todoForm.addEventListener('submit', handleAddTask);
document.getElementById('saveEditBtn').addEventListener('click', handleSaveEdit);
document.getElementById('cancelEditBtn').addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
  if (e.target === document.getElementById('editModal')) {
    closeModal();
  }
});