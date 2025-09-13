// Contract addresses on Scroll Sepolia
export const CONTRACT_ADDRESSES = {
  MochaBeanToken: "0x868BE05289CC245be73e8A461597893f6cb55b70",
  MochaLandToken: "0x289FdEE84aF11DD000Be62C55bC44B1e754681DB",
  MochaTreeToken: "0x453A648C7c136d644251777B6156e2a5f79FE804",
  MochaVault: "0xA7758Ea9D9401546EF94921DfF8C1E8A6D2322c6",
  FarmManager: "0x8123E32f4b5240B4B77355c3E5D08EA9253bf51B",
} as const;

// Scroll Sepolia network configuration
export const SCROLL_SEPOLIA = {
  id: 534351,
  name: "Scroll Sepolia",
  network: "scrollSepolia",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://sepolia-rpc.scroll.io"],
    },
    public: {
      http: ["https://sepolia-rpc.scroll.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Scroll Sepolia Explorer",
      url: "https://sepolia.scrollscan.com",
    },
  },
  testnet: true,
} as const;

// Contract ABIs
export const FARM_MANAGER_ABI = [
  {
    "inputs": [],
    "name": "getAllFarms",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "farmId", "type": "uint256"}],
    "name": "getFarmStats",
    "outputs": [
      {"internalType": "uint256", "name": "totalInvestment", "type": "uint256"},
      {"internalType": "uint256", "name": "totalTrees", "type": "uint256"},
      {"internalType": "uint256", "name": "investorCount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserInvestments",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "farmer", "type": "address"},
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "location", "type": "string"},
      {"internalType": "string", "name": "gpsCoordinates", "type": "string"},
      {"internalType": "uint256", "name": "totalArea", "type": "uint256"},
      {"internalType": "uint256", "name": "treeCapacity", "type": "uint256"},
      {"internalType": "string", "name": "metadataURI", "type": "string"},
      {"internalType": "uint256", "name": "apy", "type": "uint256"},
      {"internalType": "uint256", "name": "maturity", "type": "uint256"},
      {"internalType": "uint256", "name": "minInvestment", "type": "uint256"},
      {"internalType": "uint256", "name": "maxInvestment", "type": "uint256"}
    ],
    "name": "createFarm",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "farmId", "type": "uint256"},
      {"internalType": "uint256", "name": "treeCount", "type": "uint256"}
    ],
    "name": "purchaseTrees",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "farmId", "type": "uint256"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "investInVault",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "farmId", "type": "uint256"}
    ],
    "name": "getFarmInvestments",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "farmId", "type": "uint256"},
          {"internalType": "address", "name": "investor", "type": "address"},
          {"internalType": "uint256", "name": "treeCount", "type": "uint256"},
          {"internalType": "uint256", "name": "totalInvestment", "type": "uint256"},
          {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
          {"internalType": "bool", "name": "isActive", "type": "bool"}
        ],
        "internalType": "struct FarmManager.FarmInvestment[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const LAND_TOKEN_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "getFarmData",
    "outputs": [
      {
        "components": [
          {"internalType": "string", "name": "name", "type": "string"},
          {"internalType": "string", "name": "location", "type": "string"},
          {"internalType": "string", "name": "gpsCoordinates", "type": "string"},
          {"internalType": "uint256", "name": "totalArea", "type": "uint256"},
          {"internalType": "uint256", "name": "treeCapacity", "type": "uint256"},
          {"internalType": "uint256", "name": "currentTrees", "type": "uint256"},
          {"internalType": "uint256", "name": "creationTime", "type": "uint256"},
          {"internalType": "address", "name": "farmer", "type": "address"},
          {"internalType": "bool", "name": "isActive", "type": "bool"},
          {"internalType": "string", "name": "metadataURI", "type": "string"}
        ],
        "internalType": "struct MochaLandToken.FarmData",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalFarms",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const BEAN_TOKEN_ABI = [
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "address", "name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "from", "type": "address"},
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "transferFrom",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "purchaseTreeBonds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "calculateRewards",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "treeBonds",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "trees", "type": "uint256"}],
    "name": "unstakeTreeBonds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const VAULT_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "farmId", "type": "uint256"}],
    "name": "getTrancheInfo",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "farmId", "type": "uint256"},
          {"internalType": "uint256", "name": "totalValue", "type": "uint256"},
          {"internalType": "uint256", "name": "sharePrice", "type": "uint256"},
          {"internalType": "uint256", "name": "apy", "type": "uint256"},
          {"internalType": "uint256", "name": "maturity", "type": "uint256"},
          {"internalType": "uint256", "name": "minInvestment", "type": "uint256"},
          {"internalType": "uint256", "name": "maxInvestment", "type": "uint256"},
          {"internalType": "uint256", "name": "totalShares", "type": "uint256"},
          {"internalType": "bool", "name": "isActive", "type": "bool"},
          {"internalType": "uint256", "name": "collateralizationRatio", "type": "uint256"}
        ],
        "internalType": "struct MochaVault.FarmTranche",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "farmId", "type": "uint256"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "purchaseShares",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "farmId", "type": "uint256"},
      {"internalType": "uint256", "name": "shares", "type": "uint256"}
    ],
    "name": "redeemShares",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "uint256", "name": "farmId", "type": "uint256"}
    ],
    "name": "getUserShares",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
