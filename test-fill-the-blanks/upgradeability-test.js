const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Upgradable Proxy Pattern", function () {
  let deployer, user;

  beforeEach(async function () {
    [deployer, user] = await ethers.getSigners();

    const LogicV1 = await ethers.getContractFactory("LogicV1", deployer);
    this.logicV1 = await LogicV1.deploy();

    const Proxy = await ethers.getContractFactory("Proxy", deployer);
    this.proxy = await Proxy.deploy(this.logicV1.address);

    const LogicV2 = await ethers.getContractFactory("LogicV2", deployer);
    this.logicV2 = await LogicV2.deploy();

    this.proxyPattern = await ethers.getContractAt("LogicV1", this.proxy.address);
    this.proxyPattern2 = await ethers.getContractAt("LogicV2", this.proxy.address);
  });

  describe("Proxy", function () {
    it("Should return the address of LogicV1 when calling logicContract()", async function () {
      expect(await this.proxy.logicContract()).to.eq(this.logicV1.address);
    });
    it("...", async function () {
    });
  });
});
