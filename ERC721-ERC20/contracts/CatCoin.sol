// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { ERC2771Context } from "@gelatonetwork/relay-context/contracts/vendor/ERC2771Context.sol";

contract CatCoin is ERC20, Ownable, ReentrancyGuard, ERC2771Context {
    
    uint256 public ethToCatRate;

    event TokensPurchased(address indexed purchaser, uint256 amount, uint256 rate, string currency);
    event TokensTrasfered(address indexed claimer, uint256 amount);

    constructor(address initialOwner, uint256 _ethToCatRate, address trustedForwarder) 
        ERC20("Cat", "CAT") 
        Ownable(initialOwner)
        ERC2771Context(trustedForwarder) 
    {
        _mint(address(this), 10000 * 10 ** decimals());
        ethToCatRate = _ethToCatRate;
    }
    
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function transferTokens(address recipient, uint256 amount) public returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        emit TokensTrasfered(_msgSender(), amount);
        return true;
    }

    function claim(uint256 amount) public {
        require(balanceOf(address(this)) >= amount, "Not enough CatCoins in the reserve");
        _transfer(address(this), _msgSender(), amount);
        emit TokensTrasfered(_msgSender(), amount);
    }

    function buyCatCoinWithETH() public payable nonReentrant {
        uint256 catAmount = (msg.value * ethToCatRate);
        require(balanceOf(address(this)) >= catAmount, "Not enough CatCoins in the reserve");

        _transfer(address(this), msg.sender, catAmount);
        emit TokensPurchased(msg.sender, catAmount, ethToCatRate, "ETH");
    }

    function getEthToCatRate() public view returns(uint256) {
        return ethToCatRate;
    }

    function updateEthToCatRate(uint256 newRate) public onlyOwner {
        ethToCatRate = newRate;
    }

    function depositCatCoins(uint256 amount) public onlyOwner {
        require(balanceOf(msg.sender) >= amount, "Insufficient CatCoins to deposit");
        _transfer(msg.sender, address(this), amount);
    }

    function withdrawEth() public onlyOwner {
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call failed!");
    }

    function withdramCat(uint256 amount) public onlyOwner {
        _transfer(address(this), msg.sender, amount);
    }
    
    function _msgSender() internal view override(Context, ERC2771Context) returns (address) {
        return ERC2771Context._msgSender();
    }

    function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }
}

