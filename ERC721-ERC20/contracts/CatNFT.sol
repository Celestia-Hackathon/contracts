// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import { ERC2771Context } from "@gelatonetwork/relay-context/contracts/vendor/ERC2771Context.sol";

contract CatNFT is ERC721, ERC721URIStorage, Ownable, ERC2771Context {
    
    uint256 private _nextTokenId;
    mapping(string => uint8) existingURIs;
    event TokensTrasfered(address indexed recipient, uint256 amount);

    constructor(address initialOwner, address trustedForwarder)
        ERC721("Catstronauts", "CUTE")
        Ownable(initialOwner)
        ERC2771Context(trustedForwarder) 
    {}

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://";
    }

    function safeMint(address to, string memory uri) public onlyOwner {
        require(existingURIs[uri] != 1, "NFT already minted!");
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        existingURIs[uri] = 1;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function isContentOwned(string memory uri) public view returns (bool) {
        return existingURIs[uri] == 1;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function payToMint(address recipient, string memory metadataURI) 
        public
        payable
        returns (uint256) 
    {
        require(existingURIs[metadataURI] != 1, 'NFT already minted!');
        require(msg.value >= 0.05 ether, 'Need to pay up!');

        uint256 newItemId = _nextTokenId++;
        existingURIs[metadataURI] = 1;

        _safeMint(recipient, newItemId);
        _setTokenURI(newItemId, metadataURI);

        return newItemId;
    }

    function payToMintWithCatCoins(string memory metadataURI) 
        public
        returns (uint256) 
    {
        require(existingURIs[metadataURI] != 1, 'NFT already minted!');

        uint256 newItemId = _nextTokenId++;
        existingURIs[metadataURI] = 1;
        
        address recipient = _msgSender();
        _safeMint(recipient, newItemId);
        _setTokenURI(newItemId, metadataURI);

        return newItemId;
    }

    function count() public view returns (uint256) {
        return _nextTokenId;
    }

    function withdrawCat(uint256 amount) public onlyOwner {
        _transfer(address(this), msg.sender, amount);
    }

    function _msgSender() internal view override(Context, ERC2771Context) returns (address) {
        return ERC2771Context._msgSender();
    }

    function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }
}
