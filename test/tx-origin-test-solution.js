const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Tx.origin", function () {
  let deployer, attacker, user;

  beforeEach(async function () {
    [deployer, attacker, user] = await ethers.getSigners();

    const SmallWallet = await ethers.getContractFactory("SmallWallet", deployer);
    this.smallWallet = await SmallWallet.deploy();

    await deployer.sendTransaction({ to: this.smallWallet.address, value: 10000 });

    const AttackerContract = await ethers.getContractFactory("Attacker", attacker);
    this.attackerContract = await AttackerContract.deploy(this.smallWallet.address);
  });

  describe("SmallWallet", function () {
    it("Should accept deposits", async function () {
      expect(await ethers.provider.getBalance(this.smallWallet.address)).to.eq(10000);
    });

    it("Should allow the owner to execute withdrawAll", async function () {
      const initialUserBalance = await ethers.provider.getBalance(user.address);

      await this.smallWallet.withdrawAll(user.address);

      expect(await ethers.provider.getBalance(this.smallWallet.address)).to.eq(0);
      expect(await ethers.provider.getBalance(user.address)).to.eq(initialUserBalance.add(10000));
    });

    it("Should revert if withdrawAll is called from any other account than the owner", async function () {
      await expect(this.smallWallet.connect(attacker).withdrawAll(attacker.address)).to.be.revertedWith("Caller not authorized");
    });
  });

  describe("Attack", function () {
    it("Should drain the victim out if smallWallet's owner sends ether", async function () {
      const initialAttackerBalance = await ethers.provider.getBalance(attacker.address);
      await deployer.sendTransaction({ to: this.attackerContract.address, value: 1 });

      expect(await ethers.provider.getBalance(this.smallWallet.address)).to.eq(0);
      expect(await ethers.provider.getBalance(attacker.address)).to.eq(initialAttackerBalance.add(10000));
    });
  });
});
