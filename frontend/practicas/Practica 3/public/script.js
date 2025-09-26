document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const subscribeBtn = document.getElementById('subscribeBtn');
    const modal = document.getElementById('modal');
    const modalMessage = document.getElementById('modal-message');
    const closeBtn = document.querySelector('.close-btn');

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Función para mostrar mensajes de error
    const showError = (input, message) => {
        const formGroup = input.parentElement;
        const errorElement = formGroup.querySelector('.error-message');
        errorElement.textContent = message;
        errorElement.classList.add('visible');
    };

    // Función para limpiar mensajes de error
    const clearError = (input) => {
        const formGroup = input.parentElement;
        const errorElement = formGroup.querySelector('.error-message');
        errorElement.textContent = '';
        errorElement.classList.remove('visible');
    };

    // Validación en tiempo real
    const inputs = contactForm.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            if (input.checkValidity()) {
                clearError(input);
            }
        });
    });

    // Validación del formulario de contacto al enviar
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let isValid = true;
        
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');

        // Validación de campos vacíos
        if (nameInput.value.trim() === '') {
            showError(nameInput, 'El nombre es obligatorio.');
            isValid = false;
        } else {
            clearError(nameInput);
        }

        if (emailInput.value.trim() === '') {
            showError(emailInput, 'El email es obligatorio.');
            isValid = false;
        } else if (!isValidEmail(emailInput.value)) {
            showError(emailInput, 'Por favor, introduce un email válido.');
            isValid = false;
        } else {
            clearError(emailInput);
        }
        
        if (messageInput.value.trim() === '') {
            showError(messageInput, 'El mensaje es obligatorio.');
            isValid = false;
        } else {
            clearError(messageInput);
        }

        if (isValid) {
            showSuccessModal('¡Gracias por tu mensaje! Nos pondremos en contacto pronto. 🎉');
            contactForm.reset();
        }
    });

    // Función para validar formato de email
    const isValidEmail = (email) => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    // Función para crear la animación de confeti
    const createConfetti = (containerId, count = 15) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        const colors = ['#FFC107', '#FF9800', '#FF5722', '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B'];

        container.innerHTML = ''; // Limpiar confeti anterior

        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.top = `${Math.random() * 100}%`; // Empiezan desde arriba del contenedor

            // Propiedades CSS para la animación dinámica
            confetti.style.setProperty('--rand-x', (Math.random() * 600 - 300)); // Rango de -300 a 300px
            confetti.style.setProperty('--rand-y', (Math.random() * 500 + 300)); // Caída más abajo
            confetti.style.setProperty('--rand-deg', (Math.random() * 1000 - 500)); // Rotación de -500 a 500 grados
            confetti.style.animationDelay = `${Math.random() * 0.6}s`;
            confetti.style.opacity = 0; // Se hará visible con el keyframe

            container.appendChild(confetti);
        }

        setTimeout(() => {
            // Eliminar confeti después de la animación para limpiar el DOM
            const confettiElements = container.querySelectorAll('.confetti');
            confettiElements.forEach(c => c.remove());
        }, 2500); // Coincide con la duración de la animación
    };

    // Botón Suscríbete
    subscribeBtn.addEventListener('click', () => {
        showSuccessModal('¡Gracias por unirte a nuestra comunidad! Te damos la bienvenida a MindfulPath. 🎉');
    });

    // Mostrar el modal
    const showSuccessModal = (message) => {
        modalMessage.textContent = message;
        modal.style.display = 'flex';
        createConfetti('modal-confetti-container', 25); // Más confeti para el modal
    };

    // Ocultar el modal
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        document.getElementById('modal-confetti-container').innerHTML = ''; // Limpiar confeti al cerrar
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.getElementById('modal-confetti-container').innerHTML = ''; // Limpiar confeti al cerrar
        }
    });

    // Intersection Observer para animaciones al hacer scroll
    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.2 // Cuando el 20% del elemento es visible
    };

    const sections = document.querySelectorAll('.fade-in-section');
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Si es la sección de beneficios, animar los ítems uno por uno
                if (entry.target.classList.contains('benefits-section')) {
                    const benefitItems = entry.target.querySelectorAll('.benefit-item');
                    benefitItems.forEach((item, index) => {
                        item.style.setProperty('--delay', `${index * 0.15}s`); // Retraso escalonado
                        item.classList.add('is-visible');
                    });
                }
                observer.unobserve(entry.target); // Dejar de observar después de animar
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // Observador específico para los ítems de beneficios (si no es parte de fade-in-section)
    // Si la .benefits-section ya tiene 'fade-in-section', esto se manejará arriba.
    // Si no, necesitaríamos un observador separado para .fade-in-up
    const benefitItems = document.querySelectorAll('.benefit-item.fade-in-up');
    const benefitObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.4 // Un poco más del elemento visible
    });

    benefitItems.forEach(item => {
        benefitObserver.observe(item);
    });
});