'use strict';

const fs = require('fs');
const crypto = require('crypto');

const Session = require('./session.js');

module.exports = class User {
    static create(user, password) {
        const users = User.getUsers();

        if (user.name in users) {
            const error =`The username ${user.name} already exists.`;
            console.log(error);
            return { success: false, errors: { name: error } };
        }

        if (!/[\w-]/.test(user.name)) {
            const error =`The username ${user.name} contains illegal characters.`;
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

    static logIn(name, password) {
        const users = User.getUsers();

        if (!(name in users)) {
            console.log(`The username ${name} does not exist, log in failed.`);
            return '';
        }

        const user = users[name];
        const hash = User.hashPassword(password, user.salt);

        if (hash !== user.hash) {
            console.log(`Incorrect password, log in failed.`);
            return '';
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
        const sessions = Session.getAll();
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