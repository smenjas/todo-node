import Common from '/common.js';

export default class Auth {
    static checkPassword(input) {
        const feedback = document.querySelector('#auth-feedback');
        const strength = document.querySelector('#password-strength');
        input.addEventListener('input', () => {
            const entropy = Common.calculateEntropy(input.value);
            feedback.innerHTML = '';
            strength.innerHTML = Auth.createPasswordMeter(entropy);
        });
    }

    static createPasswordMeter(entropy) {
        const min = 0; // Empty
        const low = 104; // 16 bytes, using all character classes, minus one
        const high = 210; // 32 bytes, using all character classes
        const max = 420; // 64 bytes, using all character classes
        const strength = (entropy >= high) ? 'High' : (entropy > low) ? 'Medium' : 'Low';
        return `<meter min="${min}" max="${max}" low="${low}" high="${high}" optimum="${max}" value="${entropy}">Password strength: ${strength}</meter>`;
    }

    static signalValidity(input, indicator, valid) {
        const colors = {
            true: '#a6edb2',
            false: '#842e98',
        };
        input.form.querySelector('[type=submit]').disabled = !valid;
        input.style.outlineColor = colors[`${valid}`];
        indicator.innerHTML = valid ? '' : '❌';
    }

    static validateInput(input, indicator, validate) {
        input.addEventListener('input', () => {
            const valid = validate(input.value);
            Auth.signalValidity(input, indicator, valid);
        });
    }
}
