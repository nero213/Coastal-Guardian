let map;
let marker;
let selectedLocation = { lat: 16.0194, lng: 120.2298 }; // Default location (Pangasinan)

document.addEventListener('DOMContentLoaded', function () {
    initMap();
    setupEventListeners();

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

function setupEventListeners() {
    // Show/hide "Other" threat type input
    document.getElementById('threatType').addEventListener('change', function () {
        const otherThreatGroup = document.getElementById('otherThreatGroup');
        if (this.value === 'other') {
            otherThreatGroup.style.display = 'block';
            document.getElementById('otherThreatType').setAttribute('required', 'required');
        } else {
            otherThreatGroup.style.display = 'none';
            document.getElementById('otherThreatType').removeAttribute('required');
        }
    });

    // Coordinate input changes
    document.getElementById('latitude').addEventListener('change', updateMarkerFromInputs);
    document.getElementById('longitude').addEventListener('change', updateMarkerFromInputs);

    // File upload handling
    document.getElementById('fileUpload').addEventListener('change', handleFileUpload);

    // Form submission
    document.getElementById('threatReportForm').addEventListener('submit', handleFormSubmit);
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
    const threatType = document.getElementById('threatType').value;
    const description = document.getElementById('description').value;
    const walletAddress = document.getElementById('walletAddress').value;

    // Validate wallet address format (basic check)
    if (!walletAddress.startsWith('0x') || walletAddress.length !== 42) {
        alert('Please enter a valid wallet address (0x followed by 40 hexadecimal characters)');
        return;
    }

    // Show loading state
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<div class="loading"></div> Submitting...';
    submitBtn.disabled = true;

    // Simulate blockchain transaction
    setTimeout(() => {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

        // Show success modal
        showModal('successModal');

        // Reset form
        document.getElementById('threatReportForm').reset();
        document.getElementById('previewGrid').innerHTML = '';
        document.getElementById('filePreview').classList.remove('active');

        // Reset map marker to default location
        selectedLocation = { lat: 16.0194, lng: 120.2298 };
        marker.setLatLng([selectedLocation.lat, selectedLocation.lng]);
        map.setView([selectedLocation.lat, selectedLocation.lng], 10);
        updateCoordinateInputs();

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
        window.location.href = '../index.html'; // In a real app, this would navigate to your welcome page
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