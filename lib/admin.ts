// Admin configuration and utilities

// Define admin addresses - you can add more admin addresses here
export const ADMIN_ADDRESSES = [
  '0x842d803eB7d05D6Aa2DdB8c3Eb912e6d97ce31C4', // Deployer/Admin address
  '0xc4110712cef3e62b628e414ebcc4fc0343c2fe4c', // Added admin wallet
  // Add more admin addresses as needed
]

/**
 * Check if a given address is an admin
 * @param address - The wallet address to check
 * @returns boolean - True if the address is an admin
 */
export function isAdminAddress(address: string | undefined): boolean {
  if (!address) return false
  
  // Convert both addresses to lowercase for comparison
  const addressLower = address.toLowerCase()
  const adminAddressesLower = ADMIN_ADDRESSES.map(addr => addr.toLowerCase())
  
  console.log('isAdminAddress check:', {
    address,
    addressLower,
    adminAddresses: ADMIN_ADDRESSES,
    adminAddressesLower,
    includes: adminAddressesLower.includes(addressLower)
  })
  
  return adminAddressesLower.includes(addressLower)
}

/**
 * Get admin addresses for display purposes
 * @returns string[] - Array of admin addresses
 */
export function getAdminAddresses(): string[] {
  return ADMIN_ADDRESSES
}
