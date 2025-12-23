# BookSwap Club

Decentralized book swapping marketplace implemented with Solidity smart contracts (Hardhat) and a frontend client application.
The project demonstrates end-to-end dApp development: contract design, local deployment and testing, and interaction from the UI.

---

## Tech Stack

![Solidity](https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white)
![Hardhat](https://img.shields.io/badge/Hardhat-F7DF1E?style=for-the-badge&logo=ethereum&logoColor=000000)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=000000)
![HTML](https://img.shields.io/badge/HTML-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![SCSS](https://img.shields.io/badge/SCSS-CC6699?style=for-the-badge&logo=sass&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)

---

## About the Project

BookSwap Club is a decentralized marketplace where books are represented as on-chain assets and exchanged between users via swap offers.

Core logic is implemented in smart contracts, while the frontend provides a user interface for interacting with deployed contracts.

The project focuses on separation between on-chain logic and client-side logic, reproducible local development, and event-based interaction with smart contracts.

---

## Functional Overview

Smart contracts:
- book representation as NFT assets
- user registry for swap participation
- swap marketplace logic (offers and requests)
- lifecycle events for offers and requests

Frontend:
- wallet connection
- viewing swap offers
- creating offers and swap requests
- reading and displaying on-chain state

---

## Smart Contracts

The system consists of the following contracts:
- BookNFT — NFT contract for representing books
- UserRegistry — registry of users participating in swaps
- SwapMarket — marketplace contract for swap offers and requests

Contracts are located in the contracts directory.

---

## Repository Structure

    book_swap/
      contracts/
      frontend/
      scripts/
      test/
      hardhat.config.cjs
      package.json
      package-lock.json
      README.md

---

## Getting Started (Development)

Prerequisites:
- Node.js and npm
- MetaMask browser extension

Install dependencies:

    npm install

Run local blockchain:

    npx hardhat node

Deploy contracts:

    npx hardhat run scripts/deploy.js --network localhost

Run tests:

    npx hardhat test

Start frontend:

    cd frontend
    npm install
    npm start

---

## Environment Configuration

Frontend requires contract addresses and network configuration after deployment.
Deployed addresses should be copied from the deployment output and added to the frontend configuration.

---

## Project Status

Core smart contract functionality is implemented and tested locally.

Additional features and UI improvements are planned:
- search and filtering of swap offers
- extended user profile features
- UX improvements
- deployment to a public test network
