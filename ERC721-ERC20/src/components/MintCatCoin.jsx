0x04AD2aDd99df586E5236b0DA1EA2df1881E21662import { useState } from 'react';
import { ethers } from 'ethers';
import CatCoin from '../artifacts/contracts/CatCoin.sol/CatCoin.json';

const catCoinContractAddress = '0x04AD2aDd99df586E5236b0DA1EA2df1881E21662';

const provider = new ethers.BrowserProvider(window.ethereum);

const signer = await provider.getSigner();

const catCoinContract = new ethers.Contract(catCoinContractAddress, CatCoin.abi, signer);

function MintCatCoin() {
  const [catAmount, setCatAmount] = useState('');

  const catInputChange = (event) => {
    setCatAmount(event.target.value);
  };

  const mintCatCoin = async () => {
    if (!catAmount || isNaN(catAmount) || catAmount <= 0) {
      console.error('Invalid CAT amount');
      return;
    }

    try {
      const tx = await catCoinContract.mint(catCoinContractAddress, ethers.parseUnits(catAmount, 18));
      await tx.wait();
    } catch (error) {
      console.error('Error minting CatCoins:', error);
    }
  };

  return (
    <div>
        <label htmlFor="catAmount">Enter CAT amount:</label>
        <input
          type="number"
          id="catAmount"
          value={catAmount}
          onChange={catInputChange}
          step="10"
          min="10"
          placeholder="10"
          className="form-control"
        />
        <button className="btn btn-primary" onClick={mintCatCoin}>
          Mint Cat Coins
        </button>
    </div>
  );
}

export default MintCatCoin;
