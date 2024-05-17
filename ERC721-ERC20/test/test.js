const { ethers } = require("hardhat")
const { expect } = require("chai")

describe("CatNFT", function () {
  let owner;
  let addr1;
  let addr2;
  let catNFT;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const CatNFT = await ethers.getContractFactory("CatNFT");
    catNFT = await CatNFT.deploy(owner);
    await catNFT.waitForDeployment();
  });
  
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await catNFT.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Should allow the owner to mint an NFT", async function () {
      const uri = "testuri1";
      await catNFT.safeMint(addr1.address, uri);
      expect(await catNFT.ownerOf(0)).to.equal(addr1.address);
      expect(await catNFT.tokenURI(0)).to.equal(`ipfs://${uri}`);
    });

    it("Should not allow non-owners to mint an NFT", async function () {
      const uri = "testuri2";
      await expect(catNFT.connect(addr1).safeMint(addr1.address, uri)).to.be.reverted;
    });
  });

  describe("Token URI Management", function () {
    it("Should set the correct token URI", async function () {
      const uri = "testuri3";
      await catNFT.safeMint(addr1.address, uri);
      expect(await catNFT.tokenURI(0)).to.equal(`ipfs://${uri}`);
    });

    it("Should not allow duplicate URIs", async function () {
      const uri = "testuri4";
      await catNFT.safeMint(addr1.address, uri);
      await expect(catNFT.safeMint(addr2.address, uri)).to.be.revertedWith("NFT already minted!");
    });

    it("Should check if content is owned", async function () {
      const uri = "testuri5";
      await catNFT.safeMint(addr1.address, uri);
      expect(await catNFT.isContentOwned(uri)).to.be.true;
      expect(await catNFT.isContentOwned("someotheruri")).to.be.false;
    });
  });

  describe("Pay to Mint", function () {
    it("Should mint an NFT when paid enough", async function () {
      const uri = "testuri6";
      const mintPrice = ethers.parseEther("0.05");

      await catNFT.connect(addr1).payToMint(addr1.address, uri, { value: mintPrice });

      expect(await catNFT.ownerOf(0)).to.equal(addr1.address);
      expect(await catNFT.tokenURI(0)).to.equal(`ipfs://${uri}`);
    });

    it("Should not mint an NFT if not enough Ether is sent", async function () {
      const uri = "testuri7";
      const mintPrice = ethers.parseEther("0.04");

      await expect(catNFT.connect(addr1).payToMint(addr1.address, uri, { value: mintPrice })).to.be.revertedWith("Need to pay up!");
    });
  });

  
  describe("Count", function () {
    it("Should return the correct count of NFTs minted", async function () {
      expect(await catNFT.count()).to.equal(0);

      const uri1 = "testuri8";
      await catNFT.safeMint(addr1.address, uri1);
      expect(await catNFT.count()).to.equal(1);

      const uri2 = "testuri9";
      await catNFT.safeMint(addr2.address, uri2);
      expect(await catNFT.count()).to.equal(2);
    });
  });

  it("Should mint NFTs", async function () {
    await catNFT.connect(owner).safeMint(addr1, "ipfs://metadata1");
    await catNFT.connect(owner).safeMint(addr2, "ipfs://metadata2");

    const token1Owner = await catNFT.ownerOf(0);
    const token2Owner = await catNFT.ownerOf(1);

    expect(token1Owner).to.equal(addr1);
    expect(token2Owner).to.equal(addr2);
  });
});

describe("CatCoin", function () {
  let CatCoin;
  let catCoin;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    CatCoin = await ethers.getContractFactory("CatCoin");
    catCoin = await CatCoin.deploy(owner.address);
    await catCoin.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await catCoin.owner()).to.equal(owner.address);
    });

    it("Should assign the initial supply of tokens to the owner", async function () {
      const ownerBalance = await catCoin.balanceOf(owner.address);
      expect(await catCoin.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Minting", function () {
    it("Should allow the owner to mint tokens", async function () {
      await catCoin.mint(addr1.address, 1000);
      const addr1Balance = await catCoin.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(1000);
    });

    it("Should not allow non-owners to mint tokens", async function () {
      await expect(catCoin.connect(addr1).mint(addr1.address, 1000)).to.be.reverted;
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      await catCoin.transfer(addr1.address, 500);
      const addr1Balance = await catCoin.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(500);

      await catCoin.connect(addr1).transfer(addr2.address, 200);
      const addr2Balance = await catCoin.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(200);
    });

    it("Should fail if sender doesn’t have enough tokens", async function () {
      const initialOwnerBalance = await catCoin.balanceOf(owner.address);
      await expect(catCoin.connect(addr1).transfer(owner.address, 1)).to.be.reverted;
      expect(await catCoin.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });
  });
});