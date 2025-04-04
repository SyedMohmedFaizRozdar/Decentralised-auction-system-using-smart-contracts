# Decentralized Auction DApp

This project is a decentralized auction platform built on the Ethereum blockchain. It allows an admin to create auctions, users to bid on items using Ether, and displays winners on a dashboard—all without a central server. It uses smart contracts for trustless operation and a simple web interface for interaction.

## Features
- **Admin Panel**: Create and end auctions (restricted to the admin).
- **Auction List**: View active auctions and place bids.
- **Dashboard**: See auctions you’ve won.
- **Real-Time Updates**: Live countdown timers and bid updates via blockchain events.

## Technologies Used
- **Solidity**: Smart contract language for `Auction.sol`.
- **Ethereum**: Blockchain for decentralized execution (simulated locally with Ganache).
- **Truffle**: Framework for compiling and deploying the smart contract.
- **Ethers.js**: JavaScript library to interact with the blockchain from the front-end.
- **HTML/CSS/JavaScript**: Basic front-end interface.
- **Python**: Serves the front-end files.

## Prerequisites
Before running the project, ensure you have:
- **Node.js** and **npm**: For Ganache and Truffle (install from [nodejs.org](https://nodejs.org/)).
- **Ganache CLI**: A local Ethereum blockchain simulator (install globally, see below).
- **Truffle**: A development framework for Ethereum smart contracts (install globally, see below).
- **Python**: For the HTTP server (version 3.x, available at [python.org](https://www.python.org/)).
- **Git**: To clone the repository (optional, from [git-scm.com](https://git-scm.com/)).
- A terminal (PowerShell, CMD, or Git Bash on Windows; any terminal on Linux/Mac).

## Setup Instructions

### 1. Install Global Tools
Install `ganache-cli` and `truffle` globally so they’re available from any terminal:
```bash
npm install -g ganache-cli
npm install -g truffle
```
- **Verify Installation**:
  - Check `ganache-cli --version` and `truffle version` in your terminal. You should see version numbers (e.g., Ganache CLI v6.12.2, Truffle v5.x.x).

### 2. Clone the Repository
If you haven’t already, download or clone this project:
```bash
git clone https://github.com/SyedMohmedFaizRozdar/Decentralised-auction-system-using-smart-contracts.git
cd Decentralised-auction-system-using-smart-contracts
```

### 3. Install Project Dependencies
Run this command in the project root to install local Node.js packages:
```bash
npm install
```

### 4. Start the Local Blockchain
Ganache simulates an Ethereum blockchain locally. Open a terminal and run:
```bash
ganache-cli -p 7545 -l 10000000
```
- `-p 7545`: Runs Ganache on port 7545.
- `-l 10000000`: Sets the block gas limit to 10 million (needed for creating auctions).
- **Note**: Keep this terminal running. You’ll see 10 accounts with 100 ETH each—copy one for testing later.

### 5. Deploy the Smart Contract
In a new terminal, from the project root, deploy the `Auction.sol` contract to Ganache:
```bash
npm run migrate
```
- This compiles and deploys the contract.
- Look for the contract address in the output (e.g., `0xNewAddressHere`). You’ll need it next.

### 6. Update the Front-End
The front-end needs the deployed contract address:
1. Open `frontend/script.js` in a text editor.
2. Find this line near the top:
   ```javascript
   const contractAddress = "0xYourNewDeployedAddress";
   ```
3. Replace `"0xYourNewDeployedAddress"` with the address from Step 5 (e.g., `0xNewAddressHere`).
4. Save the file.

#### Removing a Pre-Existing `build` Folder
If a `build` folder already exists in `frontend/` (e.g., from a previous setup), remove it to avoid conflicts. Use the command for your terminal:

- **PowerShell**:
  ```powershell
  Remove-Item -Path .\frontend\build -Recurse -Force
  ```
- **CMD**:
  ```cmd
  rmdir /s /q .\frontend\build
  ```
- **Git Bash**:
  ```bash
  rm -rf ./frontend/build
  ```
- **Note**: If the folder doesn’t exist, these commands will fail harmlessly—just proceed.

After removing it, redeploy the contract (Step 5) to regenerate the correct `build/contracts/Auction.json`.

### 7. Run the Server
Serve the front-end files with Python’s HTTP server. In a new terminal, from the project root:
```bash
python -m http.server 8080 --directory frontend/
```
- This starts a server at `http://localhost:8080`, redirecting to `dashboard.html`.

### 8. Access the DApp
- Open a browser and go to `http://localhost:8080`.
- **Dashboard**: Enter a Ganache account address (from Step 4) and click “Connect Wallet” to see won auctions.
- **Auctions**: Visit `http://localhost:8080/auctions.html` to bid.
- **Admin**: Go to `http://localhost:8080/admin.html`, connect with the first Ganache account (admin), and create/end auctions.

## How to Use
1. **Admin**:
   - On `admin.html`, connect with the first Ganache account (e.g., `0xe30305EDf644d8Fbd0F988D86C304bBeC833Ab9b`).
   - Fill in auction details (e.g., Item Name: “Test”, Image URL: “http://test.com”, Duration: 60 seconds, Starting Bid: 0.1 ETH) and click “Create Auction”.
2. **Users**:
   - On `auctions.html`, connect with any other Ganache account, find an auction, and bid with Ether.
3. **Dashboard**:
   - On `dashboard.html`, connect to see auctions you’ve won.

## Troubleshooting
- **“Exceeds block gas limit”**: Ensure Ganache uses `-l 10000000`. Restart Ganache and redeploy if needed.
- **“Call revert exception”**: Check that `contractAddress` in `script.js` matches the latest deployment. Redeploy and update if it doesn’t.
- **Server not updating**: Restart the Python server after changing `script.js`:
  ```bash
  python -m http.server 8080 --directory frontend/
  ```
- **Still stuck?**: Check terminal logs (Ganache, server) and browser console (F12) for errors.

## Notes
- This project was built priorly, so a `build` folder might exist in `frontend/`. Remove it as shown above if you suspect it’s outdated.
- Ganache resets its state on restart—redeploy and update `script.js` each time you restart it.

## License
This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.