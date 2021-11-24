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

  describe.skip("Auction", function () {
    describe("if bid is lower than highestBid", function () {
      it("Should NOT accept bids lower than current", async function () {
        await expect(this.auction.connect(user).bid({ value: 50 })).to.be.revertedWith("Bid not high enough");
      });
    });
    describe("if bid is higher than highestBid", function () {
      it("Should accept it and update highestBid", async function () {
        await this.auction.connect(user).bid({ value: 150 });
        expect(await this.auction.highestBid()).to.eq(150);
      });
      it("Should make msg.sender currentLeader", async function () {
        await this.auction.connect(user).bid({ value: 150 });
        expect(await this.auction.currentLeader()).to.eq(user.address);
      });
      it("Should add previous leader and highestBid to refunds", async function () {
        await this.auction.connect(user).bid({ value: 150 });
        [addr, amount] = await this.auction.refunds(0);
        expect(addr).to.eq(deployer.address);
        expect(amount).to.eq(100);
      });
    });
    describe("When calling refundAll()", function () {
      it("Should refund the bidders that didn't win", async function () {
        await this.auction.connect(user).bid({ value: 150 });
        await this.auction.bid({ value: 200 });

        const userBalanceBefore = await ethers.provider.getBalance(user.address);
        await this.auction.refundAll();
        const userBalanceAfter = await ethers.provider.getBalance(user.address);

        expect(userBalanceAfter).to.eq(userBalanceBefore.add(150));
      });
      it("Should revert if the amount of computation hits the block gas limit", async function () {
        for (let i = 0; i < 1500; i++) {
          await this.auction.connect(attacker).bid({ value: 150 + i });
        }
        await this.auction.refundAll();
      });
    });
  });

  describe("AuctionV2", function () {
    describe("Pull over push solution", function () {
      it("A user should be able to be refunded for a small number of bids", async function () {
        await this.auctionV2.connect(user).bid({ value: ethers.utils.parseEther("1") });

        await this.auctionV2.bid({ value: ethers.utils.parseEther("2") });

        const userBalanceBefore = await ethers.provider.getBalance(user.address);

        await this.auctionV2.connect(user).withdrawRefund();

        const userBalanceAfter = await ethers.provider.getBalance(user.address);

        expect(userBalanceAfter).to.be.gt(userBalanceBefore);
      });
      it("A user should be able to be refunded for a very large number of bids", async function () {
        for (let i = 0; i < 1500; i++) {
          await this.auctionV2.connect(user).bid({ value: ethers.utils.parseEther("0.0001") + i });
        }

        const userBalanceBefore = await ethers.provider.getBalance(user.address);

        await this.auctionV2.connect(user).withdrawRefund();

        const userBalanceAfter = await ethers.provider.getBalance(user.address);

        expect(userBalanceAfter).to.be.gt(userBalanceBefore);
      });
    });
  });
});
