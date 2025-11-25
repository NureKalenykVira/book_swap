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

describe("BookNFT (unit tests)", function () {
  let bookNFT;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const BookNFT = await ethers.getContractFactory("BookNFT");
    bookNFT = await BookNFT.deploy();
    await bookNFT.deployed();
  });

  it("mints a new book NFT with correct data", async function () {
    await bookNFT
      .connect(user1)
      .mintBook(
        "Book One",
        "Author A",
        "Genre1",
        "Nice book",
        "https://example.com/meta1.json"
      );

    const tokenId = 1;
    const ownerOfToken = await bookNFT.ownerOf(tokenId);
    expect(ownerOfToken).to.equal(user1.address);

    const [data, ownerAddress, tokenUri] = await bookNFT.getBook(tokenId);
    expect(data.title).to.equal("Book One");
    expect(data.author).to.equal("Author A");
    expect(data.genre).to.equal("Genre1");
    expect(data.description).to.equal("Nice book");

    expect(ownerAddress).to.equal(user1.address);
    expect(tokenUri).to.equal("https://example.com/meta1.json");
  });

  it("increments tokenId for each new book", async function () {
    await bookNFT
      .connect(user1)
      .mintBook(
        "Book One",
        "Author A",
        "G1",
        "Desc1",
        "https://example.com/1.json"
      );

    await bookNFT
      .connect(user1)
      .mintBook(
        "Book Two",
        "Author B",
        "G2",
        "Desc2",
        "https://example.com/2.json"
      );

    const owner1 = await bookNFT.ownerOf(1);
    const owner2 = await bookNFT.ownerOf(2);
    expect(owner1).to.equal(user1.address);
    expect(owner2).to.equal(user1.address);
  });

  it("reverts getBook for non-existent token", async function () {
    await expectRevert(
      bookNFT.getBook(999),
      "Book does not exist"
    );
  });

  it("allows different users to mint books independently", async function () {
    await bookNFT
      .connect(user1)
      .mintBook("Book U1", "AU1", "G1", "D1", "uri1");

    await bookNFT
      .connect(user2)
      .mintBook("Book U2", "AU2", "G2", "D2", "uri2");

    const owner1 = await bookNFT.ownerOf(1);
    const owner2 = await bookNFT.ownerOf(2);

    expect(owner1).to.equal(user1.address);
    expect(owner2).to.equal(user2.address);
  });

  it("updates owner after transferFrom", async function () {
    await bookNFT
      .connect(user1)
      .mintBook("Book1", "A1", "G1", "D1", "uri1");

    const tokenId = 1;

    await bookNFT
      .connect(user1)
      .transferFrom(user1.address, user2.address, tokenId);

    const ownerAfter = await bookNFT.ownerOf(tokenId);
    expect(ownerAfter).to.equal(user2.address);

    const [, ownerAddressAfter] = await bookNFT.getBook(tokenId);
    expect(ownerAddressAfter).to.equal(user2.address);
  });

  it("reports correct balance for owner after multiple mints", async function () {
    await bookNFT
      .connect(user1)
      .mintBook("B1", "A1", "G1", "D1", "uri1");

    await bookNFT
      .connect(user1)
      .mintBook("B2", "A2", "G2", "D2", "uri2");

    const balance = await bookNFT.balanceOf(user1.address);
    expect(balance.toNumber()).to.equal(2);
  });
});
