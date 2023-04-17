import fs from 'fs';

const files = fs.readdirSync('./tests', {withFileTypes: true})
    .filter(item => !item.isDirectory())
    .map(item => item.name)
    .filter(name => name.endsWith('.js'));

let totalFailures = 0;

function runTests(tests) {
    for (const [name, test] of Object.entries(tests)) {
        const failures = test();
        totalFailures += failures.length;
        console.log(failures.length ? '\x1b[41mFAIL\x1b[0m' : '\x1b[32mPASS\x1b[0m', name);
        for (const failure of failures) {
            console.log(`\t${failure}`);
        }
    }
}

for (const file of files) {
    const tests = await import(`./tests/${file}`);
    runTests(tests.default);
}

if (totalFailures) {
    const happened = (totalFailures === 1) ? 'test failed.' : 'tests failed.';
    console.log(totalFailures, happened);
    throw new Error(`${totalFailures} ${happened}`);
}

console.log('All tests passed.');
