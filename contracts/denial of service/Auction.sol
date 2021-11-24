// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Auction is Ownable, ReentrancyGuard {
  using Address for address payable;

  address payable public currentLeader;
  uint256 public highestBid;

  struct Refund {
    address payable addr;
    uint256 amount;
  }

  Refund[] public refunds;

  function bid() external payable nonReentrant {
    require(msg.value > highestBid, "Bid not high enough");

    if (currentLeader != address(0)) {
      refunds.push(Refund(currentLeader, highestBid));
    }

    currentLeader = payable(msg.sender);
    highestBid = msg.value;
  }

  function refundAll() external onlyOwner nonReentrant {
    for (uint256 i; i < refunds.length; i++) {
      refunds[i].addr.sendValue(refunds[i].amount);
    }
    delete refunds;
  }
}
