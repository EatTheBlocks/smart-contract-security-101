const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleToken", function () {
  let deployer, attacker, user;

  beforeEach(async function () {
    [deployer, attacker, user] = await ethers.getSigners();

    const SimpleToken = await ethers.getContractFactory("SimpleToken", deployer);
    this.simpleToken = await SimpleToken.deploy(1000);
  });

  it("Should allow a user to transfer amounts smaller than or equal to its balance", async function () {
    await this.simpleToken.transfer(user.address, 1);

    expect(await this.simpleToken.balanceOf(user.address)).to.eq(1);
    expect(await this.simpleToken.balanceOf(deployer.address)).to.eq((await this.simpleToken.totalSupply()) - 1);
  });

  it("Should revert if the user tries to transfer an amount greater than its balance", async function () {
    await this.simpleToken.transfer(attacker.address, 10);
    await expect(this.simpleToken.connect(attacker).transfer(user.address, 11)).to.be.revertedWith("Not enough tokens");
  });

  it.skip("Should overflow if an attacker transfer an amount greater than its balance", async function () {
    await this.simpleToken.transfer(attacker.address, 10);

    const initialAttackerBalance = await this.simpleToken.balanceOf(attacker.address);
    console.log(`Initital attacker balance: ${initialAttackerBalance.toString()} tokens`);

    await this.simpleToken.connect(attacker).transfer(user.address, 11);

    const finalAttackerBalance = await this.simpleToken.balanceOf(attacker.address);
    console.log(`Final attacker balance: ${finalAttackerBalance.toString()} tokens`);

    expect(await this.simpleToken.balanceOf(attacker.address)).to.eq(ethers.constants.MaxUint256);
  });
});
