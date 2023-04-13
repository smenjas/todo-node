import AJAX from '/ajax.js';
import Common from '/common.js';

function checkPassword(input) {
    const p = document.createElement('p');
    input.form.append(p);
    input.addEventListener('input', event => {
        const entropy = Common.calculateEntropy(input.value);
        p.innerHTML = createPasswordMeter(entropy);
    });
}

function createPasswordMeter(entropy) {
    const min = 0; // Empty
    const low = 104; // 16 bytes, using all character classes, minus one
    const high = 210; // 32 bytes, using all character classes
    const max = 420; // 64 bytes, using all character classes
    let strength = (entropy >= high) ? "High" : (entropy > low) ? "Medium" : "Low";
    return `<meter min="${min}" max="${max}" low="${low}" high="${high}" optimum="${max}" value="${entropy}">Password strength: ${strength}</meter>`;
}

function createAccount(data) {
    const callback = () => {
        if (AJAX.request.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (AJAX.request.status !== 201 && AJAX.request.status !== 409) {
            return;
        }

        const result = JSON.parse(AJAX.request.responseText);

        if (result.success) {
            window.location.href = '/';
        }

        signalValidity(nameInput, nameSpan, result.success);

        const p = document.createElement('p');
        p.innerHTML = result.errors.name;
        form.append(p);
    };
    const url = `${Common.server}/create-account`;
    AJAX.processForm(url, data, callback);
}

function signalValidity(input, indicator, valid) {
    const colors = {
        true: '#a6edb2',
        false: '#842e98',
    };
    input.form.querySelector('[type=submit]').disabled = !valid;
    input.style.outlineColor = colors[`${valid}`];
    indicator.innerHTML = (valid) ? '' : '❌';
}

function validateInput(input, validate) {
    const span = document.createElement('span');
    input.insertAdjacentElement('afterend', span);
    input.addEventListener('input', event => {
        const valid = validate(input.value);
        signalValidity(input, span, valid);
    });
    return span;
}

const form = document.querySelector('form#create-account');
if (form) {
    const nameInput = document.querySelector('[name=name]');
    const passwordInput = document.querySelector('[name=password]');

    const nameSpan = validateInput(nameInput, Common.validateName);
    validateInput(passwordInput, Common.validatePassword);
    checkPassword(passwordInput);

    form.onsubmit = (event) => {
        event.preventDefault();
        const data = {
            name: event.target.elements.name.value,
            password: event.target.elements.password.value,
        };
        createAccount(data);
    };
}
