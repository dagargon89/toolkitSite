document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const menuButton = document.querySelector('.md\\:hidden button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
});
