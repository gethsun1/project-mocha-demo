// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title MochaLandToken (MLT)
 * @dev ERC721 token representing coffee farm land ownership
 * Uses ERC6551 Token-Bound Account for farm management
 */
contract MochaLandToken is ERC721, ERC721URIStorage, Ownable, Pausable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    struct FarmData {
        string name;
        string location;
        string gpsCoordinates;
        uint256 totalArea; // in square meters
        uint256 treeCapacity;
        uint256 currentTrees;
        uint256 creationTime;
        address farmer;
        bool isActive;
        string metadataURI;
    }
    
    mapping(uint256 => FarmData) public farms;
    mapping(address => uint256[]) public farmerFarms;
    mapping(string => bool) public usedCoordinates;
    
    address public farmManager;
    address public beanToken;
    
    event FarmCreated(uint256 indexed tokenId, address indexed farmer, string name, string location);
    event FarmUpdated(uint256 indexed tokenId, string name, bool isActive);
    event TreeAdded(uint256 indexed tokenId, uint256 treeCount);
    
    modifier onlyFarmManager() {
        require(msg.sender == farmManager, "Only farm manager can call this");
        _;
    }
    
    modifier onlyFarmOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Not the farm owner");
        _;
    }
    
    constructor(address _beanToken) ERC721("Mocha Land Token", "MLT") {
        beanToken = _beanToken;
    }
    
    function setFarmManager(address _farmManager) external onlyOwner {
        farmManager = _farmManager;
    }
    
    /**
     * @dev Create a new coffee farm
     * @param farmer Farmer address
     * @param name Farm name
     * @param location Farm location
     * @param gpsCoordinates GPS coordinates
     * @param totalArea Total area in square meters
     * @param treeCapacity Maximum number of trees
     * @param metadataURI Metadata URI for the farm
     */
    function createFarm(
        address farmer,
        string memory name,
        string memory location,
        string memory gpsCoordinates,
        uint256 totalArea,
        uint256 treeCapacity,
        string memory metadataURI
    ) external onlyFarmManager whenNotPaused returns (uint256) {
        require(bytes(gpsCoordinates).length > 0, "GPS coordinates required");
        require(!usedCoordinates[gpsCoordinates], "Coordinates already used");
        require(totalArea > 0, "Area must be greater than 0");
        require(treeCapacity > 0, "Tree capacity must be greater than 0");
        
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        farms[tokenId] = FarmData({
            name: name,
            location: location,
            gpsCoordinates: gpsCoordinates,
            totalArea: totalArea,
            treeCapacity: treeCapacity,
            currentTrees: 0,
            creationTime: block.timestamp,
            farmer: farmer,
            isActive: true,
            metadataURI: metadataURI
        });
        
        usedCoordinates[gpsCoordinates] = true;
        farmerFarms[farmer].push(tokenId);
        
        _safeMint(farmer, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        emit FarmCreated(tokenId, farmer, name, location);
        return tokenId;
    }
    
    /**
     * @dev Update farm information
     * @param tokenId Farm token ID
     * @param name New farm name
     * @param isActive Farm active status
     */
    function updateFarm(
        uint256 tokenId,
        string memory name,
        bool isActive
    ) external onlyFarmOwner(tokenId) {
        require(_exists(tokenId), "Farm does not exist");
        
        farms[tokenId].name = name;
        farms[tokenId].isActive = isActive;
        
        emit FarmUpdated(tokenId, name, isActive);
    }
    
    /**
     * @dev Add trees to a farm
     * @param tokenId Farm token ID
     * @param treeCount Number of trees to add
     */
    function addTrees(uint256 tokenId, uint256 treeCount) external onlyFarmManager {
        require(_exists(tokenId), "Farm does not exist");
        require(farms[tokenId].isActive, "Farm is not active");
        require(
            farms[tokenId].currentTrees + treeCount <= farms[tokenId].treeCapacity,
            "Exceeds tree capacity"
        );
        
        farms[tokenId].currentTrees += treeCount;
        emit TreeAdded(tokenId, treeCount);
    }
    
    /**
     * @dev Get farm data
     * @param tokenId Farm token ID
     * @return FarmData struct
     */
    function getFarmData(uint256 tokenId) external view returns (FarmData memory) {
        require(_exists(tokenId), "Farm does not exist");
        return farms[tokenId];
    }
    
    /**
     * @dev Get farms owned by a farmer
     * @param farmer Farmer address
     * @return Array of farm token IDs
     */
    function getFarmerFarms(address farmer) external view returns (uint256[] memory) {
        return farmerFarms[farmer];
    }
    
    /**
     * @dev Get total number of farms
     * @return Total farm count
     */
    function getTotalFarms() external view returns (uint256) {
        return _tokenIdCounter.current();
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
