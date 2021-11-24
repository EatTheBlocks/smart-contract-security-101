// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract KotET is Ownable {
  using Address for address payable;

  address public king;
  uint256 public claimPrice;

  constructor() {
    king = msg.sender;
  }

  receive() external payable {
    require(msg.value > claimPrice, "Not enough Ether");
    address overthrownKing = king;
    king = msg.sender;
    claimPrice = msg.value;

    uint256 fee = (claimPrice / 100) * 2;
    uint256 compensation = claimPrice - fee;

    payable(owner()).sendValue(fee);
    payable(overthrownKing).sendValue(compensation);
  }
}
