// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Fundraising Smart Contract for USDC-based Campaigns
/// @author 
/// @notice Allows users to create fundraising campaigns and donate using ERC20 (USDC)

interface IERC20 {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function transfer(address to, uint256 value) external returns (bool);
}

contract Fundraising {
    struct Campaign {
        string name;
        string description;
        uint256 goal;
        uint256 minDonation;
        uint256 deadline;
        address beneficiary;
        address creator;
        address token;
        string image;
        uint256 totalCollected;
        bool withdrawn;
    }

    struct CampaignRequest {
        string name;
        string description;
        uint256 goal;
        uint256 minDonation;
        uint256 duration; // in seconds
        address beneficiary;
        string image;
    }

    // Storage
    Campaign[] public campaigns;
    mapping(uint256 => mapping(address => uint256)) public donations;

    address public usdcToken;

    // Events
    event CampaignCreated(uint256 indexed campaignId, address indexed creator);
    event DonationReceived(uint256 indexed campaignId, address indexed donor, uint256 amount);
    event FundsWithdrawn(uint256 indexed campaignId, address indexed beneficiary, uint256 amount);
    event Refunded(uint256 indexed campaignId, address indexed donor, uint256 amount);

    /// @notice Constructor sets the USDC token address
    constructor(address _usdcToken) {
        usdcToken = _usdcToken;
    }

    /// @notice Create a new fundraising campaign
    function createCampaign(CampaignRequest memory req) external {
        require(req.duration > 0, "Invalid duration");

        Campaign memory newCampaign = Campaign({
            name: req.name,
            description: req.description,
            goal: req.goal,
            minDonation: req.minDonation,
            deadline: block.timestamp + req.duration,
            beneficiary: req.beneficiary,
            creator: msg.sender,
            token: usdcToken,
            image: req.image,
            totalCollected: 0,
            withdrawn: false
        });

        campaigns.push(newCampaign);
        emit CampaignCreated(campaigns.length - 1, msg.sender);
    }

    /// @notice Donate USDC to a specific campaign
    function donate(uint256 campaignId, uint256 amount) external {
        Campaign storage campaign = campaigns[campaignId];
        require(block.timestamp <= campaign.deadline, "Campaign ended");
        require(amount >= campaign.minDonation, "Donation below minimum");

        IERC20 token = IERC20(campaign.token);
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        campaign.totalCollected += amount;
        donations[campaignId][msg.sender] += amount;

        emit DonationReceived(campaignId, msg.sender, amount);
    }

    /// @notice Withdraw funds to the beneficiary if goal met after deadline
    function withdrawFunds(uint256 campaignId) external {
        Campaign storage campaign = campaigns[campaignId];
        require(msg.sender == campaign.creator, "Not creator");
        require(!campaign.withdrawn, "Already withdrawn");
        require(block.timestamp >= campaign.deadline, "Too early");
        require(campaign.totalCollected >= campaign.goal, "Goal not met");

        campaign.withdrawn = true;
        IERC20 token = IERC20(campaign.token);
        require(token.transfer(campaign.beneficiary, campaign.totalCollected), "Transfer failed");

        emit FundsWithdrawn(campaignId, campaign.beneficiary, campaign.totalCollected);
    }

    /// @notice Refund donors if campaign failed after deadline
    function refund(uint256 campaignId) external {
        Campaign storage campaign = campaigns[campaignId];
        require(block.timestamp >= campaign.deadline, "Too early");
        require(campaign.totalCollected < campaign.goal, "Goal met");

        uint256 donated = donations[campaignId][msg.sender];
        require(donated > 0, "No donation");

        donations[campaignId][msg.sender] = 0;
        IERC20 token = IERC20(campaign.token);
        require(token.transfer(msg.sender, donated), "Refund failed");

        emit Refunded(campaignId, msg.sender, donated);
    }

    /// @notice Get a campaign by ID
    function getCampaign(uint256 id) external view returns (Campaign memory) {
        return campaigns[id];
    }

    /// @notice Get total number of campaigns
    function campaignCount() external view returns (uint256) {
        return campaigns.length;
    }
}
