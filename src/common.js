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
