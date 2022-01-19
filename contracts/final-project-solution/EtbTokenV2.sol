// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

contract EtbTokenV2 is Ownable {
  address public etbDex;
  uint256 public totalSupply;
  string public name = "Eat the Block Token";
  string public symbol = "ETBT";
  uint8 public decimals = 18;

  mapping(address => uint256) public balances;
  mapping(address => mapping(address => uint256)) private allowances;

  constructor(uint256 initialSupply) {
    totalSupply = initialSupply;
    balances[msg.sender] = initialSupply;
  }

  modifier onlyEtbDex() {
    require(msg.sender == etbDex, "Restricted Access");
    _;
  }

  function setDexAddress(address _dex) external onlyOwner {
    etbDex = _dex;
  }

  function transfer(address recipient, uint256 amount) external {
    require(recipient != address(0), "ERC20: transfer from the zero address");
    require(balances[msg.sender] >= amount, "Not enough balance");

    balances[msg.sender] -= amount;
    balances[recipient] += amount;
  }

  function approve(address spender, uint256 amount) external {
    require(spender != address(0), "ERC20: approve to the zero address");

    allowances[msg.sender][spender] = amount;
  }

  function transferFrom(
    address sender,
    address recipient,
    uint256 amount
  ) external returns (bool) {
    require(allowances[sender][msg.sender] >= amount, "ERC20: amount exceeds allowance");
    require(balances[sender] >= amount, "Not enough balance");

    allowances[sender][msg.sender] -= amount;

    balances[sender] -= amount;
    balances[recipient] += amount;

    return true;
  }

  function mint(uint256 amount) external onlyEtbDex {
    totalSupply += amount;
    balances[owner()] += amount;
  }

  function burn(address account, uint256 amount) external onlyEtbDex {
    totalSupply -= amount;
    balances[account] -= amount;
  }

  /* --- Getters --- */

  function balanceOf(address account) public view returns (uint256) {
    return balances[account];
  }

  function allowanceOf(address balanceOwner, address spender) public view virtual returns (uint256) {
    return allowances[balanceOwner][spender];
  }
}
