import AJAX from '/ajax.js';
import Auth from '/auth.js';
import Common from '/common.js';

function handleEditUserResponse() {
    if (AJAX.request.readyState !== XMLHttpRequest.DONE) {
        return;
    }
    if (AJAX.request.status !== 200 && AJAX.request.status !== 400) {
        return;
    }
    const error = JSON.parse(AJAX.request.responseText);
    const feedback = document.querySelector('#auth-feedback');
    feedback.innerHTML = error ? error : 'You have changed your password.';
}

const form = document.querySelector('form');
if (!form) {
    throw new Error('form does not exist');
}

const oldPasswordInput = document.querySelector('[name=password]');
const newPasswordInput = document.querySelector('[name=newPassword]');
const oldPasswordIndicator = document.querySelector('#valid-password');
const newPasswordIndicator = document.querySelector('#valid-new-password');

Auth.validateInput(oldPasswordInput, oldPasswordIndicator, Common.validatePassword);
Auth.validateInput(newPasswordInput, newPasswordIndicator, Common.validatePassword);
Auth.checkPassword(newPasswordInput);

form.onsubmit = event => {
    event.preventDefault();
    const data = {
        name: event.target.elements.name.value,
        password: event.target.elements.password.value,
        newPassword: event.target.elements.newPassword.value,
    };
    AJAX.processForm('/edit-user', data, handleEditUserResponse);
    event.target.elements.password.value = '';
    event.target.elements.newPassword.value = '';
};
