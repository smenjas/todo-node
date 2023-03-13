'use strict';

const fs = require('fs');
const crypto = require('crypto');

module.exports = class User {
    static create(user, password) {
        const users = User.getUsers();

        if (user.name in users) {
            const error =`The username ${user.name} already exists.`;
            console.log(error);
            return { success: false, errors: { name: error } };
        }

        user.salt = User.createSalt();
        user.hash = User.hashPassword(password, user.salt);
        user.created = Date.now();
        console.log(user);

        users[user.name] = user;
        User.setUsers(users);

        return { success: true };
    }

    static getUsers() {
        try {
            const json = fs.readFileSync('../data/users.json', 'utf8');
            return JSON.parse(json);
        }
        catch (e) {
            console.log(e);
        }

        return {};
    }

    static setUsers(users) {
        fs.writeFile('../data/users.json', JSON.stringify(users), error => {
            if (error) {
                console.error(error);
            }
        });
    }

    static createSalt() {
        return crypto.randomBytes(16).toString('hex');
    }

    static hashPassword(password, salt) {
        const iterations = 1000;
        const keylen = 64;
        password = password.toString().normalize();
        return crypto.pbkdf2Sync(password, salt, iterations, keylen, 'sha512').toString('hex');
    }
}
