const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Use the real Sepolia USDC faucet address
  const usdcAddress = "0x65aFADD39029741B3b8f0756952C74678c9cEC93";

  // Deploy Fundraising with USDC address
  const Fundraising = await ethers.getContractFactory("Fundraising");
  const fundraising = await Fundraising.deploy(usdcAddress);
  await fundraising.waitForDeployment();
  console.log("Fundraising deployed to:", await fundraising.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
