(function() {
    "use strict";

    // ── Navbar blur on scroll ───────────────────────
    window.addEventListener('scroll', function() {
        var nav = document.getElementById('navbar');
        if (nav) {
            if (window.scrollY > 20) {
                nav.classList.add('bg-space-dark/80', 'backdrop-blur-md', 'border-b', 'border-white/5');
            } else {
                nav.classList.remove('bg-space-dark/80', 'backdrop-blur-md', 'border-b', 'border-white/5');
            }
        }
    });

    // ── Scroll animations ───────────────────────────
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

    // ── Modal logic (Contact) ───────────────────────
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
        if (!modalOverlay) return;
        formOpenedAt = Date.now();
        fieldsTouched = 0;
        var check = document.getElementById('jiffy_check');
        if (check) check.value = 'ok';
        if (formContainer) formContainer.classList.remove('hidden');
        if (successMessage) {
            successMessage.classList.add('hidden');
            successMessage.classList.remove('flex');
        }
        if (contactForm) contactForm.reset();
        if (formError) {
            formError.textContent = '';
            formError.classList.add('hidden');
        }

        modalOverlay.classList.remove('hidden');
        setTimeout(function() {
            modalOverlay.classList.remove('opacity-0');
            if (modalBox) {
                modalBox.classList.remove('scale-95');
                modalBox.classList.add('scale-100');
            }
        }, 10);
    };

    window.closeModal = function() {
        if (!modalOverlay) return;
        modalOverlay.classList.add('opacity-0');
        if (modalBox) {
            modalBox.classList.remove('scale-100');
            modalBox.classList.add('scale-95');
        }
        setTimeout(function() {
            modalOverlay.classList.add('hidden');
        }, 300);
    };

    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) { window.closeModal(); }
        });
    }

    var btnNavModal = document.getElementById('btnNavModal');
    if (btnNavModal) {
        btnNavModal.addEventListener('click', function(e) {
            window.openModal();
            var planField = document.getElementById('planSeleccionado');
            if (planField) planField.value = e.target.getAttribute('data-plan');
        });
    }

    var btnCloseModal = document.getElementById('btnCloseModal');
    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', window.closeModal);
    }

    document.querySelectorAll('.glass-card button').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            window.openModal();
            var planField = document.getElementById('planSeleccionado');
            if (planField) planField.value = e.target.getAttribute('data-plan');
        });
    });

    ['nombre', 'organizacion', 'telefono', 'correo'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) {
            el.addEventListener('focus', function() {
                fieldsTouched = Math.min(fieldsTouched + 1, 99);
            }, { once: false });
        }
    });

    function sanitize(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;').trim();
    }

    function isValidCRPhone(phone) {
        var cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
        return /^(506)?[2-8]\d{7}$/.test(cleaned);
    }

    function isValidEmail(email) {
        return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(email);
    }

    function showError(msg) {
        if (formError) {
            formError.textContent = msg;
            formError.classList.remove('hidden');
        }
    }

    var lastSubmitTime = 0;
    var SUBMIT_COOLDOWN = 8000;
    var SECURITY_TOKEN = 'j1ff7ry-2026-s3cur3-t0k3n-C4mb14r3st0';

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (formError) { formError.textContent = ''; formError.classList.add('hidden'); }

            var consentimiento = document.getElementById('consentimiento');
            if (consentimiento && !consentimiento.checked) {
                showError('Debés aceptar la Política de Privacidad.');
                return;
            }

            var now = Date.now();
            if (now - lastSubmitTime < SUBMIT_COOLDOWN) {
                showError('Espera unos segundos.');
                return;
            }

            var rawNombre = document.getElementById('nombre').value;
            var rawOrg = document.getElementById('organizacion').value;
            var rawTel = document.getElementById('telefono').value;
            var rawCorreo = document.getElementById('correo').value;
            var planField = document.getElementById('planSeleccionado');

            var nombre = sanitize(rawNombre);
            var organizacion = sanitize(rawOrg);
            var telefono = sanitize(rawTel);
            var correo = sanitize(rawCorreo);

            if (nombre.length < 2 || !isValidCRPhone(telefono) || !isValidEmail(correo)) {
                showError('Revisa los campos.');
                return;
            }

            lastSubmitTime = now;
            var originalText = submitBtn.innerText;
            submitBtn.innerText = 'Enviando...';
            submitBtn.disabled = true;

            var scriptURL = 'https://script.google.com/macros/s/AKfycbxv6dAon1JGx568-_x1dS0WT3IgjgfybHHyi7KTTm-MhjklwkuIJpPWfxNYet5319jI/exec';
            var formData = {
                nombre: nombre, organizacion: organizacion, telefono: telefono, correo: correo,
                plan: (planField ? planField.value : 'No especificado') || 'No especificado',
                token: SECURITY_TOKEN, submittedAt: now
            };

            fetch(scriptURL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(formData)
            })
            .then(function(r) { return r.json(); })
            .then(function(data) {
                if (data.result === 'success') {
                    if (formContainer) formContainer.classList.add('hidden');
                    if (successMessage) {
                        successMessage.classList.remove('hidden');
                        successMessage.classList.add('flex');
                    }
                    setTimeout(function() { window.closeModal(); submitBtn.innerText = originalText; submitBtn.disabled = false; }, 4000);
                } else {
                    showError(data.error || 'Error.');
                    submitBtn.innerText = originalText; submitBtn.disabled = false;
                }
            })
            .catch(function() {
                showError('Error de red.');
                submitBtn.innerText = originalText; submitBtn.disabled = false;
            });
        });
    }

    // ── Privacy Policy Modal ────────────────────
    var privacyOverlay = document.getElementById('privacyOverlay');
    var privacyBox = document.getElementById('privacyBox');
    window.openPrivacyModal = function() {
        if (!privacyOverlay) return;
        privacyOverlay.classList.remove('hidden');
        setTimeout(function() { privacyOverlay.classList.remove('opacity-0'); if (privacyBox) { privacyBox.classList.remove('scale-95'); privacyBox.classList.add('scale-100'); } }, 10);
    };
    window.closePrivacyModal = function() {
        if (!privacyOverlay) return;
        privacyOverlay.classList.add('opacity-0');
        if (privacyBox) { privacyBox.classList.remove('scale-100'); privacyBox.classList.add('scale-95'); }
        setTimeout(function() { privacyOverlay.classList.add('hidden'); }, 300);
    };
    var btnClosePrivacy = document.getElementById('btnClosePrivacy');
    if (btnClosePrivacy) btnClosePrivacy.addEventListener('click', window.closePrivacyModal);
    var btnClosePrivacyUnderstand = document.getElementById('btnClosePrivacyUnderstand');
    if (btnClosePrivacyUnderstand) btnClosePrivacyUnderstand.addEventListener('click', window.closePrivacyModal);
    if (privacyOverlay) privacyOverlay.addEventListener('click', function(e) { if (e.target === privacyOverlay) window.closePrivacyModal(); });

    ['linkPrivacyFooter', 'linkPrivacyForm', 'linkPrivacyCookie'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('click', function(e) { e.preventDefault(); window.openPrivacyModal(); });
    });

    // ── Cookie Consent Banner ───────────────────
    var cookieBanner = document.getElementById('cookieBanner');
    var btnAcceptCookies = document.getElementById('btnAcceptCookies');
    if (btnAcceptCookies) btnAcceptCookies.addEventListener('click', function() {
        localStorage.setItem('jifftry_cookies_accepted', 'true');
        if (cookieBanner) { cookieBanner.classList.add('opacity-0'); setTimeout(function() { cookieBanner.classList.add('hidden'); }, 300); }
    });
    if (cookieBanner && !localStorage.getItem('jifftry_cookies_accepted')) cookieBanner.classList.remove('hidden');

    // ── Blog search & filters ──────────────────
    var blogSearch = document.getElementById('blogSearch');
    var blogEmpty = document.getElementById('blogEmpty');
    var activeFilter = 'todas';

    function applyBlogFilters() {
        var q = (blogSearch ? blogSearch.value.trim().toLowerCase() : '');
        var visible = 0;
        document.querySelectorAll('[id^="blogPost"]').forEach(function(el) {
            var cat = el.getAttribute('data-category');
            var text = el.textContent.toLowerCase();
            var matchFilter = (activeFilter === 'todas' || cat === activeFilter);
            var matchSearch = (q === '' || text.indexOf(q) !== -1);
            var show = matchFilter && matchSearch;
            el.style.display = show ? '' : 'none';
            if (show) visible++;
        });
        if (blogEmpty) blogEmpty.classList.toggle('hidden', visible > 0);
    }

    if (blogSearch) blogSearch.addEventListener('input', applyBlogFilters);

    var filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            activeFilter = btn.getAttribute('data-filter');
            filterBtns.forEach(function(b) {
                b.classList.remove('bg-pastel-purple', 'text-space-dark', 'border-pastel-purple');
                b.classList.add('text-slate-300');
            });
            btn.classList.add('bg-pastel-purple', 'text-space-dark', 'border-pastel-purple');
            btn.classList.remove('text-slate-300');
            applyBlogFilters();
        });
    });

    // ── Favicon redondo ─────────────────────────
    var faviconImg = new Image();
    faviconImg.onload = function() {
        var size = 64; var c = document.createElement('canvas'); c.width = size; c.height = size;
        var ctx = c.getContext('2d'); ctx.beginPath(); ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(faviconImg, 0, 0, size, size);
        var link = document.createElement('link'); link.rel = 'icon'; link.type = 'image/png'; link.href = c.toDataURL('image/png'); document.head.appendChild(link);
    };
    faviconImg.src = 'img/favicon-jifftry.png';

})();
