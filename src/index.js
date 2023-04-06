'use strict';

const fs = require('fs');
const http = require('http');
const url = require('url');
const querystring = require('querystring');

const HTML = require('./html.js');
const Task = require('./task.js');
const User = require('./user.js');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((request, response) => {
    const path = url.parse(request.url).pathname;
    const cookieData = querystring.parse(request.headers.cookie);
    const sessionID = decodeURIComponent(cookieData.sessionID);
    const name = User.getUserBySessionID(sessionID);
    if (path.indexOf('.') === -1) {
        console.log(request.method, path, `sessionID: '${sessionID}'`, "name:", name);
    }
    let content = '';

    if (sessionID && !name && path !== '/logout') {
        console.log("Unrecognized sessionID, logging out.");
        logOut(request, response);
        return;
    }

    switch (path) {
        case '/':
            response.statusCode = 200;
            response.setHeader('Content-Type', 'text/html');
            content = createTasksHTML(name);
            break;
        case '/client.js':
            response.statusCode = 200;
            response.setHeader('Content-Type', 'text/javascript');
            content = fs.readFileSync('../public/js/client.js', 'utf8');
            break;
        case '/main.css':
            response.statusCode = 200;
            response.setHeader('Content-Type', 'text/css');
            content = fs.readFileSync('../public/css/main.css', 'utf8');
            break;
        case '/backup-tasks':
            response.setHeader('Cache-Control', 'no-cache');
            backupTasks(request, response, name);
            return;
        case '/create-account':
            if (request.method === 'POST') {
                createAccount(request, response);
                return;
            }
            response.statusCode = 200;
            response.setHeader('Content-Type', 'text/html');
            content = createAccountHTML();
            break;
        case '/login':
            if (request.method === 'POST') {
                logIn(request, response);
                return;
            }
            response.statusCode = 200;
            response.setHeader('Content-Type', 'text/html');
            content = createLoginHTML();
            break;
        case '/logout':
            logOut(request, response);
            return;
        case '/404.jpg':
            response.statusCode = 200;
            response.setHeader('Content-Type', 'image/jpeg');
            content = fs.readFileSync('../public/img/404.jpg');
            break;
        default:
            response.statusCode = 404;
            response.setHeader('Content-Type', 'text/html');
            content = fs.readFileSync('../public/html/404.html', 'utf8');
            break;
    }

    response.setHeader('Content-Length', Buffer.byteLength(content));
    response.setHeader('Expires', new Date().toUTCString());
    response.end(content);
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

function handlePostRequest(request, response, callback) {
    if (request.method !== 'POST') {
        const error = {
            statusCode: 400, // HTTP 400: Bad Request
            message: `ERROR: Request method is ${request.method}, not POST.`,
        };
        callback(error, '');
    }
    let body = '';
    request.on('data', chunk => {
        body += chunk.toString();
    });
    request.on('end', () => {
        callback(null, body);
    });
}

function backupTasks(request, response, name) {
    handlePostRequest(request, response, (error, body) => {
        if (error) {
            console.error(error.message);
            response.statusCode = error.statusCode;
            response.end(error.message);
            return;
        }
        response.statusCode = 200; // HTTP 200: OK
        const tasks = JSON.parse(body);
        const bytes = Buffer.byteLength(body);
        console.log(tasks, bytes);
        Task.setTasks(name, tasks);
        response.end(`Received ${bytes} bytes.`);
    });
}

function createAccount(request, response) {
    handlePostRequest(request, response, (error, body) => {
        if (error) {
            console.error(error.message);
            response.statusCode = error.statusCode;
            response.end(error.message);
            return;
        }
        const data = querystring.parse(body);
        const user = { name: data.name }
        const result = User.create(user, data.password);
        const location = (result.success) ? '/' : request.headers.referer;
        response.statusCode = 302;
        response.setHeader('Location', location);
        response.end();
    });
}

function logIn(request, response) {
    handlePostRequest(request, response, (error, body) => {
        if (error) {
            console.error(error.message);
            response.statusCode = error.statusCode;
            response.end(error.message);
            return;
        }
        const data = querystring.parse(body);
        const session = User.logIn(data.name, data.password);
        const location = (session.ID) ? '/' : request.headers.referer;
        const expires = new Date(session.expires).toUTCString();
        response.statusCode = 302;
        response.setHeader('Location', location);
        response.setHeader('Set-Cookie', `sessionID=${encodeURIComponent(session.ID)}`);
        response.setHeader('Expires', expires);
        response.end();
    });
}

function logOut(request, response) {
    const data = querystring.parse(request.headers.cookie);
    const sessionID = decodeURIComponent(data.sessionID);
    User.logOut(sessionID);

    response.statusCode = 302;
    response.setHeader('Location', request.headers.referer ?? '/');
    response.setHeader('Set-Cookie', `sessionID=`);
    response.setHeader('Expires', 0);
    response.end();
}

function createHTML(title, body, headers = '') {
    headers = HTML.createExternalCSS('main.css') + headers;
    body = `<h1>${title}</h1>\n${body}`;
    return HTML.create(title, body, headers, 'en-us');
}

function createNavHTML(name) {
    let html = '<nav>';
    html += '<ul>';
    if (name) {
        html += `<li>Logged in as: ${name}</li>`;
        html += '<li><a href="/logout">Log Out</a></li>';
    } else {
        html += '<li><a href="/create-account">Create Account</a></li>';
        html += '<li><a href="/login">Log In</a></li>';
    }
    html += '</ul>';
    html += '</nav>';
    return html;
}

function createTasksHTML(name) {
    let body = createNavHTML(name);
    let headers = '';
    if (name) {
        body += '<form id="tasks">\n<ul></ul>\n</form>';
        headers = HTML.createExternalJS('client.js');
    }
    return createHTML("ToDo: Node", body, headers);
}

function createLoginHTML(title = "Log In", action = 'login') {
    const size = 30;
    const max = 63;
    const body = `<form method="post" action="${action}" id="${action}">
<input size="${size}" maxlength="${max}" placeholder="username" type="text" name="name" required><br>
<input size="${size}" maxlength="${max}" placeholder="password" type="password" name="password" required><br>
<button type="submit">${title}</button>
</form>`;
    return createHTML(title, body);
}

function createAccountHTML() {
    return createLoginHTML("Create an Account", 'create-account');
}
