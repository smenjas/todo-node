import Common from '../src/common.js';
import Session from '../src/session.js';

const tests = {};

tests['Session ID meets requirements.'] = () => {
    let failures = [];
    let count = 0;
    const sessionIDs = {};
    const entropies = {};
    while (count++ < 1e4) {
        const sessionID = Session.generate();
        const entropy = Common.calculateEntropy(sessionID);
        if (entropy < 141) { // 24 bytes, with two character classes
            failures.push(`Session ID ${sessionID} entropy is: ${entropy}`);
        }
        if (sessionID in sessionIDs) {
            failures.push(`Session ID ${sessionID} appeared again!`);
        } else {
            sessionIDs[sessionID] = entropy;
        }
        if (!Object.hasOwn(entropies, entropy)) {
            //entropies[entropy] = sessionID;
        }
    }
    //console.log(entropies);
    return failures;
};

tests['Expired sessions get pruned.'] = () => {
    let failures = [];
    let count = -2;
    const now = Date.now();
    const sessions = {};
    while (count++ < 0) {
        const sessionID = Session.generate();
        sessions[sessionID] = {
            name: 'ryan',
            expires: now - (count * 86400000),
        };
    }
    //console.log(sessions);
    Session.prune(sessions);
    //console.log(sessions);
    for (const sessionID in sessions) {
        const session = sessions[sessionID];
        if (session.expires <= now) {
            failures.push(`Did not prune session that expired ${now - session.expires} seconds before the cutoff.`);
        }
    }
    return failures;
};

export default tests;
