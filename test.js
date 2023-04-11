'use strict';

const userTests = require('./tests/user.js');

function runTests(tests) {
    let totalFailures = 0;
    for (const [name, test] of Object.entries(tests)) {
        const failures = test();
        totalFailures += failures.length;
        console.log(failures.length ? "\x1b[31mFAIL\x1b[0m" : "\x1b[32mPASS\x1b[0m", name);
        for (const failure of failures) {
            console.log(`\t${failure}`);
        }
    }
    if (totalFailures) {
        console.log(totalFailures, "tests failed.");
    } else {
        console.log("All tests passed.");
    }
}

runTests(userTests);
