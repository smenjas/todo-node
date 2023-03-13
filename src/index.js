const fs = require('fs');
const http = require('http');
const url = require('url');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((request, response) => {
    const path = url.parse(request.url).pathname;
    let content = '';

    switch (path) {
        case '/':
        case '/index.html':
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
