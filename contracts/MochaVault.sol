// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title MochaVault (MTTR)
 * @dev ERC4626-compliant vault for Mocha Asset-Backed Bonds (MABB)
 * Each farm is a single tranche with independent share tokens
 */
contract MochaVault is ERC20, Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    IERC20 public immutable asset; // MBT token
    address public farmManager;
    address public landToken;
    address public treeToken;
    
    struct FarmTranche {
        uint256 farmId;
        uint256 totalValue; // Total value locked in MBT
        uint256 sharePrice; // Price per share in MBT
        uint256 apy; // Annual percentage yield (basis points)
        uint256 maturity; // Maturity timestamp
        uint256 minInvestment; // Minimum investment in MBT
        uint256 maxInvestment; // Maximum investment in MBT
        uint256 totalShares; // Total shares issued
        bool isActive;
        uint256 collateralizationRatio; // Over-collateralization ratio (basis points)
    }
    
    mapping(uint256 => FarmTranche) public farmTranches;
    mapping(address => mapping(uint256 => uint256)) public userShares; // user => farmId => shares
    mapping(uint256 => uint256) public farmTotalShares; // farmId => total shares
    mapping(uint256 => uint256) public farmTotalValue; // farmId => total value
    
    uint256 public totalTranches;
    uint256 public constant BASIS_POINTS = 10000;
    
    event TrancheCreated(uint256 indexed farmId, uint256 apy, uint256 maturity);
    event SharesPurchased(address indexed user, uint256 indexed farmId, uint256 shares, uint256 amount);
    event SharesRedeemed(address indexed user, uint256 indexed farmId, uint256 shares, uint256 amount);
    event YieldDistributed(uint256 indexed farmId, uint256 amount);
    event MaturityReached(uint256 indexed farmId, uint256 totalValue);
    
    modifier onlyFarmManager() {
        require(msg.sender == farmManager, "Only farm manager can call this");
        _;
    }
    
    modifier validTranche(uint256 farmId) {
        require(farmTranches[farmId].isActive, "Tranche not active");
        _;
    }
    
    constructor(
        address _asset,
        address _landToken,
        address _treeToken
    ) ERC20("Mocha Tree Rights", "MTTR") {
        asset = IERC20(_asset);
        landToken = _landToken;
        treeToken = _treeToken;
    }
    
    function setFarmManager(address _farmManager) external onlyOwner {
        farmManager = _farmManager;
    }
    
    /**
     * @dev Create a new farm tranche
     * @param farmId Farm ID
     * @param apy Annual percentage yield (basis points, e.g., 1200 = 12%)
     * @param maturity Maturity period in seconds
     * @param minInvestment Minimum investment in MBT
     * @param maxInvestment Maximum investment in MBT
     * @param collateralizationRatio Over-collateralization ratio (basis points)
     */
    function createTranche(
        uint256 farmId,
        uint256 apy,
        uint256 maturity,
        uint256 minInvestment,
        uint256 maxInvestment,
        uint256 collateralizationRatio
    ) external onlyFarmManager {
        require(!farmTranches[farmId].isActive, "Tranche already exists");
        require(apy > 0 && apy <= 5000, "Invalid APY (0-50%)");
        require(maturity > 0, "Invalid maturity");
        require(minInvestment > 0, "Invalid min investment");
        require(maxInvestment >= minInvestment, "Max must be >= min");
        require(collateralizationRatio >= 10000, "Collateralization must be >= 100%");
        
        farmTranches[farmId] = FarmTranche({
            farmId: farmId,
            totalValue: 0,
            sharePrice: 1e18, // 1 MBT per share initially
            apy: apy,
            maturity: block.timestamp + maturity,
            minInvestment: minInvestment,
            maxInvestment: maxInvestment,
            totalShares: 0,
            isActive: true,
            collateralizationRatio: collateralizationRatio
        });
        
        totalTranches++;
        emit TrancheCreated(farmId, apy, block.timestamp + maturity);
    }
    
    /**
     * @dev Purchase shares in a farm tranche
     * @param farmId Farm ID
     * @param amount Amount of MBT to invest
     */
    function purchaseShares(uint256 farmId, uint256 amount) external nonReentrant validTranche(farmId) {
        FarmTranche storage tranche = farmTranches[farmId];
        
        require(amount >= tranche.minInvestment, "Below minimum investment");
        require(amount <= tranche.maxInvestment, "Above maximum investment");
        require(block.timestamp < tranche.maturity, "Tranche has matured");
        
        // Check user's total investment in this tranche
        uint256 userTotalValue = userShares[msg.sender][farmId] * tranche.sharePrice;
        require(userTotalValue + amount <= tranche.maxInvestment, "Exceeds maximum investment");
        
        uint256 shares = amount / tranche.sharePrice;
        require(shares > 0, "Insufficient amount for shares");
        
        // Transfer MBT from user to vault
        asset.safeTransferFrom(msg.sender, address(this), amount);
        
        // Update state
        userShares[msg.sender][farmId] += shares;
        farmTotalShares[farmId] += shares;
        farmTotalValue[farmId] += amount;
        tranche.totalShares += shares;
        tranche.totalValue += amount;
        
        // Mint vault shares to user
        _mint(msg.sender, shares);
        
        emit SharesPurchased(msg.sender, farmId, shares, amount);
    }
    
    /**
     * @dev Redeem shares from a farm tranche
     * @param farmId Farm ID
     * @param shares Number of shares to redeem
     */
    function redeemShares(uint256 farmId, uint256 shares) external nonReentrant validTranche(farmId) {
        require(shares > 0, "Invalid shares amount");
        require(userShares[msg.sender][farmId] >= shares, "Insufficient shares");
        
        FarmTranche storage tranche = farmTranches[farmId];
        uint256 amount = shares * tranche.sharePrice;
        
        // Check if tranche has matured
        if (block.timestamp >= tranche.maturity) {
            // Full redemption with yield
            uint256 yield = calculateYield(msg.sender, farmId);
            uint256 totalAmount = amount + yield;
            
            require(asset.balanceOf(address(this)) >= totalAmount, "Insufficient vault balance");
            
            asset.safeTransfer(msg.sender, totalAmount);
            emit MaturityReached(farmId, totalAmount);
        } else {
            // Early redemption (principal only)
            require(asset.balanceOf(address(this)) >= amount, "Insufficient vault balance");
            asset.safeTransfer(msg.sender, amount);
        }
        
        // Update state
        userShares[msg.sender][farmId] -= shares;
        farmTotalShares[farmId] -= shares;
        farmTotalValue[farmId] -= amount;
        tranche.totalShares -= shares;
        tranche.totalValue -= amount;
        
        // Burn vault shares
        _burn(msg.sender, shares);
        
        emit SharesRedeemed(msg.sender, farmId, shares, amount);
    }
    
    /**
     * @dev Calculate yield for a user in a specific tranche
     * @param user User address
     * @param farmId Farm ID
     * @return yield amount in MBT
     */
    function calculateYield(address user, uint256 farmId) public view returns (uint256) {
        FarmTranche memory tranche = farmTranches[farmId];
        uint256 userShareAmount = userShares[user][farmId];
        
        if (userShareAmount == 0) return 0;
        
        uint256 timeStaked = block.timestamp - tranche.maturity + (365 days); // Simplified calculation
        uint256 annualYield = (userShareAmount * tranche.sharePrice * tranche.apy) / BASIS_POINTS;
        uint256 yield = (annualYield * timeStaked) / 365 days;
        
        return yield;
    }
    
    /**
     * @dev Distribute yield to all shareholders
     * @param farmId Farm ID
     * @param yieldAmount Total yield amount to distribute
     */
    function distributeYield(uint256 farmId, uint256 yieldAmount) external onlyFarmManager {
        require(farmTranches[farmId].isActive, "Tranche not active");
        require(yieldAmount > 0, "Invalid yield amount");
        
        // This would be called by the farm manager when coffee is harvested
        // For now, we'll just emit an event
        emit YieldDistributed(farmId, yieldAmount);
    }
    
    /**
     * @dev Get user's shares in a tranche
     * @param user User address
     * @param farmId Farm ID
     * @return Number of shares
     */
    function getUserShares(address user, uint256 farmId) external view returns (uint256) {
        return userShares[user][farmId];
    }
    
    /**
     * @dev Get tranche information
     * @param farmId Farm ID
     * @return FarmTranche struct
     */
    function getTrancheInfo(uint256 farmId) external view returns (FarmTranche memory) {
        return farmTranches[farmId];
    }
    
    /**
     * @dev Get total assets in vault
     * @return Total assets in MBT
     */
    function totalAssets() public view returns (uint256) {
        return asset.balanceOf(address(this));
    }
    
    /**
     * @dev Convert shares to assets
     * @param shares Number of shares
     * @return Asset amount
     */
    function convertToAssets(uint256 shares) public view returns (uint256) {
        return shares; // 1:1 ratio for simplicity
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}
