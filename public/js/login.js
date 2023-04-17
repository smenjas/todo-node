import AJAX from '/ajax.js';
import Auth from '/auth.js';
import Common from '/common.js';

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

        Auth.signalValidity(nameInput, nameIndicator, !error);
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

const feedback = document.querySelector('#auth-feedback');

let nameInput, passwordInput, nameIndicator, passwordIndicator;

let form = document.querySelector('form#create-account');
if (form) {
    nameInput = document.querySelector('[name=name]');
    passwordInput = document.querySelector('[name=password]');

    nameIndicator = document.querySelector('#valid-name');
    passwordIndicator = document.querySelector('#valid-password');

    Auth.validateInput(nameInput, nameIndicator, Common.validateName);
    Auth.validateInput(passwordInput, passwordIndicator, Common.validatePassword);
    Auth.checkPassword(passwordInput);

    form.onsubmit = event => {
        event.preventDefault();
        const data = {
            name: event.target.elements.name.value,
            password: event.target.elements.password.value,
        };
        createAccount(data);
    };
}

form = document.querySelector('form#login');
if (form) {
    nameInput = document.querySelector('[name=name]');
    passwordInput = document.querySelector('[name=password]');

    nameIndicator = document.querySelector('#valid-name');
    passwordIndicator = document.querySelector('#valid-password');

    Auth.validateInput(nameInput, nameIndicator, Common.validateName);
    Auth.validateInput(passwordInput, passwordIndicator, Common.validatePassword);
    Auth.checkPassword(passwordInput);

    form.onsubmit = event => {
        event.preventDefault();
        const data = {
            name: event.target.elements.name.value,
            password: event.target.elements.password.value,
        };
        logIn(data);
    };
}
