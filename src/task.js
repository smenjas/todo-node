'use strict';

const fs = require('fs');

module.exports = class Task {
    static getTasks(name) {
        try {
            const json = fs.readFileSync(`../data/tasks/${name}.json`, 'utf8');
            return JSON.parse(json);
        }
        catch (e) {
            console.log(e);
        }

        return {};
    }

    static setTasks(name, tasks) {
        fs.writeFile(`../data/tasks/${name}.json`, JSON.stringify(tasks), error => {
            if (error) {
                console.error(error);
            }
        });
    }
}
