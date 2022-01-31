// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Registry.sol";

contract Exchange is ERC20, Ownable {
    IERC20 private immutable token;
    address public registryAddress;
    uint256 public fee = 1;
    
    constructor(address _token) ERC20("Liquidity Pool","LP") {
        require(_token != address(0), "invalid token");

        token = IERC20(_token);
        registryAddress = msg.sender;
    }

    function addLiquidity(uint256 _tokenAmount) public payable returns (uint256) {
        uint256 mintedTokens;

        if(totalSupply() == 0) {
            mintedTokens = address(this).balance;
        } else {
            uint256 ethReserve = address(this).balance - msg.value;
            uint256 tokenReserve = getReserve();
            uint256 correctTokenAmount = (tokenReserve * msg.value)/ethReserve;
            require(_tokenAmount >= correctTokenAmount, "More tokens required");
            mintedTokens = (totalSupply() * msg.value)/ethReserve;
        }

        token.transferFrom(msg.sender, address(this), _tokenAmount);
        _mint(msg.sender, mintedTokens);
        return mintedTokens;
    }

    function removeLiquidity(uint256 _amount) public returns (uint256, uint256) {
        require( _amount > 0, "invalid amount");
        uint256 ethAmount = (_amount * address(this).balance) / totalSupply();
        uint256 reserve = getReserve();
        uint256 tokenAmount = (_amount * reserve) / totalSupply();

        _burn(msg.sender, _amount);

        token.transfer(msg.sender, tokenAmount);

        // TODO: change for sendValue.. check for potential reentrancy
        payable(msg.sender).transfer(ethAmount);

        return (ethAmount, tokenAmount);
    }

    function getReserve() public view returns (uint256){
        return token.balanceOf(address(this));
    }

    function changeExchangeFee(uint256 _fee) public onlyOwner {
        require( _fee >= 0 , "Fee value greater than zero is required");
        require( _fee < 100 , "Fee value lower than 100 is required");

        fee = _fee;
    }

    //This function helps to follow the token bonding curve concept
    function getAmount(uint256 inputAmount, uint256 inputReserve, uint256 outputReserve) private view returns (uint256) {
        require(inputReserve > 0 && outputReserve > 0, "invalid reserves");

        uint256 feeAmount = 100 - fee;
        uint256 inputAmountWithFee = inputAmount * feeAmount;
        uint256 numerator = inputAmountWithFee * outputReserve;
        uint256 denominator = (inputReserve * 100) + inputAmountWithFee;
        return numerator / denominator;
    }

    function getTokenAmount(uint256 inputEth) public view returns (uint256) {
        require(inputEth > 0, "Quantity of ETH shall be greater than zero");
        uint256 reserve = getReserve();
        return getAmount(inputEth, address(this).balance, reserve);
    }

    function getEthAmount(uint256 inputToken) public view returns (uint256) {
        require(inputToken > 0, "Quantity of Token shall be greater than zero");
        uint256 reserve = getReserve();
        return getAmount(inputToken, reserve, address(this).balance);
    }

    function ethToToken(uint256 _minTokens, address recipient) private {
        // Finding the token amount to be received for that quantity of ETH
        uint256 inputEth = msg.value;
        require(inputEth > 0, "Quantity of ETH shall be greater than zero");
        uint256 tokenReserve = getReserve();
        
        // We have to substract inputEth to the contract balance in order to avoid affecting the final result.
        // For that reason and to avoid extra gas costs we don't use the getTokenAmount function
        uint256 tokensBought = getAmount(inputEth, (address(this).balance - inputEth), tokenReserve);
        
        // We check the quantity of tokens to be greater than the minimal permited amount
        require(tokensBought >= _minTokens, "slipage wasn't enough");

        // Tokens are transferred to beneficiary
        token.transfer(recipient, tokensBought);
    }

    function ethToTokenSwap(uint256 _minTokens) public payable {
        ethToToken(_minTokens, msg.sender);
    }

    function ethToTokenTransfer(uint256 _minTokens, address recipient) public payable {
        ethToToken(_minTokens, recipient);
    }

    function tokenToEthSwap(uint256 _tokensSold, uint256 _minEths) public {
        // Finding the ETH amount to be received for that quantity of tokens
        uint256 ethsBought = getEthAmount(_tokensSold);
        
        // We check the quantity of ETH to be greater than the minimal permited amount
        require(ethsBought >= _minEths, "slipage wasn't enough");

        // We transfer the tokens from user to contract
        token.transferFrom(msg.sender, address(this), _tokensSold);
        
        // We transfer the ETHs from contract to user
        // TODO: change it for sendValue, function from address payable (OpenZeppelin address class)
        // TODO: check posible reentrancy
        payable(msg.sender).transfer(ethsBought);
    }

    function tokenToTokenSwap(uint256 _tokensSold, uint256 _minTokensBought, address _tokenAddress) public {
        address exchangeAddress = Registry(registryAddress).getExchange(_tokenAddress);

        require(exchangeAddress != address(0), "there's not registry for token");
        require(exchangeAddress != address(this), "invalid exchange address");

        // Converting from token sold to ETH
        uint256 tokenReserve = getReserve();
        uint256 ethsBought = getAmount(_tokensSold, tokenReserve, address(this).balance);

        token.transferFrom(msg.sender, address(this), _tokensSold);

        // We have to convert from ETH to new Token
        Exchange(exchangeAddress).ethToTokenTransfer{value : ethsBought}(_minTokensBought, msg.sender);
    }
}