const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DoS", function () {
  let deployer, attacker, user;

  beforeEach(async function () {
    [deployer, attacker, user] = await ethers.getSigners();

    const AuctionV2 = await ethers.getContractFactory("AuctionV2", deployer);
    this.auctionV2 = await AuctionV2.deploy();

    this.auctionV2.bid({ value: 100 });
  });

  describe("Auction", function () {

    describe("if bid is lower than highestBid", function () {
      it("Should NOT accept bids lower than current", async function () {
        await expect(this.auction.connect(user).bid({ value: 50 })).to.be.revertedWith("Bid not high enough");
      });

      it("...");
    });
  });
});
