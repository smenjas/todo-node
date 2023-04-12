import fs from 'fs';
import http from 'http';
import url from 'url';
import querystring from 'querystring';
import Common from './common.js';
import HTML from './html.js';
import Task from './task.js';
import User from './user.js';

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
        case '/ajax.js':
        case '/auth.js':
        case '/client.js':
            response.statusCode = 200;
            response.setHeader('Content-Type', 'text/javascript');
            content = fs.readFileSync(`../public/js${path}`, 'utf8');
            break;
        case '/common.js':
            response.statusCode = 200;
            response.setHeader('Content-Type', 'text/javascript');
            content = fs.readFileSync('common.js', 'utf8');
            break;
        case '/main.css':
            response.statusCode = 200;
            response.setHeader('Content-Type', 'text/css');
            content = fs.readFileSync('../public/css/main.css', 'utf8');
            break;
        case '/download-tasks':
            downloadTasks(request, response, name);
            return;
        case '/upload-tasks':
            uploadTasks(request, response, name);
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
        case '/favicon.ico':
            response.statusCode = 200;
            response.setHeader('Content-Type', 'image/vnd');
            content = fs.readFileSync(`../public/img${path}`);
            break;
        case '/apple-touch-icon.png':
        case '/favicon-16.png':
        case '/favicon-32.png':
        case '/favicon-192.png':
        case '/favicon-512.png':
            response.statusCode = 200;
            response.setHeader('Content-Type', 'image/png');
            content = fs.readFileSync(`../public/img${path}`);
            break;
        default:
            response.statusCode = 404;
            response.setHeader('Content-Type', 'text/html');
            content = create404HTML();
            break;
    }

    response.setHeader('Content-Length', Buffer.byteLength(content));
    response.setHeader('Expires', new Date().toUTCString());
    response.end(content);
});

server.listen(Common.port, Common.hostname, () => {
    console.log(`Server running at ${Common.server}/`);
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

function downloadTasks(request, response, name) {
    handlePostRequest(request, response, (error, body) => {
        response.setHeader('Cache-Control', 'no-cache');
        if (error) {
            console.error(error.message);
            response.statusCode = error.statusCode;
            response.end(error.message);
            return;
        }
        const tasks = Task.getTasks(name);
        response.statusCode = 200; // HTTP 200: OK
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify(tasks));
    });
}

function uploadTasks(request, response, name) {
    handlePostRequest(request, response, (error, body) => {
        response.setHeader('Cache-Control', 'no-cache');
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
        response.end(`Server received ${bytes} bytes.`);
    });
}

function setSessionCookie(response, session) {
    if (!session.ID) {
        return;
    }
    const expires = new Date(session.expires).toUTCString();
    response.setHeader('Set-Cookie', `sessionID=${encodeURIComponent(session.ID)}`);
    response.setHeader('Expires', expires);
}

function createAccount(request, response) {
    handlePostRequest(request, response, (error, body) => {
        response.setHeader('Cache-Control', 'no-cache');
        if (error) {
            console.error(error.message);
            response.statusCode = error.statusCode;
            response.end(error.message);
            return;
        }
        const data = JSON.parse(body);
        const user = { name: data.name }
        const result = User.create(user, data.password);
        if (result.success) {
            const session = User.logIn(data.name, data.password);
            setSessionCookie(response, session);
            response.statusCode = 201; // HTTP 201: Created
        } else {
            response.statusCode = 409; // HTTP 409: Conflict
        }
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify(result));
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
        setSessionCookie(response, session);
        const location = (session.ID) ? '/' : request.headers.referer;
        response.statusCode = 302;
        response.setHeader('Location', location);
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
    headers += HTML.createFavicon(`/apple-touch-icon.png`, `180x180`);
    headers += HTML.createFavicon(`/favicon.ico`, `48x48`, 'vnd');
    for (const size of [16, 32, 180, 192, 512]) {
        headers += HTML.createFavicon(`/favicon-${size}.png`, `${size}x${size}`);
    }
    return HTML.create(title, body, headers, 'en-us');
}

function create404HTML() {
    const title = "HTTP 404: Page Not Found";
    const body = `<header><h1>${title}</h1></header>
<img src="404.jpg" alt="John Travolta as Vincent Vega in the movie Pulp Fiction expresses confusion.">`;
    return createHTML(title, body);
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
    const title = "ToDo: Node";
    const nav = createNavHTML(name);
    let body = `<header><h1>${title}</h1>${nav}</header>`;
    let headers = '';
    if (name) {
        body += '<form id="tasks">\n<ul></ul>\n</form>';
        headers = HTML.createExternalJS('client.js', true);
    }
    return createHTML(title, body, headers);
}

function createLoginHTML(title = "Log In", action = 'login') {
    const size = 30;
    const body = `<header><h1>${title}</h1></header>
<form method="post" action="${action}" id="${action}">
<input size="${size}" maxlength="${Common.nameMax}" placeholder="username" type="text" name="name" required><br>
<input size="${size}" maxlength="${Common.passMax}" placeholder="password" type="password" name="password" required><br>
<button type="submit">${title}</button>
</form>`;
    const headers = HTML.createExternalJS('auth.js', true);
    return createHTML(title, body, headers);
}

function createAccountHTML() {
    return createLoginHTML("Create an Account", 'create-account');
}
