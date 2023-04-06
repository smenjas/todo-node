'use strict';

const fs = require('fs');
const crypto = require('crypto');

module.exports = class Session {
    static getAll() {
        try {
            const json = fs.readFileSync('../data/sessions.json', 'utf8');
            return JSON.parse(json);
        }
        catch (e) {
            console.log("Caught Exception, path does not exist:", e.path);
        }

        return {};
    }

    static setAll(sessions) {
        fs.writeFile('../data/sessions.json', JSON.stringify(sessions), error => {
            if (error) {
                console.error(error);
            }
        });
    }

    static delete(sessionID) {
        if (sessionID === undefined) {
            return;
        }
        const sessions = User.getSessions();
        if (!(sessionID in sessions)) {
            console.log("sessionID not found:", sessionID);
            return;
        }
        delete sessions[sessionID];
        User.setSessions(sessions);
    }

    static create(name) {
        const sessions = User.getSessions();
        let sessionID = '';
        do {
            sessionID = crypto.randomBytes(16).toString('base64');
        } while (sessionID in sessions);
        const now = new Date();
        const expires = now.setMonth(now.getMonth() + 1);
        sessions[sessionID] = {
            name: name,
            expires: expires,
        };
        User.setSessions(sessions);
        return {
            ID: sessionID,
            expires: expires,
        };
    }
}
