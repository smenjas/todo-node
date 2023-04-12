import Common from '/common.js';

function validateInput(element, validate) {
    const colors = {
        true: 'green',
        false: 'red',
    };

    element.addEventListener('input', event => {
        const valid = validate(element.value);
        element.style.outlineColor = colors[`${valid}`];
    });
}

validateInput(document.querySelector('[name=name]'), Common.validateName);
validateInput(document.querySelector('[name=password]'), Common.validatePassword);
