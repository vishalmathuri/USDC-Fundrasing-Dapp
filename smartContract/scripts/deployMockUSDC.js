const hre = require("hardhat");

async function main() {
  const USDC = await hre.ethers.getContractFactory("MockUSDC");
  const usdc = await USDC.deploy();
  await usdc.waitForDeployment();

  console.log("✅ Mock USDC deployed at:", usdc.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
