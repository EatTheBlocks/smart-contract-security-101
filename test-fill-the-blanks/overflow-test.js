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
    //...
  });
});
