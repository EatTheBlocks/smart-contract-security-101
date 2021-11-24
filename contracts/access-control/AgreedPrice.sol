// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AgreedPrice is Ownable {
  uint256 public price;

  constructor(uint256 _price) {
    price = _price;
  }

  function updatePrice(uint256 _price) external onlyOwner {
    price = _price;
  }
}
