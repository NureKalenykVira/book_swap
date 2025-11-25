require("dotenv").config();
require("@nomiclabs/hardhat-ethers");

const { SEPOLIA_RPC_URL, PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
};
