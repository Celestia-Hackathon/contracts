import { ethers } from 'ethers';
import CatCoin from '../artifacts/contracts/CatCoin.sol/CatCoin.json';

const catCoinContractAddress = '0x04AD2aDd99df586E5236b0DA1EA2df1881E21662';

const provider = new ethers.BrowserProvider(window.ethereum);

const signer = await provider.getSigner();

const catCoinContract = new ethers.Contract(catCoinContractAddress, CatCoin.abi, signer);

function Withdraw() {

  const withdraw = async () => {
    try {
      const tx = await catCoinContract.withdrawEth();
      await tx.wait();
    } catch (error) {
      console.error("Error withdrawing funds:", error);
    }
  };

  return (
    <div>
        <button className="btn btn-primary" onClick={withdraw}>
            Withdraw
        </button>
    </div>
  );
}

export default Withdraw;
