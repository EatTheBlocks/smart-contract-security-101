const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Reentrancy", function () {
  let deployer, user, attacker;

  beforeEach(async function () {
    [deployer, user, attacker] = await ethers.getSigners();

    const SavingsAccountV2 = await ethers.getContractFactory("SavingsAccountV2", deployer);
    this.savingsAccountV2 = await SavingsAccountV2.deploy();

    await this.savingsAccountV2.deposit({ value: ethers.utils.parseEther("100") });
    await this.savingsAccountV2.connect(user).deposit({ value: ethers.utils.parseEther("50") });

    const InvestorV2 = await ethers.getContractFactory("InvestorV2", attacker);
    this.investorV2 = await InvestorV2.deploy(this.savingsAccountV2.address);
  });

  describe("SavingsAccountV2", function () {
    it("Should accept deposits", async function () {
      const deployerBalance = await this.savingsAccountV2.balanceOf(deployer.address);
      expect(deployerBalance).to.eq(ethers.utils.parseEther("100"));

      const userBalance = await this.savingsAccountV2.balanceOf(user.address);
      expect(userBalance).to.eq(ethers.utils.parseEther("50"));
    });

    it("...", async function(){

    });
  });
});
