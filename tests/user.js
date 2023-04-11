'use strict';

const User = require('../src/user.js');

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

tests["Username requirements are enforced."] = () => {
    let failures = [];

    // Get the printable, non-word ASCII decimals.
    const decimals = [];
    for (let d = 32; d <= 44; d++) {
        decimals.push(d);
    }
    decimals.push(46);
    decimals.push(47);
    for (let d = 58; d <= 64; d++) {
        decimals.push(d);
    }
    for (let d = 91; d <= 94; d++) {
        decimals.push(d);
    }
    decimals.push(96);
    for (let d = 123; d <= 126; d++) {
        decimals.push(d);
    }

    // Get the printable, non-word ASCII characters.
    const chars = [];
    for (const decimal of decimals) {
        chars.push(String.fromCodePoint(decimal));
    }

    const names = {
        '': false,
        'Alice': true,
        'Αλίκη': false, // Greek
        'Алиса': false, // Russian
        '爱丽丝': false, // Simplified Chinese
        'อลิซ': false, // Thai
        'Username_is_max': true,
        'Username_is_long': false,
    };
    for (const char of chars) {
        const name = `alice${char}`;
        names[name] = false;
    }
    for (const name in names) {
        const result = User.validateName(name);
        if (result !== names[name]) {
            const action = (result) ? "rejected" : "accepted";
            failures.push(`Username not ${action}: ${name}`);
        }
    }
    return failures;
};

tests["Password requirements are enforced."] = () => {
    let failures = [];
    const passwords = {
        'This is my password.': true,
        'Short password.': false,
        'Αυτός είναι ο κωδικός πρόσβασής μου.': false, // Greek
        'Это мой пароль.': false, // Russian
        '这是我的密码。': false, // Simplified Chinese
        'นี่คือรหัสผ่านของฉัน': false, // Thai
    };
    for (const password in passwords) {
        //console.log(password, new Blob([password]).size);
        const result = User.validatePassword(password);
        if (result !== passwords[password]) {
            const action = (result) ? "rejected" : "accepted";
            failures.push(`Password not ${action}: ${password}`);
        }
    }
    return failures;
};

module.exports = tests;
