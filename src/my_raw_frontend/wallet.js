// wallet.js
// This script handles all Web3 wallet connections using Web3-Onboard

// --- Environment Configuration ---
// Set to 'true' when building/deploying to the IC Mainnet, 'false' for local development.
// You MUST update YOUR_INFURA_PROJECT_ID if you set this to true.
const IS_MAINNET = false; // <--- Toggle this flag!

// --- Global Variable Declarations ---
let walletStatus;
let disconnectWalletButton;
let principalIdDiv;
let connectWeb3WalletButton; // Single connect button

let web3OnboardInstance;

// --- Configuration Constants ---
const APP_NAME = "CoastalGuard";
const APP_LOGO_URL = "https://placehold.co/128x128/000/fff?text=AppLogo";

// Conditional Infura RPC URL based on IS_MAINNET
const INFURA_RPC_URL = IS_MAINNET
    ? "https://mainnet.infura.io/v3/650f79a5627a4961b746ad0d5233c5c8" // Your Mainnet Infura Project ID - REMEMBER TO REPLACE!
    : "http://127.0.0.1:8545"; // Example: Local Hardhat/Ganache RPC endpoint (adjust if needed)

// Conditional CHAIN_ID based on IS_MAINNET
// '0x1' for Ethereum Mainnet, '0x539' (1337) for Hardhat local (common default)
const CHAIN_ID = IS_MAINNET ? '0x1' : '0x539';

// --- Helper Functions ---
async function connectWallet() {
    if (walletStatus) walletStatus.innerText = "Connecting to wallet...";
    console.log("wallet.js: Connect Wallet button clicked");

    try {
        // Check if Web3-Onboard and all required wallet modules are loaded
        if (typeof window.initWeb3Onboard === 'undefined' ||
            typeof window.coinbaseWalletModuleWeb3Onboard === 'undefined' ||
            typeof window.okxWalletModuleWeb3Onboard === 'undefined' ||
            typeof window.metamaskWalletModuleWeb3Onboard === 'undefined' // <-- Added MetaMask module check
            ) {
            console.error("wallet.js: Web3-Onboard or one of its wallet modules not loaded in HTML.");
            if (walletStatus) walletStatus.innerText = "❌ Wallet connection library not fully loaded. Check HTML script tags.";
            return;
        }

        // Initialize Web3-Onboard instance once
        if (!web3OnboardInstance) {
            console.log("wallet.js: Initializing Web3-Onboard instance");
            web3OnboardInstance = window.initWeb3Onboard({
                wallets: [
                    window.coinbaseWalletModuleWeb3Onboard(),
                    window.okxWalletModuleWeb3Onboard(),
                    window.metamaskWalletModuleWeb3Onboard() // <-- Added MetaMask/Injected Wallets module
                ],
                chains: [
                    {
                        id: CHAIN_ID,
                        token: 'ETH',
                        label: IS_MAINNET ? 'Ethereum Mainnet' : 'Local EVM Network', // Dynamic label
                        rpcUrl: INFURA_RPC_URL
                    }
                ],
                appMetadata: {
                    name: APP_NAME,
                    icon: APP_LOGO_URL,
                    description: 'CoastalGuard DApp',
                    recommendedInjectedWallets: [
                        { name: 'Coinbase Wallet', url: 'https://www.coinbase.com/wallet' },
                        { name: 'OKX Wallet', url: 'https://www.okx.com/web3' },
                        { name: 'MetaMask', url: 'https://metamask.io' } // <-- Added MetaMask recommendation
                    ]
                },
                connect: {
                    autoConnectLastWallet: true,
                    showSidebar: true // Shows wallet selection modal
                }
            });
        }

        // Connect to wallet (will show selection modal)
        const wallets = await web3OnboardInstance.connectWallet();

        if (wallets?.length > 0) {
            const { label, accounts } = wallets[0];
            const walletAddress = accounts[0].address;
            console.log(`wallet.js: Connected to ${label}. Address:`, walletAddress);
            updateWalletUI(walletAddress, label);
        } else {
            console.error("wallet.js: No wallet selected or connection cancelled.");
            if (walletStatus) walletStatus.innerText = '❌ No wallet selected or connection cancelled.';
        }
    } catch (error) {
        console.error('wallet.js: Connection error:', error);
        if (walletStatus) walletStatus.innerText = '❌ Connection failed: ' + (error.message || error);
    }
}

function updateWalletUI(walletAddress, walletLabel) {
    const shortAddress = `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`;

    // Call the global updateUI from main.js to manage overall UI state
    // We pass a 'Principal-like' object for consistency, though it's an EVM address.
    if (window.updateUI) {
        window.updateUI({
            isAnonymous: () => false, // This EVM address is not anonymous from an ETH perspective
            toString: () => `ETH: ${shortAddress}` // Format for display
        });
    }

    if (principalIdDiv) principalIdDiv.innerText = `ETH Address: ${walletAddress}`;
    if (walletStatus) walletStatus.innerText = `✅ Connected (${walletLabel}): ${shortAddress}`;
    if (disconnectWalletButton) disconnectWalletButton.style.display = 'inline-block'; // Changed to inline-block

    // Hide connect buttons when a Web3 wallet is connected
    if (connectWeb3WalletButton) connectWeb3WalletButton.style.display = 'none';
    const connectIIButton = document.getElementById("connectIIButton");
    if (connectIIButton) connectIIButton.style.display = 'none';
    const connectPlugButton = document.getElementById("connectPlugButton"); // Ensure Plug button is also hidden
    if (connectPlugButton) connectPlugButton.style.display = 'none';
}

// --- Main Execution Block ---
window.onload = () => {
    console.log("wallet.js: window.onload fired");

    // Get DOM elements
    walletStatus = document.getElementById("walletStatus");
    principalIdDiv = document.getElementById("principalId");
    disconnectWalletButton = document.getElementById("disconnectWalletButton");
    connectWeb3WalletButton = document.getElementById("connectWeb3Wallet");

    // Attach event listeners
    if (connectWeb3WalletButton) {
        connectWeb3WalletButton.addEventListener('click', connectWallet);
    }

    // Disconnect logic
    if (disconnectWalletButton) {
        disconnectWalletButton.addEventListener("click", async () => {
            if (walletStatus) walletStatus.innerText = "Disconnecting...";

            try {
                // Disconnect all connected Web3-Onboard wallets
                if (web3OnboardInstance) {
                    const connectedWallets = web3OnboardInstance.state.get().wallets;
                    for (const wallet of connectedWallets) {
                        await web3OnboardInstance.disconnectWallet({ label: wallet.label });
                        console.log(`Disconnected Web3 wallet: ${wallet.label}`);
                    }
                }

                // Call the global updateUI function from main.js to reset the entire interface.
                // Passing null indicates a disconnected state.
                window.updateUI(null);

                // Additional UI reset for Web3 specific elements if main.js doesn't fully handle them
                // These might be redundant if window.updateUI(null) comprehensively resets all relevant elements.
                if (principalIdDiv) principalIdDiv.innerText = '';
                if (walletStatus) walletStatus.innerText = "Disconnected.";
                if (disconnectWalletButton) disconnectWalletButton.style.display = 'none';

                // Ensure connect buttons are shown again after full disconnect
                if (connectWeb3WalletButton) connectWeb3WalletButton.style.display = 'inline-block';
                const connectIIButton = document.getElementById("connectIIButton");
                if (connectIIButton) connectIIButton.style.display = 'inline-block';
                const connectPlugButton = document.getElementById("connectPlugButton");
                if (connectPlugButton) connectPlugButton.style.display = 'inline-block';

            } catch (err) {
                console.error("wallet.js: Logout error:", err);
                if (walletStatus) walletStatus.innerText = "❌ Error during logout: " + err.message;
            }
        });
    }

    // Initial check for existing Web3-Onboard connection on page load
    async function checkWeb3WalletConnectionOnLoad() {
        if (typeof window.initWeb3Onboard === 'undefined' ||
            typeof window.coinbaseWalletModuleWeb3Onboard === 'undefined' ||
            typeof window.okxWalletModuleWeb3Onboard === 'undefined' ||
            typeof window.metamaskWalletModuleWeb3Onboard === 'undefined'
        ) {
            console.warn("wallet.js: Web3-Onboard modules not yet loaded for initial check. Skipping auto-connect attempt.");
            return;
        }

        // Initialize Web3-Onboard if not already. This is crucial for auto-connect to work.
        // We set showSidebar: false here to prevent the modal from popping up on initial load.
        if (!web3OnboardInstance) {
            web3OnboardInstance = window.initWeb3Onboard({
                wallets: [
                    window.coinbaseWalletModuleWeb3Onboard(),
                    window.okxWalletModuleWeb3Onboard(),
                    window.metamaskWalletModuleWeb3Onboard()
                ],
                chains: [
                    {
                        id: CHAIN_ID,
                        token: 'ETH',
                        label: IS_MAINNET ? 'Ethereum Mainnet' : 'Local EVM Network',
                        rpcUrl: INFURA_RPC_URL
                    }
                ],
                appMetadata: {
                    name: APP_NAME,
                    icon: APP_LOGO_URL,
                    description: 'CoastalGuard DApp',
                    recommendedInjectedWallets: [
                        { name: 'Coinbase Wallet', url: 'https://www.coinbase.com/wallet' },
                        { name: 'OKX Wallet', url: 'https://www.okx.com/web3' },
                        { name: 'MetaMask', url: 'https://metamask.io' }
                    ]
                },
                connect: {
                    autoConnectLastWallet: true,
                    showSidebar: false // Do NOT show wallet selection modal on auto-connect
                }
            });
        }

        // Subscribe to wallet state changes for auto-reconnects and UI updates
        web3OnboardInstance.state.select('wallets').subscribe(wallets => {
            if (wallets.length > 0) {
                const { label, accounts } = wallets[0];
                const walletAddress = accounts[0].address;
                console.log(`wallet.js: Auto-connected/State change detected: ${label}. Address:`, walletAddress);
                updateWalletUI(walletAddress, label);
            } else {
                console.log("wallet.js: Web3 wallet disconnected via state change.");
                // Ensure UI is reset if no Web3 wallet is connected and no other wallet type is active
                // This might cause conflicts if main.js also handles initial state, so be careful.
                // It's generally better to let updateUI(null) handle the full reset.
                // window.updateUI(null); // Uncomment if needed, but test for double-reset issues.
            }
        });

        // Trigger an initial connection attempt.
        // If autoConnectLastWallet is true, it will try to reconnect the last used wallet.
        // We don't necessarily need to await it or capture its return value here,
        // as the subscription above will handle the UI update if a connection is established.
        web3OnboardInstance.connectWallet();
    }

    // Call the initial check for Web3 wallets.
    checkWeb3WalletConnectionOnLoad();
};