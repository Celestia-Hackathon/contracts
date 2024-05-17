import { useEffect, useState } from 'react';
import { GelatoRelay } from "@gelatonetwork/relay-sdk";
import { ethers } from 'ethers';
import CatNFT from '../artifacts/contracts/CatNFT.sol/CatNFT.json';
import CatCoin from '../artifacts/contracts/CatCoin.sol/CatCoin.json';

const relay = new GelatoRelay();

const NFTContractAddress = '0x7164c48b7EA2acAa055FA1B8738ba5A4F7abeFca';
const catCoinContractAddress = '0x04AD2aDd99df586E5236b0DA1EA2df1881E21662';

const provider = new ethers.BrowserProvider(window.ethereum);

const signer = await provider.getSigner();

const apiKey = "3QyZFI__i8AP7peyKJTx9aBfA78jT8ENragF776GOK4_";

function MintNFT({ tokenId, getCount }) {
  const contentIdImg = 'QmTudPsbaksg9oG3jR3uNYXtpjAkHGsGnh1tAqVAYt7nRy';
  const contentIdJson = 'QmY9yW5B7xHXBGDwW5Y5ido3VULyXD2njD4QhApBqxtPxd';
  const metadataURI = `${contentIdJson}/${tokenId}.json`
  const imageURI = `https://gateway.pinata.cloud/ipfs/${contentIdImg}/${tokenId}.png`;
  const [catCoinBalance, setCatCoinBalance] = useState('');
  
  const NFTContract = new ethers.Contract(NFTContractAddress, CatNFT.abi, signer);
  const catCoinContract = new ethers.Contract(catCoinContractAddress, CatCoin.abi, signer);

  const [isMinted, setIsMinted] = useState(false);
  useEffect(() => {
    getMintedStatus();
  }, [isMinted]);

  const getMintedStatus = async () => {
    const result = await NFTContract.isContentOwned(metadataURI);
    setIsMinted(result);
  };

  const  getCatCoinBalance = async () => {
    try {
      const address = await signer.getAddress();
      const balance = await catCoinContract.balanceOf(address);
      const balanceCorrected = parseFloat(balance.toString()) / 1e18;
      setCatCoinBalance(balanceCorrected);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  async function getURI() {
    const uri = await NFTContract.tokenURI(tokenId);
    console.log(uri);
    alert(uri);
  }
    
  const buyNFTWithETH = async (metadataURI) => {
    const tx = await NFTContract.payToMint(await signer.getAddress(), metadataURI, {
      value: ethers.parseEther('0.05'),
    });
    await tx.wait();
    getCount();
  };
  
  const mintTokenWithETH = async () => {
    await buyNFTWithETH(metadataURI);
    getMintedStatus();
    getCount();
  };
  
  const buyNFTWithCatCoin = async (metadataURI) => {
    try{
      const functionDataTransfer = catCoinContract.interface.encodeFunctionData(
        "transferTokens",
        [NFTContractAddress, ethers.parseUnits('10', 18)]
      );
      const user = await signer.getAddress();
      const relayRequestTransfer = {
        chainId: (await provider.getNetwork()).chainId,
        target: catCoinContractAddress,
        data: functionDataTransfer,
        user: user,
        isConcurrent: true,
      };
      const responseTransfer = await relay.sponsoredCallERC2771(
        relayRequestTransfer,
        provider,
        apiKey
      );
      console.log("Relay response:", responseTransfer);
      console.log(
        `https://relay.gelato.digital/tasks/status/${responseTransfer.taskId}`
      );
      
      await new Promise(resolve => setTimeout(resolve, 70000));

      const functionDataMint = NFTContract.interface.encodeFunctionData(
        "payToMintWithCatCoins",
        [metadataURI]
      );
      const relayRequestMint = {
        chainId: (await provider.getNetwork()).chainId,
        target: NFTContractAddress,
        data: functionDataMint,
        user: user,
        isConcurrent: true,
      };
      const responseMint = await relay.sponsoredCallERC2771(
        relayRequestMint,
        provider,
        apiKey
      );
      console.log("Relay response:", responseMint);
      console.log(
        `https://relay.gelato.digital/tasks/status/${responseMint.taskId}`
      );
      getCount();
      getCatCoinBalance();
    } catch(error) {
      console.log("Error minting NFT with CAT...", error);
    }
  };

  const mintTokenWithCatCoin = async () => {
    await buyNFTWithCatCoin(metadataURI);
    getMintedStatus();
    getCount();
  };

  return (
    <div className="card" style={{ width: '18rem' }}>
      <img className="card-img-top" src={isMinted ? imageURI : 'img/placeholder.png'}></img>
      <div className="card-body">
        <h5 className="card-title">ID #{tokenId}</h5>
        {!isMinted ? (
          <>
          <button className="btn btn-primary" onClick={mintTokenWithETH}>
            Mint with ETH
          </button>
          <button className="btn btn-secondary" onClick={mintTokenWithCatCoin}>
            Mint with CatCoin
          </button>
        </>
        ) : (
          <button className="btn btn-secondary" onClick={getURI}>
            Taken! Show URI
          </button>
        )}
      </div>
    </div>
  );
}

export default MintNFT;
