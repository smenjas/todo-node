'use strict';

const fs = require('fs');

module.exports = class Task {
    static setTasks(name, tasks) {
        fs.writeFile(`../data/tasks/${name}.json`, JSON.stringify(tasks), error => {
            if (error) {
                console.error(error);
            }
        });
    }
}
