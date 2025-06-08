/**
   * Coastal Guardian Profile Management System
   * Comprehensive profile interface with SBTs, activity stats, and eco-contribution coins
   */

class CoastalGuardianProfile {
    constructor() {
        // Sample Soulbound Token data
        this.tokens = [
            {
                id: 1,
                title: "Ocean Steward",
                description: "Awarded for demonstrating exceptional commitment to marine conservation through consistent participation in coastal protection initiatives and educational outreach programs.",
                icon: "🐚",
                dateAcquired: "2024-01-15"
            },
            {
                id: 2,
                title: "Reef Guardian",
                description: "Earned through active participation in coral reef restoration projects, contributing to the preservation of critical marine ecosystems and biodiversity.",
                icon: "🪸",
                dateAcquired: "2024-03-22"
            },
            {
                id: 3,
                title: "Marine Researcher",
                description: "Granted for valuable contributions to marine research initiatives, including data collection, analysis, and collaboration with scientific institutions.",
                icon: "🔬",
                dateAcquired: "2024-05-10"
            },
            {
                id: 4,
                title: "Coastal Advocate",
                description: "Recognized for leadership in coastal advocacy efforts, promoting sustainable practices and raising awareness about marine conservation challenges.",
                icon: "⚓",
                dateAcquired: "2024-07-18"
            },
            {
                id: 5,
                title: "Wave Protector",
                description: "Awarded for implementing innovative solutions to combat ocean pollution and protect marine life through community-driven conservation projects.",
                icon: "🌊",
                dateAcquired: "2024-09-05"
            }
        ];

        // Sample eco-contribution coins data - values in Web3 tokens 🪙
        this.ecoCoins = [
            {
                id: 1,
                name: "Seashell Coin",
                symbol: "SHELL",
                icon: "🐚",
                amount: 125,
                tokenValue: 0.15, // Value in Web3 tokens per coin
                priceChange: 2.3
            },
            {
                id: 2,
                name: "Coral Token",
                symbol: "CORAL",
                icon: "🪸",
                amount: 89,
                tokenValue: 0.28,
                priceChange: -1.2
            },
            {
                id: 3,
                name: "Kelp Credit",
                symbol: "KELP",
                icon: "🌿",
                amount: 210,
                tokenValue: 0.08,
                priceChange: 5.7
            },
            {
                id: 4,
                name: "Tide Token",
                symbol: "TIDE",
                icon: "🌊",
                amount: 67,
                tokenValue: 0.22,
                priceChange: 0.8
            }
        ];

        // Activity stats
        this.activityStats = {
            totalContributions: 23,
            lastActiveDate: "2024-12-15",
            daysActiveThisMonth: 18
        };

        this.init();
    }

    /**
     * Initialize the profile interface
     */
    init() {
        this.updateLevelDisplay();
        this.updateActivityStats();
        this.renderEcoCoins();
        this.renderTokens();
        this.bindEvents();
        this.setupScrollAnimations();
        this.startMarketUpdates();
    }

    /**
     * Calculate user level based on number of tokens
     * Simple formula: Level = Number of Tokens (minimum level 1)
     */
    calculateLevel() {
        return Math.max(1, this.tokens.length);
    }

    /**
     * Calculate progress to next level
     */
    calculateProgress() {
        const currentTokens = this.tokens.length;
        const nextLevelTokens = currentTokens + 1;
        const progress = currentTokens / nextLevelTokens;
        return {
            current: currentTokens,
            next: nextLevelTokens,
            percentage: Math.round(progress * 100)
        };
    }

    /**
     * Update the level display and progress indicator
     */
    updateLevelDisplay() {
        const level = this.calculateLevel();
        const progress = this.calculateProgress();

        // Update level display
        document.getElementById('levelDisplay').textContent = `Level ${level}`;
        document.getElementById('tokenCount').textContent =
            `${this.tokens.length} Soulbound Token${this.tokens.length !== 1 ? 's' : ''}`;

        // Update progress ring
        this.updateProgressRing(progress);
    }

    /**
     * Update the circular progress indicator
     */
    updateProgressRing(progress) {
        const circle = document.getElementById('progressCircle');
        const progressText = document.getElementById('progressText');

        const radius = 40;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (progress.percentage / 100) * circumference;

        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = offset;

        progressText.textContent = `${progress.current}/${progress.next}`;
    }

    /**
     * Update activity statistics
     */
    updateActivityStats() {
        document.getElementById('totalSBTs').textContent = this.tokens.length;
        document.getElementById('totalContributions').textContent = this.activityStats.totalContributions;

        // Format last active date
        const lastActiveDate = new Date(this.activityStats.lastActiveDate);
        const formattedDate = lastActiveDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
        document.getElementById('lastActive').textContent = formattedDate;

        document.getElementById('daysActive').textContent = this.activityStats.daysActiveThisMonth;
    }

    /**
     * Calculate total portfolio value in Web3 tokens (targeting ~75 tokens)
     */
    calculateTotalPortfolioValue() {
        return this.ecoCoins.reduce((total, coin) => {
            return total + (coin.amount * coin.tokenValue);
        }, 0);
    }

    /**
     * Render eco-contribution coins
     */
    renderEcoCoins() {
        const coinsGrid = document.getElementById('coinsGrid');
        const totalValue = this.calculateTotalPortfolioValue();

        // Update total portfolio value in Web3 tokens
        document.getElementById('totalPortfolioValue').innerHTML = `
                    <span class="token-icon">🪙</span>
                    <span>${Math.round(totalValue).toLocaleString()}</span>
                `;

        coinsGrid.innerHTML = this.ecoCoins
            .map(coin => this.createCoinHTML(coin))
            .join('');
    }

    /**
     * Create HTML for a single coin card
     */
    createCoinHTML(coin) {
        const totalValue = Math.round(coin.amount * coin.tokenValue);
        const changeClass = coin.priceChange >= 0 ? 'positive' : 'negative';
        const changeSymbol = coin.priceChange >= 0 ? '↑' : '↓';

        return `
                    <div class="coin-card">
                        <div class="coin-header">
                            <div class="coin-icon">${coin.icon}</div>
                            <div class="coin-info">
                                <div class="coin-name">${coin.name}</div>
                                <div class="coin-amount">${coin.amount.toLocaleString()} ${coin.symbol}</div>
                            </div>
                        </div>
                        <div class="coin-value">
                            <div class="coin-price">
                                <span>🪙</span> ${coin.tokenValue.toFixed(3)}
                                <span class="price-change ${changeClass}">
                                    ${changeSymbol} ${Math.abs(coin.priceChange)}%
                                </span>
                            </div>
                            <div class="coin-total">
                                <span>🪙</span> ${totalValue.toLocaleString()}
                            </div>
                        </div>
                    </div>
                `;
    }

    /**
     * Render all tokens in the grid
     */
    renderTokens() {
        const tokensGrid = document.getElementById('tokensGrid');

        tokensGrid.innerHTML = this.tokens
            .sort((a, b) => new Date(b.dateAcquired) - new Date(a.dateAcquired))
            .map(token => this.createTokenHTML(token))
            .join('');
    }

    /**
     * Create HTML for a single token card
     */
    createTokenHTML(token) {
        const formattedDate = new Date(token.dateAcquired).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `
                    <div class="token-card" data-token-id="${token.id}" tabindex="0">
                        <div class="token-header">
                            <div class="token-icon-card">${token.icon}</div>
                            <div class="token-meta">
                                <div class="token-title">${token.title}</div>
                                <div class="token-date">Acquired ${formattedDate}</div>
                            </div>
                        </div>
                        <div class="token-description">${token.description}</div>
                    </div>
                `;
    }

    /**
     * Setup scroll-based animations using IntersectionObserver
     */
    setupScrollAnimations() {
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

        // Observe all token cards
        document.querySelectorAll('.token-card').forEach(card => {
            observer.observe(card);
        });
    }

    /**
     * Start simulated market updates for coin prices
     */
    startMarketUpdates() {
        setInterval(() => {
            this.updateCoinPrices();
        }, 30000); // Update every 30 seconds
    }

    /**
     * Simulate market price updates
     */
    updateCoinPrices() {
        this.ecoCoins.forEach(coin => {
            // Simulate small price changes (-5% to +5%)
            const changePercent = (Math.random() - 0.5) * 0.1;
            coin.tokenValue *= (1 + changePercent);
            coin.priceChange = changePercent * 100;
        });

        this.renderEcoCoins();
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Return button functionality
        document.getElementById('returnBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleReturn();
        });

        // Token card interactions
        document.addEventListener('click', (e) => {
            const tokenCard = e.target.closest('.token-card');
            if (tokenCard) {
                const tokenId = parseInt(tokenCard.dataset.tokenId);
                const token = this.tokens.find(t => t.id === tokenId);
                if (token) {
                    this.showTokenDetails(token);
                }
            }
        });

        // Keyboard accessibility for token cards
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const tokenCard = e.target.closest('.token-card');
                if (tokenCard) {
                    e.preventDefault();
                    tokenCard.click();
                }
            }
        });
    }

    /**
     * Handle return button click
     */
    handleReturn() {
        // Try to go back in browser history
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // Fallback: show message or redirect to default page
            alert('No previous page found. This would typically return to the main dashboard.');
        }
    }

    /**
     * Show detailed token information
     */
    showTokenDetails(token) {
        const formattedDate = new Date(token.dateAcquired).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        alert(`${token.icon} ${token.title}\n\nAcquired on ${formattedDate}\n\nThis soulbound token represents your permanent contribution to marine conservation and cannot be transferred or sold.`);
    }
}

// Initialize the profile when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CoastalGuardianProfile();
});