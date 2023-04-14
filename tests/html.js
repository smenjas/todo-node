import HTML from '../src/html.js';

const tests = {};

tests["HTML gets created correctly."] = () => {
    let failures = [];
    const pages = {};
    const html = `<!DOCTYPE html>
<html lang="en-us">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>R&amp;D</title>
<meta name="author" content="Anonymous">
</head>
<body>
<h1>R&amp;D</h1>
</body>
</html>`;
    pages[html] = {
        title: 'R&D',
        body: '<h1>R&amp;D</h1>',
        headers: '<meta name="author" content="Anonymous">',
        language: 'en-us',
    };
    for (const [expected, page] of Object.entries(pages)) {
        const result = HTML.create(page.title, page.body, page.headers, page.language);
        if (result !== expected) {
            failures.push(`${JSON.stringify(page)} became: ${result}`);
        }
    }
    return failures;
};

tests["HTML special characters get escaped."] = () => {
    let failures = [];
    const chars = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    };
    for (const [unsafe, safe] of Object.entries(chars)) {
        const result = HTML.escape(unsafe);
        if (result !== safe) {
            failures.push(`${unsafe} became: ${result}`);
        }
    }
    return failures;
};

tests["CSS links get created correctly."] = () => {
    let failures = [];
    const stylesheets = {
        '<link rel="stylesheet" href="style.css">': 'style.css',
    };
    for (const [expected, href] of Object.entries(stylesheets)) {
        const result = HTML.createExternalCSS(href);
        if (result !== expected) {
            failures.push(`${href} became: ${result} not ${expected}`);
        }
    }
    return failures;
};

tests["Script tags get created correctly."] = () => {
    let failures = [];
    const scripts = {
        '<script src="index.js" defer></script>': {
            src: 'index.js',
        },
        '<script src="client.js" type="module" defer></script>': {
            src: 'client.js',
            module: true,
        },
    };
    for (const [expected, script] of Object.entries(scripts)) {
        const result = HTML.createExternalJS(script.src, script.module);
        if (result !== expected) {
            failures.push(`${JSON.stringify(script)} became: ${result}`);
        }
    }
    return failures;
};

tests["Favicons get created correctly."] = () => {
    let failures = [];
    const favicons = {
        '<link rel="icon" type="image/vnd" href="favicon.ico" sizes="48x48">': {
            href: 'favicon.ico',
            sizes: '48x48',
            format: 'vnd'
        },
        '<link rel="apple-touch-icon" type="image/png" href="apple-touch-icon.png" sizes="180x180">': {
            href: 'apple-touch-icon.png',
            sizes: '180x180',
        },
    };
    for (const [expected, favicon] of Object.entries(favicons)) {
        const result = HTML.createFavicon(favicon.href, favicon.sizes, favicon.format);
        if (result !== expected) {
            failures.push(`${JSON.stringify(favicon)} became: ${result}`);
        }
    }
    return failures;
};

export default tests;
