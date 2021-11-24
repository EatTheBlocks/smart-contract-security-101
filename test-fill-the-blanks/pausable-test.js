const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EmergencyStop", function () {
  let deployer, attacker, user;

  beforeEach(async function () {
    [deployer, attacker, user] = await ethers.getSigners();

    const ReentrancyEmergencyStop = await ethers.getContractFactory("ReentrancyEmergencyStop", deployer);
    this.reentrancyESVictim = await ReentrancyEmergencyStop.deploy();
    this.reentrancyESAttacker = await ReentrancyAttacker.deploy(this.reentrancyESVictim.address);

    await this.reentrancyESVictim.deposit({ value: ethers.utils.parseEther("100") });
  });

  it("pausable contract test", async function () {
  });
});
