const events = {
    1: {
        type: 'cleanup',
        participants: 45,
        coords: [16.0194, 120.2298],
        title: 'Lingayen Beach Cleanup',
        location: 'Lingayen Gulf, Pangasinan',
        date: 'Dec 15, 2024',
        duration: '4 hours',
        reward: '15 tokens',
        icon: '🧹'
    },
    2: {
        type: 'restoration',
        participants: 12,
        coords: [16.1572, 119.9908],
        title: 'Alaminos Coral Restoration',
        location: 'Alaminos Marine Sanctuary',
        date: 'Dec 18, 2024',
        duration: '6 hours',
        reward: '25 tokens',
        icon: '🪸'
    },
    3: {
        type: 'monitoring',
        participants: 8,
        coords: [16.1943, 119.9344],
        title: 'Hundred Islands Marine Monitoring',
        location: 'Hundred Islands National Park',
        date: 'Dec 20, 2024',
        duration: '8 hours',
        reward: '30 tokens',
        icon: '🔬'
    },
    4: {
        type: 'education',
        participants: 35,
        coords: [15.9759, 120.3370],
        title: 'Dagupan Conservation Workshop',
        location: 'Dagupan Community Center',
        date: 'Dec 22, 2024',
        duration: '3 hours',
        reward: '10 tokens',
        icon: '📚'
    },
    5: {
        type: 'cleanup',
        participants: 28,
        coords: [16.3831, 119.8867],
        title: 'Bolinao Mangrove Restoration',
        location: 'Bolinao Peninsula',
        date: 'Dec 25, 2024',
        duration: '5 hours',
        reward: '20 tokens',
        icon: '🌿'
    },
    6: {
        type: 'restoration',
        participants: 15,
        coords: [15.9315, 120.3417],
        title: 'San Carlos Reef Survey',
        location: 'San Carlos Marine Reserve',
        date: 'Dec 28, 2024',
        duration: '6 hours',
        reward: '25 tokens',
        icon: '🐠'
    },
    7: {
        type: 'monitoring',
        participants: 20,
        coords: [16.2642, 119.9908],
        title: 'Anda Water Quality Assessment',
        location: 'Anda Coastal Waters',
        date: 'Jan 2, 2025',
        duration: '4 hours',
        reward: '18 tokens',
        icon: '💧'
    },
    8: {
        type: 'education',
        participants: 42,
        coords: [16.1936, 119.8344],
        title: 'Bani Community Outreach',
        location: 'Bani Municipal Hall',
        date: 'Jan 5, 2025',
        duration: '6 hours',
        reward: '12 tokens',
        icon: '👥'
    },
    9: {
        type: 'cleanup',
        participants: 38,
        coords: [15.8789, 120.1167],
        title: 'Labrador Beach Cleanup',
        location: 'Labrador Beach',
        date: 'Jan 8, 2025',
        duration: '5 hours',
        reward: '16 tokens',
        icon: '🏖️'
    },
    10: {
        type: 'restoration',
        participants: 18,
        coords: [16.2167, 120.0667],
        title: 'Infanta Seagrass Restoration',
        location: 'Infanta Marine Sanctuary',
        date: 'Jan 12, 2025',
        duration: '7 hours',
        reward: '28 tokens',
        icon: '🌱'
    },
    11: {
        type: 'monitoring',
        participants: 12,
        coords: [16.2167, 119.8833],
        title: 'Dasol Turtle Monitoring',
        location: 'Dasol Nesting Beach',
        date: 'Jan 15, 2025',
        duration: '8 hours',
        reward: '35 tokens',
        icon: '🐢'
    },
    12: {
        type: 'education',
        participants: 55,
        coords: [15.8833, 120.0167],
        title: 'Agno Youth Marine Education',
        location: 'Agno High School',
        date: 'Jan 18, 2025',
        duration: '4 hours',
        reward: '8 tokens',
        icon: '🎓'
    }
};

// Initialize map
let map;
let markers = {};
let markerClusterGroup;
let currentFilter = 'all';
let satelliteLayer;
let osmLayer;

function initMap() {
    // Create map centered on Pangasinan
    map = L.map('map').setView([16.0769, 120.0], 10);

    // OpenStreetMap layer
    osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Satellite layer (using Esri World Imagery)
    satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19
    });

    // Initialize marker cluster group
    markerClusterGroup = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true
    });

    // Add markers for all events
    addEventMarkers();

    // Add cluster group to map
    map.addLayer(markerClusterGroup);

    // Add event listeners
    setupEventListeners();

    // Update stats
    updateStats();
}

function addEventMarkers() {
    Object.keys(events).forEach(eventId => {
        const event = events[eventId];

        // Create custom marker HTML
        const markerHtml = `
                    <div class="custom-marker marker-${event.type}" data-event="${eventId}">
                        ${event.icon}
                    </div>
                `;

        // Create custom icon
        const customIcon = L.divIcon({
            html: markerHtml,
            className: 'custom-div-icon',
            iconSize: [45, 45],
            iconAnchor: [22.5, 22.5],
            popupAnchor: [0, -22.5]
        });

        // Create marker
        const marker = L.marker(event.coords, { icon: customIcon });

        // Create popup content
        const popupContent = `
                    <div class="popup-header">
                        <div class="popup-icon marker-${event.type}">${event.icon}</div>
                        <div>
                            <h4 class="popup-title">${event.title}</h4>
                            <p class="popup-location">📍 ${event.location}</p>
                        </div>
                    </div>
                    <div class="popup-meta">
                        <div class="popup-meta-item">
                            <div class="popup-meta-label">Date</div>
                            <div class="popup-meta-value">${event.date}</div>
                        </div>
                        <div class="popup-meta-item">
                            <div class="popup-meta-label">Participants</div>
                            <div class="popup-meta-value">${event.participants}</div>
                        </div>
                        <div class="popup-meta-item">
                            <div class="popup-meta-label">Duration</div>
                            <div class="popup-meta-value">${event.duration}</div>
                        </div>
                        <div class="popup-meta-item">
                            <div class="popup-meta-label">SBT Reward</div>
                            <div class="popup-meta-value">${event.reward}</div>
                        </div>
                    </div>
                    <button class="popup-btn" onclick="showEventDetails(${eventId})">View Details</button>
                `;

        marker.bindPopup(popupContent, {
            maxWidth: 300,
            className: 'custom-popup'
        });

        // Add click event to marker
        marker.on('click', function () {
            showEventDetails(eventId);
            setActiveMarker(eventId);
        });

        // Store marker reference
        markers[eventId] = marker;

        // Add to cluster group
        markerClusterGroup.addLayer(marker);
    });
}

function setupEventListeners() {
    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            setActiveFilter(btn);
            filterEvents(filter);
        });
    });
}

function showEventDetails(eventId) {
    // Hide placeholder
    const placeholder = document.getElementById('eventPlaceholder');
    if (placeholder) {
        placeholder.style.display = 'none';
    }

    // Hide all event cards
    document.querySelectorAll('.event-card').forEach(card => {
        card.classList.remove('active');
    });

    // Show selected event card
    const selectedCard = document.getElementById(`event-${eventId}`);
    if (selectedCard) {
        selectedCard.classList.add('active');

        // Smooth scroll to the event details section on mobile
        if (window.innerWidth <= 1024) {
            selectedCard.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }

        // Add a subtle highlight effect
        selectedCard.style.transform = 'scale(1.02)';
        setTimeout(() => {
            selectedCard.style.transform = 'scale(1)';
        }, 300);

        console.log(`Event ${eventId} details displayed successfully`);
    } else {
        console.error(`Event card with ID event-${eventId} not found`);
    }
}

function setActiveMarker(eventId) {
    // Remove active class from all markers
    document.querySelectorAll('.custom-marker').forEach(marker => {
        marker.classList.remove('active');
    });

    // Add active class to selected marker
    const activeMarker = document.querySelector(`[data-event="${eventId}"]`);
    if (activeMarker) {
        activeMarker.classList.add('active');
    }
}

function setActiveFilter(activeBtn) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    activeBtn.classList.add('active');
}

function filterEvents(filter) {
    currentFilter = filter;

    // Clear existing markers from cluster group
    markerClusterGroup.clearLayers();

    // Add filtered markers
    Object.keys(events).forEach(eventId => {
        const event = events[eventId];
        if (filter === 'all' || event.type === filter) {
            markerClusterGroup.addLayer(markers[eventId]);
        }
    });

    // Reset active states
    document.querySelectorAll('.custom-marker').forEach(marker => {
        marker.classList.remove('active');
    });

    // Hide event details and show placeholder
    document.querySelectorAll('.event-card').forEach(card => {
        card.classList.remove('active');
    });
    document.getElementById('eventPlaceholder').style.display = 'block';

    // Update stats based on filter
    updateStats(filter);
}

function updateStats(filter = 'all') {
    let totalEvents = 0;
    let totalParticipants = 0;

    Object.keys(events).forEach(eventId => {
        const event = events[eventId];
        if (filter === 'all' || event.type === filter) {
            totalEvents++;
            totalParticipants += event.participants;
        }
    });

    // Animate counter updates
    animateCounter('totalEvents', totalEvents);
    animateCounter('totalParticipants', totalParticipants);
}

function animateCounter(elementId, target) {
    const element = document.getElementById(elementId);
    const start = parseInt(element.textContent) || 0;
    const duration = 1000;
    const startTime = performance.now();

    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + (target - start) * progress);
        element.textContent = current;
        if (progress < 1) requestAnimationFrame(updateCounter);
    }
    requestAnimationFrame(updateCounter);
}

// Map control functions
function centerOnPangasinan() {
    map.setView([16.0769, 120.0], 10);
}

function showAllEvents() {
    // Reset filter to show all events
    document.querySelector('[data-filter="all"]').click();

    // Fit map to show all markers
    if (markerClusterGroup.getLayers().length > 0) {
        map.fitBounds(markerClusterGroup.getBounds(), { padding: [20, 20] });
    }
}

function toggleSatellite() {
    if (map.hasLayer(satelliteLayer)) {
        map.removeLayer(satelliteLayer);
        map.addLayer(osmLayer);
    } else {
        map.removeLayer(osmLayer);
        map.addLayer(satelliteLayer);
    }
}

// Return to welcome page
function returnToWelcome() {
    const returnBtn = document.querySelector('.return-btn');
    const originalContent = returnBtn.innerHTML;

    returnBtn.innerHTML = `<div class="loading"></div> Returning...`;

    setTimeout(() => {
        window.location.href = 'dashboard.html'
        returnBtn.innerHTML = originalContent;
    }, 1500);
}

// Join event functionality
function joinEvent(eventId) {
    const btn = event.target;
    const originalContent = btn.innerHTML;

    btn.innerHTML = `<div class="loading"></div> Joining...`;

    setTimeout(() => {
        alert('Successfully joined the event!\n\nYou will receive a confirmation email with event details and location information.');
        btn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    Joined!
                `;
        btn.style.background = 'var(--accent-wave)';
    }, 2000);
}

// Initialize map when page loads
document.addEventListener('DOMContentLoaded', initMap);

// Handle window resize
window.addEventListener('resize', () => {
    if (map) {
        map.invalidateSize();
    }
});