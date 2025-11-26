export const BOOK_NFT_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "title", "type": "string" },
      { "internalType": "string", "name": "author", "type": "string" },
      { "internalType": "string", "name": "genre", "type": "string" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "string", "name": "metadataURI", "type": "string" }
    ],
    "name": "mintBook",
    "outputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "getBook",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "title", "type": "string" },
          { "internalType": "string", "name": "author", "type": "string" },
          { "internalType": "string", "name": "genre", "type": "string" },
          { "internalType": "string", "name": "description", "type": "string" }
        ],
        "internalType": "struct BookNFT.BookData",
        "name": "data",
        "type": "tuple"
      },
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "string", "name": "tokenURIString", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "operator", "type": "address" },
      { "internalType": "bool", "name": "approved", "type": "bool" }
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "uint256", "name": "index", "type": "uint256" }
    ],
    "name": "tokenOfOwnerByIndex",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];
