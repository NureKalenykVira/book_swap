const { ethers } = require("hardhat");

async function main() {
  const UserRegistry = await ethers.getContractFactory("UserRegistry");
  const userRegistry = await UserRegistry.deploy();
  await userRegistry.deployed();
  console.log("UserRegistry deployed to:", userRegistry.address);

  const BookNFT = await ethers.getContractFactory("BookNFT");
  const bookNFT = await BookNFT.deploy();
  await bookNFT.deployed();
  console.log("BookNFT deployed to:", bookNFT.address);

  const SwapMarket = await ethers.getContractFactory("SwapMarket");
  const swapMarket = await SwapMarket.deploy(
    bookNFT.address,
    userRegistry.address
  );
  await swapMarket.deployed();
  console.log("SwapMarket deployed to:", swapMarket.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
