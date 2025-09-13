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
   - Access the `/admin` page
   - See admin-related UI elements
   - Create and manage farms

## Getting Your Wallet Address

1. Connect your wallet to the application
2. Copy your wallet address from the connected wallet display
3. Add it to the `ADMIN_ADDRESSES` array in `lib/admin.ts`
4. Restart the development server

## Security Notes

- Admin addresses are case-insensitive (automatically converted to lowercase)
- Changes require a server restart to take effect
- Consider using environment variables for production deployments
