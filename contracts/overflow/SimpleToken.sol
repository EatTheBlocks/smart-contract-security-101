// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts-legacy/access/Ownable.sol";
import "@openzeppelin/contracts-legacy/math/SafeMath.sol";

contract SimpleToken is Ownable {
  using SafeMath for uint256;

  mapping(address => uint256) public balanceOf;
  uint256 public totalSupply;

  constructor(uint256 _initialSupply) public {
    totalSupply = _initialSupply;
    balanceOf[msg.sender] = _initialSupply;
  }

  function transfer(address _to, uint256 _amount) public {
    require(balanceOf[msg.sender].sub(_amount) >= 0, "Not enough tokens");
    balanceOf[msg.sender] = balanceOf[msg.sender].sub(_amount);
    balanceOf[_to] = balanceOf[_to].add(_amount);
  }

  function mint(uint256 amount) external {
    totalSupply = totalSupply.add(amount);
    balanceOf[owner()] = balanceOf[owner()].add(amount);
  }
}
