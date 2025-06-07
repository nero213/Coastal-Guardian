// src/my_raw_frontend/main.js
import { AuthClient } from "@dfinity/auth-client";
// // REMOVE: import { Identity } from "@dfinity/agent"; // This line is causing the error

// // --- DOM Elements ---
const connectPlugButton = document.getElementById("connectPlugButton");
const connectIIButton = document.getElementById("connectIIButton");
const disconnectWalletButton = document.getElementById("disconnectWalletButton");
const walletStatus = document.getElementById("walletStatus");
const principalIdDiv = document.getElementById("principalId");

// --- Configuration ---
const DASHBOARD_URL = "http://u6s2n-gx777-77774-qaaba-cai.localhost:4943/pages/dashboard.html";
const II_IDENTITY_PROVIDER = "https://identity.ic0.app"; // Official Internet Identity provider
const PLUG_WHITELIST_CANISTER_ID = ["uqqxf-5h777-77774-qaaaa-cai"]; // Your canister ID - ENSURE THIS IS CORRECT
const PLUG_HOST = "http://localhost:4943"; // Your local IC replica host

// --- AuthClient instance (for Internet Identity) ---
let authClientInstance;

// --- Utility Functions ---

async function initializeAuthClient() {
    if (!authClientInstance) {
        try {
            authClientInstance = await AuthClient.create({
                idleOptions: {
                    disableIdle: true, // Keep the session alive indefinitely for dev
                }
            });
            console.log("AuthClient initialized successfully.");
        } catch (error) {
            console.error("Error initializing AuthClient:", error);
            walletStatus.innerText = "❌ Error initializing Internet Identity client.";
            return null;
        }
    }
    return authClientInstance;
}

// Function to update UI based on authentication status
// Now accepts a Principal object directly for Plug, or an Identity for II
async function updateUI(principal = null) {
    if (principal && principal.isAnonymous()) {
        principal = null; // Treat anonymous principal as not authenticated for UI purposes
    }

    if (principal) {
        principalIdDiv.innerText = "🔑 Principal ID: " + principal.toString();
        walletStatus.innerText = "✅ Authenticated!";

        connectPlugButton.style.display = "none";
        connectIIButton.style.display = "none";
        disconnectWalletButton.style.display = "inline-block";

        // Redirect to dashboard on successful login
        console.log("Redirecting to dashboard:", DASHBOARD_URL);
        window.location.href = DASHBOARD_URL;

    } else {
        principalIdDiv.innerText = "";
        walletStatus.innerText = "Please connect a wallet or use Internet Identity.";
        connectPlugButton.style.display = "inline-block";
        connectIIButton.style.display = "inline-block";
        disconnectWalletButton.style.display = "none";
    }
}

// --- Event Listeners ---

// Internet Identity Login
connectIIButton.addEventListener("click", async () => {
    walletStatus.innerText = "Connecting to Internet Identity...";
    const client = await initializeAuthClient();
    if (!client) return;

    try {
        await client.login({
            identityProvider: II_IDENTITY_PROVIDER,
            onSuccess: async () => {
                const identity = client.getIdentity();
                const principal = identity.getPrincipal(); // Get principal from the identity
                await updateUI(principal); // Pass the Principal object
            },
            onError: (err) => {
                console.error("Internet Identity login error:", err);
                walletStatus.innerText = "❌ Internet Identity login failed: " + err;
            }
        });
    } catch (err) {
        console.error("Internet Identity login exception:", err);
        walletStatus.innerText = "❌ Error during Internet Identity login: " + err.message;
    }
});

// Plug Wallet Login
connectPlugButton.addEventListener("click", async () => {
    walletStatus.innerText = "Connecting to Plug Wallet...";
    if (window.ic && window.ic.plug) {
        try {
            const isConnected = await window.ic.plug.isConnected();
            if (!isConnected) {
                const success = await window.ic.plug.requestConnect({
                    whitelist: PLUG_WHITELIST_CANISTER_ID,
                    host: PLUG_HOST
                });
                if (!success) {
                    walletStatus.innerText = "❌ Plug Wallet connection denied.";
                    return;
                }
            }

            const principal = await window.ic.plug.getPrincipal(); // Plug gives you the Principal directly
            await updateUI(principal); // Pass the Principal object

        } catch (err) {
            console.error("Plug Wallet connection error:", err);
            walletStatus.innerText = "❌ Error connecting to Plug Wallet: " + err.message;
        }
    } else {
        walletStatus.innerText = "🦊 Plug Wallet not found. Please install the extension.";
        console.warn("Plug Wallet not detected. Please install the Plug browser extension.");
    }
});


// Disconnect Wallet (for both II and Plug)
disconnectWalletButton.addEventListener("click", async () => {
    walletStatus.innerText = "Disconnecting...";
    try {
        if (authClientInstance && await authClientInstance.isAuthenticated()) {
            await authClientInstance.logout();
            console.log("Logged out from Internet Identity.");
        }

        if (window.ic && window.ic.plug && await window.ic.plug.isConnected()) {
            // For Plug, usually the user manages disconnect via the extension.
            // We can instruct them, or just reset our UI state.
            walletStatus.innerText = "Disconnected. For Plug, you might need to disconnect in your extension settings.";
            console.log("Plug Wallet connection managed by extension. UI cleared.");
        } else {
            walletStatus.innerText = "Disconnected.";
        }

        updateUI(null); // Pass null to reset UI

    } catch (err) {
        console.error("Logout error:", err);
        walletStatus.innerText = "❌ Error during logout: " + err.message;
    }
});


// --- Initial check on page load ---
document.addEventListener('DOMContentLoaded', async () => {
    // Check for Plug connection first, as it's simpler
    if (window.ic && window.ic.plug) {
        const plugConnected = await window.ic.plug.isConnected();
        if (plugConnected) {
            console.log("Already connected with Plug Wallet.");
            const principal = await window.ic.plug.getPrincipal();
            updateUI(principal); // Update UI and redirect
            return; // Exit as Plug was handled
        }
    }

    // Then check for Internet Identity
    const client = await initializeAuthClient();
    if (!client) {
        updateUI(null); // Ensure UI is reset if II client fails to init
        return;
    }

    if (await client.isAuthenticated()) {
        const identity = client.getIdentity();
        const principal = identity.getPrincipal(); // Get principal from the identity
        if (!principal.isAnonymous()) {
            console.log("Already authenticated with Internet Identity.");
            updateUI(principal); // Update UI and redirect
            return; // Exit as II was handled
        }
    }

    // If neither is connected, reset UI to show connect buttons
    updateUI(null);
});

// Coinbase Wallet Integration
// Coinbase Wallet Integration with Redirection
