document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('todo-form');
    const input = document.getElementById('todo-input');
    const list = document.getElementById('todo-list');
    const tasksCount = document.getElementById('tasks-count');

    let todos = [];

    function saveTodos() {
        localStorage.setItem('modernTodos', JSON.stringify(todos));
    }

    function loadTodos() {
        const stored = localStorage.getItem('modernTodos');
        if (stored) {
            todos = JSON.parse(stored);
        }
    }

    function render() {
        list.innerHTML = '';
        if (todos.length === 0) {
            tasksCount.textContent = 'No tasks yet';
            return;
        }
        todos.forEach((todo, index) => {
            const li = document.createElement('li');
            li.className = todo.completed ? 'completed' : '';
            li.setAttribute('data-index', index);

            // Checkbox for completion
            const checkbox = document.createElement('div');
            checkbox.className = `custom-checkbox ${todo.completed ? 'checked' : ''}`;
            checkbox.addEventListener('click', () => toggleTask(index));

            const checkIcon = document.createElement('i');
            checkIcon.className = 'fas fa-check';
            checkbox.appendChild(checkIcon);

            const span = document.createElement('span');
            span.className = 'task-text';
            span.textContent = todo.text;
            span.tabIndex = 0;
            span.setAttribute('role', 'button');
            span.setAttribute('aria-pressed', todo.completed);
            span.title = 'Click to toggle task completion';
            span.addEventListener('click', () => toggleTask(index));
            span.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleTask(index);
                }
            });

            const delBtn = document.createElement('button');
            delBtn.className = 'delete-btn';
            delBtn.setAttribute('aria-label', `Delete task: ${todo.text}`);
            delBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent toggling when deleting
                deleteTask(index);
            });

            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(delBtn);

            list.appendChild(li);
        });
        updateTasksCount();
    }

    function addTask(text) {
        todos.push({ text, completed: false });
        saveTodos();
        render();
    }

    function toggleTask(index) {
        todos[index].completed = !todos[index].completed;
        saveTodos();
        render();
    }

    function deleteTask(index) {
        // Add fade out animation class/logic if desired here
        todos.splice(index, 1);
        saveTodos();
        render();
    }

    function updateTasksCount() {
        const total = todos.length;
        const remaining = todos.filter(t => !t.completed).length;
        tasksCount.textContent = `${remaining} of ${total} task${total > 1 ? 's' : ''} remaining`;
    }

    form.addEventListener('submit', e => {
        e.preventDefault();
        const val = input.value.trim();
        if (val) {
            addTask(val);
            input.value = '';
            input.focus();
        }
    });

    loadTodos();
    render();
});
