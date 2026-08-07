(function() {
    "use strict";

    // Navbar blur on scroll
    window.addEventListener('scroll', function() {
        var nav = document.getElementById('navbar');
        if (window.scrollY > 20) {
            nav.classList.add('bg-space-dark/80', 'backdrop-blur-md', 'border-b', 'border-white/5');
        } else {
            nav.classList.remove('bg-space-dark/80', 'backdrop-blur-md', 'border-b', 'border-white/5');
        }
    });

    // Scroll animations
    var observer = new IntersectionObserver(function(entries, obs) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in-up').forEach(function(el) {
        observer.observe(el);
    });

    // Modal logic
    var modalOverlay = document.getElementById('modalOverlay');
    var modalBox = document.getElementById('modalBox');
    var formContainer = document.getElementById('formContainer');
    var successMessage = document.getElementById('successMessage');
    var contactForm = document.getElementById('contactForm');
    var formError = document.getElementById('formError');
    var submitBtn = document.getElementById('submitBtn');

    var formOpenedAt = 0;
    var fieldsTouched = 0;

    window.openModal = function() {
        formOpenedAt = Date.now();
        fieldsTouched = 0;
        document.getElementById('jiffy_check').value = 'ok';
        document.getElementById('planSeleccionado').value = '';
        formContainer.classList.remove('hidden');
        successMessage.classList.add('hidden');
        successMessage.classList.remove('flex');
        contactForm.reset();
        hideError();

        modalOverlay.classList.remove('hidden');
        setTimeout(function() {
            modalOverlay.classList.remove('opacity-0');
            modalBox.classList.remove('scale-95');
            modalBox.classList.add('scale-100');
        }, 10);
    };

    window.closeModal = function() {
        modalOverlay.classList.add('opacity-0');
        modalBox.classList.remove('scale-100');
        modalBox.classList.add('scale-95');

        setTimeout(function() {
            modalOverlay.classList.add('hidden');
        }, 300);
    };

            modalOverlay.addEventListener('click', function(e) {
                if (e.target === modalOverlay) { window.closeModal(); }
            });

            // Button event listeners (reemplazan los onclick inline)
            document.getElementById('btnNavModal').addEventListener('click', function(e) {
                document.getElementById('planSeleccionado').value = e.target.getAttribute('data-plan');
                window.openModal();
            });
            document.getElementById('btnCloseModal').addEventListener('click', window.closeModal);
            document.querySelectorAll('.glass-card button').forEach(function(btn) {
                btn.addEventListener('click', function(e) {
                    document.getElementById('planSeleccionado').value = e.target.getAttribute('data-plan');
                    window.openModal();
                });
            });

            // Human interaction tracking
    ['nombre', 'organizacion', 'telefono', 'correo'].forEach(function(id) {
        document.getElementById(id).addEventListener('focus', function() {
            fieldsTouched = Math.min(fieldsTouched + 1, 99);
        }, { once: false });
    });

    // Sanitizer
    function sanitize(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;')
            .trim();
    }

    // Validators
    function isValidCRPhone(phone) {
        var cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
        return /^(506)?[2-8]\d{7}$/.test(cleaned);
    }

    function isValidEmail(email) {
        return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(email);
    }

    function showError(msg) {
        formError.textContent = msg;
        formError.classList.remove('hidden');
    }

    function hideError() {
        formError.textContent = '';
        formError.classList.add('hidden');
    }

    // Rate limiting
    var lastSubmitTime = 0;
    var SUBMIT_COOLDOWN = 8000;

    var SECURITY_TOKEN = 'j1ff7ry-2026-s3cur3-t0k3n-C4mb14r3st0';

    // Form submission
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        hideError();

        // Honeypot 1 check
        var honeypot = document.getElementById('website');
        if (honeypot && honeypot.value.trim() !== '') {
            formContainer.classList.add('hidden');
            successMessage.classList.remove('hidden');
            successMessage.classList.add('flex');
            return;
        }

        // Honeypot 2 check
        if (document.getElementById('jiffy_check').value !== 'ok') {
            formContainer.classList.add('hidden');
            successMessage.classList.remove('hidden');
            successMessage.classList.add('flex');
            return;
        }

        // Time-based detection
        var now = Date.now();
        var timeSinceOpen = (now - formOpenedAt) / 1000;
        if (timeSinceOpen < 4) {
            showError('Por favor completa el formulario con calma.');
            return;
        }
        if (timeSinceOpen > 7200) {
            showError('La sesión expiró. Cierra y abre de nuevo el formulario.');
            return;
        }

        // Interaction check
        if (fieldsTouched < 2) {
            showError('Por favor revisa todos los campos antes de enviar.');
            return;
        }

        // Cooldown
        if (now - lastSubmitTime < SUBMIT_COOLDOWN) {
            var remaining = Math.ceil((SUBMIT_COOLDOWN - (now - lastSubmitTime)) / 1000);
            showError('Por favor espera ' + remaining + ' segundos antes de enviar de nuevo.');
            return;
        }

        // Gather & sanitize
        var rawNombre = document.getElementById('nombre').value;
        var rawOrg = document.getElementById('organizacion').value;
        var rawTel = document.getElementById('telefono').value;
        var rawCorreo = document.getElementById('correo').value;

        var nombre = sanitize(rawNombre);
        var organizacion = sanitize(rawOrg);
        var telefono = sanitize(rawTel);
        var correo = sanitize(rawCorreo);

        // Validate
        if (nombre.length < 2) {
            showError('Ingresa un nombre válido (mínimo 2 caracteres).');
            return;
        }
        if (organizacion.length < 1) {
            showError('Ingresa el nombre de tu organización.');
            return;
        }
        if (!isValidCRPhone(telefono)) {
            showError('Ingresa un número de teléfono válido de Costa Rica (ej. 8888-8888).');
            return;
        }
        if (!isValidEmail(correo)) {
            showError('Ingresa un correo electrónico válido.');
            return;
        }

        // Send
        lastSubmitTime = now;
        var originalText = submitBtn.innerText;
        submitBtn.innerText = 'Enviando al espacio...';
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-75');

        var scriptURL = 'https://script.google.com/macros/s/AKfycbxv6dAon1JGx568-_x1dS0WT3IgjgfybHHyi7KTTm-MhjklwkuIJpPWfxNYet5319jI/exec';

        var formData = {
            nombre: nombre,
            organizacion: organizacion,
            telefono: telefono,
            correo: correo,
            plan: document.getElementById('planSeleccionado').value || 'No especificado',
            token: SECURITY_TOKEN,
            submittedAt: now
        };

        fetch(scriptURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(formData)
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.result === 'duplicate') {
                showError(data.error || 'Este correo ya está registrado.');
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
                submitBtn.classList.remove('opacity-75');
                return;
            }
            if (data.result === 'error') {
                showError(data.error || 'Error del servidor.');
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
                submitBtn.classList.remove('opacity-75');
                return;
            }
            formContainer.classList.add('hidden');
            successMessage.classList.remove('hidden');
            successMessage.classList.add('flex');

            setTimeout(function() {
                window.closeModal();
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
                submitBtn.classList.remove('opacity-75');
            }, 4000);
        })
        .catch(function(error) {
            console.error('Error de red:', error);
            submitBtn.innerText = 'Error - Intenta de nuevo';
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-75');

            setTimeout(function() {
                submitBtn.innerText = originalText;
            }, 3000);
        });
    });

})();
