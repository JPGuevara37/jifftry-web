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
                window.openModal();
                document.getElementById('planSeleccionado').value = e.target.getAttribute('data-plan');
            });
            document.getElementById('btnCloseModal').addEventListener('click', window.closeModal);
            document.querySelectorAll('.glass-card button').forEach(function(btn) {
                btn.addEventListener('click', function(e) {
                    window.openModal();
                    document.getElementById('planSeleccionado').value = e.target.getAttribute('data-plan');
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

        // Consent check
        if (!document.getElementById('consentimiento').checked) {
            showError('Debés aceptar la Política de Privacidad para enviar el formulario.');
            return;
        }

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

    // ── Privacy Policy Modal ────────────────────
    var privacyOverlay = document.getElementById('privacyOverlay');
    var privacyBox = document.getElementById('privacyBox');
    var btnClosePrivacy = document.getElementById('btnClosePrivacy');

    window.openPrivacyModal = function() {
        privacyOverlay.classList.remove('hidden');
        setTimeout(function() {
            privacyOverlay.classList.remove('opacity-0');
            privacyBox.classList.remove('scale-95');
            privacyBox.classList.add('scale-100');
        }, 10);
    };

    window.closePrivacyModal = function() {
        privacyOverlay.classList.add('opacity-0');
        privacyBox.classList.remove('scale-100');
        privacyBox.classList.add('scale-95');
        setTimeout(function() {
            privacyOverlay.classList.add('hidden');
        }, 300);
    };

    btnClosePrivacy.addEventListener('click', window.closePrivacyModal);
    document.getElementById('btnClosePrivacyUnderstand').addEventListener('click', window.closePrivacyModal);
    privacyOverlay.addEventListener('click', function(e) {
        if (e.target === privacyOverlay) { window.closePrivacyModal(); }
    });

    // ── Cookie Consent Banner ───────────────────
    var cookieBanner = document.getElementById('cookieBanner');

    function acceptCookies() {
        localStorage.setItem('jifftry_cookies_accepted', 'true');
        cookieBanner.classList.add('opacity-0');
        setTimeout(function() {
            cookieBanner.classList.add('hidden');
        }, 300);
    }

    document.getElementById('btnAcceptCookies').addEventListener('click', acceptCookies);

    // ── Privacy Policy links ────────────────────
    document.getElementById('linkPrivacyFooter').addEventListener('click', function(e) {
        e.preventDefault();
        window.openPrivacyModal();
    });
    document.getElementById('linkPrivacyForm').addEventListener('click', function(e) {
        e.preventDefault();
        window.openPrivacyModal();
    });
    document.getElementById('linkPrivacyCookie').addEventListener('click', function(e) {
        e.preventDefault();
        window.openPrivacyModal();
    });

    if (!localStorage.getItem('jifftry_cookies_accepted')) {
        cookieBanner.classList.remove('hidden');
    }

    // ── Blog Data ──────────────────────────────
    var blogPosts = {
        'blogPost1': {
            category: 'Inteligencia Artificial',
            color: 'pastel-purple',
            date: '6 de agosto, 2026',
            title: 'Google lanza Gemini Pro 3: La IA que programa, razona y crea como nunca',
            icon: '<svg class="w-20 h-20 text-pastel-purple/90 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"/></svg>',
            content: `
                <p>Google acaba de anunciar <strong class="text-white">Gemini Pro 3</strong>, la tercera generación de su modelo de inteligencia artificial multimodal, y los números son impresionantes. Con una puntuación del <strong class="text-pastel-green">92.7% en HumanEval</strong> (generación de código) y <strong class="text-pastel-green">94.1% en MATH</strong> (razonamiento matemático), este modelo supera a GPT-5 y Claude 3.5 en tareas técnicas clave.</p>
                <h3 class="text-lg font-semibold text-white mt-6 mb-3">Que trae de nuevo</h3>
                <ul class="list-disc pl-5 space-y-2">
                    <li><strong class="text-white">Ventana de contexto de 2 millones de tokens</strong>: Ideal para analizar bases de código enteras o contratos largos.</li>
                    <li><strong class="text-white">Modo agente autónomo</strong>: Gemini Pro 3 puede planificar y ejecutar herramientas externas sin intervención humana.</li>
                    <li><strong class="text-white">Generación de video nativa</strong>: Genera video, audio y texto en un solo modelo unificado.</li>
                </ul>
                <h3 class="text-lg font-semibold text-white mt-6 mb-3">Que significa para tu negocio en Costa Rica</h3>
                <p>Herramientas como Gemini Pro 3 van a impactar tu operación más rápido de lo que crees:</p>
                <ul class="list-disc pl-5 space-y-2">
                    <li><strong class="text-white">Atención al cliente 24/7</strong>: Chatbots que entienden contexto y tono en español natural.</li>
                    <li><strong class="text-white">Análisis de ventas</strong>: Sube tu dashboard y pedile que encuentre patrones y alertas.</li>
                </ul>
            `
        },
        'blogPost2': {
            category: 'Tecnología',
            color: 'pastel-green',
            date: '5 de agosto, 2026',
            title: 'Computación cuántica comercial: IBM abre su primer centro en Latinoamérica',
            icon: '<svg class="w-16 h-16 text-pastel-green/80 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"/></svg>',
            content: `
                <p>La computación cuántica ha dejado de ser una promesa de laboratorio para convertirse en una realidad comercial en nuestra región. <strong class="text-white">IBM</strong> ha inaugurado oficialmente su primer <strong class="text-pastel-blue">Quantum Data Center</strong> en Sao Paulo, Brasil, permitiendo que empresas latinoamericanas accedan a hardware cuántico de última generación con latencias reducidas.</p>
                <h3 class="text-lg font-semibold text-white mt-6 mb-3">Impacto en la Región</h3>
                <p>Este centro facilitará el desarrollo de soluciones en:</p>
                <ul class="list-disc pl-5 space-y-2">
                    <li><strong class="text-white">Optimización Logística</strong>: Resolución de problemas de rutas y distribución que las computadoras clásicas tardarían días en procesar.</li>
                    <li><strong class="text-white">Ciberseguridad</strong>: Preparación para la era post-cuántica, protegiendo datos financieros y sensibles.</li>
                </ul>
                <p class="mt-4">Aunque parece tecnología del futuro, las PYMES tecnológicas en Costa Rica ya pueden empezar a formarse en el desarrollo de algoritmos cuánticos mediante la nube de IBM, posicionándose a la vanguardia de la próxima revolución informática.</p>
            `
        },
        'blogPost3': {
            category: 'E-commerce',
            color: 'pastel-pink',
            date: '4 de agosto, 2026',
            title: 'Comercio electrónico en Costa Rica crece 34% en el último año',
            icon: '<svg class="w-16 h-14 text-pastel-pink/80 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>',
            content: `
                <p>El mercado digital costarricense vive su mejor momento. Según el último informe de la Cámara de Tecnologías de Información y Comunicación (CAMTIC), el e-commerce en el país creció un <strong class="text-pastel-green">34.2%</strong> interanual, impulsado por la madurez de los métodos de pago digitales y la confianza del consumidor.</p>
                <h3 class="text-lg font-semibold text-white mt-6 mb-3">Factores del Éxito</h3>
                <ul class="list-disc pl-5 space-y-2">
                    <li><strong class="text-white">Omnicanalidad Real</strong>: Negocios que integran su catálogo de Instagram/WhatsApp con una pasarela de pago y control de inventario profesional.</li>
                    <li><strong class="text-white">SINPE Móvil 2.0</strong>: La integración nativa de pagos rápidos ha reducido la fricción en el checkout en un 50%.</li>
                    <li><strong class="text-white">Logística de "Última Milla"</strong>: Mejoras significativas en los tiempos de entrega en el Gran Área Metropolitana.</li>
                </ul>
                <p class="mt-4">Para <strong class="text-white">Jifftry</strong>, este crecimiento confirma nuestra misión: democratizar el acceso a tiendas online de nivel galáctico para que cualquier emprendedor tico pueda competir en este mercado en expansión.</p>
            `
        }
    };

    // ── Blog Post Modal Logic ───────────────────
    var blogOverlay = document.getElementById('blogOverlay');
    var blogBox = document.getElementById('blogBox');
    var btnCloseBlog = document.getElementById('btnCloseBlog');
    var blogContentContainer = document.getElementById('blogContentContainer');

    function openBlogModal(postId) {
        var post = blogPosts[postId];
        if (!post) return;

        blogContentContainer.innerHTML = `
            <div class="h-48 bg-gradient-to-br from-${post.color}/40 to-pastel-blue/40 flex items-center justify-center relative">
                <div class="absolute inset-0 bg-space-dark/30"></div>
                ${post.icon}
            </div>
            <div class="p-8">
                <span class="text-xs text-${post.color} font-medium bg-${post.color}/10 px-3 py-1 rounded-full">${post.category}</span>
                <span class="text-xs text-slate-500 ml-3">${post.date}</span>
                <h2 class="text-2xl md:text-3xl font-bold text-white mt-4 mb-6">${post.title}</h2>
                <div class="prose prose-invert prose-sm max-w-none text-slate-300 space-y-4 leading-relaxed">
                    ${post.content}
                    <p class="mt-8 italic text-slate-500 border-t border-white/5 pt-6">En Jifftry creemos que la tecnología debe estar al servicio de los emprendedores. Por eso te mantenemos al día con las herramientas que pueden transformar tu negocio.</p>
                </div>
            </div>
        `;

        blogOverlay.classList.remove('hidden');
        setTimeout(function() {
            blogOverlay.classList.remove('opacity-0');
            blogBox.classList.remove('scale-95');
            blogBox.classList.add('scale-100');
        }, 10);
    }

    function closeBlogModal() {
        blogOverlay.classList.add('opacity-0');
        blogBox.classList.remove('scale-100');
        blogBox.classList.add('scale-95');
        setTimeout(function() {
            blogOverlay.classList.add('hidden');
        }, 300);
    }

    ['blogPost1', 'blogPost2', 'blogPost3'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) {
            el.addEventListener('click', function() {
                openBlogModal(id);
            });
        }
    });

    btnCloseBlog.addEventListener('click', closeBlogModal);
    blogOverlay.addEventListener('click', function(e) {
        if (e.target === blogOverlay) { closeBlogModal(); }
    });

    // ── Favicon redondo ─────────────────────────
    var faviconImg = new Image();
    faviconImg.onload = function() {
        var size = 64;
        var c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        var ctx = c.getContext('2d');
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(faviconImg, 0, 0, size, size);
        var link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        link.href = c.toDataURL('image/png');
        document.head.appendChild(link);
    };
    faviconImg.src = 'img/favicon-jifftry.png';

})();
