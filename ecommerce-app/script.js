document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnIcon = submitBtn.querySelector('.btn-icon');
    const spinner = submitBtn.querySelector('.spinner');

    // Toggle Password Visibility
    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle icon
        const icon = togglePasswordBtn.querySelector('i');
        if (type === 'text') {
            icon.classList.remove('ph-eye');
            icon.classList.add('ph-eye-slash');
        } else {
            icon.classList.remove('ph-eye-slash');
            icon.classList.add('ph-eye');
        }
    });

    // Simple validation functions
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const showError = (element, message) => {
        element.textContent = message;
        element.classList.add('show');
    };

    const hideError = (element) => {
        element.classList.remove('show');
        // Clear text after transition
        setTimeout(() => {
            if(!element.classList.contains('show')) {
                element.textContent = '';
            }
        }, 200);
    };

    // Form Submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let isValid = true;

        // Reset errors
        hideError(emailError);
        hideError(passwordError);

        // Validate Email
        const emailValue = emailInput.value.trim();
        if (!emailValue) {
            showError(emailError, 'Email is required');
            isValid = false;
        } else if (!validateEmail(emailValue)) {
            showError(emailError, 'Please enter a valid email address');
            isValid = false;
        }

        // Validate Password
        const passwordValue = passwordInput.value;
        if (!passwordValue) {
            showError(passwordError, 'Password is required');
            isValid = false;
        } else if (passwordValue.length < 6) {
            showError(passwordError, 'Password must be at least 6 characters');
            isValid = false;
        }

        if (isValid) {
            // Simulate API Call / Login Process
            setLoadingState(true);

            setTimeout(() => {
                setLoadingState(false);
                
                // Get users from localStorage or initialize empty object
                const users = JSON.parse(localStorage.getItem('ecommerce_users') || '{}');
                
                if (users[emailValue]) {
                    // User exists, verify password
                    if (users[emailValue] === passwordValue) {
                        // Login successful
                        handleSuccess(emailValue);
                    } else {
                        // Wrong password
                        showError(passwordError, 'Incorrect password for this email');
                    }
                } else {
                    // User does not exist, register them
                    users[emailValue] = passwordValue;
                    localStorage.setItem('ecommerce_users', JSON.stringify(users));
                    // Auto-login successful
                    handleSuccess(emailValue);
                }

            }, 800);
        }
    });

    function handleSuccess(email) {
        // Save current session
        localStorage.setItem('ecommerce_currentUser', email);

        btnText.textContent = 'Success!';
        btnIcon.classList.remove('ph-arrow-right');
        btnIcon.classList.add('ph-check-circle');
        submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        
        setTimeout(() => {
            if (email.toLowerCase().includes('admin')) {
                window.location.href = 'dashboard.html';
            } else {
                window.location.href = 'customer-dashboard.html';
            }
        }, 600);
    }

    // Clear errors on input
    emailInput.addEventListener('input', () => hideError(emailError));
    passwordInput.addEventListener('input', () => hideError(passwordError));

    function setLoadingState(isLoading) {
        if (isLoading) {
            btnText.textContent = 'Signing in...';
            btnIcon.classList.add('hide');
            spinner.classList.remove('hide');
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.8';
        } else {
            btnText.textContent = 'Sign In';
            btnIcon.classList.remove('hide');
            spinner.classList.add('hide');
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        }
    }
});
