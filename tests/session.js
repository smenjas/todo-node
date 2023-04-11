import Session from '../src/session.js';

const tests = {};

tests["Session ID meets requirements."] = () => {
    let failures = [];
    const sessionID = Session.generate();
    if (sessionID.length !== 24) {
        failures.push(`Session ID length is: ${sessionID.length}`);
    }
    return failures;
};

export default tests;
