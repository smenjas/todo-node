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

    static calculateEntropy(string, hex = false) {
        if (!string.length) {
            return 0;
        }
        let combos = 0;
        combos += /[0-9]/.test(string) ? 10 : 0;
        if (hex) {
            combos += /[a-f]/i.test(string) ? 6 : 0;
            if (/[^0-9a-f]/i.test(string)) {
                console.error('Not hexadecimal:', string);
            }
        } else {
            combos += /[a-z]/.test(string) ? 26 : 0;
            combos += /[A-Z]/.test(string) ? 26 : 0;
            combos += /[^0-9a-zA-Z]/.test(string) ? 33 : 0;
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
