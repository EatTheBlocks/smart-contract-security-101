// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract AuctionV2 is ReentrancyGuard {
  using Address for address payable;

  address payable public currentLeader;
  uint256 public highestBid;

  mapping(address => uint256) public refunds;

  function bid() external payable nonReentrant {
    require(msg.value > highestBid, "Bid not high enough");

    if (currentLeader != address(0)) {
      refunds[currentLeader] += highestBid;
    }

    currentLeader = payable(msg.sender);
    highestBid = msg.value;
  }

  function withdrawRefund() external nonReentrant {
    uint256 refund = refunds[msg.sender];
    refunds[msg.sender] = 0;

    payable(msg.sender).sendValue(refund);
  }
}
