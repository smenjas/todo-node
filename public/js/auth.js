import Common from '/common.js';

function validateInput(element, validate) {
    const colors = {
        true: '#a6edb2',
        false: '#842e98',
    };

    element.addEventListener('input', event => {
        const valid = validate(element.value);
        element.style.outlineColor = colors[`${valid}`];
    });
}

validateInput(document.querySelector('[name=name]'), Common.validateName);
validateInput(document.querySelector('[name=password]'), Common.validatePassword);
