const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Access Control", () => {
  let deployer, attacker, user;

  beforeEach(async function () {
    [deployer, attacker, user] = await ethers.getSigners();

    const AgreedPrice = await ethers.getContractFactory("AgreedPrice", deployer);
    this.agreedPrice = await AgreedPrice.deploy(100);
  });

  describe("AgreedPrice", () => {
    it("Should set price at deployment", async function () {
      expect(await this.agreedPrice.price()).to.eq(100);
    });

    it("...");
  });
});
