import Common from '../src/common.js';

const tests = {};

tests["Username requirements are enforced."] = () => {
    let failures = [];
    const names = {
        '': false,
        '1': true,
        'A': true,
        '🤠': false,
        'Alice': true,
        'Αλίκη': false, // Greek
        'Алиса': false, // Russian
        '爱丽丝': false, // Simplified Chinese
        'อลิซ': false, // Thai
        'Username_is_max': true,
        'Username_is_long': false,
    };
    // Printable, non-word ASCII characters
    const chars = ' !"#$%&\'()*+,-./:;<=>?@[\]^`{|}~'
    for (const char of chars) {
        const name = `alice${char}`;
        names[name] = false;
    }
    for (const name in names) {
        const result = Common.validateName(name);
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
        const result = Common.validatePassword(password);
        if (result !== passwords[password]) {
            const action = (result) ? "rejected" : "accepted";
            failures.push(`Password not ${action}: ${password}`);
        }
    }
    return failures;
};

tests["Entropy calculations make sense."] = () => {
    let failures = [];
    const strings = {
        '': 0,
        '1234567890123aA_': 105,
        '12345678901234567890123456789aA_': 210,
        '1234567890123456789012345678901234567890123456789012345678901aA_': 420,
    };
    for (const string in strings) {
        const result = Common.calculateEntropy(string);
        if (result !== strings[string]) {
            failures.push(`${result} not ${strings[string]} for: ${string}`);
        }
    }
    return failures;
};

export default tests;
