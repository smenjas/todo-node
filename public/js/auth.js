import Common from '/common.js';

const nameInput = document.querySelector('[name=name]');
nameInput.addEventListener('input', event => {
    const valid = Common.validateName(event.target.value);
    console.log(event.target.value, valid);
    event.target.style.outlineColor = (valid) ? 'green' : 'red';
});

const passwordInput = document.querySelector('[name=password]');
passwordInput.addEventListener('input', event => {
    const valid = Common.validatePassword(event.target.value);
    console.log(event.target.value, valid);
    event.target.style.outlineColor = (valid) ? 'green' : 'red';
});
