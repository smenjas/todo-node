const inputSize = 70;
const maxLength = 70;

function addTask(tasks, task) {
    task = task.trim();
    if (task === '') {
        return tasks;
    }

    task = task.substring(0, maxLength);
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    return tasks;
}

function updateTask(tasks, taskID, task) {
    taskID = parseInt(taskID);
    if (!(taskID in tasks)) {
        return tasks;
    }

    task = task.trim();
    task = task.substring(0, maxLength);
    if (task === tasks[taskID]) {
        return tasks;
    }

    if (task === '') {
        tasks = deleteTask(tasks, taskID);
        return tasks;
    }

    tasks[taskID] = task;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    return tasks;
}

function deleteTask(tasks, taskID) {
    taskID = parseInt(taskID);
    if (!(taskID in tasks)) {
        return tasks;
    }

    tasks.splice(taskID, 1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    return tasks;
}

function showTask(taskList, tasks, task, taskID) {
    const button = document.createElement('button');
    //button.innerHTML = '❌';
    button.innerHTML = '🗑️';
    button.setAttribute('type', 'button');
    button.setAttribute('class', 'delete');
    button.setAttribute('title', 'Delete Task');
    button.setAttribute('id', `delete-${taskID}`);
    button.addEventListener('click', event => {
        const taskID = event.target.id.split('-')[1];
        tasks = deleteTask(tasks, taskID);
        showTasks(tasks);
    });

    const input = document.createElement('input');
    input.setAttribute('name', `task-${taskID}`);
    input.setAttribute('id', `task-${taskID}`);
    input.setAttribute('size', inputSize);
    input.setAttribute('maxlength', maxLength);
    input.setAttribute('value', task);

    const li = document.createElement('li');
    li.append(input, button);

    taskList.appendChild(li);
}

function showNewTask(taskList) {
    const button = document.createElement('button');
    button.innerHTML = '&#10133;';
    button.setAttribute('type', 'submit');
    button.setAttribute('title', 'Add Task');

    const input = document.createElement('input');
    input.setAttribute('name', 'new-task');
    input.setAttribute('id', 'new-task');
    input.setAttribute('size', inputSize);
    input.setAttribute('maxlength', maxLength);

    const li = document.createElement('li');
    li.append(input, button);

    taskList.appendChild(li);
}

function showTasks(tasks) {
    const taskList = document.querySelector('#tasks ul');
    taskList.innerHTML = '';
    showNewTask(taskList);
    for (let taskID = tasks.length - 1; taskID > -1; taskID--) {
        showTask(taskList, tasks, tasks[taskID], taskID);
    }
    document.getElementById('new-task').focus();
}

//localStorage.setItem('tasks', '[]'); // Clear all tasks.
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

showTasks(tasks);

const form = document.querySelector('form#tasks');
form.onsubmit = (event) => {
    event.preventDefault();
    document.querySelectorAll('input').forEach(input => {
        if (input.id === 'new-task') {
            tasks = addTask(tasks, input.value);
            input.value = '';
        } else {
            const taskID = input.id.split('-')[1];
            tasks = updateTask(tasks, taskID, input.value);
        }
        showTasks(tasks);
    });
}
