// Usage examples:
//   NEW_OWNER=0xc4110712cef3e62b628e414ebcc4fc0343c2fe4c FARM_MANAGER_ADDRESS=0x8123E32f4b5240B4B77355c3E5D08EA9253bf51B npx hardhat run scripts/transfer-ownership.js --network scrollSepolia | cat
//   NEW_OWNER=0x... FARM_MANAGER_ADDRESS=0x... LAND_TOKEN_ADDRESS=0x... TREE_TOKEN_ADDRESS=0x... VAULT_ADDRESS=0x... BEAN_TOKEN_ADDRESS=0x... npx hardhat run scripts/transfer-ownership.js --network scrollSepolia | cat

const { ethers } = require("hardhat");

function getEnv(name, required = false) {
  const value = process.env[name];
  if (required && (!value || value.trim() === "")) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function isAddress(addr) {
  return typeof addr === "string" && /^0x[a-fA-F0-9]{40}$/.test(addr);
}

async function transferContractOwnership(label, contractName, address, newOwner, signer) {
  if (!address) {
    console.log(`- Skipping ${label}: no address provided`);
    return { label, skipped: true };
  }
  if (!isAddress(address)) {
    throw new Error(`${label} address is invalid: ${address}`);
  }

  console.log(`\n>>> Processing ${label} at ${address}`);
  const contract = await ethers.getContractAt(contractName, address);
  const currentOwner = await contract.owner();
  console.log(`Current owner: ${currentOwner}`);

  const signerAddr = await signer.getAddress();
  if (currentOwner.toLowerCase() !== signerAddr.toLowerCase()) {
    console.log(`- Skipping ${label}: signer ${signerAddr} is not current owner`);
    return { label, skipped: true, reason: "not_owner", currentOwner };
  }

  if (currentOwner.toLowerCase() === newOwner.toLowerCase()) {
    console.log(`- Skipping ${label}: already owned by ${newOwner}`);
    return { label, skipped: true, reason: "already_owner", currentOwner };
  }

  const tx = await contract.transferOwnership(newOwner);
  console.log(`- Sent transferOwnership tx: ${tx.hash}`);
  await tx.wait();
  const afterOwner = await contract.owner();
  console.log(`- New owner: ${afterOwner}`);
  return { label, skipped: false, txHash: tx.hash, newOwner: afterOwner };
}

async function main() {
  console.log("Starting ownership transfer...");

  const newOwner = getEnv("NEW_OWNER", true);
  if (!isAddress(newOwner)) {
    throw new Error(`NEW_OWNER is not a valid address: ${newOwner}`);
  }

  const farmManagerAddress = getEnv("FARM_MANAGER_ADDRESS", false);
  const landTokenAddress = getEnv("LAND_TOKEN_ADDRESS", false);
  const treeTokenAddress = getEnv("TREE_TOKEN_ADDRESS", false);
  const vaultAddress = getEnv("VAULT_ADDRESS", false);
  const beanTokenAddress = getEnv("BEAN_TOKEN_ADDRESS", false);

  const [signer] = await ethers.getSigners();
  console.log("Signer:", await signer.getAddress());

  const results = [];
  // FarmManager (primary for createFarm/distributeYield)
  results.push(
    await transferContractOwnership(
      "FarmManager",
      "FarmManager",
      farmManagerAddress,
      newOwner,
      signer
    )
  );

  // Optional: other contracts if addresses are provided
  results.push(
    await transferContractOwnership(
      "MochaLandToken",
      "MochaLandToken",
      landTokenAddress,
      newOwner,
      signer
    )
  );

  results.push(
    await transferContractOwnership(
      "MochaTreeToken",
      "MochaTreeToken",
      treeTokenAddress,
      newOwner,
      signer
    )
  );

  results.push(
    await transferContractOwnership(
      "MochaVault",
      "MochaVault",
      vaultAddress,
      newOwner,
      signer
    )
  );

  results.push(
    await transferContractOwnership(
      "MochaBeanToken",
      "MochaBeanToken",
      beanTokenAddress,
      newOwner,
      signer
    )
  );

  console.log("\nSummary:", results);
  console.log("\nDone.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });


