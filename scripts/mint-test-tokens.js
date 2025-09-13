const { ethers } = require("hardhat");

async function main() {
  console.log("Minting test MBT tokens for users...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Contract addresses
  const MBT_ADDRESS = "0x868BE05289CC245be73e8A461597893f6cb55b70";
  const FARM_MANAGER_ADDRESS = "0x8123E32f4b5240B4B77355c3E5D08EA9253bf51B";

  // Connect to contracts
  const mbtContract = await ethers.getContractAt("MochaBeanToken", MBT_ADDRESS);
  const farmManagerContract = await ethers.getContractAt("FarmManager", FARM_MANAGER_ADDRESS);

  // Test addresses to mint tokens for (replace with actual user addresses)
  const testAddresses = [
    "0x842d803eB7d05D6Aa2DdB8c3Eb912e6d97ce31C4", // Replace with actual user addresses
    // Add more addresses as needed
  ];

  const amountPerUser = ethers.parseEther("1000"); // 1000 MBT per user

  for (const address of testAddresses) {
    try {
      console.log(`\nMinting ${ethers.formatEther(amountPerUser)} MBT for ${address}...`);
      
      // Check current balance
      const currentBalance = await mbtContract.balanceOf(address);
      console.log(`Current balance: ${ethers.formatEther(currentBalance)} MBT`);

      // Mint tokens (this requires the contract to have minting permissions)
      const tx = await mbtContract.mintCoffeeProduction(address, amountPerUser);
      await tx.wait();
      
      console.log(`✅ Successfully minted ${ethers.formatEther(amountPerUser)} MBT for ${address}`);
      console.log(`Transaction hash: ${tx.hash}`);
      
      // Verify new balance
      const newBalance = await mbtContract.balanceOf(address);
      console.log(`New balance: ${ethers.formatEther(newBalance)} MBT`);
      
    } catch (error) {
      console.error(`❌ Error minting for ${address}:`, error.message);
    }
  }

  console.log("\n=== Token Distribution Complete ===");
  console.log("Users can now purchase coffee trees with their MBT tokens!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
