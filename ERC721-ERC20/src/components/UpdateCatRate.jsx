import { useState } from 'react';
import { ethers } from 'ethers';
import CatCoin from '../artifacts/contracts/CatCoin.sol/CatCoin.json';

const catCoinContractAddress = '0x04AD2aDd99df586E5236b0DA1EA2df1881E21662';

const provider = new ethers.BrowserProvider(window.ethereum);

const signer = await provider.getSigner();

const catCoinContract = new ethers.Contract(catCoinContractAddress, CatCoin.abi, signer);

function UpdateCatRate() {
  const [newRate, setNewRate] = useState(0);
  const [currentRate, setCurrentRate] = useState('');

  const rateInputChange = (event) => {
    setNewRate(event.target.value);
  };

  const getCurrentRate = async () => {
    try {
      const rate = await catCoinContract.getEthToCatRate();
      setCurrentRate(parseFloat(rate));
    } catch (error) {
      console.error("Error getting current rate:", error);
    }
  };

  const updateCatRate = async () => {
    if (!newRate || isNaN(newRate) || newRate <= 0) {
      console.error('Invalid rate');
      return;
    }
    try {
        const tx = await catCoinContract.updateEthToCatRate(newRate);
        await tx.wait();
        const updatedRate = await catCoinContract.getEthToCatRate();
        setCurrentRate(parseFloat(updatedRate));
    } catch (error) {
      console.error('Error updating rate:', error);
    }
  };

  return (
    <div>
        <div>
            <h5>Current CAT rate: {currentRate}</h5>
          <button onClick={() => getCurrentRate()}>Get rate</button>
        </div>
        <label htmlFor="newRate">Enter the new ETH to CAT rate:</label>
        <input
          type="number"
          id="newRate"
          value={newRate}
          onChange={rateInputChange}
          step="100"
          min="100"
          placeholder="100"
          className="form-control"
        />
        <button className="btn btn-primary" onClick={updateCatRate}>
          Update rate
        </button>
    </div>
  );
}

export default UpdateCatRate;
