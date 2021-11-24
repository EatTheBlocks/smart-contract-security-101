// SPDX-License-Identifier: UNLICENSED
// ONLY FOR DEMONSTRATION PURPOSES, DO NOT USE THIS IN PRODUCTION

pragma solidity 0.8.9;

contract Proxy {
  uint256 public x;
  address public owner;
  address public logicContract;

  constructor(address _logic) {
    logicContract = _logic;
    owner = msg.sender;
  }

  function upgrade(address _newLogicContract) external {
    require(msg.sender == owner, "Access restricted");
    logicContract = _newLogicContract;
  }

  fallback() external {
    (bool success, ) = logicContract.delegatecall(msg.data);
    require(success, "Unexpected error");
  }
}
