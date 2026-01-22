const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying contracts to Cronos Testnet...");

  // Deploy SimpleVault
  const SimpleVault = await ethers.getContractFactory("SimpleVault");
  const vault = await SimpleVault.deploy();
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("SimpleVault deployed to:", vaultAddress);

  // Deploy SimpleEscrow
  const SimpleEscrow = await ethers.getContractFactory("SimpleEscrow");
  const escrow = await SimpleEscrow.deploy();
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log("SimpleEscrow deployed to:", escrowAddress);

  // Update .env files
  const fs = require('fs');
  const path = require('path');
  
  // Update backend .env
  const backendEnvPath = path.join(__dirname, '../../backend/.env');
  let backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
  backendEnv = backendEnv.replace(/VAULT_ADDRESS=.*/g, `VAULT_ADDRESS=${vaultAddress}`);
  backendEnv = backendEnv.replace(/ESCROW_ADDRESS=.*/g, `ESCROW_ADDRESS=${escrowAddress}`);
  fs.writeFileSync(backendEnvPath, backendEnv);
  
  // Update frontend constants
  const constantsPath = path.join(__dirname, '../../frontend/src/utils/constants.ts');
  let constants = fs.readFileSync(constantsPath, 'utf8');
  constants = constants.replace(/VAULT_CONTRACT_ADDRESS = '.*'/g, `VAULT_CONTRACT_ADDRESS = '${vaultAddress}'`);
  constants = constants.replace(/ESCROW_CONTRACT_ADDRESS = '.*'/g, `ESCROW_CONTRACT_ADDRESS = '${escrowAddress}'`);
  fs.writeFileSync(constantsPath, constants);

  console.log("✅ Contract addresses updated in .env and constants files");
  console.log("Vault Address:", vaultAddress);
  console.log("Escrow Address:", escrowAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });