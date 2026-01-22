const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying SimpleEscrow contract to Cronos Testnet...");

  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "CRO");
  
  if (balance === 0n) {
    throw new Error("Deployer account has no CRO for gas fees");
  }

  // Deploy SimpleEscrow using fully qualified name
  const SimpleEscrow = await ethers.getContractFactory("contracts/SimpleEscrow.sol:SimpleEscrow", deployer);
  const escrow = await SimpleEscrow.deploy();
  await escrow.waitForDeployment();
  
  const escrowAddress = await escrow.getAddress();
  console.log("SimpleEscrow deployed to:", escrowAddress);

  // Update constants file
  const fs = require('fs');
  const path = require('path');
  
  const constantsPath = path.join(__dirname, '../../frontend/src/utils/constants.ts');
  let constants = fs.readFileSync(constantsPath, 'utf8');
  constants = constants.replace(/ESCROW_CONTRACT_ADDRESS = '.*'/g, `ESCROW_CONTRACT_ADDRESS = '${escrowAddress}'`);
  fs.writeFileSync(constantsPath, constants);

  console.log("✅ Escrow contract deployed and constants updated!");
  console.log("Escrow Address:", escrowAddress);
  console.log("Explorer:", `https://cronos.org/explorer/testnet3/address/${escrowAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });