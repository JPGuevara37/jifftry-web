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

    // ── Blog Data ──────────────────────────────
    var blogPosts = {
        'blogPost1': {
            category: 'Inteligencia Artificial', color: 'pastel-purple', date: '6 de agosto, 2026',
            title: 'Google lanza Gemini Pro 3: La IA que programa, razona y crea como nunca',
            icon: '<svg class="w-20 h-20 text-pastel-purple/90 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"/></svg>',
            content: `<p>Google acaba de anunciar <strong class="text-white">Gemini Pro 3</strong>, la tercera generación de su modelo de inteligencia artificial multimodal. Con una puntuación del <strong class="text-pastel-green">92.7% en HumanEval</strong> y <strong class="text-pastel-green">94.1% en MATH</strong>, este modelo supera a sus competidores en tareas técnicas.</p><h3 class="text-lg font-semibold text-white mt-6 mb-3">Características principales:</h3><ul class="list-disc pl-5 space-y-2"><li>Ventana de contexto de 2 millones de tokens.</li><li>Modo agente autónomo capaz de ejecutar herramientas externas.</li><li>Generación de video nativa en un solo modelo.</li></ul><p class="mt-4">Este avance permite a los negocios automatizar la atención al cliente con una naturalidad sin precedentes.</p>`
        },
        'blogPost2': {
            category: 'Tecnología', color: 'pastel-green', date: '5 de agosto, 2026',
            title: 'Computación cuántica comercial: IBM abre su primer centro en Latinoamérica',
            icon: '<svg class="w-16 h-16 text-pastel-green/80 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"/></svg>',
            content: `<p>IBM ha inaugurado su primer <strong class="text-pastel-blue">Quantum Data Center</strong> en Sao Paulo, Brasil. Este hito permite que empresas latinoamericanas accedan a hardware cuántico de última generación con latencias mínimas.</p><p class="mt-4">Las aplicaciones en optimización logística y ciberseguridad post-cuántica son los campos con mayor potencial inmediato para la región.</p>`
        },
        'blogPost3': {
            category: 'E-commerce', color: 'pastel-pink', date: '4 de agosto, 2026',
            title: 'Comercio electrónico en Costa Rica crece 34% en el último año',
            icon: '<svg class="w-16 h-14 text-pastel-pink/80 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>',
            content: `<p>El mercado digital tico vive su mejor momento con un crecimiento del <strong class="text-pastel-green">34.2%</strong> interanual. La madurez de SINPE Móvil y la integración con WhatsApp Business han sido factores clave.</p><p class="mt-4">Jifftry se posiciona como el aliado estratégico para que las PYMES aprovechen esta ola de digitalización.</p>`
        }
    };

    var blogOverlay = document.getElementById('blogOverlay');
    var blogBox = document.getElementById('blogBox');
    var btnCloseBlog = document.getElementById('btnCloseBlog');
    var blogContentContainer = document.getElementById('blogContentContainer');
    window.openBlogModal = function(postId) {
        var post = blogPosts[postId];
        if (!post || !blogContentContainer || !blogOverlay) return;
        blogContentContainer.innerHTML = `<div class="h-48 bg-gradient-to-br from-${post.color}/40 to-pastel-blue/40 flex items-center justify-center relative"><div class="absolute inset-0 bg-space-dark/30"></div>${post.icon}</div><div class="p-8"><span class="text-xs text-${post.color} font-medium bg-${post.color}/10 px-3 py-1 rounded-full">${post.category}</span><span class="text-xs text-slate-500 ml-3">${post.date}</span><h2 class="text-2xl md:text-3xl font-bold text-white mt-4 mb-6">${post.title}</h2><div class="prose prose-invert prose-sm text-slate-300 space-y-4">${post.content}</div></div>`;
        blogOverlay.classList.remove('hidden');
        setTimeout(function() { blogOverlay.classList.remove('opacity-0'); if (blogBox) { blogBox.classList.remove('scale-95'); blogBox.classList.add('scale-100'); } }, 10);
    };
    window.closeBlogModal = function() {
        if (!blogOverlay) return;
        blogOverlay.classList.add('opacity-0');
        if (blogBox) { blogBox.classList.remove('scale-100'); blogBox.classList.add('scale-95'); }
        setTimeout(function() { blogOverlay.classList.add('hidden'); }, 300);
    };
    if (btnCloseBlog) btnCloseBlog.addEventListener('click', window.closeBlogModal);
    if (blogOverlay) blogOverlay.addEventListener('click', function(e) { if (e.target === blogOverlay) window.closeBlogModal(); });
    ['blogPost1', 'blogPost2', 'blogPost3'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('click', function() { window.openBlogModal(id); });
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
