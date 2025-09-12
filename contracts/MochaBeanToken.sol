// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title MochaBeanToken (MBT)
 * @dev ERC20 token representing coffee bean production
 * 1 MBT = 1kg of green coffee beans
 */
contract MochaBeanToken is ERC20, Ownable, Pausable {
    uint256 public constant INITIAL_SUPPLY = 250_000_000 * 10**18; // 250M tokens
    uint256 public constant FARMER_ALLOCATION = 100_000_000 * 10**18; // 40%
    uint256 public constant INVESTOR_ALLOCATION = 75_000_000 * 10**18; // 30%
    uint256 public constant PROJECT_ALLOCATION = 75_000_000 * 10**18; // 30%
    
    uint256 public constant TREE_BOND_PRICE = 4 * 10**18; // 4 MBT per tree bond
    uint256 public constant ANNUAL_YIELD_RATE = 10; // 10% annual yield
    
    mapping(address => uint256) public treeBonds;
    mapping(address => uint256) public lastStakeTime;
    mapping(address => uint256) public pendingRewards;
    
    address public farmManager;
    address public vaultContract;
    
    event TreeBondPurchased(address indexed user, uint256 amount, uint256 trees);
    event RewardsClaimed(address indexed user, uint256 amount);
    event AutoRedemption(address indexed user, uint256 amount);
    
    modifier onlyFarmManager() {
        require(msg.sender == farmManager, "Only farm manager can call this");
        _;
    }
    
    constructor() ERC20("Mocha Bean Token", "MBT") {
        _mint(msg.sender, PROJECT_ALLOCATION);
        _mint(address(this), FARMER_ALLOCATION + INVESTOR_ALLOCATION);
    }
    
    function setFarmManager(address _farmManager) external onlyOwner {
        farmManager = _farmManager;
    }
    
    function setVaultContract(address _vaultContract) external onlyOwner {
        vaultContract = _vaultContract;
    }
    
    /**
     * @dev Purchase tree bonds by staking MBT tokens
     * @param amount Amount of MBT to stake
     */
    function purchaseTreeBonds(uint256 amount) external whenNotPaused {
        require(amount >= TREE_BOND_PRICE, "Minimum 4 MBT required");
        require(amount % TREE_BOND_PRICE == 0, "Amount must be multiple of 4 MBT");
        
        uint256 trees = amount / TREE_BOND_PRICE;
        
        _transfer(msg.sender, address(this), amount);
        treeBonds[msg.sender] += trees;
        lastStakeTime[msg.sender] = block.timestamp;
        
        emit TreeBondPurchased(msg.sender, amount, trees);
    }
    
    /**
     * @dev Calculate pending rewards for a user
     * @param user User address
     * @return rewards Pending rewards in MBT
     */
    function calculateRewards(address user) public view returns (uint256) {
        if (treeBonds[user] == 0 || lastStakeTime[user] == 0) {
            return pendingRewards[user];
        }
        
        uint256 timeStaked = block.timestamp - lastStakeTime[user];
        uint256 annualReward = (treeBonds[user] * TREE_BOND_PRICE * ANNUAL_YIELD_RATE) / 100;
        uint256 rewards = (annualReward * timeStaked) / 365 days;
        
        return pendingRewards[user] + rewards;
    }
    
    /**
     * @dev Claim accumulated rewards
     */
    function claimRewards() external {
        uint256 rewards = calculateRewards(msg.sender);
        require(rewards > 0, "No rewards to claim");
        
        pendingRewards[msg.sender] = 0;
        lastStakeTime[msg.sender] = block.timestamp;
        
        _transfer(address(this), msg.sender, rewards);
        emit RewardsClaimed(msg.sender, rewards);
    }
    
    /**
     * @dev Unstake tree bonds and claim rewards
     * @param trees Number of trees to unstake
     */
    function unstakeTreeBonds(uint256 trees) external {
        require(trees <= treeBonds[msg.sender], "Insufficient tree bonds");
        require(trees > 0, "Must unstake at least 1 tree");
        
        // Claim rewards first
        uint256 rewards = calculateRewards(msg.sender);
        if (rewards > 0) {
            pendingRewards[msg.sender] = 0;
            lastStakeTime[msg.sender] = block.timestamp;
            _transfer(address(this), msg.sender, rewards);
            emit RewardsClaimed(msg.sender, rewards);
        }
        
        uint256 amount = trees * TREE_BOND_PRICE;
        treeBonds[msg.sender] -= trees;
        
        _transfer(address(this), msg.sender, amount);
    }
    
    /**
     * @dev Auto-redeem unstaked MBTs older than 1 year
     * @param user User address to check for auto-redemption
     */
    function checkAutoRedemption(address user) external {
        // This would be called by a keeper or automated system
        // For now, we'll implement a simple check
        if (lastStakeTime[user] > 0 && block.timestamp - lastStakeTime[user] > 365 days) {
            if (treeBonds[user] == 0) {
                // Auto-redeem unstaked tokens
                uint256 balance = balanceOf(user);
                if (balance > 0) {
                    _transfer(user, address(this), balance);
                    emit AutoRedemption(user, balance);
                }
            }
        }
    }
    
    /**
     * @dev Mint new MBT tokens for coffee production
     * @param to Address to mint to
     * @param amount Amount to mint (in kg of coffee)
     */
    function mintCoffeeProduction(address to, uint256 amount) external onlyFarmManager {
        _mint(to, amount * 10**18); // 1 MBT = 1kg
    }
    
    /**
     * @dev Distribute farmer incentives
     * @param farmers Array of farmer addresses
     * @param amounts Array of amounts to distribute
     */
    function distributeFarmerIncentives(address[] memory farmers, uint256[] memory amounts) external onlyOwner {
        require(farmers.length == amounts.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < farmers.length; i++) {
            _transfer(address(this), farmers[i], amounts[i]);
        }
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}
