// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Caller {
  uint256 public x;
  address public callee;

  function callCallee(uint256 _num) external {
    (bool success, ) = callee.call(abi.encodeWithSignature("setX(uint256)", _num));
    require(success, "Error");
  }

  function delegatecallCallee(uint256 _num) external {
    (bool success, ) = callee.delegatecall(abi.encodeWithSignature("setX(uint256)", _num));
    require(success, "Error");
  }

  function staticcallCalleee(uint256 _num) external view {
    (bool success, ) = callee.staticcall(abi.encodeWithSignature("setX(uint256)", _num));
    require(success, "Error");
  }

  function setCalleeAddress(address _callee) external {
    callee = _callee;
  }
}
