// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Auction is ReentrancyGuard {
    address public admin;
    uint public auctionCount;

    struct AuctionData {
        string itemName;
        string imageUrl; // New: Store image URL
        uint endTime;
        uint highestBid;
        address highestBidder;
        bool ended;
        address seller;
    }

    mapping(uint => AuctionData) public auctions; // Auction ID => Auction data
    mapping(address => uint[]) public userWonAuctions; // User => List of won auction IDs

    event AuctionCreated(uint auctionId, string itemName, string imageUrl, uint endTime, uint startingBid);
    event NewBid(uint auctionId, address bidder, uint amount);
    event AuctionEnded(uint auctionId, address winner, uint amount);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    constructor() {
        admin = msg.sender; // Deployer is the admin
    }

    function createAuction(string memory _itemName, string memory _imageUrl, uint _duration, uint _startingBid) external onlyAdmin {
        auctionCount++;
        auctions[auctionCount] = AuctionData({
            itemName: _itemName,
            imageUrl: _imageUrl,
            endTime: block.timestamp + _duration,
            highestBid: _startingBid,
            highestBidder: address(0),
            ended: false,
            seller: msg.sender
        });
        emit AuctionCreated(auctionCount, _itemName, _imageUrl, block.timestamp + _duration, _startingBid);
    }

    function bid(uint _auctionId) external payable nonReentrant {
        AuctionData storage auction = auctions[_auctionId];
        require(block.timestamp < auction.endTime, "Auction has ended");
        require(msg.value > auction.highestBid, "Bid must be higher than current highest");
        require(msg.sender != auction.seller, "Seller cannot bid");
        require(!auction.ended, "Auction already ended");

        if (auction.highestBidder != address(0)) {
            payable(auction.highestBidder).transfer(auction.highestBid); // Refund previous bidder
        }

        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;

        emit NewBid(_auctionId, msg.sender, msg.value);
    }

    function endAuction(uint _auctionId) external onlyAdmin nonReentrant {
        AuctionData storage auction = auctions[_auctionId];
        // require(block.timestamp >= endTime || suddenDeath(endTime), "Auction not yet ended"); // Comment out for testing
        require(!auction.ended, "Auction already ended");

        auction.ended = true;
        if (auction.highestBidder != address(0)) {
            payable(auction.seller).transfer(auction.highestBid);
            userWonAuctions[auction.highestBidder].push(_auctionId);
        }
        emit AuctionEnded(_auctionId, auction.highestBidder, auction.highestBid);
    }

    function suddenDeath(uint _endTime) internal view returns (bool) {
        if (block.timestamp >= _endTime - 300) {
            uint random = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 10;
            return random < 2; // 20% chance
        }
        return false;
    }

    function getUserWonAuctions(address _user) external view returns (uint[] memory) {
        return userWonAuctions[_user];
    }
}