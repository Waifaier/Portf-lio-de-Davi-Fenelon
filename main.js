/* ============================================================
   CONFIGURAÇÃO DO EMAILJS
   ------------------------------------------------------------
   Substitua os 3 valores abaixo pelas suas credenciais reais
   da sua conta em https://www.emailjs.com (veja o passo a passo
   completo enviado junto com este projeto).

   PUBLIC_KEY  -> Account > General > Public Key
   SERVICE_ID  -> Email Services > (seu serviço) > Service ID
   TEMPLATE_ID -> Email Templates > (seu template) > Template ID
   ============================================================ */
const EMAILJS_PUBLIC_KEY = 'EMAILJS_PUBLIC_KEY';
const EMAILJS_SERVICE_ID = 'EMAILJS_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'EMAILJS_TEMPLATE_ID';

document.addEventListener('DOMContentLoaded', function () {

    /* =========================================================
       0. Inicializa o EmailJS (se o SDK tiver carregado)
       ========================================================= */
    if (window.emailjs) {
        emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    }

    /* =========================================================
       1. Menu mobile (hamburger)
       ========================================================= */
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function () {
            const isOpen = navLinks.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', isOpen);
            hamburger.innerHTML = isOpen
                ? '<i class="fas fa-times"></i>'
                : '<i class="fas fa-bars"></i>';
        });

        // Fecha o menu ao clicar em um link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                hamburger.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
    }

    /* =========================================================
       2. Scroll suave
       ========================================================= */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId.length < 2) return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                window.scrollTo({
                    top: targetElement.offsetTop - 72,
                    behavior: 'smooth'
                });
            }
        });
    });

    /* =========================================================
       3. Navbar com fundo ao rolar + link ativo no menu
       ========================================================= */
    const navbar = document.getElementById('navbar');
    const backToTopButton = document.getElementById('back-to-top');
    const sections = document.querySelectorAll('main section[id]');
    const navAnchors = document.querySelectorAll('.nav-links a');

    const onScroll = function () {
        if (navbar) {
            navbar.classList.toggle('scrolled', window.scrollY > 20);
        }
        if (backToTopButton) {
            backToTopButton.classList.toggle('visible', window.scrollY > 400);
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if ('IntersectionObserver' in window && sections.length) {
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navAnchors.forEach(a => {
                        a.classList.toggle('active-link', a.getAttribute('href') === `#${id}`);
                    });
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

        sections.forEach(section => navObserver.observe(section));
    }

    /* =========================================================
       4. Botão voltar ao topo
       ========================================================= */
    if (backToTopButton) {
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* =========================================================
       5. Animação de aparecimento ao rolar (IntersectionObserver)
       ========================================================= */
    const revealElements = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window && revealElements.length) {
        const revealObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        revealElements.forEach(el => el.classList.add('is-visible'));
    }

    /* =========================================================
       6. Modo claro / escuro
       ========================================================= */
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const body = document.body;
    const savedTheme = localStorage.getItem('portfolio-theme');
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;

    function applyTheme(theme) {
        body.setAttribute('data-theme', theme);
        if (themeIcon) {
            themeIcon.className = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    applyTheme(savedTheme || (prefersLight ? 'light' : 'dark'));

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            applyTheme(current);
            localStorage.setItem('portfolio-theme', current);
        });
    }

    /* =========================================================
       7. Filtro de projetos
       ========================================================= */
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');

            const filter = button.getAttribute('data-filter');

            projectCards.forEach(card => {
                const categories = (card.getAttribute('data-category') || '').split(' ');
                const shouldShow = filter === 'all' || categories.includes(filter);
                card.classList.toggle('hidden-card', !shouldShow);
            });
        });
    });

    /* =========================================================
       8. Botão "Ver Projeto" (abre link real ou modal)
       ========================================================= */
    const projectModal = document.getElementById('project-modal');

    if (projectModal) {
        const modalTitle = projectModal.querySelector('.project-modal-title');
        const modalStatus = projectModal.querySelector('.project-modal-status');
        const modalDesc = projectModal.querySelector('.project-modal-desc');
        const modalTech = projectModal.querySelector('.project-modal-tech');
        const modalPrototypeLink = projectModal.querySelector('.project-modal-link[data-role="prototype"]');
        const modalSlidesLink = projectModal.querySelector('.project-modal-link[data-role="slides"]');
        let lastFocusedElement = null;

        function setModalActionLink(el, url) {
            if (!el) return;
            const trimmed = (url || '').trim();
            if (trimmed) {
                el.href = trimmed;
                el.style.display = '';
            } else {
                el.style.display = 'none';
            }
        }

        function openProjectModal(data) {
            modalTitle.textContent = data.name || 'Projeto';
            modalStatus.textContent = data.status || '';
            modalDesc.textContent = data.desc || '';

            modalTech.innerHTML = '';
            (data.tech || '')
                .split(',')
                .map(t => t.trim())
                .filter(Boolean)
                .forEach(tech => {
                    const span = document.createElement('span');
                    span.textContent = tech;
                    modalTech.appendChild(span);
                });

            // Links de "Protótipo" e "Slides" (placeholder.com até serem substituídos pelo link real)
            setModalActionLink(modalPrototypeLink, data.prototype);
            setModalActionLink(modalSlidesLink, data.slides);

            lastFocusedElement = document.activeElement;
            projectModal.classList.add('active');
            projectModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            projectModal.querySelector('.project-modal-close').focus();
        }

        function closeProjectModal() {
            projectModal.classList.remove('active');
            projectModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            if (lastFocusedElement) lastFocusedElement.focus();
        }

        projectModal.querySelectorAll('[data-modal-close]').forEach(el => {
            el.addEventListener('click', closeProjectModal);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && projectModal.classList.contains('active')) {
                closeProjectModal();
            }
        });

        document.querySelectorAll('.project-view-btn').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const link = (this.getAttribute('data-project-link') || '').trim();

                if (link) {
                    // Link real do projeto já cadastrado: abre em nova aba.
                    window.open(link, '_blank', 'noopener,noreferrer');
                } else {
                    // Projeto ainda não publicado: mostra os detalhes em um modal.
                    openProjectModal({
                        name: this.getAttribute('data-project-name'),
                        desc: this.getAttribute('data-project-desc'),
                        tech: this.getAttribute('data-project-tech'),
                        status: this.getAttribute('data-project-status'),
                        prototype: this.getAttribute('data-project-prototype'),
                        slides: this.getAttribute('data-project-slides')
                    });
                }
            });
        });
    }

    /* =========================================================
       9. Validação completa do formulário de contato
       ========================================================= */
    const contactForm = document.getElementById('contact-form');
    const formAlert = document.getElementById('form-alert');

    function showAlert(type, message) {
        if (!formAlert) return;
        const icons = {
            success: 'fa-circle-check',
            error: 'fa-circle-exclamation',
            sending: 'fa-spinner fa-spin'
        };
        const icon = icons[type] || 'fa-circle-info';
        formAlert.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
        formAlert.className = `form-alert show ${type}`;
    }

    function setFieldError(input, errorEl, hasError) {
        if (!input || !errorEl) return;
        input.classList.toggle('is-invalid', hasError);
        errorEl.classList.toggle('show', hasError);
    }

    function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    if (contactForm) {
        const fields = {
            name: { input: document.getElementById('name'), error: document.getElementById('error-name') },
            email: { input: document.getElementById('email'), error: document.getElementById('error-email') },
            subject: { input: document.getElementById('subject'), error: document.getElementById('error-subject') },
            message: { input: document.getElementById('message'), error: document.getElementById('error-message') }
        };

        function validateField(key) {
            const { input, error } = fields[key];
            if (!input) return true;
            const value = input.value.trim();
            let valid = true;

            if (key === 'name') valid = value.length >= 3;
            if (key === 'email') valid = isValidEmail(value);
            if (key === 'subject') valid = value.length >= 3;
            if (key === 'message') valid = value.length >= 10;

            setFieldError(input, error, !valid);
            return valid;
        }

        Object.keys(fields).forEach(key => {
            const input = fields[key].input;
            if (input) {
                input.addEventListener('blur', () => validateField(key));
                input.addEventListener('input', () => {
                    if (input.classList.contains('is-invalid')) validateField(key);
                });
            }
        });

        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const results = Object.keys(fields).map(validateField);
            const allValid = results.every(Boolean);

            if (!allValid) {
                showAlert('error', 'Por favor, corrija os campos destacados antes de enviar.');
                return;
            }

            if (!window.emailjs) {
                showAlert('error', 'Não foi possível carregar o serviço de envio. Tente novamente mais tarde.');
                return;
            }

            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonHTML = submitButton ? submitButton.innerHTML : '';

            // Estado de carregamento: desabilita o botão e avisa que está enviando
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            }
            showAlert('sending', 'Enviando sua mensagem...');

            // Parâmetros enviados ao template configurado no EmailJS.
            // Os nomes (from_name, from_email, subject, message) devem
            // corresponder às variáveis usadas no seu template.
            const templateParams = {
                from_name: fields.name.input.value.trim(),
                from_email: fields.email.input.value.trim(),
                subject: fields.subject.input.value.trim(),
                message: fields.message.input.value.trim()
            };

            emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
                .then(function () {
                    // Sucesso: limpa o formulário e mostra confirmação elegante
                    showAlert('success', 'Mensagem enviada com sucesso! Em breve entrarei em contato.');
                    contactForm.reset();
                    Object.values(fields).forEach(({ input, error }) => setFieldError(input, error, false));

                    if (submitButton) {
                        submitButton.innerHTML = '<i class="fas fa-check"></i> Enviado!';
                        submitButton.classList.add('btn-success-pulse');
                    }
                })
                .catch(function (err) {
                    // Erro: informa o usuário sem travar o formulário
                    console.error('Erro ao enviar mensagem via EmailJS:', err);
                    showAlert('error', 'Erro ao enviar sua mensagem. Tente novamente em instantes.');
                })
                .finally(function () {
                    // Reabilita o botão pouco depois, permitindo um novo envio
                    setTimeout(() => {
                        if (submitButton) {
                            submitButton.disabled = false;
                            submitButton.innerHTML = originalButtonHTML;
                            submitButton.classList.remove('btn-success-pulse');
                        }
                    }, 2200);
                });
        });
    }

    /* =========================================================
       10. Brilho sutil acompanhando o cursor (desktop apenas)
       ========================================================= */
    const cursorGlow = document.getElementById('cursor-glow');
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches;

    if (cursorGlow && !prefersReducedMotion && !isTouchDevice) {
        let targetX = window.innerWidth / 2;
        let targetY = window.innerHeight / 2;
        let currentX = targetX;
        let currentY = targetY;
        let rafId = null;

        function animateCursorGlow() {
            // Suaviza o movimento (easing simples) para não parecer robótico
            currentX += (targetX - currentX) * 0.12;
            currentY += (targetY - currentY) * 0.12;
            cursorGlow.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
            rafId = requestAnimationFrame(animateCursorGlow);
        }

        window.addEventListener('mousemove', (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
            cursorGlow.classList.add('active');
        }, { passive: true });

        document.addEventListener('mouseleave', () => cursorGlow.classList.remove('active'));

        rafId = requestAnimationFrame(animateCursorGlow);
    }

    /* =========================================================
       11. Tela de carregamento inicial
       ========================================================= */
    const loadingScreen = document.getElementById('loading-screen');

    if (loadingScreen) {
        // A tela some assim que a página (imagens, fontes, etc.) terminar de carregar
        window.addEventListener('load', () => {
            loadingScreen.classList.add('loaded');
            // Remove do fluxo após a transição para não interferir em cliques
            setTimeout(() => loadingScreen.remove(), 700);
        });
    }

    /* =========================================================
       12. Paralaxe extremamente leve ao rolar (camada de estrelas)
       ========================================================= */
    const starsLayer = document.querySelector('.stars-layer');

    if (starsLayer && !prefersReducedMotion) {
        let ticking = false;

        function updateParallax() {
            const y = window.scrollY;
            starsLayer.style.transform = `translateY(${y * 0.03}px)`;
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });
    }
});
