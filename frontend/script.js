const provider = new ethers.providers.JsonRpcProvider("http://localhost:7545");
let signer;
let contract;
let userAddress;

const contractAddress = "0xb96CDC6f427739ad422BD2c5730dE652F6C0F9B4";

async function loadContractData() {
    try {
        const response = await fetch("./build/contracts/Auction.json");
        console.log("Fetch response status:", response.status);
        if (!response.ok) {
            throw new Error(`Failed to fetch Auction.json: ${response.status}`);
        }
        const contractData = await response.json();
        console.log("Fetched contractData ABI includes admin:", contractData.abi.some(item => item.name === "admin"));
        return { abi: contractData.abi, address: contractAddress };
    } catch (error) {
        console.error("ABI fetch failed:", error);
        throw error;
    }
}

// async function connectWallet() {
//     try {
//         if (window.location.pathname.includes("admin.html")) {
//             signer = provider.getSigner(0);
//             userAddress = await signer.getAddress();
//         } else {
//             const walletAddress = document.getElementById("walletAddressInput").value;
//             if (!ethers.utils.isAddress(walletAddress)) {
//                 throw new Error("Invalid wallet address");
//             }
//             const accounts = await provider.listAccounts();
//             const accountIndex = accounts.findIndex(acc => acc.toLowerCase() === walletAddress.toLowerCase());
//             if (accountIndex === -1) {
//                 throw new Error("Wallet address not found in Ganache accounts");
//             }
//             signer = provider.getSigner(accountIndex);
//             userAddress = walletAddress;
//         }

//         document.getElementById("walletAddress").innerText = `Connected: ${userAddress}`;
        
//         const contractInfo = await loadContractData();
//         contract = new ethers.Contract(contractInfo.address, contractInfo.abi, signer);
//         console.log("Contract methods:", Object.keys(contract));
//         console.log("Does contract have admin?", typeof contract.admin === "function");

//         // Listen for NewBid events
//         contract.on("NewBid", (auctionId, bidder, amount) => {
//             console.log(`New bid on auction ${auctionId}: ${ethers.utils.formatEther(amount)} ETH by ${bidder}`);
//             updateAuctionList(window.location.pathname.includes("admin.html"));
//         });

//         if (window.location.pathname.includes("admin.html")) {
//             let adminAddress;
//             try {
//                 adminAddress = await contract.admin();
//                 console.log("Admin address fetched:", adminAddress);
//             } catch (error) {
//                 console.error("Failed to fetch admin address:", error);
//                 throw error;
//             }
//             if (userAddress.toLowerCase() === adminAddress.toLowerCase()) {
//                 document.getElementById("adminPanel").style.display = "block";
//             } else {
//                 document.getElementById("adminPanel").innerHTML = "<p>You are not the admin.</p>";
//             }
//             await updateAuctionList(true);
//         } else if (window.location.pathname.includes("auctions.html")) {
//             await updateAuctionList(false);
//         } else if (window.location.pathname.includes("dashboard.html")) {
//             await updateUserDashboard();
//         }

//         updateTimers();
//     } catch (error) {
//         console.error("Connect wallet failed:", error);
//         document.getElementById("walletAddress").innerText = `Error: ${error.message}`;
//     }
// }

async function connectWallet() {
    try {
        // Determine signer based on page
        if (window.location.pathname.includes("admin.html")) {
            signer = provider.getSigner(0); // Admin uses the first Ganache account
            userAddress = await signer.getAddress();
            console.log("Admin signer address:", userAddress);
        } else {
            const walletAddress = document.getElementById("walletAddressInput").value;
            console.log("Wallet address input:", walletAddress);
            if (!ethers.utils.isAddress(walletAddress)) {
                throw new Error("Invalid wallet address");
            }
            const accounts = await provider.listAccounts();
            console.log("Available Ganache accounts:", accounts);
            const accountIndex = accounts.findIndex(acc => acc.toLowerCase() === walletAddress.toLowerCase());
            if (accountIndex === -1) {
                throw new Error("Wallet address not found in Ganache accounts");
            }
            signer = provider.getSigner(accountIndex);
            userAddress = walletAddress;
            console.log("User signer address:", userAddress);
        }

        // Update UI with connected address
        document.getElementById("walletAddress").innerText = `Connected: ${userAddress}`;
        
        // Load contract data and initialize contract instance
        const contractInfo = await loadContractData();
        console.log("Contract address:", contractInfo.address);
        console.log("ABI loaded:", contractInfo.abi.length > 0);
        contract = new ethers.Contract(contractInfo.address, contractInfo.abi, signer);
        console.log("Contract initialized");
        console.log("Contract methods:", Object.keys(contract));
        console.log("Does contract have admin?", typeof contract.admin === "function");

        // Listen for NewBid events
        contract.on("NewBid", (auctionId, bidder, amount) => {
            console.log(`New bid on auction ${auctionId}: ${ethers.utils.formatEther(amount)} ETH by ${bidder}`);
            updateAuctionList(window.location.pathname.includes("admin.html"));
        });

        // Page-specific logic
        if (window.location.pathname.includes("admin.html")) {
            let adminAddress;
            try {
                adminAddress = await contract.admin();
                console.log("Admin address fetched:", adminAddress);
            } catch (error) {
                console.error("Failed to fetch admin address:", error);
                throw error;
            }
            if (userAddress.toLowerCase() === adminAddress.toLowerCase()) {
                document.getElementById("adminPanel").style.display = "block";
                console.log("Admin panel displayed");
            } else {
                document.getElementById("adminPanel").innerHTML = "<p>You are not the admin.</p>";
                console.log("Non-admin message displayed");
            }
            await updateAuctionList(true);
        } else if (window.location.pathname.includes("auctions.html")) {
            await updateAuctionList(false);
        } else if (window.location.pathname.includes("dashboard.html")) {
            await updateUserDashboard();
        }

        // Start timer updates
        updateTimers();
    } catch (error) {
        console.error("Connect wallet failed:", error);
        document.getElementById("walletAddress").innerText = `Error: ${error.message}`;
    }
}

async function createAuction() {
    try {
        const itemName = document.getElementById("itemName").value;
        const imageUrl = document.getElementById("imageUrl").value;
        const duration = document.getElementById("duration").value;
        const startingBid = ethers.utils.parseEther(document.getElementById("startingBid").value);
        const tx = await contract.createAuction(itemName, imageUrl, duration, startingBid);
        await tx.wait();
        await updateAuctionList(true);
    } catch (error) {
        console.error("Create auction failed:", error);
    }
}

async function placeBid(auctionId) {
    try {
        const bidAmount = ethers.utils.parseEther(document.getElementById(`bidAmount-${auctionId}`).value);
        const tx = await contract.bid(auctionId, { value: bidAmount });
        await tx.wait();
        // Remove this line to prevent duplicate updates
        // await updateAuctionList(false);
    } catch (error) {
        console.error("Place bid failed:", error);
    }
}

async function endAuction(auctionId) {
    try {
        const tx = await contract.endAuction(auctionId);
        await tx.wait();
        await updateAuctionList(true);
    } catch (error) {
        console.error("End auction failed:", error);
    }
}

// Add a debounce mechanism to prevent multiple rapid updates
let isUpdatingAuctionList = false;
async function updateAuctionList(isAdminView) {
    if (isUpdatingAuctionList) return; // Skip if already updating
    isUpdatingAuctionList = true;

    try {
        const auctionList = document.getElementById("auctionList");
        if (!auctionList) return;
        auctionList.innerHTML = ""; // Clear the list to prevent duplicates
        const auctionCount = await contract.auctionCount();
        const adminAddress = await contract.admin();

        for (let i = 1; i <= auctionCount; i++) {
            const auction = await contract.auctions(i);
            const timeLeft = auction.endTime - Math.floor(Date.now() / 1000);
            const isSeller = userAddress.toLowerCase() === auction.seller.toLowerCase();
            const card = document.createElement("div");
            card.className = "auction-card";
            card.innerHTML = `
                <h3>Auction #${i}: ${auction.itemName}</h3>
                <img src="${auction.imageUrl}" alt="${auction.itemName}" onerror="this.src='https://via.placeholder.com/200?text=No+Image'">
                <p>Time Left: <span class="timer" data-end-time="${auction.endTime}">${timeLeft > 0 ? timeLeft : "Ended"}</span> seconds</p>
                <p>Highest Bid: <span class="highest-bid" data-auction-id="${i}">${ethers.utils.formatEther(auction.highestBid)}</span> ETH</p>
                <p>Highest Bidder: ${auction.highestBidder}</p>
                <p>Seller: ${auction.seller}</p>
                ${auction.ended ? `
                    <p>Winner: ${auction.highestBidder}</p>
                ` : isAdminView ? `
                    <button onclick="endAuction(${i})">End Auction</button>
                ` : isSeller ? `
                    <p>You are the seller and cannot bid.</p>
                ` : timeLeft > 0 ? `
                    <input id="bidAmount-${i}" placeholder="Bid Amount (ETH)" type="number" step="0.01">
                    <button onclick="placeBid(${i})">Place Bid</button>
                ` : `
                    <p>Auction has ended.</p>
                `}
            `;
            auctionList.appendChild(card);
        }
    } catch (error) {
        console.error("Update auction list failed:", error);
    } finally {
        isUpdatingAuctionList = false;
    }
}

function updateTimers() {
    const timers = document.querySelectorAll(".timer");
    timers.forEach(timer => {
        const endTime = parseInt(timer.getAttribute("data-end-time"));
        const timeLeft = endTime - Math.floor(Date.now() / 1000);
        timer.innerText = timeLeft > 0 ? timeLeft : "Ended";
        if (timeLeft === 0) {
            updateAuctionList(window.location.pathname.includes("admin.html"));
        }
    });
    setTimeout(updateTimers, 1000);
}

async function updateUserDashboard() {
    const dashboard = document.getElementById("userDashboard");
    if (!dashboard) return;
    dashboard.innerHTML = "";
    const wonAuctions = await contract.getUserWonAuctions(userAddress);
    console.log("Won auctions for", userAddress, ":", wonAuctions);
    
    if (wonAuctions.length === 0) {
        dashboard.innerHTML = "<p>You haven't won any auctions yet.</p>";
        return;
    }

    for (let auctionId of wonAuctions) {
        const auction = await contract.auctions(auctionId);
        const card = document.createElement("div");
        card.className = "auction-card";
        card.innerHTML = `
            <h3>Won Auction #${auctionId}: ${auction.itemName}</h3>
            <img src="${auction.imageUrl}" alt="${auction.itemName}" onerror="this.src='https://via.placeholder.com/200?text=No+Image'">
            <p>Winning Bid: ${ethers.utils.formatEther(auction.highestBid)} ETH</p>
        `;
        dashboard.appendChild(card);
    }
}

document.getElementById("connectWallet").addEventListener("click", connectWallet);
document.getElementById("createAuction")?.addEventListener("click", createAuction); 