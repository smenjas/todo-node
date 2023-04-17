import AJAX from '/ajax.js';
import Auth from '/auth.js';
import Common from '/common.js';

function makeAuthHandler(statuses) {
    return () => {
        if (AJAX.request.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (!statuses.includes(AJAX.request.status)) {
            return;
        }
        error = JSON.parse(AJAX.request.responseText);
        if (error) {
            document.querySelector('#auth-feedback').innerHTML = error;
            return;
        }
        window.location.href = '/';
    };
}

const form = document.querySelector('form');
if (!form) {
    throw new Error('form does not exist');
}

let error;
const nameInput = document.querySelector('[name=name]');
const nameIndicator = document.querySelector('#valid-name');
const passwordInput = document.querySelector('[name=password]');
const passwordIndicator = document.querySelector('#valid-password');

Auth.validateInput(nameInput, nameIndicator, Common.validateName);
Auth.validateInput(passwordInput, passwordIndicator, Common.validatePassword);
Auth.checkPassword(passwordInput);

form.onsubmit = event => {
    event.preventDefault();
    const data = {
        name: event.target.elements.name.value,
        password: event.target.elements.password.value,
    };
    const url = `/${form.id}`;
    const statuses = (form.id === 'login') ? [200, 401] : [201, 409];
    AJAX.processForm(url, data, makeAuthHandler(statuses));
    if (form.id === 'create-account') {
        Auth.signalValidity(nameInput, nameIndicator, !error);
    }
};
