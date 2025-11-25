const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BookSwap Club – integration flow", function () {
  let userRegistry, bookNFT, swapMarket;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const UserRegistry = await ethers.getContractFactory("UserRegistry");
    userRegistry = await UserRegistry.deploy();
    await userRegistry.deployed();

    const BookNFT = await ethers.getContractFactory("BookNFT");
    bookNFT = await BookNFT.deploy();
    await bookNFT.deployed();

    const SwapMarket = await ethers.getContractFactory("SwapMarket");
    swapMarket = await SwapMarket.deploy(bookNFT.address, userRegistry.address);
    await swapMarket.deployed();

    await userRegistry
      .connect(user1)
      .register("Alice", "Kyiv", "Fantasy");
    await userRegistry
      .connect(user2)
      .register("Bob", "Lviv", "Sci-fi");

    await bookNFT
      .connect(user1)
      .mintBook("AliceBook", "Author A", "Fantasy", "Desc A", "uriA");
    await bookNFT
      .connect(user2)
      .mintBook("BobBook", "Author B", "Sci-fi", "Desc B", "uriB");

    await bookNFT
      .connect(user1)
      .setApprovalForAll(swapMarket.address, true);
    await bookNFT
      .connect(user2)
      .setApprovalForAll(swapMarket.address, true);
  });

  it("allows two registered users to swap books end-to-end", async function () {
    await swapMarket.connect(user1).createOffer(1);

    await swapMarket.connect(user2).createRequest(1, 2);

    await swapMarket.connect(user1).acceptRequest(1);

    const ownerOf1 = await bookNFT.ownerOf(1);
    const ownerOf2 = await bookNFT.ownerOf(2);

    expect(ownerOf1).to.equal(user2.address);
    expect(ownerOf2).to.equal(user1.address);

    const offer = await swapMarket.offers(1);
    const req = await swapMarket.requests(1);

    expect(offer.isActive).to.equal(false);
    expect(req.isPending).to.equal(false);
  });

  it("does not change owners if requester cancels request before accept", async function () {
    await swapMarket.connect(user1).createOffer(1);

    await swapMarket.connect(user2).createRequest(1, 2);

    await swapMarket.connect(user2).cancelRequest(1);

    const ownerOf1 = await bookNFT.ownerOf(1);
    const ownerOf2 = await bookNFT.ownerOf(2);

    expect(ownerOf1).to.equal(user1.address);
    expect(ownerOf2).to.equal(user2.address);
  });

  it("does not change owners if offer owner cancels offer before accepting", async function () {
    await swapMarket.connect(user1).createOffer(1);

    await swapMarket.connect(user2).createRequest(1, 2);

    await swapMarket.connect(user1).cancelOffer(1);

    const ownerOf1 = await bookNFT.ownerOf(1);
    const ownerOf2 = await bookNFT.ownerOf(2);

    expect(ownerOf1).to.equal(user1.address);
    expect(ownerOf2).to.equal(user2.address);
  });
});
