export const USER_REGISTRY_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "nickname", "type": "string" },
      { "internalType": "string", "name": "city", "type": "string" },
      { "internalType": "string", "name": "favoriteGenres", "type": "string" }
    ],
    "name": "register",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "nickname", "type": "string" },
      { "internalType": "string", "name": "city", "type": "string" },
      { "internalType": "string", "name": "favoriteGenres", "type": "string" }
    ],
    "name": "updateProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "isRegistered",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getUser",
    "outputs": [
      { "internalType": "bool", "name": "registered", "type": "bool" },
      { "internalType": "string", "name": "nickname", "type": "string" },
      { "internalType": "string", "name": "city", "type": "string" },
      { "internalType": "string", "name": "favoriteGenres", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
