import AJAX from '/ajax.js';
import Common from '/common.js';

let tasks;

function addTask(tasks, task) {
    task = task.trim();
    if (task === '') {
        return tasks;
    }

    task = task.substring(0, Common.taskMax);
    tasks.push(task);
    uploadTasks(tasks);
    return tasks;
}

function updateTask(tasks, taskID, task) {
    taskID = parseInt(taskID);
    if (!(taskID in tasks)) {
        return tasks;
    }

    task = task.trim();
    task = task.substring(0, Common.taskMax);
    if (task === tasks[taskID]) {
        return tasks;
    }

    if (task === '') {
        tasks = deleteTask(tasks, taskID);
        return tasks;
    }

    tasks[taskID] = task;
    uploadTasks(tasks);
    return tasks;
}

function deleteTask(tasks, taskID) {
    taskID = parseInt(taskID);
    if (!(taskID in tasks)) {
        return tasks;
    }

    tasks.splice(taskID, 1);
    uploadTasks(tasks);
    return tasks;
}

function createInput(name, value = "") {
    const input = document.createElement('input');
    input.setAttribute('name', name);
    input.setAttribute('id', name);
    input.setAttribute('size', Common.taskMax);
    input.setAttribute('maxlength', Common.taskMax);
    input.setAttribute('value', value);
    return input;
}

function showTask(taskList, tasks, task, taskID) {
    const button = document.createElement('button');
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

    const input = createInput(`task-${taskID}`, task);

    const li = document.createElement('li');
    li.append(input, button);

    taskList.appendChild(li);
}

function showNewTask(taskList) {
    const button = document.createElement('button');
    button.innerHTML = '+';
    button.setAttribute('type', 'submit');
    button.setAttribute('title', 'Add Task');
    button.setAttribute('id', 'add-task');

    const input = createInput('new-task');

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

function downloadTasks() {
    AJAX.download(`${Common.server}/download-tasks`, () => {
        if (AJAX.request.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (AJAX.request.status !== 200) {
            return;
        }
        tasks = JSON.parse(AJAX.request.responseText);
        showTasks(tasks);
    });
}

function uploadTasks(tasks) {
    AJAX.upload(`${Common.server}/upload-tasks`, tasks);
}

downloadTasks();

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
