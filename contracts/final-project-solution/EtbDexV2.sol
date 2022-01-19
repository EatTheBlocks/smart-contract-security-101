// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import { EtbTokenV2 } from "./EtbTokenV2.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract EtbDexV2 is Ownable {
  using Address for address payable;

  EtbTokenV2 private _etbToken;
  uint256 public fee;

  mapping(address => uint256) public withdrawals;

  constructor(address _token) {
    _etbToken = EtbTokenV2(_token);
  }

  function buyTokens() external payable {
    require(msg.value > 0, "Should send ETH to buy tokens");
    require(_etbToken.balanceOf(owner()) >= msg.value, "Not enough tokens to sell");
    _etbToken.transferFrom(owner(), msg.sender, msg.value - calculateFee(msg.value));
  }

  function sellTokens(uint256 _amount) external {
    require(_etbToken.balanceOf(msg.sender) >= _amount, "Not enough tokens");
    _etbToken.burn(msg.sender, _amount);
    _etbToken.mint(_amount);
    withdrawals[msg.sender] += _amount;
  }

  function setFee(uint256 _fee) external onlyOwner {
    fee = _fee;
  }

  function calculateFee(uint256 _amount) internal view returns (uint256) {
    return (_amount / 100) * fee;
  }

  function withdraw() external {
    withdrawals[msg.sender] = 0;
    payable(msg.sender).sendValue(withdrawals[msg.sender]);
  }

  function withdrawFees() external onlyOwner {
    payable(msg.sender).sendValue(address(this).balance);
  }
}
