// wallet.js
// This script handles Coinbase Wallet connection using Web3-Onboard,
// and maintains existing Internet Identity and Plug Wallet logic.

// --- Global Variable Declarations (Declared with 'let', assigned within window.onload) ---
let walletStatus;
let disconnectWalletButton;
let principalIdDiv; // Used to display wallet address
let connectCoinbaseWalletButton; // Reference to the Coinbase Wallet button

let web3OnboardInstance; // Web3-Onboard instance

// --- Configuration Constants ---
const APP_NAME = "CoastalGuard";
const APP_LOGO_URL = "https://placehold.co/128x128/000/fff?text=AppLogo"; // Generic app logo
const INFURA_RPC_URL = "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID"; // IMPORTANT: Replace with your actual Infura Project ID
const CHAIN_ID = '0x1'; // Ethereum Mainnet Chain ID in hex string format for Web3-Onboard

// --- Main Execution Block: window.onload Event Listener ---
window.onload = () => {
    console.log("wallet.js: window.onload fired. Attempting to get DOM elements.");

    // --- Step 1: Safely get references to all DOM elements ---
    walletStatus = document.getElementById("walletStatus");
    principalIdDiv = document.getElementById("principalId");
    disconnectWalletButton = document.getElementById("disconnectWalletButton");
    connectCoinbaseWalletButton = document.getElementById("connectCoinbaseWallet");

    console.log("wallet.js: walletStatus element:", walletStatus ? 'found' : 'NOT found');
    console.log("wallet.js: connectCoinbaseWalletButton element:", connectCoinbaseWalletButton ? 'found' : 'NOT found');

    // --- Step 2: Initialize Web3-Onboard (if not already) and Attach Event Listeners ---
    if (connectCoinbaseWalletButton) {
        connectCoinbaseWalletButton.addEventListener('click', async () => {
            if (walletStatus) walletStatus.innerText = "Connecting to Coinbase Wallet...";
            console.log("wallet.js: Coinbase Wallet connect button clicked.");

            try {
                // Check if Web3-Onboard is initialized. It's exposed globally from index.html.
                if (typeof window.initWeb3Onboard === 'undefined' || typeof window.coinbaseWalletModuleWeb3Onboard === 'undefined') {
                    console.error("wallet.js: CRITICAL: Web3-Onboard or its Coinbase module is NOT defined. Check your 'index.html' script tags. This should not happen if index.html is correctly loaded.");
                    if (walletStatus) {
                        walletStatus.innerText = "❌ Wallet connection library not loaded. Please check console.";
                    }
                    return;
                }

                // Initialize Web3-Onboard instance once.
                if (!web3OnboardInstance) {
                    console.log("wallet.js: Initializing Web3-Onboard instance.");
                    web3OnboardInstance = window.initWeb3Onboard({
                        wallets: [
                            window.coinbaseWalletModuleWeb3Onboard() // Add Coinbase Wallet module
                        ],
                        chains: [
                            {
                                id: CHAIN_ID, // '0x1' for Ethereum Mainnet
                                token: 'ETH',
                                label: 'Ethereum Mainnet',
                                rpcUrl: INFURA_RPC_URL
                            }
                        ],
                        appMetadata: {
                            name: APP_NAME,
                            icon: APP_LOGO_URL,
                            description: 'CoastalGuard DApp',
                            recommendedInjectedWallets: [
                                { name: 'Coinbase Wallet', url: 'https://www.coinbase.com/wallet' } // Correct URL for recommendation
                            ]
                        },
                        connect: {
                            autoConnectLastWallet: true // Optionally auto-connect last used wallet
                        }
                    });
                }

                // Connect to a wallet using Web3-Onboard
                console.log("wallet.js: Calling web3OnboardInstance.connectWallet().");
                const wallets = await web3OnboardInstance.connectWallet();

                if (wallets && wallets.length > 0) {
                    const connectedWallet = wallets[0]; // Get the first connected wallet
                    const walletAddress = connectedWallet.accounts[0].address;
                    console.log("wallet.js: Wallet connected via Web3-Onboard. Address:", walletAddress);

                    // --- Common UI Update after successful connection ---
                    if (window.updateUI) {
                        console.log("wallet.js: Calling window.updateUI with ETH address from Web3-Onboard.");
                        window.updateUI({
                            isAnonymous: () => false,
                            toString: () => `ETH: ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
                        });

                        if (principalIdDiv) principalIdDiv.innerText = `ETH Address: ${walletAddress}`;
                        if (walletStatus) walletStatus.innerText = `✅ Connected: ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`;
                        if (disconnectWalletButton) disconnectWalletButton.style.display = 'block';

                        // Hide other connect buttons
                        const connectPlugButton = document.getElementById("connectPlugButton");
                        const connectIIButton = document.getElementById("connectIIButton");
                        if (connectPlugButton) connectPlugButton.style.display = "none";
                        if (connectIIButton) connectIIButton.style.display = "none";

                    } else {
                        console.warn("wallet.js: window.updateUI is not defined. Falling back to direct DOM updates.");
                        if (walletStatus) walletStatus.innerText = `✅ Connected: ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`;
                        if (principalIdDiv) principalIdDiv.innerText = `ETH Address: ${walletAddress}`;
                        if (disconnectWalletButton) disconnectWalletButton.style.display = 'block';
                    }

                    console.log('wallet.js: Successfully connected with Web3-Onboard (ETH address).');

                } else {
                    console.error("wallet.js: No wallet obtained after Web3-Onboard connection attempt.");
                    if (walletStatus) walletStatus.innerText = '❌ Connection failed: No wallet selected or connected.';
                }

            } catch (error) {
                console.error('wallet.js: Web3-Onboard connection error (top-level catch):', error);
                if (walletStatus) walletStatus.innerText = '❌ Connection failed: ' + (error.message || error);
            }
        });
    }

    // --- Step 3: Attach Event Listener for Disconnect Button (Handles all wallets) ---
    if (disconnectWalletButton) {
        disconnectWalletButton.addEventListener("click", async () => {
            if (walletStatus) walletStatus.innerText = "Disconnecting...";
            console.log("wallet.js: Disconnect button clicked.");
            try {
                // Disconnect from Internet Identity
                if (window.authClientInstance && await window.authClientInstance.isAuthenticated()) {
                    await window.authClientInstance.logout();
                    console.log("wallet.js: Logged out from Internet Identity.");
                }

                // Disconnect from Plug Wallet
                if (window.ic && window.ic.plug && await window.ic.plug.isConnected()) {
                    // Plug's disconnect is typically managed by its extension, but clear local state.
                    if (walletStatus) walletStatus.innerText = "Disconnected. For Plug, you might need to disconnect in your extension settings.";
                    console.log("wallet.js: Plug Wallet connection managed by extension. UI cleared.");
                }

                // Disconnect from Web3-Onboard connected wallets
                if (web3OnboardInstance) {
                    const connectedWallets = web3OnboardInstance.state.get().wallets;
                    if (connectedWallets.length > 0) {
                        for (const wallet of connectedWallets) {
                            await web3OnboardInstance.disconnectWallet({ label: wallet.label });
                            console.log(`wallet.js: Disconnected from ${wallet.label}.`);
                        }
                    }
                    console.log("wallet.js: Web3-Onboard wallets disconnected.");
                }

                // Call the global updateUI function (defined in main.js) to reset the entire interface.
                if (window.updateUI) {
                    console.log("wallet.js: Calling window.updateUI(null) for global reset.");
                    window.updateUI(null);
                } else {
                    console.warn("wallet.js: window.updateUI is not defined. UI may not fully reset.");
                }

            } catch (err) {
                console.error("wallet.js: Logout error:", err);
                if (walletStatus) walletStatus.innerText = "❌ Error during logout: " + err.message;
            }
        });
    }

    console.log("wallet.js: Finished window.onload execution.");
};
