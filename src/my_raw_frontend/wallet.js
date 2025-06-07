
document.getElementById('connectCoinbaseWallet').addEventListener('click', async () => {
    try {
        walletStatus.innerText = "Connecting to Coinbase Wallet...";

        // Check if Coinbase Wallet is installed
        if (window.ethereum && window.ethereum.isCoinbaseWallet) {
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            const walletAddress = accounts[0];
            walletStatus.innerText = `✅ Connected: ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`;

            // Show disconnect button
            disconnectWalletButton.style.display = 'block';

            console.log('Connected with Coinbase Wallet:', walletAddress);

            // Redirect to dashboard after successful connection
            const DASHBOARD_URL = "http://u6s2n-gx777-77774-qaaba-cai.localhost:4943/pages/dashboard.html"
            console.log("Redirecting to dashboard:", DASHBOARD_URL);
            window.location.href = DASHBOARD_URL;

        } else {
            // If Coinbase Wallet isn't installed, prompt user to install it
            const shouldInstall = confirm('Coinbase Wallet not detected. Would you like to install it?');
            if (shouldInstall) {
                window.open('https://www.coinbase.com/wallet', '_blank');
            }
            walletStatus.innerText = "Coinbase Wallet not detected";
        }
    } catch (error) {
        console.error('Coinbase Wallet connection error:', error);
        walletStatus.innerText = '❌ Connection failed: ' + (error.message || error);
    }
});

// Update the disconnect handler to handle Coinbase Wallet
disconnectWalletButton.addEventListener("click", async () => {
    walletStatus.innerText = "Disconnecting...";
    try {
        // Handle Internet Identity logout
        if (authClientInstance && await authClientInstance.isAuthenticated()) {
            await authClientInstance.logout();
            console.log("Logged out from Internet Identity.");
        }

        // Handle Plug Wallet (managed by extension)
        if (window.ic && window.ic.plug && await window.ic.plug.isConnected()) {
            walletStatus.innerText = "Disconnected. For Plug, you might need to disconnect in your extension settings.";
            console.log("Plug Wallet connection managed by extension. UI cleared.");
        }

        // Handle Coinbase Wallet (soft disconnect)
        if (window.ethereum && window.ethereum.isCoinbaseWallet) {
            walletStatus.innerText = "Disconnected from Coinbase Wallet.";
            console.log("Coinbase Wallet UI state cleared.");
        }

        updateUI(null); // Reset UI

    } catch (err) {
        console.error("Logout error:", err);
        walletStatus.innerText = "❌ Error during logout: " + err.message;
    }
});
// Initialize WalletLink
const walletLink = new WalletLink({
    appName: "CoastalGuard",
    appLogoUrl: "https://your-app-logo.png"
});

// Coinbase Wallet integration with WalletLink
document.getElementById('connectCoinbaseWallet').addEventListener('click', async () => {
    try {
        const eth = walletLink.makeWeb3Provider(
            "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID",
            1
        );

        const accounts = await eth.enable();
        const walletAddress = accounts[0];

        document.getElementById('walletStatus').textContent = `Connected: ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`;
        document.getElementById('disconnectWalletButton').style.display = 'block';

        console.log('Connected with Coinbase Wallet:', walletAddress);
    } catch (error) {
        console.error('Coinbase Wallet connection error:', error);
        document.getElementById('walletStatus').textContent = 'Connection failed. Please try again.';
    }
});