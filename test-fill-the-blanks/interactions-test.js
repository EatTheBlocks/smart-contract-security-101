const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SavingsAccount", function () {
  let deployer, user;

  beforeEach(async function () {
    [deployer, user] = await ethers.getSigners();

    const SavingsAccount = await ethers.getContractFactory("SavingsAccount", deployer);
    this.savingsAccount = await SavingsAccount.deploy();

    const Investor = await ethers.getContractFactory("Investor", deployer);
    this.investor = await Investor.deploy(this.savingsAccount.address);
  });

  describe("From an EOA", function () {
    it("Should be possible to deposit", async function () {
      expect(await this.savingsAccount.balanceOf(user.address)).to.eq(0);

      await this.savingsAccount.connect(user).deposit({ value: 100 });

      expect(await this.savingsAccount.balanceOf(user.address)).to.eq(100);
    });

    it("...", async function () {
    });
  });
});
