// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/utils/Address.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SavingsAccountV2 is ReentrancyGuard {
  using Address for address payable;

  mapping(address => uint256) public balanceOf;

  function deposit() external payable nonReentrant {
    balanceOf[msg.sender] += msg.value;
  }

  function withdraw() external nonReentrant {
    require(balanceOf[msg.sender] > 0, "Nothing to Withdraw");

    uint256 depositedAmount = balanceOf[msg.sender];

    console.log("");
    console.log("ReentrancyVictim's balance: ", address(this).balance);
    console.log("ReentrancyAttacker's balance: ", balanceOf[msg.sender]);
    console.log("");

    payable(msg.sender).sendValue(depositedAmount);

    balanceOf[msg.sender] = 0;
  }
}
