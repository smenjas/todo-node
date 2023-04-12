export default class AJAX {
    static request;

    static describeRequestState(readyState) {
        switch (readyState) {
            case XMLHttpRequest.UNSENT:
                return "AJAX connection has not been opened yet.";
            case XMLHttpRequest.OPENED:
                return "AJAX request opened and in progress.";
            case XMLHttpRequest.HEADERS_RECEIVED:
                return "AJAX request sent, headers and status are available.";
            case XMLHttpRequest.LOADING:
                return "AJAX request in progress.";
            case XMLHttpRequest.DONE:
                return "AJAX request complete.";
            default:
                return "ERROR: AJAX state not recognized.";
        }
    }

    static handleHttpResponse() {
        try {
            if ((AJAX.request.status === 0 && AJAX.request.readyState === XMLHttpRequest.OPENED) ||
                (AJAX.request.status === 200 && AJAX.request.readyState !== XMLHttpRequest.DONE)) {
                // No need to spam the console for nominal requests in progress.
                return;
            }
            const requestStatus = AJAX.describeRequestState(AJAX.request.readyState);
            const responseText = (AJAX.request.responseText.length > 128) ?
                AJAX.request.responseText.substring(0, 128) + "..." :
                AJAX.request.responseText;
            let logMessage = `${requestStatus} ${responseText}`;
            if (AJAX.request.status !== 0) {
                logMessage = `HTTP ${AJAX.request.status} ${AJAX.request.statusText}, ${logMessage}`;
            }
            console.log(logMessage);
        }
        catch (e) {
            console.log("Caught Exception:", e.description);
        }
    };

    static post(url) {
        AJAX.request = new XMLHttpRequest();
        AJAX.request.onreadystatechange = AJAX.handleHttpResponse;
        AJAX.request.open("POST", url, true);
        return AJAX.request;
    }

    static processForm(url, data, callback) {
        AJAX.request = AJAX.post(url);
        AJAX.request.onload = callback;
        AJAX.request.onerror = () => {
            console.error(AJAX.request.statusText);
        };
        AJAX.request.setRequestHeader("Content-Type", "application/json");
        AJAX.request.send(JSON.stringify(data));
    }

    static download(url, callback) {
        AJAX.request = AJAX.post(url);
        AJAX.request.onload = callback;
        AJAX.request.onerror = () => {
            console.error(AJAX.request.statusText);
        };
        AJAX.request.send();
    }

    static upload(url, data) {
        AJAX.request = AJAX.post(url);
        AJAX.request.setRequestHeader("Content-Type", "application/json");
        AJAX.request.send(JSON.stringify(data));
    }
};
