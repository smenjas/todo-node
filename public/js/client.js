'use strict';

const hostname = '127.0.0.1';
const port = 3000;
const inputSize = 70;
const maxLength = 70;
let httpRequest;
let tasks;

function addTask(tasks, task) {
    task = task.trim();
    if (task === '') {
        return tasks;
    }

    task = task.substring(0, maxLength);
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
    task = task.substring(0, maxLength);
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
    input.setAttribute('size', inputSize);
    input.setAttribute('maxlength', maxLength);
    input.setAttribute('value', value);
    return input;
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

    const input = createInput(`task-${taskID}`, task);

    const li = document.createElement('li');
    li.append(input, button);

    taskList.appendChild(li);
}

function showNewTask(taskList) {
    const button = document.createElement('button');
    button.innerHTML = '&#10133;';
    button.setAttribute('type', 'submit');
    button.setAttribute('title', 'Add Task');

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

function describeHttpRequestState(readyState) {
    switch (readyState) {
        case XMLHttpRequest.UNSENT:
            return "AJAX connection has not been opened yet.";
        case XMLHttpRequest.OPENED:
            return "AJAX request opened and in progress.";
        case XMLHttpRequest.HEADERS_RECEIVED:
            return "AJAX request sent, headers and status are available.";
        case XMLHttpRequest.LOADING:
            return "AJAX request in progress.";
        case XMLHttpRequest.DONE:
            return "AJAX request complete.";
        default:
            return "ERROR: AJAX state not recognized.";
    }
}

function handleHttpResponse() {
    try {
        if ((httpRequest.status === 0 && httpRequest.readyState === XMLHttpRequest.OPENED) ||
            (httpRequest.status === 200 && httpRequest.readyState !== XMLHttpRequest.DONE)) {
            // No need to spam the console for nominal requests in progress.
            return;
        }
        const requestStatus = describeHttpRequestState(httpRequest.readyState);
        const responseText = (httpRequest.responseText.length > 128) ?
            httpRequest.responseText.substring(0, 128) + "...":
            httpRequest.responseText;
        let logMessage = `${httpRequest.readyState} ${requestStatus} ${responseText}`;
        if (httpRequest.status !== 0) {
            logMessage = `HTTP ${httpRequest.status} ${httpRequest.statusText}, ${logMessage}`;
        }
        console.log(logMessage);
    }
    catch (e) {
        console.log("Caught Exception:", e.description);
    }
};

function downloadTasks() {
    httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = handleHttpResponse;
    httpRequest.open("POST", `http://${hostname}:${port}/download-tasks`, true);
    httpRequest.onload = () => {
        if (httpRequest.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (httpRequest.status !== 200) {
            return;
        }
        tasks = JSON.parse(httpRequest.responseText);
        showTasks(tasks);
    };
    httpRequest.onerror = () => {
        console.error(httpRequest.statusText);
    }
    httpRequest.send();
}

function uploadTasks(tasks) {
    httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = handleHttpResponse;
    httpRequest.open("POST", `http://${hostname}:${port}/upload-tasks`, true);
    httpRequest.setRequestHeader("Content-Type", "application/json");
    httpRequest.send(JSON.stringify(tasks));
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
