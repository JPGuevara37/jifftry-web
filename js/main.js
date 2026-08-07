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
            category: 'IA', filter: 'IA', image: 'img/blog/post1.svg', color: 'pastel-purple', date: '6 de agosto, 2026',
            title: 'Google lanza Gemini Pro 3: La IA que programa, razona y crea como nunca',
            icon: '<svg class="w-20 h-20 text-pastel-purple/90 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"/></svg>',
            content: `<p>Google acaba de anunciar <strong class="text-white">Gemini Pro 3</strong>, la tercera generación de su modelo de inteligencia artificial multimodal. Con una puntuación del <strong class="text-pastel-green">92.7% en HumanEval</strong> y <strong class="text-pastel-green">94.1% en MATH</strong>, este modelo supera a sus competidores en tareas técnicas.</p><h3 class="text-lg font-semibold text-white mt-6 mb-3">Características principales:</h3><ul class="list-disc pl-5 space-y-2"><li>Ventana de contexto de 2 millones de tokens.</li><li>Modo agente autónomo capaz de ejecutar herramientas externas.</li><li>Generación de video nativa en un solo modelo.</li></ul><p class="mt-4">Este avance permite a los negocios automatizar la atención al cliente con una naturalidad sin precedentes.</p>`
        },
        'blogPost2': {
            category: 'Tecnología', filter: 'Tecnología', image: 'img/blog/post2.svg', color: 'pastel-green', date: '5 de agosto, 2026',
            title: 'Computación cuántica comercial: IBM abre su primer centro en Latinoamérica',
            icon: '<svg class="w-16 h-16 text-pastel-green/80 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"/></svg>',
            content: `<p>IBM ha inaugurado su primer <strong class="text-pastel-blue">Quantum Data Center</strong> en Sao Paulo, Brasil. Este hito permite que empresas latinoamericanas accedan a hardware cuántico de última generación con latencias mínimas.</p><p class="mt-4">Las aplicaciones en optimización logística y ciberseguridad post-cuántica son los campos con mayor potencial inmediato para la región.</p>`
        },
        'blogPost3': {
            category: 'E-commerce', filter: 'E-commerce', image: 'img/blog/post3.svg', color: 'pastel-pink', date: '4 de agosto, 2026',
            title: 'Comercio electrónico en Costa Rica crece 34% en el último año',
            icon: '<svg class="w-16 h-14 text-pastel-pink/80 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>',
            content: `<p>El mercado digital tico vive su mejor momento con un crecimiento del <strong class="text-pastel-green">34.2%</strong> interanual. La madurez de SINPE Móvil y la integración con WhatsApp Business han sido factores clave.</p><p class="mt-4">Jifftry se posiciona como el aliado estratégico para que las PYMES aprovechen esta ola de digitalización.</p>`
        },
        'blogPost4': {
            category: 'WhatsApp', filter: 'WhatsApp', image: 'img/blog/post4.svg', color: 'pastel-blue', date: '3 de agosto, 2026',
            title: 'WhatsApp Business: vende más sin pagar publicidad',
            icon: '<svg class="w-16 h-16 text-pastel-blue/80 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 20.5c7.18 0 10-7.5 10-8.5a9 9 0 10-18 0c0 1.5 2.82 8.5 10 8.5zM8.5 8.5c-1 1-1 2 0 3l2 2 4 4c1 1 2 1 3 0l1.5-1.5c.5-.5.5-1.5 0-2l-1.5-1.5-1 1-4-4 1-1L12 7a1.4 1.4 0 000-2L10.5 3.5c-.5-.5-1.5-.5-2 0z"/></svg>',
            content: `<p>WhatsApp sigue siendo la app más usada en Costa Rica y tu negocio puede aprovecharla al máximo <strong class="text-pastel-blue">sin invertir un solo colón en anuncios</strong>.</p><h3 class="text-lg font-semibold text-white mt-6 mb-3">Qué puedes hacer hoy:</h3><ul class="list-disc pl-5 space-y-2"><li>Crear un catálogo de productos directamente en WhatsApp Business.</li><li>Configurar mensajes de bienvenida y respuestas rápidas.</li><li>Recibir pedidos y cotizaciones en un solo chat organizado.</li></ul><p class="mt-4">Con Jifftry, los pedidos de WhatsApp se integran a tu inventario automáticamente.</p>`
        },
        'blogPost5': {
            category: 'Ciberseguridad', filter: 'Ciberseguridad', image: 'img/blog/post5.svg', color: 'pastel-yellow', date: '2 de agosto, 2026',
            title: '5 errores de seguridad que cometen las PYMES',
            icon: '<svg class="w-16 h-16 text-pastel-yellow/80 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12.75L11.25 15L15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>',
            content: `<p>Las PYMES son el objetivo favorito de los ciberatacantes porque suelen tener menos protecciones. Evita estos 5 errores comunes:</p><ul class="list-disc pl-5 space-y-2"><li><strong class="text-white">Contraseñas débiles o repetidas</strong>: usa un gestor y contraseñas únicas.</li><li><strong class="text-white">No activar la verificación en dos pasos</strong> en correo y WhatsApp Business.</li><li><strong class="text-white">Descuidar las actualizaciones</strong> de tu tienda, plugins y sistema.</li><li><strong class="text-white">Conectar a WiFi públicas sin VPN</strong> para gestionar tu negocio.</li><li><strong class="text-white">No respaldar la información</strong> de clientes y ventas.</li></ul><p class="mt-4">Una tienda segura genera confianza, y la confianza vende.</p>`
        },
        'blogPost6': {
            category: 'PYME', filter: 'PYME', image: 'img/blog/post6.svg', color: 'pastel-pink', date: '1 de agosto, 2026',
            title: 'Cómo vender online sin tener redes sociales grandes',
            icon: '<svg class="w-16 h-16 text-pastel-pink/80 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"/></svg>',
            content: `<p>No necesitas miles de seguidores para vender. Lo que necesitas es una estrategia clara y las herramientas correctas.</p><ul class="list-disc pl-5 space-y-2"><li><strong class="text-white">Catálogo online</strong>: que tu tienda esté siempre abierta y bien organizada.</li><li><strong class="text-white">Google Mi Negocio</strong>: aparece en las búsquedas locales gratis.</li><li><strong class="text-white">WhatsApp</strong>: atiende rápido y convierte chats en pedidos.</li><li><strong class="text-white">Clientes felices</strong>: pídeles recomendaciones; el voz a voz sigue siendo tu mejor canal.</li></ul><p class="mt-4">Empieza pequeño, pero empieza con base sólida.</p>`
        }
    };

    var blogOverlay = document.getElementById('blogOverlay');
    var blogBox = document.getElementById('blogBox');
    var btnCloseBlog = document.getElementById('btnCloseBlog');
    var blogContentContainer = document.getElementById('blogContentContainer');
    window.openBlogModal = function(postId) {
        var post = blogPosts[postId];
        if (!post || !blogContentContainer || !blogOverlay) return;
        blogContentContainer.innerHTML = `<div class="h-56 overflow-hidden relative"><img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover"><div class="absolute inset-0 bg-space-dark/30"></div></div><div class="p-8"><span class="text-xs text-${post.color} font-medium bg-${post.color}/10 px-3 py-1 rounded-full">${post.category}</span><span class="text-xs text-slate-500 ml-3">${post.date}</span><h2 class="text-2xl md:text-3xl font-bold text-white mt-4 mb-6">${post.title}</h2><div class="prose prose-invert prose-sm text-slate-300 space-y-4">${post.content}</div></div>`;
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
    document.querySelectorAll('[id^="blogPost"]').forEach(function(el) {
        var id = el.id;
        el.addEventListener('click', function() { window.openBlogModal(id); });
    });

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
