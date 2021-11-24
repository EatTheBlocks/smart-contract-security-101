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
    
    it("...", async function(){

    });
  });
});