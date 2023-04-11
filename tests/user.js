import User from '../src/user.js';

const tests = {};

tests["Salt meets requirements."] = () => {
    let failures = [];
    const salt = User.createSalt();
    if (salt.length !== 32) {
        failures.push(`Salt length is: ${salt.length}`);
    }
    if (!/^[0-9a-f]+$/.test(salt)) {
        failures.push("Salt contains non-hexadecimal digits.");
    }
    return failures;
};

tests["Hash meets requirements."] = () => {
    let failures = [];
    const salt = User.createSalt();
    const hash = User.hashPassword('12345', salt);
    if (hash.length !== 128) {
        failures.push(`Hash length is: ${hash.length}`);
    }
    return failures;
};

export default tests;
