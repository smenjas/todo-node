import AJAX from '/ajax.js';
import Common from '/common.js';

function checkPassword(input) {
    input.addEventListener('input', event => {
        const entropy = Common.calculateEntropy(input.value);
        feedback.innerHTML = '';
        strength.innerHTML = createPasswordMeter(entropy);
    });
}

function createPasswordMeter(entropy) {
    const min = 0; // Empty
    const low = 104; // 16 bytes, using all character classes, minus one
    const high = 210; // 32 bytes, using all character classes
    const max = 420; // 64 bytes, using all character classes
    const strength = (entropy >= high) ? 'High' : (entropy > low) ? 'Medium' : 'Low';
    return `<meter min="${min}" max="${max}" low="${low}" high="${high}" optimum="${max}" value="${entropy}">Password strength: ${strength}</meter>`;
}

function createAccount(data) {
    AJAX.processForm('/create-account', data, () => {
        if (AJAX.request.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (AJAX.request.status !== 201 && AJAX.request.status !== 409) {
            return;
        }

        const error = JSON.parse(AJAX.request.responseText);

        if (!error) {
            window.location.href = '/';
            return;
        }

        signalValidity(nameInput, nameIndicator, !error);
        feedback.innerHTML = error;
    });
}

function logIn(data) {
    AJAX.processForm('/login', data, () => {
        if (AJAX.request.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (AJAX.request.status !== 200 && AJAX.request.status !== 401) {
            return;
        }

        const error = JSON.parse(AJAX.request.responseText);

        if (!error) {
            window.location.href = '/';
            return;
        }

        feedback.innerHTML = error;
    });
}

function editUser(data) {
    AJAX.processForm('/edit-user', data, () => {
        if (AJAX.request.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (AJAX.request.status !== 200 && AJAX.request.status !== 400) {
            return;
        }

        const error = JSON.parse(AJAX.request.responseText);

        feedback.innerHTML = error ? error : 'You have changed your password.';
    });
}

function signalValidity(input, indicator, valid) {
    const colors = {
        true: '#a6edb2',
        false: '#842e98',
    };
    input.form.querySelector('[type=submit]').disabled = !valid;
    input.style.outlineColor = colors[`${valid}`];
    indicator.innerHTML = valid ? '' : '❌';
}

function validateInput(input, indicator, validate) {
    input.addEventListener('input', event => {
        const valid = validate(input.value);
        signalValidity(input, indicator, valid);
    });
}

const feedback = document.querySelector('#auth-feedback');
const strength = document.querySelector('#password-strength');

let form = document.querySelector('form#create-account')
if (form) {
    const nameInput = document.querySelector('[name=name]');
    const passwordInput = document.querySelector('[name=password]');

    const nameIndicator = document.querySelector('#valid-name');
    const passwordIndicator = document.querySelector('#valid-password');

    validateInput(nameInput, nameIndicator, Common.validateName);
    validateInput(passwordInput, passwordIndicator, Common.validatePassword);
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

form = document.querySelector('form#login')
if (form) {
    const nameInput = document.querySelector('[name=name]');
    const passwordInput = document.querySelector('[name=password]');

    const nameIndicator = document.querySelector('#valid-name');
    const passwordIndicator = document.querySelector('#valid-password');

    validateInput(nameInput, nameIndicator, Common.validateName);
    validateInput(passwordInput, passwordIndicator, Common.validatePassword);
    checkPassword(passwordInput);

    form.onsubmit = (event) => {
        event.preventDefault();
        const data = {
            name: event.target.elements.name.value,
            password: event.target.elements.password.value,
        };
        logIn(data);
    };
}

form = document.querySelector('form#edit-user');
if (form) {
    const oldPasswordInput = document.querySelector('[name=password]');
    const newPasswordInput = document.querySelector('[name=newPassword]');

    const oldPasswordIndicator = document.querySelector('#valid-password');
    const newPasswordIndicator = document.querySelector('#valid-newPassword');

    validateInput(oldPasswordInput, oldPasswordIndicator, Common.validatePassword);
    validateInput(newPasswordInput, newPasswordIndicator, Common.validatePassword);
    checkPassword(newPasswordInput);

    form.onsubmit = (event) => {
        event.preventDefault();
        const data = {
            name: event.target.elements.name.value,
            password: event.target.elements.password.value,
            newPassword: event.target.elements.newPassword.value,
        };
        editUser(data);
        event.target.elements.password.value = '';
        event.target.elements.newPassword.value = '';
    };
}
