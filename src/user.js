import fs from 'fs';
import crypto from 'crypto';
import Common from './common.js';
import Session from './session.js';

export default class User {
    static create(user, password) {
        user.name = user.name.toLowerCase();
        const users = User.getUsers();

        if (user.name in users) {
            const error =`The username ${user.name} already exists.`;
            console.log(error);
            return { success: false, errors: { name: error } };
        }

        if (!Common.validateName(user.name)) {
            const error = "Invalid username";
            console.log(error);
            return { success: false, errors: { name: error } };
        }

        if (!Common.validatePassword(password)) {
            const error = "Invalid password";
            console.log(error);
            return { success: false, errors: { password: error } };
        }

        user.salt = User.createSalt();
        user.hash = User.hashPassword(password, user.salt);
        user.created = Date.now();
        console.log(user);

        users[user.name] = user;
        User.setUsers(users);

        return { success: true };
    }

    static logIn(name, password) {
        const users = User.getUsers();

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
        console.log("Logging out:", name);
        Session.delete(sessionID);
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
        try {
            fs.writeFileSync('../data/users.json', JSON.stringify(users));
        }
        catch (e) {
            console.error(error);
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
