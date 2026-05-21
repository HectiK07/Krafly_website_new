// Navbar Mobile Menu Toggle
let navbarToggle, navbarMenu, navbarWrapper, navbarMain, navbarTop;

function initMobileMenu() {
    navbarToggle = document.getElementById('navbar-toggle');
    navbarMenu = document.getElementById('navbar-menu');
    navbarWrapper = document.getElementById('navbar-wrapper');
    navbarMain = document.getElementById('navbar-main');
    navbarTop = document.getElementById('navbar-top');

    if (!navbarToggle || !navbarMenu) return;

    function closeMenu() {
        navbarToggle.classList.remove('active');
        navbarMenu.classList.remove('active');
        var servicesItem = document.querySelector('.menu-item-services');
        if (servicesItem) servicesItem.classList.remove('submenu-open');
        document.body.style.overflow = '';
    }

    function toggleMenu(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (navbarMenu.classList.contains('active')) {
            closeMenu();
        } else {
            navbarToggle.classList.add('active');
            navbarMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    navbarToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu(e);
    });

    // Close menu when clicking nav links (except Services parent - that toggles submenu)
    document.querySelectorAll('.navbar-menu > li > a').forEach(link => {
        link.addEventListener('click', function(e) {
            var isServicesParent = link.closest('.menu-item-services') && link.parentElement.classList.contains('menu-item-services');
            if (isServicesParent) {
                e.preventDefault();
                e.stopPropagation();
                var parent = link.closest('.menu-item-services');
                if (parent) parent.classList.toggle('submenu-open');
                return;
            }
            closeMenu();
        });
    });
    document.querySelectorAll('.navbar-menu .submenu a').forEach(link => {
        link.addEventListener('click', function() {
            closeMenu();
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMenu();
            var servicesItem = document.querySelector('.menu-item-services');
            if (servicesItem) servicesItem.classList.remove('submenu-open');
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileMenu);
} else {
    initMobileMenu();
}

// Services dropdown: delay before hide so submenu stays open when moving cursor
const menuItemServices = document.querySelector('.menu-item-services');
const submenu = document.querySelector('.menu-item-services .submenu');
if (menuItemServices && submenu) {
    let dropdownHideTimer = null;
    const delayMs = 180;

    menuItemServices.addEventListener('mouseenter', () => {
        if (dropdownHideTimer) clearTimeout(dropdownHideTimer);
        dropdownHideTimer = null;
        submenu.style.display = 'grid';
    });

    menuItemServices.addEventListener('mouseleave', () => {
        dropdownHideTimer = setTimeout(() => {
            submenu.style.display = '';
            dropdownHideTimer = null;
        }, delayMs);
    });

    submenu.addEventListener('mouseenter', () => {
        if (dropdownHideTimer) clearTimeout(dropdownHideTimer);
        dropdownHideTimer = null;
    });

    submenu.addEventListener('mouseleave', () => {
        dropdownHideTimer = setTimeout(() => {
            submenu.style.display = '';
            dropdownHideTimer = null;
        }, delayMs);
    });
}


// Navbar scroll effect - shrink on scroll + dark style over white sections
let lastScroll = 0;
const whiteSections = document.querySelectorAll('.contact, .technology');

function updateNavbarOverLight() {
    if (!navbarWrapper || !navbarMain || !navbarTop) return;
    const navbarRect = navbarMain.getBoundingClientRect();
    const navbarBottom = navbarRect.bottom;
    let overLight = false;
    whiteSections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (navbarBottom > rect.top && navbarRect.top < rect.bottom) {
            overLight = true;
        }
    });
    navbarWrapper.classList.toggle('navbar-over-light', overLight);
    navbarTop.classList.toggle('navbar-over-light', overLight);
    if (navbarMain) navbarMain.classList.toggle('navbar-over-light', overLight);
}

window.addEventListener('scroll', () => {
    if (!navbarTop || !navbarMain) return;
    const currentScroll = window.pageYOffset;
    if (currentScroll > 50) {
        navbarTop.classList.add('scrolled');
        navbarMain.classList.add('scrolled');
    } else {
        navbarTop.classList.remove('scrolled');
        navbarMain.classList.remove('scrolled');
    }
    updateNavbarOverLight();
    lastScroll = currentScroll;
}, false);

window.addEventListener('resize', updateNavbarOverLight);
document.addEventListener('DOMContentLoaded', updateNavbarOverLight);

// Close mobile menu when clicking outside (use capture so we run after toggle)
document.addEventListener('click', (event) => {
    if (!navbarToggle || !navbarMenu) return;
    var isToggle = navbarToggle.contains(event.target);
    var isMenu = navbarMenu.contains(event.target);
    var isServicesTrigger = event.target.closest('.menu-item-services > a');
    if (!isToggle && !isMenu && !isServicesTrigger && navbarMenu.classList.contains('active')) {
        navbarToggle.classList.remove('active');
        navbarMenu.classList.remove('active');
        var servicesItem = document.querySelector('.menu-item-services');
        if (servicesItem) servicesItem.classList.remove('submenu-open');
        document.body.style.overflow = '';
    }
}, true);

// Web3Forms API Email Submission Helper
async function sendToWeb3Forms(data) {
    const payload = {
        access_key: "d8be8194-34b2-47b6-a2e1-1635436331e3",
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        message: data.message,
        subject: data.subject || "New Inquiry from Krafly Website"
    };

    try {
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error("Error sending form via Web3Forms:", error);
        return false;
    }
}

// Contact Form Validation and Submission
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

if (contactForm && formSuccess) contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    clearErrors();
    
    // Get form values
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const company = document.getElementById('company').value.trim();
    const message = document.getElementById('message').value.trim();
    
    let isValid = true;
    
    // Validate name
    if (name === '') {
        showError('nameError', 'Full name is required');
        isValid = false;
    } else if (name.length < 2) {
        showError('nameError', 'Name must be at least 2 characters');
        isValid = false;
    }
    
    // Validate phone
    if (phone === '') {
        showError('phoneError', 'Phone number is required');
        isValid = false;
    }
    
    // Validate email (Gmail)
    if (email === '') {
        showError('emailError', 'Gmail is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('emailError', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate company
    if (company === '') {
        showError('companyError', 'Company name is required');
        isValid = false;
    }
    
    // Validate message
    if (message === '') {
        showError('messageError', 'Message is required');
        isValid = false;
    } else if (message.length < 10) {
        showError('messageError', 'Message must be at least 10 characters');
        isValid = false;
    }
    
    // If form is valid, send to Web3Forms
    if (isValid) {
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        const success = await sendToWeb3Forms({
            name,
            phone,
            email,
            company,
            message,
            subject: "New Landing Page Lead - Krafly Media"
        });

        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;

        if (success) {
            // Hide form and show success message
            contactForm.style.display = 'none';
            formSuccess.style.display = 'block';
            
            // Reset form after 5 seconds and show it again
            setTimeout(() => {
                contactForm.reset();
                contactForm.style.display = 'block';
                formSuccess.style.display = 'none';
            }, 5000);
        } else {
            alert('There was a problem sending your message. Please try again or email us directly.');
        }
    }
});

// Helper function to validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Helper function to show error
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// Helper function to clear all errors
function clearErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(error => {
        error.textContent = '';
        error.style.display = 'none';
    });
}

// Contact popup: open on Contact Us CTA, close on overlay/X/Escape
var contactPopup = document.getElementById('contactPopup');
var contactPopupForm = document.getElementById('contactPopupForm');

function openContactPopup() {
    if (contactPopup) {
        contactPopup.classList.add('is-open');
        contactPopup.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }
}

function closeContactPopup() {
    if (contactPopup) {
        contactPopup.classList.remove('is-open');
        contactPopup.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
}

if (contactPopup) {
    document.querySelectorAll('a[href="#contact"]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (navbarMenu && navbarMenu.classList.contains('active')) {
                navbarToggle.classList.remove('active');
                navbarMenu.classList.remove('active');
                var s = document.querySelector('.menu-item-services');
                if (s) s.classList.remove('submenu-open');
            }
            openContactPopup();
        });
    });
    var overlay = contactPopup.querySelector('.contact-popup-overlay');
    var closeBtn = contactPopup.querySelector('.contact-popup-close');
    if (overlay) overlay.addEventListener('click', closeContactPopup);
    if (closeBtn) closeBtn.addEventListener('click', closeContactPopup);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && contactPopup.classList.contains('is-open')) closeContactPopup();
    });
}

if (contactPopupForm) {
    contactPopupForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!contactPopupForm.checkValidity()) {
            contactPopupForm.reportValidity();
            return;
        }
        var name = document.getElementById('popupName').value.trim();
        var countryCode = document.getElementById('popupCountryCode');
        var code = countryCode ? countryCode.value : '+91';
        var phone = document.getElementById('popupPhone').value.trim();
        var email = document.getElementById('popupEmail').value.trim();
        var company = document.getElementById('popupCompany').value.trim();
        var message = document.getElementById('popupMessage').value.trim();

        if (name && phone && email && company && message) {
            const submitBtn = contactPopupForm.querySelector('.contact-popup-submit');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'SENDING...';

            const success = await sendToWeb3Forms({
                name,
                phone: `${code} ${phone}`,
                email,
                company,
                message,
                subject: "New Popup Modal Lead - Krafly Media"
            });

            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;

            if (success) {
                const popupTitle = document.getElementById('popupTitle');
                const popupSuccess = document.getElementById('popupSuccess');
                
                // Hide form/header and show success screen
                contactPopupForm.style.display = 'none';
                if (popupTitle) popupTitle.style.display = 'none';
                if (popupSuccess) popupSuccess.style.display = 'block';
                
                // Automatically close popup after 4 seconds and restore the form
                setTimeout(() => {
                    closeContactPopup();
                    setTimeout(() => {
                        contactPopupForm.reset();
                        if (countryCode) countryCode.value = '+91';
                        contactPopupForm.style.display = 'flex';
                        if (popupTitle) popupTitle.style.display = 'block';
                        if (popupSuccess) popupSuccess.style.display = 'none';
                    }, 400);
                }, 4000);
            } else {
                alert('There was a problem sending your message. Please try again or email us directly.');
            }
        }
    });
}

// Smooth scroll for anchor links (e.g. #services, #about) – #contact opens popup instead
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        if (href === '#contact') return;
        // Services parent link only toggles submenu – do not scroll (submenu links are inside .submenu, so their parent is not .menu-item-services)
        var isServicesParentLink = this.parentElement && this.parentElement.classList.contains('menu-item-services');
        if (isServicesParentLink) return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const headerHeight = (navbarWrapper && navbarWrapper.offsetHeight) ? navbarWrapper.offsetHeight : 0;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            // Close mobile menu if open
            if (navbarMenu && navbarMenu.classList.contains('active')) {
                navbarToggle.classList.remove('active');
                navbarMenu.classList.remove('active');
                var s = document.querySelector('.menu-item-services');
                if (s) s.classList.remove('submenu-open');
            }
        }
    });
});

// Add animation on scroll for service cards and other elements
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe service cards, model blocks, and other animated elements
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.service-card, .model-block, .stat-item, .case-study-card');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Stats section: count-up animation when section enters viewport (trigger on scroll to section)
document.addEventListener('DOMContentLoaded', () => {
    const statsSection = document.querySelector('.stats');
    const counters = document.querySelectorAll('.stats .stat-number');
    if (!statsSection || !counters.length) return;

    function animateValue(el, targetNum, suffix, durationMs) {
        const start = performance.now();
        function step(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / durationMs, 1);
            const eased = 1 - Math.pow(1 - progress, 2.5);
            const value = Math.round(eased * targetNum);
            el.textContent = value + suffix;
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = targetNum + suffix;
        }
        requestAnimationFrame(step);
    }

    const statsObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            obs.unobserve(entry.target);
            counters.forEach(el => {
                const target = parseInt(el.getAttribute('data-target') || '0', 10);
                const suffix = el.getAttribute('data-suffix') || '';
                animateValue(el, target, suffix, 1400);
            });
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });

    statsObserver.observe(statsSection);
});
// Navbar client carousel: one logo visible, hold then auto-advance in loop
document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.client-carousel');
    if (!carousel) return;
    const track = carousel.querySelector('.carousel-track-single');
    if (!track) return;
    const slides = Array.from(track.querySelectorAll('.carousel-slide-item'));
    if (slides.length === 0) return;
    const firstClone = slides[0].cloneNode(true);
    firstClone.classList.add('carousel-slide-item');
    track.appendChild(firstClone);
    const itemWidth = 180; // 140px item + 40px gap
    const holdMs = 3500;
    const transitionMs = 600;
    let index = 0;
    function goNext() {
        index += 1;
        track.style.transition = `transform ${transitionMs}ms ease-in-out`;
        track.style.transform = `translateX(${-index * itemWidth}px)`;
        if (index === slides.length) {
            setTimeout(() => {
                track.style.transition = 'none';
                track.style.transform = 'translateX(0)';
                index = 0;
                void track.offsetHeight;
                track.style.transition = `transform ${transitionMs}ms ease-in-out`;
            }, transitionMs + 50);
        }
    }
    setInterval(goNext, holdMs);
});

// Work/Clients mobile: infinite carousel uses pure CSS animation with content duplication
