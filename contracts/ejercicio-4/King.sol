// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";

/**
 * Adaptado del desafio "King" de https://ethernaut.openzeppelin.com
 */
contract King {

  using Address for address payable;

  address payable public king;
  uint256 public prize;

  constructor() payable {
    king = payable(msg.sender);
    prize = msg.value;
  }

  receive() external payable {
    require(msg.value > prize, "No es suficiente ETH para convertirse en rey");
    //king.transfer(msg.value);
    king.sendValue(msg.value);
    king = payable(msg.sender);
    prize = msg.value;
  }
}
