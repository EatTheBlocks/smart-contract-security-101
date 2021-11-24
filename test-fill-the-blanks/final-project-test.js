const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Final Project", function () {
  let deployer, user, user_2;

  beforeEach(async function () {
    [deployer, user, user_2] = await ethers.getSigners();

    const EtbToken = await ethers.getContractFactory("ETBToken", deployer);
    this.etbToken = await EtbToken.deploy(ethers.utils.parseEther("1000"));

    const EtbDex = await ethers.getContractFactory("EtbDex", deployer);
    this.etbDex = await EtbDex.deploy(this.etbToken.address, ethers.utils.formatBytes32String("eatTheBlocks"));

    await this.etbDex.setFee(1, ethers.utils.formatBytes32String("eatTheBlocks"));
    await this.etbToken.setDexAddress(this.etbDex.address);
    await this.etbToken.approve(this.etbDex.address, ethers.utils.parseEther("1000"));
  });

  describe("ETB Token", function () {
    it("totalSupply should match Initial supply", async function () {
      expect(await this.etbToken.totalSupply()).to.eq(ethers.utils.parseEther("1000"));
    });
    // 😃 Let's test every path for every function!
    describe("setDexAddress function", function () {
      it("...");
    });
  });
  describe("EtbDex", function () {
    it("...");
  });
});
