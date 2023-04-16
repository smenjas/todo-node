import fs from 'fs';
import crypto from 'crypto';
import Common from './common.js';
import Session from './session.js';

export default class User {
    static create(user, password) {
        user.name = user.name.toLowerCase();
        const users = User.all;

        if (user.name in users) {
            const error =`The username ${user.name} already exists.`;
            console.log(error);
            return error;
        }

        if (!Common.validateName(user.name)) {
            const error = 'Invalid username';
            console.log(error);
            return error;
        }

        if (!Common.validatePassword(password)) {
            const error = 'Invalid password';
            console.log(error);
            return error;
        }

        user.salt = User.createSalt();
        user.hash = User.hashPassword(password, user.salt);
        user.created = Date.now();
        console.log(user);

        users[user.name] = user;
        User.all = users;

        return '';
    }

    static edit(input, oldPassword, newPassword = null) {
        if (!newPassword) {
            const error = 'Invalid password';
            console.error(input.name, 'provided an empty password');
            return error;
        }

        if (newPassword === oldPassword) {
            const error = 'Passwords are the same';
            console.error(input.name, 'provided the same password');
            return error;
        }

        input.name = input.name.toLowerCase();
        const users = User.all;

        if (!(input.name in users)) {
            const error = 'Invalid username';
            console.error('Username', input.name, 'does not exist');
            return error;
        }

        if (!Common.validatePassword(newPassword)) {
            const error = 'Invalid password';
            console.error(input.name, 'provided an invalid password');
            return error;
        }

        const user = users[input.name];
        const hash = User.hashPassword(oldPassword, user.salt);

        if (hash !== user.hash) {
            const error = 'Incorrect password';
            console.log(input.name, 'provided an incorrect password');
            return error;
        }

        user.salt = User.createSalt();
        user.hash = User.hashPassword(newPassword, user.salt);
        console.log(user);

        users[user.name] = user;
        User.all = users;

        return '';
    }

    static logIn(name, password) {
        const users = User.all;

        if (!(name in users)) {
            console.log(`The username ${name} does not exist, log in failed.`);
            return {};
        }

        const user = users[name];
        const hash = User.hashPassword(password, user.salt);

        if (hash !== user.hash) {
            console.log(`Incorrect password for ${name}, log in failed.`);
            return {};
        }

        return Session.create(name);
    }

    static logOut(sessionID) {
        const name = User.getUserBySessionID(sessionID);
        console.log('Logging out:', name);
        Session.delete(sessionID);
    }

    static getUser(name) {
        if (!name) {
            return;
        }
        const users = User.all;
        if (!(name in users)) {
            return;
        }
        const user = users[name];
        delete user.salt;
        delete user.hash;
        return user;
    }

    static getUserBySessionID(sessionID) {
        if (!sessionID) {
            return;
        }
        const sessions = Session.all;
        if (!(sessionID in sessions)) {
            return;
        }
        const session = sessions[sessionID];
        if (session.expires < Date.now()) {
            console.log(`${session.name}'s session expired at ${session.expires}`);
            Session.delete(sessionID);
            return;
        }
        return session.name;
    }

    static get all() {
        try {
            const json = fs.readFileSync('../data/users.json', 'utf8');
            return JSON.parse(json);
        }
        catch (e) {
            console.log(e);
        }

        return {};
    }

    static set all(users) {
        try {
            fs.writeFileSync('../data/users.json', JSON.stringify(users));
        }
        catch (e) {
            console.error(e);
        }
    }

    static createSalt() {
        return crypto.randomBytes(16).toString('hex');
    }

    static hashPassword(password, salt) {
        const iterations = 210000;
        const keylen = 64;
        password = password.toString().normalize();
        return crypto.pbkdf2Sync(password, salt, iterations, keylen, 'sha512').toString('hex');
    }
};
