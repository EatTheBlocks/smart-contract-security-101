const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Vault", function () {
  let deployer, attacker;

  beforeEach(async function () {
    [deployer, attacker] = await ethers.getSigners();

    const Vault = await ethers.getContractFactory("Vault", deployer);
    this.vault = await Vault.deploy(ethers.utils.formatBytes32String("myPassword"));

    await this.vault.deposit({ value: ethers.utils.parseEther("100") });
  });

  it("Should be possible to access to its private variables", async function () {
    const initialBalanceContract = await ethers.provider.getBalance(this.vault.address);
    const initialBalanceAttacker = await ethers.provider.getBalance(attacker.address);

    //...
  });
});
