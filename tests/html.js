import HTML from '../src/html.js';

const tests = {};

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
