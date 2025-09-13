const { ethers } = require("hardhat");

async function main() {
  console.log("Testing farm configuration...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Contract addresses
  const LAND_TOKEN_ADDRESS = "0x289FdEE84aF11DD000Be62C55bC44B1e754681DB";
  const FARM_MANAGER_ADDRESS = "0x8123E32f4b5240B4B77355c3E5D08EA9253bf51B";
  const MBT_ADDRESS = "0x868BE05289CC245be73e8A461597893f6cb55b70";

  // Connect to contracts
  const landToken = await ethers.getContractAt("MochaLandToken", LAND_TOKEN_ADDRESS);
  const farmManager = await ethers.getContractAt("FarmManager", FARM_MANAGER_ADDRESS);
  const mbtToken = await ethers.getContractAt("MochaBeanToken", MBT_ADDRESS);

  try {
    // Get total farms
    const totalFarms = await landToken.getTotalFarms();
    console.log(`\n📊 Total Farms: ${totalFarms}`);

    if (totalFarms === 0) {
      console.log("❌ No farms found! Please create a farm first.");
      return;
    }

    // Test each farm
    for (let i = 1; i <= totalFarms; i++) {
      console.log(`\n🌱 Testing Farm #${i}:`);
      
      try {
        // Get farm data
        const farmData = await landToken.getFarmData(i);
        console.log(`  Name: ${farmData.name}`);
        console.log(`  Location: ${farmData.location}`);
        console.log(`  Active: ${farmData.isActive}`);
        console.log(`  Current Trees: ${farmData.currentTrees}`);
        console.log(`  Tree Capacity: ${farmData.treeCapacity}`);
        console.log(`  Available Capacity: ${farmData.treeCapacity - farmData.currentTrees}`);

        // Get farm stats
        const stats = await farmManager.getFarmStats(i);
        console.log(`  Total Investment: ${ethers.formatEther(stats[0])} MBT`);
        console.log(`  Total Trees: ${stats[1]}`);
        console.log(`  Investor Count: ${stats[2]}`);

        // Test if farm can accept investments
        if (!farmData.isActive) {
          console.log(`  ❌ Farm is not active`);
        } else if (farmData.currentTrees >= farmData.treeCapacity) {
          console.log(`  ❌ Farm is at full capacity`);
        } else {
          console.log(`  ✅ Farm is ready for investments`);
        }

      } catch (error) {
        console.log(`  ❌ Error reading farm #${i}: ${error.message}`);
      }
    }

    // Test user balance
    console.log(`\n💰 User MBT Balance: ${ethers.formatEther(await mbtToken.balanceOf(deployer.address))} MBT`);

    // Test a small purchase (simulation)
    console.log(`\n🧪 Testing purchase simulation...`);
    try {
      // This will fail but give us error details
      await farmManager.purchaseTrees(1, 1, { gasLimit: 1000000 });
      console.log("✅ Purchase simulation succeeded!");
    } catch (error) {
      console.log(`❌ Purchase simulation failed: ${error.message}`);
      
      // Try to decode the error
      if (error.data) {
        console.log(`Error data: ${error.data}`);
      }
    }

  } catch (error) {
    console.error("Error testing farms:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
