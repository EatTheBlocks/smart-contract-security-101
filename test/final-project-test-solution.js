const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Final Project", function () {
  let deployer, user, user_2;

  beforeEach(async function () {
    [deployer, user, user_2] = await ethers.getSigners();

    const EtbTokenSolution = await ethers.getContractFactory("EtbTokenV2", deployer);
    this.etbToken = await EtbTokenSolution.deploy(ethers.utils.parseEther("1000"));

    const EtbDex = await ethers.getContractFactory("EtbDexV2", deployer);
    this.etbDex = await EtbDex.deploy(this.etbToken.address);

    await this.etbDex.setFee(1);
    await this.etbToken.setDexAddress(this.etbDex.address);
    await this.etbToken.approve(this.etbDex.address, ethers.utils.parseEther("1000"));
  });

  describe("ETB Token", function () {
    it("totalSupply should match Initial supply", async function () {
      expect(await this.etbToken.totalSupply()).to.eq(ethers.utils.parseEther("1000"));
    });
    describe("Transfer Function", function () {
      it("Should allow to transfer tokens if enough balance", async function () {
        await this.etbToken.transfer(user.address, ethers.utils.parseEther("100"));
        expect(await this.etbToken.balanceOf(user.address)).to.eq(ethers.utils.parseEther("100"));
      });
      it("Should allow to transfer tokens", async function () {
        await this.etbToken.transfer(user.address, ethers.utils.parseEther("100"));
        expect(await this.etbToken.balanceOf(user.address)).to.eq(ethers.utils.parseEther("100"));
      });
      it("Shouldn't allow to transfer tokens if balance is not enough", async function () {
        await expect(this.etbToken.transfer(user.address, ethers.utils.parseEther("20000"))).to.be.revertedWith("Not enough balance");
      });
      it("Should not overflow", async function () {
        await this.etbToken.transfer(user.address, ethers.utils.parseEther("100"));
        await expect(this.etbToken.connect(user).transfer(deployer.address, ethers.utils.parseEther("110"))).to.be.reverted;
      });
    });
    describe("Approve Function", function () {
      it("Should allow to approve", async function () {
        await this.etbToken.approve(user.address, ethers.utils.parseEther("100"));
        expect(await this.etbToken.allowanceOf(deployer.address, user.address)).to.eq(ethers.utils.parseEther("100"));
      });
    });
    describe("TransferFrom Function", function () {
      it("Should allow authorized user to transfer on behalf of another", async function () {
        await this.etbToken.approve(user.address, ethers.utils.parseEther("100"));
        await this.etbToken.connect(user).transferFrom(deployer.address, user_2.address, ethers.utils.parseEther("50"));
        expect(await this.etbToken.balanceOf(user_2.address)).to.eq(ethers.utils.parseEther("50"));
      });
      it("Should not allow an unauthorized user to transfer on behalf of another", async function () {
        await expect(this.etbToken.connect(user).transferFrom(deployer.address, user_2.address, ethers.utils.parseEther("50"))).to.be.revertedWith(
          "ERC20: amount exceeds allowance"
        );
      });
      it("Should not allow an authorized user to transfer more than its allowance", async function () {
        await this.etbToken.approve(user.address, ethers.utils.parseEther("100"));
        await expect(this.etbToken.connect(user).transferFrom(deployer.address, user_2.address, ethers.utils.parseEther("150"))).to.be.revertedWith(
          "ERC20: amount exceeds allowance"
        );
      });
      it("Should set allowance correctly after transfer", async function () {
        await this.etbToken.approve(user.address, ethers.utils.parseEther("100"));
        await this.etbToken.connect(user).transferFrom(deployer.address, user_2.address, ethers.utils.parseEther("50"));
        expect(await this.etbToken.allowanceOf(deployer.address, user.address)).to.eq(ethers.utils.parseEther("50"));
      });
    });
  });
  describe("EtbDex", function () {
    describe("buyTokens function", function () {
      it("Should allow to buy tokens", async function () {
        await this.etbDex.connect(user).buyTokens({ value: ethers.utils.parseEther("100") });
        expect(await this.etbToken.balanceOf(user.address)).to.eq(ethers.utils.parseEther("99"));
      });
      it("Should revert if not sending eth", async function () {
        await expect(this.etbDex.connect(user).buyTokens()).to.be.revertedWith("Should send ETH to buy tokens");
      });
      it("Should revert if not enough tokens to sell", async function () {
        await expect(this.etbDex.connect(user).buyTokens({ value: ethers.utils.parseEther("2000") })).to.be.revertedWith("Not enough tokens to sell");
      });
    });
    describe("sellTokens function", function () {
      it("Should allow to sell tokens", async function () {
        await this.etbDex.connect(user).buyTokens({ value: ethers.utils.parseEther("100") });
        await this.etbDex.connect(user).sellTokens(ethers.utils.parseEther("50"));
        expect(await this.etbToken.balanceOf(user.address)).to.eq(ethers.utils.parseEther("49"));
        expect(await this.etbDex.withdrawals(user.address)).to.eq(ethers.utils.parseEther("50"));
      });
      it("Should revert if not enough tokens to sell", async function () {
        await expect(this.etbDex.connect(user).sellTokens(ethers.utils.parseEther("50"))).to.be.revertedWith("Not enough tokens");
      });
    });
    describe("setFee function", function () {
      it("Should allow the owner to set the Fee", async function () {
        await this.etbDex.setFee(2);
        expect(await this.etbDex.fee()).to.eq(2);
      });
      it("Should revert if an unauthorized user tries to change the fee", async function () {
        await expect(this.etbDex.connect(user).setFee(2)).to.be.reverted;
      });
    });
    describe("calculateFee function", function () {
      it("Should set the fee correctly", async function () {
        await this.etbDex.setFee(2);
        expect(await this.etbDex.fee()).to.eq(2);
        await this.etbDex.connect(user).buyTokens({ value: ethers.utils.parseEther("100") });
        await this.etbDex.connect(user).sellTokens(ethers.utils.parseEther("50"));
        expect(await this.etbToken.balanceOf(user.address)).to.eq(ethers.utils.parseEther("48"));
      });
    });
    describe("withdraw function", function () {
      it("Should send withdrawals to user", async function () {
        await this.etbDex.connect(user).buyTokens({ value: ethers.utils.parseEther("100") });
        await this.etbDex.connect(user).sellTokens(ethers.utils.parseEther("50"));
        const before = await ethers.provider.getBalance(user.address);
        await this.etbDex.connect(user).withdraw();
        const after = await ethers.provider.getBalance(user.address);
        expect(after).to.be.gt(before);
      });
    });
    describe("withdrawFees function", function () {
      it("Should allow the owner to withdraw", async function () {
        await this.etbDex.connect(user).buyTokens({ value: ethers.utils.parseEther("100") });
        const before = await ethers.provider.getBalance(deployer.address);
        await this.etbDex.withdrawFees();
        const after = await ethers.provider.getBalance(deployer.address);
        expect(after).to.be.gt(before);
      });
    });
  });
});
