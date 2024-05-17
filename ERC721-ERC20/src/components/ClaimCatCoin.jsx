import { useState } from "react";
import { ethers } from "ethers";
import { GelatoRelay } from "@gelatonetwork/relay-sdk";
import CatCoin from "../artifacts/contracts/CatCoin.sol/CatCoin.json";

const relay = new GelatoRelay();

const catCoinContractAddress = '0x04AD2aDd99df586E5236b0DA1EA2df1881E21662';

const provider = new ethers.BrowserProvider(window.ethereum);

const signer = await provider.getSigner();

const catCoinContract = new ethers.Contract(
  catCoinContractAddress,
  CatCoin.abi,
  signer
);

const apiKey = "3QyZFI__i8AP7peyKJTx9aBfA78jT8ENragF776GOK4_";

function ClaimCatCoin() {
  const [amount, setAmount] = useState("");

  const catInputChange = (event) => {
    setAmount(event.target.value);
  };

  const claimCatCoin = async () => {
    if (!amount || isNaN(amount) || amount <= 0) {
      console.error("Invalid CAT amount");
      return;
    }
    try {
      const functionData = catCoinContract.interface.encodeFunctionData(
        "claim",
        [ethers.parseUnits(amount, 18)]
      );
      const user = await signer.getAddress();
      const relayRequest = {
        chainId: (await provider.getNetwork()).chainId,
        target: catCoinContractAddress,
        data: functionData,
        user: user,
        isConcurrent: true,
      };
      const response = await relay.sponsoredCallERC2771(
        relayRequest,
        provider,
        apiKey
      );
      console.log("Relay response:", response);
      console.log(
        `https://relay.gelato.digital/tasks/status/${response.taskId}`
      );
    } catch (error) {
      console.error("Error claiming CatCoins:", error);
    }
  };

  return (
    <div>
      <label htmlFor="amount">Enter CAT amount you want to claim:</label>
      <input
        type="number"
        id="amount"
        value={amount}
        onChange={catInputChange}
        step="10"
        min="10"
        placeholder="10"
        className="form-control"
      />
      <button className="btn btn-primary" onClick={claimCatCoin}>
        Claim Cat Coins
      </button>
    </div>
  );
}

export default ClaimCatCoin;
