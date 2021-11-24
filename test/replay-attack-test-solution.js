const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Replay Attack", function () {
  let deployer, adminOne, adminTwo, user, attacker;

  beforeEach(async function () {
    [deployer, adminOne, adminTwo, user, attacker] = await ethers.getSigners();

    const MultiSigWalletV2 = await ethers.getContractFactory("MultiSigWalletV2", deployer);
    this.multiSigWallet = await MultiSigWalletV2.deploy([adminOne.address, adminTwo.address]);

    await adminOne.sendTransaction({ to: this.multiSigWallet.address, value: ethers.utils.parseEther("10") });
  });

  describe("MultiSigWalletV2", function () {
    it("Should allow transfer funds after receiving both signatures", async function () {
      const before = await ethers.provider.getBalance(user.address);

      const nonce = 1;

      const amount = ethers.utils.parseEther("1");

      // Message encoding
      const message = ethers.utils.solidityPack(["address", "uint256"], [user.address, amount]);
      const messageBuffer = ethers.utils.concat([message]);

      // Sign the message
      let adminOneSig = await adminOne.signMessage(messageBuffer);
      let adminTwoSig = await adminTwo.signMessage(messageBuffer);
      // Expanded format
      let adminOneSplitSig = ethers.utils.splitSignature(adminOneSig);
      let adminTwoSplitSig = ethers.utils.splitSignature(adminTwoSig);

      await this.multiSigWallet.transfer(user.address, amount, [adminOneSplitSig, adminTwoSplitSig], nonce);

      const after = await ethers.provider.getBalance(user.address);

      expect(after).to.eq(before.add(ethers.utils.parseEther("1")));
    });
    it("Should revert if other than the admins sign the tx", async function () {
      const amount = ethers.utils.parseEther("1");

      const nonce = 1;

      // Message encoding
      const message = ethers.utils.solidityPack(["address", "uint256"], [user.address, amount]);
      const messageBuffer = ethers.utils.concat([message]);

      // Sign the message
      let adminOneSig = await attacker.signMessage(messageBuffer);
      let adminTwoSig = await adminTwo.signMessage(messageBuffer);
      // Expanded format
      let adminOneSplitSig = ethers.utils.splitSignature(adminOneSig);
      let adminTwoSplitSig = ethers.utils.splitSignature(adminTwoSig);

      await expect(this.multiSigWallet.transfer(user.address, amount, [adminOneSplitSig, adminTwoSplitSig], nonce)).to.be.revertedWith("Access restricted");
    });
    it("Replay attack", async function () {
      const nonce = 1;

      const amount = ethers.utils.parseEther("1");

      // Message encoding
      const message = ethers.utils.solidityPack(["address", "uint256"], [user.address, amount]);
      const messageBuffer = ethers.utils.concat([message]);

      // Sign the message
      let adminOneSig = await adminOne.signMessage(messageBuffer);
      let adminTwoSig = await adminTwo.signMessage(messageBuffer);
      // Expanded format
      let adminOneSplitSig = ethers.utils.splitSignature(adminOneSig);
      let adminTwoSplitSig = ethers.utils.splitSignature(adminTwoSig);

      await this.multiSigWallet.transfer(user.address, amount, [adminOneSplitSig, adminTwoSplitSig], nonce);
      await expect(this.multiSigWallet.transfer(user.address, amount, [adminOneSplitSig, adminTwoSplitSig], nonce)).to.be.revertedWith("Signature expired");
    });
  });
});
