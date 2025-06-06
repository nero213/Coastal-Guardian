window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Wallet connection simulation
const connectWalletBtn = document.getElementById('connectWallet');
const tokenBalance = document.getElementById('tokenBalance');
const balanceAmount = document.getElementById('balanceAmount');

let isConnected = false;

connectWalletBtn.addEventListener('click', () => {
    if (!isConnected) {
        // Simulate wallet connection
        setTimeout(() => {
            connectWalletBtn.textContent = '0x1234...5678';
            connectWalletBtn.style.background = 'var(--gradient-secondary)';
            connectWalletBtn.style.color = 'var(--primary-ocean)';
            tokenBalance.style.display = 'flex';
            balanceAmount.textContent = '1,247 CGT';
            isConnected = true;
        }, 1000);

        connectWalletBtn.textContent = 'Connecting...';
        connectWalletBtn.disabled = true;

        setTimeout(() => {
            connectWalletBtn.disabled = false;
        }, 1000);
    } else {
        // Disconnect wallet
        connectWalletBtn.textContent = 'Connect Wallet';
        connectWalletBtn.style.background = 'var(--gradient-ocean)';
        connectWalletBtn.style.color = 'white';
        tokenBalance.style.display = 'none';
        isConnected = false;
    }
});

// FAQ toggle functionality
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const faqItem = question.parentElement;
        const answer = faqItem.querySelector('.faq-answer');
        const toggle = question.querySelector('.faq-toggle');

        faqItem.classList.toggle('active');
        answer.classList.toggle('active');

        if (faqItem.classList.contains('active')) {
            toggle.textContent = '−';
        } else {
            toggle.textContent = '+';
        }
    });
});

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all animated elements
document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
    observer.observe(el);
});

// Progress bar animation
const progressBars = document.querySelectorAll('.progress-bar');
const progressObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const progressBar = entry.target;
            const width = progressBar.style.width;
            progressBar.style.width = '0%';
            setTimeout(() => {
                progressBar.style.width = width;
            }, 500);
        }
    });
}, observerOptions);

progressBars.forEach(bar => {
    progressObserver.observe(bar);
});

// Mobile menu toggle
const mobileMenu = document.getElementById('mobileMenu');
const navLinks = document.querySelector('.nav-links');

mobileMenu.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenu.classList.toggle('active');
});

// Action button interactions
document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const originalText = btn.textContent;
        btn.textContent = 'Processing...';
        btn.disabled = true;

        setTimeout(() => {
            btn.textContent = 'Completed!';
            btn.style.background = 'var(--ocean-blue)';

            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = 'var(--primary-ocean)';
                btn.disabled = false;
            }, 2000);
        }, 1500);
    });
});

// Achievement hover effects
document.querySelectorAll('.achievement').forEach(achievement => {
    achievement.addEventListener('click', () => {
        if (!achievement.classList.contains('earned')) {
            achievement.style.transform = 'scale(0.95)';
            setTimeout(() => {
                achievement.style.transform = 'scale(1)';
            }, 150);
        }
    });
});

// Simplified stats counter animation (removed annoying spinning)
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);

    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start).toLocaleString();
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString();
        }
    }

    updateCounter();
}

// Animate hero stats when they come into view (only once)
const heroStatsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const text = stat.textContent;
                const number = parseInt(text.replace(/[^\d]/g, ''));
                const suffix = text.replace(/[\d,]/g, '');

                animateCounter(stat, number);
                setTimeout(() => {
                    stat.textContent = number.toLocaleString() + suffix;
                }, 2000);
            });
            heroStatsObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    heroStatsObserver.observe(heroStats);
}