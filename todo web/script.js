// Selectors
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const clearCompletedBtn = document.getElementById('clearCompleted');
const clearAllBtn = document.getElementById('clearAll');

let tasks = []; // { id, text, completed }

// --- Utility functions ---
const saveTasks = () => localStorage.setItem('tasks', JSON.stringify(tasks));
const loadTasks = () => {
  const raw = localStorage.getItem('tasks');
  tasks = raw ? JSON.parse(raw) : [];
};

// Create a DOM element for a task
function renderTask(task) {
  const li = document.createElement('li');
  li.className = 'task-item';
  li.dataset.id = task.id;
  if (task.completed) li.classList.add('completed');

  const left = document.createElement('div');
  left.className = 'task-left';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;
  checkbox.addEventListener('change', () => toggleComplete(task.id));

  const text = document.createElement('div');
  text.className = 'task-text';
  text.textContent = task.text;
  text.contentEditable = false;
  text.setAttribute('aria-label', 'Task description');

  left.appendChild(checkbox);
  left.appendChild(text);

  const btns = document.createElement('div');
  btns.className = 'btns';

  const editBtn = document.createElement('button');
  editBtn.className = 'btn';
  editBtn.textContent = 'Edit';
  editBtn.addEventListener('click', () => startEdit(task.id, text));

  const delBtn = document.createElement('button');
  delBtn.className = 'btn';
  delBtn.textContent = 'Delete';
  delBtn.addEventListener('click', () => deleteTask(task.id));

  btns.appendChild(editBtn);
  btns.appendChild(delBtn);

  li.appendChild(left);
  li.appendChild(btns);

  return li;
}

function render() {
  taskList.innerHTML = '';
  tasks.forEach(task => {
    taskList.appendChild(renderTask(task));
  });
}

// --- CRUD operations ---
function addTask(text) {
  const newTask = { id: Date.now().toString(), text, completed: false };
  tasks.unshift(newTask); // newest first
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

function toggleComplete(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
  saveTasks();
  render();
}

function startEdit(id, textNode) {
  textNode.contentEditable = true;
  textNode.focus();
  // Move caret to end
  document.execCommand('selectAll', false, null);
  document.getSelection().collapseToEnd();

  // Save on blur or Enter
  const finish = () => {
    textNode.contentEditable = false;
    const newText = textNode.textContent.trim();
    if (newText === '') {
      // if empty, delete task
      deleteTask(id);
    } else {
      tasks = tasks.map(t => t.id === id ? { ...t, text: newText } : t);
      saveTasks();
      render();
    }
    cleanup();
  };

  const onKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      finish();
    } else if (e.key === 'Escape') {
      // cancel edit
      render();
      cleanup();
    }
  };

  const cleanup = () => {
    textNode.removeEventListener('blur', finish);
    textNode.removeEventListener('keydown', onKey);
  };

  textNode.addEventListener('blur', finish);
  textNode.addEventListener('keydown', onKey);
}

function clearCompleted() {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  render();
}

function clearAll() {
  if (!confirm('Are you sure you want to remove all tasks?')) return;
  tasks = [];
  saveTasks();
  render();
}

// --- Form handling ---
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;
  addTask(text);
  taskInput.value = '';
  taskInput.focus();
});

// Buttons
clearCompletedBtn.addEventListener('click', clearCompleted);
clearAllBtn.addEventListener('click', clearAll);

// initial load
loadTasks();
render();
