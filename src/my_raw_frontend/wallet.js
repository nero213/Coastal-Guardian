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
    ? "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID" // Your Mainnet Infura Project ID
    : "http://127.0.0.1:8545"; // Example: Local Hardhat/Ganache RPC endpoint (adjust if needed)

// Conditional CHAIN_ID based on IS_MAINNET
const CHAIN_ID = IS_MAINNET ? '0x1' : '0x539'; // '0x1' for Ethereum Mainnet, '0x539' (1337) for Hardhat local

// --- Helper Functions ---
async function connectWallet() {
    if (walletStatus) walletStatus.innerText = "Connecting to wallet...";
    console.log("wallet.js: Connect Wallet button clicked");

    try {
        // Check if Web3-Onboard is initialized
        if (typeof window.initWeb3Onboard === 'undefined' ||
            typeof window.coinbaseWalletModuleWeb3Onboard === 'undefined' ||
            typeof window.okxWalletModuleWeb3Onboard === 'undefined') {
            console.error("wallet.js: Wallet modules not loaded");
            if (walletStatus) walletStatus.innerText = "❌ Wallet connection library not loaded";
            return;
        }

        // Initialize Web3-Onboard instance once
        if (!web3OnboardInstance) {
            console.log("wallet.js: Initializing Web3-Onboard instance");
            web3OnboardInstance = window.initWeb3Onboard({
                wallets: [
                    window.coinbaseWalletModuleWeb3Onboard(),
                    window.okxWalletModuleWeb3Onboard()
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
                        { name: 'OKX Wallet', url: 'https://www.okx.com/web3' }
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
            console.error("wallet.js: No wallet selected");
            if (walletStatus) walletStatus.innerText = '❌ No wallet selected';
        }
    } catch (error) {
        console.error('wallet.js: Connection error:', error);
        if (walletStatus) walletStatus.innerText = '❌ Connection failed: ' + (error.message || error);
    }
}

function updateWalletUI(walletAddress, walletLabel) {
    const shortAddress = `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`;

    if (window.updateUI) {
        window.updateUI({
            isAnonymous: () => false,
            toString: () => `ETH: ${shortAddress}`
        });
    }

    if (principalIdDiv) principalIdDiv.innerText = `ETH Address: ${walletAddress}`;
    if (walletStatus) walletStatus.innerText = `✅ Connected (${walletLabel}): ${shortAddress}`;
    if (disconnectWalletButton) disconnectWalletButton.style.display = 'block';

    // Hide connect buttons
    if (connectWeb3WalletButton) connectWeb3WalletButton.style.display = 'none';
    const connectIIButton = document.getElementById("connectIIButton");
    if (connectIIButton) connectIIButton.style.display = 'none';
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

    // Disconnect logic (unchanged)
    if (disconnectWalletButton) {
        disconnectWalletButton.addEventListener("click", async () => {
            if (walletStatus) walletStatus.innerText = "Disconnecting...";

            try {
                // If using Web3-Onboard, you might need to disconnect the active wallet here.
                // Example: const connectedWallets = web3OnboardInstance.state.get().wallets;
                // if (connectedWallets.length > 0) {
                //     await web3OnboardInstance.disconnectWallet({ label: connectedWallets[0].label });
                //     console.log(`Disconnected Web3 wallet: ${connectedWallets[0].label}`);
                // }

                // Show connect buttons again
                if (connectWeb3WalletButton) connectWeb3WalletButton.style.display = 'block';
                const connectIIButton = document.getElementById("connectIIButton");
                if (connectIIButton) connectIIButton.style.display = 'block';

                // Clear UI specific to Web3 wallet
                if (principalIdDiv) principalIdDiv.innerText = '';
                if (walletStatus) walletStatus.innerText = "Disconnected from Web3 wallet.";
                if (disconnectWalletButton) disconnectWalletButton.style.display = 'none'; // Hide disconnect button

            } catch (err) {
                console.error("wallet.js: Logout error:", err);
                if (walletStatus) walletStatus.innerText = "❌ Error during logout: " + err.message;
            }
        });
    }
};