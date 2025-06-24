import fs from 'fs';
import http from 'http';
import url from 'url';
import querystring from 'querystring';
import Common from './common.js';
import HTML from './html.js';
import Task from './task.js';
import User from './user.js';

const server = http.createServer((request, response) => {
    const path = request.url;
    let sessionID = '';
    let name = '';

    if (request.headers.cookie) {
        const cookieData = querystring.parse(request.headers.cookie);
        sessionID = decodeURIComponent(cookieData.sessionID);
        name = User.getUserBySessionID(sessionID);
    }
    if (path.indexOf('.') === -1) {
        console.log(request.method, path, `sessionID: '${sessionID}'`, 'name:', name);
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
        content = renderTasksHTML(name);
        break;
    case '/ajax.js':
    case '/auth.js':
    case '/client.js':
    case '/edit-user.js':
    case '/login.js':
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/javascript');
        content = fs.readFileSync(`public/js${path}`, 'utf8');
        break;
    case '/common.js':
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/javascript');
        content = fs.readFileSync('src/common.js', 'utf8');
        break;
    case '/main.css':
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/css');
        content = fs.readFileSync('public/css/main.css', 'utf8');
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
        content = renderAccountHTML();
        break;
    case '/edit-user':
        if (request.method === 'POST') {
            editUser(request, response);
            return;
        }
        response.statusCode = 302;
        response.setHeader('Location', name ? `/user/${name}` : '/');
        response.end();
        return;
    case '/login':
        if (request.method === 'POST') {
            logIn(request, response);
            return;
        }
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/html');
        content = renderLoginHTML();
        break;
    case '/logout':
        logOut(request, response);
        return;
    case '/logout/others':
        logOutOthers(request, response);
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
        content = fs.readFileSync('public/img/404.jpg');
        break;
    case '/favicon.ico':
        response.statusCode = 200;
        response.setHeader('Content-Type', 'image/vnd');
        content = fs.readFileSync(`public/img${path}`);
        break;
    case '/apple-touch-icon.png':
    case '/favicon-16.png':
    case '/favicon-32.png':
    case '/favicon-192.png':
    case '/favicon-512.png':
        response.statusCode = 200;
        response.setHeader('Content-Type', 'image/png');
        content = fs.readFileSync(`public/img${path}`);
        break;
    default:
        response.statusCode = 404;
        response.setHeader('Content-Type', 'text/html');
        content = render404HTML();
        break;
    }

    response.setHeader('Content-Length', Buffer.byteLength(content));
    response.setHeader('Expires', new Date().toUTCString());
    response.end(content);
});

server.listen(Common.port, Common.hostname, () => {
    console.log(`Server running at ${Common.server}/`);
});

function handlePostRequest(request) {
    return new Promise((resolve, reject) => {
        if (request.method !== 'POST') {
            const error = {
                statusCode: 400, // HTTP 400: Bad Request
                message: `ERROR: Request method is ${request.method}, not POST.`,
            };
            return reject(error);
        }
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });
        request.on('end', () => {
            resolve(body);
        });
    });
}

function downloadTasks(request, response, name) {
    response.setHeader('Cache-Control', 'no-cache');
    handlePostRequest(request)
        .then(() => {
            const tasks = Task.getTasks(name);
            response.statusCode = 200; // HTTP 200: OK
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify(tasks));
        })
        .catch(error => {
            console.error(error.message);
            response.statusCode = error.statusCode;
            response.end(error.message);
        });
}

function uploadTasks(request, response, name) {
    response.setHeader('Cache-Control', 'no-cache');
    handlePostRequest(request)
        .then(body => {
            response.statusCode = 200; // HTTP 200: OK
            const tasks = JSON.parse(body);
            const bytes = Buffer.byteLength(body);
            console.log(tasks, bytes);
            Task.setTasks(name, tasks);
            response.end(`Server received ${bytes} bytes.`);
        })
        .catch(error => {
            console.error(error.message);
            response.statusCode = error.statusCode;
            response.end(error.message);
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
    response.setHeader('Cache-Control', 'no-cache');
    handlePostRequest(request)
        .then(body => {
            const data = JSON.parse(body);
            const user = { name: data.name };
            const userError = User.edit(user, data.password, data.newPassword);
            response.statusCode = userError ? 400 : 200; // 400: Bad Request, 200: OK
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify(userError));
        })
        .catch(error => {
            console.error(error.message);
            response.statusCode = error.statusCode;
            response.end(error.message);
        });
}

function createAccount(request, response) {
    response.setHeader('Cache-Control', 'no-cache');
    handlePostRequest(request)
        .then(body => {
            const data = JSON.parse(body);
            const user = { name: data.name };
            const userError = User.create(user, data.password);
            if (!userError) {
                const session = User.logIn(data.name, data.password);
                setSessionCookie(response, session);
                response.statusCode = 201; // HTTP 201: Created
            } else {
                response.statusCode = 409; // HTTP 409: Conflict
            }
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify(userError));
        })
        .catch(error => {
            console.error(error.message);
            response.statusCode = error.statusCode;
            response.end(error.message);
        });
}

function logIn(request, response) {
    response.setHeader('Cache-Control', 'no-cache');
    handlePostRequest(request)
        .then(body => {
            const data = JSON.parse(body);
            const session = User.logIn(data.name, data.password);
            let userError = '';
            if (session.ID) {
                setSessionCookie(response, session);
                response.statusCode = 200; // HTTP 200: OK
            } else {
                userError = 'The username or password is incorrect.';
                response.statusCode = 401; // HTTP 401: Unauthorized
            }
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify(userError));
        })
        .catch(error => {
            console.error(error.message);
            response.statusCode = error.statusCode;
            response.end(error.message);
            return;
        });
}

function logOut(request, response) {
    if (request.headers.cookie) {
        const data = querystring.parse(request.headers.cookie);
        const sessionID = decodeURIComponent(data.sessionID);
        User.logOut(sessionID);
    }
    response.statusCode = 302;
    response.setHeader('Location', '/login');
    response.setHeader('Set-Cookie', 'sessionID=""; Max-Age=0');
    response.end();
}

function logOutOthers(request, response) {
    if (request.headers.cookie) {
        const data = querystring.parse(request.headers.cookie);
        const sessionID = decodeURIComponent(data.sessionID);
        User.logOutOthers(sessionID);
    }
    response.statusCode = 302;
    response.setHeader('Location', request.headers.referer);
    response.end();
}

function renderHTML(title, body, headers = '') {
    headers = HTML.stylesheet('/main.css') + headers;
    headers += HTML.icon('/apple-touch-icon.png', '180x180');
    headers += HTML.icon('/favicon.ico', '48x48', 'vnd');
    for (const size of [16, 32, 192, 512]) {
        headers += HTML.icon(`/favicon-${size}.png`, `${size}x${size}`);
    }
    return HTML.render(title, body, headers, 'en-us');
}

function render404HTML() {
    const title = 'HTTP 404: Page Not Found';
    const body = `<header><h1>${title}</h1></header>
<img src="/404.jpg" alt="Vincent Vega looks confused.">`;
    return renderHTML(title, body);
}

function renderNavHTML(name) {
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

function renderTasksHTML(name) {
    const title = 'ToDo: Node';
    const nav = renderNavHTML(name);
    let body = `<header><h1>${title}</h1>${nav}</header>`;
    let headers = '';
    if (name) {
        body += '<form id="tasks"><ul></ul></form>';
        headers = HTML.script('client.js', true);
    }
    return renderHTML(title, body, headers);
}

function renderUserHTML(name) {
    const title = name;
    const nav = renderNavHTML(name);

    const user = User.getUser(name);
    const created = new Date(user.created);
    const createdPretty = created.toLocaleDateString('en-us', { dateStyle: 'long' });

    const tasks = Task.getTasks(name);
    const tasksLinkText = `${tasks.length} ${(tasks.length === 1) ? 'task': 'tasks'}`;
    const tasksLink = `<a href="/">${tasksLinkText}</a>`;

    const sessionIDs = User.getSessionIDs(name);
    const otherSessions = sessionIDs.length - 1;
    let logOutOthers = `${otherSessions} other session${(otherSessions === 1) ? '' : 's'}`;
    if (otherSessions > 0) {
        logOutOthers = `<a href="/logout/others">Log out ${logOutOthers}</a>`;
    }

    const size = 30;
    const body = `<header><h1>${title}</h1>${nav}</header>
<p>Member since: ${createdPretty}</p>
<p>${tasksLink}</p>
<p>${logOutOthers}</p>
<form method="post" id="edit-user">
<input type="hidden" name="name" value="${name}">
<div>
    <input size="${size}" maxlength="${Common.passMax}" placeholder="old password" type="password" name="password" required>
    <span id="valid-password"></span>
</div>
<div>
    <input size="${size}" maxlength="${Common.passMax}" placeholder="new password" type="password" name="newPassword" required>
    <span id="valid-new-password"></span>
    <span id="password-strength"></span>
</div>
<button type="submit">Change Password</button>
<p id="auth-feedback"></p>
</form>`;
    const headers = HTML.script('/edit-user.js', true);
    return renderHTML(title, body, headers);
}

function renderLoginHTML(title = 'Log In', id = 'login') {
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
    <span id="password-strength"></span>
</div>
<button type="submit">${title}</button>
<p id="auth-feedback"></p>
</form>`;
    const headers = HTML.script('/login.js', true);
    return renderHTML(title, body, headers);
}

function renderAccountHTML() {
    return renderLoginHTML('Create an Account', 'create-account');
}
