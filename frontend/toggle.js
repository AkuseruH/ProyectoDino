document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.practicas-toggle');
    const container = document.querySelector('.practicas-container');

    toggle.addEventListener('click', () => {
        container.classList.toggle('open');
        toggle.classList.toggle('active');
    });
});