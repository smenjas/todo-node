'use strict';

const inputSize = 70;
const maxLength = 70;
let httpRequest;

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
        backupTasks(tasks);
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

function describeHttpRequestState(readyState) {
    switch (httpRequest.readyState) {
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

function describeHttpResponseState(status) {
    switch (status) {
        case 100: return "Continue";
        case 101: return "Switching Protocols";
        case 102: return "Processing";
        case 103: return "Early Hints";
        case 200: return "OK";
        case 201: return "Created";
        case 202: return "Accepted";
        case 203: return "Non-Authoritative Information";
        case 204: return "No Content";
        case 205: return "Reset Content";
        case 206: return "Partial Content";
        case 207: return "Multi-Status";
        case 208: return "Already Reported";
        case 226: return "IM Used (HTTP Delta encoding)";
        case 300: return "Multiple Choices";
        case 301: return "Moved Permanently";
        case 302: return "Found";
        case 303: return "See Other";
        case 304: return "Not Modified";
        case 305: return "Use Proxy";
        case 306: return "unused";
        case 307: return "Temporary Redirect";
        case 308: return "Permanent Redirect";
        case 400: return "Bad Request";
        case 401: return "Unauthorized";
        case 402: return "Payment Required";
        case 403: return "Forbidden";
        case 404: return "Not Found";
        case 405: return "Method Not Allowed";
        case 406: return "Not Acceptable";
        case 407: return "Proxy Authentication Required";
        case 408: return "Request Timeout";
        case 409: return "Conflict";
        case 410: return "Gone";
        case 411: return "Length Required";
        case 412: return "Precondition Failed";
        case 413: return "Payload Too Large";
        case 414: return "URI Too Long";
        case 415: return "Unsupported Media Type";
        case 416: return "Range Not Satisfiable";
        case 417: return "Expectation Failed";
        case 418: return "I'm a teapot";
        case 421: return "Misdirected Request";
        case 422: return "Unprocessable Content";
        case 423: return "Locked";
        case 424: return "Failed Dependency";
        case 425: return "Too Early";
        case 426: return "Upgrade Required";
        case 428: return "Precondition Required";
        case 429: return "Too Many Requests";
        case 431: return "Request Header Fields Too Large";
        case 451: return "Unavailable For Legal Reasons";
        case 500: return "Internal Server Error";
        case 501: return "Not Implemented";
        case 502: return "Bad Gateway";
        case 503: return "Service Unavailable";
        case 504: return "Gateway Timeout";
        case 505: return "HTTP Version Not Supported";
        case 506: return "Variant Also Negotiates";
        case 507: return "Insufficient Storage";
        case 508: return "Loop Detected";
        case 510: return "Not Extended";
        case 511: return "Network Authentication Required";
        default: return "Unknown Status";
    }
}

function handleHttpResponse() {
    try {
        const requestStatus = describeHttpRequestState(httpRequest.readyState);
        const responseStatus = describeHttpResponseState(httpRequest.status);
        console.log(`HTTP ${httpRequest.status} ${responseStatus}, ${requestStatus} ${httpRequest.responseText}`);
    }
    catch (e) {
        console.log("Caught Exception:", e.description);
    }
};

function backupTasks(tasks) {
    const hostname = '127.0.0.1';
    const port = 3000;
    httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = handleHttpResponse;
    httpRequest.open("POST", `http://${hostname}:${port}/backup-tasks`, true);
    httpRequest.setRequestHeader("Content-Type", "application/json");
    httpRequest.send(JSON.stringify(tasks));
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
        backupTasks(tasks);
        showTasks(tasks);
    });
}
