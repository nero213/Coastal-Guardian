// src/my_raw_frontend/main.js
// This script handles Internet Identity and Plug Wallet connections.

// --- Environment Configuration ---
// Set to 'true' when building/deploying to the IC Mainnet, 'false' for local development.
// You MUST update the mainnet canister IDs below if you set this to true.
const IS_MAINNET = false; // <--- Toggle this flag!

// Import necessary DFINITY modules from CDN.
import { AuthClient } from "https://esm.sh/@dfinity/auth-client@latest";
import { Principal } from "https://esm.sh/@dfinity/principal@latest";

// --- Global Variable Declarations ---
// These variables will hold references to DOM elements and client instances.
// They are declared globally but assigned *inside* DOMContentLoaded.
// NOTE: For 'updateUI', elements will be re-fetched dynamically for robustness.
let connectPlugButton;
let connectIIButton;
let disconnectWalletButton;
let walletStatus;
let principalIdDiv;
let connectCoinbaseWalletButton;

let authClientInstance; // Internet Identity AuthClient instance

// Make authClientInstance globally accessible for other scripts (e.g., wallet.js).
// This is crucial for cross-script communication, especially for disconnect logic.
window.authClientInstance = authClientInstance;

// --- Configuration Constants ---
// Dashboard URL after successful login.
const DASHBOARD_URL = IS_MAINNET
    ? "pages/dashboard.html"
    : "pages/dashboard.html"; // Your local frontend canister ID

// Official Internet Identity provider URL.
const II_IDENTITY_PROVIDER = "https://identity.ic0.app"; // This is always mainnet

// Whitelist of canister IDs that Plug Wallet is allowed to interact with.
// IMPORTANT: Replace with your actual mainnet frontend and backend canister IDs when IS_MAINNET is true.
const PLUG_WHITELIST_CANISTER_ID = IS_MAINNET
    ? ["<YOUR_MAINNET_FRONTEND_CANISTER_ID>", "<YOUR_MAINNET_BACKEND_CANISTER_ID_IF_ANY>"] // Replace with your mainnet IDs
    : ["uqqxf-5h777-77774-qaaaa-cai", "uxrrr-q7777-77774-qaaaq-cai"]; // Your local frontend and backend canister IDs

// Host for Plug Wallet connection (local replica vs. mainnet).
const PLUG_HOST = IS_MAINNET
    ? "https://ic0.app"
    : "http://localhost:4943";

// --- Utility Functions ---

/**
 * Initializes the DFINITY AuthClient for Internet Identity.
 * Ensures the AuthClient is created only once.
 * @returns {AuthClient|null} The initialized AuthClient instance or null if an error occurs.
 */
async function initializeAuthClient() {
    if (!authClientInstance) { // Only create if not already initialized
        try {
            authClientInstance = await AuthClient.create({
                idleOptions: {
                    // For local development, disable idle for ease of use.
                    // For production (mainnet), set a reasonable timeout for security.
                    disableIdle: !IS_MAINNET, // If NOT mainnet, disable idle.
                    idleTimeout: IS_MAINNET ? 1000 * 60 * 60 * 24 : undefined, // 24 hours for mainnet
                    // and disableDefaultIdleCallback: true if handling logout manually.
                }
            });
            console.log("AuthClient initialized successfully.");
            // Update the global reference to the initialized instance.
            window.authClientInstance = authClientInstance;
        } catch (error) {
            console.error("Error initializing AuthClient:", error);
            // Safely update UI if walletStatus element is available.
            if (document.getElementById("walletStatus")) {
                document.getElementById("walletStatus").innerText = "❌ Error initializing Internet Identity client.";
            }
            return null; // Return null to indicate initialization failure.
        }
    }
    return authClientInstance;
}

/**
 * Updates the UI based on the provided Principal (or null for a disconnected state).
 * This function is made globally accessible (`window.updateUI`) so it can be called
 * by both main.js and wallet.js to ensure consistent UI synchronization.
 * It also handles automatic redirection to the dashboard upon successful authentication.
 * For robustness, it re-fetches DOM elements every time it's called.
 * @param {Principal|null} principal The Principal ID of the authenticated user, or null if disconnected.
 */
window.updateUI = async function (principal = null) {
    // Re-fetch DOM elements every time for maximum robustness against timing issues.
    const currentPrincipalIdDiv = document.getElementById("principalId");
    const currentWalletStatus = document.getElementById("walletStatus");
    const currentConnectPlugButton = document.getElementById("connectPlugButton");
    const currentConnectIIButton = document.getElementById("connectIIButton");
    const currentConnectCoinbaseWalletButton = document.getElementById("connectCoinbaseWallet");
    const currentDisconnectWalletButton = document.getElementById("disconnectWalletButton");

    // Treat an anonymous Principal as a disconnected state for UI purposes.
    if (principal && principal instanceof Principal && principal.isAnonymous()) {
        principal = null;
    }

    // Update the UI elements based on the authentication status.
    if (principal) {
        if (currentPrincipalIdDiv) currentPrincipalIdDiv.innerText = "🔑 Principal ID: " + principal.toString();
        if (currentWalletStatus) currentWalletStatus.innerText = "✅ Authenticated!";

        // Hide connection buttons and show the disconnect button.
        if (currentConnectPlugButton) currentConnectPlugButton.style.display = "none";
        if (currentConnectIIButton) currentConnectIIButton.style.display = "none";
        if (currentConnectCoinbaseWalletButton) currentConnectCoinbaseWalletButton.style.display = "none";
        if (currentDisconnectWalletButton) currentDisconnectWalletButton.style.display = "inline-block";

        // Redirect to the dashboard if not already there.
        // Adjust the redirection logic to use current origin for local dev, or the full mainnet URL.
        const currentPath = window.location.pathname + window.location.search;
        const targetPath = IS_MAINNET ? `pages/dashboard.html` : `/${DASHBOARD_URL}`;
        const fullTargetUrl = IS_MAINNET
            ? `https://${await window.ic.agent.getCanisterId() || 'invalid-canister-id'}.ic0.app${targetPath}` // This is a bit tricky, might need direct canister ID from a config if agent isn't available
            : `${window.location.origin}/${DASHBOARD_URL}`;

        // A more robust redirect could be to check if the current URL starts with the expected dashboard path
        // and only redirect if it doesn't, or if the current URL is the root.
        if (!currentPath.includes('pages/dashboard.html')) {
            console.log("Redirecting to dashboard:", fullTargetUrl);
            window.location.href = fullTargetUrl;
        }

    } else {
        // Reset the UI to show connection buttons and clear status.
        if (currentPrincipalIdDiv) currentPrincipalIdDiv.innerText = "";
        if (currentWalletStatus) currentWalletStatus.innerText = "Please connect a wallet or use Internet Identity.";

        // Show connection buttons and hide the disconnect button.
        if (currentConnectPlugButton) currentConnectPlugButton.style.display = "inline-block";
        if (currentConnectIIButton) currentConnectIIButton.style.display = "inline-block";
        if (currentConnectCoinbaseWalletButton) currentConnectCoinbaseWalletButton.style.display = "inline-block";
        if (currentDisconnectWalletButton) currentDisconnectWalletButton.style.display = "none";
    }
};


// --- Main Execution Block: DOMContentLoaded Event Listener ---
// All code that interacts with the DOM must be inside this listener
// to ensure the HTML elements are fully loaded and accessible.
document.addEventListener('DOMContentLoaded', async () => {
    // --- Step 1: Safely get references to all DOM elements ---
    // These assignments happen once after the DOM is fully loaded.
    connectPlugButton = document.getElementById("connectPlugButton");
    connectIIButton = document.getElementById("connectIIButton");
    disconnectWalletButton = document.getElementById("disconnectWalletButton");
    walletStatus = document.getElementById("walletStatus");
    principalIdDiv = document.getElementById("principalId");
    connectCoinbaseWalletButton = document.getElementById("connectCoinbaseWallet");


    // --- Step 2: Attach Event Listeners to Buttons ---
    // Ensure each button element exists before attaching an event listener.

    // Internet Identity Login Button
    if (connectIIButton) {
        connectIIButton.addEventListener("click", async () => {
            if (walletStatus) walletStatus.innerText = "Connecting to Internet Identity...";
            const client = await initializeAuthClient(); // Initialize AuthClient
            if (!client) return; // Exit if initialization failed

            try {
                await client.login({
                    identityProvider: II_IDENTITY_PROVIDER,
                    onSuccess: async () => {
                        const identity = client.getIdentity();
                        const principal = identity.getPrincipal();
                        await window.updateUI(principal); // Use the global updateUI function
                    },
                    onError: (err) => {
                        console.error("Internet Identity login error:", err);
                        if (walletStatus) walletStatus.innerText = "❌ Internet Identity login failed: " + err;
                    },
                    maxTimeToLive: BigInt(5 * 60 * 1000 * 1000 * 1000), // 5 minutes in nanoseconds (consider adjusting for prod)
                });
            } catch (err) {
                console.error("Internet Identity login exception:", err);
                if (walletStatus) walletStatus.innerText = "❌ Error during Internet Identity login: " + err.message;
            }
        });
    }

    // Plug Wallet Login Button
    if (connectPlugButton) {
        connectPlugButton.addEventListener("click", async () => {
            if (walletStatus) walletStatus.innerText = "Connecting to Plug Wallet...";
            if (window.ic && window.ic.plug) { // Check if Plug extension object exists
                try {
                    const isConnected = await window.ic.plug.isConnected();
                    if (!isConnected) {
                        const success = await window.ic.plug.requestConnect({
                            whitelist: PLUG_WHITELIST_CANISTER_ID,
                            host: PLUG_HOST
                        });
                        if (!success) {
                            if (walletStatus) walletStatus.innerText = "❌ Plug Wallet connection denied.";
                            return;
                        }
                    }
                    const principal = await window.ic.plug.getPrincipal(); // Get Plug's Principal
                    await window.updateUI(principal); // Use the global updateUI function
                } catch (err) {
                    console.error("Plug Wallet connection error:", err);
                    if (walletStatus) walletStatus.innerText = "❌ Error connecting to Plug Wallet: " + err.message;
                }
            } else {
                if (walletStatus) walletStatus.innerText = "🦊 Plug Wallet not found. Please install the extension.";
                console.warn("Plug Wallet not detected. Please install the Plug browser extension.");
            }
        });
    }

    // Disconnect Wallet Button
    // This listener is responsible for logging out from Internet Identity and clearing Plug state.
    // Coinbase Wallet disconnection is handled by wallet.js.
    if (disconnectWalletButton) {
        disconnectWalletButton.addEventListener("click", async () => {
            if (walletStatus) walletStatus.innerText = "Disconnecting...";
            try {
                // Handle Internet Identity logout
                if (window.authClientInstance && await window.authClientInstance.isAuthenticated()) {
                    await window.authClientInstance.logout();
                    console.log("Logged out from Internet Identity.");
                }

                // Handle Plug Wallet state cleanup (user usually disconnects via extension)
                if (window.ic && window.ic.plug && await window.ic.plug.isConnected()) {
                    if (walletStatus) walletStatus.innerText = "Disconnected. For Plug, you might need to disconnect in your extension settings.";
                    console.log("Plug Wallet connection managed by extension. UI cleared.");
                }

                // Call the global updateUI function to reset the entire interface.
                window.updateUI(null);
            } catch (err) {
                console.error("Logout error:", err);
                if (walletStatus) walletStatus.innerText = "❌ Error during logout: " + err.message;
            }
        });
    }


    // --- Step 3: Initial Check for Existing Wallet Connections on Page Load ---
    // This runs once the DOM is ready to determine the initial authentication status.

    // Initialize AuthClient first, as it's needed for Internet Identity checks.
    const client = await initializeAuthClient();
    if (!client) {
        window.updateUI(null); // Ensure UI is reset if AuthClient fails to initialize.
        return;
    }

    // Check for an existing Plug Wallet connection.
    if (window.ic && window.ic.plug) {
        const plugConnected = await window.ic.plug.isConnected();
        if (plugConnected) {
            console.log("Already connected with Plug Wallet.");
            try {
                const principal = await window.ic.plug.getPrincipal();
                await window.updateUI(principal); // Update UI and potentially redirect.
                return; // Exit as a connection was found and handled.
            } catch (error) {
                console.error("Error getting Plug principal on load:", error);
                // If Plug check fails, fall through to Internet Identity check.
            }
        }
    }

    // Check for an existing Internet Identity authentication.
    if (await client.isAuthenticated()) {
        const identity = client.getIdentity();
        const principal = identity.getPrincipal();
        if (!principal.isAnonymous()) { // Ensure it's not an anonymous identity.
            console.log("Already authenticated with Internet Identity.");
            await window.updateUI(principal); // Update UI and potentially redirect.
            return; // Exit as a connection was found and handled.
        }
    }

    // If no existing connection (Plug or Internet Identity) is found, reset the UI.
    window.updateUI(null);
});