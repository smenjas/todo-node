'use strict';

const fs = require('fs');
const http = require('http');
const url = require('url');
const querystring = require('querystring');

const Task = require('./task.js');
const User = require('./user.js');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((request, response) => {
    const path = url.parse(request.url).pathname;
    let content = '';

    switch (path) {
        case '/':
            response.statusCode = 200;
            response.setHeader('Content-Type', 'text/html');
            content = fs.readFileSync('../public/html/index.html', 'utf8');
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
            backupTasks(request, response);
            return;
        case '/create-account':
            if (request.method === 'POST') {
                createAccount(request, response);
                return;
            }
            response.statusCode = 200;
            response.setHeader('Content-Type', 'text/html');
            content = fs.readFileSync('../public/html/create-account.html', 'utf8');
            break;
        case '/login':
            if (request.method === 'POST') {
                logIn(request, response);
                return;
            }
            response.statusCode = 200;
            response.setHeader('Content-Type', 'text/html');
            content = fs.readFileSync('../public/html/login.html', 'utf8');
            break;
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
        response.statusCode = 400; // HTTP 400: Bad Request
        const error = `ERROR: Request method is ${request.method}, not POST.`;
        console.log(error);
        response.end(error);
    }
    let body = '';
    request.on('data', chunk => {
        body += chunk.toString();
    });
    request.on('end', () => {
        callback(body);
    });
}

function backupTasks(request, response) {
    handlePostRequest(request, response, body => {
        response.statusCode = 200; // HTTP 200: OK
        const tasks = JSON.parse(body);
        const bytes = Buffer.byteLength(body);
        console.log(tasks, bytes);
        Task.setTasks(tasks);
        response.end(`Received ${bytes} bytes.`);
    });
}

function createAccount(request, response) {
    handlePostRequest(request, response, body => {
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
    handlePostRequest(request, response, body => {
        const data = querystring.parse(body);
        const result = User.logIn(data.name, data.password);
        const location = (result) ? '/' : request.headers.referer;
        response.statusCode = 302;
        response.setHeader('Location', location);
        response.end();
    });
}
