export function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pageSections = document.querySelectorAll('.page-section');

    // Dark mode selectors
    const themeToggleBtn = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme');

    // Check for saved theme preference on load
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        themeToggleBtn.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    }

    // Toggle theme function
    themeToggleBtn.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');

        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            themeToggleBtn.textContent = '🌙';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggleBtn.textContent = '☀️';
        }
    });

    // Page Switching Logic
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // Clear previous active highlights across links and panel screens
            navItems.forEach(nav => nav.classList.remove('active'));
            pageSections.forEach(section => section.classList.remove('active'));

            // Highlight the clicked link and activate the designated game page container
            item.classList.add('active');

            const targetId = item.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }

            // --- MOBILE DROPDOWN COUPLING AUTO-CLOSE FEATURE ---
            // Automatically unchecks the hamburger toggle element to pull the menu drawer closed
            const menuToggler = document.getElementById('menu-toggle');
            if (menuToggler) {
                menuToggler.checked = false;
            }
        });
    });
}

// Add this helper function inside Snake.js, Tetris.js, or 2048.js to route mobile layouts:
export function injectMobileDPad(callbackMove) {
    const upBtn = document.getElementById("mobile-up");
    const downBtn = document.getElementById("mobile-down");
    const leftBtn = document.getElementById("mobile-left");
    const rightBtn = document.getElementById("mobile-right");

    const bindDPad = (el, directionKey) => {
        if (!el) return;
        el.addEventListener("touchstart", (e) => {
            e.preventDefault();
            callbackMove({ key: directionKey, preventDefault: () => {} });
        }, { passive: false });
        el.addEventListener("click", () => {
            callbackMove({ key: directionKey, preventDefault: () => {} });
        });
    };

    bindDPad(upBtn, "ArrowUp");
    bindDPad(downBtn, "ArrowDown");
    bindDPad(leftBtn, "ArrowLeft");
    bindDPad(rightBtn, "ArrowRight");
}
