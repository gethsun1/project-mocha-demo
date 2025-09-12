const { ethers } = require("hardhat");

async function main() {
  console.log("Starting Project Mocha deployment...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy MochaBeanToken first
  console.log("\n1. Deploying MochaBeanToken...");
  const MochaBeanToken = await ethers.getContractFactory("MochaBeanToken");
  const beanToken = await MochaBeanToken.deploy();
  await beanToken.waitForDeployment();
  console.log("MochaBeanToken deployed to:", await beanToken.getAddress());

  // Deploy MochaLandToken
  console.log("\n2. Deploying MochaLandToken...");
  const MochaLandToken = await ethers.getContractFactory("MochaLandToken");
  const landToken = await MochaLandToken.deploy(await beanToken.getAddress());
  await landToken.waitForDeployment();
  console.log("MochaLandToken deployed to:", await landToken.getAddress());

  // Deploy MochaTreeToken
  console.log("\n3. Deploying MochaTreeToken...");
  const MochaTreeToken = await ethers.getContractFactory("MochaTreeToken");
  const treeToken = await MochaTreeToken.deploy(await landToken.getAddress(), await beanToken.getAddress());
  await treeToken.waitForDeployment();
  console.log("MochaTreeToken deployed to:", await treeToken.getAddress());

  // Deploy MochaVault
  console.log("\n4. Deploying MochaVault...");
  const MochaVault = await ethers.getContractFactory("MochaVault");
  const vault = await MochaVault.deploy(await beanToken.getAddress(), await landToken.getAddress(), await treeToken.getAddress());
  await vault.waitForDeployment();
  console.log("MochaVault deployed to:", await vault.getAddress());

  // Deploy FarmManager
  console.log("\n5. Deploying FarmManager...");
  const FarmManager = await ethers.getContractFactory("FarmManager");
  const farmManager = await FarmManager.deploy(
    await landToken.getAddress(),
    await treeToken.getAddress(),
    await beanToken.getAddress(),
    await vault.getAddress()
  );
  await farmManager.waitForDeployment();
  console.log("FarmManager deployed to:", await farmManager.getAddress());

  // Set up permissions
  console.log("\n6. Setting up permissions...");
  
  // Set farm manager in all contracts
  await beanToken.setFarmManager(await farmManager.getAddress());
  await landToken.setFarmManager(await farmManager.getAddress());
  await treeToken.setFarmManager(await farmManager.getAddress());
  await vault.setFarmManager(await farmManager.getAddress());
  
  // Set vault contract in bean token
  await beanToken.setVaultContract(await vault.getAddress());
  
  console.log("Permissions configured successfully!");

  // Create a sample farm for testing
  console.log("\n7. Creating sample farm...");
  const sampleFarmTx = await farmManager.createFarm(
    deployer.address, // farmer
    "Sample Coffee Farm",
    "Ethiopia, Yirgacheffe",
    "6.8417,38.2051",
    10000, // 10,000 sq meters
    2000, // 2000 trees capacity
    "https://metadata.projectmocha.com/farm/1",
    1200, // 12% APY
    157788000, // 5 years maturity
    BigInt(100) * BigInt(10**18), // $100 min investment
    BigInt(2000) * BigInt(10**18) // $2000 max investment
  );
  await sampleFarmTx.wait();
  console.log("Sample farm created!");

  // Summary
  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log("Network: Scroll Sepolia");
  console.log("Deployer:", deployer.address);
  console.log("\nContract Addresses:");
  console.log("MochaBeanToken (MBT):", await beanToken.getAddress());
  console.log("MochaLandToken (MLT):", await landToken.getAddress());
  console.log("MochaTreeToken (MTT):", await treeToken.getAddress());
  console.log("MochaVault (MTTR):", await vault.getAddress());
  console.log("FarmManager:", await farmManager.getAddress());
  
  console.log("\n=== VERIFICATION COMMANDS ===");
  console.log(`npx hardhat verify --network scrollSepolia ${await beanToken.getAddress()}`);
  console.log(`npx hardhat verify --network scrollSepolia ${await landToken.getAddress()} "${await beanToken.getAddress()}"`);
  console.log(`npx hardhat verify --network scrollSepolia ${await treeToken.getAddress()} "${await landToken.getAddress()}" "${await beanToken.getAddress()}"`);
  console.log(`npx hardhat verify --network scrollSepolia ${await vault.getAddress()} "${await beanToken.getAddress()}" "${await landToken.getAddress()}" "${await treeToken.getAddress()}"`);
  console.log(`npx hardhat verify --network scrollSepolia ${await farmManager.getAddress()} "${await landToken.getAddress()}" "${await treeToken.getAddress()}" "${await beanToken.getAddress()}" "${await vault.getAddress()}"`);
  
  console.log("\nDeployment completed successfully! 🚀");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
