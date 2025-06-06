let userData = {
    tokenBalance: 247,
    ownedNFTs: [1, 5] // NFT IDs that user already owns
};

// NFT data
const nftData = [
    {
        id: 1,
        title: "Beach Cleanup Pioneer",
        description: "Awarded for participating in your first coastal cleanup event. This NFT represents your initial commitment to ocean conservation.",
        category: "cleanup",
        rarity: "common",
        price: 25,
        emoji: "🏖️",
        benefits: [
            "Verified first cleanup participation",
            "Access to beginner conservation resources",
            "Community recognition badge"
        ]
    },
    {
        id: 2,
        title: "Coral Restoration Expert",
        description: "Earned through active participation in coral reef restoration projects. Demonstrates hands-on marine ecosystem rehabilitation skills.",
        category: "restoration",
        rarity: "rare",
        price: 75,
        emoji: "🪸",
        benefits: [
            "Certified coral restoration experience",
            "Marine biology skill verification",
            "Access to advanced restoration projects"
        ]
    },
    {
        id: 3,
        title: "Marine Data Scientist",
        description: "Awarded for contributing to marine monitoring and data collection efforts. Shows commitment to scientific conservation approaches.",
        category: "monitoring",
        rarity: "epic",
        price: 150,
        emoji: "🔬",
        benefits: [
            "Scientific research participation proof",
            "Data analysis skill certification",
            "Research collaboration opportunities"
        ]
    },
    {
        id: 4,
        title: "Ocean Ambassador",
        description: "Recognizes leadership in community education and outreach programs. Demonstrates ability to inspire others in conservation efforts.",
        category: "education",
        rarity: "epic",
        price: 120,
        emoji: "🎓",
        benefits: [
            "Community leadership verification",
            "Public speaking experience proof",
            "Educational program development skills"
        ]
    },
    {
        id: 5,
        title: "Cleanup Champion",
        description: "Earned by participating in 10+ beach cleanup events. Shows sustained commitment to coastal environmental protection.",
        category: "cleanup",
        rarity: "rare",
        price: 100,
        emoji: "🏆",
        benefits: [
            "Sustained volunteer commitment proof",
            "Environmental leadership demonstration",
            "Community impact verification"
        ]
    },
    {
        id: 6,
        title: "Mangrove Guardian",
        description: "Awarded for participating in mangrove restoration and protection initiatives. Demonstrates understanding of coastal ecosystem importance.",
        category: "restoration",
        rarity: "rare",
        price: 85,
        emoji: "🌿",
        benefits: [
            "Ecosystem restoration expertise",
            "Coastal protection knowledge",
            "Biodiversity conservation skills"
        ]
    },
    {
        id: 7,
        title: "Sea Turtle Protector",
        description: "Earned through participation in sea turtle conservation programs. Shows dedication to protecting endangered marine species.",
        category: "monitoring",
        rarity: "epic",
        price: 200,
        emoji: "🐢",
        benefits: [
            "Endangered species protection experience",
            "Wildlife conservation certification",
            "Marine biology field experience"
        ]
    },
    {
        id: 8,
        title: "Plastic-Free Advocate",
        description: "Recognizes efforts in promoting plastic-free initiatives and sustainable alternatives. Demonstrates commitment to pollution reduction.",
        category: "education",
        rarity: "common",
        price: 40,
        emoji: "♻️",
        benefits: [
            "Sustainability advocacy proof",
            "Pollution reduction initiative experience",
            "Community awareness campaign skills"
        ]
    },
    {
        id: 9,
        title: "Ocean Conservation Legend",
        description: "The ultimate achievement for exceptional contributions to coastal conservation. Reserved for the most dedicated ocean guardians.",
        category: "cleanup",
        rarity: "legendary",
        price: 500,
        emoji: "🌊",
        benefits: [
            "Exceptional conservation impact verification",
            "Leadership in environmental protection",
            "Lifetime achievement recognition",
            "Exclusive access to premium conservation programs"
        ]
    }
];

let currentFilter = 'all';
let selectedNFT = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
    updateTokenBalance();
    renderNFTs();
    setupEventListeners();

    // Add animation delays
    const elements = document.querySelectorAll('.fade-in, .slide-in');
    elements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.1}s`;
    });
});

function updateTokenBalance() {
    document.getElementById('userTokenBalance').textContent = userData.tokenBalance;
}

function renderNFTs() {
    const grid = document.getElementById('nftGrid');
    const filteredNFTs = currentFilter === 'all'
        ? nftData
        : nftData.filter(nft => nft.category === currentFilter);

    grid.innerHTML = filteredNFTs.map(nft => {
        const isOwned = userData.ownedNFTs.includes(nft.id);
        const canAfford = userData.tokenBalance >= nft.price;

        return `
                    <div class="nft-card ${isOwned ? 'owned' : ''} fade-in">
                        <div class="nft-image">
                            ${nft.emoji}
                            <div class="nft-rarity ${nft.rarity}">${nft.rarity.toUpperCase()}</div>
                            <div class="soulbound-badge">
                                🔒 Soulbound
                            </div>
                            ${isOwned ? '<div class="owned-badge">✓ OWNED</div>' : ''}
                        </div>
                        <div class="nft-content">
                            <h3 class="nft-title">${nft.title}</h3>
                            <p class="nft-description">${nft.description}</p>
                            
                            <div class="nft-benefits">
                                <h4>Resume Benefits:</h4>
                                <ul class="benefit-list">
                                    ${nft.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                                </ul>
                            </div>
                            
                            <div class="nft-footer">
                                <div class="nft-price">
                                    <span class="token-icon">🪙</span>
                                    <span>${nft.price} Tokens</span>
                                </div>
                                <button 
                                    class="purchase-btn ${isOwned ? 'owned' : ''}" 
                                    ${isOwned ? 'disabled' : ''}
                                    ${!canAfford && !isOwned ? 'disabled' : ''}
                                    onclick="${isOwned ? '' : `purchaseNFT(${nft.id})`}"
                                >
                                    ${isOwned ? '✓ Owned' : !canAfford ? 'Insufficient Tokens' : 'Purchase NFT'}
                                </button>
                            </div>
                        </div>
                    </div>
                `;
    }).join('');

    // Re-apply animations
    const newElements = grid.querySelectorAll('.fade-in');
    newElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.1}s`;
    });
}

function setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderNFTs();
        });
    });

    // Purchase confirmation
    document.getElementById('confirmPurchase').addEventListener('click', function () {
        if (selectedNFT) {
            processPurchase(selectedNFT);
        }
    });
}

function purchaseNFT(nftId) {
    const nft = nftData.find(n => n.id === nftId);
    if (!nft) return;

    if (userData.tokenBalance < nft.price) {
        showErrorModal('Insufficient tokens to complete this purchase. Participate in more coastal cleanup events to earn additional tokens.');
        return;
    }

    selectedNFT = nft;
    document.getElementById('modalText').textContent =
        `Are you sure you want to purchase "${nft.title}" for ${nft.price} tokens? This soulbound NFT will be permanently bound to your account and cannot be transferred.`;

    showModal('purchaseModal');
}

function processPurchase(nft) {
    const confirmBtn = document.getElementById('confirmPurchase');
    const originalText = confirmBtn.textContent;

    // Show loading state
    confirmBtn.innerHTML = '<div class="loading"></div> Processing...';
    confirmBtn.disabled = true;

    // Simulate blockchain transaction
    setTimeout(() => {
        // Deduct tokens
        userData.tokenBalance -= nft.price;

        // Add NFT to owned collection
        userData.ownedNFTs.push(nft.id);

        // Update UI
        updateTokenBalance();
        renderNFTs();

        // Reset button
        confirmBtn.textContent = originalText;
        confirmBtn.disabled = false;

        // Close purchase modal and show success
        closeModal();
        showModal('successModal');

        // Add success animation to token balance
        document.querySelector('.token-balance').classList.add('success-animation');
        setTimeout(() => {
            document.querySelector('.token-balance').classList.remove('success-animation');
        }, 600);

    }, 2000); // Simulate 2-second transaction time
}

function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = 'auto';
    selectedNFT = null;
}

function showErrorModal(message) {
    document.getElementById('errorText').textContent = message;
    showModal('errorModal');
}

function returnToWelcome() {
    // Add loading state
    const btn = event.target.closest('.nav-btn');
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<div class="loading"></div> Returning...';

    setTimeout(() => {
        btn.innerHTML = originalContent;
        window.location.href = 'dashboard.html'
    }, 1500);
}

function logout() {
    const btn = event.target.closest('.nav-btn');
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<div class="loading"></div> Logging out...';

    setTimeout(() => {
        if (confirm('Are you sure you want to logout? You will need to reconnect your wallet to access your NFTs again.')) {
            window.location.href = '../index.html'
        }
        btn.innerHTML = originalContent;

    }, 1000);
}

// Close modal when clicking outside
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function (e) {
        if (e.target === this) {
            closeModal();
        }
    });
});

// Keyboard navigation
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
        }
    });
}, observerOptions);

// Observe animated elements
document.querySelectorAll('.fade-in, .slide-in').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
});