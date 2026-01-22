import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  if (!deployer) {
    throw new Error("No deployer account found. Make sure you have accounts configured in hardhat.config.ts");
  }
  
  console.log("Deploying with:", deployer.address);

  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(deployer.address);
  await escrow.waitForDeployment();

  const escrowAddress = await escrow.getAddress();
  console.log("Escrow deployed:", escrowAddress);

  const Vault = await ethers.getContractFactory("Vault");
  const vault = await Vault.deploy(escrowAddress);
  await vault.waitForDeployment();

  const vaultAddress = await vault.getAddress();
  console.log("Vault deployed:", vaultAddress);

  // write deployed.json
  const deployed = {
    network: "cronosTestnet",
    chainId: 338,
    escrow: escrowAddress,
    vault: vaultAddress,
  };

  const outPath = path.join(__dirname, "..", "deployed.json");
  fs.writeFileSync(outPath, JSON.stringify(deployed, null, 2));
  console.log("Saved deployed.json ->", outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});