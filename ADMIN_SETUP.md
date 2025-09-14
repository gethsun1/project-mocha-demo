# Admin Setup Guide

## Adding Admin Addresses

To add or modify admin addresses in Project Mocha, edit the `lib/admin.ts` file:

```typescript
export const ADMIN_ADDRESSES = [
  '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // Your admin address
  '0x1234567890123456789012345678901234567890', // Another admin address
  // Add more admin addresses as needed
]
```

## How Admin Access Works

1. **Admin Menu Visibility**: The "Admin" menu item only appears in the navigation when a connected wallet address matches one of the admin addresses.

2. **Components Affected**:
   - Header navigation (desktop and mobile)
   - Footer links
   - Hero section buttons

3. **Admin Features**: Only admin addresses can:
   - Access the `/admin` page UI
   - See admin-related UI elements
   - Create and manage farms in UI

   Note: On-chain admin privileges (calling `onlyOwner` functions like `createFarm`, `distributeYield`, `pause`, `unpause`) require the wallet to be the owner of the respective contract(s), not just in the UI admin list.

## Getting Your Wallet Address

1. Connect your wallet to the application
2. Copy your wallet address from the connected wallet display
3. Add it to the `ADMIN_ADDRESSES` array in `lib/admin.ts`
4. Restart the development server

## Security Notes

- Admin addresses are case-insensitive (automatically converted to lowercase)
- Changes require a server restart to take effect
- Consider using environment variables for production deployments

## Transferring On-chain Ownership (Hardhat)

To grant on-chain admin rights to a wallet (ability to call `onlyOwner` functions), transfer ownership of the relevant contract(s) to that wallet.

We provide a script `scripts/transfer-ownership.js`.

Prerequisites:
- Ensure the signer (the wallet running the script) is the current owner of the contract(s).
- Set env vars for the new owner and contract addresses.

Examples:

```bash
NEW_OWNER=0xc4110712cef3e62b628e414ebcc4fc0343c2fe4c \
FARM_MANAGER_ADDRESS=0x8123E32f4b5240B4B77355c3E5D08EA9253bf51B \
npx hardhat run scripts/transfer-ownership.js --network scrollSepolia | cat
```

Optionally include other contracts:

```bash
NEW_OWNER=0x... \
FARM_MANAGER_ADDRESS=0x... \
LAND_TOKEN_ADDRESS=0x... \
TREE_TOKEN_ADDRESS=0x... \
VAULT_ADDRESS=0x... \
BEAN_TOKEN_ADDRESS=0x... \
npx hardhat run scripts/transfer-ownership.js --network scrollSepolia | cat
```

Behavior:
- Skips any contract without an address provided.
- Verifies the signer is the current owner before attempting transfer.
- Skips if already owned by the target wallet.
