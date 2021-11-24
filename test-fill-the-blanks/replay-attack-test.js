const { expect } = require("chai");
const { providers } = require("ethers");
const { ethers } = require("hardhat");

describe("Replay Attack", function () {
  let deployer, attacker, wallet;

  beforeEach(async function () {
    [deployer, attacker] = await ethers.getSigners();

    wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");

    const ReplayVictim = await ethers.getContractFactory("ReplayVictim", deployer);
    this.replayVictim = await ReplayVictim.deploy();
  });

  describe("ReplayVictim", function () {
    it("Should allow the owner to change X", async function () {
        //...
    });
  });
});
