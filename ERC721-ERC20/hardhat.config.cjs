require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CELESTIA_RPC_URL = process.env.CELESTIA_RPC_URL;
const CELESTIA_BROWSER_URL = process.env.CELESTIA_BROWSER_URL;
const CELESTIA_API_URL = process.env.CELESTIA_API_URL;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  paths: {
    artifacts: './src/artifacts',
  },
  networks: {
    localhost: {
        url: "http://127.0.0.1:8545/",
        chainId: 31337,
    },
    celestia: {
      url: CELESTIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 123420111,
    }
  },
  etherscan: {
    apiKey: {
      raspberry: "xxx",
    },
    customChains: [
      {
        network: "raspberry",
        chainId: 123420111,
        urls: {
          apiURL: CELESTIA_API_URL,
          browserURL: CELESTIA_BROWSER_URL,
        },
      },
    ],
  },
  sourcify: {
  enabled: true,
  },
};
