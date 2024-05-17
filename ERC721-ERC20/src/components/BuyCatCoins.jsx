import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import CatCoin from '../artifacts/contracts/CatCoin.sol/CatCoin.json';

const catCoinContractAddress = '0x04AD2aDd99df586E5236b0DA1EA2df1881E21662';

const provider = new ethers.BrowserProvider(window.ethereum);

const signer = await provider.getSigner();

const catCoinContract = new ethers.Contract(catCoinContractAddress, CatCoin.abi, signer);

function BuyCatCoins() {
  const [inputType, setInputType] = useState('eth');
  const [ethAmount, setEthAmount] = useState('');
  const [catAmount, setCatAmount] = useState('');
  const [ethToCatRate, setEthToCatRate] = useState(0);

  useEffect(() => {
    fetchEthToCatRate();
  }, []);

  const ethInputChange = (event) => {
    const value = event.target.value;
    setEthAmount(value);
    if (value && !isNaN(value)) {
      setCatAmount((value * ethToCatRate).toFixed(2));
    } else {
      setCatAmount('');
    }
  };

  const catInputChange = (event) => {
    const value = event.target.value;
    setCatAmount(value);
    if (value && !isNaN(value)) {
      setEthAmount((value / ethToCatRate).toFixed(6));
    } else {
      setEthAmount('');
    }
  };

  const handleInputTypeChange = (event) => {
    setInputType(event.target.value);
    setEthAmount('');
    setCatAmount('');
  };

  const fetchEthToCatRate = async () => {
    try {
      const rate = await catCoinContract.getEthToCatRate();
      setEthToCatRate(parseFloat(rate));
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
    }
  };

  const buyCatCoins= async () => {
    if (inputType === 'eth' && ethAmount && !isNaN(ethAmount) && ethAmount > 0) {
      try {
        const ethAmountInWei = ethers.parseEther(ethAmount.toString());
        const result = await catCoinContract.buyCatCoinWithETH({ value: ethAmountInWei });
        await result.wait();
      } catch (error) {
        console.error('Error buying CatCoins:', error);
      }
    } else if (inputType === 'cat' && catAmount && !isNaN(catAmount) && catAmount > 0) {
      try {
        const ethAmountForCat = (catAmount / ethToCatRate).toFixed(6);
        const ethAmountInWei = ethers.parseEther(ethAmountForCat.toString());
        const result = await catCoinContract.buyCatCoinWithETH({ value: ethAmountInWei });
        await result.wait();
      } catch (error) {
        console.error('Error buying CatCoins:', error);
      }
    } else {
      console.error('Invalid amount');
    }
  };
  
  const addCatCoinToWallet = async () => {
    const tokenAddress = catCoinContractAddress;
    const tokenSymbol = 'CAT';
    const tokenDecimals = 18;
    const tokenImage = 'https://gateway.pinata.cloud/ipfs/QmZHBnnHaXM1k1xGLukV3UAT8qgsNDGBrWeHyYwySkLa8A/cat.png';

    try {
      const wasAdded = await provider.send('wallet_watchAsset', {
        type: 'ERC20',
        options: {
          address: tokenAddress,
          symbol: tokenSymbol,
          decimals: tokenDecimals,
          image: tokenImage,
        },
      });

      if (wasAdded) {
        console.log('Token added!');
      } else {
        console.log('Token not added.');
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
        <button className="btn btn-primary" onClick={addCatCoinToWallet}>Add CatCoin to MetaMask</button>
        <br />
          <label htmlFor="inputType">Select input type:</label>
          <select id="inputType" value={inputType} onChange={handleInputTypeChange} className="form-control">
            <option value="eth">ETH</option>
            <option value="cat">CAT</option>
          </select>
        <br />
        {inputType === 'eth' ? (
          <div>
            <label htmlFor="ethAmount">Enter ETH amount:</label>
            <input
              type="number"
              id="ethAmount"
              value={ethAmount}
              onChange={ethInputChange}
              step="0.001"
              min="0.001"
              placeholder="0.001"
              className="form-control"
            />
          </div>
        ) : (
          <div>
            <label htmlFor="catAmount">Enter CAT amount:</label>
            <input
              type="number"
              id="catAmount"
              value={catAmount}
              onChange={catInputChange}
              step="1"
              min="1"
              placeholder="1"
              className="form-control"
            />
          </div>
      )}
      <button className="btn btn-secondary" onClick={buyCatCoins}>
        Buy CatCoins
      </button>
    </div>
  );
}

export default BuyCatCoins;
