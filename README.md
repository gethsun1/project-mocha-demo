# Project Mocha - Tokenized Coffee Farming Platform

A comprehensive DeFi platform that tokenizes coffee farming operations, enabling investors to purchase coffee trees and participate in Mocha Asset-Backed Bonds (MABB) on the Scroll Sepolia testnet.

## 🌟 Features

### For Investors
- **Coffee Tree Investment**: Purchase individual coffee trees (4 MBT per tree)
- **Vault Investment**: Invest in Mocha Asset-Backed Bonds (MABB) with 12-16% APY
- **Token Staking**: Stake MBT tokens for 10% annual yield
- **Portfolio Management**: Track investments and claim rewards
- **Real-time Data**: Live farm statistics and investment performance

### For Admins
- **Farm Creation**: Deploy new coffee farms with GPS coordinates and metadata
- **Farm Management**: Monitor farm statistics and investor activity
- **Yield Distribution**: Distribute coffee production yields (70% farmers, 30% investors)
- **Investment Controls**: Set minimum/maximum investment limits

## 🏗️ Architecture

### Smart Contracts (Scroll Sepolia)
- **MochaBeanToken (MBT)**: ERC20 token representing coffee production (250M supply)
- **MochaLandToken (MLT)**: ERC721 NFTs for farm ownership with GPS coordinates
- **MochaTreeToken (MTT)**: ERC721 NFTs for individual coffee trees
- **MochaVault (MTTR)**: ERC4626-compliant vault for Mocha Asset-Backed Bonds
- **FarmManager**: Central contract managing all farm operations

### Frontend
- **Next.js 14** with TypeScript
- **Tailwind CSS** with shadcn/ui components
- **Wagmi** for Ethereum integration
- **RainbowKit** for wallet connection
- **Real-time contract integration**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MetaMask wallet
- Scroll Sepolia testnet configured

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/gethsun1/project-mocha-demo.git
   cd project-mocha-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Add your private key and API keys
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Smart Contract Deployment

1. **Compile contracts**
   ```bash
   npm run compile
   ```

2. **Deploy to Scroll Sepolia**
   ```bash
   npm run deploy
   ```

3. **Verify contracts**
   ```bash
   npm run verify
   ```

## 📋 Contract Addresses (Scroll Sepolia)

- **MochaBeanToken (MBT)**: `0x868BE05289CC245be73e8A461597893f6cb55b70`
- **MochaLandToken (MLT)**: `0x289FdEE84aF11DD000Be62C55bC44B1e754681DB`
- **MochaTreeToken (MTT)**: `0x453A648C7c136d644251777B6156e2a5f79FE804`
- **MochaVault (MTTR)**: `0xA7758Ea9D9401546EF94921DfF8C1E8A6D2322c6`
- **FarmManager**: `0x8123E32f4b5240B4B77355c3E5D08EA9253bf51B`

## 💰 Tokenomics

### MBT Token Distribution
- **Total Supply**: 250,000,000 MBT
- **Farmer Incentives**: 40% (100M MBT)
- **Investor Pool**: 30% (75M MBT)
- **Project Mocha**: 30% (75M MBT)

### Investment Parameters
- **Tree Price**: 4 MBT per tree
- **Minimum Investment**: 100 MBT ($100)
- **Maximum Investment**: 2,000 MBT ($2,000) per farm
- **Annual Yield**: 10% for staked MBT tokens
- **Vault APY**: 12-16% depending on farm

## 🔧 Development

### Project Structure
```
├── contracts/          # Smart contracts
├── components/         # React components
├── app/               # Next.js app directory
├── lib/               # Utility functions and configurations
├── scripts/           # Deployment scripts
└── public/            # Static assets
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run compile` - Compile smart contracts
- `npm run deploy` - Deploy to Scroll Sepolia
- `npm run verify` - Verify contracts on ScrollScan

## 🌐 Network Configuration

### Scroll Sepolia Testnet
- **Chain ID**: 534351
- **RPC URL**: https://sepolia-rpc.scroll.io
- **Explorer**: https://sepolia.scrollscan.com
- **Testnet Faucet**: https://sepolia-faucet.scroll.io

## 📱 Usage

### For Investors
1. **Connect Wallet**: Click "Connect" and select MetaMask
2. **Browse Farms**: View available coffee farms on the homepage
3. **Make Investment**: Choose between tree purchase or vault investment
4. **Manage Portfolio**: Visit dashboard to track investments and claim rewards

### For Admins
1. **Access Admin Panel**: Navigate to `/admin`
2. **Create Farm**: Fill out farm details and deploy
3. **Monitor Activity**: Track farm statistics and investor activity
4. **Distribute Yield**: Manage coffee production payouts

## 🔒 Security

- **Audited Smart Contracts**: All contracts follow OpenZeppelin standards
- **Access Controls**: Admin functions protected by ownership modifiers
- **Reentrancy Protection**: Critical functions protected against reentrancy attacks
- **Pausable Contracts**: Emergency stop functionality for all contracts

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact: [Your Contact Information]

## 🎯 Roadmap

- [ ] Oracle integration for real-time farm data
- [ ] Mobile app development
- [ ] Cross-chain deployment (Polygon, Lisk)
- [ ] Advanced analytics dashboard
- [ ] Insurance integration
- [ ] NFT marketplace for coffee trees

---

**Built with ❤️ for the future of sustainable coffee farming**