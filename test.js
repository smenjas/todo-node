import commonTests from './tests/common.js';
import htmlTests from './tests/html.js';
import sessionTests from './tests/session.js';
import userTests from './tests/user.js';

let totalFailures = 0;

function runTests(tests) {
    for (const [name, test] of Object.entries(tests)) {
        const failures = test();
        totalFailures += failures.length;
        console.log(failures.length ? "\x1b[41mFAIL\x1b[0m" : "\x1b[32mPASS\x1b[0m", name);
        for (const failure of failures) {
            console.log(`\t${failure}`);
        }
    }
}

runTests(commonTests);
runTests(htmlTests);
runTests(sessionTests);
runTests(userTests);

if (totalFailures) {
    console.log(totalFailures, "tests failed.");
} else {
    console.log("All tests passed.");
}
