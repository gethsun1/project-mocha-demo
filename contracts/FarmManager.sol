// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./MochaLandToken.sol";
import "./MochaTreeToken.sol";
import "./MochaBeanToken.sol";
import "./MochaVault.sol";

/**
 * @title FarmManager
 * @dev Central contract managing all farm operations and interactions
 */
contract FarmManager is Ownable, Pausable, ReentrancyGuard {
    MochaLandToken public landToken;
    MochaTreeToken public treeToken;
    MochaBeanToken public beanToken;
    MochaVault public vault;
    
    struct FarmInvestment {
        uint256 farmId;
        address investor;
        uint256 treeCount;
        uint256 totalInvestment;
        uint256 timestamp;
        bool isActive;
    }
    
    mapping(uint256 => FarmInvestment[]) public farmInvestments;
    mapping(address => uint256[]) public userInvestments;
    mapping(uint256 => uint256) public farmTotalInvestment;
    mapping(uint256 => uint256) public farmTotalTrees;
    
    uint256 public constant TREE_PRICE = 4 * 10**18; // 4 MBT per tree
    uint256 public constant PILOT_INVESTMENT_CAP = 2000 * 10**18; // $2000 pilot cap
    uint256 public constant MIN_INVESTMENT = 100 * 10**18; // $100 minimum
    
    event FarmCreated(uint256 indexed farmId, address indexed farmer, string name);
    event TreePurchased(uint256 indexed farmId, address indexed investor, uint256 treeCount);
    event InvestmentMade(uint256 indexed farmId, address indexed investor, uint256 amount);
    event YieldDistributed(uint256 indexed farmId, uint256 totalYield);
    
    modifier onlyValidFarm(uint256 farmId) {
        require(landToken.getTotalFarms() >= farmId && farmId > 0, "Invalid farm ID");
        _;
    }
    
    constructor(
        address _landToken,
        address _treeToken,
        address _beanToken,
        address _vault
    ) {
        landToken = MochaLandToken(_landToken);
        treeToken = MochaTreeToken(_treeToken);
        beanToken = MochaBeanToken(_beanToken);
        vault = MochaVault(_vault);
    }
    
    /**
     * @dev Create a new coffee farm (admin only)
     * @param farmer Farmer address
     * @param name Farm name
     * @param location Farm location
     * @param gpsCoordinates GPS coordinates
     * @param totalArea Total area in square meters
     * @param treeCapacity Maximum number of trees
     * @param metadataURI Metadata URI
     * @param apy Annual percentage yield for the vault tranche
     * @param maturity Maturity period in seconds
     * @param minInvestment Minimum investment in MBT
     * @param maxInvestment Maximum investment in MBT
     */
    function createFarm(
        address farmer,
        string memory name,
        string memory location,
        string memory gpsCoordinates,
        uint256 totalArea,
        uint256 treeCapacity,
        string memory metadataURI,
        uint256 apy,
        uint256 maturity,
        uint256 minInvestment,
        uint256 maxInvestment
    ) external onlyOwner whenNotPaused returns (uint256) {
        // Create the farm land token
        uint256 farmId = landToken.createFarm(
            farmer,
            name,
            location,
            gpsCoordinates,
            totalArea,
            treeCapacity,
            metadataURI
        );
        
        // Create vault tranche for this farm
        vault.createTranche(
            farmId,
            apy,
            maturity,
            minInvestment,
            maxInvestment,
            15000 // 150% collateralization
        );
        
        emit FarmCreated(farmId, farmer, name);
        return farmId;
    }
    
    /**
     * @dev Purchase coffee trees for investment
     * @param farmId Farm ID
     * @param treeCount Number of trees to purchase
     */
    function purchaseTrees(uint256 farmId, uint256 treeCount) external nonReentrant onlyValidFarm(farmId) {
        require(treeCount > 0, "Must purchase at least 1 tree");
        require(treeCount <= 500, "Maximum 500 trees per purchase"); // Pilot limit
        
        uint256 totalCost = treeCount * TREE_PRICE;
        require(totalCost >= MIN_INVESTMENT, "Below minimum investment");
        require(totalCost <= PILOT_INVESTMENT_CAP, "Exceeds pilot investment cap");
        
        // Check if user has enough MBT
        require(beanToken.balanceOf(msg.sender) >= totalCost, "Insufficient MBT balance");
        
        // Check farm capacity
        MochaLandToken.FarmData memory farmData = landToken.getFarmData(farmId);
        require(farmData.currentTrees + treeCount <= farmData.treeCapacity, "Exceeds farm capacity");
        
        // Transfer MBT from user
        beanToken.transferFrom(msg.sender, address(this), totalCost);
        
        // Mint tree tokens for the user
        for (uint256 i = 0; i < treeCount; i++) {
            treeToken.mintTree(
                msg.sender,
                farmId,
                "Arabica", // Default variety
                0.5 * 10**18, // 0.5kg expected yield
                "" // Empty metadata for now
            );
        }
        
        // Update farm tree count
        landToken.addTrees(farmId, treeCount);
        
        // Record investment
        FarmInvestment memory investment = FarmInvestment({
            farmId: farmId,
            investor: msg.sender,
            treeCount: treeCount,
            totalInvestment: totalCost,
            timestamp: block.timestamp,
            isActive: true
        });
        
        farmInvestments[farmId].push(investment);
        userInvestments[msg.sender].push(farmInvestments[farmId].length - 1);
        farmTotalInvestment[farmId] += totalCost;
        farmTotalTrees[farmId] += treeCount;
        
        emit TreePurchased(farmId, msg.sender, treeCount);
        emit InvestmentMade(farmId, msg.sender, totalCost);
    }
    
    /**
     * @dev Invest in farm vault tranche
     * @param farmId Farm ID
     * @param amount Amount of MBT to invest
     */
    function investInVault(uint256 farmId, uint256 amount) external nonReentrant onlyValidFarm(farmId) {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= PILOT_INVESTMENT_CAP, "Exceeds pilot investment cap");
        
        // Purchase vault shares
        vault.purchaseShares(farmId, amount);
        
        emit InvestmentMade(farmId, msg.sender, amount);
    }
    
    /**
     * @dev Distribute yield from coffee production
     * @param farmId Farm ID
     * @param totalYield Total yield in MBT
     */
    function distributeYield(uint256 farmId, uint256 totalYield) external onlyOwner onlyValidFarm(farmId) {
        require(totalYield > 0, "Yield must be greater than 0");
        
        // Mint new MBT tokens for the yield
        beanToken.mintCoffeeProduction(address(this), totalYield);
        
        // Distribute 70% to farmers, 30% to investors
        uint256 farmerShare = (totalYield * 70) / 100;
        uint256 investorShare = (totalYield * 30) / 100;
        
        // Get farm farmer address
        MochaLandToken.FarmData memory farmData = landToken.getFarmData(farmId);
        address farmer = farmData.farmer;
        
        // Transfer to farmer
        beanToken.transfer(farmer, farmerShare);
        
        // Distribute to vault for investors
        vault.distributeYield(farmId, investorShare);
        
        emit YieldDistributed(farmId, totalYield);
    }
    
    /**
     * @dev Get user's investments
     * @param user User address
     * @return Array of investment indices
     */
    function getUserInvestments(address user) external view returns (uint256[] memory) {
        return userInvestments[user];
    }
    
    /**
     * @dev Get farm investments
     * @param farmId Farm ID
     * @return Array of FarmInvestment structs
     */
    function getFarmInvestments(uint256 farmId) external view returns (FarmInvestment[] memory) {
        return farmInvestments[farmId];
    }
    
    /**
     * @dev Get farm statistics
     * @param farmId Farm ID
     * @return totalInvestment Total investment in MBT
     * @return totalTrees Total trees purchased
     * @return investorCount Number of investors
     */
    function getFarmStats(uint256 farmId) external view returns (uint256 totalInvestment, uint256 totalTrees, uint256 investorCount) {
        totalInvestment = farmTotalInvestment[farmId];
        totalTrees = farmTotalTrees[farmId];
        investorCount = farmInvestments[farmId].length;
    }
    
    /**
     * @dev Get all farms
     * @return Array of farm IDs
     */
    function getAllFarms() external view returns (uint256[] memory) {
        uint256 totalFarms = landToken.getTotalFarms();
        uint256[] memory farms = new uint256[](totalFarms);
        
        for (uint256 i = 1; i <= totalFarms; i++) {
            farms[i - 1] = i;
        }
        
        return farms;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}
