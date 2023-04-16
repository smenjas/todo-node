import Common from '../src/common.js';
import User from '../src/user.js';

const tests = {};

tests['Salt meets requirements.'] = () => {
    let failures = [];
    let count = 0;
    const salts = {};
    while (count++ < 1e4) {
        const salt = User.createSalt();
        const entropy = Common.calculateEntropy(salt, true);
        if (entropy < 128) { // 32 hexadecimal digits
            failures.push(`Salt ${salt} entropy is: ${entropy}`);
        }
        if (salt in salts) {
            failures.push(`Salt ${salt} appeared again!`);
        } else {
            salts[salt] = entropy;
        }
    }
    return failures;
};

tests['Hash meets requirements.'] = () => {
    let failures = [];
    let count = 0;
    const hashes = {};
    while (count++ < 3) {
        const salt = User.createSalt();
        const hash = User.hashPassword('12345', salt);
        const entropy = Common.calculateEntropy(hash, true);
        if (entropy < 512) { // 128 hexadecimal digits
            failures.push(`Hash length is: ${hash.length}`);
            failures.push(`Hash ${hash} entropy is: ${entropy}`);
        }
        if (hash in hashes) {
            failures.push(`Hash ${hash} appeared again!`);
        } else {
            hashes[hash] = entropy;
        }
    }
    return failures;
};

export default tests;
