const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Weak Randomness", function () {
  let deployer, attacker, user;

  beforeEach(async function () {
    [deployer, attacker, user] = await ethers.getSigners();

    const Lottery = await ethers.getContractFactory("Lottery", deployer);
    this.lottery = await Lottery.deploy();

    const LotteryAttacker = await ethers.getContractFactory("LotteryAttacker", attacker);
    this.lotteryAttacker = await LotteryAttacker.deploy(this.lottery.address);
  });

  describe("Lottery", function () {
    describe("With bets open", function () {
      it("Should allow a user to place a bet", async function () {
        await this.lottery.placeBet(5, { value: ethers.utils.parseEther("10") });
        expect(await this.lottery.bets(deployer.address)).to.eq(5);
      });
      it("...", async function () {
      });
    });
  });
});
