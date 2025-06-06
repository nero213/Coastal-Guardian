let map;
let marker;
let selectedLocation = { lat: 16.0194, lng: 120.2298 }; // Default location (Pangasinan)

// Species information database
const speciesInfo = {
    "whale shark": {
        category: "fish",
        info: "The whale shark (Rhincodon typus) is the largest fish species, feeding primarily on plankton. These gentle giants are endangered and sightings help track their migration patterns."
    },
    "dugong": {
        category: "mammal",
        info: "Dugongs (Dugong dugon) are marine mammals that feed on seagrass. They are vulnerable to extinction and your sighting is extremely valuable for conservation efforts."
    },
    "hawksbill turtle": {
        category: "reptile",
        info: "The hawksbill sea turtle (Eretmochelys imbricata) is critically endangered. They play a key role in maintaining coral reef ecosystems by controlling sponge populations."
    },
    "green turtle": {
        category: "reptile",
        info: "Green sea turtles (Chelonia mydas) are endangered and crucial for maintaining seagrass bed health. Your sighting helps track their population recovery."
    },
    "manta ray": {
        category: "fish",
        info: "Manta rays (Mobula birostris) are filter feeders that help regulate plankton populations. They are vulnerable to extinction and sightings help establish protection zones."
    },
    "dolphin": {
        category: "mammal",
        info: "Dolphins are intelligent marine mammals that play important roles in oceanic ecosystems. Your sighting helps track pod movements and health."
    }
};

document.addEventListener('DOMContentLoaded', function () {
    initMap();
    setupEventListeners();
    setDefaultDate();

    // Add animation delays
    const elements = document.querySelectorAll('.fade-in, .slide-in');
    elements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.1}s`;
    });
});

function initMap() {
    // Create map centered on default location
    map = L.map('map').setView([selectedLocation.lat, selectedLocation.lng], 10);

    // Add OpenStreetMap layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Add initial marker
    marker = L.marker([selectedLocation.lat, selectedLocation.lng], {
        draggable: true
    }).addTo(map);

    // Update coordinates when marker is dragged
    marker.on('dragend', function (e) {
        const position = marker.getLatLng();
        selectedLocation = { lat: position.lat, lng: position.lng };
        updateCoordinateInputs();
    });

    // Add click event to map
    map.on('click', function (e) {
        selectedLocation = { lat: e.latlng.lat, lng: e.latlng.lng };
        marker.setLatLng(e.latlng);
        updateCoordinateInputs();
    });

    // Update coordinate inputs with initial values
    updateCoordinateInputs();
}

function updateCoordinateInputs() {
    document.getElementById('latitude').value = selectedLocation.lat.toFixed(6);
    document.getElementById('longitude').value = selectedLocation.lng.toFixed(6);
}

function setDefaultDate() {
    // Set today's date as default
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    document.getElementById('sightingDate').value = formattedDate;

    // Set current time as default
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    document.getElementById('sightingTime').value = `${hours}:${minutes}`;
}

function setupEventListeners() {
    // Coordinate input changes
    document.getElementById('latitude').addEventListener('change', updateMarkerFromInputs);
    document.getElementById('longitude').addEventListener('change', updateMarkerFromInputs);

    // File upload handling
    document.getElementById('fileUpload').addEventListener('change', handleFileUpload);

    // Form submission
    document.getElementById('wildlifeForm').addEventListener('submit', handleFormSubmit);

    // Species name input for showing info
    document.getElementById('speciesName').addEventListener('input', checkSpeciesInfo);

    // Species category change
    document.getElementById('speciesCategory').addEventListener('change', function () {
        // Suggest common species based on category
        const category = this.value;
        const speciesInput = document.getElementById('speciesName');
        let placeholder = "Species name (if known)";

        switch (category) {
            case 'fish':
                placeholder = "E.g. Whale Shark, Manta Ray, Tuna";
                break;
            case 'mammal':
                placeholder = "E.g. Dolphin, Dugong, Whale";
                break;
            case 'reptile':
                placeholder = "E.g. Green Turtle, Hawksbill Turtle";
                break;
            case 'bird':
                placeholder = "E.g. Frigatebird, Pelican, Tern";
                break;
            case 'invertebrate':
                placeholder = "E.g. Giant Clam, Octopus, Jellyfish";
                break;
            case 'coral':
                placeholder = "E.g. Brain Coral, Staghorn Coral";
                break;
        }

        speciesInput.placeholder = placeholder;
        checkSpeciesInfo();
    });
}

function checkSpeciesInfo() {
    const speciesName = document.getElementById('speciesName').value.toLowerCase();
    const speciesInfoBox = document.getElementById('speciesInfo');
    const speciesInfoText = document.getElementById('speciesInfoText');

    // Check if we have info about this species
    for (const [key, data] of Object.entries(speciesInfo)) {
        if (speciesName.includes(key)) {
            speciesInfoBox.classList.add('active');
            speciesInfoText.textContent = data.info;

            // Auto-select the correct category if it's not already selected
            const categorySelect = document.getElementById('speciesCategory');
            if (categorySelect.value !== data.category) {
                categorySelect.value = data.category;
            }

            return;
        }
    }

    // If no match found, hide the info box
    speciesInfoBox.classList.remove('active');
}

function updateMarkerFromInputs() {
    const lat = parseFloat(document.getElementById('latitude').value);
    const lng = parseFloat(document.getElementById('longitude').value);

    if (!isNaN(lat) && !isNaN(lng)) {
        selectedLocation = { lat, lng };
        marker.setLatLng([lat, lng]);
        map.panTo([lat, lng]);
    }
}

function handleFileUpload(e) {
    const files = e.target.files;
    const previewGrid = document.getElementById('previewGrid');
    const filePreview = document.getElementById('filePreview');

    // Clear previous previews
    previewGrid.innerHTML = '';

    if (files.length > 0) {
        filePreview.classList.add('active');

        // Limit to 5 files
        const filesToProcess = Array.from(files).slice(0, 5);

        filesToProcess.forEach((file, index) => {
            const reader = new FileReader();
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';

            reader.onload = function (e) {
                if (file.type.startsWith('image/')) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    previewItem.appendChild(img);
                } else if (file.type.startsWith('video/')) {
                    const video = document.createElement('video');
                    video.src = e.target.result;
                    video.setAttribute('muted', 'muted');
                    previewItem.appendChild(video);
                }

                const removeBtn = document.createElement('div');
                removeBtn.className = 'preview-remove';
                removeBtn.innerHTML = '×';
                removeBtn.addEventListener('click', function () {
                    previewItem.remove();
                    if (previewGrid.children.length === 0) {
                        filePreview.classList.remove('active');
                    }
                });

                previewItem.appendChild(removeBtn);
                previewGrid.appendChild(previewItem);
            };

            reader.readAsDataURL(file);
        });
    } else {
        filePreview.classList.remove('active');
    }
}

function handleFormSubmit(e) {
    e.preventDefault();

    // Get form values
    const speciesCategory = document.getElementById('speciesCategory').value;
    const speciesName = document.getElementById('speciesName').value;
    const sightingDate = document.getElementById('sightingDate').value;
    const sightingTime = document.getElementById('sightingTime').value;
    const description = document.getElementById('description').value;
    const walletAddress = document.getElementById('walletAddress').value;

    // Validate wallet address format (basic check)
    if (!walletAddress.startsWith('0x') || walletAddress.length !== 42) {
        alert('Please enter a valid wallet address (0x followed by 40 hexadecimal characters)');
        return;
    }

    // Show loading state
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading"></div> Submitting...';
    submitBtn.disabled = true;

    // Simulate blockchain transaction
    setTimeout(() => {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        // Show success modal
        showModal('successModal');

        // Reset form
        document.getElementById('wildlifeForm').reset();
        document.getElementById('previewGrid').innerHTML = '';
        document.getElementById('filePreview').classList.remove('active');
        document.getElementById('speciesInfo').classList.remove('active');

        // Reset map marker to default location
        selectedLocation = { lat: 16.0194, lng: 120.2298 };
        marker.setLatLng([selectedLocation.lat, selectedLocation.lng]);
        map.setView([selectedLocation.lat, selectedLocation.lng], 10);
        updateCoordinateInputs();

        // Reset date and time
        setDefaultDate();

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
}

function returnToWelcome() {
    // Add loading state
    const btn = event.target;
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<div class="loading"></div> Returning...';

    setTimeout(() => {
        window.location.href = 'index.html'; // In a real app, this would navigate to your welcome page
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