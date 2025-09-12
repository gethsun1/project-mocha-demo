// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title MochaTreeToken (MTT)
 * @dev ERC721 token representing individual coffee trees
 * Uses ERC6960 standard with dynamic metadata and fractionalization
 */
contract MochaTreeToken is ERC721, ERC721URIStorage, Ownable, Pausable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    struct TreeData {
        uint256 farmId;
        string variety;
        uint256 plantingDate;
        uint256 expectedYield; // in kg per year
        uint256 currentYield;
        uint256 healthScore; // 0-100
        bool isActive;
        string iotData; // JSON string with sensor data
        uint256 lastUpdate;
    }
    
    mapping(uint256 => TreeData) public trees;
    mapping(uint256 => uint256[]) public farmTrees;
    mapping(address => uint256[]) public ownerTrees;
    mapping(uint256 => bool) public fractionalized;
    mapping(uint256 => uint256) public fractionalShares;
    
    address public farmManager;
    address public landToken;
    address public beanToken;
    
    event TreeMinted(uint256 indexed tokenId, uint256 indexed farmId, address indexed owner);
    event TreeUpdated(uint256 indexed tokenId, uint256 healthScore, string iotData);
    event TreeFractionalized(uint256 indexed tokenId, uint256 shares);
    event TreeYieldHarvested(uint256 indexed tokenId, uint256 yield);
    
    modifier onlyFarmManager() {
        require(msg.sender == farmManager, "Only farm manager can call this");
        _;
    }
    
    modifier onlyTreeOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Not the tree owner");
        _;
    }
    
    constructor(address _landToken, address _beanToken) ERC721("Mocha Tree Token", "MTT") {
        landToken = _landToken;
        beanToken = _beanToken;
    }
    
    function setFarmManager(address _farmManager) external onlyOwner {
        farmManager = _farmManager;
    }
    
    /**
     * @dev Mint a new coffee tree
     * @param to Address to mint to
     * @param farmId Farm ID where tree is planted
     * @param variety Coffee variety
     * @param expectedYield Expected annual yield in kg
     * @param metadataURI Metadata URI
     */
    function mintTree(
        address to,
        uint256 farmId,
        string memory variety,
        uint256 expectedYield,
        string memory metadataURI
    ) external onlyFarmManager whenNotPaused returns (uint256) {
        require(expectedYield > 0, "Expected yield must be greater than 0");
        
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        trees[tokenId] = TreeData({
            farmId: farmId,
            variety: variety,
            plantingDate: block.timestamp,
            expectedYield: expectedYield,
            currentYield: 0,
            healthScore: 100,
            isActive: true,
            iotData: "",
            lastUpdate: block.timestamp
        });
        
        farmTrees[farmId].push(tokenId);
        ownerTrees[to].push(tokenId);
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        emit TreeMinted(tokenId, farmId, to);
        return tokenId;
    }
    
    /**
     * @dev Update tree data (IoT sensors, health, etc.)
     * @param tokenId Tree token ID
     * @param healthScore New health score (0-100)
     * @param iotData New IoT sensor data
     */
    function updateTreeData(
        uint256 tokenId,
        uint256 healthScore,
        string memory iotData
    ) external onlyFarmManager {
        require(_exists(tokenId), "Tree does not exist");
        require(healthScore <= 100, "Health score must be <= 100");
        
        trees[tokenId].healthScore = healthScore;
        trees[tokenId].iotData = iotData;
        trees[tokenId].lastUpdate = block.timestamp;
        
        emit TreeUpdated(tokenId, healthScore, iotData);
    }
    
    /**
     * @dev Harvest yield from a tree
     * @param tokenId Tree token ID
     * @param yieldAmount Yield amount in kg
     */
    function harvestYield(uint256 tokenId, uint256 yieldAmount) external onlyFarmManager {
        require(_exists(tokenId), "Tree does not exist");
        require(trees[tokenId].isActive, "Tree is not active");
        
        trees[tokenId].currentYield += yieldAmount;
        emit TreeYieldHarvested(tokenId, yieldAmount);
    }
    
    /**
     * @dev Fractionalize a tree into shares
     * @param tokenId Tree token ID
     * @param shares Number of shares to create
     */
    function fractionalizeTree(uint256 tokenId, uint256 shares) external onlyTreeOwner(tokenId) {
        require(_exists(tokenId), "Tree does not exist");
        require(!fractionalized[tokenId], "Tree already fractionalized");
        require(shares > 0, "Shares must be greater than 0");
        
        fractionalized[tokenId] = true;
        fractionalShares[tokenId] = shares;
        
        emit TreeFractionalized(tokenId, shares);
    }
    
    /**
     * @dev Get tree data
     * @param tokenId Tree token ID
     * @return TreeData struct
     */
    function getTreeData(uint256 tokenId) external view returns (TreeData memory) {
        require(_exists(tokenId), "Tree does not exist");
        return trees[tokenId];
    }
    
    /**
     * @dev Get trees in a farm
     * @param farmId Farm ID
     * @return Array of tree token IDs
     */
    function getFarmTrees(uint256 farmId) external view returns (uint256[] memory) {
        return farmTrees[farmId];
    }
    
    /**
     * @dev Get trees owned by an address
     * @param owner Owner address
     * @return Array of tree token IDs
     */
    function getOwnerTrees(address owner) external view returns (uint256[] memory) {
        return ownerTrees[owner];
    }
    
    /**
     * @dev Get total number of trees
     * @return Total tree count
     */
    function getTotalTrees() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * @dev Check if tree is healthy (health score > 70)
     * @param tokenId Tree token ID
     * @return True if healthy
     */
    function isTreeHealthy(uint256 tokenId) external view returns (bool) {
        require(_exists(tokenId), "Tree does not exist");
        return trees[tokenId].healthScore > 70;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Override required by Solidity
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}
