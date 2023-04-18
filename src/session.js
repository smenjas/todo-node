import fs from 'fs';
import crypto from 'crypto';

export default class Session {
    static get all() {
        try {
            const json = fs.readFileSync('../data/sessions.json', 'utf8');
            return JSON.parse(json);
        }
        catch (e) {
            console.log('Caught Exception, path does not exist:', e.path);
        }
        return {};
    }

    static set all(sessions) {
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
        const sessions = Session.all;
        if (!(sessionID in sessions)) {
            console.log('sessionID not found:', sessionID);
            return;
        }
        delete sessions[sessionID];
        Session.all = sessions;
    }

    static create(name) {
        const sessions = Session.all;
        let sessionID = '';
        do {
            sessionID = Session.generate();
        } while (sessionID in sessions);
        const now = new Date();
        const expires = now.setMonth(now.getMonth() + 1);
        sessions[sessionID] = {
            name: name,
            expires: expires,
        };
        Session.all = sessions;
        return {
            ID: sessionID,
            expires: expires,
        };
    }

    static generate() {
        return crypto.randomBytes(16).toString('base64');
    }

    static prune(sessions) {
        for (const sessionID in sessions) {
            const session = sessions[sessionID];
            if (session.expires <= Date.now()) {
                delete sessions[sessionID];
                const expires = new Date(session.expires);
                console.log(`Deleted ${session.name}'s session ID '${sessionID}' that expired at ${expires.toISOString()}.`);
            }
        }
    }
}
