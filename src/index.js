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
    let sessionID = '';
    let name = '';

    if (request.headers.cookie) {
        const cookieData = querystring.parse(request.headers.cookie);
        sessionID = decodeURIComponent(cookieData.sessionID);
        name = User.getUserBySessionID(sessionID);
    }
    if (path.indexOf('.') === -1) {
        console.log(request.method, path, `sessionID: '${sessionID}'`, "name:", name);
    }

    if (sessionID && !name && path !== '/logout') {
        console.log(`Unrecognized sessionID '${sessionID}', logging out.`);
        logOut(request, response);
        return;
    }

    let content = '';

    switch (path) {
        case '/':
            response.statusCode = 200;
            response.setHeader('Cache-Control', 'no-cache');
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
        case '/edit-user':
            if (request.method === 'POST') {
                editUser(request, response);
                return;
            }
            const location = (name) ? `/user/${name}` : '/';
            response.statusCode = 302;
            response.setHeader('Location', location);
            response.end();
            return;
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
        case `/user/${name}`:
            response.statusCode = 200;
            response.setHeader('Cache-Control', 'no-cache');
            response.setHeader('Content-Type', 'text/html');
            content = renderUserHTML(name);
            break;
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
    const maxAge = (session.expires - Date.now()) / 1000;
    console.log(`Session ID '${session.ID}' expires in ${maxAge / 86400} days.`);
    response.setHeader('Set-Cookie', `sessionID=${encodeURIComponent(session.ID)}; Max-Age:${maxAge}`);
}

function editUser(request, response) {
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
        const result = User.edit(user, data.password, data.newPassword);
        if (result.success) {
            response.statusCode = 200; // HTTP 200: OK
        } else {
            response.statusCode = 400; // HTTP 400: Bad Request
        }
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify(result));
    });
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
        response.statusCode = 302;
        response.setHeader('Location', '/');
        response.end();
    });
}

function logOut(request, response) {
    const data = querystring.parse(request.headers.cookie);
    const sessionID = decodeURIComponent(data.sessionID);
    User.logOut(sessionID);

    response.statusCode = 302;
    response.setHeader('Location', '/login');
    response.setHeader('Set-Cookie', 'sessionID=""; Max-Age=0');
    response.end();
}

function createHTML(title, body, headers = '') {
    headers = HTML.createExternalCSS('/main.css') + headers;
    headers += HTML.createFavicon(`/apple-touch-icon.png`, `180x180`);
    headers += HTML.createFavicon(`/favicon.ico`, `48x48`, 'vnd');
    for (const size of [16, 32, 192, 512]) {
        headers += HTML.createFavicon(`/favicon-${size}.png`, `${size}x${size}`);
    }
    return HTML.create(title, body, headers, 'en-us');
}

function create404HTML() {
    const title = "HTTP 404: Page Not Found";
    const body = `<header><h1>${title}</h1></header>
<img src="/404.jpg" alt="John Travolta as Vincent Vega in the movie Pulp Fiction expresses confusion.">`;
    return createHTML(title, body);
}

function createNavHTML(name) {
    let html = '<nav>';
    html += '<ul>';
    if (name) {
        const nameLink = `<a href="/user/${name}">${name}</a>`;
        html += `<li>Logged in as: ${nameLink}</li>`;
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

function renderUserHTML(name) {
    const user = User.getUser(name);
    const created = new Date(user.created);
    const title = name;
    const nav = createNavHTML(name);
    const tasks = Task.getTasks(name);
    const tasksLinkText = `${tasks.length} ${(tasks.length === 1) ? "task": "tasks"}`;
    const tasksLink = `<a href="/">${tasksLinkText}</a>`;
    const size = 30;
    const body = `<header><h1>${title}</h1>${nav}</header>
<p>Member since: ${created.toLocaleDateString('en-us', { dateStyle: 'long' })}</p>
<p>${tasksLink}</p>
<form method="post" id="edit-user">
<input type="hidden" name="name" value="${name}">
<div>
    <input size="${size}" maxlength="${Common.passMax}" placeholder="old password" type="password" name="password" required>
    <span id="valid-password"></span>
</div>
<div>
    <input size="${size}" maxlength="${Common.passMax}" placeholder="new password" type="password" name="newPassword" required>
    <span id="valid-newPassword"></span>
</div>
<button type="submit">Change Password</button>
<p id="password-strength"></p>
<p id="auth-feedback"></p>
</form>`;
    const headers = HTML.createExternalJS('/auth.js', true);
    return createHTML(title, body, headers);
}

function createLoginHTML(title = "Log In", id = 'login') {
    const size = 30;
    const body = `<header><h1>${title}</h1></header>
<form method="post" id="${id}">
<div>
    <input size="${size}" maxlength="${Common.nameMax}" placeholder="username" type="text" name="name" required>
    <span id="valid-name"></span>
</div>
<div>
    <input size="${size}" maxlength="${Common.passMax}" placeholder="password" type="password" name="password" required>
    <span id="valid-password"></span>
</div>
<button type="submit">${title}</button>
<p id="password-strength"></p>
<p id="auth-feedback"></p>
</form>`;
    const headers = HTML.createExternalJS('/auth.js', true);
    return createHTML(title, body, headers);
}

function createAccountHTML() {
    return createLoginHTML("Create an Account", 'create-account');
}
