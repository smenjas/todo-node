export default class HTML {
    static render(title = '', body = '', headers = '', language = 'en') {
        title = HTML.escape(title);
        return `<!DOCTYPE html>
<html lang="${language}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
${headers}
</head>
<body>
${body}
</body>
</html>`;
    }

    static stylesheet(href) {
        href = HTML.escape(href);
        return `<link rel="stylesheet" href="${href}">\n`;
    }

    static script(src, module = false) {
        src = HTML.escape(src);
        const moduleAttr = (module) ? ' type="module"' : '';
        return `<script src="${src}"${moduleAttr} defer></script>\n`;
    }

    static icon(href, sizes = null, format = 'png') {
        href = HTML.escape(href);
        const sizesAttr = (sizes) ? ` sizes="${sizes}"` : '';
        const rel = (href.includes('apple-touch-icon')) ? 'apple-touch-icon' : 'icon';
        return `<link rel="${rel}" type="image/${format}" href="${href}"${sizesAttr}>\n`;
    }

    static escape(str) {
        return str.replaceAll('&', '&amp;')
           .replaceAll('<', '&lt;')
           .replaceAll('>', '&gt;')
           .replaceAll('"', '&quot;')
           .replaceAll("'", '&#39;');
    }
};
