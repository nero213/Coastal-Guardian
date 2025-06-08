const nftCollections = {
    1: { name: "Tide Pool Explorer", emoji: "🦀", rarity: "Common" },
    2: { name: "Coral Gardener", emoji: "🪸", rarity: "Common" },
    3: { name: "Wave Rider", emoji: "🏄", rarity: "Uncommon" },
    4: { name: "Marine Biologist", emoji: "🐠", rarity: "Uncommon" },
    5: { name: "Ocean Protector", emoji: "🌊", rarity: "Rare" },
    6: { name: "Coral Guardian", emoji: "🐠", rarity: "Rare" },
    7: { name: "Deep Sea Explorer", emoji: "🦪", rarity: "Epic" },
    8: { name: "Whale Whisperer", emoji: "🐋", rarity: "Epic" },
    9: { name: "Ocean Sage", emoji: "🧙‍♂️", rarity: "Legendary" },
    10: { name: "Poseidon's Champion", emoji: "🔱", rarity: "Mythic" }
};

// Sample data for coastal guardians - levels based on NFT count
const guardians = [
    {
        id: 1,
        name: "Marina Delmar",
        avatar: "🌊",
        nftCount: 8,
        score: 2450,
        actions: 127,
        trend: "up",
        trendValue: "+15%",
        specialty: "cleanup",
        ecoCoins: 89,
        lastActive: "Dec 15"
    },
    {
        id: 2,
        name: "Captain Reef",
        avatar: "🐠",
        nftCount: 7,
        score: 2380,
        actions: 98,
        trend: "up",
        trendValue: "+8%",
        specialty: "awareness",
        ecoCoins: 76,
        lastActive: "Dec 14"
    },
    {
        id: 3,
        name: "Tidal Wave",
        avatar: "🏄",
        nftCount: 6,
        score: 2290,
        actions: 89,
        trend: "same",
        trendValue: "0%",
        specialty: "cleanup",
        ecoCoins: 68,
        lastActive: "Dec 13"
    },
    {
        id: 4,
        name: "Kelp Forest",
        avatar: "🌿",
        nftCount: 6,
        score: 2180,
        actions: 76,
        trend: "up",
        trendValue: "+12%",
        specialty: "restoration",
        ecoCoins: 62,
        lastActive: "Dec 12"
    },
    {
        id: 5,
        name: "Pearl Diver",
        avatar: "🦪",
        nftCount: 5,
        score: 2050,
        actions: 67,
        trend: "down",
        trendValue: "-3%",
        specialty: "cleanup",
        ecoCoins: 58,
        lastActive: "Dec 11"
    },
    {
        id: 6,
        name: "Seahorse Whisperer",
        avatar: "🐴",
        nftCount: 5,
        score: 1920,
        actions: 58,
        trend: "up",
        trendValue: "+7%",
        specialty: "awareness",
        ecoCoins: 54,
        lastActive: "Dec 10"
    },
    {
        id: 7,
        name: "Starfish Collector",
        avatar: "⭐",
        nftCount: 4,
        score: 1850,
        actions: 52,
        trend: "up",
        trendValue: "+5%",
        specialty: "cleanup",
        ecoCoins: 49,
        lastActive: "Dec 9"
    },
    {
        id: 8,
        name: "Dolphin Friend",
        avatar: "🐬",
        nftCount: 4,
        score: 1780,
        actions: 45,
        trend: "same",
        trendValue: "0%",
        specialty: "awareness",
        ecoCoins: 45,
        lastActive: "Dec 8"
    },
    {
        id: 9,
        name: "Turtle Tracker",
        avatar: "🐢",
        nftCount: 3,
        score: 1650,
        actions: 38,
        trend: "up",
        trendValue: "+18%",
        specialty: "restoration",
        ecoCoins: 41,
        lastActive: "Dec 7"
    },
    {
        id: 10,
        name: "Whale Song",
        avatar: "🐋",
        nftCount: 3,
        score: 1520,
        actions: 31,
        trend: "up",
        trendValue: "+22%",
        specialty: "awareness",
        ecoCoins: 38,
        lastActive: "Dec 6"
    }
];

let currentFilter = 'all';
let filteredGuardians = [...guardians];

// Get level info based on NFT count
function getLevelInfo(nftCount) {
    const level = Math.min(nftCount, 10);
    const collection = nftCollections[level];
    return {
        level: level,
        name: collection.name,
        emoji: collection.emoji,
        rarity: collection.rarity
    };
}

// Initialize the leaderboard
function initializeLeaderboard() {
    renderPodium();
    renderGuardiansList();
    setupEventListeners();
    animateStats();
}

// Render top 3 podium
function renderPodium() {
    const podium = document.getElementById('podium');
    const top3 = filteredGuardians.slice(0, 3);

    podium.innerHTML = top3.map((guardian, index) => {
        const position = ['second', 'first', 'third'][index];
        const rank = index + 1;
        const levelInfo = getLevelInfo(guardian.nftCount);

        return `
                    <div class="podium-place ${position}" onclick="showNFTPreview(${guardian.id})">
                        <div class="podium-rank">${rank}</div>
                        <div class="podium-avatar pulse">${guardian.avatar}</div>
                        <div class="podium-name">${guardian.name}</div>
                        <div class="podium-level">${levelInfo.name}</div>
                        <div class="podium-nft-count">${guardian.nftCount} Soulbound NFTs</div>
                        <div class="podium-score">${guardian.score.toLocaleString()}</div>
                        <div class="podium-actions">${guardian.actions} actions</div>
                    </div>
                `;
    }).join('');
}

// Render guardians list
function renderGuardiansList() {
    const guardiansList = document.getElementById('guardiansList');
    const remainingGuardians = filteredGuardians.slice(3);

    if (remainingGuardians.length === 0) {
        guardiansList.innerHTML = '<div class="loading"><p>No guardians found for this filter.</p></div>';
        return;
    }

    guardiansList.innerHTML = remainingGuardians.map((guardian, index) => {
        const rank = index + 4;
        const levelInfo = getLevelInfo(guardian.nftCount);
        const trendClass = guardian.trend === 'up' ? 'trend-up' :
            guardian.trend === 'down' ? 'trend-down' : 'trend-same';
        const trendIcon = guardian.trend === 'up' ? '↗️' :
            guardian.trend === 'down' ? '↘️' : '➡️';

        return `
                    <div class="guardian-item" onclick="showNFTPreview(${guardian.id})">
                        <div class="guardian-rank">${rank}</div>
                        <div class="guardian-info">
                            <div class="guardian-avatar">${guardian.avatar}</div>
                            <div class="guardian-details">
                                <h3>${guardian.name}</h3>
                                <div class="guardian-level">
                                    ${levelInfo.name}
                                    <span class="level-badge">Lv.${levelInfo.level}</span>
                                </div>
                                <div class="nft-count">${guardian.nftCount} NFTs</div>
                            </div>
                        </div>
                        <div class="guardian-score">${guardian.score.toLocaleString()}</div>
                        <div class="guardian-actions">${guardian.actions}</div>
                        <div class="guardian-trend ${trendClass}">
                            ${trendIcon} ${guardian.trendValue}
                        </div>
                    </div>
                `;
    }).join('');
}

// Filter guardians based on selected filter
function filterGuardians(filter) {
    currentFilter = filter;

    switch (filter) {
        case 'cleanup':
            filteredGuardians = guardians.filter(g => g.specialty === 'cleanup');
            break;
        case 'awareness':
            filteredGuardians = guardians.filter(g => g.specialty === 'awareness');
            break;
        case 'monthly':
            // Simulate monthly data by slightly shuffling scores
            filteredGuardians = [...guardians].map(g => ({
                ...g,
                score: Math.floor(g.score * (0.3 + Math.random() * 0.4))
            })).sort((a, b) => b.score - a.score);
            break;
        case 'weekly':
            // Simulate weekly data
            filteredGuardians = [...guardians].map(g => ({
                ...g,
                score: Math.floor(g.score * (0.1 + Math.random() * 0.2))
            })).sort((a, b) => b.score - a.score);
            break;
        default:
            filteredGuardians = [...guardians];
    }

    renderPodium();
    renderGuardiansList();
}

// Setup event listeners
function setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filterGuardians(e.target.dataset.filter);
        });
    });

    // Close NFT preview when clicking overlay
    document.getElementById('overlay').addEventListener('click', closeNFTPreview);
}

// Show NFT preview
function showNFTPreview(guardianId) {
    const guardian = guardians.find(g => g.id === guardianId);
    if (!guardian) return;

    const levelInfo = getLevelInfo(guardian.nftCount);

    document.getElementById('nftImage').textContent = levelInfo.emoji;
    document.getElementById('nftTitle').textContent = `${levelInfo.name} Collection`;
    document.getElementById('nftLevel').textContent = `Level ${levelInfo.level}`;
    document.getElementById('nftCollection').textContent = levelInfo.name;
    document.getElementById('nftCount').textContent = guardian.nftCount;
    document.getElementById('nftImpact').textContent = guardian.score.toLocaleString();

    document.getElementById('overlay').classList.add('show');
    document.getElementById('nftPreview').classList.add('show');
}

// Close NFT preview
function closeNFTPreview() {
    document.getElementById('overlay').classList.remove('show');
    document.getElementById('nftPreview').classList.remove('show');
}

// Logout function
function logout() {
    // In a real application, this would handle authentication logout
    alert("Logging out...");
    // Redirect to login page
    // window.location.href = "login.html";
}

// Animate statistics
function animateStats() {
    const stats = [
        { id: 'totalGuardians', target: 247 },
        { id: 'totalNFTs', target: 1234 },
        { id: 'totalActions', target: 1892 },
        { id: 'coastlineProtected', target: 156 },
        { id: 'totalCoins', target: 12.5, suffix: 'k' },
        { id: 'carbonOffset', target: 2.4, suffix: 'k' }
    ];

    stats.forEach(stat => {
        const element = document.getElementById(stat.id);
        const target = stat.target;
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }

            const value = stat.suffix ?
                current.toFixed(1) + stat.suffix :
                Math.floor(current).toLocaleString();
            element.textContent = value;
        }, duration / steps);
    });
}

// Simulate real-time updates
function simulateRealTimeUpdates() {
    setInterval(() => {
        // Randomly update a guardian's score
        const randomIndex = Math.floor(Math.random() * guardians.length);
        const scoreChange = Math.floor(Math.random() * 20) - 10; // -10 to +10

        guardians[randomIndex].score += scoreChange;
        guardians[randomIndex].trend = scoreChange > 0 ? 'up' : scoreChange < 0 ? 'down' : 'same';
        guardians[randomIndex].trendValue = scoreChange > 0 ? `+${scoreChange}` : `${scoreChange}`;

        // Re-sort guardians
        guardians.sort((a, b) => b.score - a.score);

        // Update display if showing all-time leaderboard
        if (currentFilter === 'all') {
            filteredGuardians = [...guardians];
            renderPodium();
            renderGuardiansList();
        }
    }, 10000); // Update every 10 seconds
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initializeLeaderboard();
        simulateRealTimeUpdates();
    }, 1000); // Small delay to show loading state
});