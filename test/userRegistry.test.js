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

describe("UserRegistry (unit tests)", function () {
  let userRegistry;
  let owner, user1, user2, stranger;

  beforeEach(async function () {
    [owner, user1, user2, stranger] = await ethers.getSigners();
    const UserRegistry = await ethers.getContractFactory("UserRegistry");
    userRegistry = await UserRegistry.deploy();
    await userRegistry.deployed();
  });

  it("initially marks users as not registered", async function () {
    const isReg = await userRegistry.isRegistered(user1.address);
    expect(isReg).to.equal(false);

    const userData = await userRegistry.getUser(user1.address);
    expect(userData.registered).to.equal(false);
    expect(userData.nickname).to.equal("");
    expect(userData.city).to.equal("");
    expect(userData.favoriteGenres).to.equal("");
  });

  it("allows registering a new user", async function () {
    await userRegistry
      .connect(user1)
      .register("Alice", "Kyiv", "Fantasy");

    const isReg = await userRegistry.isRegistered(user1.address);
    expect(isReg).to.equal(true);

    const userData = await userRegistry.getUser(user1.address);
    expect(userData.registered).to.equal(true);
    expect(userData.nickname).to.equal("Alice");
    expect(userData.city).to.equal("Kyiv");
    expect(userData.favoriteGenres).to.equal("Fantasy");
  });

  it("prevents double registration for the same address", async function () {
    await userRegistry
      .connect(user1)
      .register("Alice", "Kyiv", "Fantasy");

    await expectRevert(
      userRegistry
        .connect(user1)
        .register("Bob", "Lviv", "Sci-fi"),
      "Already registered"
    );
  });

  it("reverts updateProfile for unregistered user", async function () {
    await expectRevert(
      userRegistry
        .connect(stranger)
        .updateProfile("X", "Y", "Z"),
      "Not registered"
    );
  });

  it("updates profile fields for registered user", async function () {
    await userRegistry
      .connect(user1)
      .register("Alice", "Kyiv", "Fantasy");

    await userRegistry
      .connect(user1)
      .updateProfile("AliceNew", "Lviv", "Detective");

    const userData = await userRegistry.getUser(user1.address);
    expect(userData.registered).to.equal(true);
    expect(userData.nickname).to.equal("AliceNew");
    expect(userData.city).to.equal("Lviv");
    expect(userData.favoriteGenres).to.equal("Detective");
  });

  it("handles multiple independent users", async function () {
    await userRegistry
      .connect(user1)
      .register("Alice", "Kyiv", "Fantasy");
    await userRegistry
      .connect(user2)
      .register("Bob", "Lviv", "Sci-fi");

    const user1Data = await userRegistry.getUser(user1.address);
    const user2Data = await userRegistry.getUser(user2.address);

    expect(user1Data.nickname).to.equal("Alice");
    expect(user2Data.nickname).to.equal("Bob");
    expect(user1Data.city).to.equal("Kyiv");
    expect(user2Data.city).to.equal("Lviv");
  });

  it("allows registering with empty nickname/city/genres", async function () {
    await userRegistry
      .connect(user1)
      .register("", "", "");

    const userData = await userRegistry.getUser(user1.address);
    expect(userData.registered).to.equal(true);
    expect(userData.nickname).to.equal("");
    expect(userData.city).to.equal("");
    expect(userData.favoriteGenres).to.equal("");
  });
});
