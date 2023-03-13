'use strict';

const fs = require('fs');
const http = require('http');
const url = require('url');
const querystring = require('querystring');
const crypto = require('crypto');

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
                response.statusCode = 302;
                response.setHeader('Location', request.headers.referer);
                response.end();
                return;
            }
            response.statusCode = 200;
            response.setHeader('Content-Type', 'text/html');
            content = fs.readFileSync('../public/html/create-account.html', 'utf8');
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
        fs.writeFile('../data/tasks.json', body, error => {
            if (error) {
                console.error(error);
            }
        });
        response.end(`Received ${bytes} bytes.`);
    });
}

function createAccount(request, response) {
    handlePostRequest(request, response, body => {
        const data = querystring.parse(body);
        const user = { name: data.name }
        createUser(user, data.password);
    });
}

function getUsers() {
    try {
        const json = fs.readFileSync('../data/users.json', 'utf8');
        return JSON.parse(json);
    }
    catch (e) {
        console.log(e);
    }

    return {};
}

function createUser(user, password) {
    const users = getUsers();

    if (user.name in users) {
        console.log(`The username ${user.name} already exists.`);
        return;
    }

    user.salt = createSalt();
    user.hash = hashPassword(password, user.salt);
    user.created = Date.now();
    console.log(user);

    users[user.name] = user;
    setUsers(users);
}

function setUsers(users) {
    fs.writeFile('../data/users.json', JSON.stringify(users), error => {
        if (error) {
            console.error(error);
        }
    });
}

function createSalt() {
    return crypto.randomBytes(16).toString('hex');
}

function hashPassword(password, salt) {
    const iterations = 1000;
    const keylen = 64;
    password = password.toString().normalize();
    return crypto.pbkdf2Sync(password, salt, iterations, keylen, 'sha512').toString('hex');
}
