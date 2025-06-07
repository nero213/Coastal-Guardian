// wallet.js
// This script handles Coinbase Wallet connection using the Coinbase Wallet SDK.

// --- Global Variable Declarations (Declared with 'let', assigned within window.onload) ---
let walletStatus;
let disconnectWalletButton;
let principalIdDiv; // Used to display ETH address for Coinbase Wallet
let connectCoinbaseWalletButton; // Reference to the Coinbase Wallet button

let coinbaseWallet; // Coinbase Wallet SDK instance

// --- Configuration Constants for Coinbase Wallet ---
// IMPORTANT: The Coinbase Wallet SDK (coinbase-wallet-sdk.js) is now assumed to be loaded
// from your local file (src/my_raw_frontend/coinbase-wallet-sdk.js) via a <script> tag
// in your HTML BEFORE this script runs, and NOT as a module.

const APP_NAME = "CoastalGuard"; // Your application name
const APP_LOGO_URL = "https://placehold.co/128x128/000/fff?text=AppLogo"; // URL to your application's logo
const COINBASE_WALLET_INSTALL_URL = 'https://www.coinbase.com/wallet'; // Official Coinbase Wallet installation URL

const INFURA_RPC_URL = "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID"; // IMPORTANT: Replace with your actual Infura Project ID
const CHAIN_ID = 1; // Chain ID for Ethereum Mainnet.

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


    // --- Step 2: Attach Event Listener for Coinbase Wallet Connection Button ---
    if (connectCoinbaseWalletButton) {
        connectCoinbaseWalletButton.addEventListener('click', async () => {
            if (walletStatus) walletStatus.innerText = "Connecting to Coinbase Wallet...";
            console.log("wallet.js: Coinbase Wallet connect button clicked.");

            try {
                let walletAddress = null;

                // --- PRIORITY 1: Check for Coinbase Wallet browser extension via window.ethereum ---
                console.log("wallet.js: Checking for window.ethereum...");
                console.log("wallet.js: window.ethereum object:", window.ethereum);
                console.log("wallet.js: window.ethereum.isCoinbaseWallet property:", window.ethereum ? window.ethereum.isCoinbaseWallet : 'N/A (window.ethereum not found)');

                if (window.ethereum && window.ethereum.isCoinbaseWallet) {
                    console.log("wallet.js: ✅ Coinbase Wallet extension detected via window.ethereum.");
                    try {
                        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                        walletAddress = accounts[0];
                        console.log("wallet.js: Accounts requested from extension. Address:", walletAddress);
                    } catch (extError) {
                        console.error("wallet.js: ❌ Error connecting to Coinbase Wallet extension:", extError);
                        if (walletStatus) walletStatus.innerText = '❌ Extension connection failed: ' + (extError.message || extError);
                        return; // Stop if extension connection fails.
                    }
                } else {
                    console.log("wallet.js: ℹ️ Coinbase Wallet extension NOT detected via window.ethereum. Falling back to WalletLink SDK.");

                    // --- PRIORITY 2: Fallback to Coinbase Wallet SDK (WalletLink/QR code) ---
                    // Since the SDK is now loaded locally, we assume CoinbaseWalletSDK is defined.
                    // If it's still undefined here, it means the local file didn't load.
                    if (typeof CoinbaseWalletSDK === 'undefined') {
                        console.error("wallet.js: CRITICAL: CoinbaseWalletSDK is still NOT defined. This indicates the local 'coinbase-wallet-sdk.js' failed to load. Check your 'index.html' script tag and file path.");
                        if (walletStatus) {
                            walletStatus.innerText = "❌ Coinbase Wallet SDK failed to load locally. Please check console.";
                        }
                        return;
                    }

                    console.log("wallet.js: ✅ CoinbaseWalletSDK is defined. Proceeding with SDK initialization.");

                    if (!coinbaseWallet) {
                        console.log("wallet.js: Initializing CoinbaseWalletSDK instance.");
                        coinbaseWallet = new CoinbaseWalletSDK({
                            appName: APP_NAME,
                            appLogoUrl: APP_LOGO_URL,
                            darkMode: false
                        });
                    }

                    const provider = coinbaseWallet.makeWeb3Provider(INFURA_RPC_URL, CHAIN_ID);
                    console.log("wallet.js: makeWeb3Provider called for SDK.");

                    const accounts = await provider.request({ method: 'eth_requestAccounts' });
                    walletAddress = accounts[0];
                    console.log("wallet.js: Accounts requested via SDK. Address:", walletAddress);
                }

                // --- Common UI Update after successful connection ---
                if (walletAddress) {
                    if (window.updateUI) {
                        console.log("wallet.js: Calling window.updateUI with ETH address.");
                        window.updateUI({
                            isAnonymous: () => false,
                            toString: () => `ETH: ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
                        });

                        if (principalIdDiv) principalIdDiv.innerText = `ETH Address: ${walletAddress}`;
                        if (walletStatus) walletStatus.innerText = `✅ Connected: ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`;
                        if (disconnectWalletButton) disconnectWalletButton.style.display = 'block';

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

                    console.log('wallet.js: Successfully connected with Coinbase Wallet (ETH address).');

                } else {
                    console.error("wallet.js: No wallet address obtained after connection attempt.");
                    if (walletStatus) walletStatus.innerText = '❌ Connection failed: No address obtained.';
                }

            } catch (error) {
                console.error('wallet.js: Coinbase Wallet connection error (top-level catch):', error);
                if (walletStatus) walletStatus.innerText = '❌ Connection failed: ' + (error.message || error);
            }
        });
    }

    // --- Step 3: Attach Event Listener for Disconnect Button (Handles Coinbase Wallet) ---
    if (disconnectWalletButton) {
        disconnectWalletButton.addEventListener("click", async () => {
            if (walletStatus) walletStatus.innerText = "Disconnecting...";
            console.log("wallet.js: Disconnect button clicked.");
            try {
                if (window.authClientInstance && await window.authClientInstance.isAuthenticated()) {
                    await window.authClientInstance.logout();
                    console.log("wallet.js: Logged out from Internet Identity.");
                }

                if (window.ic && window.ic.plug && await window.ic.plug.isConnected()) {
                    if (walletStatus) walletStatus.innerText = "Disconnected. For Plug, you might need to disconnect in your extension settings.";
                    console.log("wallet.js: Plug Wallet connection managed by extension. UI cleared.");
                }

                if (coinbaseWallet) {
                    console.log("wallet.js: Coinbase Wallet UI state cleared (SDK instance reset).");
                    coinbaseWallet = null;
                }

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
