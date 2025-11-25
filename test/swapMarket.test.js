const { expect } = require("chai");
const { ethers } = require("hardhat");

async function expectRevert(txPromise, reasonSubstring) {
  try {
    await txPromise;
    expect.fail("Expected transaction to revert");
  } catch (error) {
    if (reasonSubstring) {
      expect(error.message).to.include(reasonSubstring);
    }
  }
}

describe("SwapMarket (unit-ish tests)", function () {
  let userRegistry, bookNFT, swapMarket;
  let owner, user1, user2, stranger;

  beforeEach(async function () {
    [owner, user1, user2, stranger] = await ethers.getSigners();

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
      .register("U1", "City1", "G1");
    await userRegistry
      .connect(user2)
      .register("U2", "City2", "G2");

    await bookNFT
      .connect(user1)
      .mintBook("Book1", "A1", "G1", "D1", "uri1");
    await bookNFT
      .connect(user2)
      .mintBook("Book2", "A2", "G2", "D2", "uri2");

    await bookNFT
      .connect(user1)
      .setApprovalForAll(swapMarket.address, true);
    await bookNFT
      .connect(user2)
      .setApprovalForAll(swapMarket.address, true);
  });

  it("allows registered user to create an offer for their book", async function () {
    await swapMarket
      .connect(user1)
      .createOffer(1);

    const offer = await swapMarket.offers(1);

    expect(offer.id.toNumber()).to.equal(1);
    expect(offer.owner).to.equal(user1.address);
    expect(offer.bookId.toNumber()).to.equal(1);
    expect(offer.isActive).to.equal(true);
  });

  it("prevents unregistered user from creating an offer", async function () {
    await expectRevert(
      swapMarket.connect(stranger).createOffer(1),
      "User not registered"
    );
  });

  it("prevents creating offer for a book that user doesn't own", async function () {
    await expectRevert(
      swapMarket.connect(user2).createOffer(1),
      "" 
    );
  });

  it("allows another registered user to create a swap request", async function () {
    await swapMarket.connect(user1).createOffer(1);

    await swapMarket
      .connect(user2)
      .createRequest(1, 2);

    const req = await swapMarket.requests(1);

    expect(req.id.toNumber()).to.equal(1);
    expect(req.offerId.toNumber()).to.equal(1);
    expect(req.requester).to.equal(user2.address);
    expect(req.offeredBookId.toNumber()).to.equal(2);
    expect(req.isPending).to.equal(true);

    const reqIds = await swapMarket.getRequestsForOffer(1);
    expect(reqIds.length).to.equal(1);
    expect(reqIds[0].toNumber()).to.equal(1);
  });

  it("prevents owner from requesting their own offer", async function () {
    await swapMarket.connect(user1).createOffer(1);

    await expectRevert(
      swapMarket
        .connect(user1)
        .createRequest(1, 1),
      ""
    );
  });

  it("allows requester to cancel their request", async function () {
    await swapMarket.connect(user1).createOffer(1);

    await swapMarket
      .connect(user2)
      .createRequest(1, 2);

    await swapMarket
      .connect(user2)
      .cancelRequest(1);

    const req = await swapMarket.requests(1);
    expect(req.isPending).to.equal(false);
  });

  it("does not allow non-requester to cancel someone else's request", async function () {
    await swapMarket.connect(user1).createOffer(1);

    await swapMarket
      .connect(user2)
      .createRequest(1, 2);

    await expectRevert(
      swapMarket
        .connect(user1)
        .cancelRequest(1),
      "" 
    );
  });

  it("allows offer owner to cancel their offer", async function () {
    await swapMarket.connect(user1).createOffer(1);

    await swapMarket.connect(user1).cancelOffer(1);

    const offer = await swapMarket.offers(1);
    expect(offer.isActive).to.equal(false);
  });

  it("does not allow non-owner to cancel someone else's offer", async function () {
    await swapMarket.connect(user1).createOffer(1);

    await expectRevert(
      swapMarket.connect(user2).cancelOffer(1),
      "Not offer owner"
    );
  });
});
