function toggleColorScheme() {
    const currentStyle = document.querySelector('link[rel="stylesheet"]');
    
    if (currentStyle.getAttribute('href') === 'green.css') {
        currentStyle.setAttribute('href', 'red.css');
    } else {
        currentStyle.setAttribute('href', 'green.css');
    }
}

function toggleSkillsSection() {
    const skillsSection = document.getElementById('umiejetnosci');
    const currentDisplay = window.getComputedStyle(skillsSection).display;
    
    if (currentDisplay === 'none') {
        skillsSection.style.display = 'block';
    } else {
        skillsSection.style.display = 'none';
    }
}

function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function hasDigits(value) {
    return /\d/.test(value);
}

document.addEventListener('DOMContentLoaded', function() {
    const interactionContainer = document.createElement('div');
    interactionContainer.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 1000; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);';
    
    const colorButton = document.createElement('button');
    colorButton.textContent = '🎨 Zmień kolor';
    colorButton.style.cssText = 'padding: 10px 15px; margin-bottom: 10px; margin-right: 10px; border: none; border-radius: 5px; background: #2e8b57; color: white; cursor: pointer; font-size: 14px; font-weight: bold;';
    colorButton.addEventListener('click', toggleColorScheme);
    colorButton.addEventListener('mouseover', function() { this.style.background = '#1f6f47'; });
    colorButton.addEventListener('mouseout', function() { this.style.background = '#2e8b57'; });
    
    const toggleButton = document.createElement('button');
    toggleButton.textContent = '👁️ Przełącz Umiejętności';
    toggleButton.style.cssText = 'padding: 10px 15px; border: none; border-radius: 5px; background: #c62828; color: white; cursor: pointer; font-size: 14px; font-weight: bold;';
    toggleButton.addEventListener('click', toggleSkillsSection);
    toggleButton.addEventListener('mouseover', function() { this.style.background = '#8e1b1b'; });
    toggleButton.addEventListener('mouseout', function() { this.style.background = '#c62828'; });
    
    interactionContainer.appendChild(colorButton);
    interactionContainer.appendChild(toggleButton);
    document.body.appendChild(interactionContainer);

    const contactForm = document.getElementById('contactForm');

    if (!contactForm) {
        return;
    }

    const fields = {
        firstName: contactForm.querySelector('#firstName'),
        lastName: contactForm.querySelector('#lastName'),
        email: contactForm.querySelector('#email'),
        message: contactForm.querySelector('#message')
    };

    const errors = {
        firstName: contactForm.querySelector('#firstNameError'),
        lastName: contactForm.querySelector('#lastNameError'),
        email: contactForm.querySelector('#emailError'),
        message: contactForm.querySelector('#messageError')
    };

    const formStatus = contactForm.querySelector('#formStatus');

    function setFieldError(fieldName, message) {
        const field = fields[fieldName];
        const errorElement = errors[fieldName];

        errorElement.textContent = message;
        field.classList.toggle('input-error', message.length > 0);
    }

    function validateField(fieldName) {
        const value = fields[fieldName].value.trim();

        if (!value) {
            setFieldError(fieldName, 'To pole jest wymagane.');
            return false;
        }

        if ((fieldName === 'firstName' || fieldName === 'lastName') && hasDigits(value)) {
            setFieldError(fieldName, 'To pole nie może zawierać cyfr.');
            return false;
        }

        if (fieldName === 'email' && !validateEmail(value)) {
            setFieldError(fieldName, 'Podaj poprawny adres e-mail.');
            return false;
        }

        setFieldError(fieldName, '');
        return true;
    }

    Object.keys(fields).forEach(function(fieldName) {
        fields[fieldName].addEventListener('blur', function() {
            validateField(fieldName);
        });

        fields[fieldName].addEventListener('input', function() {
            if (errors[fieldName].textContent) {
                validateField(fieldName);
            }
        });
    });

    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const isFormValid = Object.keys(fields).every(function(fieldName) {
            return validateField(fieldName);
        });

        formStatus.classList.remove('success', 'error');

        if (!isFormValid) {
            formStatus.textContent = 'Popraw błędy w formularzu.';
            formStatus.classList.add('error');
            return;
        }

        formStatus.textContent = 'Success';
        formStatus.classList.add('success');
        contactForm.reset();
    });
});
