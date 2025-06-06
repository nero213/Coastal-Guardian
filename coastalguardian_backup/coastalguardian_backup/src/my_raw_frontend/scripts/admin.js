// Global state management
let currentSection = "dashboard"
let pendingSubmissions = 15
let currentSubmissionId = null

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  initializeNavigation()
  initializeEventListeners()
  initializeAnimations()
  updateDashboardMetrics()
  startRealTimeUpdates()
})

// Navigation functionality
function initializeNavigation() {
  const navItems = document.querySelectorAll(".nav-item")
  const contentSections = document.querySelectorAll(".content-section")

  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      const targetSection = this.getAttribute("data-section")

      // Remove active class from all nav items and sections
      navItems.forEach((nav) => nav.classList.remove("active"))
      contentSections.forEach((section) => section.classList.remove("active"))

      // Add active class to clicked nav item and corresponding section
      this.classList.add("active")
      document.getElementById(targetSection).classList.add("active")

      currentSection = targetSection

      // Load section-specific data
      loadSectionData(targetSection)
    })
  })

  // Mobile menu toggle
  const menuToggle = document.getElementById("menuToggle")
  const sidebar = document.getElementById("sidebar")

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open")
    })
  }

  // Close sidebar when clicking outside on mobile
  document.addEventListener("click", (e) => {
    if (
      window.innerWidth <= 768 &&
      !sidebar.contains(e.target) &&
      !menuToggle.contains(e.target) &&
      sidebar.classList.contains("open")
    ) {
      sidebar.classList.remove("open")
    }
  })
}

// Event listeners
function initializeEventListeners() {
  // Search functionality
  const searchInputs = document.querySelectorAll(".search-input")
  searchInputs.forEach((input) => {
    input.addEventListener("input", handleSearch)
  })

  // Filter functionality
  const filterSelects = document.querySelectorAll(".filter-select")
  filterSelects.forEach((select) => {
    select.addEventListener("change", handleFilterChange)
  })

  // Date filter buttons
  const dateButtons = document.querySelectorAll(".date-btn")
  dateButtons.forEach((button) => {
    button.addEventListener("click", function () {
      dateButtons.forEach((btn) => btn.classList.remove("active"))
      this.classList.add("active")
      updateAnalytics(this.textContent)
    })
  })

  // Map filter buttons
  const mapFilters = document.querySelectorAll(".map-filter")
  mapFilters.forEach((filter) => {
    filter.addEventListener("click", function () {
      mapFilters.forEach((f) => f.classList.remove("active"))
      this.classList.add("active")
      filterMapMarkers(this.textContent.toLowerCase())
    })
  })

  // Reward input changes
  const rewardInputs = document.querySelectorAll(".reward-input")
  rewardInputs.forEach((input) => {
    input.addEventListener("change", handleRewardChange)
  })

  // Settings toggles
  const settingToggles = document.querySelectorAll('.setting-toggle input[type="checkbox"]')
  settingToggles.forEach((toggle) => {
    toggle.addEventListener("change", handleSettingToggle)
  })

  // Close modals when clicking outside
  window.addEventListener("click", (event) => {
    const modals = document.querySelectorAll(".modal")
    modals.forEach((modal) => {
      if (event.target === modal) {
        modal.style.display = "none"
      }
    })
  })

  // Keyboard shortcuts
  document.addEventListener("keydown", handleKeyboardShortcuts)
}

// Initialize animations
function initializeAnimations() {
  // Animate progress bars
  setTimeout(() => {
    const progressBars = document.querySelectorAll(".chart-fill")
    progressBars.forEach((bar) => {
      const width = bar.style.width
      bar.style.width = "0%"
      setTimeout(() => {
        bar.style.width = width
      }, 100)
    })
  }, 500)

  // Animate stat cards
  const statCards = document.querySelectorAll(".stat-card")
  statCards.forEach((card, index) => {
    card.style.opacity = "0"
    card.style.transform = "translateY(20px)"
    setTimeout(() => {
      card.style.transition = "all 0.5s ease"
      card.style.opacity = "1"
      card.style.transform = "translateY(0)"
    }, index * 100)
  })
}

// Load section-specific data
function loadSectionData(section) {
  switch (section) {
    case "dashboard":
      updateDashboardMetrics()
      break
    case "submissions":
      loadPendingSubmissions()
      break
    case "events":
      loadEventManagement()
      break
    case "users":
      loadUserManagement()
      break
    case "tokens":
      loadTokenDistribution()
      break
    case "analytics":
      loadAnalytics()
      break
    case "settings":
      loadSettings()
      break
  }
}

// Dashboard functions
function updateDashboardMetrics() {
  // Simulate real-time updates
  const metrics = [
    { selector: ".stat-card:nth-child(1) h3", value: 1247, increment: 1 },
    { selector: ".stat-card:nth-child(2) h3", value: 45680, increment: 10 },
    { selector: ".stat-card:nth-child(3) h3", value: pendingSubmissions, increment: 0 },
    { selector: ".stat-card:nth-child(4) h3", value: 2340, increment: 2 },
  ]

  metrics.forEach((metric) => {
    const element = document.querySelector(metric.selector)
    if (element && Math.random() > 0.95) {
      const currentValue = Number.parseInt(element.textContent.replace(/,/g, ""))
      const newValue = currentValue + metric.increment
      element.textContent = newValue.toLocaleString()
    }
  })
}

// Submission management
function approveSubmission(submissionId) {
  if (confirm("Approve this submission and distribute CGT rewards?")) {
    const submissionCard = document.querySelector(`[data-id="${submissionId}"]`)

    // Add loading state
    submissionCard.classList.add("loading")

    // Simulate API call
    setTimeout(() => {
      // Remove the submission card with animation
      submissionCard.style.transform = "translateX(100%)"
      submissionCard.style.opacity = "0"

      setTimeout(() => {
        submissionCard.remove()
        updatePendingCount(-1)
        showNotification("Submission approved! CGT tokens have been distributed.", "success")
      }, 300)
    }, 1000)
  }
}

function showRejectModal(submissionId) {
  currentSubmissionId = submissionId
  document.getElementById("rejectModal").style.display = "block"
}

function closeRejectModal() {
  document.getElementById("rejectModal").style.display = "none"
  currentSubmissionId = null
}

function rejectSubmission(event) {
  event.preventDefault()

  const formData = new FormData(event.target)
  const reason = formData.get("rejectionReason")
  const comments = formData.get("rejectionComments")

  if (!reason) {
    showNotification("Please select a rejection reason.", "error")
    return
  }

  const submissionCard = document.querySelector(`[data-id="${currentSubmissionId}"]`)

  // Add loading state
  submissionCard.classList.add("loading")

  // Simulate API call
  setTimeout(() => {
    // Remove the submission card with animation
    submissionCard.style.transform = "translateX(-100%)"
    submissionCard.style.opacity = "0"

    setTimeout(() => {
      submissionCard.remove()
      updatePendingCount(-1)
      showNotification("Submission rejected. User has been notified.", "warning")
      closeRejectModal()
    }, 300)
  }, 1000)
}

function updatePendingCount(change) {
  pendingSubmissions += change
  const badge = document.querySelector(".badge")
  if (badge) {
    badge.textContent = pendingSubmissions
    if (pendingSubmissions === 0) {
      badge.style.display = "none"
    }
  }

  // Update dashboard metric
  const pendingMetric = document.querySelector(".stat-card:nth-child(3) h3")
  if (pendingMetric) {
    pendingMetric.textContent = pendingSubmissions
  }
}

// Event management
function showCreateEventModal() {
  document.getElementById("createEventModal").style.display = "block"
}

function closeCreateEventModal() {
  document.getElementById("createEventModal").style.display = "none"
  document.getElementById("createEventForm").reset()
}

function createEvent(event) {
  event.preventDefault()

  const formData = new FormData(event.target)
  const eventData = {
    name: formData.get("eventName"),
    emoji: formData.get("eventEmoji"),
    reward: formData.get("rewardValue"),
    unit: formData.get("rewardUnit"),
    description: formData.get("eventDescription"),
    category: formData.get("eventCategory"),
    status: formData.get("eventStatus"),
  }

  // Validate form
  if (!eventData.name || !eventData.emoji || !eventData.reward || !eventData.unit || !eventData.description) {
    showNotification("Please fill in all required fields.", "error")
    return
  }

  // Simulate API call
  setTimeout(() => {
    showNotification(`Event "${eventData.name}" created successfully!`, "success")
    closeCreateEventModal()
    addEventToGrid(eventData)
  }, 1000)
}

function addEventToGrid(eventData) {
  const eventsGrid = document.querySelector(".events-grid")
  const eventCard = createEventCard(eventData)
  eventsGrid.appendChild(eventCard)
}

function createEventCard(eventData) {
  const card = document.createElement("div")
  card.className = "event-card"
  card.innerHTML = `
    <div class="event-header">
      <span class="event-emoji">${eventData.emoji}</span>
      <div class="event-title">
        <h3>${eventData.name}</h3>
        <div class="event-status ${eventData.status}">${eventData.status.charAt(0).toUpperCase() + eventData.status.slice(1)}</div>
      </div>
      <div class="event-menu">
        <button class="btn-icon" onclick="toggleEventMenu(this)">
          <i class="fas fa-ellipsis-v"></i>
        </button>
        <div class="event-dropdown">
          <a href="#" onclick="editEvent('${eventData.name.toLowerCase()}')"><i class="fas fa-edit"></i> Edit</a>
          <a href="#" onclick="toggleEventStatus('${eventData.name.toLowerCase()}')"><i class="fas fa-pause"></i> Pause</a>
          <a href="#" onclick="duplicateEvent('${eventData.name.toLowerCase()}')"><i class="fas fa-copy"></i> Duplicate</a>
          <a href="#" class="text-danger" onclick="deleteEvent('${eventData.name.toLowerCase()}')"><i class="fas fa-trash"></i> Delete</a>
        </div>
      </div>
    </div>
    <div class="event-body">
      <p class="event-description">${eventData.description}</p>
      <div class="event-stats">
        <div class="event-stat">
          <span class="stat-label">Submissions</span>
          <span class="stat-value">0</span>
        </div>
        <div class="event-stat">
          <span class="stat-label">CGT Awarded</span>
          <span class="stat-value">0</span>
        </div>
      </div>
      <div class="event-reward-config">
        <div class="reward-setting">
          <label>Reward ${eventData.unit}:</label>
          <div class="reward-input-group">
            <input type="number" value="${eventData.reward}" class="reward-input">
            <span>CGT</span>
          </div>
        </div>
      </div>
    </div>
    <div class="event-footer">
      <button class="btn btn-sm btn-outline" onclick="viewEventDetails('${eventData.name.toLowerCase()}')">
        <i class="fas fa-chart-bar"></i> View Analytics
      </button>
      <button class="btn btn-sm btn-primary" onclick="editEvent('${eventData.name.toLowerCase()}')">
        <i class="fas fa-edit"></i> Edit
      </button>
    </div>
  `
  return card
}

function toggleEventMenu(button) {
  const dropdown = button.nextElementSibling
  const isOpen = dropdown.classList.contains("show")

  // Close all other dropdowns
  document.querySelectorAll(".event-dropdown").forEach((d) => d.classList.remove("show"))

  if (!isOpen) {
    dropdown.classList.add("show")
  }
}

function editEvent(eventType) {
  showNotification(`Opening edit dialog for ${eventType} event...`, "success")
}

function toggleEventStatus(eventType) {
  showNotification(`Toggling status for ${eventType} event...`, "success")
}

function duplicateEvent(eventType) {
  showNotification(`Duplicating ${eventType} event...`, "success")
}

function deleteEvent(eventType) {
  if (confirm(`Are you sure you want to delete the ${eventType} event? This action cannot be undone.`)) {
    showNotification(`${eventType} event deleted successfully.`, "warning")
  }
}

function viewEventDetails(eventType) {
  showNotification(`Loading analytics for ${eventType} event...`, "success")
}

// User management
function viewUser(userId) {
  showNotification(`Loading user profile for ${userId}...`, "success")
}

function editUser(userId) {
  showNotification(`Opening edit dialog for user ${userId}...`, "success")
}

function showUserHistory(userId) {
  showNotification(`Loading activity history for user ${userId}...`, "success")
}

// Search and filter functions
function handleSearch(event) {
  const searchTerm = event.target.value.toLowerCase()

  if (currentSection === "users") {
    const userRows = document.querySelectorAll(".users-table tbody tr")
    userRows.forEach((row) => {
      const userName = row.querySelector(".user-name").textContent.toLowerCase()
      const userEmail = row.querySelector(".user-email").textContent.toLowerCase()

      if (userName.includes(searchTerm) || userEmail.includes(searchTerm)) {
        row.style.display = ""
      } else {
        row.style.display = "none"
      }
    })
  } else if (currentSection === "submissions") {
    const submissionCards = document.querySelectorAll(".submission-card")
    submissionCards.forEach((card) => {
      const submissionText = card.textContent.toLowerCase()
      if (submissionText.includes(searchTerm)) {
        card.style.display = ""
      } else {
        card.style.display = "none"
      }
    })
  }
}

function handleFilterChange(event) {
  const filterValue = event.target.value
  showNotification(`Filter applied: ${filterValue}`, "success")
}

function handleRewardChange(event) {
  const newValue = event.target.value

  // Auto-save functionality
  setTimeout(() => {
    showNotification(`Reward value updated to ${newValue} CGT`, "success")
  }, 500)
}

function handleSettingToggle(event) {
  const settingName = event.target.id
  const isEnabled = event.target.checked

  showNotification(`${settingName} ${isEnabled ? "enabled" : "disabled"}`, "success")
}

// Map functionality
function filterMapMarkers(filter) {
  const markers = document.querySelectorAll(".map-marker")
  markers.forEach((marker) => {
    if (filter === "all" || marker.dataset.type === filter) {
      marker.style.display = "flex"
    } else {
      marker.style.display = "none"
    }
  })
}

// Analytics functions
function updateAnalytics(period) {
  showNotification(`Analytics updated for ${period}`, "success")
}

// Load functions for different sections
function loadPendingSubmissions() {
  console.log("Loading pending submissions...")
}

function loadEventManagement() {
  console.log("Loading event management...")
}

function loadUserManagement() {
  console.log("Loading user management...")
}

function loadTokenDistribution() {
  console.log("Loading token distribution...")
}

function loadAnalytics() {
  console.log("Loading analytics...")
}

function loadSettings() {
  console.log("Loading settings...")
}

// Logout functionality
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    showNotification("Logging out...", "warning")
    setTimeout(() => {
      // In a real application, this would clear session/tokens and redirect
      window.location.href = "/login"
    }, 1500)
  }
}

// Notification system
function showNotification(message, type = "success") {
  // Remove existing notifications
  const existingToasts = document.querySelectorAll(".notification-toast")
  existingToasts.forEach((toast) => toast.remove())

  const toast = document.createElement("div")
  toast.className = `notification-toast ${type}`

  const icon =
    type === "success"
      ? "fa-check-circle"
      : type === "warning"
        ? "fa-exclamation-triangle"
        : type === "error"
          ? "fa-times-circle"
          : "fa-info-circle"

  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.75rem;">
      <i class="fas ${icon}" style="font-size: 1.2rem;"></i>
      <span>${message}</span>
    </div>
  `

  document.body.appendChild(toast)

  // Animate in
  setTimeout(() => {
    toast.classList.add("show")
  }, 100)

  // Remove after 4 seconds
  setTimeout(() => {
    toast.classList.remove("show")
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove()
      }
    }, 300)
  }, 4000)
}

// Keyboard shortcuts
function handleKeyboardShortcuts(event) {
  // ESC to close modals
  if (event.key === "Escape") {
    const openModals = document.querySelectorAll('.modal[style*="block"]')
    openModals.forEach((modal) => {
      modal.style.display = "none"
    })

    // Close event dropdowns
    document.querySelectorAll(".event-dropdown").forEach((d) => d.classList.remove("show"))
  }

  // Ctrl/Cmd + S to save (prevent default and show notification)
  if ((event.ctrlKey || event.metaKey) && event.key === "s") {
    event.preventDefault()
    showNotification("Settings saved successfully!", "success")
  }

  // Ctrl/Cmd + N to create new event
  if ((event.ctrlKey || event.metaKey) && event.key === "n" && currentSection === "events") {
    event.preventDefault()
    showCreateEventModal()
  }
}

// Real-time updates
function startRealTimeUpdates() {
  // Update dashboard metrics every 30 seconds
  setInterval(() => {
    if (currentSection === "dashboard") {
      updateDashboardMetrics()
    }
  }, 30000)

  // Simulate new submissions
  setInterval(() => {
    if (Math.random() > 0.98) {
      pendingSubmissions++
      updatePendingCount(0)
      showNotification("New submission received!", "success")
    }
  }, 60000)
}

// Modal functions
function closeModal() {
  document.getElementById("modal").style.display = "none"
}

// Utility functions
function formatNumber(num) {
  return num.toLocaleString()
}

function formatCurrency(amount) {
  return `${amount.toLocaleString()} CGT`
}

function formatDate(date) {
  return new Date(date).toLocaleDateString()
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString()
}

// Performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === "navigation") {
      console.log("Page load time:", entry.loadEventEnd - entry.loadEventStart, "ms")
    }
  }
})

if ("PerformanceObserver" in window) {
  performanceObserver.observe({ entryTypes: ["navigation"] })
}

// Service worker registration for offline functionality
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration)
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError)
      })
  })
}

// Initialize tooltips and accessibility features
document.addEventListener("DOMContentLoaded", () => {
  // Add ARIA labels for better accessibility
  const buttons = document.querySelectorAll("button")
  buttons.forEach((button) => {
    if (!button.getAttribute("aria-label") && button.title) {
      button.setAttribute("aria-label", button.title)
    }
  })

  // Add focus management for modals
  const modals = document.querySelectorAll(".modal")
  modals.forEach((modal) => {
    modal.addEventListener("keydown", (event) => {
      if (event.key === "Tab") {
        // Trap focus within modal
        const focusableElements = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    })
  })
})

// Handle window resize
window.addEventListener("resize", () => {
  const sidebar = document.getElementById("sidebar")
  if (window.innerWidth > 768) {
    sidebar.classList.remove("open")
  }
})

// Close dropdowns when clicking outside
document.addEventListener("click", (event) => {
  if (!event.target.closest(".event-menu")) {
    document.querySelectorAll(".event-dropdown").forEach((d) => d.classList.remove("show"))
  }
})
