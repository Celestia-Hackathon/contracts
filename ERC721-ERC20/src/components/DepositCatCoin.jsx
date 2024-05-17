import { useState } from 'react';
import { ethers } from 'ethers';
import CatCoin from '../artifacts/contracts/CatCoin.sol/CatCoin.json';

const catCoinContractAddress = '0x04AD2aDd99df586E5236b0DA1EA2df1881E21662';

const provider = new ethers.BrowserProvider(window.ethereum);

const signer = await provider.getSigner();

const catCoinContract = new ethers.Contract(catCoinContractAddress, CatCoin.abi, signer);

function DepositCatCoin() {
  const [catDepositAmount, setCatDepositAmount] = useState('');

  const catDepositInputChange = (event) => {
    setCatDepositAmount(event.target.value);
  };

  const depositCatCoin = async () => {
    if (!catDepositAmount || isNaN(catDepositAmount) || catDepositAmount <= 0) {
      console.error('Invalid CAT amount');
      return;
    }

    try {
      const tx = await catCoinContract.depositCatCoin(ethers.parseUnits(catDepositAmount, 18));
      await tx.wait();
    } catch (error) {
      console.error('Error CatCoins:', error);
    }
  };

  return (
    <div>
        <label htmlFor="catDepositAmount">Enter CAT amount to deposit:</label>
        <input
          type="number"
          id="catDepositAmount"
          value={catDepositAmount}
          onChange={catDepositInputChange}
          step="10"
          min="10"
          placeholder="10"
          className="form-control"
        />
        <button className="btn btn-primary" onClick={depositCatCoin}>
          Make a deposit of Cat Coins
        </button>
    </div>
  );
}

export default DepositCatCoin;
