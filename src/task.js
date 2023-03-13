'use strict';

const fs = require('fs');

module.exports = class Task {
    static setTasks(tasks) {
        fs.writeFile('../data/tasks.json', JSON.stringify(tasks), error => {
            if (error) {
                console.error(error);
            }
        });
    }
}
