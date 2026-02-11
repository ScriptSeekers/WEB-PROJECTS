document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const strengthBar = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');

    // Requirements Elements
    const reqLength = document.getElementById('req-length');
    const reqNumber = document.getElementById('req-number');
    const reqLowercase = document.getElementById('req-lowercase');
    const reqUppercase = document.getElementById('req-uppercase');
    const reqSymbol = document.getElementById('req-symbol');

    // Toggle Password Visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        // Toggle Icon
        togglePassword.classList.toggle('fa-eye');
        togglePassword.classList.toggle('fa-eye-slash');
    });

    // Check Password Strength
    passwordInput.addEventListener('input', () => {
        const value = passwordInput.value;
        const result = checkStrength(value);
        updateUI(result, value);
    });

    function checkStrength(password) {
        let score = 0;
        let checks = {
            length: password.length >= 8,
            number: /\d/.test(password),
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            symbol: /[^A-Za-z0-9]/.test(password)
        };

        if (checks.length) score++;
        if (checks.number) score++;
        if (checks.lowercase) score++;
        if (checks.uppercase) score++;
        if (checks.symbol) score++;

        return { score, checks };
    }

    function updateUI(result, password) {
        // Update Requirements List
        updateRequirement(reqLength, result.checks.length);
        updateRequirement(reqNumber, result.checks.number);
        updateRequirement(reqLowercase, result.checks.lowercase);
        updateRequirement(reqUppercase, result.checks.uppercase);
        updateRequirement(reqSymbol, result.checks.symbol);

        // Calculate Width and Color
        let width = (result.score / 5) * 100;
        let color = '#ff4d4d'; // Red (Very Weak)
        let text = 'Very Weak';

        if (password.length === 0) {
            width = 0;
            text = '';
        } else if (result.score <= 2) {
            color = '#ff4d4d'; // Red
            text = '😟 Weak';
        } else if (result.score === 3) {
            color = '#ffd700'; // Yellow
            text = '😐 Medium';
        } else if (result.score === 4) {
            color = '#00d2ff'; // Blue
            text = '🙂 Strong';
        } else if (result.score === 5) {
            color = '#2ecc71'; // Green
            text = '😎 Very Strong';
        }

        strengthBar.style.width = `${width}%`;
        strengthBar.style.backgroundColor = color;
        strengthText.textContent = text;
        strengthText.style.color = color;
    }

    function updateRequirement(element, isValid) {
        const icon = element.querySelector('i');
        if (isValid) {
            element.classList.add('valid');
            icon.className = 'fas fa-check-circle';
        } else {
            element.classList.remove('valid');
            icon.className = 'fas fa-circle';
        }
    }
});
