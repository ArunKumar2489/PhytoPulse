/**
 * responsive.js
 * Handles mobile interaction logic (hamburger menu, sidebar toggling).
 */

document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const sidebarNav = document.getElementById('sidebar-nav');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');

    const toggleMenu = () => {
        const isOpen = sidebarNav.classList.toggle('active');
        sidebarNav.classList.toggle('-translate-x-full', !isOpen);
        sidebarNav.classList.toggle('translate-x-0', isOpen);
        
        // Show/Hide Overlay
        mobileOverlay.classList.toggle('hidden', !isOpen);
        
        // Toggle Icons
        menuIcon.classList.toggle('hidden', isOpen);
        closeIcon.classList.toggle('hidden', !isOpen);
        
        // Prevent body scroll when menu is open
        document.body.classList.toggle('overflow-hidden', isOpen);
    };

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMenu);
    }

    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', toggleMenu);
    }

    // Close menu when clicking a link (optional, but good UX)
    const navLinks = sidebarNav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (sidebarNav.classList.contains('active')) {
                toggleMenu();
            }
        });
    });
});
