export const SWAP_MARKET_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "bookId", "type": "uint256" }
    ],
    "name": "createOffer",
    "outputs": [
      { "internalType": "uint256", "name": "offerId", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "offerId", "type": "uint256" }
    ],
    "name": "cancelOffer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "offerId", "type": "uint256" },
      { "internalType": "uint256", "name": "myBookId", "type": "uint256" }
    ],
    "name": "createRequest",
    "outputs": [
      { "internalType": "uint256", "name": "requestId", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "requestId", "type": "uint256" }
    ],
    "name": "acceptRequest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "requestId", "type": "uint256" }
    ],
    "name": "cancelRequest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  {
    "inputs": [
      { "internalType": "uint256", "name": "offerId", "type": "uint256" }
    ],
    "name": "getOffer",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "address", "name": "owner", "type": "address" },
          { "internalType": "uint256", "name": "bookId", "type": "uint256" },
          { "internalType": "bool", "name": "isActive", "type": "bool" }
        ],
        "internalType": "struct SwapMarket.SwapOffer",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "requestId", "type": "uint256" }
    ],
    "name": "getRequest",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "uint256", "name": "offerId", "type": "uint256" },
          { "internalType": "address", "name": "requester", "type": "address" },
          { "internalType": "uint256", "name": "offeredBookId", "type": "uint256" },
          { "internalType": "bool", "name": "isPending", "type": "bool" }
        ],
        "internalType": "struct SwapMarket.SwapRequest",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "offerId", "type": "uint256" }
    ],
    "name": "getRequestsForOffer",
    "outputs": [
      { "internalType": "uint256[]", "name": "", "type": "uint256[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },

  {
    "inputs": [],
    "name": "getAllOffers",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "address", "name": "owner", "type": "address" },
          { "internalType": "uint256", "name": "bookId", "type": "uint256" },
          { "internalType": "bool", "name": "isActive", "type": "bool" }
        ],
        "internalType": "struct SwapMarket.SwapOffer[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" }
    ],
    "name": "getOffersByOwner",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "address", "name": "owner", "type": "address" },
          { "internalType": "uint256", "name": "bookId", "type": "uint256" },
          { "internalType": "bool", "name": "isActive", "type": "bool" }
        ],
        "internalType": "struct SwapMarket.SwapOffer[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
