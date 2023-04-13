// Code shared by client and server.
export default class Common {
    static hostname = '127.0.0.1';
    static port = 3000;
    static server = `http://${Common.hostname}:${Common.port}`;
    static nameMin = 1;
    static nameMax = 15;
    static passMin = 16;
    static passMax = 64;
    static taskMax = 70;

    static calculateEntropy(string) {
        if (!string.length) {
            return 0;
        }
        let combos = 0;
        if (/[a-z]/.test(string)) {
            combos += 26;
        }
        if (/[A-Z]/.test(string)) {
            combos += 26;
        }
        if (/[0-9]/.test(string)) {
            combos += 10;
        }
        if (/[^0-9a-zA-Z]/.test(string)) {
            combos += 33;
        }
        const entropy = string.length * Math.log(combos) / Math.LN2;
        return Math.round(entropy);
    }

    static validateName(name) {
        // Restrict usernames to Latin letters, Hindu-Arabic numerals, underscore, and hyphen.
        const re = new RegExp(`^\\w{${Common.nameMin},${Common.nameMax}}$`);
        return re.test(name);
    }

    static validatePassword(password) {
        // Restrict passwords to ASCII printable characters.
        const re = new RegExp(`^[\\x20-\\x7E]{${Common.passMin},${Common.passMax}}$`);
        return re.test(password);
    }
};
