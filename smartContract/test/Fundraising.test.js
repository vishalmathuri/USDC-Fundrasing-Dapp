const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Fundraising Contract", function () {
  let fundraising, mockUSDC;
  let owner, donor, other;

  beforeEach(async () => {
    [owner, donor, other] = await ethers.getSigners();

    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy();
    await mockUSDC.waitForDeployment();

    const Fundraising = await ethers.getContractFactory("Fundraising");
    fundraising = await Fundraising.deploy(await mockUSDC.getAddress());
    await fundraising.waitForDeployment();

    await mockUSDC.mint(donor.address, ethers.parseUnits("100", 6));
    await mockUSDC.mint(other.address, ethers.parseUnits("100", 6));
  });

  async function createCampaign() {
    const campaignRequest = {
      name: "Clean Water",
      description: "Provide clean water",
      goal: ethers.parseUnits("50", 6),
      minDonation: ethers.parseUnits("10", 6),
      duration: 5, // 5 seconds for test
      beneficiary: owner.address,
      image: ""
    };
    await fundraising.connect(owner).createCampaign(campaignRequest);
  }

  it("1. should create a campaign successfully", async () => {
    await createCampaign();
    const campaign = await fundraising.getCampaign(0);
    expect(campaign.name).to.equal("Clean Water");
    expect(campaign.goal).to.equal(ethers.parseUnits("50", 6));
    expect(campaign.beneficiary).to.equal(owner.address);
  });

  it("2. should allow donation to a campaign", async () => {
    await createCampaign();
    await mockUSDC.connect(donor).approve(fundraising, ethers.parseUnits("20", 6));
    await fundraising.connect(donor).donate(0, ethers.parseUnits("20", 6));
    const campaign = await fundraising.getCampaign(0);
    expect(campaign.totalCollected).to.equal(ethers.parseUnits("20", 6));
  });

  it("3. should reject donation below minimum", async () => {
    await createCampaign();
    await mockUSDC.connect(donor).approve(fundraising, ethers.parseUnits("5", 6));
    await expect(
      fundraising.connect(donor).donate(0, ethers.parseUnits("5", 6))
    ).to.be.revertedWith("Donation below minimum");
  });

  it("4. should reject donation after deadline", async () => {
    await createCampaign();
    await mockUSDC.connect(donor).approve(fundraising, ethers.parseUnits("20", 6));
    await new Promise(resolve => setTimeout(resolve, 6000)); // wait 6 seconds
    await expect(
      fundraising.connect(donor).donate(0, ethers.parseUnits("20", 6))
    ).to.be.revertedWith("Campaign ended");
  });

  it("5. should allow creator to withdraw after reaching goal", async () => {
    await createCampaign();
    await mockUSDC.connect(donor).approve(fundraising, ethers.parseUnits("50", 6));
    await fundraising.connect(donor).donate(0, ethers.parseUnits("50", 6));

    await new Promise(resolve => setTimeout(resolve, 6000)); // wait until after deadline
    await fundraising.connect(owner).withdrawFunds(0);

    const campaign = await fundraising.getCampaign(0);
    expect(campaign.withdrawn).to.equal(true);
  });

  it("6. should not allow withdrawal before reaching goal", async () => {
    await createCampaign();
    await mockUSDC.connect(donor).approve(fundraising, ethers.parseUnits("20", 6));
    await fundraising.connect(donor).donate(0, ethers.parseUnits("20", 6));

    await new Promise(resolve => setTimeout(resolve, 6000)); // wait until after deadline
    await expect(fundraising.connect(owner).withdrawFunds(0)).to.be.revertedWith("Goal not met");
  });

  it("7. should allow refund after deadline if goal not met", async () => {
    await createCampaign();
    await mockUSDC.connect(donor).approve(fundraising, ethers.parseUnits("20", 6));
    await fundraising.connect(donor).donate(0, ethers.parseUnits("20", 6));

    await new Promise(resolve => setTimeout(resolve, 6000)); // wait until after deadline
    const before = await mockUSDC.balanceOf(donor.address);
    await fundraising.connect(donor).refund(0);
    const after = await mockUSDC.balanceOf(donor.address);
    expect(after).to.be.gt(before);
  });
});
